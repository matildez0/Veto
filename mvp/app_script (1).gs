#!/usr/bin/env python3
"""
Gera o catálogo de empresas do Veto a partir de duas fontes:

1. A base de dados do Datenanfragen.de (https://github.com/datenanfragen/data), licença CC0 1.0.
   Entram só os registos com qualidade "verified" ou "tested", relevantes para Portugal
   ("pt") ou para todos os países ("all"), e que aceitam pedidos por email ou formulário.
2. As empresas portuguesas verificadas pela equipa, em empresas_pt.json.

Uso:
    git clone --depth 50 https://github.com/datenanfragen/data datenanfragen
    python3 importar_datenanfragen.py datenanfragen empresas_pt.json catalogo.json

O resultado segue o formato da secção 7 do DATA_CONTRACTS.md.
"""
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

QUALIDADES = {'verified', 'tested'}
PAISES = {'all', 'pt'}
# Registos de outro país que servem quem vive em Portugal (por exemplo, a Amazon.es)
EXTRA = {'amazon-es'}
# Domínios de onde estas empresas enviam emails em Portugal e que o registo original não tem
EXTRA_DOMINIOS = {
    'fnac': ['fnac.pt'], 'steam': ['steampowered.com'], 'disney': ['disneyplus.com'],
    'reddit': ['redditmail.com'],
    # Também enviam de outros domínios (o X e a Nintendo fora da Alemanha)
    'twitter': ['x.com'], 'nintendo': ['nintendo.com', 'nintendo.net'],
}
# Empresas de publicidade não enviam emails às pessoas: não aparecem numa análise da caixa
SO_PUBLICIDADE = {'ads'}

# Áreas: primeiro as regras do protótipo (nome e domínios), depois as categorias do Datenanfragen
REGRAS_AREA = [
    ('saude', r'sa[uú]de|clinic|cl[ií]nica|hospital|farm[aá]c|pharm|medic|m[eé]dic|dent(al|ist|[aá]ri)|\bcuf\b|lusiadas|luz ?saude|fisio|[oó]ptica|optic|psic|terapia|an[aá]lises|laborat|unilabs|multicare|medis|wells|trofa ?sa[uú]de|sns ?24|joaquim ?chaves'),
    ('financas', r'bank|banco|\bcaixa|\bcgd\b|millennium|\bbcp\b|\bbpi\b|santander|novo ?banco|montepio|activobank|revolut|\bn26\b|\bwise\b|paypal|mbway|cetelem|cofidis|unicre|cr[eé]dito|seguro|insurance|fidelidade|ageas|tranquilidade|allianz|generali|zurich|invest|binance|coinbase|trading|klarna|scalapay|wizink|unibanco|credibom|bancoctt'),
    ('encontros', r'tinder|bumble|hinge|badoo|grindr|happn|meetic|okcupid|lovoo'),
    ('comida', r'glovo|uber ?eats|ubereats|bolt ?food|just ?eat|telepizza|domino|mcdonald|burger|\bkfc\b|pizza|restaur|too ?good|sushi|nespresso'),
    ('viagens', r'\buber\b|\bbolt\b|cabify|free ?now|ryanair|easyjet|flytap|tap ?air|vueling|booking|airbnb|expedia|hotels|trivago|edreams|skyscanner|flixbus|rede[ -]?expressos|\bcp\.pt|comboios|via ?verde|carris|metro ?(de )?lisboa|metrolisboa|metro ?do ?porto|metrodoporto|\bemel\b'),
    ('lazer', r'spotify|netflix|disney|\bhbo\b|primevideo|youtube|twitch|steam|playstation|xbox|epicgames|nintendo|ticketline|blueticket|\bbol\.pt|cinema|deezer|audible|crunchyroll|\brtp\b'),
    ('social', r'linkedin|twitter|\bx\.com|tiktok|pinterest|reddit|discord|snapchat|tumblr|threads|telegram|whatsapp|bereal|quora|medium'),
    ('servicos', r'\bmeo\b|\bnos\.pt|vodafone|nowo|digi\.pt|\bedp\b|galp|endesa|goldenergy|iberdrola|repsol|\bepal\b|[aá]guas|\bctt\b'),
    ('educacao', r'uminho|universid|\.edu\b|udemy|coursera|duolingo|\bedx\b|net-?empregos|indeed|glassdoor|itjobs|landing\.jobs|ulisboa|\bup\.pt|\buc\.pt|iscte|\bunl\.pt'),
    ('publico', r'gov\.pt|portaldasfinancas|seg-social|seguran[çc]a social|autenticacao|eportugal|\bsns\b|\bimt\b|justica'),
    ('compras', r'shop|store|loja|amazon|shein|temu|aliexpress|zara|inditex|bershka|stradivarius|mango|primark|asos|zalando|worten|fnac|continente|pingo ?doce|lidl|auchan|ikea|decathlon|sport ?zone|vinted|\bolx\b|ebay|wook|bertrand|kuantokusta|leroy|radio ?popular|el ?corte ?ingl|elcorteingles|intermarch|mercadona|prozis|media ?markt|conforama'),
]
CATEGORIAS = {
    'health': 'saude', 'finance': 'financas', 'insurance': 'financas', 'credit agency': 'financas',
    'collection agency': 'financas', 'travel': 'viagens', 'entertainment': 'lazer', 'social media': 'social',
    'telecommunication': 'servicos', 'utility': 'servicos', 'school': 'educacao', 'public body': 'publico',
    'commerce': 'compras',
}
SUFIXOS = r',?\s+(inc\.?|ltd\.?|limited|unlimited company|designated activity company|dac\.?|llc|gmbh( & co\.? kg)?|ag|se|ab|as|a/s|b\.?v\.?|n\.?v\.?|s\.?a\.?s?\.?|s\.?l\.?u?\.?|s\.?r\.?l\.?|s\.?p\.?a\.?|s\.?à r\.?l\.?|sàrl|sarl|plc|oy|kg|ug( \(haftungsbeschränkt\))?|e\.?v\.?|lda\.?|ltda\.?|unipessoal|uab|oü|pte\.?|corp(oration)?\.?|co\.)$'
DOIS_NIVEIS = {'co.uk', 'org.uk', 'com.pt', 'org.pt', 'gov.pt', 'com.es', 'com.br', 'com.au', 'co.jp', 'co.nz'}


def dominio_registavel(host):
    partes = host.lower().strip('.').removeprefix('www.').split('.')
    if len(partes) >= 3 and '.'.join(partes[-2:]) in DOIS_NIVEIS:
        return '.'.join(partes[-3:])
    return '.'.join(partes[-2:])


def host_de(url):
    m = re.match(r'https?://([^/:?#]+)', url or '')
    return m.group(1) if m else ''


def marca(nome):
    anterior = None
    nome = nome.strip()
    while anterior != nome:
        anterior = nome
        nome = re.sub(SUFIXOS, '', nome, flags=re.I).strip(' ,')
    return nome or anterior


GRAFIAS = {'playstation': 'PlayStation', 'tiktok': 'TikTok', 'paypal': 'PayPal', 'youtube': 'YouTube',
           'linkedin': 'LinkedIn', 'whatsapp': 'WhatsApp', 'aliexpress': 'AliExpress', 'easyjet': 'easyJet'}


def nome_curto(nome_legal, dominio):
    """Nome da marca, como aparece nos emails: "Netflix International B.V." passa a "Netflix"."""
    sem_sufixo = marca(nome_legal)
    rotulo = dominio.split('.')[0].lower()
    if rotulo in GRAFIAS:
        return GRAFIAS[rotulo]
    if dominio.lower() in sem_sufixo.lower():
        inicio = sem_sufixo.lower().index(dominio.lower())
        return sem_sufixo[inicio:inicio + len(dominio)]
    normal = lambda texto: re.sub(r'[^a-z0-9]', '', texto.lower())
    alvo = normal(rotulo)
    palavras = re.findall(r"[^\s()]+", sem_sufixo)
    # Palavras seguidas que, juntas, dão o domínio: "Riot Games" para riotgames.com
    for i in range(len(palavras)):
        for j in range(i + 1, len(palavras) + 1):
            if normal(''.join(palavras[i:j])) == alvo:
                return ' '.join(palavras[i:j]).strip(',;:')
    # Uma palavra do nome que começa o domínio: "Glovo" para glovoapp.com
    for palavra in palavras:
        if len(normal(palavra)) >= 4 and alvo.startswith(normal(palavra)):
            return palavra.strip(',;:')
    if len(alvo) >= 4 and rotulo.isalpha():
        return rotulo.capitalize()
    return sem_sufixo


def area(principal, secundario, categorias):
    """Primeiro o nome e os domínios, depois as marcas que a empresa explora, por fim as categorias."""
    for texto in (principal, secundario):
        for chave, regra in REGRAS_AREA:
            if re.search(regra, texto, re.I):
                return chave
    for categoria in categorias:
        if categoria in CATEGORIAS:
            return CATEGORIAS[categoria]
    return 'outros'


def datas_dos_ficheiros(repo):
    """Data do último commit de cada registo, numa só passagem pelo histórico."""
    saida = subprocess.run(['git', '-C', str(repo), 'log', '--format=@%cI', '--name-only', '--', 'companies'],
                           capture_output=True, text=True, check=True).stdout
    datas, atual = {}, None
    for linha in saida.splitlines():
        if linha.startswith('@'):
            atual = linha[1:]
        elif linha.startswith('companies/') and linha not in datas:
            datas[linha] = atual
    return datas


def converter(repo):
    repo = Path(repo)
    datas = datas_dos_ficheiros(repo)
    empresas, ignoradas = [], {'qualidade': 0, 'pais': 0, 'publicidade': 0, 'sem_canal': 0}
    for ficheiro in sorted((repo / 'companies').glob('*.json')):
        d = json.loads(ficheiro.read_text(encoding='utf-8'))
        if d.get('quality') not in QUALIDADES:
            ignoradas['qualidade'] += 1
            continue
        if not (PAISES & set(d.get('relevant-countries', [])) or d['slug'] in EXTRA):
            ignoradas['pais'] += 1
            continue
        if set(d.get('categories', [])) and set(d['categories']) <= SO_PUBLICIDADE:
            ignoradas['publicidade'] += 1
            continue
        email = (d.get('email') or '').strip()
        formulario = (d.get('webform') or '').strip()
        if not email and not formulario:
            ignoradas['sem_canal'] += 1
            continue
        canal = 'ambos' if email and formulario else 'email' if email else 'formulario'

        dominios = []
        if d.get('web'):
            dominios.append(dominio_registavel(host_de(d['web'])))
        dominios += [dominio_registavel(r) for r in d.get('runs', []) if re.fullmatch(r'[\w.-]+\.[a-z]{2,}', r.strip(), re.I)]
        dominios = list(dict.fromkeys(x for x in dominios if '.' in x))
        # Sem domínio válido (por exemplo, o site mal escrito no registo, "httsp://"): usa o do email
        if email and not dominios:
            dominios.append(dominio_registavel(email.split('@')[1]))
        if not dominios:
            ignoradas['sem_canal'] += 1
            continue

        fontes = [s for s in d.get('sources', []) if 'github.com/datenanfragen' not in s]
        nome = nome_curto(d['name'], dominios[0])
        dominios = list(dict.fromkeys(dominios + EXTRA_DOMINIOS.get(d['slug'], [])))
        registo = {
            'id': dominios[0],
            'name': nome,
            'legalName': d['name'],
            'domains': dominios,
            'sector': area(' '.join([d['name'], *dominios]), ' '.join(d.get('runs', [])), d.get('categories', [])),
            'channel': canal,
            'privacyUrl': fontes[0] if fontes else d.get('web') or f'https://{dominios[0]}',
            'verifiedAt': datas[f'companies/{ficheiro.name}'],  # última alteração do registo no Datenanfragen
            'origin': 'datenanfragen',
            'originId': d['slug'],
        }
        if email:
            registo['privacyEmail'] = email
        if formulario:
            registo['webFormUrl'] = formulario
        empresas.append(registo)
    return empresas, ignoradas


def main():
    repo, pt, saida = sys.argv[1], Path(sys.argv[2]), Path(sys.argv[3])
    importadas, ignoradas = converter(repo)
    portuguesas = json.loads(pt.read_text(encoding='utf-8'))['companies']
    # As empresas verificadas pela equipa têm prioridade sobre um registo importado com o mesmo domínio
    dominios_pt = {dominio for empresa in portuguesas for dominio in empresa['domains']}
    importadas = [e for e in importadas if not dominios_pt & set(e['domains'])]
    # Dois registos importados com o mesmo id: fica o primeiro (ordem alfabética do slug)
    vistos, unicas = set(), []
    for empresa in portuguesas + importadas:
        if empresa['id'] in vistos:
            continue
        vistos.add(empresa['id'])
        unicas.append(empresa)
    commit = subprocess.run(['git', '-C', repo, 'log', '-1', '--format=%H'], capture_output=True, text=True).stdout.strip()
    catalogo = {
        'version': 1,
        'generatedAt': datetime.now(timezone.utc).isoformat(timespec='seconds'),
        'sources': [
            {'name': 'Datenanfragen.de company database', 'url': 'https://github.com/datenanfragen/data',
             'license': 'CC0-1.0', 'commit': commit, 'records': len(unicas) - len(portuguesas)},
            {'name': 'Veto team (Portuguese companies)', 'url': 'empresas_pt.json', 'records': len(portuguesas)},
        ],
        'companies': unicas,
    }
    saida.write_text(json.dumps(catalogo, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print(f'{len(unicas)} empresas ({len(portuguesas)} portuguesas, {len(unicas) - len(portuguesas)} do Datenanfragen); ignoradas: {ignoradas}')


if __name__ == '__main__':
    main()
