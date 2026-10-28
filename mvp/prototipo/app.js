'use strict';

/* ==========================================================================
   Áreas (setores). As sensíveis aparecem em destaque.
   A área vem do catálogo ou, para empresas fora dele, de palavras no domínio
   e no nome do remetente. É uma estimativa e o ecrã diz isso.
   A ordem conta: as regras mais específicas vêm primeiro.
   ========================================================================== */
const SECTORS = {
  saude: { label: 'Saúde', short: 'Saúde', sensitive: true,
    gravidade: 'critica', porque: 'Dados de saúde, como consultas, exames ou medicação. O RGPD protege-os como categoria especial (artigo 9.º).',
    re: /sa[uú]de|clinic|cl[ií]nica|hospital|farm[aá]c|pharm|medic|m[eé]dic|dent(al|ist|[aá]ri)|\bcuf\b|lusiadas|luz ?saude|fisio|[oó]ptica|optic|psic|terapia|an[aá]lises|laborat|unilabs|multicare|medis|wells|trofa ?sa[uú]de|sns ?24|joaquim ?chaves/i },
  financas: { label: 'Finanças e seguros', short: 'Finanças', sensitive: true,
    gravidade: 'critica', porque: 'Dados bancários e de pagamento e, muitas vezes, uma cópia do teu documento de identificação.',
    re: /bank|banco|\bcaixa|\bcgd\b|millennium|\bbcp\b|\bbpi\b|santander|novo ?banco|montepio|activobank|revolut|\bn26\b|\bwise\b|paypal|mbway|cetelem|cofidis|unicre|cr[eé]dito|seguro|insurance|fidelidade|ageas|tranquilidade|allianz|generali|zurich|invest|binance|coinbase|trading|klarna|scalapay|wizink|unibanco|credibom|bancoctt/i },
  encontros: { label: 'Encontros', short: 'Encontros', sensitive: true,
    gravidade: 'critica', porque: 'Perfil, fotos e conversas que podem revelar a tua orientação sexual, que o RGPD protege como categoria especial.',
    re: /tinder|bumble|hinge|badoo|grindr|happn|meetic|okcupid|lovoo/i },
  comida: { label: 'Comida e entregas', short: 'Comida', sensitive: false,
    gravidade: 'media', porque: 'Sabem a tua morada e os teus hábitos do dia a dia.',
    re: /glovo|uber ?eats|ubereats|bolt ?food|just ?eat|telepizza|domino|mcdonald|burger|\bkfc\b|pizza|restaur|too ?good|sushi|nespresso/i },
  viagens: { label: 'Transportes e viagens', short: 'Viagens', sensitive: false,
    gravidade: 'alta', porque: 'Sabem onde estiveste e para onde vais, e por vezes guardam o teu documento de identificação.',
    re: /\buber\b|\bbolt\b|cabify|free ?now|ryanair|easyjet|flytap|tap ?air|vueling|booking|airbnb|expedia|hotels|trivago|edreams|skyscanner|flixbus|rede[ -]?expressos|\bcp\.pt|comboios|via ?verde|carris|metro ?(de )?lisboa|metrolisboa|metro ?do ?porto|metrodoporto|\bemel\b/i },
  lazer: { label: 'Streaming e lazer', short: 'Lazer', sensitive: false,
    gravidade: 'baixa', porque: 'Sobretudo gostos e hábitos de consumo.',
    re: /spotify|netflix|disney|\bhbo\b|primevideo|youtube|twitch|steam|playstation|xbox|epicgames|nintendo|ticketline|blueticket|\bbol\.pt|cinema|deezer|audible|crunchyroll|\brtp\b/i },
  social: { label: 'Redes sociais', short: 'Social', sensitive: false,
    gravidade: 'alta', porque: 'Perfil, fotos, mensagens e contactos.',
    re: /linkedin|twitter|\bx\.com|tiktok|pinterest|reddit|discord|snapchat|tumblr|threads|telegram|whatsapp|bereal|quora|medium/i },
  servicos: { label: 'Casa e telecomunicações', short: 'Casa', sensitive: false,
    gravidade: 'alta', porque: 'Contratos de casa e telecomunicações têm morada, NIF e IBAN.',
    re: /\bmeo\b|\bnos\.pt|vodafone|nowo|digi\.pt|\bedp\b|galp|endesa|goldenergy|iberdrola|repsol|\bepal\b|[aá]guas|\bctt\b/i },
  educacao: { label: 'Educação e trabalho', short: 'Educação', sensitive: false,
    gravidade: 'media', porque: 'Percurso académico ou profissional e dados de contacto.',
    re: /uminho|universid|\.edu\b|udemy|coursera|duolingo|\bedx\b|net-?empregos|indeed|glassdoor|itjobs|landing\.jobs|ulisboa|\bup\.pt|\buc\.pt|iscte|\bunl\.pt/i },
  publico: { label: 'Serviços públicos', short: 'Público', sensitive: false,
    gravidade: 'alta', porque: 'Guardam NIF, morada e dados de identificação.',
    re: /gov\.pt|portaldasfinancas|seg-social|seguran[çc]a social|autenticacao|eportugal|\bsns\b|\bimt\b|justica/i },
  compras: { label: 'Compras', short: 'Compras', sensitive: false,
    gravidade: 'media', porque: 'Morada de entrega, histórico de compras e, por vezes, o cartão.',
    re: /shop|store|loja|amazon|shein|temu|aliexpress|zara|inditex|bershka|stradivarius|mango|primark|asos|zalando|worten|fnac|continente|pingo ?doce|lidl|auchan|ikea|decathlon|sport ?zone|vinted|\bolx\b|ebay|wook|bertrand|kuantokusta|leroy|radio ?popular|el ?corte ?ingl|elcorteingles|intermarch|mercadona|prozis|media ?markt|conforama/i },
  outros: { label: 'Outros', short: 'Outros', sensitive: false,
    gravidade: 'baixa', porque: 'Não sabemos que dados têm: à partida, o teu email e pouco mais.' }
};
const SECTOR_ORDER = Object.keys(SECTORS);

/* ==========================================================================
   Ícones de linha (24 × 24, traço de 1,8), monocromáticos: herdam a cor do texto.
   As áreas usam o ícone com o mesmo nome da sua chave.
   ========================================================================== */
const ICONES = {
  saude: ['<rect x="3.5" y="3.5" width="17" height="17" rx="4"/>', '<path d="M12 8v8M8 12h8"/>'],
  financas: ['<rect x="2.5" y="5.5" width="19" height="13" rx="2.5"/>', '<path d="M2.5 10h19M6.5 14.5h4"/>'],
  encontros: ['<path d="M12 20.5s-7.5-4.6-7.5-10.3A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.6c0 5.7-7.5 10.3-7.5 10.3z"/>'],
  comida: ['<path d="M6 3v6a2 2 0 0 0 4 0V3M8 11v10"/>', '<path d="M17 21V3c-1.9 1-3 3.2-3 6v4h3"/>'],
  viagens: ['<path d="M3.5 11.2 20.5 3.5l-7.7 17-1.9-7.4z"/>'],
  lazer: ['<circle cx="12" cy="12" r="8.5"/>', '<path d="M10.2 8.8v6.4l5.3-3.2z"/>'],
  social: ['<path d="M20.5 11.5a8 8 0 0 1-11.7 7.1L3.5 20l1.4-4.9A8 8 0 1 1 20.5 11.5z"/>'],
  servicos: ['<path d="M13 2.5 4.5 13.5H11l-1 8 8.5-11H12z"/>'],
  educacao: ['<path d="M2.5 9 12 4.5 21.5 9 12 13.5z"/>', '<path d="M6.5 11v4.5c0 1.6 2.5 3 5.5 3s5.5-1.4 5.5-3V11M21.5 9v5"/>'],
  publico: ['<path d="M3 20.5h18M5 20.5v-9M9.7 20.5v-9M14.3 20.5v-9M19 20.5v-9M2.5 11.5 12 4.5l9.5 7z"/>'],
  compras: ['<path d="M5 8.5h14l-1.2 12H6.2z"/>', '<path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>'],
  outros: ['<path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z"/>', '<path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9"/>'],
  alerta: ['<path d="M12 3.5 2.5 20h19z"/>', '<path d="M12 10v4.5M12 17.2v.1"/>'],
  marcador: ['<path d="M6.5 3.5h11v17l-5.5-3.8-5.5 3.8z"/>'],
  relogio: ['<circle cx="12" cy="12" r="8.5"/>', '<path d="M12 7.5V12l3 2"/>'],
  partilha: ['<circle cx="18" cy="5.5" r="2.5"/>', '<circle cx="6" cy="12" r="2.5"/>', '<circle cx="18" cy="18.5" r="2.5"/>', '<path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1"/>'],
  alvo: ['<circle cx="12" cy="12" r="8.5"/>', '<circle cx="12" cy="12" r="4.5"/>', '<circle cx="12" cy="12" r="0.8"/>'],
  globo: ['<circle cx="12" cy="12" r="8.5"/>', '<path d="M3.5 12h17M12 3.5c2.4 2.3 3.6 5.1 3.6 8.5s-1.2 6.2-3.6 8.5c-2.4-2.3-3.6-5.1-3.6-8.5S9.6 5.8 12 3.5z"/>'],
  escudo: ['<path d="M12 3.5l7.5 2.8V12c0 4.4-3.1 7.4-7.5 8.5-4.4-1.1-7.5-4.1-7.5-8.5V6.3z"/>', '<path d="M12 8.5v4M12 15.6v.1"/>'],
  lupa: ['<circle cx="11" cy="11" r="6.5"/>', '<path d="m20 20-4.4-4.4"/>'],
  mensagem: ['<path d="M4 5.5h16v10.5H9.5L4 20z"/>', '<path d="M12 8.5v3M12 13.8v.1"/>'],
  troca: ['<path d="M4 8.5h14l-3.5-3.5M20 15.5H6l3.5 3.5"/>'],
  lixo: ['<path d="M4.5 6.5h15M9.5 6.5V4h5v2.5"/>', '<path d="M6.5 6.5l1 13.5h9l1-13.5M10 10.5v6M14 10.5v6"/>'],
  balanca: ['<path d="M12 4v16M8 20h8M5 7.5h14"/>', '<path d="M5 7.5 2.5 13a2.5 2.5 0 0 0 5 0zM19 7.5 16.5 13a2.5 2.5 0 0 0 5 0z"/>'],
  cadeado: ['<rect x="5" y="10.5" width="14" height="10" rx="2"/>', '<path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'],
  lista: ['<path d="M9 6.5h11M9 12h11M9 17.5h11"/>', '<path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01"/>'],
  grelha: ['<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/>', '<rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/>', '<rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/>', '<rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>'],
  pontos: ['<circle cx="7" cy="8" r="3.5"/>', '<circle cx="17" cy="7" r="2.5"/>', '<circle cx="15" cy="17" r="4"/>', '<circle cx="6" cy="17.5" r="1.8"/>'],
  jornal: ['<path d="M4 5h13v14a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2Z"/>', '<path d="M17 9h3v10a2 2 0 0 1-2 2"/>', '<path d="M7.5 9h6M7.5 12.5h6M7.5 16h4"/>'],
  seta: ['<path d="m9 5.5 6.5 6.5L9 18.5"/>'],
  visto: ['<path d="m4.5 12.5 4.5 4.5 10.5-10.5"/>'],
  voltar: ['<path d="m14.5 5.5-6.5 6.5 6.5 6.5"/>']
};

function icone(nome, classe = 'h-4 w-4') {
  return `<svg viewBox="0 0 24 24" class="${classe} shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${(ICONES[nome] || ICONES.outros).join('')}</svg>`;
}

// O mesmo ícone, desenhado dentro do SVG do mapa, centrado em (x, y)
function iconeNoMapa(nome, x, y, tamanho, cor) {
  const r1 = (n) => Math.round(n * 10) / 10;
  return `<g transform="translate(${r1(x - tamanho / 2)} ${r1(y - tamanho / 2)}) scale(${r1(tamanho / 24 * 100) / 100})" fill="none" stroke="${cor}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" pointer-events="none">${(ICONES[nome] || ICONES.outros).join('')}</g>`;
}

/* ==========================================================================
   Catálogo de demonstração
   - sector: área da empresa
   - kind: o que os emails indicam (conta, compra, newsletter, desconhecido)
   Só para o modo de exemplo: os contactos de privacidade aqui são de exemplo.
   Nas análises reais, os contactos vêm do catálogo (mvp/catalogo/catalogo.json),
   carregado mais abaixo; fora do catálogo, o utilizador confirma o contacto.
   ========================================================================== */
// Números de exemplo: emails recebidos na caixa toda e emails que escreveste à empresa
const DEMO_EXTRA = {
  'uber.com': [212, 4], 'shein.com': [96, 1], 'spotify.com': [148, 0], 'glovoapp.com': [175, 2], 'vinted.pt': [610, 0],
  'samsung.com': [64, 2], 'revolut.com': [388, 3], 'wells.pt': [41, 0], 'clinicaexemplo.pt': [9, 2], 'tinder.com': [57, 0],
  'booking.com': [133, 5], 'netflix.com': [120, 1], 'linkedin.com': [940, 0], 'edp.pt': [84, 6], 'lojaexemplo.pt': [7, 0]
};

const empresasDemo = [
  demo('uber.com', 'Uber', 'viagens', 'likely_account', 'dpo@uber.com', 34, 9, 'Bem-vindo à Uber'),
  demo('shein.com', 'Shein', 'compras', 'purchase', 'data@shein.com', 12, 55, 'A tua encomenda foi enviada'),
  demo('spotify.com', 'Spotify', 'lazer', 'purchase', 'privacy@spotify.com', 51, 4, 'O teu recibo do Spotify Premium'),
  demo('glovoapp.com', 'Glovo', 'comida', 'purchase', 'dpo@glovoapp.com', 27, 21, 'O teu pedido está a caminho'),
  demo('vinted.pt', 'Vinted', 'compras', 'newsletter', 'privacysupport@vinted.pt', 87, 2, 'Novidades da semana na Vinted'),
  // A Samsung recebe pedidos RGPD por formulário (privacyForm), não por email: o endereço usado é de exemplo.
  { ...demo('samsung.com', 'Samsung', 'compras', 'likely_account', '', 15, 18, 'Bem-vindo à tua Samsung Account'), privacyForm: 'https://www.samsung.com/request-desk/' },
  demo('revolut.com', 'Revolut', 'financas', 'likely_account', '', 64, 1, 'Confirma o teu email'),
  demo('wells.pt', 'Wells', 'saude', 'purchase', '', 6, 120, 'A tua encomenda Wells'),
  demo('clinicaexemplo.pt', 'Clínica Exemplo', 'saude', 'likely_account', '', 4, 300, 'Bem-vindo à área de cliente'),
  demo('tinder.com', 'Tinder', 'encontros', 'likely_account', '', 9, 700, 'Bem-vindo ao Tinder'),
  demo('booking.com', 'Booking.com', 'viagens', 'purchase', '', 18, 40, 'A tua reserva está confirmada'),
  demo('netflix.com', 'Netflix', 'lazer', 'likely_account', '', 22, 30, 'Repor a palavra-passe'),
  demo('linkedin.com', 'LinkedIn', 'social', 'likely_account', '', 140, 1, 'Novo início de sessão na tua conta'),
  demo('edp.pt', 'EDP', 'servicos', 'purchase', '', 24, 12, 'A tua fatura está disponível'),
  demo('lojaexemplo.pt', 'Loja Exemplo', 'outros', 'unknown', '', 3, 400, 'Obrigado pela tua visita')
];

function demo(domain, name, sector, kind, dpoEmail, count, days, subject) {
  const reasons = {
    likely_account: 'Email de boas-vindas, registo ou palavra-passe',
    purchase: 'Recibo, fatura ou encomenda',
    newsletter: 'Só emails de marketing',
    unknown: 'Nenhuma regra correspondeu'
  };
  return {
    id: domain, name, domain, sector, kind, dpo_email: dpoEmail || contactoDeExemplo(domain), contactExample: true, icon: name[0],
    // No exemplo, o link de cancelamento não abre nada ("exemplo")
    unsubscribe: domain === 'clinicaexemplo.pt' ? '' : 'exemplo',
    evidence: {
      count, recentCount: count, firstDate: diasAtras(Math.max(days + 30, days)), lastDate: diasAtras(days), sampleSubject: subject, sampleDate: diasAtras(days), reason: reasons[kind],
      totalRecebidos: DEMO_EXTRA[domain]?.[0] ?? count, enviados: DEMO_EXTRA[domain]?.[1] ?? 0
    }
  };
}

// Catálogo: as empresas conhecidas dão nome, área e contacto (de exemplo) às empresas encontradas na análise.
const empresasConhecidas = [
  ...empresasDemo.map(({ evidence, kind, ...empresa }) => empresa),
  { id: 'anthropic.com', name: 'Anthropic', domain: 'anthropic.com', sector: 'outros', icon: 'A', dpo_email: '' }
];
const knownCompanies = new Map(empresasConhecidas.map((company) => [company.domain, company]));

// Catálogo de empresas (mvp/catalogo/catalogo.json): contactos de privacidade publicados pelas empresas,
// do Datenanfragen.de (CC0) e verificados pela equipa. Vem do mesmo site: nenhum dado sai para terceiros.
// Primeiro procura a pasta do catálogo no repositório; se não existir, uma cópia ao lado desta página.
const CATALOGO_URLS = ['../catalogo/catalogo.json', 'catalogo.json'];
// Chave pública do grupo (ECDSA P-256). Só quem tem a chave privada consegue assinar um catálogo
// que a app aceite. É preenchida por "node mvp/catalogo/assinar.mjs chaves"; enquanto for null,
// o catálogo é usado sem verificação (e o registo da análise diz isso).
const CATALOGO_CHAVE_PUBLICA = {"kty":"EC","crv":"P-256","x":"red7YO3oegvtCnSOa-tZ4BNnQvzvq6P9F7sdCJtJG6g","y":"nFUfvdfyrWoyAd4ut-Qbpw_VD6uDptfPaUEvo8wBGyw"};
const catalogo = { carregado: false, empresas: 0, assinatura: 'sem_chave' }; // assinatura: valida | invalida | sem_chave
let catalogoPronto = Promise.resolve(false);

// Confirma que o texto do catálogo foi assinado com a chave privada do grupo.
// Os fins de linha são normalizados (\r\n → \n), como no script que assina, para o Windows não estragar a assinatura.
async function assinaturaValida(texto, url) {
  try {
    const resposta = await fetch(`${url}.sig`, { cache: 'no-cache' });
    if (!resposta.ok) return false;
    const assinatura = Uint8Array.from(atob((await resposta.text()).trim()), (c) => c.charCodeAt(0));
    const chave = await crypto.subtle.importKey('jwk', CATALOGO_CHAVE_PUBLICA, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const dados = new TextEncoder().encode(texto.replace(/\r\n/g, '\n'));
    return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, chave, assinatura, dados);
  } catch (erro) {
    return false;
  }
}

// Só links https: vindos do catálogo (nunca javascript: ou outros)
function linkSeguro(valor) {
  return /^https:\/\//i.test(valor || '') ? valor : '';
}

async function carregarCatalogo() {
  for (const url of CATALOGO_URLS) {
    try {
      const resposta = await fetch(url, { cache: 'no-cache' });
      if (!resposta.ok) continue;
      const texto = await resposta.text();
      if (CATALOGO_CHAVE_PUBLICA) {
        if (!(await assinaturaValida(texto, url))) {
          // Um catálogo alterado por quem não tem a chave do grupo nunca é usado
          catalogo.assinatura = 'invalida';
          continue;
        }
        catalogo.assinatura = 'valida';
      }
      const dados = JSON.parse(texto);
      let total = 0;
      (dados.companies || []).forEach((registo) => {
        if (!registo.id || !Array.isArray(registo.domains) || (!registo.privacyEmail && !linkSeguro(registo.webFormUrl))) return;
        const empresa = {
          id: registo.id, name: registo.name, legalName: registo.legalName || '', domain: registo.id,
          sector: SECTORS[registo.sector] ? registo.sector : 'outros', icon: (registo.name[0] || '?').toUpperCase(),
          dpo_email: registo.privacyEmail || '', privacyForm: linkSeguro(registo.webFormUrl),
          contactVerifiedAt: registo.verifiedAt || '', contactSource: linkSeguro(registo.privacyUrl), contactNotes: registo.notes || '',
          contactOrigin: registo.origin || ''
        };
        registo.domains.forEach((dominio) => knownCompanies.set(dominio.toLowerCase(), empresa));
        total += 1;
      });
      catalogo.carregado = true;
      catalogo.empresas = total;
      aplicarCatalogo();
      return true;
    } catch (erro) {
      // Tenta o próximo endereço; sem catálogo, a app pede o contacto ao utilizador
    }
  }
  return false;
}

// Quando o catálogo não carregou, nenhuma empresa tem contacto: diz porquê, em vez de parecer que não estão lá
function avisoDoCatalogo() {
  if (catalogo.carregado) return '';
  return catalogo.assinatura === 'invalida'
    ? 'Os contactos verificados do Veto não carregaram: o catálogo foi alterado e ainda não foi assinado pela equipa.'
    : 'Os contactos verificados do Veto não carregaram. Recarrega a página para tentar outra vez.';
}

// Contacto de uma empresa do catálogo (ou nada, se não estiver lá)
// Procura em todos os domínios de onde a empresa enviou emails (vinted.pt, vinted.com…)
function contactoDoCatalogo(dominio, outros = []) {
  for (const d of [dominio, ...outros]) {
    const conhecida = knownCompanies.get(d);
    if (conhecida?.contactVerifiedAt) return conhecida;
  }
  return null;
}

// Resultados guardados de análises anteriores ficam com os contactos atuais do catálogo.
// Fora do catálogo, um contacto adivinhado (privacy@...) deixa de ser usado: o utilizador confirma-o.
function aplicarCatalogo() {
  if (estado.demo) return;
  let mudou = false;
  estado.empresas.forEach((empresa) => {
    const registo = contactoDoCatalogo(empresa.domain, empresa.domains || []);
    if (registo) {
      Object.assign(empresa, {
        dpo_email: registo.dpo_email, privacyForm: registo.privacyForm, legalName: registo.legalName,
        contactVerifiedAt: registo.contactVerifiedAt, contactSource: registo.contactSource, contactNotes: registo.contactNotes,
        contactOrigin: registo.contactOrigin, contactExample: false, contactUser: false
      });
      mudou = true;
    } else if (empresa.contactExample) {
      Object.assign(empresa, { dpo_email: '', contactExample: false });
      mudou = true;
    }
  });
  if (mudou) {
    guardarEstado();
    renderTudo();
  }
}

// Alguns grupos usam um domínio diferente em cada país. Só juntamos aliases
// confirmados, para não fundir empresas diferentes apenas por terem o mesmo nome.
const COMPANY_DOMAIN_ALIASES = new Map([
  ['inpost.pt', 'inpost.pt'],
  ['inpost.es', 'inpost.pt'],
  ['inpost.com', 'inpost.pt'],
  ['vinted.pt', 'vinted.pt'],
  ['vinted.com', 'vinted.pt'],
  ['vinted.es', 'vinted.pt']
]);

/* ==========================================================================
   Notícias: incidentes e multas reais, com fonte. Resumos da equipa Veto.
   dominios: para marcar "tens dados nesta empresa" quando ela está nos resultados.
   estado: 'confirmado' ou 'por_confirmar' (quando só há a palavra do atacante).
   ========================================================================== */
const NOTICIAS_ATUALIZADAS = '2026-10-14';
const NOTICIAS = [
  {
    id: 'edp-2026', data: '2026-07-13', empresa: 'EDP', dominios: ['edp.pt', 'edp.com'], tipo: 'fraude', estado: 'confirmado',
    titulo: 'Emails falsos em nome da EDP já usam dados reais dos clientes',
    resumo: 'A EDP alertou para emails fraudulentos que incluem o nome, a morada, o NIF ou o código do ponto de entrega (CPE) dos clientes, o que os torna difíceis de distinguir dos verdadeiros.',
    importa: 'Quando os teus dados circulam, as burlas ficam convincentes. A EDP lembra que nunca pede dados bancários por email ou SMS e que envia as faturas em PDF anexo, não por link.',
    fonte: { nome: 'RFM', url: 'https://rfm.pt/atualidade/23420/nova-fraude-em-nome-da-edp-ja-usa-os-dados-dos-clientes-aprende-a-identificar-os-e-mails-falsos' }
  },
  {
    id: 'ctt-2026', data: '2026-04-27', empresa: 'CTT', dominios: ['ctt.pt'], tipo: 'fuga', estado: 'por_confirmar',
    titulo: 'Alegado ataque aos cacifos Locky dos CTT',
    resumo: 'Um atacante afirmou num fórum de cibercrime ter dados de cerca de um milhão de clientes: nome, telefone, email, histórico de encomendas e horas de entrega. À data da notícia, os CTT ainda não tinham feito qualquer comunicado.',
    importa: 'Com um histórico de encomendas real, um email falso de "taxas alfandegárias" parece verdadeiro.',
    fonte: { nome: '4gnews', url: 'https://4gnews.pt/ctt-sob-ataque-informatico-e-os-teus-dados-podem-estar-em-risco/' }
  },
  {
    id: 'netflix-2024', data: '2024-12-18', empresa: 'Netflix', dominios: ['netflix.com'], tipo: 'multa', estado: 'confirmado',
    titulo: 'Netflix multada em 4,75 milhões de euros nos Países Baixos',
    resumo: 'A autoridade neerlandesa de proteção de dados concluiu que, entre 2018 e 2020, a Netflix não explicou bem porque recolhia dados, com quem os partilhava, quanto tempo os guardava e como os protegia fora da Europa. A Netflix recorreu.',
    importa: 'É exatamente isto que um pedido de acesso te obriga a responder.',
    fonte: { nome: 'Al Arabiya', url: 'https://english.alarabiya.net/News/world/2024/12/18/dutch-authorities-fine-netflix-4-75-mln-euros-over-personal-data-use' }
  },
  {
    id: 'linkedin-2024', data: '2024-10-24', empresa: 'LinkedIn', dominios: ['linkedin.com'], tipo: 'multa', estado: 'confirmado',
    titulo: 'LinkedIn multado em 310 milhões de euros pela Irlanda',
    resumo: 'A autoridade irlandesa concluiu que o LinkedIn usou dados dos membros para analisar comportamentos e dirigir publicidade sem uma base legal válida.',
    importa: 'O direito de oposição permite-te parar o uso dos teus dados para publicidade.',
    fonte: { nome: 'Data Protection Commission', url: 'https://dataprotection.ie/en/news-media/press-releases/irish-data-protection-commission-fines-linkedin-ireland-eu310-million' }
  },
  {
    id: 'vinted-2024', data: '2024-07-03', empresa: 'Vinted', dominios: ['vinted.pt', 'vinted.com'], tipo: 'multa', estado: 'confirmado',
    titulo: 'Vinted multada em 2,4 milhões de euros por falhar pedidos de apagamento',
    resumo: 'A autoridade lituana concluiu que a Vinted recusou apagar dados a quem não apresentava um "motivo específico", tratou mal pedidos de acesso e escondia utilizadores sem os avisar (shadow banning).',
    importa: 'Não precisas de justificar um pedido de apagamento. Se a empresa recusar, podes queixar-te à CNPD.',
    fonte: { nome: 'LRT', url: 'https://www.lrt.lt/en/news-in-english/19/2310451/lithuania-s-vinted-fined-eur2-4m-for-consumer-data-breaches' }
  },
  {
    id: 'grindr-2024', data: '2024-07-01', empresa: 'Grindr', dominios: ['grindr.com'], setores: ['encontros'], tipo: 'multa', estado: 'confirmado',
    titulo: 'Tribunal confirma multa de 5,7 milhões de euros ao Grindr',
    resumo: 'Um tribunal norueguês confirmou que a app de encontros partilhou dados dos utilizadores com anunciantes sem um consentimento válido.',
    importa: 'Em apps de encontros, até o simples facto de teres conta pode revelar a tua orientação sexual.',
    fonte: { nome: 'noyb', url: 'https://noyb.eu/en/norwegian-court-confirms-eu-57-million-fine-grindr' }
  },
  {
    id: 'spotify-2023', data: '2023-06-13', empresa: 'Spotify', dominios: ['spotify.com'], tipo: 'multa', estado: 'confirmado',
    titulo: 'Spotify multado em 58 milhões de coroas suecas',
    resumo: 'A autoridade sueca concluiu que, quando os utilizadores pediam os seus dados, o Spotify entregava-os mas não explicava com clareza como os usava.',
    importa: 'Num pedido de acesso, a empresa tem de dizer também para que usa os dados, não só entregá-los.',
    fonte: { nome: 'IMY', url: 'https://imy.se/en/news/administrative-fee-against-spotify' }
  },
  {
    id: 'tap-2022', data: '2022-09-22', empresa: 'TAP', dominios: ['flytap.com', 'tap.pt'], tipo: 'fuga', estado: 'confirmado',
    titulo: 'Dados de cerca de 1,5 milhões de clientes da TAP publicados',
    resumo: 'Depois de um ataque detetado em agosto, o grupo Ragnar Locker publicou 581 GB com nome, nacionalidade, data de nascimento, morada, email, telefone e número de passageiro frequente.',
    importa: 'Dados como a data de nascimento e a morada não se mudam como uma palavra-passe.',
    fonte: { nome: 'Executive Digest', url: 'https://executivedigest.sapo.pt/?p=324074' }
  },
  {
    id: 'revolut-2022', data: '2022-09-20', empresa: 'Revolut', dominios: ['revolut.com'], tipo: 'fuga', estado: 'confirmado',
    titulo: 'Fuga na Revolut expõe dados de mais de 50 mil clientes',
    resumo: 'Um atacante usou engenharia social para entrar na base de dados. Segundo a comunicação às autoridades lituanas, foram afetados 50.150 clientes: nome, morada, email, telefone e dados parciais do cartão.',
    importa: 'Mesmo num banco digital, os dados de contacto bastam para burlas por telefone.',
    fonte: { nome: 'TechCrunch', url: 'https://techcrunch.com/2022/09/20/revolut-cyberattack-thousands-exposed' }
  },
  {
    id: 'edp-2020', data: '2020-04-15', empresa: 'EDP', dominios: ['edp.pt', 'edp.com'], tipo: 'fuga', estado: 'confirmado',
    titulo: 'EDP atacada com ransomware',
    resumo: 'O grupo Ragnar Locker cifrou sistemas da EDP, disse ter levado 10 TB de ficheiros e pediu 1580 bitcoins (cerca de 10,9 milhões de dólares) para não os divulgar.',
    importa: 'Uma empresa grande também pode ser atacada. Quanto menos dados teus guardar, menos há para perder.',
    fonte: { nome: 'Bitdefender', url: 'https://www.bitdefender.com/en-au/blog/hotforsecurity/portuguese-energy-company-hit-with-ragnar-locker-ransomware-attackers-demand-10-million-to-decrypt-the-data' }
  }
];
const TIPOS_NOTICIA = {
  fuga: { label: 'Fuga de dados', style: 'bg-slate-800 text-slate-200' },
  multa: { label: 'Multa', style: 'bg-slate-800 text-slate-200' },
  fraude: { label: 'Burla', style: 'bg-slate-800 text-slate-200' }
};

// Como as empresas tratam os dados: o essencial, com o direito que responde a cada ponto
// Guia da página Notícias: as perguntas que importam, com a resposta e o artigo do RGPD.
// Cada bloco é um parágrafo (texto) ou uma lista (array). "filtro" mostra os casos reais desse tipo.
const GUIA = [
  {
    id: 'porque', icone: 'lupa', pergunta: 'Porque importa saber quem tem os teus dados?',
    blocos: [
      'Cada empresa que guarda os teus dados é mais um sítio de onde eles podem fugir. Muitas são contas antigas de que já nem te lembras, mas que continuam a guardar o teu nome, email, morada ou dados de pagamento.',
      'Não podes pedir que apaguem o que não sabes que existe. Quanto menos empresas tiverem os teus dados, menos fugas te afetam.'
    ],
    acao: 'Começa pelas empresas de áreas sensíveis: saúde, finanças e encontros.'
  },
  {
    id: 'consequencias', icone: 'mensagem', pergunta: 'O que pode acontecer se os teus dados fugirem?',
    blocos: [
      'Os dados de uma fuga acabam muitas vezes à venda e são usados para enganar pessoas. Com o teu nome verdadeiro e o que compraste, uma mensagem falsa parece mesmo da empresa.',
      [
        'Mensagens falsas em nome da empresa: uma entrega pendente, uma fatura em atraso, um problema na conta, sempre com um link.',
        'Chamadas de falsos funcionários do banco ou da operadora, que já sabem quem és.',
        'A burla «Olá pai, olá mãe»: alguém finge ser um filho com um número novo e pede dinheiro por MB WAY.',
        'Entradas noutras contas, se usas a mesma palavra-passe em vários sítios.',
        'Roubo de identidade: com o NIF, a morada e uma cópia do cartão de cidadão, podem tentar abrir contas ou pedir crédito em teu nome.',
        'Mais spam e mais chamadas comerciais.'
      ]
    ],
    filtro: ['fraude', 'Ver burlas reais']
  },
  {
    id: 'venda', icone: 'troca', pergunta: 'Uma empresa pode vender ou passar os teus dados a outra?',
    blocos: [
      'Só se tiver uma razão legal para isso, muitas vezes o teu consentimento (artigo 6.º do RGPD). E tem de ser transparente:',
      [
        'Quando recolhe os teus dados, tem de te dizer a quem os vai passar, ou pelo menos a que tipo de empresas (artigo 13.º).',
        'A empresa que os recebe tem de te avisar, em regra no prazo de um mês, e dizer-te de onde vieram (artigo 14.º).',
        'Se deste consentimento, podes retirá-lo quando quiseres, e tem de ser tão fácil como foi dá-lo (artigo 7.º).'
      ]
    ],
    acao: 'Um pedido de acesso obriga a empresa a dizer-te a quem passou os teus dados (artigo 15.º).'
  },
  {
    id: 'apagar_cadeia', icone: 'lixo', pergunta: 'Se pedires a uma empresa para apagar, as outras também apagam?',
    blocos: [
      'Depende do papel da outra empresa.',
      [
        'Se trabalha por conta da primeira (um terceiro, como o Mailchimp, que lhe envia os emails): só pode usar os teus dados como a primeira manda. Quando a primeira apaga, tem de garantir que esse terceiro também apaga (artigo 28.º).',
        'Se recebeu ou comprou os teus dados para os usar ela própria: a primeira tem de a avisar do teu pedido (artigo 19.º), a não ser que seja impossível ou exija um esforço desproporcionado. Mas a segunda responde pelos dados que tem: para teres a certeza, pede-lhe o apagamento a ela também.'
      ]
    ],
    acao: 'Pergunta à primeira empresa a quem passou os teus dados: tem de te dizer (artigo 19.º).'
  },
  {
    id: 'recusar', icone: 'balanca', pergunta: 'A empresa pode recusar apagar os teus dados?',
    blocos: [
      'Pode, em alguns casos (artigo 17.º):',
      [
        'se ainda precisa deles, por exemplo enquanto tens um contrato ativo;',
        'se a lei a obriga a guardá-los, como as faturas, durante vários anos;',
        'se precisa deles para se defender num processo em tribunal.'
      ],
      'Mesmo assim, tem de te responder no prazo de um mês e explicar porquê (artigo 12.º). E o marketing tem de parar sempre que o pedires (artigo 21.º).'
    ]
  },
  {
    id: 'fuga', icone: 'escudo', pergunta: 'O que tem de fazer uma empresa quando há uma fuga?',
    blocos: [
      'Tem 72 horas para avisar a CNPD, a autoridade portuguesa de proteção de dados (artigo 33.º). Se a fuga te puder trazer um risco elevado, tem de te avisar a ti, sem demora (artigo 34.º).',
      'Se a fuga te causar danos, materiais ou não, tens direito a indemnização (artigo 82.º) e podes apresentar queixa na CNPD (artigo 77.º).'
    ],
    acao: 'Se receberes um aviso: muda a palavra-passe dessa conta e das outras onde a uses, e desconfia de mensagens em nome da empresa.',
    filtro: ['fuga', 'Ver fugas reais']
  },
  {
    id: 'tempo', icone: 'relogio', pergunta: 'Quanto tempo podem guardar os teus dados?',
    blocos: ['Só enquanto forem precisos para o fim com que os recolheram (artigo 5.º). Na prática, muitas empresas guardam-nos durante anos, mesmo depois de deixares de ser cliente.'],
    acao: 'Um pedido de acesso obriga-as a dizer-te durante quanto tempo os guardam (artigo 15.º).'
  },
  {
    id: 'publicidade', icone: 'alvo', pergunta: 'Usam os teus dados para publicidade?',
    blocos: ['Muitas usam o que compras, vês e clicas para traçar um perfil teu e decidir que anúncios te mostram, às vezes com a ajuda de outras empresas.'],
    acao: 'Podes opor-te ao marketing a qualquer momento, e a empresa tem de parar (artigo 21.º).'
  },
  {
    id: 'fora_europa', icone: 'globo', pergunta: 'Os teus dados podem sair da Europa?',
    blocos: ['Podem, mas só para países com uma proteção equivalente ou com garantias específicas, como contratos-tipo aprovados pela Comissão Europeia (artigos 44.º a 49.º).'],
    acao: 'Um pedido de acesso diz-te para onde vão os teus dados e com que garantias (artigo 15.º).'
  },
  {
    id: 'proteger', icone: 'cadeado', pergunta: 'Como te podes proteger?',
    blocos: [[
      'Usa uma palavra-passe diferente em cada conta (um gestor de palavras-passe ajuda) e liga a autenticação em dois passos.',
      'Desconfia de mensagens com pressa ou com links. Confirma sempre pelo site ou pelo número oficial da empresa.',
      'Dá só os dados que são mesmo precisos.',
      'Pede para apagar as contas que já não usas. O Veto prepara o pedido por ti.'
    ]]
  }
];

// Perguntas frequentes sobre o Veto (página Notícias). O guia acima fala dos direitos; isto fala da app.
// "link" acrescenta uma ligação no fim; "acao" um botão da app.
const FAQ = [
  {
    id: 'le', pergunta: 'O Veto lê os meus emails?',
    blocos: [
      'Na análise, o Veto lê o remetente, o assunto e a data dos teus últimos 1000 emails, para saber que empresas te escrevem. Nesta versão de teste, não abre o texto nem os anexos. Demora uns 4 minutos, porque o Gmail só deixa ler cerca de 300 emails por minuto.',
      'Os emails descarregados pela app são analisados no dispositivo. O Veto não recebe nem guarda os teus emails nos seus servidores.'
    ]
  },
  {
    id: 'guarda', pergunta: 'O que fica guardado, e onde?',
    blocos: [
      'Só neste browser: as empresas encontradas (nome, domínio, área e quantos emails te enviaram) e os teus pedidos. Os assuntos dos emails não ficam guardados.',
      'Para apagar tudo, usa «Apagar tudo deste dispositivo», no fim da página Pedidos.'
    ]
  },
  {
    id: 'autorizacoes', pergunta: 'Que autorizações pede o Veto ao Google?',
    blocos: [
      'Cada uma só no momento em que é precisa. O Veto cancela-a logo a seguir:',
      [
        'Ler os emails: na análise.',
        'Enviar emails em teu nome: quando envias o mesmo pedido a várias empresas.',
        'Gerir os emails: quando mandas o Veto mover para o Lixo os emails de uma empresa. O Google descreve-a como «ler, escrever e enviar», porque não há uma autorização mais pequena para mover emails.'
      ],
      'Podes ver e retirar as autorizações a qualquer momento na tua conta Google.'
    ],
    link: ['Ver as autorizações da conta Google', 'https://myaccount.google.com/permissions']
  },
  {
    id: 'envia', pergunta: 'O Veto envia emails por mim?',
    blocos: [
      'Só quando lhe pedes. Num pedido a uma empresa, o Veto abre o email já escrito na tua app de email e és tu que o envias.',
      'Num pedido a várias empresas, vês antes exatamente o que sai, de que conta e para quem. Só depois de aceitares é que o Veto o envia pelo teu Gmail. As cópias ficam na tua pasta Enviados.'
    ]
  },
  {
    id: 'contactos', pergunta: 'Como sabe o Veto para onde enviar cada pedido?',
    blocos: [
      'Do nosso catálogo: endereços publicados pelas próprias empresas, verificados pela equipa do Veto ou registados na base de dados aberta Datenanfragen.de. Em cada empresa, mostramos a fonte e a data.',
      'Se a empresa não estiver no catálogo, pedimos-te que confirmes o email na política de privacidade dela. Nunca adivinhamos endereços.'
    ]
  },
  {
    id: 'prazo', pergunta: 'A empresa é obrigada a responder? Em quanto tempo?',
    blocos: [
      'Sim. Tem um mês para te responder (artigo 12.º do RGPD). Em pedidos complexos, pode prolongar o prazo por mais dois meses, mas tem de te avisar dentro do primeiro mês.',
      'O Veto conta 30 dias desde o envio e avisa-te quando o prazo passa. Aí podes enviar uma insistência e, se continuar sem resposta, apresentar queixa à CNPD.'
    ],
    link: ['Apresentar queixa na CNPD', 'https://www.cnpd.pt']
  },
  {
    id: 'emails_dados', pergunta: 'Apagar os emails de uma empresa apaga os meus dados?',
    blocos: [
      'Não. Apagar os emails limpa a tua caixa, mas a empresa continua com os teus dados. Para que ela os apague, envia-lhe um pedido de apagamento (artigo 17.º).',
      'Os emails que o Veto move para o Lixo ficam lá 30 dias. Até lá, podes recuperá-los no Gmail.'
    ]
  },
  {
    id: 'subscricao', pergunta: 'Cancelar a subscrição não chega?',
    blocos: ['Deixas de receber publicidade, mas a empresa continua com os teus dados e pode usá-los para traçar o teu perfil. Um pedido de oposição obriga-a a parar o marketing e os perfis de publicidade (artigo 21.º).']
  },
  {
    id: 'custo', pergunta: 'Quanto custa?',
    blocos: [
      'Durante o teste, nada. As funções marcadas Veto+, como pedir a várias empresas de uma vez e apagar os emails de uma empresa, estão abertas a todos.',
      'O Veto+ ainda não existe: escolher um plano não cobra nada e só nos diz quantas pessoas o querem.'
    ]
  },
  {
    id: 'equipa', pergunta: 'O que fica a equipa do Veto a saber sobre mim?',
    blocos: [
      'Só o que aceitares nas estatísticas anónimas: contagens, como quantas empresas encontrámos por área ou que tipo de pedido enviaste, com um código aleatório deste dispositivo.',
      'Nunca o teu endereço de email, os nomes das empresas, os assuntos nem o conteúdo dos emails.'
    ],
    acao: ['saber-mais-teste', 'Ver o que é enviado']
  }
];

/* ==========================================================================
   Programa de teste (validação de mercado)
   Cada testador recebe um código de convite pessoal. Com o consentimento dele,
   a app envia eventos anónimos (contagens, nunca dados de email) para uma folha
   de cálculo, através de uma Web App do Google Apps Script.
   Cola em URL o endereço da tua Web App (termina em /exec). Enquanto estiver
   vazio, os eventos ficam guardados neste dispositivo e seguem mais tarde.
   ========================================================================== */
const TESTE = { URL: 'https://script.google.com/macros/s/AKfycbxriEsOIy6mvbaaf5HuabMNDDToHGYTPBjUrW6c1VA7uroZ61RUShmt5zCkJsWYp-s00Q/exec', MAX_FILA: 300 };

// O teu Google OAuth Client ID (termina em .apps.googleusercontent.com). Não é segredo:
// com ele preenchido, os testadores não veem o campo e só carregam em "Ligar Gmail".

const GOOGLE_CLIENT_ID = '788465290091-1499vipmp7l7fv0t9oguigev9mlptibq.apps.googleusercontent.com';
//const GOOGLE_CLIENT_ID = '937297986746-k81vu89sv318tkvmv6ev8e2ht7dt3r82.apps.googleusercontent.com';
// Enquanto a app estiver em teste no Google, só contas convidadas podem ligar o Gmail.
// Cola aqui o link de um formulário (por exemplo, Google Forms) onde as pessoas pedem acesso.
const PEDIR_ACESSO_URL = '';

// Veto Plus ainda não existe: o botão mede quantas pessoas o comprariam e a que preço.
// Quem escolhe um plano vê logo que não pagou nada. Muda aqui os preços e as funcionalidades.
const PLUS = {
  MENSAL: '2,99 €',
  ANUAL: '29,99 €',
  FUNCOES: [
    ['Limpeza profunda', 'Cancela as subscrições todas de uma vez e apaga os emails antigos dessas empresas.'],
    ['Várias contas', 'Junta os teus emails pessoais e de trabalho numa só análise.'],
    ['Análise contínua', 'A contagem de emails e a gravidade de cada empresa sempre atualizadas.'],
    ['Pedidos acompanhados', 'Segue cada pedido ao DPO, avisa quando o prazo passa e prepara a insistência.']
  ]
};
// Funções do Veto+ que, durante o teste, estão abertas a todos (pedir a várias empresas, apagar emails)
const SELO_PLUS = '<span class="shrink-0 self-center rounded-full bg-lime/10 px-1.5 py-0.5 font-sans text-[9px] font-bold leading-3 text-lime">Veto+</span>';
const VERSAO = 'prototipo-0.10';

/* ==========================================================================
   Configuração
   ========================================================================== */
const GMAIL_READ_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
// Os emails mais recentes da caixa, sem spam, lixo, enviados nem rascunhos
// (os enviados são teus, não de empresas).
const GMAIL_QUERY = '-in:spam -in:trash -in:sent -in:drafts -in:chats';
const GMAIL_MAX_EMAILS = 1000;
const GMAIL_PARALELO = 10; // pedidos ao mesmo tempo
// Limite do Gmail por conta: 6.000 unidades por minuto. Ler um email (messages.get) custa 20
// e listar (messages.list) custa 5, ou seja, cerca de 300 emails por minuto. Ficamos a 90 %:
// 1000 emails levam uns 4 minutos.
// Enviar um email custa 100, mover um para o Lixo custa 20 e mudar até 1000 de uma vez custa 50.
// https://developers.google.com/workspace/gmail/api/reference/quota
const GMAIL_QUOTA = { UNIDADES: 6000, JANELA_MS: 60000, MARGEM: 0.9, CUSTO_GET: 20, CUSTO_LIST: 5, CUSTO_SEND: 100, CUSTO_TRASH: 20, CUSTO_BATCH: 50 };
// Autorizações pedidas só no momento da ação (Veto+), e canceladas logo a seguir:
// enviar os pedidos a várias empresas e mover para o Lixo os emails de uma empresa.
// Têm de estar também no ecrã de consentimento do projeto Google Cloud (Acesso aos dados).
const GMAIL_SEND_SCOPE = 'https://www.googleapis.com/auth/gmail.send';
const GMAIL_MODIFY_SCOPE = 'https://www.googleapis.com/auth/gmail.modify';
const EMAIL_SCOPE = 'https://www.googleapis.com/auth/userinfo.email'; // para confirmar de que conta saem os pedidos
const LIMPEZA_MAX = 5000; // emails de uma empresa movidos para o Lixo de cada vez
const RESPONSE_BUFFER_DAYS = 3;
const STORAGE_KEY = 'veto.prototipo.v2';

const multiPartPublicSuffixes = new Set(['co.uk', 'com.au', 'co.nz', 'co.za', 'com.br', 'com.mx', 'com.pt']);
const ignoredDomains = new Set([
  'gmail.com', 'googlemail.com', 'google.com', 'accounts.google.com',
  'mail.google.com', 'googleusercontent.com', 'googleapis.com',
  'facebookmail.com', 'facebook.com', 'instagram.com',
  // Fornecedores de email pessoal: um remetente destes é uma pessoa, não uma empresa
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'yahoo.com', 'icloud.com',
  'me.com', 'sapo.pt', 'proton.me', 'protonmail.com', 'gmx.com', 'aol.com',
  'outlook.pt', 'hotmail.pt', 'live.com.pt', 'clix.pt', 'netcabo.pt', 'iol.pt', 'portugalmail.pt',
  'mac.com', 'yahoo.com.br', 'yahoo.es', 'gmx.net', 'gmx.pt', 'pm.me', 'tutanota.com', 'tuta.io', 'yandex.com'
]);

/* ==========================================================================
   Reconhecer a empresa a partir do remetente
   ========================================================================== */
// Marcas portuguesas que ainda não têm um contacto de privacidade verificado no catálogo:
// dão o nome certo e a área. Não dão contacto: antes de um pedido, confirmas tu o email.
const MARCAS_PT = {
  'cgd.pt': ['Caixa Geral de Depósitos', 'financas'], 'millenniumbcp.pt': ['Millennium bcp', 'financas'],
  'cofidis.pt': ['Cofidis', 'financas'], 'ageas.pt': ['Ageas Seguros', 'financas'], 'allianz.pt': ['Allianz', 'financas'],
  'vodafone.pt': ['Vodafone', 'servicos'], 'nowo.pt': ['NOWO', 'servicos'], 'iberdrola.pt': ['Iberdrola', 'servicos'], 'epal.pt': ['EPAL', 'servicos'],
  'hospitaldaluz.pt': ['Hospital da Luz', 'saude'], 'luzsaude.pt': ['Luz Saúde', 'saude'], 'trofasaude.pt': ['Trofa Saúde', 'saude'],
  'unilabs.pt': ['Unilabs', 'saude'], 'sns24.gov.pt': ['SNS 24', 'saude'],
  'seg-social.pt': ['Segurança Social', 'publico'], 'eportugal.gov.pt': ['ePortugal', 'publico'], 'autenticacao.gov.pt': ['Autenticação.gov', 'publico'],
  'olx.pt': ['OLX', 'compras'], 'bertrand.pt': ['Bertrand', 'compras'], 'wook.pt': ['Wook', 'compras'], 'sportzone.pt': ['Sport Zone', 'compras'],
  'intermarche.pt': ['Intermarché', 'compras'], 'mercadona.pt': ['Mercadona', 'compras'], 'elcorteingles.pt': ['El Corte Inglés', 'compras'],
  'prozis.com': ['Prozis', 'compras'], 'kuantokusta.pt': ['KuantoKusta', 'compras'], 'mediamarkt.pt': ['MediaMarkt', 'compras'],
  'ticketline.pt': ['Ticketline', 'lazer'], 'blueticket.pt': ['BlueTicket', 'lazer'], 'bol.pt': ['BOL', 'lazer'], 'ucicinemas.pt': ['UCI Cinemas', 'lazer'], 'rtp.pt': ['RTP', 'lazer'],
  'carris.pt': ['Carris', 'viagens'], 'metrolisboa.pt': ['Metro de Lisboa', 'viagens'], 'metrodoporto.pt': ['Metro do Porto', 'viagens'],
  'rede-expressos.pt': ['Rede Expressos', 'viagens'], 'emel.pt': ['EMEL', 'viagens'], 'telepizza.pt': ['Telepizza', 'comida'],
  'uminho.pt': ['Universidade do Minho', 'educacao'], 'up.pt': ['Universidade do Porto', 'educacao'], 'ulisboa.pt': ['Universidade de Lisboa', 'educacao'],
  'uc.pt': ['Universidade de Coimbra', 'educacao'], 'net-empregos.com': ['Net-Empregos', 'educacao']
};

// Do domínio mais específico ao mais geral: news.cgd.pt, depois cgd.pt
function marcaConhecida(dominio) {
  const partes = String(dominio || '').split('.');
  for (let i = 0; i < partes.length - 1; i += 1) {
    const marca = MARCAS_PT[partes.slice(i).join('.')];
    if (marca) return { name: marca[0], sector: marca[1] };
  }
  return null;
}

// Plataformas que enviam emails por conta de outras empresas. Quando o remetente é uma delas,
// o domínio não diz de que empresa se trata: é o nome do remetente que o diz.
const PLATAFORMAS_ENVIO = new Set(['sendgrid.net', 'mcsv.net', 'mcdlv.net', 'rsgsv.net', 'mandrillapp.com', 'amazonses.com', 'mailgun.org', 'mailgun.net',
  'sparkpostmail.com', 'hubspotemail.net', 'mktomail.com', 'sendinblue.com', 'e-goi.com', 'egoiapp.com', 'ccsend.com', 'createsend.com', 'mlsend.com',
  'exacttarget.com', 'klaviyomail.com', 'zendesk.com', 'freshdesk.com', 'intercom-mail.com', 'substack.com', 'shopifyemail.com']);
function plataformaDeEnvio(dominio) {
  return [...PLATAFORMAS_ENVIO].find((plataforma) => dominio === plataforma || dominio.endsWith(`.${plataforma}`)) || '';
}

// Endereços de envio automático (noreply@, faturacao@, encomendas@…): é uma empresa, não uma pessoa
const LOCAL_AUTOMATICO = /^(no-?reply|noreply|do-?not-?reply|donotreply|n[aã]o-?responder|naoresponder|nao_responder|news(letter)?s?|info|informa[cç](oes|ao)|geral|apoio(-?cliente)?|clientes?|servico-?clientes?|atendimento|suporte|support|help|ajuda|hello|ola|contact[oa]?s?|marketing|promo(coes)?|novidades|fatura[cç]ao|faturas?|factura[cç]ao|billing|invoices?|encomendas?|orders?|pedidos|reservas?|bookings?|notifica[cç](oes|ao)|notifications?|alerts?|alertas?|accounts?|conta|seguranca|security|verify|verificacao|team|equipa|mailer|bounces?|updates?|digest|comunica[cç](ao|oes)|store|loja|shop|recibos?|receipts?|pagamentos?|payments?|envios?|shipping|entregas?)([-._+][a-z0-9]+)*$/i;
// Palavras que, no nome do remetente, indicam uma empresa
const NOME_DE_EMPRESA = /\b(lda|s\.a\.|sa|group|grupo|loja|store|shop|cl[ií]nica|farm[aá]cia|hotel|seguros|banco|servi[cç]os|online|app|apoio ao cliente|portugal)\b/i;
// Respostas e reencaminhamentos (Re:, RES:, ENC:, Fwd:): conversa entre pessoas
const ASSUNTO_DE_CONVERSA = /^\s*(re|res|enc|fwd?|fw|tr|aw|wg|rv)\s*(\[\d+\])?\s*:/i;
// Nomes que não identificam ninguém
const NOME_GENERICO = /^(news(letter)?s?|no-?reply|noreply|do-?not-?reply|n[aã]o[- ]?responder|info|informa[cç](ões|oes|ão|ao)|team|equipa|suporte|support|apoio( ao cliente)?|marketing|notifica\w*|alertas?|geral|clientes?|servi[cç]o de clientes|atendimento|fatura[cç][aã]o|faturas?|encomendas?|reservas?|promo[cç](ões|oes)|novidades|customer (service|care|support)|hello|ol[áa]|admin|mailer|updates?|notifications?)$/i;

// Limpa o nome do remetente para ficar só a empresa:
// "Equipa da Glovo" → Glovo, "Revolut Team" → Revolut, "Newsletter | Farmácia Avenida" → Farmácia Avenida,
// "Maria via LinkedIn" → LinkedIn, "Ana, da Revolut" → Revolut, "Glovo Portugal" → Glovo (mas "Correios de Portugal" fica).
// Com várias partes ("Black Friday - Worten"), fica a que corresponde ao domínio.
function limparNomeRemetente(valor, dominio = '') {
  let nome = String(valor || '').replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}️‍]/gu, '').replace(/\s+/g, ' ').trim();
  if (!nome || nome.includes('@') || /^[\w-]+(\.[\w-]+)+$/.test(nome)) return '';
  const via = nome.match(/\s(?:via|através de|atraves de)\s+(.+)$/i);
  if (via) nome = via[1].trim();
  // Só com vírgula ou "from": "Maria da Silva" é o nome de uma pessoa
  const pessoaDa = nome.match(/^[A-ZÀ-Ý][a-zà-ÿ]+(?:,\s+(?:da|do|de)|\s+(?:from|at))\s+(.+)$/);
  if (pessoaDa) nome = pessoaDa[1].trim();
  const partes = nome.split(/\s+[|·•–—-]\s+|:\s+/).map((parte) => parte.trim()).filter(Boolean);
  if (partes.length > 1) {
    const rotulo = normalizarNome(String(dominio).split('.')[0]);
    const doDominio = rotulo.length >= 3 && partes.find((parte) => {
      const n = normalizarNome(parte);
      return n.length >= 3 && (rotulo.includes(n) || n.includes(rotulo));
    });
    nome = doDominio || partes.find((parte) => !NOME_GENERICO.test(parte)) || partes[0];
  }
  nome = nome.replace(/^(a\s+)?(equipa|team|apoio ao cliente|apoio|servi[cç]o de (apoio ao )?clientes?|notifica[cç][õo]es|novidades|newsletter|news from|informa[cç][õo]es)\s+(d[aoe]s?\s+)?/i, '');
  nome = nome.replace(/\s+(team|equipa|newsletter|news|notifica[cç][õo]es|notifications|alertas?|support|suporte|apoio( ao cliente)?|customer (service|care|support)|no-?reply)$/i, '');
  if (/\s(pt|portugal)$/i.test(nome) && !/\s(de|do|da|dos|das)\s+(pt|portugal)$/i.test(nome)) nome = nome.replace(/\s(pt|portugal)$/i, '');
  nome = nome.replace(/^[\s"'«»]+|[\s"'«».,:;-]+$/g, '');
  return nome && !NOME_GENERICO.test(nome) && nome.length <= 40 ? nome : '';
}

// Para comparar nomes: sem acentos, maiúsculas nem espaços
function normalizarNome(texto) {
  return String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Uma empresa do catálogo com este nome (para remetentes que usam uma plataforma de envio)
function empresaPeloNome(nome) {
  const alvo = normalizarNome(nome);
  if (alvo.length < 3) return null;
  for (const empresa of new Set(knownCompanies.values())) {
    if (normalizarNome(empresa.name) === alvo) return empresa;
  }
  return null;
}

const KINDS = {
  likely_account: { label: 'Conta', filtro: 'Tens conta', style: 'text-slate-300 bg-slate-800', bar: 'bg-ink', help: 'Recebeste um email de boas-vindas, de registo ou de palavra-passe. Provavelmente tens conta.' },
  purchase: { label: 'Compra', filtro: 'Compraste', style: 'text-slate-300 bg-slate-800', bar: 'bg-ink/60', help: 'Recebeste recibos, faturas ou confirmações de encomenda. A empresa guarda dados da compra, como o nome e a morada.' },
  newsletter: { label: 'Newsletter', filtro: 'Recebes publicidade', style: 'text-slate-300 bg-slate-800', bar: 'bg-ink/30', help: 'Só recebes marketing. A empresa tem o teu email, mas pode não haver conta.' },
  unknown: { label: 'Por confirmar', filtro: 'Sem tipo claro', style: 'text-slate-300 bg-slate-800', bar: 'bg-ink/15', help: 'Há emails desta empresa, mas nenhuma regra os explica. Revê tu.' }
};

// O que cada tipo de relação costuma deixar nas mãos da empresa ("Porquê esta empresa?")
const O_QUE_GUARDAM = {
  likely_account: 'Os dados da conta (nome, email e, muitas vezes, telefone) e o que fazes no serviço.',
  purchase: 'Nome, morada, contactos e o histórico das tuas compras.',
  newsletter: 'O teu email e, muitas vezes, quando abres as mensagens e em que links carregas.',
  unknown: 'Pelo menos o teu endereço de email.'
};
const KIND_ORDER = ['likely_account', 'purchase', 'newsletter', 'unknown'];

// Tempo perdido com uma empresa: 9 s por email recebido (tempo médio a olhar para um email,
// segundo a Litmus, 2022) e 2 min por email que lhe escreveste (estimativa nossa).
const TEMPO = { LER_S: 9, ESCREVER_S: 120 };
function tempoPerdidoS(empresa) {
  const ev = empresa.evidence || {};
  return (ev.totalRecebidos ?? ev.count ?? 0) * TEMPO.LER_S + (ev.enviados || 0) * TEMPO.ESCREVER_S;
}
// Versão curta para caber num mosaico pequeno: "40 min", "1h32"
function duracaoCurta(segundos) {
  const minutos = Math.round(segundos / 60);
  if (minutos < 1) return '&lt;1 min';
  if (minutos < 60) return `${minutos} min`;
  return `${Math.floor(minutos / 60)}h${String(minutos % 60).padStart(2, '0')}`;
}
function formatarDuracao(segundos) {
  if (segundos < 60) return 'menos de 1 min';
  const minutos = Math.round(segundos / 60);
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const resto = minutos % 60;
  return resto ? `${horas} h ${resto} min` : `${horas} h`;
}

const SUBJECT_RULES = [
  // Conta: boas-vindas, registo, códigos, palavra-passe, inícios de sessão e avisos sobre a conta
  { kind: 'likely_account', reason: 'Email de boas-vindas, registo ou palavra-passe',
    re: /bem-vind|boas-vindas|welcome|confirm\w*\s.*(conta|registo|e-?mail|endere[cç]o)|verifi|valida\w*\s.*(conta|e-?mail)|ativ\w*\s.*conta|activate|palavra-passe|password|\bsenha\b|\bpin\b|reset|recupera\w*\s.*(conta|acesso)|registo|sign ?up|inscri|criaste|nova conta|new account|account created|conta criada|a tua conta|your account|in[ií]cio de sess[aã]o|iniciar sess[aã]o|novo dispositivo|new (sign-?in|login|device)|c[oó]digo de (verifica|confirma|acesso|seguran|ativa)|verification code|security code|one-time|autentica[cç][aã]o|two-factor|\b2fa\b|altera[cç][aã]o (de|dos) dados|dados da (tua )?conta|extrato|ap[oó]lice|movimentos? (no|na|do|da) (teu|tua) (cart[aã]o|conta)|termos e condi[cç][õo]es|pol[ií]tica de privacidade|privacy policy|terms of (service|use)/i },
  // Compra: encomendas, faturas, pagamentos, envios, reservas, bilhetes, devoluções e subscrições pagas
  { kind: 'purchase', reason: 'Recibo, fatura ou encomenda',
    re: /encomenda|pedido (n\.?\s?[ºo°]|#|\d)|\border\b|fatura|factura|invoice|recibo|receipt|nota de cr[eé]dito|compra|purchase|pagamento|payment|refer[eê]ncia (multibanco|mb|de pagamento)|\bmb ?way\b|d[eé]bito direto|expedi|enviad[oa]|a caminho|em tr[aâ]nsito|shipped|entreg|delivery|levantamento|pronto para levantar|cacifo|reserva|booking|bilhete|e-?ticket|cart[aã]o de embarque|boarding pass|check-?in|itiner[aá]rio|devolu[cç][aã]o|reembolso|refund|garantia|subscri[cç][aã]o|renova[cç][aã]o|renovad[oa]|renewal|o teu plano|your (plan|subscription)/i },
  // Publicidade, mesmo sem o cabeçalho List-Unsubscribe
  { kind: 'newsletter', reason: 'Promoções ou novidades',
    re: /newsletter|promo[cç]|desconto|\d+ ?% ?(de )?desc|\bsaldos\b|black ?friday|cyber ?monday|novidades|\boferta|cup[aã]o|c[oó]digo promocional|s[oó] hoje|[uú]ltimos dias|campanha|\bsale\b|\bdeals?\b|exclusiv/i }
];

const RIGHTS = {
  access: {
    label: 'Pedir os meus dados', short: 'Acesso', article: 'artigo 15.º',
    subject: 'Pedido de acesso aos dados pessoais (artigo 15.º do RGPD)',
    body: (nome) => `Exmos. Senhores da ${nome},

Ao abrigo do artigo 15.º do RGPD, solicito:
1. A confirmação de que tratam dados pessoais que me dizem respeito;
2. Uma cópia desses dados;
3. Informação sobre as finalidades do tratamento, os destinatários, o prazo de conservação e a origem dos dados.

Os dados estão associados ao endereço de email a partir do qual envio este pedido.

Aguardo resposta no prazo de um mês, nos termos do artigo 12.º, n.º 3, do RGPD.

Com os melhores cumprimentos.`
  },
  erasure: {
    label: 'Apagar os meus dados', short: 'Apagamento', article: 'artigo 17.º',
    subject: 'Pedido de apagamento de dados pessoais (artigo 17.º do RGPD)',
    body: (nome) => `Exmos. Senhores da ${nome},

Ao abrigo do artigo 17.º do RGPD, solicito o apagamento de todos os dados pessoais que me dizem respeito, associados ao endereço de email a partir do qual envio este pedido. Caso tenha dado consentimento para algum tratamento, retiro-o (artigo 7.º, n.º 3).

Peço confirmação por escrito do apagamento, no prazo de um mês (artigo 12.º, n.º 3, do RGPD).

Com os melhores cumprimentos.`
  },
  objection: {
    label: 'Parar o marketing', short: 'Oposição', article: 'artigo 21.º',
    subject: 'Oposição ao marketing direto e à definição de perfis (artigo 21.º do RGPD)',
    body: (nome) => `Exmos. Senhores da ${nome},

Ao abrigo do artigo 21.º, n.ºs 2 e 3, do RGPD, oponho-me ao tratamento dos meus dados pessoais para marketing direto, incluindo a definição de perfis relacionada com esse marketing. Retiro também qualquer consentimento que tenha dado para personalização ou publicidade (artigo 7.º, n.º 3).

Solicito ainda:
1. O apagamento dos dados tratados apenas para esse fim (artigo 17.º, n.º 1, alínea c));
2. Informação sobre se tomam decisões automatizadas a meu respeito e sobre a lógica envolvida (artigo 15.º, n.º 1, alínea h)).

Peço confirmação por escrito no prazo de um mês (artigo 12.º, n.º 3, do RGPD).

Com os melhores cumprimentos.`
  },
  portability: {
    label: 'Receber os dados num ficheiro', short: 'Portabilidade', article: 'artigo 20.º',
    subject: 'Pedido de portabilidade dos dados pessoais (artigo 20.º do RGPD)',
    body: (nome) => `Exmos. Senhores da ${nome},

Ao abrigo do artigo 20.º do RGPD, solicito que me enviem os dados pessoais que me dizem respeito e que vos forneci, incluindo os dados resultantes da utilização do vosso serviço, num formato estruturado, de uso corrente e de leitura automática (por exemplo, CSV ou JSON).

Os dados estão associados ao endereço de email a partir do qual envio este pedido.

Aguardo resposta no prazo de um mês, nos termos do artigo 12.º, n.º 3, do RGPD.

Com os melhores cumprimentos.`
  }
};

// Os quatro direitos, pela ordem em que aparecem no mapa, com uma frase simples cada
const DIREITOS_NO_MAPA = [
  { right: 'access', titulo: 'Acesso', frase: 'Saber que dados têm e receber uma cópia' },
  { right: 'portability', titulo: 'Portabilidade', frase: 'Receber os dados num ficheiro para levar para outro serviço' },
  { right: 'erasure', titulo: 'Apagamento', frase: 'Pedir que apaguem os teus dados' },
  { right: 'objection', titulo: 'Oposição', frase: 'Parar o marketing e os perfis de publicidade' }
];

// Resultados que o utilizador pode registar quando a empresa responde.
// holdsData: true = a empresa tem os dados; false = não tem (ou apagou); null = ainda não se sabe.
const OUTCOMES = {
  data_received: { label: 'Enviou-me os dados', holdsData: true, closeReason: 'data_received', badge: 'Enviou-te os dados' },
  data_erased: { label: 'Apagou os meus dados', holdsData: false, closeReason: 'data_erased', badge: 'Apagou os teus dados' },
  objection_accepted: { label: 'Aceitou: deixa de usar para marketing', holdsData: true, closeReason: 'objection_accepted', badge: 'Sem marketing' },
  no_data: { label: 'Diz que não tem dados meus', holdsData: false, closeReason: 'other', badge: 'Diz que não tem dados' },
  company_refused: { label: 'Recusou o pedido', holdsData: true, closeReason: 'company_refused', badge: 'Recusou' },
  partial: { label: 'Respondeu, mas ainda sem resultado', holdsData: null, closeReason: null, badge: 'Respondeu' },
  no_reply: { label: 'Sem resposta no prazo', holdsData: null, closeReason: 'no_reply', badge: 'Sem resposta' }
};
const OUTCOMES_BY_RIGHT = {
  access: ['data_received', 'no_data', 'company_refused', 'partial'],
  erasure: ['data_erased', 'no_data', 'company_refused', 'partial'],
  objection: ['objection_accepted', 'no_data', 'company_refused', 'partial'],
  portability: ['data_received', 'no_data', 'company_refused', 'partial']
};

/* ==========================================================================
   Sensibilidade (no código, "gravidade"): quão sensíveis são os dados que a empresa guarda,
   ou seja, quão grave seria se se perdessem. Escala fixa de quatro níveis.
   Uma só escala de cor, que só serve para isto: de vermelho escuro (baixa) a vermelho forte (muito alta),
   para o risco se ver logo. Nada a piscar, e sempre com as barras (como o sinal do telemóvel) e a palavra,
   para não depender só da cor. O texto usa tons mais claros do mesmo vermelho, para se ler no fundo escuro.
   No mapa, mais sensível = ponto maior e de um vermelho mais forte.
   O verde fica para a ação principal e para o que já fizeste; o amarelo para os pedidos a decorrer, o verde escuro para os concluídos e o vermelho de risco para o que correu mal.
   ========================================================================== */
const SEVERITY = {
  critica: { label: 'Muito alta', nivel: 4, hex: '#810A0A', r: 7.5, texto: 'text-white', fundo: 'bg-risco', borda: 'border-risco' },
  alta: { label: 'Alta', nivel: 3, hex: '#810A0A', r: 6.5, texto: 'text-white', fundo: 'bg-risco', borda: 'border-risco' },
  media: { label: 'Média', nivel: 2, hex: '#a39ca7', r: 5.5, texto: 'text-slate-200', fundo: 'bg-slate-500', borda: 'border-slate-700' },
  baixa: { label: 'Baixa', nivel: 1, hex: '#807785', r: 4.5, texto: 'text-slate-300', fundo: 'bg-slate-600', borda: 'border-slate-700/70' }
};
const SEVERITY_ORDER = ['critica', 'alta', 'media', 'baixa'];

// A gravidade parte da área. Se só recebes marketing, a empresa provavelmente
// só tem o teu email, por isso desce um nível.
function gravidadeDe(empresa) {
  const setor = SECTORS[empresa.sector] || SECTORS.outros;
  let indice = SEVERITY_ORDER.indexOf(setor.gravidade);
  let motivo = setor.porque;
  if (empresa.kind === 'newsletter' && indice < SEVERITY_ORDER.length - 1) {
    indice += 1;
    motivo += ' Como só recebes marketing, provavelmente só têm o teu email.';
  }
  return { chave: SEVERITY_ORDER[indice], motivo };
}

// Ícone de barras (1 a 4), para a gravidade não depender só da cor
function iconeGravidade(chave, altura = 12) {
  const g = SEVERITY[chave];
  const barras = [0, 1, 2, 3].map((i) => `<rect x="${i * 3.5}" y="${9 - (i + 1) * 2.25}" width="2.5" height="${(i + 1) * 2.25}" rx="0.6" fill="${i < g.nivel ? g.hex : '#463c4c'}"/>`).join('');
  return `<svg viewBox="0 0 13.5 9" width="${Math.round(altura * 1.5)}" height="${altura}" aria-hidden="true" class="inline-block shrink-0">${barras}</svg>`;
}

// Barra com a distribuição das empresas pela sensibilidade, da mais à menos sensível
function barraDeSensibilidade(niveis, altura = 'h-2.5') {
  const comEmpresas = niveis.filter((nivel) => nivel.n);
  const descricao = comEmpresas.map((nivel) => `${nivel.n} de sensibilidade ${SEVERITY[nivel.chave].label.toLowerCase()}`).join(', ');
  return `<div class="flex ${altura} w-full gap-0.5 overflow-hidden rounded-full bg-slate-800" role="img" aria-label="${esc(descricao)}">
    ${comEmpresas.map((nivel) => `<span class="basis-0 ${SEVERITY[nivel.chave].fundo}" style="flex-grow:${nivel.n}"></span>`).join('')}
  </div>`;
}

// A legenda da barra: um ponto da cor de cada nível e quantas empresas tem
function legendaDeSensibilidade(niveis) {
  return niveis.filter((nivel) => nivel.n).map((nivel) => `<span class="inline-flex items-center gap-1.5 whitespace-nowrap"><span class="h-2 w-2 rounded-full ${SEVERITY[nivel.chave].fundo}"></span><span class="font-semibold text-slate-100">${nivel.n}</span> ${SEVERITY[nivel.chave].label.toLowerCase()}</span>`).join('');
}

function seloGravidade(chave, prefixo = 'Sensibilidade') {
  return `<span class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">${iconeGravidade(chave)}${prefixo ? `${prefixo} ` : ''}${prefixo ? SEVERITY[chave].label.toLowerCase() : SEVERITY[chave].label}</span>`;
}

// Estados de cada empresa no mapa de exposição. "sempedido" = encontrada na análise, ainda sem pedido.
const BUCKETS = {
  confirmado: { label: 'Têm os teus dados', dot: 'bg-concluido', hex: '#32480C' },
  atraso: { label: 'Em atraso', dot: 'bg-risco', hex: '#810A0A' },
  espera: { label: 'À espera', dot: 'bg-pendente', hex: '#945D0A' },
  resolvido: { label: 'Já não têm', dot: 'bg-concluido', hex: '#32480C' },
  sempedido: { label: 'Ainda sem pedido', dot: 'bg-slate-600', hex: '#655b6c' }
};
const MAP_ORDER = ['confirmado', 'atraso', 'espera', 'resolvido', 'sempedido'];

// Medidas do mapa (em unidades do SVG, que no telemóvel são cerca de 1 px)

const STATUS_LABELS = {
  draft: 'Rascunho, ainda não enviado',
  awaiting_confirmation: 'À espera de confirmação: enviaste?',
  sent: 'Enviado (indicado por ti)',
  reply_received: 'Resposta recebida (indicada por ti)',
  closed: 'Fechado'
};

/* ==========================================================================
   Estado (guardado só neste dispositivo)
   ========================================================================== */
let estado = { empresas: [], pedidos: [], analisadoEm: null, demo: false };
let filtroSetor = 'todos';
let filtroTipo = 'todas';
let selecaoMapa = null; // a empresa (ou terceiro, ou área) aberta no painel dos resultados: { tipo: 'empresa' | 'terceiro' | 'setor', chave }
// Resultados: as mesmas empresas vistas de quatro formas
let modoResultados = 'lista';
// Lista por sensibilidade: grupos abertos e grupos com todas as empresas à vista
const LIMITE_GRUPO = 6;
const gruposAbertos = new Set(['critica', 'alta']);
const gruposCompletos = new Set();
// Notícias com o resumo aberto na página da empresa
const noticiasAbertas = new Set();
let ordemLista = 'gravidade'; // ou 'emails'
const MODOS_RESULTADOS = [
  { modo: 'lista', label: 'Lista', icone: 'lista' },
  { modo: 'areas', label: 'Por área', icone: 'grelha' },
  { modo: 'mapa', label: 'Mapa', icone: 'pontos' }
];

// Cores e medidas do mapa de exposição (a rede)
const REDE = {
  EMPRESA: '#c2ea5d',   // verde do logo
  TERCEIRO: '#b9a2f5',  // lilás, a condizer com o fundo
  PORMENOR: '#c2ea5d',  // verde do logo (pormenores do mapa)
  NUCLEO: '#807785',    // centro de cada área
  PASSO: 14,            // distância entre empresas vizinhas (unidades do desenho)
  FOLGA: 22,            // espaço entre áreas, onde cabe o nome da área
  LETRA: 12,            // tamanho dos nomes em píxeis, igual com qualquer zoom
  SATELITE: 44          // distância, em píxeis, da empresa escolhida aos seus terceiros
};
// Zoom do mapa (k = escala; x, y = deslocação, em unidades do desenho). Mantém-se ao escolher pontos.
let zoomMapa = { k: 1, x: 0, y: 0, assinatura: '' };
let redeDesenhada = null; // posições e nomes do último desenho, para o zoom
let pedidoDeZoom = 0;
let animacaoDeZoom = 0;
const RAIO_EMPRESA = { critica: 6.2, alta: 5.7, media: 5.2, baixa: 4.8 };
// No mapa, a sensibilidade alta e muito alta ficam com o vermelho de risco; a média e a baixa em cinzentos
const COR_NO_MAPA = { critica: '#810A0A', alta: '#810A0A', media: '#b3abb7', baixa: '#7d7482' };
// A inicial dentro do ícone, legível sobre cada cor
const LETRA_NO_MAPA = { critica: '#ffffff', alta: '#ffffff', media: '#1d1620', baixa: '#ffffff' };
// A cor do ícone de cada empresa (no mapa, na lista e nos pedidos): vermelho se algo correu mal,
// amarelo se há um pedido a decorrer, verde se o pedido está concluído. Sem nada disto, fica neutro.
const ESTADOS_EMPRESA = {
  concluido: { label: 'Pedido concluído', hex: '#32480C', fundo: 'bg-concluido' },
  pendente: { label: 'Pedido a decorrer', hex: '#945D0A', fundo: 'bg-pendente' },
  atencao: { label: 'Algo correu mal', hex: '#810A0A', fundo: 'bg-risco' }
};

// Serviços de envio de email conhecidos (domínio do link de cancelamento → nome)
const TERCEIROS = {
  'mailchimp.com': 'Mailchimp', 'list-manage.com': 'Mailchimp', 'mcsv.net': 'Mailchimp', 'mcdlv.net': 'Mailchimp',
  'sendgrid.net': 'SendGrid', 'sendgrid.com': 'SendGrid',
  'exacttarget.com': 'Salesforce', 'salesforce.com': 'Salesforce',
  'klaviyo.com': 'Klaviyo', 'klaviyomail.com': 'Klaviyo',
  'braze.com': 'Braze', 'braze.eu': 'Braze',
  'hubspot.com': 'HubSpot', 'hubspotemail.net': 'HubSpot',
  'mailjet.com': 'Mailjet', 'brevo.com': 'Brevo', 'sendinblue.com': 'Brevo',
  'e-goi.com': 'E-goi', 'mktomail.com': 'Marketo', 'marketo.com': 'Marketo',
  'amazonses.com': 'Amazon SES', 'mailgun.org': 'Mailgun', 'mailgun.net': 'Mailgun',
  'emarsys.net': 'Emarsys', 'emarsys.com': 'Emarsys', 'selligent.com': 'Selligent',
  'createsend.com': 'Campaign Monitor', 'rs6.net': 'Constant Contact', 'constantcontact.com': 'Constant Contact',
  'customer.io': 'Customer.io', 'iterable.com': 'Iterable', 'mailerlite.com': 'MailerLite',
  'activecampaign.com': 'ActiveCampaign', 'getresponse.com': 'GetResponse', 'substack.com': 'Substack',
  'shopify.com': 'Shopify', 'intercom.io': 'Intercom', 'zendesk.com': 'Zendesk',
  'rsgsv.net': 'Mailchimp', 'mandrillapp.com': 'Mailchimp', 'sparkpostmail.com': 'SparkPost', 'egoiapp.com': 'E-goi',
  'ccsend.com': 'Constant Contact', 'mlsend.com': 'MailerLite', 'intercom-mail.com': 'Intercom', 'freshdesk.com': 'Freshdesk',
  'shopifyemail.com': 'Shopify'
};
let filtroNoticias = 'todas';
let animarMapa = true;
let folhaAberta = false;
let opcoesFolha = [];
let lote = null; // pedir a várias empresas: { passo: 'escolher' | 'rever' | 'enviar' | 'fim', right, selecionadas, envios, erro, onde }

function carregarEstado() {
  try {
    const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (guardado && Array.isArray(guardado.empresas) && Array.isArray(guardado.pedidos)) {
      estado = { ...estado, ...guardado };
      if (estado.demo) {
        estado.empresas.forEach((empresa) => {
          if (!empresa.dpo_email) {
            empresa.dpo_email = contactoDeExemplo(empresa.domain);
            empresa.contactExample = true;
          }
        });
      }
    }
  } catch (erro) {
    // Sem acesso ao armazenamento: a app funciona só em memória.
  }
}

function guardarEstado() {
  try {
    // O assunto dos emails nunca é guardado: só fica em memória durante a sessão.
    const empresas = estado.empresas.map((empresa) => ({
      ...empresa,
      evidence: empresa.evidence ? {
        count: empresa.evidence.count, recentCount: empresa.evidence.recentCount, kinds: empresa.evidence.kinds,
        firstDate: empresa.evidence.firstDate, lastDate: empresa.evidence.lastDate, sampleDate: empresa.evidence.sampleDate, reason: empresa.evidence.reason,
        totalRecebidos: empresa.evidence.totalRecebidos, enviados: empresa.evidence.enviados
      } : null
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...estado, empresas }));
  } catch (erro) {
    // Ignorar: sem armazenamento, os dados ficam só nesta sessão.
  }
}

/* ==========================================================================
   Arranque
   ========================================================================== */
const status = document.getElementById('analysis-status');

carregarEstado();
catalogoPronto = carregarCatalogo();
if (GOOGLE_CLIENT_ID) {
  document.getElementById('google-client-id').value = GOOGLE_CLIENT_ID;
  document.getElementById('client-id-box').classList.add('hidden');
}
const parametrosDoLink = new URLSearchParams(location.search);
const conviteNoLink = parametrosDoLink.get('convite') || '';
// De onde veio a pessoa (por exemplo, ?origem=linkedin). Só serve para contar visitas por canal.
const origemDoLink = (parametrosDoLink.get('origem') || parametrosDoLink.get('utm_source') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
registarAbertura();
document.getElementById('analyze-button').addEventListener('click', ligarGmail);
document.getElementById('search-input').addEventListener('input', renderEmpresas);
document.getElementById('filtro-tipo').addEventListener('change', (evento) => { filtroTipo = evento.target.value; renderEmpresas(); });
document.getElementById('ordem-lista').addEventListener('change', (evento) => {
  ordemLista = evento.target.value === 'emails' ? 'emails' : 'gravidade';
  if (selecaoMapa?.auto) selecaoMapa = null;
  renderPainel();
});
document.addEventListener('click', tratarClique);
// Que perguntas do guia são abertas, uma vez por pergunta em cada visita
// (o evento "toggle" não sobe, por isso apanha-se na descida)
// O mesmo para as perguntas frequentes (evento faq_aberta)
const perguntasAbertas = new Set();
document.addEventListener('toggle', (evento) => {
  if (!evento.target.open) return;
  const { guia, faq } = evento.target.dataset || {};
  const pergunta = guia || faq;
  if (!pergunta || perguntasAbertas.has(`${guia ? 'g' : 'f'}:${pergunta}`)) return;
  perguntasAbertas.add(`${guia ? 'g' : 'f'}:${pergunta}`);
  registarEvento(guia ? 'guia_aberto' : 'faq_aberta', { pergunta });
}, true);
ligarZoomDoMapa();
// As áreas do mapa são elementos SVG: Enter e Espaço também as abrem.
document.addEventListener('keydown', (evento) => {
  if ((evento.key === 'Enter' || evento.key === ' ') && evento.target instanceof SVGElement && evento.target.closest('[data-action]')) {
    evento.preventDefault();
    tratarClique(evento);
  }
});
document.getElementById('sheet').addEventListener('click', (evento) => {
  if (evento.target.id !== 'sheet') return;
  const continuar = abrirFolha.aoFecharFora;
  fecharFolha();
  if (continuar) continuar();
});
// Pedir a várias empresas: escolher empresas, fechar ao clicar fora ou com Esc (exceto a meio do envio)
const caixaLote = document.getElementById('lote');
caixaLote.addEventListener('change', (evento) => {
  const id = evento.target.dataset?.loteEmpresa;
  if (!id || !lote) return;
  if (evento.target.checked) lote.selecionadas.add(id);
  else lote.selecionadas.delete(id);
  // Só o rodapé e o "Selecionar todas" mudam: redesenhar tudo faria saltar a lista
  const rolagem = caixaLote.querySelector('.overflow-y-auto')?.scrollTop || 0;
  renderLote();
  const lista = caixaLote.querySelector('.overflow-y-auto');
  if (lista) lista.scrollTop = rolagem;
  caixaLote.querySelector(`[data-lote-empresa="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
});
caixaLote.addEventListener('click', (evento) => {
  if (evento.target.id === 'lote') fecharLote();
});
document.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Escape') return;
  if (lote) fecharLote();
  else if (!folhaAberta && selecaoMapa && vistaAtual() === 'resultados') fecharPainelEmpresa();
});
window.addEventListener('hashchange', renderTudo);
let esperaRedimensionar = 0;
window.addEventListener('resize', () => {
  clearTimeout(esperaRedimensionar);
  esperaRedimensionar = setTimeout(() => {
    const largura = document.getElementById('dot-map')?.clientWidth;
    if (vistaAtual() === 'resultados' && modoResultados === 'mapa' && redeDesenhada && largura && Math.abs(largura - redeDesenhada.larguraPx) > 8) renderMapa();
  }, 200);
});
window.matchMedia('(min-width: 1024px)').addEventListener('change', () => {
  if (vistaAtual() === 'resultados') renderPainel();
});
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') setTimeout(verificarPendente, 400);
});
// O modo exemplo foi retirado: apaga o que tenha ficado guardado de versões anteriores.
if (estado.demo || estado.pedidos.some((pedido) => pedido.demo)) limparExemplo();
// Prazos antigos (mês + 3 dias) passam a 30 dias depois do envio
estado.pedidos.forEach((pedido) => { if (pedido.sentAt) pedido.dueDate = estimarPrazo(pedido.sentAt); });
renderTudo();
mostrarPerguntaConsentimento();
setTimeout(verificarPendente, 600);

/* ==========================================================================
   Análise do Gmail (só cabeçalhos)
   ========================================================================== */
function ligarGmail() {
  const clientId = document.getElementById('google-client-id').value.trim();
  if (!clientId) {
    atualizarStatus('Introduz o Google OAuth Client ID para ligar a tua conta.', true);
    return;
  }
  // O ID do cliente acaba sempre em .apps.googleusercontent.com (não é o segredo GOCSPX-… nem uma chave AIza…)
  if (!/^[\w-]+\.apps\.googleusercontent\.com$/.test(clientId)) {
    atualizarStatus('Isto não parece um Client ID. Na Google Cloud Console, em Credenciais, copia o "ID do cliente" do tipo Aplicação Web: acaba em .apps.googleusercontent.com.', true);
    return;
  }
  if (location.protocol === 'file:') {
    atualizarStatus('Para ligar o Gmail, abre a app por http://localhost:8000 (com o servidor a correr), não com duplo clique no ficheiro.', true);
    return;
  }
  if (!googlePronto()) {
    esperarPeloGoogle();
    return;
  }
  const button = document.getElementById('analyze-button');
  button.disabled = true;
  button.innerHTML = 'A preparar ligação <span class="animate-pulse">•••</span>';
  document.getElementById('closed-test').classList.add('hidden');
  status.classList.add('hidden');
  registo.comecar();
  registo.passo('login', 'A abrir o login do Google');
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: GMAIL_READ_SCOPE,
    error_callback: (erro) => erroNaJanelaGoogle(erro, button),
    callback: (response) => {
      if (response.error) {
        repor(button);
        registo.erro(response.error === 'access_denied' ? 'O Google não deixou ligar esta conta.' : `O Google recusou a ligação (${response.error}).`);
        if (response.error === 'access_denied') mostrarTesteFechado('acesso_negado');
        else registarEvento('login_google_interrompido', { motivo: 'outro' });
        return;
      }
      // O Google deixa desmarcar a permissão no ecrã de consentimento: sem ela, o Gmail responde 403.
      if (google.accounts.oauth2.hasGrantedAllScopes?.(response, GMAIL_READ_SCOPE) === false) {
        repor(button);
        registo.erro('Não foi dada permissão para ler os emails. Tenta outra vez e, no ecrã do Google, marca a caixa «Ver as suas mensagens de email».');
        google.accounts.oauth2.revoke(response.access_token, () => {});
        return;
      }
      registo.feito('login', 'Sessão iniciada no Google');
      button.innerHTML = 'A analisar <span class="animate-pulse">•••</span>';
      analisarCabecalhos(response.access_token)
        .catch((error) => {
          mostrarProgresso(null);
          registo.erro(`Não foi possível ler o Gmail: ${error.message}`);
          registarEvento('analise_falhou', { motivo: motivoDoErro(error) });
        })
        .finally(() => {
          repor(button);
          // Ligação por análise: o acesso é revogado assim que a análise termina.
          google.accounts.oauth2.revoke(response.access_token, () => {});
          registo.feito('revogar', 'Acesso ao Gmail cancelado');
        });
    }
  });
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

// Erros fora do OAuth: a janela do Google não abriu (pop-up bloqueado) ou foi fechada antes do fim.
// Sem isto, o botão ficava preso em "A preparar ligação".
function erroNaJanelaGoogle(erro, button) {
  repor(button);
  const mensagens = {
    popup_failed_to_open: 'O browser bloqueou a janela de login do Google. Permite pop-ups para este site (ícone à direita na barra de endereço) e tenta outra vez.',
    popup_closed: 'A janela do Google fechou antes de terminares.'
  };
  registo.erro(mensagens[erro?.type] || `Não foi possível abrir o login do Google (${erro?.type || 'erro desconhecido'}).`);
  if (erro?.type === 'popup_closed') mostrarTesteFechado('janela_fechada');
  else registarEvento('login_google_interrompido', { motivo: erro?.type === 'popup_failed_to_open' ? 'janela_bloqueada' : 'outro' });
}

// A janela do Google fechou sem ligação: explica o que pode ter acontecido e o que fazer.
function mostrarTesteFechado(motivo = 'outro') {
  const caixa = document.getElementById('closed-test');
  const pedir = document.getElementById('closed-test-request');
  document.getElementById('closed-test-text').textContent = 'Se fechaste a janela do Google sem querer, carrega outra vez em «Ligar Gmail e começar». '
    + (PEDIR_ACESSO_URL || TESTE.URL
      ? 'Se o Google mostrou «Acesso bloqueado», o teste ainda está limitado a algumas contas: pede acesso aqui.'
      : 'Se o Google mostrou «Acesso bloqueado», o teste ainda está limitado a algumas contas.');
  pedir.classList.toggle('hidden', !PEDIR_ACESSO_URL && !TESTE.URL);
  if (PEDIR_ACESSO_URL) pedir.href = PEDIR_ACESSO_URL;
  else { pedir.removeAttribute('href'); pedir.setAttribute('data-action', 'pedir-acesso'); pedir.setAttribute('role', 'button'); }
  // Só para quem desenvolve (a correr no próprio computador): ajuda com o erro origin_mismatch
  const dev = document.getElementById('closed-test-dev');
  const local = location.protocol === 'file:' || ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
  dev.classList.toggle('hidden', !local);
  if (location.protocol === 'file:') {
    dev.textContent = 'Em desenvolvimento: abriste o ficheiro diretamente (file://) e assim o Google não deixa entrar. Abre a app através de um servidor, por exemplo com «python -m http.server 8000».';
  } else if (local) {
    dev.textContent = `Em desenvolvimento: se o Google mostrou «origin_mismatch», acrescenta ${location.origin} às «Origens JavaScript autorizadas» do teu cliente OAuth e espera uns minutos.`;
  }
  caixa.classList.remove('hidden');
  registarEvento('login_google_interrompido', { motivo });
}

function repor(button) {
  button.disabled = false;
  button.innerHTML = 'Ligar Gmail e começar <span>→</span>';
}

/* O login do Google (accounts.google.com/gsi/client) carrega à parte da app.
   Se o clique chega antes dele, a app espera; se o browser o bloqueou, tenta
   mais uma vez e, se continuar bloqueado, diz porquê e o que fazer. */
const GOOGLE_LOGIN_URL = 'https://accounts.google.com/gsi/client';

function googlePronto() {
  return Boolean(window.google?.accounts?.oauth2);
}

// Devolve 'pronto', 'bloqueado' (o browser recusou o script) ou 'lento' (não chegou a tempo)
function esperarGoogle(ms = 8000) {
  return new Promise((resolve) => {
    if (googlePronto()) { resolve('pronto'); return; }
    if (window.vetoGoogle === 'falhou' || window.vetoGoogle === 'carregou') {
      // Segunda tentativa: às vezes foi só a rede, na primeira vez
      window.vetoGoogle = 'a-carregar';
      const script = document.createElement('script');
      script.src = GOOGLE_LOGIN_URL;
      script.async = true;
      script.onload = () => { window.vetoGoogle = 'carregou'; };
      script.onerror = () => { window.vetoGoogle = 'falhou'; };
      document.head.append(script);
    }
    const limite = Date.now() + ms;
    const relogio = setInterval(() => {
      let fim = null;
      if (googlePronto()) fim = 'pronto';
      else if (window.vetoGoogle === 'falhou') fim = 'bloqueado';
      // Carregou mas não trouxe o login: um bloqueador trocou-o por um ficheiro vazio
      else if (window.vetoGoogle === 'carregou') fim = 'bloqueado';
      else if (Date.now() > limite) fim = 'lento';
      if (fim) { clearInterval(relogio); resolve(fim); }
    }, 150);
  });
}

function textoGoogleIndisponivel(motivo) {
  return motivo === 'lento'
    ? 'O login do Google está a demorar a carregar. Confirma que tens internet e carrega outra vez no botão.'
    : 'O browser não deixou carregar o login do Google (accounts.google.com). Costuma ser um bloqueador de anúncios ou a proteção contra rastreio: permite accounts.google.com nesta página, ou abre-a noutro browser, e recarrega a página.';
}

// O clique chegou antes do login do Google: espera por ele e, se chegar logo, continua sozinho
async function esperarPeloGoogle() {
  const button = document.getElementById('analyze-button');
  const inicio = Date.now();
  button.disabled = true;
  button.innerHTML = 'A carregar o login do Google <span class="animate-pulse">•••</span>';
  status.classList.add('hidden');
  const resultado = await esperarGoogle();
  repor(button);
  if (resultado === 'pronto') {
    // O browser só abre a janela do Google logo a seguir a um clique; se demorou, pede outro clique
    if (Date.now() - inicio < 1000) ligarGmail();
    else atualizarStatus('O login do Google já carregou. Carrega outra vez em «Ligar Gmail e começar».');
    return;
  }
  atualizarStatus(textoGoogleIndisponivel(resultado), true);
  registarEvento('login_google_interrompido', { motivo: resultado === 'lento' ? 'google_lento' : 'google_bloqueado' });
}

async function analisarCabecalhos(accessToken) {
  const inicio = Date.now();
  mostrarProgresso(0);
  gastosGmail.length = 0;
  // O endereço da conta serve para abrir o Gmail na conta certa ao enviar pedidos (fica só neste dispositivo).
  registo.passo('catalogo', 'A carregar o catálogo de contactos de privacidade');
  await catalogoPronto;
  if (catalogo.carregado) {
    registo.feito('catalogo', catalogo.assinatura === 'valida' ? 'Catálogo de contactos verificados (assinatura do grupo confirmada)' : 'Catálogo de contactos verificados', `${catalogo.empresas}`);
  } else if (catalogo.assinatura === 'invalida') {
    registo.aviso('catalogo', 'O catálogo foi alterado sem a assinatura do grupo e não foi usado: vais confirmar os contactos antes de cada pedido');
  } else {
    registo.aviso('catalogo', 'Catálogo indisponível: vais confirmar os contactos antes de cada pedido');
  }
  registo.passo('conta', 'A identificar a conta');
  const perfil = await gmailFetch('/profile', accessToken, GMAIL_QUOTA.CUSTO_LIST).catch(() => null);
  if (perfil?.emailAddress) estado.contaEmail = perfil.emailAddress;
  registo.feito('conta', perfil?.emailAddress ? `Conta ${perfil.emailAddress}` : 'Conta Gmail ligada');
  registo.passo('lista', 'A procurar os teus emails mais recentes');
  const messages = await listarMensagens(accessToken);
  registo.feito('lista', 'Emails para analisar', `${messages.length}`);
  const porMinuto = Math.floor((GMAIL_QUOTA.UNIDADES * GMAIL_QUOTA.MARGEM) / GMAIL_QUOTA.CUSTO_GET);
  const minutos = Math.ceil(messages.length / porMinuto);
  if (minutos > 1) registo.feito('ritmo', `O Gmail deixa ler ${porMinuto} por minuto: demora uns ${minutos} min`);
  const cabecalhos = ['From', 'Subject', 'Date', 'List-Unsubscribe'].map((nome) => `metadataHeaders=${nome}`).join('&');

  // Cada email é juntado à empresa que o enviou logo que chega, para o registo mostrar as empresas a aparecer
  const porEmpresa = new Map();
  const limiteUltimos30Dias = Date.now() - 30 * 86400000;
  const juntar = (detalhe) => {
    const headers = detalhe.payload?.headers || [];
    const obter = (nome) => headers.find((header) => header.name.toLowerCase() === nome.toLowerCase())?.value || '';
    const remetente = analisarRemetente(obter('From'));
    if (!remetente) return;
    // Por uma plataforma de envio, a empresa vem do nome do remetente; senão, do domínio
    const dominioEmpresa = remetente.plataforma ? chaveDaPlataforma(remetente) : obterDominioEmpresa(remetente.domain);
    const assunto = obter('Subject');
    const data = detalhe.internalDate ? new Date(Number(detalhe.internalDate)) : new Date(obter('Date'));
    const temCancelamento = Boolean(obter('List-Unsubscribe'));
    const sinal = classificarEmail(assunto, temCancelamento);
    const cancelar = linkDeCancelamento(obter('List-Unsubscribe'));

    if (!porEmpresa.has(dominioEmpresa)) {
      const conhecida = knownCompanies.get(dominioEmpresa);
      const marca = marcaConhecida(dominioEmpresa);
      const nome = conhecida?.name || marca?.name || remetente.name || dominioEmpresa;
      registo.empresa(nome, (SECTORS[conhecida?.sector || estimarSetor(dominioEmpresa, nome)] || SECTORS.outros).short);
    }
    const atual = porEmpresa.get(dominioEmpresa) || {
      domain: dominioEmpresa, domains: new Set(), senderName: remetente.name, nomes: new Map(), count: 0, recentCount: 0, firstDate: null, lastDate: null,
      kind: 'unknown', sampleSubject: '', reason: 'Nenhuma regra correspondeu', sinaisDeEmpresa: 0, conversas: 0,
      sentVia: remetente.plataforma ? (TERCEIROS[remetente.plataforma] || remetente.plataforma) : ''
    };
    // Numa plataforma de envio, só o endereço exato é desta empresa (as pesquisas no Gmail usam-no)
    atual.domains.add(remetente.plataforma ? remetente.email : remetente.domain);
    atual.count += 1;
    if (remetente.name) atual.nomes.set(remetente.name, (atual.nomes.get(remetente.name) || 0) + 1);
    // Sinais de que é uma empresa e não uma pessoa: envio automático, link de cancelamento,
    // um assunto de conta, compra ou publicidade, ou palavras como "Loja" ou "Lda." no nome
    if (remetente.automatico || temCancelamento || sinal.kind !== 'unknown' || remetente.nomeDeEmpresa || remetente.plataforma) atual.sinaisDeEmpresa += 1;
    else if (ASSUNTO_DE_CONVERSA.test(assunto)) atual.conversas += 1;
    if (!atual.kinds) atual.kinds = new Set();
    if (sinal.kind !== 'unknown') atual.kinds.add(sinal.kind);
    if (!Number.isNaN(data.getTime()) && data.getTime() >= limiteUltimos30Dias) atual.recentCount += 1;
    if (!atual.senderName && remetente.name) atual.senderName = remetente.name;
    // Prefere o link web ao email de cancelamento
    if (cancelar && (!atual.unsubscribe || (/^mailto:/i.test(atual.unsubscribe) && /^https:/i.test(cancelar)))) atual.unsubscribe = cancelar;
    if (!Number.isNaN(data.getTime()) && (!atual.lastDate || data > new Date(atual.lastDate))) atual.lastDate = data.toISOString();
    if (!Number.isNaN(data.getTime()) && (!atual.firstDate || data < new Date(atual.firstDate))) atual.firstDate = data.toISOString();
    // A categoria da empresa é o sinal mais forte encontrado:
    // conta provável > compra > newsletter > desconhecido.
    const sinalMaisForte = KIND_ORDER.indexOf(sinal.kind) < KIND_ORDER.indexOf(atual.kind);
    const mesmoSinalSemExemplo = sinal.kind === atual.kind && !atual.sampleSubject;
    if (sinalMaisForte || mesmoSinalSemExemplo) {
      atual.kind = sinal.kind;
      atual.reason = sinal.reason;
      atual.sampleSubject = assunto;
      atual.sampleDate = Number.isNaN(data.getTime()) ? null : data.toISOString();
    }
    porEmpresa.set(dominioEmpresa, atual);
  };

  registo.passo('ler', 'A ler remetente, assunto e data', `0 de ${messages.length}`);
  await emLotes(messages, GMAIL_PARALELO, async (message) => {
    juntar(await gmailFetch(`/messages/${message.id}?format=metadata&${cabecalhos}&fields=id,internalDate,payload/headers`, accessToken, GMAIL_QUOTA.CUSTO_GET));
  }, (feitos) => {
    registo.atualizar('ler', { extra: `${feitos} de ${messages.length}` });
    mostrarProgresso(feitos / Math.max(messages.length, 1));
  });
  registo.feito('ler', 'Remetente, assunto e data lidos (o texto não é aberto)', `${messages.length}`);

  // Quantas vezes cada empresa aparece na caixa toda, e quantos emails lhe escreveste.
  // São pesquisas (5 unidades), não leituras: não se abre nenhum email.
  // Só conversas com uma pessoa (respostas e reencaminhamentos, sem nenhum sinal de empresa)
  // ficam de fora, a não ser que o domínio seja de uma empresa conhecida
  const conversas = [...porEmpresa.values()].filter((agregado) => !agregado.sinaisDeEmpresa && agregado.conversas === agregado.count
    && !knownCompanies.has(agregado.domain) && !marcaConhecida(agregado.domain));
  if (conversas.length) registo.feito('pessoas', `${conversas.length} ${plural(conversas.length, 'remetente parece uma pessoa', 'remetentes parecem pessoas')} (só respostas e reencaminhamentos): ficam de fora`);
  const agregados = [...porEmpresa.values()].filter((agregado) => !conversas.includes(agregado));
  mostrarProgresso(0);
  registo.passo('contar', 'A contar os emails de cada empresa na caixa toda', `0 de ${agregados.length}`);
  await emLotes(agregados, GMAIL_PARALELO, async (agregado) => {
    const dominios = [...agregado.domains];
    const [recebidos, enviados] = await Promise.all([
      contarEmails(`{${dominios.map((domain) => `from:${domain}`).join(' ')}} -in:spam -in:trash`, accessToken),
      contarEmails(`in:sent {${dominios.map((domain) => `to:${domain}`).join(' ')}}`, accessToken)
    ]);
    agregado.totalRecebidos = Math.max(recebidos, agregado.count);
    agregado.enviados = enviados;
  }, (feitos) => {
    registo.atualizar('contar', { extra: `${feitos} de ${agregados.length}` });
    mostrarProgresso(feitos / Math.max(agregados.length, 1));
  });
  registo.feito('contar', 'Emails contados por empresa', `${agregados.length}`);

  const encontradas = agregados.map(criarEmpresaLocal);
  estado.emailsAnalisados = messages.length;
  substituirEmpresas(encontradas, false);
  mostrarProgresso(null);
  const areas = new Set(encontradas.map((empresa) => empresa.sector)).size;
  registo.feito('fim', `Análise concluída: ${encontradas.length} ${plural(encontradas.length, 'empresa', 'empresas')} em ${areas} ${plural(areas, 'área', 'áreas')}`);
  registarEvento('analise_concluida', { demo: false, emails: messages.length, duracaoS: Math.round((Date.now() - inicio) / 1000), ...resumoParaEventos(encontradas) });
  // Fica no Início: primeiro o resumo (quantas, que sensibilidade, que notícias), depois o botão para os resultados
  mostrarResumoDaAnalise();
}

function mostrarResumoDaAnalise() {
  renderResumo.acabouDeAnalisar = true;
  const mostrar = () => {
    const resumo = document.getElementById('home-summary');
    const topo = resumo.getBoundingClientRect().top + window.scrollY - 16;
    window.scrollTo({ top: Math.max(topo, 0), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    resumo.focus({ preventScroll: true });
  };
  if (vistaAtual() !== 'inicio') {
    location.hash = '#inicio';
    setTimeout(mostrar, 80); // depois de a página mudar (que volta ao topo)
  } else {
    renderTudo();
    mostrar();
  }
}

async function emLotes(itens, tamanho, tarefa, progresso) {
  const resultados = [];
  for (let i = 0; i < itens.length; i += tamanho) {
    const parte = await Promise.all(itens.slice(i, i + tamanho).map(tarefa));
    resultados.push(...parte);
    progresso(Math.min(i + tamanho, itens.length));
  }
  return resultados;
}

// Número (aproximado) de emails que correspondem a uma pesquisa, sem abrir nenhum
// O "resultSizeEstimate" do Gmail é só uma estimativa (dá muitas vezes 201), por isso contam-se
// os identificadores página a página (500 por página, só ids), até CONTAGEM_MAX.
const CONTAGEM_MAX = 2000;
async function contarEmails(pesquisa, accessToken) {
  let total = 0;
  let pagina = '';
  try {
    do {
      const resposta = await gmailFetch(`/messages?maxResults=500&fields=messages/id,nextPageToken&q=${encodeURIComponent(pesquisa)}${pagina ? `&pageToken=${encodeURIComponent(pagina)}` : ''}`, accessToken, GMAIL_QUOTA.CUSTO_LIST);
      total += resposta.messages?.length || 0;
      pagina = resposta.nextPageToken || '';
    } while (pagina && total < CONTAGEM_MAX);
  } catch (erro) {
    return total;
  }
  return total;
}

// Do cabeçalho List-Unsubscribe, só se aceitam links https e mailto (nunca javascript: ou outros)
function linkDeCancelamento(valor) {
  const links = (valor.match(/<([^>]+)>/g) || []).map((item) => item.slice(1, -1).trim());
  return links.find((link) => /^https:\/\//i.test(link)) || links.find((link) => /^mailto:/i.test(link)) || '';
}

// Lista os últimos GMAIL_MAX_EMAILS emails, página a página (o Gmail dá até 500 por página).
async function listarMensagens(accessToken) {
  const mensagens = [];
  let pagina = '';
  while (mensagens.length < GMAIL_MAX_EMAILS) {
    const quantos = Math.min(500, GMAIL_MAX_EMAILS - mensagens.length);
    const resposta = await gmailFetch(`/messages?maxResults=${quantos}&q=${encodeURIComponent(GMAIL_QUERY)}${pagina ? `&pageToken=${encodeURIComponent(pagina)}` : ''}`, accessToken, GMAIL_QUOTA.CUSTO_LIST);
    mensagens.push(...(resposta.messages || []));
    if (!resposta.nextPageToken) break;
    pagina = resposta.nextPageToken;
  }
  return mensagens.slice(0, GMAIL_MAX_EMAILS);
}

// Cada pedido ao Gmail espera pela sua vez para nunca passar do limite por minuto.
// Se mesmo assim o Gmail disser que passou (por exemplo, por tentativas anteriores),
// a app espera que a janela de um minuto esvazie e continua.
// "corpo" (opcional) faz um POST com JSON. "repetirSeFalhar: false" evita repetir um envio que o
// Gmail pode já ter feito (um erro 5xx não garante que o email não saiu).
async function gmailFetch(path, accessToken, custo = GMAIL_QUOTA.CUSTO_GET, tentativa = 0, { corpo, repetirSeFalhar = true } = {}) {
  await esperarQuota(custo);
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, corpo === undefined
    ? { headers: { Authorization: `Bearer ${accessToken}` } }
    : { method: 'POST', headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
  if (response.ok) {
    // Algumas respostas (por exemplo, batchModify) vêm vazias
    const texto = await response.text();
    return texto ? JSON.parse(texto) : {};
  }
  const detalhe = await response.json().catch(() => null);
  const motivos = [...(detalhe?.error?.errors || []), ...(detalhe?.error?.details || [])].map((item) => item.reason).filter(Boolean);
  const semQuota = response.status === 429
    || motivos.some((motivo) => /rate_?limit_?exceeded|quota_?exceeded/i.test(motivo))
    || /quota exceeded/i.test(detalhe?.error?.message || '');
  const opcoes = { corpo, repetirSeFalhar };
  if (semQuota && tentativa < 3) {
    gastosGmail.push({ t: Date.now(), unidades: GMAIL_QUOTA.UNIDADES }); // bloqueia até a janela esvaziar
    return gmailFetch(path, accessToken, custo, tentativa + 1, opcoes);
  }
  if (response.status >= 500 && repetirSeFalhar && tentativa < 3) {
    await dormir(800 * 2 ** tentativa);
    return gmailFetch(path, accessToken, custo, tentativa + 1, opcoes);
  }
  const erro = new Error(explicarErroGmail(response.status, motivos, detalhe?.error?.message));
  erro.estado = response.status;
  throw erro;
}

// Janela deslizante: soma das unidades gastas no último minuto
const gastosGmail = [];
async function esperarQuota(unidades) {
  const limite = GMAIL_QUOTA.UNIDADES * GMAIL_QUOTA.MARGEM;
  for (;;) {
    const agora = Date.now();
    while (gastosGmail.length && agora - gastosGmail[0].t >= GMAIL_QUOTA.JANELA_MS) gastosGmail.shift();
    const usado = gastosGmail.reduce((soma, gasto) => soma + gasto.unidades, 0);
    if (usado + unidades <= limite) {
      gastosGmail.push({ t: agora, unidades });
      return;
    }
    const espera = GMAIL_QUOTA.JANELA_MS - (agora - gastosGmail[0].t) + 50;
    if (espera > 1500) contagemDecrescente(agora + espera);
    await dormir(espera);
  }
}

// Mostra quanto falta para continuar, segundo a segundo, enquanto se espera pelo limite do Gmail
function contagemDecrescente(fim) {
  if (contagemDecrescente.fim && contagemDecrescente.fim >= fim) return;
  contagemDecrescente.fim = fim;
  clearInterval(contagemDecrescente.relogio);
  const mostrar = () => {
    const falta = Math.ceil((contagemDecrescente.fim - Date.now()) / 1000);
    if (falta <= 0) {
      clearInterval(contagemDecrescente.relogio);
      contagemDecrescente.fim = 0;
      registo.remover('quota');
      return;
    }
    registo.aviso('quota', `Limite do Gmail por minuto: a continuar dentro de ${falta} s`);
  };
  mostrar();
  contagemDecrescente.relogio = setInterval(mostrar, 1000);
}

function dormir(ms) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}

// Traduz os erros mais comuns da configuração na Google Cloud
function explicarErroGmail(codigo, motivos, mensagem) {
  if (motivos.some((motivo) => /accessNotConfigured|SERVICE_DISABLED/i.test(motivo))) {
    return 'a Gmail API não está ativada neste projeto da Google Cloud. Ativa-a em APIs e serviços > Biblioteca > Gmail API, espera um minuto e tenta outra vez.';
  }
  if (motivos.some((motivo) => /insufficientPermissions|SCOPE_INSUFFICIENT/i.test(motivo))) {
    return 'não foi dada permissão para ler os emails. Tenta outra vez e, no ecrã do Google, marca a caixa "Ver as suas mensagens de email".';
  }
  return `o Gmail respondeu com ${codigo}${mensagem ? `: ${mensagem}` : ''}`;
}

/* ==========================================================================
   Registo da análise: cada passo aparece com o estado (a decorrer, feito, aviso, erro).
   O passo a decorrer fica sempre em baixo; as descobertas (empresas) aparecem por cima dele.
   ========================================================================== */
const registo = {
  linhas: [],
  maxEmpresas: 25,
  comecar() {
    this.linhas = [];
    this.empresasVistas = 0;
    this.desenhar();
  },
  linha(id) {
    return this.linhas.find((l) => l.id === id);
  },
  // Novo passo: o anterior que ainda estivesse a decorrer fica feito
  passo(id, texto, extra = '') {
    this.linhas.forEach((l) => { if (l.estado === 'ativo') l.estado = 'feito'; });
    this.linhas.push({ id, texto, extra, estado: 'ativo' });
    this.desenhar();
  },
  atualizar(id, mudancas) {
    const l = this.linha(id);
    if (l) Object.assign(l, mudancas);
    this.desenhar();
  },
  feito(id, texto, extra = '') {
    const l = this.linha(id);
    if (l) Object.assign(l, { estado: 'feito', texto: texto || l.texto, extra });
    else this.linhas.push({ id, texto, extra, estado: 'feito' });
    this.desenhar();
  },
  // Empresas encontradas enquanto se leem os emails (as primeiras uma a uma, depois só a contagem)
  empresa(nome, area) {
    this.empresasVistas += 1;
    if (this.empresasVistas <= this.maxEmpresas) this.linhas.push({ id: `e${this.empresasVistas}`, texto: nome, extra: area, estado: 'nota' });
    else {
      const resto = this.linha('mais-empresas');
      const texto = `e mais ${this.empresasVistas - this.maxEmpresas} ${plural(this.empresasVistas - this.maxEmpresas, 'empresa', 'empresas')}`;
      if (resto) resto.texto = texto;
      else this.linhas.push({ id: 'mais-empresas', texto, extra: '', estado: 'nota' });
    }
    this.desenhar();
  },
  aviso(id, texto) {
    const l = this.linha(id);
    if (l) l.texto = texto;
    else this.linhas.push({ id, texto, extra: '', estado: 'aviso' });
    this.desenhar();
  },
  remover(id) {
    this.linhas = this.linhas.filter((l) => l.id !== id);
    this.desenhar();
  },
  // O passo a decorrer passa a erro, com a explicação no lugar do texto
  erro(texto) {
    const ativo = this.linhas.find((l) => l.estado === 'ativo');
    if (ativo) Object.assign(ativo, { estado: 'erro', texto, extra: '' });
    else this.linhas.push({ id: 'erro', texto, extra: '', estado: 'erro' });
    this.desenhar();
  },
  desenhar() {
    const lista = document.getElementById('analysis-log');
    if (!lista) return;
    lista.classList.toggle('hidden', this.linhas.length === 0);
    const icones = {
      ativo: '<svg viewBox="0 0 16 16" class="h-3.5 w-3.5 animate-spin text-lime" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" stroke-opacity="0.25" stroke-width="2"/><path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
      feito: '<svg viewBox="0 0 16 16" class="h-3.5 w-3.5 text-lime" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m3.5 8.5 3 3 6-7"/></svg>',
      nota: '<span class="mx-auto block h-1 w-1 rounded-full bg-slate-500"></span>',
      aviso: '<svg viewBox="0 0 16 16" class="h-3.5 w-3.5 text-amber-300" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="8" cy="8" r="6"/><path d="M8 4.8V8.5l2 1.3"/></svg>',
      erro: '<svg viewBox="0 0 16 16" class="h-3.5 w-3.5 text-rose-300" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m4.5 4.5 7 7m0-7-7 7"/></svg>'
    };
    // O passo a decorrer e os avisos ficam no fim, à vista
    const ordem = [...this.linhas.filter((l) => !['ativo', 'aviso'].includes(l.estado)), ...this.linhas.filter((l) => l.estado === 'ativo'), ...this.linhas.filter((l) => l.estado === 'aviso')];
    lista.innerHTML = ordem.map((l) => {
      const nota = l.estado === 'nota';
      const erro = l.estado === 'erro';
      return `<li class="flex ${erro ? 'items-start' : 'items-center'} gap-2 py-0.5 ${nota ? 'pl-5' : ''}">
        <span class="flex h-5 w-3.5 shrink-0 items-center justify-center">${icones[l.estado] || ''}</span>
        <span class="min-w-0 flex-1 ${erro ? 'text-rose-200' : 'truncate'} ${l.estado === 'ativo' ? 'font-semibold text-white' : nota ? 'text-slate-400' : erro ? '' : 'text-slate-300'}">${esc(l.texto)}</span>
        ${l.extra ? `<span class="shrink-0 tabular-nums text-mist">${esc(l.extra)}</span>` : ''}
      </li>`;
    }).join('');
    lista.scrollTop = lista.scrollHeight;
  }
};

function mostrarProgresso(fracao) {
  const barra = document.getElementById('analysis-progress');
  barra.classList.toggle('hidden', fracao === null);
  if (fracao !== null) barra.firstElementChild.style.width = `${Math.round(fracao * 100)}%`;
}

function classificarEmail(assunto, temListUnsubscribe) {
  // Numa resposta ("Re: ..."), o assunto é o da conversa, não diz que tipo de email é
  const texto = String(assunto || '').replace(ASSUNTO_DE_CONVERSA, '');
  const regra = !ASSUNTO_DE_CONVERSA.test(assunto || '') && SUBJECT_RULES.find((item) => item.re.test(texto));
  if (regra) return { kind: regra.kind, reason: regra.reason };
  if (temListUnsubscribe) return { kind: 'newsletter', reason: 'Só emails de marketing' };
  return { kind: 'unknown', reason: 'Nenhuma regra correspondeu' };
}

function estimarSetor(dominio, nome) {
  const marca = marcaConhecida(dominio);
  if (marca) return marca.sector;
  const texto = `${dominio} ${nome}`;
  return SECTOR_ORDER.find((chave) => SECTORS[chave].re && SECTORS[chave].re.test(texto)) || 'outros';
}

// Só o remetente (From) identifica a empresa. O List-Unsubscribe serve apenas
// de sinal de newsletter: os domínios lá dentro são muitas vezes de plataformas de envio.
// Devolve também se o endereço é de envio automático (noreply@, faturacao@…) e, quando o email
// vem de uma plataforma de envio (SendGrid, E-goi…), qual é.
function analisarRemetente(valor) {
  const email = (valor.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0];
  if (!email) return null;
  const domain = normalizarDominio(email.split('@')[1]);
  if (!domain || isProviderDomain(domain)) return null;
  const local = email.split('@')[0].toLowerCase();
  const bruto = valor.replace(/<[^>]*>/g, '').replace(/["']/g, '').trim();
  // Nomes genéricos ("Newsletter", "noreply"…) não identificam a empresa: usa-se o domínio.
  const plataforma = plataformaDeEnvio(domain);
  let nome = limparNomeRemetente(bruto, domain);
  // Nas plataformas de apoio ao cliente, o subdomínio é a empresa: loja.zendesk.com
  if (!nome && ['zendesk.com', 'freshdesk.com'].includes(plataforma) && domain !== plataforma) {
    const rotulo = domain.slice(0, -plataforma.length - 1).split('.').pop();
    nome = rotulo.replace(/[-_]/g, ' ').replace(/\b\w/g, (letra) => letra.toUpperCase());
  }
  return {
    domain, email: email.toLowerCase(), name: nome,
    automatico: LOCAL_AUTOMATICO.test(local),
    nomeDeEmpresa: NOME_DE_EMPRESA.test(bruto),
    plataforma
  };
}

// A chave de uma empresa enviada por uma plataforma: a empresa do catálogo com esse nome
// ou, se não houver, o nome dela ("farmacia-avenida.e-goi.com"). Sem nome, fica a plataforma.
function chaveDaPlataforma(remetente) {
  const conhecida = remetente.name && empresaPeloNome(remetente.name);
  if (conhecida) return conhecida.domain;
  const rotulo = remetente.name ? normalizarNome(remetente.name).slice(0, 40) : '';
  const daPlataforma = normalizarNome(remetente.plataforma.split('.')[0]);
  if (!rotulo || rotulo === daPlataforma) return remetente.plataforma;
  return `${rotulo}.${remetente.plataforma}`;
}

function normalizarDominio(domain) {
  return domain.toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
}

function isProviderDomain(domain) {
  return ignoredDomains.has(domain) || [...ignoredDomains].some((provider) => domain.endsWith(`.${provider}`));
}

function obterDominioEmpresa(domain) {
  const alias = COMPANY_DOMAIN_ALIASES.get(domain);
  if (alias) return alias;
  // Do mais específico ao mais geral: info.edp.pt, depois edp.pt
  const partesDominio = domain.split('.');
  for (let i = 0; i < partesDominio.length - 1; i += 1) {
    const conhecida = knownCompanies.get(partesDominio.slice(i).join('.'));
    if (conhecida) return conhecida.domain;
  }

  const partes = domain.split('.');
  const suffixSize = multiPartPublicSuffixes.has(partes.slice(-2).join('.')) ? 2 : 1;
  return partes.slice(-(suffixSize + 1)).join('.');
}

function criarEmpresaLocal(agregado) {
  const evidence = {
    count: agregado.count, recentCount: agregado.recentCount ?? 0, firstDate: agregado.firstDate, lastDate: agregado.lastDate, sampleSubject: agregado.sampleSubject, sampleDate: agregado.sampleDate || null, reason: agregado.reason, kinds: agregado.kinds ? [...agregado.kinds] : [],
    totalRecebidos: agregado.totalRecebidos ?? agregado.count, enviados: agregado.enviados ?? 0
  };
  const unsubscribe = agregado.unsubscribe || '';
  if (knownCompanies.has(agregado.domain)) {
    const conhecida = knownCompanies.get(agregado.domain);
    const verificado = Boolean(conhecida.contactVerifiedAt);
    return {
      ...conhecida, id: agregado.domain, domains: agregado.domains ? [...agregado.domains] : [agregado.domain], kind: agregado.kind, evidence, unsubscribe, sectorEstimated: false,
      ...(agregado.sentVia ? { sentVia: agregado.sentVia } : {}),
      // Empresas da lista de exemplo antiga, sem contacto verificado, ficam por confirmar como as outras
      dpo_email: verificado ? conhecida.dpo_email : '', contactExample: false
    };
  }
  const label = agregado.domain.split('.')[0].replace(/[-_]/g, ' ');
  const nomeDominio = label.replace(/\b\w/g, (letter) => letter.toUpperCase());
  // O nome: o da marca conhecida ou o que o remetente usa mais vezes (no empate, o mais curto)
  const marca = marcaConhecida(agregado.domain);
  const maisUsado = agregado.nomes?.size
    ? [...agregado.nomes.entries()].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)[0][0] : '';
  const name = marca?.name || maisUsado || agregado.senderName || nomeDominio;
  return {
    id: agregado.domain, name, domain: agregado.domain, domains: agregado.domains ? [...agregado.domains] : [agregado.domain],
    sector: marca?.sector || estimarSetor(agregado.domain, name), sectorEstimated: !marca,
    kind: agregado.kind, icon: (name[0] || '?').toUpperCase(), dpo_email: '', contactExample: false, evidence, unsubscribe,
    ...(agregado.sentVia ? { sentVia: agregado.sentVia } : {})
  };
}

// Contacto de exemplo para o protótipo: o endereço de privacidade mais comum.
function contactoDeExemplo(dominio) {
  return `privacy@${dominio}`;
}

function substituirEmpresas(novas, demoAtivo) {
  if (!demoAtivo) estado.pedidos = estado.pedidos.filter((pedido) => !pedido.demo);
  renderResumo.novaAnalise = false;
  filtroSetor = 'todos';
  filtroTipo = 'todas';
  estado.empresas = novas.map((empresa) => ({ ...empresa, dismissed: false }));
  estado.analisadoEm = new Date().toISOString();
  estado.demo = demoAtivo;
  if (demoAtivo) estado.emailsAnalisados = 0;
  guardarEstado();
  renderTudo();
}

/* ==========================================================================
   Pedidos
   ========================================================================== */
function prepararPedido(empresaId, right) {
  const empresa = obterEmpresa(empresaId);
  if (!empresa) return;
  if (!empresa.dpo_email && !empresa.privacyForm) {
    pedirContacto(empresa, () => prepararPedido(empresaId, right));
    return;
  }
  // Se há um pedido por confirmar, pergunta uma vez; clicar fora da janela segue com o pedido novo
  const pendente = !prepararPedido.semPergunta && estado.pedidos.find((pedido) => pedido.status === 'awaiting_confirmation' && !pedido.perguntaAdiada);
  if (pendente) {
    perguntarSeEnviou(pendente, () => {
      pendente.perguntaAdiada = true;
      guardarEstado();
      prepararPedido(empresaId, right);
    });
    return;
  }
  const aberto = estado.pedidos.find((pedido) => pedido.companyId === empresaId && pedido.right === right && !['closed', 'draft'].includes(pedido.status));
  if (aberto) mostrarToast(`Já tens um pedido de ${RIGHTS[right].short.toLowerCase()} aberto para ${empresa.name}.`);
  // Com email: o Veto mostra o pedido completo e envia-o pelo Gmail se a pessoa aceitar (ou ela abre-o no email dela).
  // Só com formulário, ou no exemplo com dados simulados, fica como antes.
  if (empresa.dpo_email && !estado.demo && location.protocol !== 'file:') {
    abrirPedidoUnico(empresa, right);
    return;
  }
  prepararPedidoManual(empresa, right);
}

// Pedido a uma empresa: o mesmo ecrã de confirmação do envio a várias, com o email completo
function abrirPedidoUnico(empresa, right) {
  lote = {
    passo: 'rever', right, selecionadas: new Set([empresa.id]), erro: '', onde: 'empresa', unica: true,
    envios: [{ id: empresa.id, nome: empresa.name, email: empresa.dpo_email, estado: 'espera', motivo: '' }]
  };
  registarEvento('pedido_preparado', {
    demo: false, direito: right, area: empresa.sector, gravidade: gravidadeDe(empresa).chave,
    canal: 'email', contacto: origemDoContacto(empresa), vista: vistaAtual()
  });
  const caixa = document.getElementById('lote');
  caixa.classList.remove('hidden');
  caixa.classList.add('flex');
  renderLote();
  document.getElementById('lote-painel').focus();
}

// O caminho manual: abre o pedido no email da pessoa (ou no formulário) e pergunta depois se o enviou
function prepararPedidoManual(empresa, right, jaRegistado = false) {
  const agora = new Date().toISOString();
  const pedido = {
    id: gerarId(), companyId: empresa.id, companyName: empresa.name, companySector: empresa.sector, domain: empresa.domain,
    // Por email quando a empresa o publica; senão, no formulário oficial
    channel: empresa.dpo_email ? 'email' : 'formulario', email: empresa.dpo_email || empresa.privacyForm,
    right, status: 'awaiting_confirmation', createdAt: agora, sentAt: null, dueDate: null,
    replyAt: null, closedAt: null, closeReason: null, outcome: null, holdsData: null, followUpAt: null,
    demo: estado.demo, timeline: [{ to: 'awaiting_confirmation', at: agora }]
  };
  estado.pedidos.push(pedido);
  // Quem veio do ecrã de envio pelo Veto já contou como pedido preparado
  if (!jaRegistado) registarEvento('pedido_preparado', {
    demo: pedido.demo, direito: right, area: empresa.sector, gravidade: gravidadeDe(empresa).chave,
    canal: pedido.channel, contacto: origemDoContacto(empresa), vista: vistaAtual()
  });
  // Guardado ANTES de abrir a app de email, para a pergunta "Enviaste?" sobreviver se o browser fechar a página.
  guardarEstado();
  enviarPedido(pedido, RIGHTS[right].subject, RIGHTS[right].body(empresa.name), () => marcarNaoEnviado(pedido.id));
  renderTudo();
}

// De onde veio o contacto usado: catálogo da equipa, Datenanfragen.de ou escrito pela pessoa
function origemDoContacto(empresa) {
  if (empresa.contactUser) return 'utilizador';
  if (empresa.contactVerifiedAt) return empresa.contactOrigin === 'datenanfragen' ? 'datenanfragen' : 'veto';
  return 'exemplo';
}

function reabrirRascunho(pedidoId) {
  const pedido = obterPedido(pedidoId);
  if (!pedido) return;
  const pendente = estado.pedidos.find((item) => item.status === 'awaiting_confirmation');
  if (pendente) {
    perguntarSeEnviou(pendente);
    return;
  }
  mudarEstado(pedido, 'awaiting_confirmation');
  enviarPedido(pedido, RIGHTS[pedido.right].subject, RIGHTS[pedido.right].body(pedido.companyName), () => marcarNaoEnviado(pedido.id));
}

/* ==========================================================================
   App de email: Gmail, Outlook ou a app predefinida do dispositivo
   O pedido deve sair do mesmo endereço que foi analisado, porque é a esse
   endereço que a empresa associa os dados.
   ========================================================================== */
const APPS_EMAIL = {
  gmail: {
    label: 'Gmail',
    url: (para, assunto, corpo) => `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(para)}&su=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}${estado.contaEmail ? `&authuser=${encodeURIComponent(estado.contaEmail)}` : ''}`
  },
  outlook: {
    label: 'Outlook ou Hotmail',
    url: (para, assunto, corpo) => `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(para)}&subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`
  },
  sistema: {
    label: 'App de email do dispositivo',
    url: (para, assunto, corpo) => `mailto:${para}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`
  }
};

// Abre o pedido no canal certo: a app de email ou o formulário oficial da empresa
function enviarPedido(pedido, assunto, corpo, aoCancelar = () => {}) {
  if (pedido.channel === 'formulario') abrirFormulario(pedido.email, assunto, corpo, pedido.companyName);
  else abrirEmail(pedido.email, assunto, corpo, aoCancelar);
}

// Formulário oficial: o texto do pedido vai para a área de transferência, para colar no formulário
function abrirFormulario(url, assunto, corpo, empresa) {
  if (!/^https:\/\//i.test(url)) return;
  copiarTexto(`${assunto}\n\n${corpo}`);
  mostrarToast(`Copiámos o texto do pedido. Cola-o no formulário da ${empresa}.`);
  const janela = window.open(url, '_blank');
  if (janela) janela.opener = null;
  else window.location.href = url;
  setTimeout(() => {
    if (document.visibilityState === 'visible') verificarPendente();
  }, 2500);
}

function copiarTexto(texto) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(texto).catch(() => copiarTextoAntigo(texto));
  } else {
    copiarTextoAntigo(texto);
  }
}

function copiarTextoAntigo(texto) {
  const area = document.createElement('textarea');
  area.value = texto;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  try { document.execCommand('copy'); } catch (erro) { /* sem área de transferência */ }
  area.remove();
}

// Fora do catálogo não adivinhamos endereços: o utilizador confirma o contacto na política de privacidade
function pedirContacto(empresa, depois) {
  const pesquisa = `https://duckduckgo.com/?q=${encodeURIComponent(`${empresa.name} ${empresa.domain} política de privacidade proteção de dados`)}`;
  abrirFolha({
    titulo: `Confirma o contacto da ${empresa.name}`,
    texto: `${avisoDoCatalogo() || 'Esta empresa ainda não está no nosso catálogo de contactos verificados.'} Procura na política de privacidade dela o email do Encarregado de Proteção de Dados (ou o indicado para exercer direitos).`,
    nota: 'Não adivinhamos endereços: um pedido para o endereço errado nunca chega.',
    opcoes: [
      {
        label: 'Procurar a política de privacidade', estilo: 'secondary', acao: () => {
          const janela = window.open(pesquisa, '_blank');
          if (janela) janela.opener = null;
        }
      },
      {
        label: 'Já tenho o email', estilo: 'primary', acao: () => {
          const email = (window.prompt(`Email de privacidade da ${empresa.name}:`) || '').trim();
          if (!email) return;
          if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) {
            mostrarToast('Esse email não parece válido.');
            return;
          }
          empresa.dpo_email = email;
          empresa.contactUser = true;
          guardarEstado();
          registarEvento('contacto_indicado', { area: empresa.sector });
          depois();
        }
      },
      { label: 'Cancelar', estilo: 'ghost', acao: () => {} }
    ]
  });
}

function abrirEmail(destinatario, assunto, corpo, aoCancelar = () => {}) {
  if (!APPS_EMAIL[estado.appEmail]) {
    escolherAppEmail(() => abrirEmail(destinatario, assunto, corpo, aoCancelar), aoCancelar);
    return;
  }
  const app = APPS_EMAIL[estado.appEmail];
  const url = app.url(destinatario, assunto, corpo);
  mostrarToast(`A abrir o pedido no ${app.label}…`);
  if (estado.appEmail === 'sistema') {
    window.location.href = url;
  } else {
    // Gmail e Outlook abrem num separador novo, já com o email escrito
    const janela = window.open(url, '_blank');
    if (janela) janela.opener = null;
    else window.location.href = url;
  }
  // Ao voltar à app (ou passados uns segundos), pergunta se o pedido foi enviado
  setTimeout(() => {
    if (document.visibilityState === 'visible') verificarPendente();
  }, 2500);
}

function escolherAppEmail(depois, aoCancelar) {
  const conta = estado.contaEmail || '';
  const sugerida = /@(hotmail|outlook|live|msn)\./i.test(conta) ? 'outlook' : 'gmail';
  abrirFolha({
    titulo: 'Onde queres escrever o pedido?',
    texto: conta
      ? `Envia-o a partir de ${conta}, o email que analisámos: é a esse endereço que a empresa associa os teus dados.`
      : 'Envia-o a partir do email que a empresa tem associado aos teus dados.',
    opcoes: [
      ...['gmail', 'outlook', 'sistema'].map((chave) => ({
        label: APPS_EMAIL[chave].label,
        estilo: chave === sugerida ? 'primary' : 'secondary',
        acao: () => {
          estado.appEmail = chave;
          guardarEstado();
          depois();
        }
      })),
      { label: 'Cancelar', estilo: 'ghost', acao: aoCancelar }
    ]
  });
}

function verificarPendente() {
  if (folhaAberta || lote) return;
  const pendente = estado.pedidos.find((pedido) => pedido.status === 'awaiting_confirmation');
  if (pendente) perguntarSeEnviou(pendente);
}

function perguntarSeEnviou(pedido, aoFecharFora = null) {
  abrirFolha({
    aoFecharFora,
    titulo: `Enviaste o pedido à ${pedido.companyName}?`,
    texto: 'Só tu sabes: o Veto não tem acesso ao teu email enviado. Se disseres que sim, começamos a contar o prazo de resposta.',
    opcoes: [
      { label: 'Sim, enviei', estilo: 'primary', acao: () => confirmarEnvio(pedido.id) },
      { label: 'Ainda não', estilo: 'secondary', acao: () => marcarNaoEnviado(pedido.id) },
      pedido.channel === 'formulario' ? {
        label: 'Abrir o formulário outra vez',
        estilo: 'ghost',
        acao: () => enviarPedido(pedido, RIGHTS[pedido.right].subject, RIGHTS[pedido.right].body(pedido.companyName))
      } : {
        label: estado.appEmail ? `Abrir noutra app (agora: ${APPS_EMAIL[estado.appEmail]?.label || 'nenhuma'})` : 'Abrir noutra app de email',
        estilo: 'ghost',
        acao: () => {
          estado.appEmail = null;
          enviarPedido(pedido, RIGHTS[pedido.right].subject, RIGHTS[pedido.right].body(pedido.companyName), () => marcarNaoEnviado(pedido.id));
        }
      }
    ]
  });
}

function confirmarEnvio(pedidoId) {
  const pedido = obterPedido(pedidoId);
  if (!pedido) return;
  pedido.sentAt = new Date().toISOString();
  pedido.dueDate = estimarPrazo(pedido.sentAt);
  mudarEstado(pedido, 'sent');
  registarEvento('pedido_enviado', {
    demo: pedido.demo, direito: pedido.right, area: pedido.companySector, canal: pedido.channel,
    app: pedido.channel === 'formulario' ? '' : (estado.appEmail || ''),
    minutos: Math.max(0, Math.round((Date.now() - new Date(pedido.createdAt).getTime()) / 60000))
  });
  // Depois de enviar, o próximo sítio natural é a página de pedidos.
  abrirFolha({
    titulo: 'Pedido enviado',
    texto: `A ${pedido.companyName} tem até ${formatarData(pedido.dueDate)} para responder. Acompanha-o na página Pedidos.`,
    opcoes: vistaAtual() === 'pedidos'
      ? [{ label: 'OK', estilo: 'primary', acao: () => {} }]
      : [
        { label: 'Ver no mapa', estilo: 'primary', acao: () => { selecaoMapa = { tipo: 'empresa', chave: pedido.companyId }; location.hash = '#pedidos'; } },
        { label: 'Continuar nos resultados', estilo: 'secondary', acao: () => {} }
      ]
  });
}

function marcarNaoEnviado(pedidoId) {
  const pedido = obterPedido(pedidoId);
  if (!pedido) return;
  mudarEstado(pedido, 'draft');
  mostrarToast('Guardado como rascunho na página de pedidos.');
}

function registarResposta(pedidoId) {
  const pedido = obterPedido(pedidoId);
  if (!pedido) return;
  abrirFolha({
    titulo: `O que respondeu a ${pedido.companyName}?`,
    texto: 'Escolhe a opção que melhor descreve a resposta. Isto atualiza o estado do pedido.',
    opcoes: [
      ...OUTCOMES_BY_RIGHT[pedido.right].map((chave, indice) => ({
        label: OUTCOMES[chave].label, estilo: indice === 0 ? 'primary' : 'secondary', acao: () => aplicarResultado(pedido.id, chave)
      })),
      { label: 'Cancelar', estilo: 'ghost', acao: () => {} }
    ]
  });
}

function aplicarResultado(pedidoId, chave) {
  const pedido = obterPedido(pedidoId);
  const resultado = OUTCOMES[chave];
  if (!pedido || !resultado) return;
  const agora = new Date().toISOString();
  pedido.outcome = chave;
  pedido.holdsData = resultado.holdsData;
  registarEvento('resposta_registada', {
    demo: pedido.demo, direito: pedido.right, area: pedido.companySector, resultado: chave,
    dias: pedido.sentAt ? Math.max(0, Math.round((Date.now() - new Date(pedido.sentAt).getTime()) / 86400000)) : undefined
  });
  if (!pedido.replyAt && chave !== 'no_reply') pedido.replyAt = agora;
  if (resultado.closeReason) {
    pedido.closedAt = agora;
    pedido.closeReason = resultado.closeReason;
    mudarEstado(pedido, 'closed');
  } else {
    mudarEstado(pedido, 'reply_received');
  }
}

function enviarInsistencia(pedidoId) {
  const pedido = obterPedido(pedidoId);
  if (!pedido) return;
  const direito = RIGHTS[pedido.right];
  const corpo = `Exmos. Senhores da ${pedido.companyName},

No dia ${formatarData(pedido.sentAt)}, enviei-vos, a partir deste endereço de email, um pedido ao abrigo do ${direito.article} do RGPD. O prazo de um mês previsto no artigo 12.º, n.º 3, do RGPD terminou sem resposta.

Solicito resposta com a maior brevidade. Na falta dela, reservo-me o direito de apresentar queixa à Comissão Nacional de Proteção de Dados (CNPD).

Com os melhores cumprimentos.`;
  pedido.followUpAt = new Date().toISOString();
  pedido.timeline.push({ to: 'follow_up', at: pedido.followUpAt });
  guardarEstado();
  enviarPedido(pedido, `Insistência: ${direito.subject}`, corpo);
  renderTudo();
}

function apagarRascunho(pedidoId) {
  estado.pedidos = estado.pedidos.filter((pedido) => !(pedido.id === pedidoId && pedido.status === 'draft'));
  guardarEstado();
  renderTudo();
}

function mudarEstado(pedido, novo) {
  pedido.status = novo;
  pedido.timeline.push({ to: novo, at: new Date().toISOString() });
  guardarEstado();
  renderTudo();
}

/* Prazo: um mês de calendário (artigo 12.º, n.º 3) + 3 dias de margem, na data local. */
function estimarPrazo(dataEnvioISO) {
  // Prazo de resposta: 30 dias depois do envio (um mês, artigo 12.º do RGPD)
  const prazo = new Date(dataEnvioISO);
  prazo.setDate(prazo.getDate() + 30);
  return dataLocalISO(prazo);
}

function diasAte(dataISO) {
  if (!dataISO) return null;
  const [ano, mes, dia] = dataISO.slice(0, 10).split('-').map(Number);
  const alvo = new Date(ano, mes - 1, dia);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return Math.round((alvo - hoje) / 86400000);
}

/* ==========================================================================
   Página de pedidos: em que estado está cada empresa a quem enviaste pedidos
   ========================================================================== */
function baldeDoPedido(pedido) {
  if (pedido.status === 'awaiting_confirmation') return 'espera';
  if (pedido.status === 'sent') return diasAte(pedido.dueDate) < 0 ? 'atraso' : 'espera';
  if (pedido.status === 'reply_received') {
    if (pedido.holdsData === true) return 'confirmado';
    if (pedido.holdsData === false) return 'resolvido';
    return 'espera';
  }
  if (pedido.status === 'closed') {
    if (pedido.closeReason === 'no_reply') return 'atraso';
    if (pedido.holdsData === true) return 'confirmado';
    return 'resolvido';
  }
  return null;
}

// O último pedido feito a uma empresa (os rascunhos não contam)
function ultimoPedidoDe(empresaId) {
  return estado.pedidos
    .filter((pedido) => pedido.companyId === empresaId && pedido.status !== 'draft')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] || null;
}

// O estado de uma empresa, para a cor do seu ícone. Vermelho se algo correu mal (um pedido sem resposta no prazo
// ou recusado, ou uma fuga de dados, burla ou multa nas Notícias); verde se o pedido está concluído;
// amarelo se está a decorrer. Senão, nada (o ícone fica neutro).
function estadoDaEmpresa(empresa, ultimo) {
  if (ultimo) return estadoDoPedido(ultimo);
  const noticia = empresa ? noticiasDaEmpresa(empresa)[0] : null;
  if (noticia) return { chave: 'atencao', texto: `${TIPOS_NOTICIA[noticia.tipo].label} em ${noticia.data.slice(0, 4)}` };
  return null;
}

// O estado de um pedido, com as mesmas cores no mapa, na lista e na página Pedidos
function estadoDoPedido(pedido) {
  const balde = baldeDoPedido(pedido);
  if (balde === 'atraso') return { chave: 'atencao', texto: 'O prazo do pedido terminou sem resposta' };
  if (pedido.outcome === 'company_refused') return { chave: 'atencao', texto: 'A empresa recusou o pedido' };
  if (balde === 'resolvido' || balde === 'confirmado') return { chave: 'concluido', texto: 'O pedido está concluído' };
  return { chave: 'pendente', texto: 'O pedido está a decorrer' };
}

// Só entram as empresas a quem foi enviado pelo menos um pedido (os rascunhos não contam).
function empresasComPedidos() {
  const mapa = new Map();
  estado.pedidos
    .filter((pedido) => pedido.status !== 'draft')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .forEach((pedido) => {
      if (!mapa.has(pedido.companyId)) {
        mapa.set(pedido.companyId, { id: pedido.companyId, name: pedido.companyName, sector: pedido.companySector || 'outros', balde: baldeDoPedido(pedido), ultimo: pedido });
      }
    });
  return [...mapa.values()];
}

function precisaDeAtencao(pedido) {
  return pedido.status === 'draft'
    || pedido.status === 'awaiting_confirmation'
    || (pedido.status === 'sent' && diasAte(pedido.dueDate) < 0)
    || (pedido.status === 'reply_received' && pedido.holdsData === null);
}

/* ==========================================================================
   Renderização
   ========================================================================== */
function vistaAtual() {
  const vista = location.hash.replace('#', '');
  return ['inicio', 'resultados', 'pedidos', 'noticias'].includes(vista) ? vista : 'inicio';
}

function renderTudo() {
  const vista = vistaAtual();
  document.querySelectorAll('[data-view]').forEach((secao) => secao.classList.toggle('hidden', secao.dataset.view !== vista));
  document.querySelectorAll('[data-nav]').forEach((link) => {
    const ativo = link.dataset.nav === vista;
    link.classList.toggle('text-lime', ativo);
    link.classList.toggle('text-slate-500', !ativo);
  });
  if (renderTudo.ultimaVista !== vista) {
    if (renderTudo.ultimaVista) registarPaginaVista(vista);
    window.scrollTo(0, 0);
    if (vista === 'resultados') animarMapa = true;
  }
  renderTudo.ultimaVista = vista;

  renderResumo();
  renderPlus(visiveis().reduce((soma, empresa) => soma + tempoPerdidoS(empresa), 0));
  renderPainel();
  renderPedidos();
  renderNoticias();
  if (vista === 'inicio') registarPlusVisto();
}

// Empresas dos resultados (e dos pedidos) a que uma notícia diz respeito
function empresasDaNoticia(noticia) {
  const dominios = new Set(noticia.dominios || []);
  return visiveis().filter((empresa) => dominios.has(empresa.domain)
    || [...dominios].some((dominio) => empresa.domain.endsWith(`.${dominio}`)));
}

function renderNoticias() {
  const minhas = NOTICIAS.filter((noticia) => empresasDaNoticia(noticia).length);
  document.getElementById('news-mine').innerHTML = minhas.length
    ? `<span class="mt-0.5 text-slate-300">${icone('marcador')}</span><span><span class="font-semibold text-white">${minhas.length} ${plural(minhas.length, 'notícia é', 'notícias são')} sobre empresas que tens:</span> ${esc([...new Set(minhas.map((noticia) => noticia.empresa))].join(', '))}.</span>`
    : '<span>Depois de analisares o teu email, marcamos aqui as notícias sobre empresas que têm os teus dados.</span>';

  // O guia: cada pergunta abre a resposta (fica aberta entre desenhos)
  const abertas = new Set([...document.querySelectorAll('#news-guide details[open]')].map((d) => d.dataset.guia));
  document.getElementById('news-guide').innerHTML = GUIA.map((item) => `
    <details data-guia="${item.id}" class="guia rounded-2xl border border-slate-800 bg-slate-900/60"${abertas.has(item.id) ? ' open' : ''}>
      <summary class="flex cursor-pointer items-center gap-3 px-4 py-3">
        <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink text-slate-200">${icone(item.icone, 'h-5 w-5')}</span>
        <span class="flex-1 text-sm font-semibold leading-5">${esc(item.pergunta)}</span>
        <svg viewBox="0 0 16 16" class="guia-seta h-4 w-4 shrink-0 text-slate-500 transition" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
      </summary>
      <div class="flex flex-col gap-2.5 px-4 pb-4 text-[0.8125rem] leading-5 text-slate-300">
        ${item.blocos.map((bloco) => (Array.isArray(bloco)
          ? `<ul class="flex flex-col gap-1.5">${bloco.map((linha) => `<li class="flex gap-2"><span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500"></span><span>${esc(linha)}</span></li>`).join('')}</ul>`
          : `<p>${esc(bloco)}</p>`)).join('')}
        ${item.acao ? `<p class="font-semibold text-lime">${esc(item.acao)}</p>` : ''}
        ${item.filtro ? `<button data-action="ver-casos" data-filter="${item.filtro[0]}" type="button" class="self-start text-xs font-semibold text-slate-200 underline decoration-slate-600 underline-offset-4">${esc(item.filtro[1])}</button>` : ''}
      </div>
    </details>`).join('');

  // Perguntas frequentes sobre a app (as abertas continuam abertas)
  const faqAbertas = new Set([...document.querySelectorAll('#faq-list details[open]')].map((d) => d.dataset.faq));
  document.getElementById('faq-list').innerHTML = FAQ.map((item) => `
    <details data-faq="${item.id}" class="guia rounded-2xl border border-slate-800 bg-slate-900/60"${faqAbertas.has(item.id) ? ' open' : ''}>
      <summary class="flex cursor-pointer items-center gap-3 px-4 py-3.5">
        <span class="flex-1 text-sm font-semibold leading-5">${esc(item.pergunta)}</span>
        <svg viewBox="0 0 16 16" class="guia-seta h-4 w-4 shrink-0 text-slate-500 transition" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
      </summary>
      <div class="flex flex-col gap-2.5 px-4 pb-4 text-[0.8125rem] leading-5 text-slate-300">
        ${item.blocos.map((bloco) => (Array.isArray(bloco)
          ? `<ul class="flex flex-col gap-1.5">${bloco.map((linha) => `<li class="flex gap-2"><span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500"></span><span>${esc(linha)}</span></li>`).join('')}</ul>`
          : `<p>${esc(bloco)}</p>`)).join('')}
        ${item.link ? `<a href="${esc(item.link[1])}" target="_blank" rel="noopener noreferrer" class="self-start text-xs font-semibold text-lime underline decoration-lime/40 underline-offset-4">${esc(item.link[0])} ↗</a>` : ''}
        ${item.acao ? `<button data-action="${item.acao[0]}" type="button" class="self-start text-xs font-semibold text-lime underline decoration-lime/40 underline-offset-4">${esc(item.acao[1])}</button>` : ''}
      </div>
    </details>`).join('');

  const filtros = [['todas', 'Todas'], ['minhas', `As minhas empresas · ${minhas.length}`], ['fuga', 'Fugas de dados'], ['multa', 'Multas'], ['fraude', 'Burlas']];
  document.getElementById('news-filters').innerHTML = filtros.map(([chave, texto]) => `
    <button data-action="filtro-noticias" data-filter="${chave}" type="button" class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${filtroNoticias === chave ? 'border-oliva bg-oliva text-ink' : 'border-slate-700 text-slate-300'}">${esc(texto)}</button>`).join('');

  const lista = NOTICIAS
    .filter((noticia) => filtroNoticias === 'todas' || (filtroNoticias === 'minhas' ? empresasDaNoticia(noticia).length : noticia.tipo === filtroNoticias))
    .sort((a, b) => b.data.localeCompare(a.data));
  document.getElementById('news-list').innerHTML = lista.length ? lista.map(criarCartaoNoticia).join('')
    : '<p class="rounded-xl border border-dashed border-slate-800 px-4 py-6 text-center text-xs text-mist">Nenhuma notícia sobre as tuas empresas, por agora.</p>';
  document.getElementById('news-updated').textContent = `Atualizado a ${formatarData(NOTICIAS_ATUALIZADAS)}. Resumos da equipa Veto: lê sempre a fonte.`;
}

function criarCartaoNoticia(noticia) {
  const tipo = TIPOS_NOTICIA[noticia.tipo];
  const afetadas = empresasDaNoticia(noticia);
  // Sem a empresa exata, ainda pode tocar-te pela área (por exemplo, outras apps de encontros)
  const areaComum = !afetadas.length && (noticia.setores || []).find((setor) => visiveis().some((empresa) => empresa.sector === setor));
  const dominio = noticia.fonte.url.replace(/^https?:\/\/(www\.)?/, '').split('/')[0];
  return `<article class="rounded-2xl border ${afetadas.length ? 'border-slate-600' : 'border-slate-800'} bg-slate-900/60 p-4">
    <div class="flex flex-wrap items-center gap-2 text-xs">
      <span class="rounded-full px-2 py-0.5 font-bold ${tipo.style}">${tipo.label}</span>
      ${noticia.estado === 'por_confirmar' ? '<span class="rounded-full bg-slate-700/60 px-2 py-0.5 font-bold text-slate-300">Por confirmar</span>' : ''}
      <span class="text-mist">${esc(noticia.empresa)} · ${formatarData(noticia.data)}</span>
    </div>
    <h3 class="mt-2 font-semibold leading-snug">${esc(noticia.titulo)}</h3>
    <p class="mt-1.5 text-xs leading-5 text-slate-300">${esc(noticia.resumo)}</p>
    <p class="mt-2 text-xs leading-5 text-mist"><span class="font-semibold text-slate-200">Porque importa:</span> ${esc(noticia.importa)}</p>
    ${afetadas.length ? `
      <div class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-ink/60 px-3 py-2">
        <span class="text-xs font-semibold text-slate-200">Tens dados nesta empresa</span>
        <button data-action="gerir" data-id="${esc(afetadas[0].id)}" type="button" class="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-ink">Ver a empresa →</button>
      </div>` : ''}
    ${areaComum ? `
      <div class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-ink/60 px-3 py-2">
        <span class="text-xs font-semibold text-slate-200">Tens empresas na área ${esc(SECTORS[areaComum].label)}</span>
        <button data-action="ver-area" data-sector="${areaComum}" type="button" class="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200">Ver a área →</button>
      </div>` : ''}
    <a href="${esc(noticia.fonte.url)}" target="_blank" rel="noopener noreferrer" data-action="abrir-fonte" data-id="${esc(noticia.id)}" class="mt-3 inline-block text-xs font-semibold text-lime underline decoration-lime/40 underline-offset-4">Ler em ${esc(noticia.fonte.nome)} (${esc(dominio)}) ↗</a>
  </article>`;
}

function visiveis() {
  return estado.empresas.filter((empresa) => !empresa.dismissed);
}

// Lista em português: "a, b e c"
function listaDeNomes(nomes) {
  return nomes.length > 1 ? `${nomes.slice(0, -1).join(', ')} e ${nomes[nomes.length - 1]}` : (nomes[0] || '');
}

// As empresas por sensibilidade: quantas há em cada nível e de que áreas são
function porSensibilidade(lista) {
  return SEVERITY_ORDER.map((chave) => {
    const empresas = lista.filter((empresa) => gravidadeDe(empresa).chave === chave).sort((a, b) => emailsDe(b) - emailsDe(a));
    const areas = SECTOR_ORDER.filter((setor) => empresas.some((empresa) => empresa.sector === setor));
    return { chave, n: empresas.length, areas, nomes: empresas.map((empresa) => empresa.name) };
  });
}

// O risco no resumo: um segundo número ao lado do total (as muito sensíveis, em vermelho forte)
// e uma frase simples por baixo dos níveis, a dizer por onde começar
function destaqueDeRisco(niveis) {
  const muito = niveis.find((nivel) => nivel.chave === 'critica');
  const alta = niveis.find((nivel) => nivel.chave === 'alta');
  const pedido = 'o Veto escreve por ti o pedido para apagarem os teus dados.';
  const areas = (nivel) => listaDeNomes(nivel.areas.map((setor) => SECTORS[setor].short.toLowerCase()));
  const nomes = (nivel) => (nivel.nomes.length > 3 ? `${nivel.nomes.slice(0, 3).join(', ')} e mais ${nivel.nomes.length - 3}` : listaDeNomes(nivel.nomes));
  const numero = (n, cor, texto) => `<div class="min-w-0 rounded-2xl px-4 py-3 ${cor === SEVERITY.critica.texto ? 'bg-risco' : 'border border-slate-700'}">
      <p class="font-display text-5xl font-semibold leading-none text-white">${n}</p>
      <p class="mt-2 text-sm leading-5 text-white">${texto}</p>
    </div>`;
  if (muito.n) {
    return {
      numero: numero(muito.n, SEVERITY.critica.texto, `${plural(muito.n, 'guarda', 'guardam')} dados <span class="font-semibold">muito sensíveis</span>`),
      frase: `Começa por ${plural(muito.n, 'essa', 'essas')} (${esc(areas(muito))}): ${esc(nomes(muito))}. Em cada uma, ${pedido}`
    };
  }
  if (alta.n) {
    return {
      numero: numero(alta.n, SEVERITY.alta.texto, `${plural(alta.n, 'guarda', 'guardam')} dados de sensibilidade <span class="font-semibold">alta</span>`),
      frase: `Nenhuma é de saúde, finanças ou encontros. Começa por ${esc(nomes(alta))}: ${pedido}`
    };
  }
  return { numero: '', frase: `Nenhuma guarda dados muito sensíveis. Ainda assim, todas têm, pelo menos, o teu email, e ${pedido}` };
}

// Resumo no Início: aparece no fim da análise, antes de abrir os resultados
function renderResumoInicio(lista) {
  const total = lista.length;
  const niveis = porSensibilidade(lista);
  const noticias = noticiasDasMinhasEmpresas();
  const comNoticias = [...new Set(noticias.map((noticia) => noticia.empresa))];
  const enviados = estado.pedidos.filter((pedido) => pedido.status !== 'draft').length;
  const emails = estado.emailsAnalisados ? ` · ${estado.emailsAnalisados} emails` : '';
  const origem = estado.demo ? 'Exemplo com dados simulados'
    : `${renderResumo.acabouDeAnalisar ? 'Análise concluída' : `Analisado ${descreverDia(estado.analisadoEm)}`}${emails}`;
  // Um nível por linha: as barras, o nível, as empresas (as que mais emails enviam primeiro) e quantas são
  const linhaNivel = ({ chave, n, nomes }) => `<li class="flex items-center gap-3 py-2 ${n ? '' : 'opacity-50'}">
      <span class="flex w-6 justify-center">${iconeGravidade(chave, 10)}</span>
      <span class="w-[5.25rem] shrink-0 text-sm font-semibold text-slate-100">${SEVERITY[chave].label}</span>
      <span class="min-w-0 flex-1 truncate text-xs text-slate-300">${esc(nomes.join(', '))}</span>
      <span class="w-8 shrink-0 text-right font-display text-lg font-semibold text-white">${n}</span>
    </li>`;
  const risco = destaqueDeRisco(niveis);
  const comNoticiasCurto = comNoticias.length > 3 ? `${comNoticias.slice(0, 3).join(', ')} e mais ${comNoticias.length - 3}` : listaDeNomes(comNoticias);
  document.getElementById('home-summary').innerHTML = `
    <p class="flex items-center gap-1.5 text-xs font-semibold text-slate-300">${estado.demo ? '' : `<span class="text-lime">${icone('visto', 'h-4 w-4')}</span>`}${esc(origem)}</p>
    <h2 id="home-summary-total" class="sr-only">${total} ${plural(total, 'empresa tem', 'empresas têm')} provavelmente os teus dados</h2>
    <!-- Dois números lado a lado: quantas empresas (verde-lima, a cor do Veto) e quantas guardam dados muito sensíveis (vermelho) -->
    <div class="mt-4 grid grid-cols-2 gap-4">
      <div class="min-w-0">
        <p class="font-display text-5xl font-semibold leading-none text-lime">${total}</p>
        <p class="mt-2 text-sm leading-5 text-slate-100"><span class="font-semibold">${plural(total, 'empresa', 'empresas')}</span> ${total === 1 ? 'tem' : 'têm'} provavelmente os teus dados</p>
      </div>
      ${risco.numero}
    </div>

    <h3 class="mt-6 text-sm font-semibold text-white">Sensibilidade dos dados que guardam</h3>
    <div class="mt-2.5">${barraDeSensibilidade(niveis)}</div>
    <ul class="mt-2 divide-y divide-slate-800 border-b border-slate-800">${niveis.map(linhaNivel).join('')}</ul>
    <p class="mt-4 text-sm leading-6 text-slate-200">${risco.frase}</p>
    ${noticias.length ? `<p class="mt-3 flex gap-2.5 text-sm leading-6 text-slate-200"><span class="mt-1 shrink-0 text-slate-300">${icone('jornal', 'h-4 w-4')}</span>
      <span>${noticias.length} ${plural(noticias.length, 'notícia envolve', 'notícias envolvem')} empresas tuas: ${esc(comNoticiasCurto)}.</span></p>` : ''}

    <a href="#resultados" class="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-lime px-4 py-3.5 text-[0.9375rem] font-bold text-ink transition hover:brightness-95 active:scale-[.98]">Ver ${total === 1 ? 'a empresa' : `as ${total} empresas`}</a>
    ${enviados ? `<a href="#pedidos" class="mt-2 flex w-full items-center justify-between rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-100"><span>Os teus pedidos <span class="text-slate-300">(${enviados})</span></span>${icone('seta', 'h-4 w-4')}</a>` : ''}
    <button data-action="nova-analise" class="mt-4 w-full text-xs font-semibold text-slate-300 underline decoration-slate-600 underline-offset-4" type="button">Analisar de novo</button>`;
}

function renderResumo() {
  renderTeste();
  const lista = visiveis();
  const atencao = estado.pedidos.filter(precisaDeAtencao).length;
  const analisado = Boolean(estado.analisadoEm);
  document.getElementById('intro-panel').classList.toggle('hidden', analisado && !renderResumo.novaAnalise);
  document.getElementById('home-summary').classList.toggle('hidden', !analisado || renderResumo.novaAnalise);
  // Com resultados, o título do Início fica mais pequeno no telemóvel: o resumo é o que importa
  const titulo = document.getElementById('inicio-titulo');
  titulo.classList.toggle('max-lg:text-2xl', analisado && !renderResumo.novaAnalise);
  document.getElementById('feedback-panel').classList.toggle('hidden', !analisado);
  if (analisado) renderResumoInicio(lista);

  const badge = document.getElementById('nav-badge');
  badge.textContent = atencao;
  badge.classList.toggle('hidden', atencao === 0);
}

// Resultados: uma linha de resumo, os três separadores e a coluna da empresa aberta
function renderPainel() {
  const lista = visiveis();
  const temEmpresas = estado.empresas.length > 0;
  // Sem empresas, no computador não há coluna da empresa
  document.getElementById('res-grelha').classList.toggle('lg:grid', temEmpresas);
  document.getElementById('painel-empresa').classList.toggle('lg:hidden', !temEmpresas);
  document.getElementById('results-empty').classList.toggle('hidden', temEmpresas);
  document.getElementById('results-content').classList.toggle('hidden', !temEmpresas);
  if (!temEmpresas) {
    selecaoMapa = null;
    renderPainelEmpresa();
    return;
  }
  if (!MODOS_RESULTADOS.some((item) => item.modo === modoResultados)) modoResultados = 'lista';

  // Uma linha só, por baixo do título: o resumo completo está no Início
  document.getElementById('res-resumo').textContent = `${lista.length} ${plural(lista.length, 'empresa', 'empresas')}${estado.demo ? ' (exemplo com dados simulados)' : estado.emailsAnalisados ? `, segundo os teus últimos ${estado.emailsAnalisados} emails` : ''}.`;
  const lote = document.getElementById('res-lote');
  lote.classList.toggle('hidden', lista.length < 2);
  lote.innerHTML = lista.length >= 2 ? `<button data-action="lote" data-onde="resultados" type="button" class="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-200 underline decoration-slate-600 underline-offset-4">Pedir o mesmo a várias empresas ${SELO_PLUS}</button>` : '';

  // Separadores
  document.getElementById('res-abas').innerHTML = MODOS_RESULTADOS.map(({ modo, label, icone: nomeIcone }) => {
    const ativo = modo === modoResultados;
    return `<button data-action="modo-resultados" data-modo="${modo}" type="button" role="tab" aria-selected="${ativo}"
      class="flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition lg:flex-none lg:px-4 ${ativo ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'}">
      ${icone(nomeIcone, 'h-4 w-4 max-sm:hidden')}<span class="whitespace-nowrap">${label}</span></button>`;
  }).join('');
  MODOS_RESULTADOS.forEach(({ modo }) => document.getElementById(`res-${modo}`).classList.toggle('hidden', modo !== modoResultados));

  // A distribuição pela sensibilidade, com a legenda das cores (o mapa tem a sua)
  const niveis = porSensibilidade(lista);
  document.getElementById('res-legenda').innerHTML = modoResultados !== 'mapa'
    ? `${barraDeSensibilidade(niveis, 'h-2')}<p class="mt-2 flex flex-wrap gap-x-3.5 gap-y-1 text-xs text-slate-300"><span class="font-semibold text-slate-200 max-sm:sr-only">Sensibilidade:</span>${legendaDeSensibilidade(niveis)}</p>` : '';

  // Explicação
  document.getElementById('kind-legend').innerHTML = `
    <p>Olhamos só para quem te enviou emails, o assunto e a data. Cada empresa fica numa área (estimada pelo nome, quando não está no nosso catálogo) e numa de quatro categorias:</p>
    ${KIND_ORDER.map((chave) => `<p><span class="mr-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold ${KINDS[chave].style}">${KINDS[chave].label}</span>${esc(KINDS[chave].help)}</p>`).join('')}
    <p>A sensibilidade vem da área: dados de saúde, finanças ou encontros são os mais sensíveis. Se só recebes publicidade, desce um nível.</p>
    <p>Se uma empresa não for tua, abre-a e escolhe "Não tenho dados aqui".</p>`;

  escolherPorOmissao(lista);
  if (modoResultados === 'lista') renderEmpresas();
  if (modoResultados === 'areas') renderAreas();
  if (modoResultados === 'mapa' && vistaAtual() === 'resultados') renderMapa();
  renderPainelEmpresa();
}

function ecraGrande() {
  return window.matchMedia('(min-width: 1024px)').matches;
}

function emailsDe(empresa) {
  return empresa.evidence?.totalRecebidos ?? empresa.evidence?.count ?? 0;
}

function ordemDaLista(a, b) {
  if (ordemLista === 'emails') return emailsDe(b) - emailsDe(a) || a.name.localeCompare(b.name);
  return SEVERITY_ORDER.indexOf(gravidadeDe(a).chave) - SEVERITY_ORDER.indexOf(gravidadeDe(b).chave) || emailsDe(b) - emailsDe(a) || a.name.localeCompare(b.name);
}

// No computador, o painel ao lado já mostra a primeira empresa da Lista (ou da área escolhida),
// com as notícias que justificam a gravidade. No telemóvel não: a folha taparia a lista.
function escolherPorOmissao(lista) {
  const cabe = ecraGrande() && ['lista', 'areas'].includes(modoResultados);
  if (selecaoMapa?.auto && !cabe) selecaoMapa = null;
  if (selecaoMapa || !cabe || !lista.length) return;
  const daVista = modoResultados === 'areas' && filtroSetor !== 'todos' ? lista.filter((empresa) => empresa.sector === filtroSetor) : lista;
  const primeira = [...(daVista.length ? daVista : lista)].sort(ordemDaLista)[0];
  if (primeira) selecaoMapa = { tipo: 'empresa', chave: primeira.id, auto: true };
}

// Notícias que falam de empresas encontradas na análise
function noticiasDasMinhasEmpresas() {
  return NOTICIAS.filter((noticia) => empresasDaNoticia(noticia).length).sort((a, b) => b.data.localeCompare(a.data));
}

function mudarModoResultados(modo) {
  if (!MODOS_RESULTADOS.some((item) => item.modo === modo)) modo = 'lista';
  if (modo !== modoResultados) registarEvento('resultados_vista', { modo });
  modoResultados = modo;
  if (modo === 'mapa') animarMapa = true;
  if (vistaAtual() !== 'resultados') {
    location.hash = '#resultados';
    return;
  }
  renderPainel();
}

// Lista: todas as empresas numa linha cada, as mais sensíveis primeiro (ou as que mais emails enviam)
function renderEmpresas() {
  if (!estado.empresas.length) return;
  const container = document.getElementById('companies-container');
  const query = document.getElementById('search-input').value.toLowerCase();
  const lista = visiveis();
  const filtradas = lista
    .filter((empresa) => filtroTipo === 'todas' || tiposDe(empresa).includes(filtroTipo))
    .filter((empresa) => `${empresa.name} ${empresa.domain} ${SECTORS[empresa.sector]?.label || ''}`.toLowerCase().includes(query))
    .sort(ordemDaLista);

  // Dois menus em vez de uma fila de botões
  const filtro = document.getElementById('filtro-tipo');
  filtro.innerHTML = [['todas', `Todas (${lista.length})`], ...KIND_ORDER.map((chave) => [chave, `${KINDS[chave].filtro} (${lista.filter((empresa) => tiposDe(empresa).includes(chave)).length})`])]
    .map(([chave, texto]) => `<option value="${chave}">${esc(texto)}</option>`).join('');
  filtro.value = filtroTipo;
  document.getElementById('ordem-lista').value = ordemLista;

  const caixa = (linhas) => `<div class="divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30">${linhas}</div>`;
  if (!filtradas.length) {
    container.innerHTML = caixa('<p class="px-4 py-8 text-center text-sm text-slate-300">Nenhuma empresa encontrada.</p>');
  } else if (ordemLista !== 'gravidade') {
    container.innerHTML = caixa(filtradas.map(linhaEmpresa).join(''));
  } else {
    // Por sensibilidade, para a lista não ficar enorme: as mais sensíveis abertas (até LIMITE_GRUPO),
    // a média e a baixa fechadas. Com pesquisa ou filtro, tudo aberto.
    const tudoAberto = Boolean(query) || filtroTipo !== 'todas';
    const escolhida = selecaoMapa?.tipo === 'empresa' && !selecaoMapa.auto ? selecaoMapa.chave : null;
    container.innerHTML = SEVERITY_ORDER.map((chave) => {
      const empresas = filtradas.filter((empresa) => gravidadeDe(empresa).chave === chave);
      if (!empresas.length) return '';
      const g = SEVERITY[chave];
      const aberto = tudoAberto || gruposAbertos.has(chave) || empresas.some((empresa) => empresa.id === escolhida);
      const titulo = `<span class="flex items-center gap-2">${iconeGravidade(chave, 10)}<span class="text-sm font-semibold ${g.texto}">Sensibilidade ${g.label.toLowerCase()}</span><span class="text-sm text-slate-300">· ${empresas.length}</span></span>`;
      if (!aberto) {
        return `<button data-action="abrir-grupo" data-grupo="${chave}" type="button" aria-expanded="false"
          class="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-900/30 px-4 py-3.5 text-left transition first:mt-0 hover:border-slate-600">
          ${titulo}<span class="flex items-center gap-1 text-xs font-semibold text-slate-200">Mostrar <svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg></span>
        </button>`;
      }
      const completo = tudoAberto || gruposCompletos.has(chave) || empresas.length <= LIMITE_GRUPO + 1;
      const visiveisGrupo = completo ? empresas : empresas.slice(0, LIMITE_GRUPO);
      const resto = empresas.length - visiveisGrupo.length;
      const fechar = !tudoAberto && !['critica', 'alta'].includes(chave)
        ? `<button data-action="fechar-grupo" data-grupo="${chave}" type="button" aria-expanded="true" class="text-xs font-semibold text-slate-300">Esconder</button>` : '';
      return `<section class="mt-5 first:mt-0">
        <h3 class="mb-2 flex items-center justify-between gap-3 px-1">${titulo}${fechar}</h3>
        ${caixa(visiveisGrupo.map(linhaEmpresa).join('') + (resto ? `<button data-action="mais-grupo" data-grupo="${chave}" type="button" class="flex w-full items-center justify-center gap-1 px-4 py-3 text-xs font-semibold text-slate-200 hover:bg-slate-800/40">Ver mais ${resto} ${plural(resto, 'empresa', 'empresas')}</button>` : ''))}
      </section>`;
    }).join('');
  }

  const descartadas = estado.empresas.length - lista.length;
  const linha = document.getElementById('dismissed-row');
  linha.classList.toggle('hidden', descartadas === 0);
  linha.innerHTML = descartadas ? `<button data-action="repor-descartadas" type="button" class="text-xs font-semibold text-slate-500 underline decoration-slate-700 underline-offset-4">Repor ${descartadas} ${descartadas === 1 ? 'empresa descartada' : 'empresas descartadas'}</button>` : '';
}

// Uma empresa numa linha simples: o nome, a área e a sensibilidade. As notícias e os pedidos estão na empresa.
function linhaEmpresa(empresa) {
  const ev = empresa.evidence || {};
  const setor = SECTORS[empresa.sector] || SECTORS.outros;
  const gravidade = gravidadeDe(empresa).chave;
  const recebidos = ev.totalRecebidos ?? ev.count ?? 0;
  const ultimo = ultimoPedidoDe(empresa.id);
  const situacao = estadoDaEmpresa(empresa, ultimo);
  const aberta = selecaoMapa?.tipo === 'empresa' && selecaoMapa.chave === empresa.id;
  const tipos = tiposDe(empresa).map((chave) => KINDS[chave].label).join(', ');
  return `<button data-action="abrir-empresa" data-id="${esc(empresa.id)}" type="button" aria-current="${aberta}" aria-label="${esc(empresa.name)}: sensibilidade ${SEVERITY[gravidade].label.toLowerCase()}${situacao ? `. ${esc(situacao.texto)}` : ''}. Abrir"
    class="flex w-full items-center gap-3 px-4 py-3 text-left transition ${aberta ? 'bg-slate-800/70' : 'hover:bg-slate-800/40'}">
    <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${situacao ? `${ESTADOS_EMPRESA[situacao.chave].fundo} text-white` : 'bg-slate-800 text-slate-100'}"${situacao ? ` title="${esc(situacao.texto)}"` : ''}>${esc(empresa.icon)}</span>
    <span class="min-w-0 flex-1">
      <span class="block truncate text-sm font-semibold">${esc(empresa.name)}</span>
      <span class="mt-0.5 block truncate text-xs text-mist">${esc(setor.short)} · ${esc(tipos)} · ≈ ${recebidos} ${plural(recebidos, 'email', 'emails')}</span>
      ${ultimo ? `<span class="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-200"><span class="truncate">${esc(RIGHTS[ultimo.right].short)}: ${esc(descreverPedido(ultimo))}</span></span>`
        : situacao ? `<span class="mt-1 flex items-center gap-1.5 truncate text-xs text-slate-200"><span class="truncate">${esc(situacao.texto)}</span></span>` : ''}
      ${empresa.unsubscribedAt ? '<span class="mt-1 block text-xs text-slate-400">Subscrição cancelada</span>' : ''}
    </span>
    <span class="flex shrink-0 items-center gap-1.5 text-xs font-semibold ${SEVERITY[gravidade].texto}">${iconeGravidade(gravidade)}<span class="hidden w-[4.5rem] sm:inline">${SEVERITY[gravidade].label}</span></span>
    <span class="shrink-0 text-slate-600">${icone('seta', 'h-4 w-4')}</span>
  </button>`;
}

// Por área: um mosaico por área e, por baixo, as empresas da área escolhida (ou de todas, agrupadas)
function renderAreas() {
  const lista = visiveis();
  const areas = SECTOR_ORDER
    .map((chave) => ({ chave, empresas: lista.filter((empresa) => empresa.sector === chave) }))
    .filter((area) => area.empresas.length)
    .sort((a, b) => SEVERITY_ORDER.indexOf(SECTORS[a.chave].gravidade) - SEVERITY_ORDER.indexOf(SECTORS[b.chave].gravidade) || (b.empresas.length - a.empresas.length));
  if (filtroSetor !== 'todos' && !areas.some((area) => area.chave === filtroSetor)) filtroSetor = 'todos';
  document.getElementById('sector-grid').innerHTML = areas.map(({ chave, empresas }) => {
    const setor = SECTORS[chave];
    const ativo = filtroSetor === chave;
    return `<button data-action="setor" data-sector="${chave}" type="button" aria-pressed="${ativo}"
      aria-label="${esc(setor.label)}: ${empresas.length} ${plural(empresas.length, 'empresa', 'empresas')}, gravidade ${SEVERITY[setor.gravidade].label.toLowerCase()}"
      class="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition ${ativo ? 'border-slate-500 bg-slate-800/70' : 'border-slate-800 hover:border-slate-600'}">
      <span class="text-slate-300">${icone(chave, 'h-5 w-5')}</span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-semibold">${esc(setor.short)}</span>
        <span class="block">${seloGravidade(setor.gravidade, '')}</span>
      </span>
      <span class="font-display text-xl font-semibold">${empresas.length}</span>
    </button>`;
  }).join('');

  const ordenar = (empresas) => [...empresas].sort((a, b) => SEVERITY_ORDER.indexOf(gravidadeDe(a).chave) - SEVERITY_ORDER.indexOf(gravidadeDe(b).chave)
    || (b.evidence?.totalRecebidos ?? 0) - (a.evidence?.totalRecebidos ?? 0));
  const grupo = ({ chave, empresas }, comExplicacao) => `
    <h3 class="mt-6 flex items-center gap-2 text-sm font-semibold text-slate-200 first:mt-0"><span class="text-slate-400">${icone(chave, 'h-4 w-4')}</span>${esc(SECTORS[chave].label)} <span class="font-normal text-mist">· ${empresas.length}</span></h3>
    ${comExplicacao ? `<p class="mt-1.5 text-xs leading-5 text-mist">${esc(SECTORS[chave].porque)}</p>` : ''}
    <div class="mt-2 divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/30">${ordenar(empresas).map(linhaEmpresa).join('')}</div>`;
  const escolhida = areas.find((area) => area.chave === filtroSetor);
  document.getElementById('area-lista').innerHTML = escolhida
    ? `${grupo(escolhida, true)}<button data-action="setor" data-sector="todos" type="button" class="mt-4 text-xs font-semibold text-lime">Ver todas as áreas</button>`
    : areas.map((area) => grupo(area, false)).join('');
}

// Mapa: só se desenha quando o separador está à vista (precisa da largura real)
function renderMapa() {
  const nos = nosDoMapa();
  if (!nos.length) return;
  const rede = construirRede(nos);
  validarSelecao(nos, rede);
  document.getElementById('dot-map').innerHTML = desenharRede(rede);
  aplicarZoom();
  animarMapa = false;
  document.getElementById('map-legend').innerHTML = legendaDaRede(rede);
}

// A escolha pode deixar de existir (empresa descartada, análise nova...)
function validarSelecao(nos, rede) {
  if (!selecaoMapa) return;
  const existe = {
    empresa: () => nos.some((no) => no.id === selecaoMapa.chave),
    setor: () => nos.some((no) => no.sector === selecaoMapa.chave),
    terceiro: () => rede.terceiros.some((t) => t.id === selecaoMapa.chave)
  }[selecaoMapa.tipo];
  if (!existe || !existe()) selecaoMapa = null;
}

// A empresa aberta: coluna ao lado no computador; no telemóvel, um ecrã próprio com «Resultados» para voltar
function renderPainelEmpresa() {
  const painel = document.getElementById('painel-empresa');
  const nos = nosDoMapa();
  const rede = construirRede(nos);
  validarSelecao(nos, rede);
  const aberto = Boolean(selecaoMapa) && nos.length > 0;
  // "Mais opções" continua aberto se se voltar a desenhar a mesma empresa
  const mais = painel.querySelector('details[data-mais]');
  renderPainelEmpresa.maisAberto = mais?.open ? mais.dataset.mais : null;
  painel.innerHTML = nos.length ? detalheDoMapa(nos, rede) : '';
  painel.classList.toggle('max-lg:hidden', !aberto);
  // Com a empresa aberta no telemóvel, a página por trás não se mexe
  document.body.classList.toggle('max-lg:overflow-hidden', aberto && vistaAtual() === 'resultados');
  const assinatura = JSON.stringify(selecaoMapa);
  if (renderPainelEmpresa.ultima !== assinatura) {
    painel.scrollTop = 0;
    if (aberto && !ecraGrande()) {
      painel.classList.remove('painel-entra');
      void painel.offsetWidth; // recomeça a animação
      painel.classList.add('painel-entra');
      painel.focus({ preventScroll: true });
    }
  }
  renderPainelEmpresa.ultima = assinatura;
}

function abrirEmpresa(empresaId) {
  if (!obterEmpresa(empresaId) && !estado.pedidos.some((pedido) => pedido.companyId === empresaId)) return;
  const nova = !(selecaoMapa?.tipo === 'empresa' && selecaoMapa.chave === empresaId && !selecaoMapa.auto);
  selecaoMapa = { tipo: 'empresa', chave: empresaId };
  if (nova) registarEmpresaAberta(empresaId);
  if (modoResultados === 'noticias') modoResultados = 'lista';
  if (vistaAtual() !== 'resultados') location.hash = '#resultados';
  else renderPainel();
}

function fecharPainelEmpresa() {
  selecaoMapa = null;
  renderPainel();
}

function registarEmpresaAberta(empresaId) {
  const empresa = obterEmpresa(empresaId);
  registarEvento('empresa_aberta', { modo: modoResultados, area: empresa?.sector || 'outros', gravidade: gravidadeDe(empresa || { sector: 'outros' }).chave });
}

// "Porquê esta empresa?": o que encontrámos na caixa, o que estas empresas costumam guardar e a área.
// O assunto do email só existe logo a seguir à análise (não fica guardado); a data fica.
function ocultarCodigos(texto) {
  return String(texto).replace(/\d[\d\s-]{2,}\d/g, '•••');
}

// Uma empresa pode ser de vários tipos ao mesmo tempo (conta, compras e newsletter)
function tiposDe(empresa) {
  const tipos = empresa.evidence?.kinds?.length ? empresa.evidence.kinds : [empresa.kind || 'unknown'];
  return KIND_ORDER.filter((chave) => tipos.includes(chave));
}

function porqueEstaEmpresa(empresa) {
  const ev = empresa.evidence || {};
  const setor = SECTORS[empresa.sector] || SECTORS.outros;
  const recebidos = ev.totalRecebidos ?? ev.count ?? 0;
  const dominios = (empresa.domains?.length ? empresa.domains : [empresa.domain]).join(', ');
  // Se o email que deu a pista for o último, não se repete a data
  const eOUltimo = ev.sampleDate && ev.lastDate && formatarData(ev.sampleDate) === formatarData(ev.lastDate);
  const qual = eOUltimo ? 'O último' : 'Um deles';
  const exemplo = `${ev.sampleSubject ? `: «${esc(ocultarCodigos(ev.sampleSubject))}»` : ''}${ev.sampleDate && !eOUltimo ? `, de ${formatarData(ev.sampleDate)}` : ''}`;
  const sinal = {
    likely_account: `${qual} é de boas-vindas, registo ou palavra-passe${exemplo}. Por isso, deves ter conta.`,
    purchase: `${qual} é um recibo, fatura ou encomenda${exemplo}. Por isso, deves ter comprado lá.`,
    newsletter: 'São publicidade, com promoções ou novidades: estás na lista de marketing.',
    unknown: 'Nenhum indica conta, compra ou marketing. Confirma se a empresa é tua.'
  }[empresa.kind] || '';
  const linha = (titulo, texto) => `<div><dt class="font-semibold text-slate-300">${titulo}</dt><dd class="mt-0.5">${texto}</dd></div>`;
  return `<dl class="mt-2 space-y-2">
    ${linha('O que encontrámos', `Recebeste ≈ ${recebidos} ${plural(recebidos, 'email', 'emails')} de ${esc(dominios)}${ev.lastDate ? `, o último a ${formatarData(ev.lastDate)}` : ''}.${ev.enviados ? ` Escreveste-lhes ${ev.enviados} ${plural(ev.enviados, 'vez', 'vezes')}.` : ''}${empresa.sentVia ? ` Chegam através de ${esc(empresa.sentVia)}, uma plataforma de envio de emails.` : ''} ${sinal}`)}
    ${linha('O que costumam guardar', O_QUE_GUARDAM[empresa.kind] || O_QUE_GUARDAM.unknown)}
    ${linha('Área', `${esc(setor.label)}${empresa.sectorEstimated ? ' (estimada pelo nome)' : ''}. ${esc(setor.porque || '')}`)}
  </dl>`;
}

function irParaMapa(empresaId) {
  abrirEmpresa(empresaId);
}

// Cancelar a subscrição não apaga os dados: a app diz isso antes e depois.
function cancelarSubscricao(empresaId) {
  const empresa = obterEmpresa(empresaId);
  if (!empresa?.unsubscribe) return;
  abrirFolha({
    titulo: `Cancelar a subscrição da ${empresa.name}?`,
    texto: `Deixas de receber os emails de marketing, mas a ${empresa.name} continua a guardar os teus dados. Para os apagar, faz um pedido de apagamento.`,
    opcoes: [
      { label: 'Cancelar subscrição', estilo: 'primary', acao: () => abrirCancelamento(empresa) },
      { label: 'Pedir que apaguem os meus dados', estilo: 'secondary', acao: () => prepararPedido(empresa.id, 'erasure') },
      { label: 'Agora não', estilo: 'ghost', acao: () => {} }
    ]
  });
}

function abrirCancelamento(empresa) {
  const link = empresa.unsubscribe;
  const porEmail = /^mailto:/i.test(link);
  if (/^https:\/\//i.test(link)) {
    const janela = window.open(link, '_blank');
    if (janela) janela.opener = null;
  } else if (porEmail) {
    const [para, consulta] = link.slice(7).split('?');
    const parametros = new URLSearchParams(consulta || '');
    abrirEmail(decodeURIComponent(para), parametros.get('subject') || 'Unsubscribe', parametros.get('body') || 'Unsubscribe');
  } else if (link === 'exemplo') {
    mostrarToast('No exemplo não abrimos nenhum link de cancelamento.');
  }
  empresa.unsubscribedAt = new Date().toISOString();
  guardarEstado();
  renderTudo();
  registarEvento('subscricao_cancelada', { area: empresa.sector, gravidade: gravidadeDe(empresa).chave, demo: estado.demo });
  if (porEmail) return; // a escolha da app de email já está no ecrã
  abrirFolha({
    titulo: 'Subscrição cancelada',
    texto: `A ${empresa.name} deixa de te enviar marketing, mas os teus dados continuam lá. Queres pedir que os apague?`,
    opcoes: [
      { label: 'Pedir que apaguem os meus dados', estilo: 'primary', acao: () => prepararPedido(empresa.id, 'erasure') },
      { label: 'Agora não', estilo: 'ghost', acao: () => {} }
    ]
  });
}

// De onde vem o contacto de privacidade, em texto simples
function descreverContacto(empresa) {
  const formulario = empresa.privacyForm ? empresa.privacyForm.replace(/^https?:\/\/(www\.)?/, '').split(/[/?#]/)[0] : '';
  if (empresa.contactExample) return `Contacto de exemplo: ${empresa.dpo_email}.`;
  if (empresa.contactVerifiedAt) {
    const quando = formatarData(empresa.contactVerifiedAt.slice(0, 10));
    const canal = empresa.dpo_email
      ? `${empresa.dpo_email}${formulario ? ` (ou o formulário em ${formulario})` : ''}`
      : `formulário oficial em ${formulario}`;
    const fonte = empresa.contactOrigin === 'datenanfragen'
      ? `registado na base de dados Datenanfragen.de, atualizada a ${quando}`
      : `verificado pela equipa do Veto a ${quando}`;
    return `Contacto publicado pela empresa, ${fonte}: ${canal}.${empresa.contactNotes ? ` ${empresa.contactNotes}` : ''}`;
  }
  if (empresa.contactUser && empresa.dpo_email) return `Contacto indicado por ti: ${empresa.dpo_email}.`;
  return 'Ainda não temos um contacto verificado para esta empresa. Antes do pedido, confirmas o email na política de privacidade dela.';
}

function mostrarMaisOpcoes(empresaId) {
  const empresa = obterEmpresa(empresaId);
  if (!empresa) return;
  abrirFolha({
    titulo: empresa.name,
    texto: descreverContacto(empresa),
    opcoes: [
      { label: RIGHTS.erasure.label, estilo: 'secondary', acao: () => prepararPedido(empresa.id, 'erasure') },
      { label: RIGHTS.objection.label, estilo: 'secondary', acao: () => prepararPedido(empresa.id, 'objection') },
      { label: 'Não tenho dados aqui', estilo: 'secondary', acao: () => definirDescartada(empresa.id, true) },
      { label: 'Cancelar', estilo: 'ghost', acao: () => {} }
    ]
  });
}

function renderPedidos() {
  const temPedidos = estado.pedidos.length > 0;
  const entradaLote = document.getElementById('lote-entrada');
  entradaLote.classList.toggle('hidden', visiveis().length < 2);
  entradaLote.classList.toggle('inline-flex', visiveis().length >= 2);
  document.getElementById('no-requests').classList.toggle('hidden', temPedidos);
  document.querySelector('#no-requests [data-action="lote"]').classList.toggle('hidden', visiveis().length < 2);
  document.getElementById('requests-section').classList.toggle('hidden', !temPedidos);
  if (!temPedidos) return;

  const pedidos = [...estado.pedidos];
  const concluido = (pedido) => pedido.status === 'closed' || (pedido.status === 'reply_received' && pedido.holdsData !== null);
  // À espera: os que precisam de uma ação tua primeiro, depois pelo prazo
  const espera = pedidos.filter((pedido) => !concluido(pedido))
    .sort((a, b) => precisaDeAtencao(b) - precisaDeAtencao(a) || (a.dueDate || '9').localeCompare(b.dueDate || '9'));
  const concluidos = pedidos.filter(concluido)
    .sort((a, b) => (b.closedAt || b.replyAt || '').localeCompare(a.closedAt || a.replyAt || ''));

  preencherGrupo('group-waiting', espera, 'Nenhum pedido à espera de resposta.');
  preencherGrupo('group-done', concluidos, 'Ainda nenhum pedido concluído.');
}

function preencherGrupo(id, pedidos, vazio) {
  const lista = document.querySelector(`#${id} > div`);
  lista.innerHTML = pedidos.length ? pedidos.map(criarCartaoPedido).join('') : `<p class="rounded-xl border border-dashed border-slate-800 px-4 py-4 text-center text-xs text-mist">${vazio}</p>`;
}

/* ==========================================================================
   Mapa de exposição: as empresas agrupadas por área, cada área em espiral.
   Cabe qualquer número de empresas; com zoom aparecem os nomes.
   Ao tocar numa empresa, aparecem à volta dela:
   - Terceiros: serviços que tratam os teus dados por conta da empresa (por exemplo, o
     Mailchimp, que lhe envia os emails). Vêm do link de cancelamento dos emails.
   - Fugas e burlas conhecidas que a envolvem (das Notícias)
   ========================================================================== */
function dominioRegistavel(host) {
  const partes = String(host || '').toLowerCase().replace(/^www\./, '').replace(/\.$/, '').split('.').filter(Boolean);
  if (partes.length < 2) return partes.join('.');
  const duplos = ['com.pt', 'org.pt', 'gov.pt', 'co.uk', 'org.uk', 'com.br', 'com.es', 'com.au', 'co.jp'];
  return partes.length >= 3 && duplos.includes(partes.slice(-2).join('.')) ? partes.slice(-3).join('.') : partes.slice(-2).join('.');
}

// Se o link de cancelamento for de outro domínio, é esse serviço que envia os emails pela empresa
function terceiroDe(empresa) {
  const link = empresa?.unsubscribe || '';
  let host = '';
  if (/^https:\/\//i.test(link)) {
    try { host = new URL(link).hostname; } catch (erro) { return null; }
  } else if (/^mailto:/i.test(link)) {
    host = link.slice(7).split('?')[0].split('@')[1] || '';
  }
  const dominio = dominioRegistavel(host);
  const proprio = dominioRegistavel(empresa.domain);
  if (!dominio.includes('.') || dominio === proprio) return null;
  // A mesma marca noutro domínio (vinted.pt e vinted.com) não é um terceiro
  if (dominio.split('.')[0] === proprio.split('.')[0]) return null;
  return { id: `t:${dominio}`, dominio, nome: TERCEIROS[dominio] || dominio };
}

// Todas as notícias sobre a empresa (fugas, burlas e multas), da mais recente para a mais antiga
function noticiasDaEmpresa(empresa) {
  if (!empresa?.domain) return [];
  return NOTICIAS.filter((noticia) => (noticia.dominios || []).some((dominio) => empresa.domain === dominio || empresa.domain.endsWith(`.${dominio}`)))
    .sort((a, b) => b.data.localeCompare(a.data));
}

// A área de uma notícia: a que vem escrita nela ou, se não vier, a da empresa de que fala
function areaDaNoticia(noticia) {
  return noticia.setores?.[0] || estimarSetor(noticia.dominios?.[0] || '', noticia.empresa);
}

// Casos noutras empresas da mesma área: mostram porque é que a área é grave quando a empresa não tem notícias
function noticiasDaArea(empresa) {
  if (!empresa?.sector || empresa.sector === 'outros') return [];
  const proprias = new Set(noticiasDaEmpresa(empresa));
  return NOTICIAS.filter((noticia) => !proprias.has(noticia) && ((noticia.setores || []).includes(empresa.sector) || areaDaNoticia(noticia) === empresa.sector))
    .sort((a, b) => b.data.localeCompare(a.data));
}

// Fugas e burlas das Notícias que envolvem a empresa (as multas ficam de fora)
function incidentesDe(empresa) {
  if (!empresa?.domain) return [];
  return NOTICIAS.filter((noticia) => ['fuga', 'fraude'].includes(noticia.tipo)
    && (noticia.dominios || []).some((dominio) => empresa.domain === dominio || empresa.domain.endsWith(`.${dominio}`)));
}

function nomeDoIncidente(noticia) {
  return `${noticia.tipo === 'fuga' ? 'Fuga' : 'Burla'} ${noticia.data.slice(0, 4)}`;
}

function construirRede(nos) {
  const terceiros = new Map();
  const incidentes = new Map();
  const ligacoes = [];
  nos.forEach((no) => {
    const terceiro = no.empresa ? terceiroDe(no.empresa) : null;
    if (terceiro) {
      if (!terceiros.has(terceiro.id)) terceiros.set(terceiro.id, { ...terceiro, tipo: 'terceiro', ligados: [] });
      terceiros.get(terceiro.id).ligados.push(no);
      ligacoes.push({ de: no.id, para: terceiro.id, tipo: 'terceiro' });
    }
    incidentesDe(no.empresa).forEach((noticia) => {
      const id = `i:${noticia.id}`;
      if (!incidentes.has(id)) incidentes.set(id, { id, tipo: 'incidente', noticia, nome: nomeDoIncidente(noticia), ligados: [] });
      incidentes.get(id).ligados.push(no);
      ligacoes.push({ de: no.id, para: id, tipo: 'incidente' });
    });
  });
  return { empresas: nos, terceiros: [...terceiros.values()], incidentes: [...incidentes.values()], ligacoes };
}

function desenharRede(rede) {
  const r1 = (n) => Math.round(n * 10) / 10;
  const sel = selecaoMapa || {};
  const pos = new Map();
  const raios = new Map();

  // 1. Cada área é um grupo. As empresas ficam em espiral à volta do centro da área
  //    (espiral de Vogel: vizinhas sempre à mesma distância, quantas forem),
  //    as mais graves e com mais emails mais perto do centro.
  const c = REDE.PASSO / 1.8;
  const i0 = ((REDE.PASSO * 1.1) / c) ** 2;
  const ouro = Math.PI * (3 - Math.sqrt(5));
  const grupos = SECTOR_ORDER.map((chave) => ({
    chave,
    nos: rede.empresas.filter((no) => no.sector === chave).sort((a, b) => SEVERITY_ORDER.indexOf(a.gravidade) - SEVERITY_ORDER.indexOf(b.gravidade)
      || (b.empresa?.evidence?.totalRecebidos ?? 0) - (a.empresa?.evidence?.totalRecebidos ?? 0) || a.name.localeCompare(b.name))
  })).filter((g) => g.nos.length);
  grupos.forEach((g) => {
    g.pontos = g.nos.map((no, i) => {
      const r = c * Math.sqrt(i + i0);
      const a = i * ouro - Math.PI / 2;
      return { no, dx: r * Math.cos(a), dy: r * Math.sin(a) };
    });
    g.raio = c * Math.sqrt(g.nos.length - 1 + i0) + 6;
  });

  // O espaço disponível: largura real do mapa e, no computador, a altura do ecrã
  const caixa = document.getElementById('dot-map');
  const computador = window.matchMedia('(min-width: 1024px)').matches;
  const larguraPx = caixa?.clientWidth || 330;
  const proporcaoMax = computador ? Math.min(1.2, Math.max(0.5, (window.innerHeight - 230) / larguraPx)) : 1.3;
  const proporcaoMin = computador ? 0.45 : 0.8;
  const pesoX = Math.min(1.05, Math.max(0.6, proporcaoMax * 0.85));
  const letra = computador ? 13.5 : REDE.LETRA;

  // 2. As áreas arrumam-se lado a lado, as mais sensíveis primeiro (ao centro).
  //    Cada nova área encosta-se às que já estão, no sítio livre mais perto do centro.
  const ordem = [...grupos].sort((a, b) => SEVERITY_ORDER.indexOf(SECTORS[a.chave].gravidade) - SEVERITY_ORDER.indexOf(SECTORS[b.chave].gravidade)
    || b.nos.length - a.nos.length);
  const colocados = [];
  ordem.forEach((g) => {
    if (!colocados.length) {
      Object.assign(g, { x: 0, y: 0 });
      colocados.push(g);
      return;
    }
    let melhor = null;
    colocados.forEach((p) => {
      for (let passo = 0; passo < 48; passo++) {
        const angulo = (passo / 48) * 2 * Math.PI;
        const d = p.raio + g.raio + REDE.FOLGA;
        const x = p.x + d * Math.cos(angulo);
        const y = p.y + d * Math.sin(angulo);
        if (colocados.some((q) => Math.hypot(x - q.x, y - q.y) < q.raio + g.raio + REDE.FOLGA - 0.5)) continue;
        const custo = Math.hypot(x * pesoX, y); // no telemóvel, mais alto do que largo; no computador, mais largo
        if (!melhor || custo < melhor.custo) melhor = { x, y, custo };
      }
    });
    Object.assign(g, { x: melhor.x, y: melhor.y });
    colocados.push(g);
  });

  // 3. O desenho fica centrado em (0, 0), nem muito achatado nem muito comprido
  const limites = grupos.reduce((l, g) => ({
    x1: Math.min(l.x1, g.x - g.raio), x2: Math.max(l.x2, g.x + g.raio),
    y1: Math.min(l.y1, g.y - g.raio - REDE.FOLGA), y2: Math.max(l.y2, g.y + g.raio)
  }), { x1: Infinity, x2: -Infinity, y1: Infinity, y2: -Infinity });
  const cx = (limites.x1 + limites.x2) / 2;
  const cy = (limites.y1 + limites.y2) / 2;
  // Com poucas empresas, os pontos não crescem demasiado num ecrã grande
  let W = Math.max(220, larguraPx * (computador ? 0.3 : 0.6), limites.x2 - limites.x1 + 16);
  let H = limites.y2 - limites.y1 + 16;
  if (H < W * proporcaoMin) H = W * proporcaoMin;
  if (H > W * proporcaoMax) W = H / proporcaoMax;
  // "u" converte píxeis em unidades do desenho: os nomes e as linhas ficam sempre
  // do mesmo tamanho no ecrã, com 5 ou 500 empresas, no telemóvel ou no computador
  const u = W / larguraPx;
  grupos.forEach((g) => {
    pos.set(`s:${g.chave}`, { x: g.x - cx, y: g.y - cy });
    raios.set(`s:${g.chave}`, 2.6);
    g.pontos.forEach(({ no, dx, dy }) => {
      pos.set(no.id, { x: g.x - cx + dx, y: g.y - cy + dy, grupo: g.chave });
      raios.set(no.id, RAIO_EMPRESA[no.gravidade] || 4);
    });
  });

  // Zoom: até as vizinhas ficarem a ~40 px; os nomes aparecem quando ficam a ~22 px
  const zoomMax = Math.max(6, (40 * u) / REDE.PASSO);
  const zoomNomes = Math.max(1.5, (22 * u) / REDE.PASSO);
  const assinatura = `${rede.empresas.length}:${grupos.length}:${Math.round(W)}`;
  if (zoomMapa.assinatura !== assinatura) zoomMapa = { k: 1, x: 0, y: 0, assinatura };

  // 4. O que se escolhe: uma empresa mostra os seus terceiros à volta dela;
  //    um terceiro mostra todas as empresas que o usam. O resto esbate-se.
  //    As fugas, burlas e multas pintam o ícone de vermelho; o pormenor fica no bloco da empresa.
  let acesos = null;
  const satelites = [];
  const relacoes = [];
  const direcao = (id) => {
    const p = pos.get(id);
    const centro = pos.get(`s:${p.grupo}`);
    return Math.atan2(p.y - centro.y, p.x - centro.x) || -Math.PI / 2;
  };
  if (sel.tipo === 'empresa' && pos.has(sel.chave)) {
    acesos = new Set([sel.chave]);
    const ligadas = rede.ligacoes.filter((l) => l.de === sel.chave && l.tipo === 'terceiro');
    const base = direcao(sel.chave);
    ligadas.forEach((l, i) => {
      satelites.push({ id: l.para, tipo: l.tipo, rel: { de: sel.chave, angulo: base + (i - (ligadas.length - 1) / 2) * 0.95 } });
      relacoes.push(l);
      acesos.add(l.para);
    });
  } else if (sel.tipo === 'terceiro') {
    const item = rede.terceiros.find((x) => x.id === sel.chave);
    if (item) {
      acesos = new Set([item.id, ...item.ligados.map((no) => no.id)]);
      if (item.ligados.length === 1) {
        satelites.push({ id: item.id, tipo: sel.tipo, rel: { de: item.ligados[0].id, angulo: direcao(item.ligados[0].id) } });
      } else {
        const x = item.ligados.reduce((soma, no) => soma + pos.get(no.id).x, 0) / item.ligados.length;
        const y = item.ligados.reduce((soma, no) => soma + pos.get(no.id).y, 0) / item.ligados.length;
        satelites.push({ id: item.id, tipo: sel.tipo, abs: { x, y } });
      }
      item.ligados.forEach((no) => relacoes.push({ de: no.id, para: item.id, tipo: sel.tipo }));
    }
  } else if (sel.tipo === 'setor') {
    acesos = new Set([`s:${sel.chave}`, ...rede.empresas.filter((no) => no.sector === sel.chave).map((no) => no.id)]);
  }
  satelites.forEach((s) => {
    pos.set(s.id, s.abs || { rel: s.rel });
    raios.set(s.id, 4.6);
  });
  const aceso = (id) => !acesos || acesos.has(id);

  // Com zoom, se o escolhido ficou fora do ecrã, o mapa centra-se nele
  const escolhido = sel.chave && (pos.get(sel.chave)?.rel ? pos.get(pos.get(sel.chave).rel.de) : pos.get(sel.chave));
  if (escolhido && !escolhido.rel && zoomMapa.k > 1) {
    const { k } = zoomMapa;
    if (Math.abs(escolhido.x * k + zoomMapa.x) > (W / 2) * 0.85 || Math.abs(escolhido.y * k + zoomMapa.y) > (H / 2) * 0.85) {
      const mx = (W / 2) * (k - 1);
      const my = (H / 2) * (k - 1);
      zoomMapa = { ...zoomMapa, x: Math.max(-mx, Math.min(mx, -escolhido.x * k)), y: Math.max(-my, Math.min(my, -escolhido.y * k)) };
    }
  }

  // 5. Desenho. As posições no ecrã são postas por aplicarZoom(), logo a seguir.
  const linha = (de, para, cor, largura, opacidade, tracejado) => `<line data-de="${esc(de)}" data-para="${esc(para)}" stroke="${cor}" stroke-width="${r1(largura * u)}" stroke-opacity="${opacidade}" stroke-linecap="round"${tracejado ? ` stroke-dasharray="${r1(2.5 * u)} ${r1(3 * u)}"` : ''}/>`;
  const fundos = grupos.map((g) => `<circle data-grupo="${g.chave}" data-raio="${r1(g.raio)}" fill="#2c2330" fill-opacity="${aceso(`s:${g.chave}`) || (acesos && g.nos.some((no) => acesos.has(no.id))) ? 0.45 : 0.2}" pointer-events="none"/>`).join('');
  const raiosAreas = rede.empresas.map((no) => linha(`s:${no.sector}`, no.id, REDE.NUCLEO, 0.5, aceso(no.id) ? (acesos ? 0.6 : 0.3) : 0.06)).join('');
  const linhasRel = relacoes.map((l) => linha(l.de, l.para, REDE.TERCEIRO, 1, 0.9, true)).join('');

  let ordem2 = 0;
  const ponto = ({ id, r, cor, brilho, acao, titulo, anel, pulsar, letra, corLetra, contorno }) => {
    const ligado = aceso(id);
    const entrada = animarMapa ? ` class="dot-in" style="animation-delay:${Math.min(ordem2++ * 6, 700)}ms"` : '';
    return `<g data-no="${esc(id)}" opacity="${ligado ? 1 : 0.22}"><g${entrada}>
      ${brilho ? `<circle r="${r1(r * 2.6)}" fill="url(#${brilho})" pointer-events="none"/>` : ''}
      ${pulsar ? `<circle r="${r}" fill="none" stroke="${cor}" stroke-width="1.2" class="ponto-radar" pointer-events="none"/>` : ''}
      ${anel ? `<circle r="${r1(r + 2.2)}" fill="none" stroke="${anel}" stroke-width="1.4" pointer-events="none"/>` : ''}
      <circle r="${r}" fill="${cor}" stroke="#ffffff" stroke-opacity="${sel.chave === id ? 1 : contorno ? 0.28 : 0}" stroke-width="${sel.chave === id ? 1.6 : 0.7}" pointer-events="none"/>
      ${letra ? `<text data-letra data-r="${r}" text-anchor="middle" dy="0.36em" font-size="${r1(r * 1.15)}" font-weight="700" fill="${corLetra}" pointer-events="none">${esc(letra)}</text>` : ''}
      <circle ${acao} r="${r1(Math.max(r + 3, 7 * u))}" fill="transparent" class="cursor-pointer"><title>${esc(titulo)}</title></circle>
    </g></g>`;
  };
  // No centro de cada área, o símbolo da área (o mesmo das listas), num distintivo redondo
  const nucleos = grupos.map((g) => {
    const escolhida = sel.tipo === 'setor' && sel.chave === g.chave;
    return `<g data-no="s:${g.chave}" opacity="${aceso(`s:${g.chave}`) ? 1 : 0.35}">
      <circle r="7.6" fill="#1d1620" stroke="${escolhida ? '#ffffff' : '#5d5462'}" stroke-width="${escolhida ? 1.2 : 0.8}" pointer-events="none"/>
      ${iconeNoMapa(g.chave, 0, 0, 9, escolhida ? '#ffffff' : '#d3ccd6')}
      <circle data-action="mapa-setor" data-sector="${g.chave}" r="${r1(Math.max(8, 9 * u))}" fill="transparent" class="cursor-pointer"><title>${esc(SECTORS[g.chave].label)}</title></circle>
    </g>`;
  }).join('');
  const pontosEmpresas = grupos.flatMap((g) => g.nos).map((no) => ponto({
    id: no.id, r: RAIO_EMPRESA[no.gravidade] || 4, cor: no.situacao ? ESTADOS_EMPRESA[no.situacao.chave].hex : COR_NO_MAPA[no.gravidade] || COR_NO_MAPA.media, brilho: null,
    acao: `data-action="mapa-empresa" data-id="${esc(no.id)}"`,
    titulo: `${no.name}: sensibilidade ${SEVERITY[no.gravidade].label.toLowerCase()}${no.situacao ? `. ${no.situacao.texto}` : ''}`,
    anel: null, contorno: true,
    letra: (no.empresa?.icon || no.name[0] || '?').toUpperCase(), corLetra: no.situacao ? '#ffffff' : LETRA_NO_MAPA[no.gravidade] || LETRA_NO_MAPA.media
  })).join('');
  const nomeDe = (s) => rede.terceiros.find((x) => x.id === s.id);
  const pontosSatelites = satelites.map((s) => ponto({
    id: s.id, r: 4.6, cor: REDE.TERCEIRO, brilho: null,
    acao: `data-action="mapa-terceiro" data-id="${esc(s.id)}"`, titulo: `${nomeDe(s).nome}: terceiro`
  })).join('');

  // 6. Nomes. Os das áreas veem-se sempre; os das empresas só com zoom (ou ligadas ao que escolheste),
  //    por ordem de importância e sem taparem nada. O escolhido e os seus terceiros, sempre.
  const ordemClasse = { fixa: 0, setor: 1, ligada: 2, normal: 3 };
  const etiquetas = [
    ...satelites.map((s) => ({ id: s.id, texto: nomeDe(s).nome, cor: '#d9cdfb', classe: 'fixa', peso: 0 })),
    ...grupos.map((g) => ({ id: `s:${g.chave}`, texto: `${SECTORS[g.chave].short} · ${g.nos.length}`, cor: sel.tipo === 'setor' && sel.chave === g.chave ? '#ffffff' : '#a39ca7', classe: 'setor', setor: g.chave, peso: 0 })),
    ...grupos.flatMap((g) => g.nos).map((no, i) => ({
      id: no.id, texto: no.name, cor: '#e4e0e6', peso: i, esbatido: !aceso(no.id),
      classe: no.id === sel.chave ? 'fixa' : acesos?.has(no.id) ? 'ligada' : 'normal'
    }))
  ].map((et) => ({ ...et, texto: et.texto.length > 20 ? `${et.texto.slice(0, 19)}…` : et.texto }))
    .sort((a, b) => ordemClasse[a.classe] - ordemClasse[b.classe] || a.peso - b.peso);
  const textos = etiquetas.map((et, i) => `<text data-et="${i}" display="none" font-size="${r1(letra * u)}" font-weight="600" fill="${et.cor}"${et.esbatido ? ' opacity="0.3"' : ''}
    stroke="#19131b" stroke-width="${r1(3 * u)}" stroke-linejoin="round" paint-order="stroke"
    ${et.setor ? `pointer-events="auto" data-action="mapa-setor" data-sector="${et.setor}" class="cursor-pointer"` : 'pointer-events="none"'}>${esc(et.texto)}</text>`).join('');

  redeDesenhada = { pos, raios, W, H, u, letra, larguraPx, etiquetas, zoomMax, zoomNomes, grupos: new Map(grupos.map((g) => [g.chave, g.raio])) };

  const gradiente = (id, cor) => `<radialGradient id="${id}"><stop offset="0" stop-color="${cor}" stop-opacity="0.45"/><stop offset="0.45" stop-color="${cor}" stop-opacity="0.14"/><stop offset="1" stop-color="${cor}" stop-opacity="0"/></radialGradient>`;
  const botao = (zoom, rotulo, conteudo) => `<button data-action="mapa-zoom" data-zoom="${zoom}" type="button" aria-label="${rotulo}" title="${rotulo}"
    class="flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-slate-200 transition hover:border-slate-500 disabled:opacity-30">${conteudo}</button>`;
  const traco = (d) => `<svg viewBox="0 0 16 16" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;
  return `<svg data-rede viewBox="${r1(-W / 2)} ${r1(-H / 2)} ${r1(W)} ${r1(H)}" class="block h-auto w-full select-none" role="group" aria-label="Mapa das empresas que têm os teus dados, por área">
      <defs>${SEVERITY_ORDER.map((chave) => gradiente(`brilho-${chave}`, SEVERITY[chave].hex)).join('')}${gradiente('brilho-empresa', REDE.EMPRESA)}${gradiente('brilho-terceiro', REDE.TERCEIRO)}</defs>
      <rect data-action="mapa-limpar" x="${r1(-W / 2)}" y="${r1(-H / 2)}" width="${r1(W)}" height="${r1(H)}" fill="transparent"/>
      ${fundos}${raiosAreas}${linhasRel}${nucleos}${pontosEmpresas}${pontosSatelites}
      <g>${textos}</g>
    </svg>
    <div class="mt-2 flex items-center justify-between gap-3">
      <p id="map-zoom-hint" class="text-xs leading-4 text-mist">Aproxima para veres os nomes.</p>
      <div class="flex shrink-0 gap-1.5">
        ${botao('menos', 'Afastar', traco('M4 8h8'))}
        ${botao('mais', 'Aproximar', traco('M4 8h8M8 4v8'))}
        ${botao('repor', 'Ver o mapa todo', traco('M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10'))}
      </div>
    </div>`;
}

// Põe no ecrã cada ponto, linha e nome, conforme o zoom. Corre a cada gesto (no máximo uma vez por imagem).
function aplicarZoom() {
  const caixa = document.getElementById('dot-map');
  const svg = caixa?.querySelector('svg[data-rede]');
  if (!svg || !redeDesenhada) return;
  const { pos, raios, W, H, u, letra: letraPx, etiquetas, zoomMax, zoomNomes, grupos } = redeDesenhada;
  const { k, x: tx, y: ty } = zoomMapa;
  const mx = W / 2;
  const my = H / 2;
  const r1 = (n) => Math.round(n * 10) / 10;
  // Os pontos crescem um pouco com o zoom, mas muito menos do que as distâncias
  const s = Math.min(1 + (k - 1) * 0.3, 2.2);
  // Os terceiros de uma empresa ficam a uma distância fixa dela, no ecrã
  const ecra = (id) => {
    const p = pos.get(id);
    if (p.rel) {
      const base = ecra(p.rel.de);
      const d = REDE.SATELITE * u + (raios.get(p.rel.de) || 4) * s;
      return { x: base.x + d * Math.cos(p.rel.angulo), y: base.y + d * Math.sin(p.rel.angulo), angulo: p.rel.angulo };
    }
    return { x: p.x * k + tx, y: p.y * k + ty };
  };
  const posicoes = new Map([...pos.keys()].map((id) => [id, ecra(id)]));

  svg.querySelectorAll('circle[data-grupo]').forEach((circulo) => {
    const p = posicoes.get(`s:${circulo.dataset.grupo}`);
    circulo.setAttribute('cx', r1(p.x));
    circulo.setAttribute('cy', r1(p.y));
    circulo.setAttribute('r', r1(Number(circulo.dataset.raio) * k));
  });
  svg.querySelectorAll('line[data-de]').forEach((l) => {
    const a = posicoes.get(l.dataset.de);
    const b = posicoes.get(l.dataset.para);
    l.setAttribute('x1', r1(a.x)); l.setAttribute('y1', r1(a.y));
    l.setAttribute('x2', r1(b.x)); l.setAttribute('y2', r1(b.y));
  });
  svg.querySelectorAll('g[data-no]').forEach((g) => {
    const p = posicoes.get(g.dataset.no);
    g.setAttribute('transform', `translate(${r1(p.x)} ${r1(p.y)}) scale(${Math.round(s * 100) / 100})`);
  });
  // A inicial dentro de cada ícone só aparece quando o ícone tem tamanho para ela (com muitas empresas, ao aproximar)
  svg.querySelectorAll('text[data-letra]').forEach((t) => {
    t.setAttribute('display', (Number(t.dataset.r) * s) / u >= 6.5 ? 'inline' : 'none');
  });

  // Nomes: os mais importantes primeiro; um nome que tape outro (ou um ponto) fica escondido
  const letra = letraPx * u;
  const comNomes = k >= zoomNomes;
  const toca = (a, b) => a.x1 < b.x2 && a.x2 > b.x1 && a.y1 < b.y2 && a.y2 > b.y1;
  const naMoldura = (p) => Math.abs(p.x) <= mx && Math.abs(p.y) <= my;
  const ocupadas = [];
  const pontos = [];
  posicoes.forEach((p, id) => {
    if (!naMoldura(p)) return;
    const r = (raios.get(id) || 3) * s + u;
    pontos.push({ id, x1: p.x - r, x2: p.x + r, y1: p.y - r, y2: p.y + r });
  });
  const textos = svg.querySelectorAll('text[data-et]');
  etiquetas.forEach((et, i) => {
    const el = textos[i];
    if (!el) return;
    const esconder = () => el.setAttribute('display', 'none');
    if (et.classe === 'normal' && !comNomes) return esconder();
    const p = posicoes.get(et.id);
    const largura = et.texto.length * letra * 0.56;
    const caixaDe = (x1, y) => ({ x1: x1 - u, x2: x1 + largura + u, y1: y - letra * 0.8, y2: y + 2 * u });
    const dentro = (c) => c.x1 >= -mx && c.x2 <= mx && c.y1 >= -my && c.y2 <= my;
    let lugares;
    if (et.classe === 'setor') {
      // O nome da área fica por cima do grupo, encostado para dentro da moldura
      const y = p.y - (grupos.get(et.setor) || 10) * k - 3 * u;
      const x1 = Math.max(-mx + 2 * u, Math.min(mx - 2 * u - largura, p.x - largura / 2));
      lugares = [{ x: x1 + largura / 2, y, ancora: 'middle', caixa: caixaDe(x1, y) }];
    } else {
      if (!naMoldura(p) && et.classe !== 'fixa') return esconder();
      const r = (raios.get(et.id) || 3) * s;
      // Tenta: para fora do grupo (ou do lado com mais espaço), do outro lado, por cima e por baixo
      const fora = p.angulo !== undefined ? (Math.cos(p.angulo) >= 0 ? 'start' : 'end') : (p.x > 0 ? 'end' : 'start');
      lugares = [fora, fora === 'end' ? 'start' : 'end', 'cima', 'baixo'].map((lado) => {
        const lateral = lado === 'start' || lado === 'end';
        const y = lateral ? p.y + letra * 0.35 : lado === 'cima' ? p.y - r - 3 * u : p.y + r + letra + 2 * u;
        const x1 = lado === 'start' ? p.x + r + 3 * u : lado === 'end' ? p.x - r - 3 * u - largura
          : Math.max(-mx + 2 * u, Math.min(mx - 2 * u - largura, p.x - largura / 2));
        const ancora = lateral ? lado : 'middle';
        return { x: ancora === 'start' ? x1 : ancora === 'end' ? x1 + largura : x1 + largura / 2, y, ancora, caixa: caixaDe(x1, y) };
      });
    }
    const livre = (c) => !ocupadas.some((o) => toca(c, o)) && (et.classe !== 'normal' || !pontos.some((o) => o.id !== et.id && toca(c, o)));
    const lugar = et.classe === 'fixa'
      ? lugares.find((l) => dentro(l.caixa) && livre(l.caixa)) || lugares.find((l) => dentro(l.caixa)) || lugares[0]
      : lugares.find((l) => dentro(l.caixa) && livre(l.caixa));
    if (!lugar) return esconder();
    ocupadas.push(lugar.caixa);
    el.removeAttribute('display');
    el.setAttribute('x', r1(lugar.x));
    el.setAttribute('y', r1(lugar.y));
    el.setAttribute('text-anchor', lugar.ancora);
    return null;
  });

  // Sem zoom, um dedo faz scroll à página; com zoom, arrasta o mapa
  caixa.style.touchAction = k > 1 ? 'none' : 'pan-y';
  const dica = document.getElementById('map-zoom-hint');
  if (dica) dica.textContent = comNomes ? 'Arrasta para percorrer o mapa.' : 'Aproxima para veres os nomes.';
  caixa.querySelector('[data-zoom="menos"]')?.toggleAttribute('disabled', k <= 1);
  caixa.querySelector('[data-zoom="repor"]')?.toggleAttribute('disabled', k <= 1);
  caixa.querySelector('[data-zoom="mais"]')?.toggleAttribute('disabled', k >= zoomMax - 0.01);
}

function pedirZoom() {
  if (!pedidoDeZoom) pedidoDeZoom = requestAnimationFrame(() => { pedidoDeZoom = 0; aplicarZoom(); });
}

// O mapa nunca sai da moldura: com zoom k, pode deslocar-se no máximo metade × (k − 1) para cada lado
function limitarZoom(k, x, y) {
  const { W = 0, H = 0, zoomMax = 6 } = redeDesenhada || {};
  const kk = Math.min(zoomMax, Math.max(1, k));
  const mx = (W / 2) * (kk - 1);
  const my = (H / 2) * (kk - 1);
  return { ...zoomMapa, k: kk, x: Math.max(-mx, Math.min(mx, x)), y: Math.max(-my, Math.min(my, y)) };
}

// Zoom à volta de um ponto do desenho (px, py): esse ponto fica no mesmo sítio do ecrã
function zoomEm(k, px = 0, py = 0) {
  const z = zoomMapa;
  const novo = Math.min(redeDesenhada?.zoomMax || 6, Math.max(1, k));
  return limitarZoom(novo, px - ((px - z.x) / z.k) * novo, py - ((py - z.y) / z.k) * novo);
}

// Os botões mudam o zoom com uma pequena animação
function animarZoomPara(alvo) {
  cancelAnimationFrame(animacaoDeZoom);
  const inicio = { ...zoomMapa };
  const t0 = performance.now();
  const passo = (agora) => {
    const t = Math.min(1, (agora - t0) / 220);
    const e = 1 - (1 - t) ** 3;
    zoomMapa = {
      ...zoomMapa,
      k: Math.exp(Math.log(inicio.k) + (Math.log(alvo.k) - Math.log(inicio.k)) * e),
      x: inicio.x + (alvo.x - inicio.x) * e,
      y: inicio.y + (alvo.y - inicio.y) * e
    };
    aplicarZoom();
    if (t < 1) animacaoDeZoom = requestAnimationFrame(passo);
  };
  animacaoDeZoom = requestAnimationFrame(passo);
}

function botaoDeZoom(tipo) {
  // Com um ponto escolhido, aproxima à volta dele; sem nada escolhido, à volta do centro do ecrã
  const p = selecaoMapa?.chave && redeDesenhada?.pos.get(selecaoMapa.chave);
  const escolhido = p?.rel ? redeDesenhada.pos.get(p.rel.de) : p;
  const px = escolhido ? escolhido.x * zoomMapa.k + zoomMapa.x : 0;
  const py = escolhido ? escolhido.y * zoomMapa.k + zoomMapa.y : 0;
  if (tipo === 'mais') animarZoomPara(zoomEm(zoomMapa.k * 1.8, px, py));
  else if (tipo === 'menos') animarZoomPara(zoomEm(zoomMapa.k / 1.8, px, py));
  else animarZoomPara({ k: 1, x: 0, y: 0 });
}

// Gestos no mapa: dois dedos para aproximar, um dedo (ou o rato) para arrastar quando há zoom,
// e Ctrl + roda (ou o gesto de pinça do trackpad) no computador.
function ligarZoomDoMapa() {
  const caixa = document.getElementById('dot-map');
  if (!caixa) return;
  const dedos = new Map();
  let gesto = null;
  let arrastou = false;
  const noDesenho = (clientX, clientY) => {
    const m = caixa.querySelector('svg[data-rede]')?.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  };
  const comecar = () => {
    const v = [...dedos.values()];
    gesto = {
      zoom: { ...zoomMapa },
      inicio: new Map(dedos),
      dist: v.length >= 2 ? Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y) : 0,
      meio: v.length >= 2 ? { x: (v[0].x + v[1].x) / 2, y: (v[0].y + v[1].y) / 2 } : null
    };
  };

  caixa.addEventListener('pointerdown', (evento) => {
    if (!caixa.querySelector('svg[data-rede]') || evento.target.closest('button')) return;
    if (evento.pointerType === 'mouse' && evento.button !== 0) return;
    dedos.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    if (dedos.size === 1) arrastou = false;
    comecar();
  });
  caixa.addEventListener('pointermove', (evento) => {
    if (!gesto || !dedos.has(evento.pointerId)) return;
    dedos.set(evento.pointerId, { x: evento.clientX, y: evento.clientY });
    if (dedos.size >= 2 && gesto.dist) {
      const v = [...dedos.values()];
      const dist = Math.hypot(v[0].x - v[1].x, v[0].y - v[1].y);
      const meio = { x: (v[0].x + v[1].x) / 2, y: (v[0].y + v[1].y) / 2 };
      const a = noDesenho(gesto.meio.x, gesto.meio.y);
      const b = noDesenho(meio.x, meio.y);
      const z = gesto.zoom;
      const k = Math.min(redeDesenhada?.zoomMax || 6, Math.max(1, z.k * (dist / gesto.dist)));
      zoomMapa = limitarZoom(k, b.x - ((a.x - z.x) / z.k) * k, b.y - ((a.y - z.y) / z.k) * k);
      arrastou = true;
      pedirZoom();
      return;
    }
    const inicio = gesto.inicio.get(evento.pointerId);
    if (!inicio || gesto.zoom.k <= 1) return;
    if (!arrastou && Math.hypot(evento.clientX - inicio.x, evento.clientY - inicio.y) < 6) return;
    if (!arrastou) {
      arrastou = true;
      caixa.setPointerCapture?.(evento.pointerId);
    }
    const a = noDesenho(inicio.x, inicio.y);
    const b = noDesenho(evento.clientX, evento.clientY);
    zoomMapa = limitarZoom(gesto.zoom.k, gesto.zoom.x + (b.x - a.x), gesto.zoom.y + (b.y - a.y));
    pedirZoom();
  });
  const largar = (evento) => {
    if (!dedos.delete(evento.pointerId)) return;
    if (dedos.size) comecar();
    else gesto = null;
  };
  caixa.addEventListener('pointerup', largar);
  caixa.addEventListener('pointercancel', largar);
  // Depois de arrastar ou aproximar, o toque não escolhe nenhum ponto
  caixa.addEventListener('click', (evento) => {
    if (!arrastou) return;
    arrastou = false;
    evento.stopPropagation();
    evento.preventDefault();
  }, true);
  caixa.addEventListener('wheel', (evento) => {
    if (!evento.ctrlKey && !evento.metaKey) return;
    evento.preventDefault();
    const p = noDesenho(evento.clientX, evento.clientY);
    zoomMapa = zoomEm(zoomMapa.k * Math.exp(-evento.deltaY * 0.01), p.x, p.y);
    pedirZoom();
  }, { passive: false });
}

function legendaDaRede(rede) {
  const areas = new Set(rede.empresas.map((no) => no.sector)).size;
  // Cada exemplo é desenhado como o ícone no mapa: a cor diz o risco ou o estado do pedido
  const exemplo = (fundo, letra, anel = null) => `<svg viewBox="0 0 22 22" width="22" height="22" class="shrink-0" aria-hidden="true">
      ${anel ? `<circle cx="11" cy="11" r="9.6" fill="none" stroke="${anel}" stroke-width="1.6"/>` : ''}
      <circle cx="11" cy="11" r="8" fill="${fundo}" stroke="#ffffff" stroke-opacity="0.28" stroke-width="0.8"/>
      <text x="11" y="11" dy="0.36em" text-anchor="middle" font-size="9" font-weight="700" fill="${letra}">A</text>
    </svg>`;
  const item = (icone, texto) => `<li class="flex items-center gap-2">${icone}<span>${texto}</span></li>`;
  return `<p class="text-xs text-slate-300"><span class="font-semibold text-white">${rede.empresas.length}</span> ${plural(rede.empresas.length, 'empresa', 'empresas')} em <span class="font-semibold text-white">${areas}</span> ${plural(areas, 'área', 'áreas')}</p>
    <ul class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs leading-4 text-slate-200">
      ${item(exemplo(ESTADOS_EMPRESA.atencao.hex, '#ffffff'), 'Risco: sensibilidade alta ou muito alta, ou algo correu mal')}
      ${item(exemplo(COR_NO_MAPA.media, LETRA_NO_MAPA.media), 'Menos sensíveis, sem pedidos')}
      ${item(exemplo(ESTADOS_EMPRESA.pendente.hex, '#ffffff'), 'Pedido a decorrer')}
      ${item(exemplo(ESTADOS_EMPRESA.concluido.hex, '#ffffff'), 'Pedido concluído')}
    </ul>
    <p class="mt-3 text-xs leading-4 text-mist"><span class="lg:hidden">Toca</span><span class="hidden lg:inline">Clica</span> numa empresa para veres o que se passa e o que lhe podes pedir.</p>`;
}

// Todas as empresas da análise, mais as que têm pedidos mas já não estão na lista.
function nosDoMapa() {
  const comPedidos = new Map(empresasComPedidos().map((item) => [item.id, item]));
  const nos = visiveis().map((empresa) => {
    const item = comPedidos.get(empresa.id);
    comPedidos.delete(empresa.id);
    const gravidade = gravidadeDe(empresa);
    return {
      id: empresa.id, name: empresa.name, sector: empresa.sector || 'outros', balde: item?.balde || 'sempedido',
      ultimo: item?.ultimo || null, empresa, gravidade: gravidade.chave, motivo: gravidade.motivo,
      situacao: estadoDaEmpresa(empresa, item?.ultimo || null)
    };
  });
  comPedidos.forEach((item) => {
    const empresa = obterEmpresa(item.id) || null;
    const gravidade = gravidadeDe(empresa || { sector: item.sector || 'outros' });
    nos.push({ ...item, sector: item.sector || 'outros', empresa, gravidade: gravidade.chave, motivo: gravidade.motivo, situacao: estadoDaEmpresa(empresa || { domain: item.id }, item.ultimo) });
  });
  return nos;
}

function detalheDoMapa(nos, rede) {
  const sel = selecaoMapa;
  // No telemóvel, uma barra fixa no topo para voltar à lista; no computador só o mapa tem "Fechar"
  // (o painel não tem margem em cima nem em baixo no telemóvel: as barras fixas ficam encostadas aos limites do ecrã)
  const voltar = `<div class="sticky top-0 z-20 -mx-5 mb-5 flex items-center bg-ink/95 px-5 py-3 backdrop-blur lg:hidden">
      <button data-action="fechar-painel" type="button" class="-ml-1 flex items-center gap-1 rounded-lg py-1 pr-2 text-sm font-semibold text-slate-100">${icone('voltar', 'h-4 w-4')}Resultados</button>
    </div>`;
  const fechar = modoResultados === 'mapa' ? '<button data-action="mapa-limpar" type="button" class="hidden shrink-0 self-start text-xs font-semibold text-slate-300 lg:inline">Fechar</button>' : '';
  const cabecalho = (titulo, subtitulo, marca = '') => `${voltar}
    <div class="flex items-center gap-3.5">
      ${marca}
      <div class="min-w-0 flex-1">
        <h2 class="font-display text-2xl font-semibold leading-tight text-white">${titulo}</h2>
        ${subtitulo ? `<p class="mt-0.5 text-sm text-slate-300">${subtitulo}</p>` : ''}
      </div>
      ${fechar}
    </div>`;
  const avatar = (conteudo, situacao = null) => `<span class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${situacao ? ESTADOS_EMPRESA[situacao.chave].fundo : 'bg-slate-800'} font-display text-xl font-semibold text-white lg:h-11 lg:w-11"${situacao ? ` title="${esc(situacao.texto)}"` : ''}>${conteudo}</span>`;
  // A sensibilidade numa caixa própria: o nível e o que a empresa costuma guardar
  const sensibilidade = (chave, texto) => `
    <div class="mt-5 rounded-2xl border ${SEVERITY[chave].borda} ${['critica', 'alta'].includes(chave) ? 'bg-risco/25' : 'bg-slate-900'} p-4 lg:mt-4 lg:p-3.5">
      <p class="flex items-center gap-2 text-sm font-semibold ${SEVERITY[chave].texto}">${iconeGravidade(chave, 11)}Sensibilidade ${SEVERITY[chave].label.toLowerCase()}</p>
      <p class="mt-1.5 text-sm leading-6 text-slate-100">${esc(texto)}</p>
    </div>`;
  const titulo = (texto, extra = '') => `<h3 class="flex items-baseline justify-between gap-3 text-base font-semibold text-white">${texto}${extra}</h3>`;
  const ordenar = (lista) => [...lista].sort((a, b) => SEVERITY_ORDER.indexOf(a.gravidade) - SEVERITY_ORDER.indexOf(b.gravidade)
    || MAP_ORDER.indexOf(a.balde) - MAP_ORDER.indexOf(b.balde) || a.name.localeCompare(b.name));
  const linhas = (lista, mostrarArea) => `<div class="mt-2 divide-y divide-slate-800">${ordenar(lista).map((no) => linhaDoMapa(no, mostrarArea)).join('')}</div>`;
  const contar = (n) => `${n} ${plural(n, 'empresa', 'empresas')}`;
  const nomes = (lista) => {
    const n = lista.map((no) => no.name);
    return n.length > 1 ? `${n.slice(0, -1).join(', ')} e ${n[n.length - 1]}` : n[0];
  };
  // Uma linha de uma lista de opções: o nome, uma frase (só no computador, se não for essencial) e a seta
  // Uma linha de uma lista de opções: o nome, uma frase só quando é precisa (as outras ficam na dica) e a seta
  const opcao = (atributos, nome, frase = '', extra = '', fraseSempre = false) => `<button ${atributos} type="button"${frase && !fraseSempre ? ` title="${frase}"` : ''} class="flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-slate-800/50 lg:py-3">
      <span class="min-w-0 flex-1"><span class="flex items-center gap-2 text-[0.9375rem] font-semibold text-slate-100">${nome}${extra}</span>${frase && fraseSempre ? `<span class="mt-0.5 block text-xs leading-5 text-slate-300">${frase}</span>` : ''}</span>
      <span class="shrink-0 text-slate-400">${icone('seta', 'h-4 w-4')}</span>
    </button>`;
  const caixa = (conteudo) => `<div class="mt-3 divide-y divide-slate-800 overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900">${conteudo}</div>`;

  // Nada escolhido (só no mapa, no computador): uma frase e as três mais sensíveis
  if (!sel) {
    const primeiras = ordenar(nos).slice(0, 3);
    return `<p class="text-sm leading-6 text-slate-200"><span class="lg:hidden">Toca</span><span class="hidden lg:inline">Clica</span> numa empresa para veres o que guarda e o que lhe podes pedir.</p>
      ${primeiras.length ? `<div class="mt-5">${titulo('Começa pelas mais sensíveis')}${linhas(primeiras, true)}</div>` : ''}`;
  }

  if (sel.tipo === 'terceiro') {
    const t = rede.terceiros.find((item) => item.id === sel.chave);
    const uma = t.ligados.length === 1;
    return `${cabecalho(esc(t.nome), `Terceiro · ${esc(t.dominio)}`, avatar(esc((t.nome[0] || '?').toUpperCase())))}
      <p class="mt-5 text-[0.9375rem] leading-6 text-slate-100">${esc(nomes(t.ligados))} ${uma ? 'usa' : 'usam'} o ${esc(t.nome)} para te enviar emails. O ${esc(t.nome)} recebe o teu endereço em nome ${uma ? 'dela' : 'delas'} e pode registar quando abres as mensagens.</p>
      <p class="mt-2 text-sm leading-6 text-slate-300">Não comprou os teus dados: trabalha por conta ${uma ? 'da empresa' : 'das empresas'}. Se pedires o apagamento, ${uma ? 'ela tem' : 'elas têm'} de avisar o ${esc(t.nome)} (artigo 19.º do RGPD).</p>
      <div class="mt-7">${titulo(uma ? 'A empresa' : 'As empresas')}${linhas(t.ligados, true)}</div>`;
  }

  if (sel.tipo === 'setor') {
    const setor = SECTORS[sel.chave];
    const daArea = nos.filter((no) => no.sector === sel.chave);
    return `${cabecalho(esc(setor.label), contar(daArea.length), avatar(icone(sel.chave, 'h-6 w-6')))}
      ${sensibilidade(setor.gravidade, setor.porque)}
      <div class="mt-7">${titulo('Empresas desta área')}${linhas(daArea, false)}</div>`;
  }

  // Uma empresa, por esta ordem: o que guarda, as notícias, o pedido principal (fixo em baixo no telemóvel),
  // os outros pedidos e, fechado em "Mais opções", tudo o resto
  const no = nos.find((item) => item.id === sel.chave);
  const setor = SECTORS[no.sector] || SECTORS.outros;
  const ev = no.empresa?.evidence;
  const pedidosDaEmpresa = estado.pedidos
    .filter((pedido) => pedido.companyId === no.id && pedido.status !== 'draft')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const aberto = (right) => pedidosDaEmpresa.find((pedido) => pedido.right === right && pedido.status !== 'closed');

  // As notícias: só a mais recente à vista; as outras abrem com "Ver mais"
  const proprias = noticiasDaEmpresa(no.empresa);
  const daArea = proprias.length ? [] : noticiasDaArea(no.empresa).slice(0, 2);
  const todas = [...proprias.map((noticia) => [noticia, false]), ...daArea.map((noticia) => [noticia, true])];
  const verTodas = renderPainelEmpresa.todasAsNoticias === no.id;
  const aVista = verTodas ? todas : todas.slice(0, 1);
  const noticias = todas.length ? `
    <section class="mt-6 lg:mt-5">
      ${titulo(proprias.length ? `Notícias sobre ${esc(no.name)}` : 'Notícias da mesma área', todas.length > 1 ? `<span class="text-sm font-normal text-slate-300">${todas.length}</span>` : '')}
      ${proprias.length ? '' : `<p class="mt-1 text-sm leading-6 text-slate-300">Não conhecemos casos sobre ${esc(no.name)}. ${daArea.length > 1 ? 'Estes são' : 'Este é'} de outras empresas de ${esc(setor.label.toLowerCase())}.</p>`}
      <div class="mt-3 flex flex-col gap-3">${aVista.map(([noticia, comEmpresa]) => itemDeNoticia(noticia, comEmpresa)).join('')}</div>
      ${todas.length > aVista.length ? `<button data-action="mais-noticias" data-id="${esc(no.id)}" type="button" class="mt-3 text-sm font-semibold text-slate-100 underline decoration-slate-500 underline-offset-4">Ver mais ${todas.length - aVista.length} ${plural(todas.length - aVista.length, 'notícia', 'notícias')}</button>` : ''}
    </section>` : '';

  let principal = '';
  let outrosPedidos = '';
  if (no.empresa) {
    const apagamento = aberto('erasure');
    principal = `<div class="sticky bottom-0 z-10 -mx-5 mt-6 lg:mt-5 border-t border-slate-800 bg-ink/95 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
      ${apagamento
        ? `<button data-action="ver-pedido" data-id="${esc(apagamento.id)}" type="button" class="flex w-full items-center gap-3 rounded-xl border border-slate-600 bg-slate-900 px-4 py-3 text-left">
            <span class="min-w-0 flex-1"><span class="block text-[0.9375rem] font-semibold text-white">Pediste que apaguem os teus dados</span><span class="mt-0.5 block truncate text-xs ${corDoPedido(apagamento)}">${marcaDoPedido(apagamento)}${esc(descreverPedido(apagamento))}</span></span>
            <span class="shrink-0 text-sm font-semibold text-slate-100">Ver</span>
          </button>`
        : `<button data-action="pedido" data-id="${esc(no.id)}" data-right="erasure" type="button" class="flex w-full items-center justify-center rounded-xl bg-lime px-4 py-3.5 text-[0.9375rem] font-bold text-ink transition hover:brightness-95 active:scale-[.98]">Pedir que apaguem os meus dados</button>
          <p class="mt-2 text-center text-xs leading-5 text-slate-300">${no.empresa.dpo_email ? 'O Veto escreve o pedido e envia-o pelo teu Gmail, se aceitares.' : 'O Veto escreve o pedido e tu envias.'} Têm um mês para responder.</p>`}
    </div>`;
    const frases = { access: 'Saber que dados têm e receber uma cópia', portability: 'Num formato que podes levar para outro serviço', objection: 'Deixam de usar os teus dados para publicidade' };
    outrosPedidos = `<section class="mt-6 lg:mt-5">
        ${titulo('Outros pedidos')}
        ${caixa(['access', 'portability', 'objection'].map((right) => {
          const pedido = aberto(right);
          return pedido
            ? opcao(`data-action="ver-pedido" data-id="${esc(pedido.id)}"`, esc(RIGHTS[right].label), `<span class="${corDoPedido(pedido)}">${marcaDoPedido(pedido)}${esc(descreverPedido(pedido))}</span>`, '', true)
            : opcao(`data-action="pedido" data-id="${esc(no.id)}" data-right="${right}"`, esc(RIGHTS[right].label), esc(frases[right]));
        }).join(''))}
      </section>`;
  }

  // Mais opções, fechado: cancelar a subscrição, apagar os emails (Veto+), o terceiro, os pedidos anteriores,
  // porque aparece aqui, "não tenho dados aqui" e de onde vem o contacto
  const terceiro = no.empresa ? terceiroDe(no.empresa) : null;
  const extras = [
    no.empresa?.unsubscribe && !no.empresa.unsubscribedAt ? opcao(`data-action="cancelar-subscricao" data-id="${esc(no.id)}"`, 'Cancelar a subscrição', 'Deixas de receber publicidade. Os dados ficam lá', '', true) : '',
    no.empresa?.unsubscribedAt ? '<p class="px-4 py-3.5 text-sm leading-6 text-slate-300">Cancelaste a subscrição. A empresa continua a guardar os teus dados.</p>' : '',
    no.empresa && !estado.demo ? opcao(`data-action="apagar-emails" data-id="${esc(no.id)}"`, 'Apagar os emails desta empresa', no.empresa.limpeza ? `Moveste ${no.empresa.limpeza.quantos} para o Lixo a ${formatarData(no.empresa.limpeza.em)}` : 'Vão para o Lixo do Gmail. A empresa continua com os dados', SELO_PLUS, true) : '',
    terceiro ? opcao(`data-action="mapa-terceiro" data-id="${esc(terceiro.id)}"`, `Usa o ${esc(terceiro.nome)}`, 'Um terceiro que te envia os emails por ela', '', true) : '',
    ...pedidosDaEmpresa.filter((pedido) => pedido.status === 'closed').map((pedido) => opcao(`data-action="ver-pedido" data-id="${esc(pedido.id)}"`, `Pedido anterior: ${esc(RIGHTS[pedido.right].short.toLowerCase())}`, esc(descreverPedido(pedido)), '', true))
  ].join('');
  const mais = no.empresa ? `<details data-mais="${esc(no.id)}" class="guia mt-6 lg:mt-5 overflow-hidden rounded-2xl border border-slate-700/70 bg-slate-900"${renderPainelEmpresa.maisAberto === no.id ? ' open' : ''}>
      <summary class="flex cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-[0.9375rem] font-semibold text-slate-100 lg:py-3">Mais opções
        <svg viewBox="0 0 16 16" class="guia-seta h-4 w-4 shrink-0 text-slate-400 transition" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
      </summary>
      <div class="divide-y divide-slate-800 border-t border-slate-800">
        ${extras}
        <div class="px-4 py-3.5 text-sm leading-6 text-slate-300">
          <p class="font-semibold text-slate-100">Porque aparece aqui</p>
          ${porqueEstaEmpresa(no.empresa)}
          <button data-action="descartar" data-id="${esc(no.id)}" type="button" class="mt-3 font-semibold text-slate-100 underline decoration-slate-500 underline-offset-4">Não tenho dados aqui</button>
        </div>
        <p class="px-4 py-3.5 text-xs leading-5 text-slate-300">${esc(descreverContacto(no.empresa))}${no.empresa.contactSource ? ` <a href="${esc(no.empresa.contactSource)}" target="_blank" rel="noopener noreferrer" class="font-semibold text-slate-100 underline underline-offset-2">Fonte</a>` : ''}</p>
      </div>
    </details>` : '';

  // No computador, se a empresa não couber na coluna, um esbatido em baixo mostra que há mais (em vez de um corte seco)
  const fimDoPainel = '<div class="pointer-events-none sticky -bottom-5 -mx-5 -mb-5 hidden h-8 bg-gradient-to-t from-[#262028] to-transparent lg:block" aria-hidden="true"></div>';
  return `${cabecalho(esc(no.name), `${esc(setor.label)}${ev ? ` · ≈ ${ev.totalRecebidos ?? ev.count} emails` : ''}`, avatar(esc(no.empresa?.icon || (no.name[0] || '?').toUpperCase()), no.situacao))}
    ${sensibilidade(no.gravidade, no.motivo)}
    ${noticias}
    ${principal}
    ${outrosPedidos}
    ${mais}
    <div class="h-12 lg:hidden" aria-hidden="true"></div>
    ${fimDoPainel}`;
}

// A cor do estado de um pedido: âmbar se está atrasado, verde se já foi enviado (é algo que fizeste)
function corDoPedido() {
  return 'text-slate-200';
}

// Um quadrado pequeno da cor do estado do pedido, antes do texto
function marcaDoPedido(pedido) {
  return `<span class="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm align-[-1px] ${ESTADOS_EMPRESA[estadoDoPedido(pedido).chave].fundo}"></span>`;
}

// Uma notícia na empresa: o título e porque importa, com dois botões à vista:
// "Ler o resumo" abre o resto aqui mesmo, e o outro leva à notícia original (noticiasAbertas: no início do ficheiro)
function itemDeNoticia(noticia, comEmpresa = false) {
  const tipo = TIPOS_NOTICIA[noticia.tipo]?.label || 'Notícia';
  const proprio = comEmpresa ? ` · ${esc(noticia.empresa)}` : '';
  const aberta = noticiasAbertas.has(noticia.id);
  return `<article class="rounded-2xl border border-slate-700/70 bg-slate-900 p-4 lg:p-3.5">
    <p class="text-xs font-semibold text-slate-300">${esc(tipo)}${proprio} · ${formatarData(noticia.data)} · ${esc(noticia.fonte.nome)}${noticia.estado === 'por_confirmar' ? ' · por confirmar' : ''}</p>
    <p class="mt-1.5 text-[0.9375rem] font-semibold leading-snug text-white">${esc(noticia.titulo)}</p>
    ${aberta
      ? `<p class="mt-2 text-sm leading-6 text-slate-200">${esc(noticia.resumo)}</p>
         <p class="mt-2 text-sm leading-6 text-slate-200"><span class="font-semibold text-white">Porque importa:</span> ${esc(noticia.importa)}</p>`
      : `<p class="mt-1.5 line-clamp-2 text-sm leading-6 text-slate-200">${esc(noticia.importa)}</p>`}
    <div class="mt-3 flex flex-wrap gap-2">
      <button data-action="expandir-noticia" data-id="${esc(noticia.id)}" type="button" aria-expanded="${aberta}"
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-600 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-slate-400">
        ${aberta ? 'Mostrar menos' : 'Ler o resumo'}
        <svg viewBox="0 0 16 16" class="h-3.5 w-3.5 transition ${aberta ? 'rotate-180' : ''}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>
      </button>
      <a href="${esc(noticia.fonte.url)}" target="_blank" rel="noopener noreferrer" data-action="abrir-fonte" data-id="${esc(noticia.id)}"
        class="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-ink transition hover:bg-white" aria-label="Abrir a notícia em ${esc(noticia.fonte.nome)}">Abrir a notícia <span aria-hidden="true">↗</span></a>
    </div>
  </article>`;
}

function linhaDoMapa(no, mostrarArea) {
  const setor = SECTORS[no.sector] || SECTORS.outros;
  const texto = no.ultimo ? `${RIGHTS[no.ultimo.right].short}: ${descreverPedido(no.ultimo)}` : 'Ainda sem pedido';
  return `<button data-action="abrir-empresa" data-id="${esc(no.id)}" type="button" class="flex w-full items-center gap-3 py-2.5 text-left">
    <span class="min-w-0 flex-1">
      <span class="block truncate text-sm font-semibold">${esc(no.name)}</span>
      <span class="mt-0.5 flex items-center gap-1.5 truncate text-xs text-mist">${iconeGravidade(no.gravidade, 8)}<span>${SEVERITY[no.gravidade].label}</span>${mostrarArea ? `<span>·</span><span>${esc(setor.short)}</span>` : ''}<span>·</span><span class="truncate">${esc(texto)}</span></span>
    </span>
    <span class="shrink-0 text-slate-500">${icone('seta', 'h-4 w-4')}</span>
  </button>`;
}

function alternarSelecao(tipo, chave) {
  const igual = selecaoMapa && selecaoMapa.tipo === tipo && selecaoMapa.chave === chave;
  selecaoMapa = igual ? null : { tipo, chave };
  if (selecaoMapa?.tipo === 'empresa') registarEmpresaAberta(chave);
  renderPainel();
}

function mostrarPedido(pedidoId) {
  // Os pedidos estão na página Pedidos: vai até lá e realça o cartão
  if (vistaAtual() !== 'pedidos') {
    location.hash = '#pedidos';
    setTimeout(() => mostrarPedido(pedidoId), 350);
    return;
  }
  const cartao = document.getElementById(`pedido-${pedidoId}`);
  if (!cartao) return;
  cartao.scrollIntoView({ behavior: 'smooth', block: 'center' });
  cartao.classList.add('ring-2', 'ring-lime');
  setTimeout(() => cartao.classList.remove('ring-2', 'ring-lime'), 1800);
}

function plural(n, um, varios) {
  return n === 1 ? um : varios;
}

function criarCartaoPedido(pedido) {
  const direito = RIGHTS[pedido.right];
  const balde = baldeDoPedido(pedido);
  const setor = SECTORS[pedido.companySector] || SECTORS.outros;
  const prazo = pedido.dueDate ? diasAte(pedido.dueDate) : null;
  let linhaPrazo = '';
  if (pedido.status === 'sent' && prazo !== null) {
    linhaPrazo = prazo >= 0
      ? `<span class="text-slate-300">Prazo: ${formatarData(pedido.dueDate)} · ${prazo === 0 ? 'termina hoje' : `faltam ${prazo} ${prazo === 1 ? 'dia' : 'dias'}`}</span>`
      : `<span class="font-semibold text-white">Prazo terminou a ${formatarData(pedido.dueDate)} · há ${-prazo} ${prazo === -1 ? 'dia' : 'dias'}</span>`;
  }

  const acoes = [];
  if (pedido.status === 'draft') {
    acoes.push(botao('reabrir', pedido.id, 'Abrir na app de email', 'primary'), botao('apagar-rascunho', pedido.id, 'Apagar rascunho', 'ghost'));
  } else if (pedido.status === 'awaiting_confirmation') {
    acoes.push(botao('confirmar-envio', pedido.id, 'Sim, enviei', 'primary'), botao('nao-enviado', pedido.id, 'Ainda não', 'secondary'));
  } else if (pedido.status === 'sent') {
    acoes.push(botao('resposta', pedido.id, 'Registar resposta', 'primary'));
    if (prazo !== null && prazo < 0) {
      acoes.push(botao('insistir', pedido.id, pedido.followUpAt ? 'Insistir de novo' : 'Enviar insistência', 'secondary'), botao('sem-resposta', pedido.id, 'Marcar sem resposta', 'ghost'));
    }
  } else if (pedido.status === 'reply_received' && pedido.holdsData === null) {
    acoes.push(botao('resposta', pedido.id, 'Registar o resultado', 'primary'));
  }
  if (balde === 'confirmado' && pedido.right !== 'erasure' && obterEmpresa(pedido.companyId)) {
    acoes.push(`<button data-action="pedido" data-id="${esc(pedido.companyId)}" data-right="erasure" type="button" class="rounded-lg bg-white px-3 py-2 text-xs font-bold text-ink">Pedir apagamento</button>`);
  }

  // "Enviar novamente" em todos os pedidos ainda abertos (também com uma resposta por registar)
  const reenviar = pedido.email && (['sent', 'awaiting_confirmation'].includes(pedido.status) || (pedido.status === 'reply_received' && pedido.holdsData === null));
  const resultado = pedido.outcome ? `<span class="shrink-0 rounded-full bg-slate-800 px-2 py-0.5 text-[0.6875rem] font-bold text-slate-200">${esc(OUTCOMES[pedido.outcome].badge)}</span>` : '';

  return `<article id="pedido-${esc(pedido.id)}" class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="flex items-center gap-2 font-semibold"><span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${['critica', 'alta'].includes(gravidadeDe(obterEmpresa(pedido.companyId) || { sector: pedido.companySector || 'outros' }).chave) ? 'bg-risco' : 'bg-slate-800'}" aria-hidden="true">${esc((pedido.companyName[0] || '?').toUpperCase())}</span>${esc(pedido.companyName)} <span class="text-slate-500" title="${esc(setor.label)}">${icone(pedido.companySector || 'outros', 'h-3.5 w-3.5')}</span></p>
        <p class="mt-0.5 text-xs text-mist">${esc(direito.short)} · ${esc(direito.article)}</p>
      </div>
      ${(reenviar) || resultado ? `<div class="flex shrink-0 flex-col items-end gap-1.5">
        ${reenviar ? `<button data-action="enviar-novamente" data-id="${esc(pedido.id)}" type="button" class="rounded-lg border border-slate-700 px-2.5 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-500">Enviar novamente</button>` : ''}
        ${resultado}
      </div>` : ''}
    </div>
    <div class="mt-3 flex flex-col gap-1 text-xs text-mist">
      <span>${esc(pedido.via === 'veto' && pedido.status === 'sent' ? 'Enviado pelo Veto, do teu Gmail' : STATUS_LABELS[pedido.status])}</span>
      ${pedido.sentAt ? `<span>Enviado a ${formatarData(pedido.sentAt)}${pedido.email ? ` para ${esc(pedido.email.replace(/^https?:\/\/(www\.)?/, '').split(/[/?#]/)[0])}` : ''}${pedido.followUpAt ? ` · insistência a ${formatarData(pedido.followUpAt)}` : ''}</span>` : ''}
      ${linhaPrazo}
      ${pedido.replyAt && pedido.outcome !== 'no_reply' ? `<span>Resposta a ${formatarData(pedido.replyAt)}</span>` : ''}
    </div>
    ${acoes.length ? `<div class="mt-3 flex flex-wrap gap-2">${acoes.join('')}</div>` : ''}
  </article>`;
}

function botao(acao, id, texto, estilo) {
  const estilos = {
    primary: 'bg-white text-ink',
    secondary: 'bg-slate-800 text-slate-200',
    ghost: 'text-slate-400 underline decoration-slate-700 underline-offset-4'
  };
  return `<button data-action="${acao}" data-id="${esc(id)}" type="button" class="rounded-lg px-3 py-2 text-xs font-bold ${estilos[estilo]}">${esc(texto)}</button>`;
}

function descreverPedido(pedido) {
  if (pedido.status === 'awaiting_confirmation') return 'à espera de confirmação';
  if (pedido.status === 'sent') {
    const dias = diasAte(pedido.dueDate);
    return dias < 0 ? `em atraso há ${-dias} ${dias === -1 ? 'dia' : 'dias'}` : `enviado, prazo a ${formatarData(pedido.dueDate)}`;
  }
  if (pedido.outcome) return OUTCOMES[pedido.outcome].badge.toLowerCase();
  return STATUS_LABELS[pedido.status].toLowerCase();
}

/* ==========================================================================
   Ações no Gmail (Veto+, abertas a todos durante o teste)
   - Pedir a várias empresas: o mesmo direito, um email a cada empresa, enviado
     pelo Gmail só depois de a pessoa ver exatamente o que sai e aceitar.
   - Apagar os emails de uma empresa: o Veto move-os para o Lixo do Gmail.
   Cada ação pede ao Google só a autorização de que precisa, no próprio clique,
   e cancela-a logo a seguir, como na análise.
   ========================================================================== */
// Tem de correr no próprio clique: senão, o browser bloqueia a janela do Google.
function autorizarGmail(scopes, aoAutorizar, aoFalhar) {
  const clientId = document.getElementById('google-client-id').value.trim() || GOOGLE_CLIENT_ID;
  if (!clientId || location.protocol === 'file:') {
    aoFalhar('A autorização do Google não está disponível. Recarrega a página e tenta outra vez.');
    return;
  }
  if (!googlePronto()) {
    // Não se pode esperar aqui (a janela do Google tem de abrir no clique): tenta carregar para o próximo
    const bloqueado = window.vetoGoogle === 'falhou' || window.vetoGoogle === 'carregou';
    esperarGoogle();
    aoFalhar(bloqueado ? textoGoogleIndisponivel('bloqueado') : 'O login do Google ainda está a carregar. Tenta outra vez daqui a uns segundos.');
    return;
  }
  const cliente = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: scopes.join(' '),
    include_granted_scopes: false,
    // Sugere ao Google a conta que foi analisada
    ...(estado.contaEmail ? { login_hint: estado.contaEmail } : {}),
    error_callback: (erro) => aoFalhar(erro?.type === 'popup_failed_to_open'
      ? 'O browser bloqueou a janela do Google. Permite pop-ups para este site e tenta outra vez.'
      : 'A janela do Google fechou antes de terminares.'),
    callback: (resposta) => {
      if (resposta.error) {
        aoFalhar(resposta.error === 'access_denied' ? 'Não deste autorização no Google.' : `O Google recusou a autorização (${resposta.error}).`);
        return;
      }
      if (google.accounts.oauth2.hasGrantedAllScopes?.(resposta, ...scopes) === false) {
        revogarAcesso(resposta.access_token);
        aoFalhar('No ecrã do Google, a permissão ficou por marcar. Tenta outra vez e marca a caixa.');
        return;
      }
      aoAutorizar(resposta.access_token);
    }
  });
  cliente.requestAccessToken();
}

function revogarAcesso(token) {
  try { google.accounts.oauth2.revoke(token, () => {}); } catch (erro) { /* o acesso já expirou */ }
}

// Tudo acontece na conta que foi analisada: é a esse endereço que as empresas associam os dados.
async function confirmarConta(token, comGmail) {
  let conta = '';
  if (comGmail) {
    conta = (await gmailFetch('/profile', token, GMAIL_QUOTA.CUSTO_LIST).catch(() => null))?.emailAddress || '';
  } else {
    const resposta = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null);
    conta = resposta?.ok ? ((await resposta.json().catch(() => ({}))).email || '') : '';
  }
  if (!conta) throw new Error('Não conseguimos confirmar a tua conta Google. Tenta outra vez.');
  if (estado.contaEmail && conta.toLowerCase() !== estado.contaEmail.toLowerCase()) {
    throw new Error(`Escolheste ${conta} no Google, mas analisaste ${estado.contaEmail}. Tenta outra vez com ${estado.contaEmail}.`);
  }
  if (!estado.contaEmail) {
    estado.contaEmail = conta;
    guardarEstado();
  }
  return conta;
}

function abrirSeparador(url) {
  const janela = window.open(url, '_blank');
  if (janela) janela.opener = null;
  else window.location.href = url;
}

function urlPesquisaGmail(pesquisa) {
  return `https://mail.google.com/mail/${estado.contaEmail ? `?authuser=${encodeURIComponent(estado.contaEmail)}` : 'u/0/'}#search/${encodeURIComponent(pesquisa)}`;
}

// Email em texto simples, no formato que o Gmail espera (RFC 2822, em base64url).
// O assunto e o texto vão em UTF-8 (base64), para os acentos chegarem certos.
function base64Utf8(texto) {
  const bytes = new TextEncoder().encode(texto);
  let binario = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binario);
}

function cabecalhoUtf8(texto) {
  // Palavras codificadas com até 75 caracteres cada (RFC 2047)
  const partes = [];
  let atual = '';
  for (const letra of texto) {
    if (new TextEncoder().encode(atual + letra).length > 45) {
      partes.push(atual);
      atual = '';
    }
    atual += letra;
  }
  if (atual) partes.push(atual);
  return partes.map((parte) => `=?UTF-8?B?${base64Utf8(parte)}?=`).join('\r\n ');
}

const EMAIL_SEGURO = /^[^\s@<>,;:"()[\]\\]+@[^\s@<>,;:"()[\]\\]+\.[a-z]{2,}$/i;
function mensagemRaw(para, assunto, corpo) {
  if (!EMAIL_SEGURO.test(para)) throw new Error('o endereço da empresa não é válido');
  const mensagem = [
    `To: ${para}`,
    `Subject: ${cabecalhoUtf8(assunto)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset="UTF-8"',
    'Content-Transfer-Encoding: base64',
    '',
    base64Utf8(corpo.replace(/\r?\n/g, '\r\n')).replace(/.{76}/g, '$&\r\n')
  ].join('\r\n');
  return base64Utf8(mensagem).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/* --- Pedir a várias empresas ---------------------------------------------- */

// Todas as empresas, com o motivo por que algumas ficam fora deste envio
function empresasParaLote(right) {
  return visiveis().map((empresa) => {
    const aberto = estado.pedidos.some((pedido) => pedido.companyId === empresa.id && pedido.right === right && !['closed', 'draft'].includes(pedido.status));
    let fora = '';
    if (aberto) fora = 'aberto';
    else if (!empresa.dpo_email) fora = empresa.privacyForm ? 'formulario' : 'sem_contacto';
    return { empresa, fora, gravidade: gravidadeDe(empresa).chave };
  }).sort((a, b) => SEVERITY_ORDER.indexOf(a.gravidade) - SEVERITY_ORDER.indexOf(b.gravidade) || a.empresa.name.localeCompare(b.empresa.name));
}

function abrirLote(onde = 'pedidos', right = 'access') {
  lote = { passo: 'escolher', right, selecionadas: new Set(), envios: [], erro: '', onde };
  registarEvento('lote_aberto', { onde });
  const caixa = document.getElementById('lote');
  caixa.classList.remove('hidden');
  caixa.classList.add('flex');
  renderLote();
  document.getElementById('lote-painel').focus();
}

function fecharLote() {
  if (!lote || lote.passo === 'enviar') return; // a meio do envio, a janela fica aberta
  const acabou = lote.passo === 'fim';
  lote = null;
  const caixa = document.getElementById('lote');
  caixa.classList.add('hidden');
  caixa.classList.remove('flex');
  document.getElementById('lote-painel').innerHTML = '';
  if (acabou) renderTudo();
}

function renderLote() {
  if (!lote) return;
  const painel = document.getElementById('lote-painel');
  const direito = RIGHTS[lote.right];
  const conta = estado.contaEmail;
  const contar = (n, um, varios) => `${n} ${plural(n, um, varios)}`;
  const fechar = lote.passo === 'enviar' ? '' : `<button data-action="lote-fechar" type="button" aria-label="Fechar" class="-mr-1 -mt-1 shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"><svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>`;
  const topo = (titulo, texto) => `
    <div class="flex items-start justify-between gap-3 px-5 pt-5 lg:px-7 lg:pt-7">
      <div class="min-w-0">
        <h2 id="lote-titulo" class="flex items-center gap-2 font-display text-lg font-semibold">${titulo}</h2>
        ${texto ? `<p class="mt-1 text-sm leading-5 text-mist">${texto}</p>` : ''}
      </div>
      ${fechar}
    </div>`;
  const rodape = (botoes) => `<div class="flex flex-col-reverse gap-2 border-t border-slate-800 px-5 py-4 lg:flex-row lg:justify-end lg:px-7">${botoes}</div>`;
  const botaoLote = (acao, texto, estilo, extra = '') => `<button data-action="${acao}" type="button" ${extra} class="rounded-xl px-4 py-3 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${estilo === 'primary' ? 'bg-white text-ink' : estilo === 'secondary' ? 'bg-slate-800 text-slate-100' : 'text-slate-400'}">${texto}</button>`;
  const erro = lote.erro ? `<p role="alert" class="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2.5 text-xs leading-5 text-rose-100">${esc(lote.erro)}</p>` : '';

  if (lote.passo === 'escolher') {
    const todas = empresasParaLote(lote.right);
    const prontas = todas.filter((item) => !item.fora);
    const fora = todas.filter((item) => item.fora);
    // Sai da seleção quem deixou de poder ir (por exemplo, ao mudar de direito)
    lote.selecionadas.forEach((id) => { if (!prontas.some((item) => item.empresa.id === id)) lote.selecionadas.delete(id); });
    const n = lote.selecionadas.size;
    // "Fora deste envio" fica como estava (aberto por quem o abriu, ou aberto se não houver mais nada)
    const detalhesFora = painel.querySelector('details[data-lote-fora]');
    const foraAberto = detalhesFora ? detalhesFora.open : !prontas.length;
    const textoAberto = Boolean(painel.querySelector('details[data-lote-texto]')?.open);
    const semCatalogo = avisoDoCatalogo();
    const linha = ({ empresa, gravidade }) => `
      <label class="flex cursor-pointer items-center gap-3 border-b border-slate-800 py-2.5 last:border-b-0">
        <input type="checkbox" data-lote-empresa="${esc(empresa.id)}" class="h-4 w-4 shrink-0 accent-lime"${lote.selecionadas.has(empresa.id) ? ' checked' : ''}>
        <span class="min-w-0 flex-1">
          <span class="flex items-center gap-1.5 text-sm font-semibold"><span class="truncate">${esc(empresa.name)}</span><span class="text-slate-500" title="${esc((SECTORS[empresa.sector] || SECTORS.outros).label)}">${icone(empresa.sector || 'outros', 'h-3.5 w-3.5')}</span></span>
          <span class="mt-0.5 flex items-center gap-1.5 text-xs text-mist">${iconeGravidade(gravidade, 8)}<span class="truncate">${esc(empresa.dpo_email)}</span></span>
        </span>
      </label>`;
    const motivos = {
      aberto: `Já tens um pedido de ${direito.short.toLowerCase()} aberto`,
      formulario: 'Só aceita o formulário dela: pede-lhe nos resultados',
      sem_contacto: 'Contacto por confirmar'
    };
    const linhaFora = ({ empresa, fora: motivo }) => `
      <div class="flex items-center gap-3 border-b border-slate-800 py-2.5 last:border-b-0">
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-semibold text-slate-300">${esc(empresa.name)}</span>
          <span class="mt-0.5 block text-xs text-mist">${motivos[motivo]}</span>
        </span>
        ${motivo === 'sem_contacto' ? `<button data-action="lote-indicar" data-id="${esc(empresa.id)}" type="button" class="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-200">Indicar email</button>` : ''}
      </div>`;
    painel.innerHTML = `
      ${topo(`Pedir a várias empresas ${SELO_PLUS}`, `O mesmo pedido, um email a cada empresa, enviado do teu Gmail${conta ? ` (${esc(conta)})` : ''}. Antes de sair, vês tudo o que vai ser enviado.`)}
      <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-5 lg:px-7">
        ${semCatalogo ? `<p role="status" class="mt-5 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-xs leading-5 text-amber-100">${esc(semCatalogo)} Até lá, indica o email de cada empresa em «Fora deste envio».</p>` : ''}
        <p class="mt-5 text-xs font-semibold text-slate-400">O que pedes</p>
        <div class="mt-2 grid grid-cols-2 gap-2">
          ${DIREITOS_NO_MAPA.map(({ right, titulo, frase }) => `
            <button data-action="lote-direito" data-right="${right}" type="button" aria-pressed="${right === lote.right}"
              class="flex flex-col rounded-xl border p-3 text-left transition ${right === lote.right ? 'border-lime bg-lime/10' : 'border-slate-800 bg-ink/60 hover:border-slate-600'}">
              <span class="text-sm font-semibold">${titulo}</span>
              <span class="mt-1 text-xs leading-4 text-mist">${frase}</span>
            </button>`).join('')}
        </div>
        <!-- O texto que vai sair, visível antes de escolher a quem -->
        <details data-lote-texto class="mt-3 rounded-xl border border-slate-800 px-3"${textoAberto ? ' open' : ''}>
          <summary class="cursor-pointer py-2.5 text-xs font-semibold text-slate-300">Ver o texto do email</summary>
          <p class="text-xs leading-4 text-mist">Assunto: ${esc(direito.subject)}</p>
          <div class="mb-3 mt-2 max-h-56 overflow-y-auto whitespace-pre-wrap rounded-lg bg-ink/70 p-3 text-xs leading-5 text-slate-200">${esc(direito.body('[nome da empresa]'))}</div>
        </details>
        <div class="mt-6 flex items-end justify-between gap-3">
          <p class="text-xs font-semibold text-slate-400">A quem · ${contar(prontas.length, 'empresa com email', 'empresas com email')}</p>
          ${prontas.length ? `<button data-action="lote-todas" type="button" class="shrink-0 text-xs font-semibold text-lime">${n === prontas.length ? 'Limpar a seleção' : 'Selecionar todas'}</button>` : ''}
        </div>
        <div class="mt-1">${prontas.length ? prontas.map(linha).join('') : '<p class="py-4 text-center text-xs text-mist">Nenhuma empresa com email para este pedido.</p>'}</div>
        ${fora.length ? `
          <details data-lote-fora class="mt-5 rounded-xl border border-slate-800 px-3"${foraAberto ? ' open' : ''}>
            <summary class="cursor-pointer py-2.5 text-xs font-semibold text-slate-400">Fora deste envio · ${fora.length}</summary>
            <div class="pb-1">${fora.map(linhaFora).join('')}</div>
          </details>` : ''}
      </div>
      ${rodape(botaoLote('lote-rever', n ? `Rever ${contar(n, 'pedido', 'pedidos')}` : 'Escolhe as empresas', 'primary', n ? '' : 'disabled'))}`;
    return;
  }

  if (lote.passo === 'rever') {
    const envios = lote.envios;
    const primeira = envios[0];
    const unica = lote.unica;
    painel.innerHTML = `
      ${unica
        ? topo(`Pedir à ${esc(primeira.nome)}: ${esc(direito.label.toLowerCase())}`, 'Se aceitares, o Veto envia este email pelo teu Gmail. Se preferires enviá-lo tu, abre-o no teu email.')
        : topo('Confirma o que vai ser enviado', `Depois de aceitares, o Veto envia ${envios.length === 1 ? 'este email' : `estes ${envios.length} emails`} pelo teu Gmail, sem mais perguntas.`)}
      <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-5 lg:px-7">
        ${erro}
        <dl class="mt-4 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-3 gap-y-2.5 text-sm">
          <dt class="text-mist">De</dt><dd class="truncate font-semibold">${conta ? esc(conta) : 'A conta que escolheres no Google (usa a que analisaste)'}</dd>
          <dt class="text-mist">Para</dt>
          <dd>
            ${unica
              ? `<span class="font-semibold">${esc(primeira.email)}</span>`
              : `<ul class="max-h-40 overflow-y-auto rounded-xl border border-slate-800 px-3">
              ${envios.map((envio) => `<li class="flex items-baseline justify-between gap-3 border-b border-slate-800 py-2 last:border-b-0"><span class="truncate font-semibold">${esc(envio.nome)}</span><span class="truncate text-xs text-mist">${esc(envio.email)}</span></li>`).join('')}
            </ul>`}
          </dd>
          <dt class="text-mist">Assunto</dt><dd class="font-semibold leading-5">${esc(direito.subject)}</dd>
        </dl>
        ${lote.right === 'erasure' ? `<p class="mt-4 rounded-xl border border-amber-400/30 bg-amber-400/10 px-3 py-2.5 text-xs leading-5 text-amber-100">${unica
          ? `Se ainda usas a tua conta na ${esc(primeira.nome)}, pensa bem: o apagamento pode fechá-la.`
          : 'Se ainda usas alguma destas contas, volta atrás e tira-a da lista: o apagamento pode fechá-la.'}</p>` : ''}
        <p class="mt-4 flex gap-2.5 rounded-xl bg-ink/70 px-3 py-2.5 text-xs leading-5 text-slate-300"><span class="mt-0.5 text-lime">${icone('cadeado', 'h-4 w-4')}</span><span>O Google vai pedir-te autorização para enviar emails em teu nome. O Veto usa-a só para ${envios.length === 1 ? 'este email' : `estes ${envios.length} emails`} e cancela-a logo a seguir. As cópias ficam na tua pasta Enviados e as respostas chegam à tua caixa de entrada.</span></p>
        <p class="mt-5 text-xs font-semibold text-slate-400">Texto do email${envios.length > 1 ? ` à ${esc(primeira.nome)}` : ''}</p>
        <div class="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl bg-ink/70 p-3.5 text-xs leading-5 text-slate-200">${esc(direito.body(primeira.nome))}</div>
        ${envios.length > 1 ? '<p class="mt-2 text-xs leading-4 text-mist">Em cada email muda só o nome da empresa.</p>' : ''}
      </div>
      ${rodape(unica
        ? `${botaoLote('lote-manual', 'Abrir no meu email', 'secondary')}${botaoLote('lote-enviar', 'Aceitar e enviar', 'primary')}`
        : `${botaoLote('lote-voltar', 'Voltar', 'ghost')}${botaoLote('lote-enviar', `Aceitar e enviar ${contar(envios.length, 'pedido', 'pedidos')}`, 'primary')}`)}`;
    return;
  }

  // A enviar e no fim: uma linha por empresa, com o que aconteceu
  const enviados = lote.envios.filter((envio) => envio.estado === 'enviado').length;
  const falhados = lote.envios.filter((envio) => envio.estado === 'falhou');
  const estadoDoEnvio = {
    espera: '<span class="text-xs text-slate-500">Na fila</span>',
    a_enviar: '<span class="text-xs font-semibold text-slate-200"><span class="animate-pulse">A enviar</span></span>',
    enviado: '<span class="flex items-center gap-1 text-xs font-semibold text-lime"><svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>Enviado</span>',
    falhou: '<span class="text-xs font-semibold text-rose-200">Não enviado</span>'
  };
  const lista = `<ul class="mt-4 rounded-xl border border-slate-800 px-3" aria-live="polite">
    ${lote.envios.map((envio) => `<li class="border-b border-slate-800 py-2.5 last:border-b-0">
      <div class="flex items-center justify-between gap-3"><span class="truncate text-sm font-semibold">${esc(envio.nome)}</span>${estadoDoEnvio[envio.estado]}</div>
      ${envio.motivo ? `<p class="mt-1 text-xs leading-4 text-rose-100/80">${esc(envio.motivo)}</p>` : ''}
    </li>`).join('')}
  </ul>`;

  if (lote.passo === 'enviar') {
    const feitos = lote.envios.filter((envio) => ['enviado', 'falhou'].includes(envio.estado)).length;
    painel.innerHTML = `
      ${lote.unica ? topo('A enviar o pedido', 'Não feches esta página até terminar.') : topo('A enviar os pedidos', `${feitos} de ${lote.envios.length}. Não feches esta página até terminar.`)}
      <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-6 lg:px-7">${lista}</div>`;
    return;
  }

  const prazo = estado.pedidos.find((pedido) => pedido.lote === lote.id)?.dueDate;
  if (lote.unica) {
    const nome = esc(lote.envios[0].nome);
    painel.innerHTML = `
      ${topo(enviados ? `Pedido enviado à ${nome}` : 'O pedido não saiu',
        enviados ? `A ${nome} tem até ${formatarData(prazo)} para responder. Acompanha-o na página Pedidos.` : 'Vê o motivo abaixo. Podes tentar de novo ou abri-lo no teu email.')}
      <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-5 lg:px-7">${lista}</div>
      ${rodape(enviados
        ? `${botaoLote('lote-gmail', 'Ver no Gmail', 'secondary')}${botaoLote('lote-mapa', 'Ver os pedidos', 'primary')}`
        : `${botaoLote('lote-manual', 'Abrir no meu email', 'ghost')}${botaoLote('lote-repetir', 'Tentar de novo', 'primary')}`)}`;
    return;
  }
  painel.innerHTML = `
    ${topo(enviados === lote.envios.length ? `${contar(enviados, 'pedido enviado', 'pedidos enviados')}` : `${enviados} de ${lote.envios.length} pedidos enviados`,
      enviados ? `As empresas têm até ${formatarData(prazo)} para responder. Acompanha-os na página Pedidos.` : 'Nenhum pedido saiu. Vê o motivo abaixo.')}
    <div class="min-h-0 flex-1 overflow-y-auto px-5 pb-5 lg:px-7">${lista}</div>
    ${rodape(`${falhados.length ? botaoLote('lote-repetir', `Tentar de novo ${falhados.length === 1 ? 'o que falhou' : `os ${falhados.length} que falharam`}`, 'ghost') : ''}${enviados ? botaoLote('lote-gmail', 'Ver no Gmail', 'secondary') : ''}${botaoLote(enviados ? 'lote-mapa' : 'lote-fechar', enviados ? 'Ver os pedidos' : 'Fechar', 'primary')}`)}`;
}

function reverLote(empresasIds = [...lote.selecionadas]) {
  lote.envios = empresasIds.map(obterEmpresa).filter((empresa) => empresa?.dpo_email)
    .map((empresa) => ({ id: empresa.id, nome: empresa.name, email: empresa.dpo_email, estado: 'espera', motivo: '' }));
  if (!lote.envios.length) return;
  lote.passo = 'rever';
  lote.erro = '';
  registarEvento('lote_revisto', { direito: lote.right, pedidos: lote.envios.length });
  renderLote();
}

// Chamado no clique em "Aceitar e enviar"
function aceitarLote() {
  if (!lote || lote.passo !== 'rever') return;
  lote.erro = '';
  autorizarGmail([GMAIL_SEND_SCOPE, EMAIL_SCOPE], (token) => enviarLote(token), (mensagem) => {
    if (!lote) return;
    lote.erro = `${mensagem} Nenhum pedido foi enviado.`;
    registarEvento('lote_interrompido', { motivo: 'autorizacao' });
    renderLote();
  });
}

async function enviarLote(token) {
  try {
    await confirmarConta(token, false);
  } catch (erro) {
    revogarAcesso(token);
    lote.erro = `${erro.message} Nenhum pedido foi enviado.`;
    registarEvento('lote_interrompido', { motivo: 'conta' });
    renderLote();
    return;
  }
  const direito = RIGHTS[lote.right];
  lote.id = gerarId();
  lote.passo = 'enviar';
  renderLote();
  // Um de cada vez: cada email só sai depois de o anterior estar confirmado
  for (const envio of lote.envios) {
    envio.estado = 'a_enviar';
    envio.motivo = '';
    renderLote();
    const empresa = obterEmpresa(envio.id);
    try {
      const resposta = await gmailFetch('/messages/send', token, GMAIL_QUOTA.CUSTO_SEND, 0, {
        corpo: { raw: mensagemRaw(envio.email, direito.subject, direito.body(envio.nome)) },
        repetirSeFalhar: false
      });
      criarPedidoEnviado(empresa || { id: envio.id, name: envio.nome, sector: 'outros', domain: envio.id }, lote.right, envio.email, { lote: lote.id, gmailThreadId: resposta.threadId || '' }, lote.unica ? 'veto' : 'veto_lote');
      envio.estado = 'enviado';
    } catch (erro) {
      envio.estado = 'falhou';
      envio.motivo = `Não foi enviado: ${erro.message}.`;
    }
  }
  revogarAcesso(token);
  const enviados = lote.envios.filter((envio) => envio.estado === 'enviado').length;
  if (!lote.unica) registarEvento('lote_enviado', { direito: lote.right, pedidos: enviados, falhados: lote.envios.length - enviados, onde: lote.onde });
  lote.passo = 'fim';
  renderLote();
}

// Um pedido que saiu pelo Gmail: já está enviado e o prazo começa a contar
function criarPedidoEnviado(empresa, right, email, extra = {}, app = 'veto_lote') {
  const agora = new Date().toISOString();
  const pedido = {
    id: gerarId(), companyId: empresa.id, companyName: empresa.name, companySector: empresa.sector, domain: empresa.domain,
    channel: 'email', email, right, status: 'sent', createdAt: agora, sentAt: agora, dueDate: estimarPrazo(agora),
    replyAt: null, closedAt: null, closeReason: null, outcome: null, holdsData: null, followUpAt: null,
    demo: false, via: 'veto', ...extra, timeline: [{ to: 'sent', at: agora }]
  };
  estado.pedidos.push(pedido);
  guardarEstado(); // guardado logo, para não se perder se a página fechar a meio
  registarEvento('pedido_enviado', { demo: false, direito: right, area: empresa.sector, canal: 'email', app, contacto: origemDoContacto(empresa) });
  return pedido;
}

// O mesmo que em "Confirma o contacto": o email vem da política de privacidade, indicado pela pessoa
function indicarContactoNoLote(empresaId) {
  const empresa = obterEmpresa(empresaId);
  if (!empresa || !lote) return;
  const email = (window.prompt(`Email de privacidade da ${empresa.name} (está na política de privacidade dela):`) || '').trim();
  if (!email) return;
  if (!EMAIL_SEGURO.test(email)) {
    mostrarToast('Esse email não parece válido.');
    return;
  }
  empresa.dpo_email = email;
  empresa.contactUser = true;
  guardarEstado();
  registarEvento('contacto_indicado', { area: empresa.sector, onde: 'lote' });
  if (!empresasParaLote(lote.right).find((item) => item.empresa.id === empresaId)?.fora) lote.selecionadas.add(empresaId);
  renderLote();
}

function tratarCliqueLote(acao, alvo) {
  if (!lote) return;
  switch (acao) {
    case 'lote-fechar': fecharLote(); break;
    case 'lote-direito': lote.right = alvo.dataset.right; renderLote(); break;
    case 'lote-todas': {
      const prontas = empresasParaLote(lote.right).filter((item) => !item.fora).map((item) => item.empresa.id);
      lote.selecionadas = lote.selecionadas.size === prontas.length ? new Set() : new Set(prontas);
      renderLote();
      break;
    }
    case 'lote-indicar': indicarContactoNoLote(alvo.dataset.id); break;
    case 'lote-rever': reverLote(); break;
    case 'lote-voltar': lote.passo = 'escolher'; lote.erro = ''; renderLote(); break;
    case 'lote-enviar': aceitarLote(); break;
    case 'lote-manual': {
      // A pessoa prefere enviar ela: o pedido abre no email dela, como antes
      const empresa = obterEmpresa(lote.envios[0]?.id);
      const right = lote.right;
      lote.passo = 'escolher';
      fecharLote();
      if (empresa) prepararPedidoManual(empresa, right, true);
      break;
    }
    case 'lote-repetir': {
      const falhados = lote.envios.filter((envio) => envio.estado === 'falhou').map((envio) => envio.id);
      lote.selecionadas = new Set(falhados);
      reverLote(falhados);
      break;
    }
    case 'lote-gmail': abrirSeparador(urlPesquisaGmail(`in:sent subject:"${RIGHTS[lote.right].subject}"`)); break;
    case 'lote-mapa': fecharLote(); location.hash = '#pedidos'; renderTudo(); break;
    default: break;
  }
}

/* --- Apagar os emails de uma empresa ------------------------------------- */
function pesquisaDaEmpresa(empresa) {
  const dominios = empresa.domains?.length ? empresa.domains : [empresa.domain];
  return `{${dominios.map((domain) => `from:${domain}`).join(' ')}}`;
}

function apagarEmailsEmpresa(empresaId) {
  const empresa = obterEmpresa(empresaId);
  if (!empresa) return;
  const ev = empresa.evidence || {};
  // Depois de uma limpeza, a contagem da análise já não vale
  const quantos = empresa.limpeza ? 0 : (ev.totalRecebidos ?? ev.count ?? 0);
  const pesquisa = `${pesquisaDaEmpresa(empresa)} -in:trash -in:spam -in:drafts -in:chats`;
  registarEvento('apagar_aberto', { area: empresa.sector });
  abrirFolha({
    titulo: `Apagar os emails da ${empresa.name}?`,
    texto: empresa.limpeza
      ? `Já moveste ${empresa.limpeza.quantos} emails para o Lixo a ${formatarData(empresa.limpeza.em)}. O Veto procura os que chegaram depois e move-os também.`
      : `O Veto move para o Lixo do Gmail os ${quantos ? `≈ ${quantos} ` : ''}emails que a ${empresa.name} te enviou. Ficam lá 30 dias: até lá, podes recuperá-los.`,
    lista: [
      ['Só os emails desta empresa', `Os que recebeste de ${(empresa.domains?.length ? empresa.domains : [empresa.domain]).join(', ')}. Os que tu lhe escreveste ficam onde estão.`],
      ['Uma autorização só para isto', 'O Google vai dizer que o Veto pode ler, escrever e enviar emails: é a autorização mais pequena que o Gmail tem para mover emails para o Lixo. O Veto usa-a só nesta limpeza e cancela-a logo a seguir.']
    ],
    nota: 'Função do Veto+, aberta a todos durante o teste.',
    opcoes: [
      { label: quantos ? `Mover ${quantos} emails para o Lixo` : 'Mover os emails para o Lixo', estilo: 'primary', acao: () => moverParaLixo(empresa.id) },
      { label: 'Prefiro fazer eu no Gmail', estilo: 'secondary', acao: () => { registarEvento('apagar_no_gmail', { area: empresa.sector }); abrirSeparador(urlPesquisaGmail(pesquisa)); } },
      { label: 'Cancelar', estilo: 'ghost', acao: () => {} }
    ]
  });
}

// Chamado no clique em "Mover para o Lixo"
function moverParaLixo(empresaId) {
  const empresa = obterEmpresa(empresaId);
  if (!empresa) return;
  autorizarGmail([GMAIL_MODIFY_SCOPE], (token) => limparEmpresa(empresa, token), (mensagem) => abrirFolha({
    titulo: 'Os emails não foram apagados',
    texto: mensagem,
    opcoes: [
      { label: 'Tentar outra vez', estilo: 'primary', acao: () => apagarEmailsEmpresa(empresa.id) },
      { label: 'Fechar', estilo: 'ghost', acao: () => {} }
    ]
  }));
}

async function limparEmpresa(empresa, token) {
  const titulo = `A limpar os emails da ${empresa.name}`;
  // A janela de progresso pode ser fechada: a limpeza continua e o resultado aparece no fim
  const progresso = (texto, primeira = false) => {
    if (primeira) abrirFolha({ titulo, texto, nota: 'Podes fechar esta janela: avisamos quando terminar.', opcoes: [] });
    else if (folhaAberta && document.getElementById('sheet-title').textContent === titulo) document.getElementById('sheet-text').textContent = texto;
  };
  progresso('A confirmar a conta…', true);
  let metodo = 'lote';
  try {
    await confirmarConta(token, true);
    progresso('A procurar os emails desta empresa…');
    const ids = [];
    let pagina = '';
    do {
      const resposta = await gmailFetch(`/messages?maxResults=500&fields=messages/id,nextPageToken&q=${encodeURIComponent(`${pesquisaDaEmpresa(empresa)} -in:trash -in:spam -in:drafts -in:chats`)}${pagina ? `&pageToken=${encodeURIComponent(pagina)}` : ''}`, token, GMAIL_QUOTA.CUSTO_LIST);
      ids.push(...(resposta.messages || []).map((mensagem) => mensagem.id));
      pagina = resposta.nextPageToken || '';
    } while (pagina && ids.length < LIMPEZA_MAX);
    const todos = ids.slice(0, LIMPEZA_MAX);
    if (!todos.length) {
      revogarAcesso(token);
      abrirFolha({ titulo: 'Não há emails para apagar', texto: `Não encontrámos emails da ${empresa.name} na tua caixa (fora do Lixo e do spam).`, opcoes: [{ label: 'OK', estilo: 'primary', acao: () => {} }] });
      return;
    }
    let movidos = 0;
    progresso(`A mover ${todos.length} emails para o Lixo…`);
    try {
      // Até 1000 de cada vez (pôr a etiqueta Lixo é o mesmo que mover para o Lixo)
      for (let i = 0; i < todos.length; i += 1000) {
        await gmailFetch('/messages/batchModify', token, GMAIL_QUOTA.CUSTO_BATCH, 0, { corpo: { ids: todos.slice(i, i + 1000), addLabelIds: ['TRASH'] } });
        movidos = Math.min(i + 1000, todos.length);
        progresso(`${movidos} de ${todos.length} emails movidos para o Lixo…`);
      }
    } catch (erro) {
      // Se o Gmail não aceitar em bloco, um a um
      metodo = 'um_a_um';
      await emLotes(todos.slice(movidos), GMAIL_PARALELO, (id) => gmailFetch(`/messages/${id}/trash`, token, GMAIL_QUOTA.CUSTO_TRASH, 0, { corpo: {} }), (feitos) => {
        progresso(`${movidos + feitos} de ${todos.length} emails movidos para o Lixo…`);
      });
    }
    revogarAcesso(token);
    empresa.limpeza = { em: new Date().toISOString(), quantos: todos.length };
    guardarEstado();
    registarEvento('emails_apagados', { area: empresa.sector, quantos: todos.length, metodo });
    renderTudo();
    const apagamentoAberto = estado.pedidos.some((pedido) => pedido.companyId === empresa.id && pedido.right === 'erasure' && !['closed', 'draft'].includes(pedido.status));
    abrirFolha({
      titulo: `${todos.length} ${plural(todos.length, 'email movido', 'emails movidos')} para o Lixo`,
      texto: `Os emails da ${empresa.name} estão no Lixo do Gmail, onde ficam 30 dias. Até lá, podes recuperá-los.`,
      nota: apagamentoAberto ? '' : `A ${empresa.name} continua com os teus dados. Para que os apague, envia-lhe um pedido de apagamento.`,
      opcoes: [
        ...(apagamentoAberto ? [] : [{ label: 'Pedir que apaguem os meus dados', estilo: 'primary', acao: () => prepararPedido(empresa.id, 'erasure') }]),
        { label: 'Ver o Lixo no Gmail', estilo: 'secondary', acao: () => abrirSeparador(urlPesquisaGmail(`in:trash ${pesquisaDaEmpresa(empresa)}`)) },
        { label: 'Fechar', estilo: apagamentoAberto ? 'primary' : 'ghost', acao: () => {} }
      ]
    });
  } catch (erro) {
    revogarAcesso(token);
    registarEvento('apagar_interrompido', { area: empresa.sector });
    abrirFolha({
      titulo: 'Os emails não foram todos apagados',
      texto: `${erro.message.replace(/^o Gmail/, 'O Gmail')} Os que já foram para o Lixo ficam lá: podes tentar outra vez para mover os restantes.`,
      opcoes: [
        { label: 'Tentar outra vez', estilo: 'primary', acao: () => apagarEmailsEmpresa(empresa.id) },
        { label: 'Fechar', estilo: 'ghost', acao: () => {} }
      ]
    });
  }
}

/* ==========================================================================
   Folha (pergunta no fundo do ecrã)
   ========================================================================== */
function abrirFolha({ titulo, texto, lista = [], nota = '', opcoes, aoFecharFora = null }) {
  opcoesFolha = opcoes;
  abrirFolha.aoFecharFora = aoFecharFora;
  folhaAberta = true;
  document.getElementById('sheet-title').textContent = titulo;
  document.getElementById('sheet-text').textContent = texto;
  // Lista opcional de pontos [título, texto] e uma nota antes dos botões
  const elLista = document.getElementById('sheet-list');
  elLista.innerHTML = lista.map(([nome, descricao]) => `
    <li class="flex gap-3">
      <svg viewBox="0 0 24 24" class="mt-0.5 h-4 w-4 shrink-0 text-lime" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>
      <span class="text-sm leading-5"><span class="font-semibold text-white">${esc(nome)}</span><span class="block text-xs leading-5 text-mist">${esc(descricao)}</span></span>
    </li>`).join('');
  elLista.classList.toggle('hidden', !lista.length);
  elLista.classList.toggle('flex', lista.length > 0);
  const elNota = document.getElementById('sheet-note');
  elNota.textContent = nota;
  elNota.classList.toggle('hidden', !nota);
  const estilos = {
    primary: 'bg-white text-ink',
    secondary: 'bg-slate-800 text-slate-100',
    ghost: 'text-slate-400'
  };
  document.getElementById('sheet-options').innerHTML = opcoes.map((opcao, indice) => `
    <button data-action="opcao-folha" data-index="${indice}" type="button" class="w-full rounded-xl py-3 text-sm font-bold ${estilos[opcao.estilo] || estilos.secondary}">${esc(opcao.label)}</button>`).join('');
  const folha = document.getElementById('sheet');
  folha.classList.remove('hidden');
  folha.classList.add('flex');
}

function fecharFolha() {
  const folha = document.getElementById('sheet');
  folha.classList.add('hidden');
  folha.classList.remove('flex');
  folhaAberta = false;
  opcoesFolha = [];
}

/* ==========================================================================
   Veto Plus: teste de interesse (a subscrição ainda não existe)
   Eventos: plus_visto (viu o cartão no Início), plus_aberto (abriu o plano),
   plus_quero (escolheu mensal ou anual), plus_agora_nao. Todos dizem onde foi o clique (onde: inicio ou topo).
   ========================================================================== */
function renderPlus(tempoTotal) {
  const interesse = estado.plusInteresse;
  document.getElementById('plus-card-text').textContent = interesse
    ? `Registámos o teu interesse no plano ${interesse.plano}. Obrigado!`
    : tempoTotal
      ? `Estes emails já te custaram ≈ ${formatarDuracao(tempoTotal)}. O Plus limpa-os de uma vez.`
      : 'Limpa a tua caixa de uma vez e acompanha cada pedido até à resposta.';
  document.getElementById('plus-card-price').textContent = `${PLUS.MENSAL}/mês →`;
}

// Uma vez por dispositivo: dá a base para calcular quantos dos que viram o cartão carregaram nele.
function registarPlusVisto() {
  if (estado.plusVisto || !estado.teste?.consentimento) return;
  estado.plusVisto = true;
  registarEvento('plus_visto', { onde: 'inicio', analisou: estado.empresas.length > 0 });
}

function abrirPlus(onde = 'outro') {
  registarEvento('plus_aberto', { onde, demo: estado.demo });
  abrirFolha({
    titulo: 'Veto+',
    texto: 'Para deixares de perder tempo com os emails das empresas e teres os teus pedidos tratados até ao fim.',
    lista: PLUS.FUNCOES,
    nota: 'Em breve. O Veto+ ainda não está disponível e escolher um plano não cobra nada: estamos a medir quantas pessoas o querem antes de o construir.',
    opcoes: [
      { label: `Quero o mensal · ${PLUS.MENSAL}/mês`, estilo: 'primary', acao: () => quererPlus('mensal', onde) },
      { label: `Quero o anual · ${PLUS.ANUAL}/ano (2 meses grátis)`, estilo: 'secondary', acao: () => quererPlus('anual', onde) },
      { label: 'Agora não', estilo: 'ghost', acao: () => registarEvento('plus_agora_nao', { onde, demo: estado.demo }) }
    ]
  });
}

function quererPlus(plano, onde) {
  const detalhes = { plano, onde, demo: estado.demo };
  estado.plusInteresse = { plano, quando: new Date().toISOString() };
  guardarEstado();
  registarEvento('plus_quero', detalhes);
  renderTudo();
  // Quem ainda não respondeu às estatísticas pode aceitá-las aqui, para a escolha contar.
  // Quem já as recusou não volta a ser perguntado.
  const podePerguntar = !estado.teste?.consentimento && estado.decisaoTeste !== 'recusado';
  abrirFolha({
    titulo: 'Obrigado! Registámos o teu interesse',
    texto: 'O Veto+ ainda não existe e não pagaste nada. A tua escolha ajuda-nos a decidir se o construímos e a que preço.',
    nota: podePerguntar ? 'Para a tua escolha contar no nosso teste, aceita as estatísticas anónimas. Nunca enviamos o teu email, as empresas nem o conteúdo dos emails.' : '',
    opcoes: podePerguntar
      ? [
        { label: 'Aceitar estatísticas anónimas', estilo: 'primary', acao: () => {
          entrarNoTeste();
          registarEvento('plus_aberto', { onde, demo: estado.demo, depoisDeAceitar: true });
          registarEvento('plus_quero', { ...detalhes, depoisDeAceitar: true });
        } },
        { label: 'Agora não', estilo: 'ghost', acao: () => {} }
      ]
      : [{ label: 'Fechar', estilo: 'primary', acao: () => {} }]
  });
}

/* ==========================================================================
   Cliques
   ========================================================================== */
function tratarClique(evento) {
  const alvo = evento.target.closest('[data-action]');
  if (!alvo) return;
  const { action, id, right, kind, sector, bucket, index, modo, ordem, grupo } = alvo.dataset;
  switch (action) {
    case 'abrir-grupo': gruposAbertos.add(grupo); renderEmpresas(); break;
    case 'fechar-grupo': gruposAbertos.delete(grupo); gruposCompletos.delete(grupo); renderEmpresas(); break;
    case 'mais-grupo': gruposCompletos.add(grupo); renderEmpresas(); break;
    case 'mais-noticias': renderPainelEmpresa.todasAsNoticias = id; renderPainelEmpresa(); break;
    case 'expandir-noticia':
      if (noticiasAbertas.has(id)) noticiasAbertas.delete(id); else noticiasAbertas.add(id);
      renderPainelEmpresa();
      break;
    case 'setor':
      filtroSetor = filtroSetor === sector ? 'todos' : sector;
      if (selecaoMapa?.auto) selecaoMapa = null;
      renderPainel();
      if (filtroSetor !== 'todos') document.getElementById('area-lista').scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    case 'filtro': filtroTipo = kind; renderEmpresas(); break;
    case 'ordem-lista':
      ordemLista = ordem === 'emails' ? 'emails' : 'gravidade';
      if (selecaoMapa?.auto) selecaoMapa = null;
      renderPainel();
      break;
    case 'modo-resultados': mudarModoResultados(modo); break;
    case 'abrir-empresa': abrirEmpresa(id); break;
    case 'fechar-painel': fecharPainelEmpresa(); break;
    case 'pedido': prepararPedido(id, right); break;
    case 'mais': mostrarMaisOpcoes(id); break;
    case 'gerir': abrirEmpresa(id); break;
    case 'ver-area':
      filtroSetor = sector;
      selecaoMapa = null;
      mudarModoResultados('areas');
      break;
    case 'entrar-teste': entrarNoTeste(); break;
    case 'recusar-teste': recusarTeste(); break;
    case 'saber-mais-teste': mostrarOQueEEnviado(); break;
    case 'alternar-estatisticas': if (estado.teste?.consentimento) sairDoTeste(); else entrarNoTeste(); break;
    case 'sair-teste': sairDoTeste(); break;
    case 'nota': marcarNota(Number(alvo.dataset.value)); break;
    case 'enviar-opiniao': enviarOpiniao(); break;
    case 'filtro-noticias': filtroNoticias = alvo.dataset.filter; renderNoticias(); break;
    case 'ver-casos':
      filtroNoticias = alvo.dataset.filter;
      renderNoticias();
      document.getElementById('news-real').scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    case 'abrir-fonte': registarEvento('noticia_aberta', { noticia: id }); break; // o link abre normalmente
    case 'cancelar-subscricao': cancelarSubscricao(id); break;
    case 'apagar-emails': apagarEmailsEmpresa(id); break;
    case 'lote': abrirLote(alvo.dataset.onde, right); break;
    case 'ir-faq': document.getElementById('news-faq').scrollIntoView({ behavior: 'smooth', block: 'start' }); break;
    case 'mapa-zoom': botaoDeZoom(alvo.dataset.zoom); break;
    case 'plus': abrirPlus(alvo.dataset.onde); break;
    case 'descartar': definirDescartada(id, true); break;
    case 'repor-descartadas': estado.empresas.forEach((empresa) => { empresa.dismissed = false; }); guardarEstado(); renderTudo(); break;
    case 'confirmar-envio': confirmarEnvio(id); break;
    case 'nao-enviado': marcarNaoEnviado(id); break;
    case 'reabrir': reabrirRascunho(id); break;
    case 'apagar-rascunho': apagarRascunho(id); break;
    case 'resposta': registarResposta(id); break;
    case 'insistir': enviarInsistencia(id); break;
    case 'sem-resposta': aplicarResultado(id, 'no_reply'); break;
    case 'apagar-tudo': confirmarApagarTudo(); break;
    case 'alternar-menu': alternarMenu(); break;
    case 'enviar-novamente': {
      const pedido = obterPedido(id);
      if (pedido) {
        registarEvento('pedido_reenviado', { direito: pedido.right, area: pedido.companySector });
        enviarPedido(pedido, RIGHTS[pedido.right].subject, RIGHTS[pedido.right].body(pedido.companyName));
      }
      break;
    }
    case 'pedir-acesso': pedirAcessoAoTeste(); break;
    case 'nova-analise': renderResumo.novaAnalise = true; renderResumo(); break;
    case 'mapa-setor': alternarSelecao('setor', sector); break;
    case 'mapa-empresa': alternarSelecao('empresa', id); break;
    case 'mapa-terceiro': alternarSelecao('terceiro', id); break;
    case 'mapa-limpar': fecharPainelEmpresa(); break;
    case 'ver-pedido': mostrarPedido(id); break;
    case 'opcao-folha': {
      const opcao = opcoesFolha[Number(index)];
      fecharFolha();
      if (opcao) opcao.acao();
      break;
    }
    default:
      if (action.startsWith('lote-')) tratarCliqueLote(action, alvo);
      break;
  }
}

function definirDescartada(empresaId, valor) {
  const empresa = obterEmpresa(empresaId);
  if (!empresa) return;
  empresa.dismissed = valor;
  guardarEstado();
  renderTudo();
  mostrarToast(`${empresa.name} saiu da lista.`);
}

function confirmarApagarTudo() {
  abrirFolha({
    titulo: 'Apagar tudo deste dispositivo?',
    texto: 'Apaga as empresas encontradas e o histórico de pedidos. Os pedidos que já enviaste continuam no teu email enviado.',
    opcoes: [
      { label: 'Apagar tudo', estilo: 'primary', acao: () => { limparTudo(); mostrarToast('Tudo apagado deste dispositivo.'); } },
      { label: 'Cancelar', estilo: 'ghost', acao: () => {} }
    ]
  });
}

// Apaga os dados do antigo modo exemplo: os pedidos reais nunca são tocados.
function limparExemplo() {
  selecaoMapa = null;
  estado.pedidos = estado.pedidos.filter((pedido) => !pedido.demo);
  if (estado.demo) {
    estado.empresas = [];
    estado.analisadoEm = null;
    estado.demo = false;
  }
  guardarEstado();
  renderTudo();
}

function limparTudo() {
  const { teste, filaEnvio, enviadosTotal, decisaoTeste } = estado;
  estado = { empresas: [], pedidos: [], analisadoEm: null, demo: false, teste, filaEnvio, enviadosTotal, decisaoTeste };
  renderResumo.novaAnalise = false;
  selecaoMapa = null;
  try { localStorage.removeItem(STORAGE_KEY); } catch (erro) { /* sem armazenamento */ }
  renderTudo();
}

/* ==========================================================================
   Programa de teste e opinião
   ========================================================================== */
// Só contagens: nunca endereços, nomes de empresas, assuntos ou conteúdo.
function resumoParaEventos(empresas) {
  const contar = (chaves, chaveDe) => Object.fromEntries(chaves.map((chave) => [chave, empresas.filter((empresa) => chaveDe(empresa) === chave).length]).filter(([, n]) => n));
  return {
    empresas: empresas.length,
    porGravidade: contar(SEVERITY_ORDER, (empresa) => gravidadeDe(empresa).chave),
    porArea: contar(SECTOR_ORDER, (empresa) => empresa.sector),
    comCancelamento: empresas.filter((empresa) => empresa.unsubscribe).length,
    // Quantas ficaram sem tipo claro e quantas têm contacto verificado no catálogo
    porTipo: contar(KIND_ORDER, (empresa) => (tiposDe(empresa).includes(empresa.kind) ? empresa.kind : tiposDe(empresa)[0])),
    semTipo: empresas.filter((empresa) => tiposDe(empresa).every((tipo) => tipo === 'unknown')).length,
    noCatalogo: empresas.filter((empresa) => empresa.contactVerifiedAt).length,
    comTerceiro: empresas.filter((empresa) => terceiroDe(empresa)).length
  };
}

function registarEvento(evento, detalhes = {}) {
  if (!estado.teste?.consentimento) return;
  porNaFila({ codigo: estado.teste.codigo, dispositivo: estado.teste.dispositivo, evento, detalhes: { ...detalhes, origem: estado.teste.origem || undefined, ecra: tipoDeEcra() } });
}

// Telemóvel ou tablet (ecrã tátil) ou computador: só para saber onde o Veto é usado
function tipoDeEcra() {
  return window.matchMedia?.('(pointer: coarse)').matches ? 'telemovel' : 'computador';
}

// Que páginas são abertas: uma vez por página e por dia (a primeira já conta como "app_aberta")
function registarPaginaVista(vista) {
  if (!estado.teste?.consentimento) return;
  const hoje = dataLocalISO(new Date());
  const vistas = estado.teste.paginasHoje?.dia === hoje ? estado.teste.paginasHoje.vistas : [];
  if (vistas.includes(vista)) return;
  estado.teste.paginasHoje = { dia: hoje, vistas: [...vistas, vista] };
  registarEvento('pagina_vista', { vista });
}

// O motivo de uma falha, numa categoria fixa (nunca a mensagem de erro, que pode ter dados)
function motivoDoErro(erro) {
  const texto = String(erro?.message || '');
  if (/API não está ativada/i.test(texto)) return 'api_desativada';
  if (/permissão para ler/i.test(texto)) return 'sem_permissao';
  if (/quota|429/i.test(texto)) return 'quota';
  if (/failed to fetch|network|load failed/i.test(texto)) return 'rede';
  if (/respondeu com 401/.test(texto)) return 'sessao_expirada';
  return 'outro';
}

function porNaFila(registo) {
  estado.filaEnvio = [...(estado.filaEnvio || []), { ...registo, quando: new Date().toISOString(), versao: VERSAO }].slice(-TESTE.MAX_FILA);
  guardarEstado();
  enviarFila();
}

async function enviarFila() {
  const fila = estado.filaEnvio || [];
  if (!TESTE.URL || !fila.length || enviarFila.aEnviar) return;
  enviarFila.aEnviar = true;
  const lote = [...fila];
  let enviou = false;
  try {
    // O Apps Script não responde com CORS: envia-se em modo "no-cors" e texto simples.
    await fetch(TESTE.URL, { method: 'POST', mode: 'no-cors', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ eventos: lote }) });
    estado.filaEnvio = (estado.filaEnvio || []).slice(lote.length);
    estado.enviadosTotal = (estado.enviadosTotal || 0) + lote.length;
    guardarEstado();
    enviou = true;
  } catch (erro) {
    // Sem rede: fica na fila e segue na próxima vez
  }
  enviarFila.aEnviar = false;
  if (vistaAtual() === 'inicio') renderTeste();
  // O que entrou na fila enquanto se enviava segue logo a seguir
  if (enviou && (estado.filaEnvio || []).length) enviarFila();
}

// Enquanto a app está em teste no Google, só contas na lista de testadores podem ligar o Gmail.
// Quem quer entrar deixa o email; a equipa acrescenta-o na Google Cloud. É o único email que o Veto recebe.
// Menu lateral (computador): aberto ou só com ícones; a escolha fica neste browser
function alternarMenu(fechado = !document.body.classList.contains('menu-fechado')) {
  document.body.classList.toggle('menu-fechado', fechado);
  const botao = document.querySelector('[data-action="alternar-menu"]');
  if (botao) {
    const texto = fechado ? 'Mostrar o menu' : 'Esconder o menu';
    botao.setAttribute('aria-label', texto);
    botao.title = texto;
    botao.querySelector('.nav-rotulo').textContent = fechado ? 'Mostrar menu' : 'Esconder menu';
  }
  try { localStorage.setItem('veto-menu-fechado', fechado ? '1' : '0'); } catch (erro) { /* sem armazenamento: só vale nesta visita */ }
  if (vistaAtual() === 'pedidos') setTimeout(renderPedidos, 50); // o mapa ocupa o espaço novo
}
try { if (localStorage.getItem('veto-menu-fechado') === '1') alternarMenu(true); } catch (erro) { /* ignora */ }

function pedirAcessoAoTeste() {
  abrirFolha({
    titulo: 'Pedir acesso ao teste',
    texto: 'Enquanto o Veto está em teste, o Google só deixa entrar contas que a equipa acrescenta à mão. Deixa o teu endereço Gmail e avisamos-te quando estiver pronto (normalmente no próprio dia).',
    nota: 'O endereço fica numa folha de cálculo só da equipa, serve apenas para te dar acesso ao teste e é apagado no fim do ano letivo. Não fica ligado às tuas estatísticas.',
    opcoes: [
      { label: 'Continuar', estilo: 'primary', acao: () => setTimeout(pedirEmailDeAcesso, 50) },
      { label: 'Agora não', estilo: 'ghost', acao: () => {} }
    ]
  });
}

async function pedirEmailDeAcesso() {
  const email = (window.prompt('O teu endereço Gmail:') || '').trim().toLowerCase();
  if (!email) return;
  if (!/^[^\s@]+@(gmail|googlemail)\.com$/.test(email)) {
    mostrarToast('Escreve um endereço Gmail (termina em @gmail.com).');
    return;
  }
  if (!TESTE.URL) {
    mostrarToast('O pedido de acesso ainda não está configurado.');
    return;
  }
  try {
    await fetch(TESTE.URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ pedidoAcesso: { email, quando: new Date().toISOString(), versao: VERSAO } }) });
    mostrarToast('Pedido enviado. Avisamos-te por email quando tiveres acesso.');
  } catch (erro) {
    mostrarToast('Não foi possível enviar. Verifica a ligação e tenta outra vez.');
  }
}

function registarAbertura() {
  const hoje = dataLocalISO(new Date());
  if (estado.teste?.consentimento && estado.teste.ultimoDia !== hoje) {
    estado.teste.ultimoDia = hoje;
    registarEvento('app_aberta', { vista: vistaAtual(), diasDesdeAdesao: estado.teste.desde ? Math.round((Date.now() - new Date(estado.teste.desde).getTime()) / 86400000) : undefined });
  } else {
    enviarFila();
  }
}

function entrarNoTeste() {
  // Sem código por pessoa: um identificador aleatório deste dispositivo e, se existir, o código e a origem do link.
  estado.teste = {
    codigo: conviteNoLink ? conviteNoLink.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 40) : 'ANONIMO',
    origem: origemDoLink,
    consentimento: true,
    dispositivo: gerarId(),
    desde: new Date().toISOString(),
    ultimoDia: dataLocalISO(new Date())
  };
  estado.decisaoTeste = 'aceite';
  registarEvento('adesao', { vista: vistaAtual(), origem: origemDoLink });
  guardarEstado();
  esconderPerguntaConsentimento();
  renderTeste();
  mostrarToast('Obrigado! Estás a ajudar no teste do Veto.');
}

function recusarTeste() {
  estado.decisaoTeste = 'recusado';
  guardarEstado();
  esconderPerguntaConsentimento();
  renderTeste();
}

// Pergunta curta, uma só vez, sem bloquear a app
function mostrarPerguntaConsentimento() {
  const faixa = document.getElementById('consent-banner');
  faixa.classList.toggle('hidden', Boolean(estado.decisaoTeste || estado.teste));
}

function esconderPerguntaConsentimento() {
  document.getElementById('consent-banner').classList.add('hidden');
}

function sairDoTeste() {
  registarEvento('saida', {});
  estado.teste = null;
  estado.decisaoTeste = 'recusado';
  guardarEstado();
  renderTeste();
  mostrarToast('Estatísticas anónimas desligadas. Não enviamos mais nada.');
}

function enviarOpiniao() {
  const painel = document.getElementById('feedback-panel');
  const nota = Number(painel.dataset.nota || 0);
  const comentario = document.getElementById('feedback-text').value.trim().slice(0, 1000);
  if (!nota && !comentario) {
    mostrarToast('Escolhe uma nota ou escreve um comentário.');
    return;
  }
  // A opinião é enviada porque a pessoa a escreveu e carregou em enviar, mesmo fora do teste.
  porNaFila({ codigo: estado.teste?.codigo || 'sem-codigo', dispositivo: estado.teste?.dispositivo || '', evento: 'opiniao', detalhes: { nota, comentario, demo: estado.demo } });
  document.getElementById('feedback-text').value = '';
  painel.dataset.nota = '';
  marcarNota(0);
  document.getElementById('feedback-done').classList.remove('hidden');
  mostrarToast('Obrigado pela tua opinião!');
}

function marcarNota(nota) {
  document.getElementById('feedback-panel').dataset.nota = nota || '';
  document.querySelectorAll('#feedback-stars [data-action="nota"]').forEach((botao) => {
    const ativo = Number(botao.dataset.value) === nota;
    botao.classList.toggle('bg-oliva', ativo);
    botao.classList.toggle('text-ink', ativo);
    botao.classList.toggle('border-oliva', ativo);
  });
}

// Estado das estatísticas anónimas, na linha da secção de privacidade do Início
function renderTeste() {
  const ligadas = Boolean(estado.teste?.consentimento);
  document.getElementById('stats-state').textContent = ligadas ? 'ligadas' : 'desligadas';
  document.getElementById('stats-toggle').textContent = ligadas ? 'Deixar de participar' : 'Ligar';
}

// "O que é enviado?": a lista completa numa folha, com a decisão logo ali
function mostrarOQueEEnviado() {
  const ligadas = Boolean(estado.teste?.consentimento);
  abrirFolha({
    titulo: 'Estatísticas anónimas',
    texto: 'Para sabermos se o Veto é útil, contamos de forma anónima o que fazes na app. Podes mudar de ideias quando quiseres, no fim do Início.',
    lista: [
      ['Um identificador aleatório', 'Um código deste dispositivo, que não te identifica, de onde vieste (por exemplo, LinkedIn) e se usas telemóvel ou computador.'],
      ['A análise', 'Quantos emails e quantas empresas encontrámos, por área e por gravidade, e quanto tempo demorou. Se falhar, o tipo de falha.'],
      ['Os pedidos', 'O tipo de pedido, a área da empresa, se foi por email ou formulário, quanto tempo levaste a enviá-lo e quantos dias a empresa demorou a responder. Num envio a várias empresas, quantos pedidos saíram.'],
      ['Outras ações', 'Quando abres a app ou uma página, cancelas uma subscrição, apagas os emails de uma empresa (só quantos), abres uma notícia ou uma pergunta, ou vês o Veto+.']
    ],
    nota: 'Nunca enviamos o teu endereço de email, os nomes das empresas, os assuntos nem o conteúdo dos emails.',
    opcoes: ligadas
      ? [
        { label: 'Fechar', estilo: 'primary', acao: () => {} },
        { label: 'Deixar de participar', estilo: 'ghost', acao: () => sairDoTeste() }
      ]
      : [
        // Os dois botões com o mesmo peso: o consentimento tem de ser livre
        { label: 'Aceitar', estilo: 'secondary', acao: () => entrarNoTeste() },
        { label: 'Não, obrigado', estilo: 'secondary', acao: () => recusarTeste() }
      ]
  });
}

/* ==========================================================================
   Utilitários
   ========================================================================== */
function obterEmpresa(id) {
  return estado.empresas.find((empresa) => empresa.id === id);
}

function obterPedido(id) {
  return estado.pedidos.find((pedido) => pedido.id === id);
}

function gerarId() {
  return window.crypto?.randomUUID ? window.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function diasAtras(dias) {
  const data = new Date();
  data.setDate(data.getDate() - dias);
  return data.toISOString();
}

function dataLocalISO(data) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}`;
}

function formatarData(iso) {
  if (!iso) return '';
  const data = iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return data.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function descreverDia(iso) {
  const dias = -diasAte(dataLocalISO(new Date(iso)));
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'ontem';
  return `há ${dias} dias`;
}

function esc(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function atualizarStatus(mensagem, isError = false) {
  status.classList.remove('hidden', 'text-rose-300');
  if (isError) status.classList.add('text-rose-300');
  status.textContent = mensagem;
}

function mostrarToast(mensagem) {
  const toast = document.getElementById('toast');
  toast.textContent = mensagem;
  toast.classList.remove('hidden');
  clearTimeout(mostrarToast.timer);
  mostrarToast.timer = setTimeout(() => toast.classList.add('hidden'), 2800);
}