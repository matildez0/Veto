'use strict';

/* ==========================================================================
   Áreas (setores). As sensíveis aparecem em destaque.
   A área vem do catálogo ou, para empresas fora dele, de palavras no domínio
   e no nome do remetente. É uma estimativa e o ecrã diz isso.
   A ordem conta: as regras mais específicas vêm primeiro.
   ========================================================================== */
const SECTORS = {
  saude: { label: 'Saúde', short: 'Saúde', sensitive: true,
    gravidade: 'critica', porque: 'Dados de saúde são uma categoria especial no RGPD (artigo 9.º). Uma fuga pode expor doenças, consultas ou medicação.',
    re: /sa[uú]de|clinic|cl[ií]nica|hospital|farm[aá]c|pharm|medic|m[eé]dic|dent(al|ist|[aá]ri)|\bcuf\b|lusiadas|luz ?saude|fisio|[oó]ptica|optic|psic|terapia|an[aá]lises|laborat|unilabs|multicare|medis|wells/i },
  financas: { label: 'Finanças e seguros', short: 'Finanças', sensitive: true,
    gravidade: 'critica', porque: 'Dados bancários e de pagamento abrem a porta a fraude e roubo de identidade.',
    re: /bank|banco|\bcaixa|\bcgd\b|millennium|\bbcp\b|\bbpi\b|santander|novo ?banco|montepio|activobank|revolut|\bn26\b|\bwise\b|paypal|mbway|cetelem|cofidis|unicre|cr[eé]dito|seguro|insurance|fidelidade|ageas|tranquilidade|allianz|generali|zurich|invest|binance|coinbase|trading|klarna|scalapay/i },
  encontros: { label: 'Encontros', short: 'Encontros', sensitive: true,
    gravidade: 'critica', porque: 'Pode revelar a tua orientação sexual, fotos e conversas íntimas, que o RGPD protege como categoria especial.',
    re: /tinder|bumble|hinge|badoo|grindr|happn|meetic|okcupid|lovoo/i },
  comida: { label: 'Comida e entregas', short: 'Comida', sensitive: false,
    gravidade: 'media', porque: 'Sabem a tua morada e os teus hábitos do dia a dia.',
    re: /glovo|uber ?eats|ubereats|bolt ?food|just ?eat|telepizza|domino|mcdonald|burger|\bkfc\b|pizza|restaur|too ?good|sushi|nespresso/i },
  viagens: { label: 'Transportes e viagens', short: 'Viagens', sensitive: false,
    gravidade: 'alta', porque: 'Sabem onde estiveste e para onde vais, e por vezes guardam o teu documento de identificação.',
    re: /\buber\b|\bbolt\b|cabify|free ?now|ryanair|easyjet|flytap|tap ?air|vueling|booking|airbnb|expedia|hotels|trivago|edreams|skyscanner|flixbus|rede ?expressos|\bcp\.pt|comboios|via ?verde|carris/i },
  lazer: { label: 'Streaming e lazer', short: 'Lazer', sensitive: false,
    gravidade: 'baixa', porque: 'Sobretudo gostos e hábitos de consumo.',
    re: /spotify|netflix|disney|\bhbo\b|primevideo|youtube|twitch|steam|playstation|xbox|epicgames|nintendo|ticketline|blueticket|\bbol\.pt|cinema|deezer|audible|crunchyroll/i },
  social: { label: 'Redes sociais', short: 'Social', sensitive: false,
    gravidade: 'alta', porque: 'Guardam perfil, fotos, mensagens e contactos, e as contas são um alvo frequente de roubo.',
    re: /linkedin|twitter|\bx\.com|tiktok|pinterest|reddit|discord|snapchat|tumblr|threads|telegram|whatsapp|bereal|quora|medium/i },
  servicos: { label: 'Casa e telecomunicações', short: 'Casa', sensitive: false,
    gravidade: 'alta', porque: 'Contratos de casa e telecomunicações têm morada, NIF e IBAN.',
    re: /\bmeo\b|\bnos\.pt|vodafone|nowo|digi\.pt|\bedp\b|galp|endesa|goldenergy|iberdrola|\bepal\b|[aá]guas|\bctt\b/i },
  educacao: { label: 'Educação e trabalho', short: 'Educação', sensitive: false,
    gravidade: 'media', porque: 'Percurso académico ou profissional e dados de contacto.',
    re: /uminho|universid|\.edu\b|udemy|coursera|duolingo|\bedx\b|net-?empregos|indeed|glassdoor|itjobs|landing\.jobs/i },
  publico: { label: 'Serviços públicos', short: 'Público', sensitive: false,
    gravidade: 'alta', porque: 'Guardam NIF, morada e dados de identificação.',
    re: /gov\.pt|portaldasfinancas|seg-social|autenticacao|\bsns\b|\bimt\b|justica/i },
  compras: { label: 'Compras', short: 'Compras', sensitive: false,
    gravidade: 'media', porque: 'Morada de entrega, histórico de compras e, por vezes, o cartão.',
    re: /shop|store|loja|amazon|shein|temu|aliexpress|zara|inditex|bershka|stradivarius|mango|primark|asos|zalando|worten|fnac|continente|pingo ?doce|lidl|auchan|ikea|decathlon|sport ?zone|vinted|\bolx\b|ebay|wook|bertrand|kuantokusta|leroy/i },
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
  cadeado: ['<rect x="5" y="10.5" width="14" height="10" rx="2"/>', '<path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>']
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
   Os contactos de privacidade são todos de exemplo. As empresas que não têm um
   contacto aqui recebem um endereço gerado (privacy@dominio), também de exemplo.
   Na versão final, os contactos vêm de um catálogo verificado.
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
  fuga: { label: 'Fuga de dados', style: 'bg-rose-400/15 text-rose-200' },
  multa: { label: 'Multa', style: 'bg-amber-400/15 text-amber-100' },
  fraude: { label: 'Burla', style: 'bg-orange-400/15 text-orange-200' }
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

/* ==========================================================================
   Programa de teste (validação de mercado)
   Cada testador recebe um código de convite pessoal. Com o consentimento dele,
   a app envia eventos anónimos (contagens, nunca dados de email) para uma folha
   de cálculo, através de uma Web App do Google Apps Script.
   Cola em URL o endereço da tua Web App (termina em /exec). Enquanto estiver
   vazio, os eventos ficam guardados neste dispositivo e seguem mais tarde.
   ========================================================================== */
const TESTE = { URL: 'https://script.google.com/macros/s/AKfycbwNh_t1JNLYzHaId9Mnte7rRiGPtZefjsOl7GnlxwwgMZW6hYoU8GIQWizqoVZwTq7i/exec', MAX_FILA: 300 };

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
const VERSAO = 'prototipo-0.7';

/* ==========================================================================
   Configuração
   ========================================================================== */
const GMAIL_READ_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
// Os emails mais recentes da caixa, sem spam, lixo, enviados nem rascunhos
// (os enviados são teus, não de empresas).
const GMAIL_QUERY = '-in:spam -in:trash -in:sent -in:drafts -in:chats';
const GMAIL_MAX_EMAILS = 500;
const GMAIL_PARALELO = 10; // pedidos ao mesmo tempo
// Limite do Gmail por conta: 6.000 unidades por minuto. Ler um email (messages.get) custa 20
// e listar (messages.list) custa 5, ou seja, cerca de 300 emails por minuto. Ficamos a 90 %.
const GMAIL_QUOTA = { UNIDADES: 6000, JANELA_MS: 60000, MARGEM: 0.9, CUSTO_GET: 20, CUSTO_LIST: 5 };
const RESPONSE_BUFFER_DAYS = 3;
const STORAGE_KEY = 'veto.prototipo.v2';

const multiPartPublicSuffixes = new Set(['co.uk', 'com.au', 'co.nz', 'co.za', 'com.br', 'com.mx', 'com.pt']);
const ignoredDomains = new Set([
  'gmail.com', 'googlemail.com', 'google.com', 'accounts.google.com',
  'mail.google.com', 'googleusercontent.com', 'googleapis.com',
  'facebookmail.com', 'facebook.com', 'instagram.com',
  // Fornecedores de email pessoal: um remetente destes é uma pessoa, não uma empresa
  'hotmail.com', 'outlook.com', 'live.com', 'msn.com', 'yahoo.com', 'icloud.com',
  'me.com', 'sapo.pt', 'proton.me', 'protonmail.com', 'gmx.com', 'aol.com'
]);

const KINDS = {
  likely_account: { label: 'Conta', filtro: 'Tens conta', style: 'text-rose-200 bg-rose-400/10', bar: 'bg-ink', help: 'Recebeste um email de boas-vindas, de registo ou de palavra-passe. Provavelmente tens conta.' },
  purchase: { label: 'Compra', filtro: 'Compraste', style: 'text-amber-200 bg-amber-400/10', bar: 'bg-ink/60', help: 'Recebeste recibos, faturas ou confirmações de encomenda. A empresa guarda dados da compra, como o nome e a morada.' },
  newsletter: { label: 'Newsletter', filtro: 'Recebes publicidade', style: 'text-sky-200 bg-sky-400/10', bar: 'bg-ink/30', help: 'Só recebes marketing. A empresa tem o teu email, mas pode não haver conta.' },
  unknown: { label: 'Por confirmar', filtro: 'Sem tipo claro', style: 'text-slate-300 bg-slate-700/60', bar: 'bg-ink/15', help: 'Há emails desta empresa, mas nenhuma regra os explica. Revê tu.' }
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
  { kind: 'likely_account', reason: 'Email de boas-vindas, registo ou palavra-passe',
    re: /bem-vind|boas-vindas|welcome|confirm\w*\s.*(conta|registo|e-?mail)|verifi|ativ\w*\s.*conta|activate|palavra-passe|password|reset|registo|sign ?up|inscri|criaste|nova conta|new account|account created|in[ií]cio de sess[aã]o/i },
  { kind: 'purchase', reason: 'Recibo, fatura ou encomenda',
    re: /encomenda|order|fatura|factura|invoice|recibo|receipt|compra|purchase|pagamento|payment|enviad|shipped|entrega|delivery|reserva|booking|bilhete/i }
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
   Gravidade: quão grave seria se os dados desta empresa se perdessem
   (fuga, venda ou uso indevido). Escala fixa de quatro níveis.
   A cor vem sempre com ícone (barras) e texto, nunca sozinha;
   no mapa, os pontos mais graves também são maiores.
   ========================================================================== */
const SEVERITY = {
  critica: { label: 'Crítica', nivel: 4, hex: '#d03b3b', r: 7.5 },
  alta: { label: 'Alta', nivel: 3, hex: '#ec835a', r: 6.5 },
  media: { label: 'Média', nivel: 2, hex: '#fab219', r: 5.5 },
  baixa: { label: 'Baixa', nivel: 1, hex: '#719b08', r: 4.5 }
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
function iconeGravidade(chave, altura = 10) {
  const g = SEVERITY[chave];
  const barras = [0, 1, 2, 3].map((i) => `<rect x="${i * 3.5}" y="${9 - (i + 1) * 2.25}" width="2.5" height="${(i + 1) * 2.25}" rx="0.6" fill="${i < g.nivel ? g.hex : '#4d4354'}"/>`).join('');
  return `<svg viewBox="0 0 13.5 9" width="${Math.round(altura * 1.5)}" height="${altura}" aria-hidden="true" class="inline-block shrink-0">${barras}</svg>`;
}

function seloGravidade(chave, prefixo = 'Gravidade') {
  return `<span class="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">${iconeGravidade(chave)}${prefixo ? `${prefixo} ` : ''}${prefixo ? SEVERITY[chave].label.toLowerCase() : SEVERITY[chave].label}</span>`;
}

// Estados de cada empresa no mapa de exposição. "sempedido" = encontrada na análise, ainda sem pedido.
const BUCKETS = {
  confirmado: { label: 'Têm os teus dados', dot: 'bg-rose-400', hex: '#fb7185' },
  atraso: { label: 'Em atraso', dot: 'bg-orange-400', hex: '#fb923c' },
  espera: { label: 'À espera', dot: 'bg-amber-200', hex: '#fde68a' },
  resolvido: { label: 'Já não têm', dot: 'bg-lime', hex: '#c2ea5d' },
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
let selecaoMapa = null; // { tipo: 'empresa' | 'terceiro' | 'incidente' | 'setor', chave }

// Cores e medidas do mapa de exposição (a rede)
const REDE = {
  EMPRESA: '#c2ea5d',   // verde do logo
  TERCEIRO: '#b9a2f5',  // lilás, a condizer com o fundo
  INCIDENTE: '#ff7a6b', // coral
  PORMENOR: '#719b08',
  NUCLEO: '#807785',    // centro de cada área
  PASSO: 11,            // distância entre empresas vizinhas (unidades do desenho)
  FOLGA: 22,            // espaço entre áreas, onde cabe o nome da área
  LETRA: 10.5,          // tamanho dos nomes em píxeis, igual com qualquer zoom
  SATELITE: 44          // distância, em píxeis, da empresa escolhida aos seus terceiros e fugas
};
// Zoom do mapa (k = escala; x, y = deslocação, em unidades do desenho). Mantém-se ao escolher pontos.
let zoomMapa = { k: 1, x: 0, y: 0, assinatura: '' };
let redeDesenhada = null; // posições e nomes do último desenho, para o zoom
let pedidoDeZoom = 0;
let animacaoDeZoom = 0;
const RAIO_EMPRESA = { critica: 4.6, alta: 4, media: 3.5, baixa: 3 };

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
  'shopify.com': 'Shopify', 'intercom.io': 'Intercom', 'zendesk.com': 'Zendesk'
};
let filtroNoticias = 'todas';
let animarMapa = true;
let folhaAberta = false;
let opcoesFolha = [];

function carregarEstado() {
  try {
    const guardado = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (guardado && Array.isArray(guardado.empresas) && Array.isArray(guardado.pedidos)) {
      estado = { ...estado, ...guardado };
      estado.empresas.forEach((empresa) => {
        if (!empresa.dpo_email) {
          empresa.dpo_email = contactoDeExemplo(empresa.domain);
          empresa.contactExample = true;
        }
      });
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
document.addEventListener('click', tratarClique);
// Que perguntas do guia são abertas, uma vez por pergunta em cada visita
// (o evento "toggle" não sobe, por isso apanha-se na descida)
const perguntasAbertas = new Set();
document.addEventListener('toggle', (evento) => {
  const pergunta = evento.target.matches?.('details[data-guia]') && evento.target.open && evento.target.dataset.guia;
  if (!pergunta || perguntasAbertas.has(pergunta)) return;
  perguntasAbertas.add(pergunta);
  registarEvento('guia_aberto', { pergunta });
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
window.addEventListener('hashchange', renderTudo);
let esperaRedimensionar = 0;
window.addEventListener('resize', () => {
  clearTimeout(esperaRedimensionar);
  esperaRedimensionar = setTimeout(() => {
    const largura = document.getElementById('dot-map')?.clientWidth;
    if (vistaAtual() === 'pedidos' && redeDesenhada && largura && Math.abs(largura - redeDesenhada.larguraPx) > 8) renderPedidos();
  }, 200);
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
  if (!window.google?.accounts?.oauth2) {
    atualizarStatus('A biblioteca de autenticação do Google ainda está a carregar. Tenta novamente.', true);
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
        if (response.error === 'access_denied') mostrarTesteFechado();
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
  if (erro?.type === 'popup_closed') mostrarTesteFechado();
}

// A janela do Google fechou sem ligação: explica o que pode ter acontecido e o que fazer.
function mostrarTesteFechado() {
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
  registarEvento('login_google_interrompido', {});
}

function repor(button) {
  button.disabled = false;
  button.innerHTML = 'Ligar Gmail e começar <span>→</span>';
}

async function analisarCabecalhos(accessToken) {
  mostrarProgresso(0);
  gastosGmail.length = 0;
  // O endereço da conta serve para abrir o Gmail na conta certa ao enviar pedidos (fica só neste dispositivo).
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
    const dominioEmpresa = obterDominioEmpresa(remetente.domain);
    const assunto = obter('Subject');
    const data = detalhe.internalDate ? new Date(Number(detalhe.internalDate)) : new Date(obter('Date'));
    const sinal = classificarEmail(assunto, Boolean(obter('List-Unsubscribe')));
    const cancelar = linkDeCancelamento(obter('List-Unsubscribe'));

    if (!porEmpresa.has(dominioEmpresa)) {
      const conhecida = knownCompanies.get(dominioEmpresa);
      const nome = conhecida?.name || remetente.name || dominioEmpresa;
      registo.empresa(nome, (SECTORS[conhecida?.sector || estimarSetor(dominioEmpresa, nome)] || SECTORS.outros).short);
    }
    const atual = porEmpresa.get(dominioEmpresa) || {
      domain: dominioEmpresa, domains: new Set(), senderName: remetente.name, count: 0, recentCount: 0, firstDate: null, lastDate: null,
      kind: 'unknown', sampleSubject: '', reason: 'Nenhuma regra correspondeu'
    };
    atual.domains.add(remetente.domain);
    atual.count += 1;
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
  const agregados = [...porEmpresa.values()];
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
  registarEvento('analise_concluida', { demo: false, emails: messages.length, ...resumoParaEventos(encontradas) });
  location.hash = '#resultados';
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
async function gmailFetch(path, accessToken, custo = GMAIL_QUOTA.CUSTO_GET, tentativa = 0) {
  await esperarQuota(custo);
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (response.ok) return response.json();
  const detalhe = await response.json().catch(() => null);
  const motivos = [...(detalhe?.error?.errors || []), ...(detalhe?.error?.details || [])].map((item) => item.reason).filter(Boolean);
  const semQuota = response.status === 429
    || motivos.some((motivo) => /rate_?limit_?exceeded|quota_?exceeded/i.test(motivo))
    || /quota exceeded/i.test(detalhe?.error?.message || '');
  if (semQuota && tentativa < 3) {
    gastosGmail.push({ t: Date.now(), unidades: GMAIL_QUOTA.UNIDADES }); // bloqueia até a janela esvaziar
    return gmailFetch(path, accessToken, custo, tentativa + 1);
  }
  if (response.status >= 500 && tentativa < 3) {
    await dormir(800 * 2 ** tentativa);
    return gmailFetch(path, accessToken, custo, tentativa + 1);
  }
  throw new Error(explicarErroGmail(response.status, motivos, detalhe?.error?.message));
}

function apagarEmailsEmpresa(empresaId) {
  const empresa = obterEmpresa(empresaId);
  if (!empresa || estado.demo) return;
  const dominios = empresa.domains?.length ? empresa.domains : [empresa.domain];
  const pesquisa = `{${dominios.map((domain) => `from:${domain}`).join(' ')}} -in:spam -in:trash -in:sent -in:drafts -in:chats`;
  const url = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(pesquisa)}`;
  abrirFolha({
    titulo: `Apagar os emails da ${empresa.name}`,
    texto: 'O Gmail abre com os emails desta empresa. Seleciona-os e move-os para o Lixo.',
    nota: 'O Veto não apaga emails por ti.',
    opcoes: [
      {
        label: 'Abrir no Gmail', estilo: 'primary', acao: () => {
          const janela = window.open(url, '_blank');
          if (janela) janela.opener = null;
          else window.location.href = url;
        }
      },
      { label: 'Cancelar', estilo: 'ghost', acao: () => {} }
    ]
  });
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
  const regra = SUBJECT_RULES.find((item) => item.re.test(assunto || ''));
  if (regra) return { kind: regra.kind, reason: regra.reason };
  if (temListUnsubscribe) return { kind: 'newsletter', reason: 'Só emails de marketing' };
  return { kind: 'unknown', reason: 'Nenhuma regra correspondeu' };
}

function estimarSetor(dominio, nome) {
  const texto = `${dominio} ${nome}`;
  return SECTOR_ORDER.find((chave) => SECTORS[chave].re && SECTORS[chave].re.test(texto)) || 'outros';
}

// Só o remetente (From) identifica a empresa. O List-Unsubscribe serve apenas
// de sinal de newsletter: os domínios lá dentro são muitas vezes de plataformas de envio.
function analisarRemetente(valor) {
  const email = (valor.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i) || [])[0];
  if (!email) return null;
  const domain = normalizarDominio(email.split('@')[1]);
  if (!domain || isProviderDomain(domain)) return null;
  const nome = valor.replace(/<[^>]*>/g, '').replace(/["']/g, '').trim();
  // Nomes genéricos ("Newsletter", "noreply"…) não identificam a empresa: usa-se o domínio.
  const generico = /^(news(letter)?|no-?reply|info|team|equipa|suporte|support|marketing|notifica\w*|alertas?)$/i.test(nome);
  return { domain, name: nome && !generico && nome.length <= 40 && !nome.includes('@') ? nome : '' };
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
  const conhecido = [...knownCompanies.keys()].find((companyDomain) => (
    domain === companyDomain || domain.endsWith(`.${companyDomain}`)
  ));
  if (conhecido) return conhecido;

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
    return {
      ...conhecida, id: agregado.domain, domains: agregado.domains ? [...agregado.domains] : [agregado.domain], kind: agregado.kind, evidence, unsubscribe, sectorEstimated: false,
      dpo_email: conhecida.dpo_email || contactoDeExemplo(agregado.domain), contactExample: true
    };
  }
  const label = agregado.domain.split('.')[0].replace(/[-_]/g, ' ');
  const nomeDominio = label.replace(/\b\w/g, (letter) => letter.toUpperCase());
  const name = agregado.senderName || nomeDominio;
  return {
    id: agregado.domain, name, domain: agregado.domain, domains: agregado.domains ? [...agregado.domains] : [agregado.domain], sector: estimarSetor(agregado.domain, name), sectorEstimated: true,
    kind: agregado.kind, icon: (name[0] || '?').toUpperCase(), dpo_email: contactoDeExemplo(agregado.domain), contactExample: true, evidence, unsubscribe
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
  if (!empresa.dpo_email) {
    mostrarToast('Ainda não temos um contacto de privacidade verificado para esta empresa.');
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

  const agora = new Date().toISOString();
  const pedido = {
    id: gerarId(), companyId: empresa.id, companyName: empresa.name, companySector: empresa.sector, domain: empresa.domain, email: empresa.dpo_email,
    right, status: 'awaiting_confirmation', createdAt: agora, sentAt: null, dueDate: null,
    replyAt: null, closedAt: null, closeReason: null, outcome: null, holdsData: null, followUpAt: null,
    demo: estado.demo, timeline: [{ to: 'awaiting_confirmation', at: agora }]
  };
  estado.pedidos.push(pedido);
  registarEvento('pedido_preparado', { demo: pedido.demo, direito: right, area: empresa.sector, gravidade: gravidadeDe(empresa).chave });
  // Guardado ANTES de abrir a app de email, para a pergunta "Enviaste?" sobreviver se o browser fechar a página.
  guardarEstado();
  abrirEmail(pedido.email, RIGHTS[right].subject, RIGHTS[right].body(empresa.name), () => marcarNaoEnviado(pedido.id));
  renderTudo();
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
  abrirEmail(pedido.email, RIGHTS[pedido.right].subject, RIGHTS[pedido.right].body(pedido.companyName), () => marcarNaoEnviado(pedido.id));
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
  if (folhaAberta) return;
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
      {
        label: estado.appEmail ? `Abrir noutra app (agora: ${APPS_EMAIL[estado.appEmail]?.label || 'nenhuma'})` : 'Abrir noutra app de email',
        estilo: 'ghost',
        acao: () => {
          estado.appEmail = null;
          abrirEmail(pedido.email, RIGHTS[pedido.right].subject, RIGHTS[pedido.right].body(pedido.companyName), () => marcarNaoEnviado(pedido.id));
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
  registarEvento('pedido_enviado', { demo: pedido.demo, direito: pedido.right, area: pedido.companySector, app: estado.appEmail || '' });
  // Depois de enviar, o próximo sítio natural é a página de pedidos.
  abrirFolha({
    titulo: 'Pedido enviado',
    texto: `A ${pedido.companyName} tem até ${formatarData(pedido.dueDate)} para responder. Acompanha-o no mapa de exposição.`,
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
    texto: 'Escolhe a opção que melhor descreve a resposta. Isto atualiza o teu mapa de exposição.',
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
  registarEvento('resposta_registada', { demo: pedido.demo, direito: pedido.right, area: pedido.companySector, resultado: chave });
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
  abrirEmail(pedido.email, `Insistência: ${direito.subject}`, corpo);
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
    link.classList.toggle('text-oliva', ativo);
    link.classList.toggle('text-slate-500', !ativo);
  });
  if (renderTudo.ultimaVista !== vista) {
    window.scrollTo(0, 0);
    if (vista === 'pedidos') animarMapa = true;
  }
  renderTudo.ultimaVista = vista;

  renderResumo();
  renderPlus(visiveis().reduce((soma, empresa) => soma + tempoPerdidoS(empresa), 0));
  renderPainel();
  renderEmpresas();
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
      <div class="flex flex-col gap-2.5 px-4 pb-4 text-[13px] leading-5 text-slate-300">
        ${item.blocos.map((bloco) => (Array.isArray(bloco)
          ? `<ul class="flex flex-col gap-1.5">${bloco.map((linha) => `<li class="flex gap-2"><span class="mt-2 h-1 w-1 shrink-0 rounded-full bg-slate-500"></span><span>${esc(linha)}</span></li>`).join('')}</ul>`
          : `<p>${esc(bloco)}</p>`)).join('')}
        ${item.acao ? `<p class="font-semibold text-lime">${esc(item.acao)}</p>` : ''}
        ${item.filtro ? `<button data-action="ver-casos" data-filter="${item.filtro[0]}" type="button" class="self-start text-xs font-semibold text-slate-200 underline decoration-slate-600 underline-offset-4">${esc(item.filtro[1])}</button>` : ''}
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
  return `<article class="rounded-2xl border ${afetadas.length ? 'border-rose-400/40 bg-rose-400/5' : 'border-slate-800 bg-slate-900/60'} p-4">
    <div class="flex flex-wrap items-center gap-2 text-[11px]">
      <span class="rounded-full px-2 py-0.5 font-bold ${tipo.style}">${tipo.label}</span>
      ${noticia.estado === 'por_confirmar' ? '<span class="rounded-full bg-slate-700/60 px-2 py-0.5 font-bold text-slate-300">Por confirmar</span>' : ''}
      <span class="text-mist">${esc(noticia.empresa)} · ${formatarData(noticia.data)}</span>
    </div>
    <h3 class="mt-2 font-semibold leading-snug">${esc(noticia.titulo)}</h3>
    <p class="mt-1.5 text-xs leading-5 text-slate-300">${esc(noticia.resumo)}</p>
    <p class="mt-2 text-xs leading-5 text-mist"><span class="font-semibold text-slate-200">Porque importa:</span> ${esc(noticia.importa)}</p>
    ${afetadas.length ? `
      <div class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-ink/60 px-3 py-2">
        <span class="text-[11px] font-semibold text-rose-200">Tens dados nesta empresa</span>
        <button data-action="gerir" data-id="${esc(afetadas[0].id)}" type="button" class="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-ink">Gerir no mapa →</button>
      </div>` : ''}
    ${areaComum ? `
      <div class="mt-3 flex items-center justify-between gap-3 rounded-xl bg-ink/60 px-3 py-2">
        <span class="text-[11px] font-semibold text-amber-100">Tens empresas na área ${esc(SECTORS[areaComum].label)}</span>
        <button data-action="ver-area" data-sector="${areaComum}" type="button" class="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-slate-200">Ver no mapa →</button>
      </div>` : ''}
    <a href="${esc(noticia.fonte.url)}" target="_blank" rel="noopener noreferrer" data-action="abrir-fonte" data-id="${esc(noticia.id)}" class="mt-3 inline-block text-[11px] font-semibold text-lime underline decoration-lime/40 underline-offset-4">Ler em ${esc(noticia.fonte.nome)} (${esc(dominio)}) ↗</a>
  </article>`;
}

function visiveis() {
  return estado.empresas.filter((empresa) => !empresa.dismissed);
}

function renderResumo() {
  renderTeste();
  const lista = visiveis();
  const sensiveis = lista.filter((empresa) => SECTORS[empresa.sector]?.sensitive).length;
  const enviados = estado.pedidos.filter((pedido) => pedido.status !== 'draft').length;
  const atencao = estado.pedidos.filter(precisaDeAtencao).length;
  document.getElementById('service-count').textContent = lista.length;
  document.getElementById('service-noun').textContent = plural(lista.length, 'empresa', 'empresas');
  document.getElementById('service-verb').textContent = `${lista.length === 1 ? 'tem' : 'têm'} provavelmente os teus dados`;
  document.getElementById('risk-count').textContent = sensiveis;
  document.getElementById('analysis-date').textContent = estado.analisadoEm ? `analisado ${descreverDia(estado.analisadoEm)}` : 'ainda não analisado';

  const analisado = Boolean(estado.analisadoEm);
  document.getElementById('intro-panel').classList.toggle('hidden', analisado && !renderResumo.novaAnalise);
  document.getElementById('home-summary').classList.toggle('hidden', !analisado || renderResumo.novaAnalise);
  document.getElementById('next-steps').classList.toggle('hidden', !analisado || renderResumo.novaAnalise);
  document.getElementById('feedback-panel').classList.toggle('hidden', !analisado);
  document.getElementById('next-steps-requests').textContent = enviados ? `(${enviados})` : '';

  // Terceiros e fugas nas empresas encontradas (o mapa mostra-os ao tocar numa empresa)
  document.getElementById('relations-info').classList.toggle('hidden', !analisado || renderResumo.novaAnalise);
  if (analisado) {
    const rede = construirRede(nosDoMapa());
    document.getElementById('relations-terceiros').textContent = rede.terceiros.length ? `· ${rede.terceiros.length} nas tuas empresas` : '· nenhum encontrado';
    document.getElementById('relations-fugas').textContent = rede.incidentes.length ? `· ${rede.incidentes.length} nas tuas empresas` : '· nenhuma conhecida';
  }

  const badge = document.getElementById('nav-badge');
  badge.textContent = atencao;
  badge.classList.toggle('hidden', atencao === 0);
}

function renderPainel() {
  const lista = visiveis();
  const temEmpresas = estado.empresas.length > 0;
  document.getElementById('results-empty').classList.toggle('hidden', temEmpresas);
  document.getElementById('results-content').classList.toggle('hidden', !temEmpresas);
  if (!temEmpresas) return;

  // Total e áreas sensíveis
  document.getElementById('dash-total').textContent = lista.length;
  document.getElementById('dash-source').textContent = estado.demo || !estado.emailsAnalisados
    ? 'provavelmente têm os teus dados.'
    : `provavelmente têm os teus dados, segundo os teus últimos ${estado.emailsAnalisados} emails.`;
  const sensiveis = SECTOR_ORDER.filter((chave) => SECTORS[chave].sensitive)
    .map((chave) => ({ chave, n: lista.filter((empresa) => empresa.sector === chave).length }))
    .filter((item) => item.n > 0);
  const totalSensiveis = sensiveis.reduce((soma, item) => soma + item.n, 0);
  document.getElementById('dash-sensitive').innerHTML = totalSensiveis
    ? `${icone('alerta')}<span>${totalSensiveis} em áreas sensíveis: ${sensiveis.map((item) => esc(SECTORS[item.chave].short.toLowerCase())).join(', ')}</span>`
    : '<span>Nenhuma em áreas sensíveis.</span>';

  // Gravidade se os dados se perderem
  const porGravidade = SEVERITY_ORDER.map((chave) => ({ chave, n: lista.filter((empresa) => gravidadeDe(empresa).chave === chave).length }));
  document.getElementById('severity-bar').innerHTML = porGravidade.filter((item) => item.n)
    .map((item) => `<div class="h-full rounded-[3px]" style="width:${(item.n / Math.max(lista.length, 1)) * 100}%;background:${SEVERITY[item.chave].hex}" title="${SEVERITY[item.chave].label}: ${item.n}"></div>`).join('');
  document.getElementById('severity-legend').innerHTML = porGravidade
    .map((item) => `<span class="flex items-center gap-1.5 ${item.n ? '' : 'opacity-40'}">${iconeGravidade(item.chave)}<span class="text-slate-300">${SEVERITY[item.chave].label}</span><span class="font-display text-sm font-semibold text-white">${item.n}</span></span>`).join('');

  renderFrequencia(lista);

  // Grelha por área (sensíveis primeiro, depois por número de empresas)
  const areas = SECTOR_ORDER
    .map((chave) => ({ chave, empresas: lista.filter((empresa) => empresa.sector === chave) }))
    .filter((area) => area.empresas.length)
    .sort((a, b) => SEVERITY_ORDER.indexOf(SECTORS[a.chave].gravidade) - SEVERITY_ORDER.indexOf(SECTORS[b.chave].gravidade) || (b.empresas.length - a.empresas.length));
  document.getElementById('sector-grid').innerHTML = areas.map(({ chave, empresas }) => {
    const setor = SECTORS[chave];
    const ativo = filtroSetor === chave;
    return `<button data-action="setor" data-sector="${chave}" type="button"
      aria-label="${esc(setor.label)}: ${empresas.length} ${plural(empresas.length, 'empresa', 'empresas')}, gravidade ${SEVERITY[setor.gravidade].label.toLowerCase()}"
      class="flex items-center gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition ${ativo ? 'border-lime bg-lime/10' : setor.sensitive ? 'border-rose-400/30 bg-rose-400/5' : 'border-slate-800 bg-slate-900/60'}">
      <span class="text-slate-300">${icone(chave, 'h-5 w-5')}</span>
      <span class="min-w-0 flex-1">
        <span class="block truncate text-sm font-semibold">${esc(setor.short)}</span>
        <span class="block">${seloGravidade(setor.gravidade, '')}</span>
      </span>
      <span class="font-display text-xl font-semibold">${empresas.length}</span>
    </button>`;
  }).join('');
  document.getElementById('sector-reset').classList.toggle('hidden', filtroSetor === 'todos');

  // Filtros pelo que os emails indicam
  const naArea = lista.filter((empresa) => filtroSetor === 'todos' || empresa.sector === filtroSetor);
  const filtros = [['todas', `Todas · ${naArea.length}`], ...KIND_ORDER.map((chave) => [chave, `${KINDS[chave].filtro} · ${naArea.filter((empresa) => tiposDe(empresa).includes(chave)).length}`])];
  document.getElementById('kind-filters').innerHTML = filtros.map(([chave, texto]) => `
    <button data-action="filtro" data-kind="${chave}" type="button" class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${filtroTipo === chave ? 'border-oliva bg-oliva text-ink' : 'border-slate-700 text-slate-300'}">${esc(texto)}</button>`).join('');

  // Explicação
  document.getElementById('kind-legend').innerHTML = `
    <p>Olhamos só para quem te enviou emails, o assunto e a data. Cada empresa fica numa área (estimada pelo nome, quando não está no nosso catálogo) e numa de quatro categorias:</p>
    ${KIND_ORDER.map((chave) => `<p><span class="mr-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${KINDS[chave].style}">${KINDS[chave].label}</span>${esc(KINDS[chave].help)}</p>`).join('')}
    <p>Se uma empresa não for tua, abre "Porquê esta empresa?" e escolhe "Não tenho dados aqui".</p>`;
}

function emailsUltimos30Dias(empresa) {
  const ev = empresa.evidence || {};
  const count = Number(ev.recentCount || 0);
  return count;
}

function renderFrequencia(lista) {
  const section = document.getElementById('frequency-section');
  const container = document.getElementById('frequency-list');
  const contagens = lista
    .map((empresa) => ({ empresa, contagem: emailsUltimos30Dias(empresa) }))
    .sort((a, b) => b.contagem - a.contagem);
  const frequentes = contagens.filter((item) => item.contagem > 0).slice(0, 5);
  const semInformacao = frequentes.length === 0 ? contagens : [];
  section.classList.toggle('hidden', contagens.length === 0);
  const ranking = frequentes.map(({ empresa, contagem }, indice) => `
    <div class="flex items-center gap-3 rounded-xl bg-ink/60 px-3 py-2">
      <span class="w-4 text-center text-xs font-bold text-mist">${indice + 1}</span>
      <span class="min-w-0 flex-1 truncate text-sm font-semibold">${esc(empresa.name)}</span>
      <span class="shrink-0 text-xs text-lime">${contagem} ${contagem === 1 ? 'email' : 'emails'}</span>
    </div>`).join('');
  const semInformacaoTexto = semInformacao.length
    ? `<div class="rounded-xl bg-ink/60 px-3 py-2 text-xs leading-4 text-mist">
        <span class="font-semibold text-slate-200">Sem informação nos últimos 30 dias:</span>
        ${esc(semInformacao.slice(0, 5).map(({ empresa }) => empresa.name).join(', '))}
        ${semInformacao.length > 5 ? ` e mais ${semInformacao.length - 5}.` : '.'}
      </div>`
    : '';
  container.innerHTML = ranking + semInformacaoTexto;
}

function renderEmpresas() {
  if (!estado.empresas.length) return;
  const container = document.getElementById('companies-container');
  const query = document.getElementById('search-input').value.toLowerCase();
  const lista = visiveis();
  const filtradas = lista
    .filter((empresa) => filtroSetor === 'todos' || empresa.sector === filtroSetor)
    .filter((empresa) => filtroTipo === 'todas' || tiposDe(empresa).includes(filtroTipo))
    .filter((empresa) => `${empresa.name} ${empresa.domain} ${SECTORS[empresa.sector]?.label || ''}`.toLowerCase().includes(query))
    .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || (b.evidence?.count || 0) - (a.evidence?.count || 0));

  document.getElementById('list-title').textContent = filtroSetor === 'todos' ? 'Todas as empresas' : SECTORS[filtroSetor].label;
  document.getElementById('service-total').textContent = `${filtradas.length} de ${lista.length}${estado.demo ? ' · exemplo' : ''}`;

  if (!filtradas.length) {
    container.innerHTML = '<p class="py-8 text-center text-sm text-mist lg:col-span-full">Nenhuma empresa encontrada.</p>';
  } else if (filtroSetor === 'todos' && !query && filtroTipo === 'todas') {
    // Sem filtros: agrupar por área, sensíveis primeiro.
    const grupos = SECTOR_ORDER
      .map((chave) => ({ chave, empresas: filtradas.filter((empresa) => empresa.sector === chave) }))
      .filter((grupo) => grupo.empresas.length)
      .sort((a, b) => (SECTORS[b.chave].sensitive - SECTORS[a.chave].sensitive) || (b.empresas.length - a.empresas.length));
    container.innerHTML = grupos.map((grupo) => `
      <h3 class="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] lg:col-span-full lg:mt-4 ${SECTORS[grupo.chave].sensitive ? 'text-rose-200' : 'text-slate-400'}">
        ${icone(grupo.chave, 'h-4 w-4')}${esc(SECTORS[grupo.chave].label)} · ${grupo.empresas.length}
      </h3>
      ${grupo.empresas.map(criarCard).join('')}`).join('');
  } else {
    container.innerHTML = filtradas.map(criarCard).join('');
  }

  const descartadas = estado.empresas.length - lista.length;
  const linha = document.getElementById('dismissed-row');
  linha.classList.toggle('hidden', descartadas === 0);
  linha.innerHTML = descartadas ? `<button data-action="repor-descartadas" type="button" class="text-xs font-semibold text-slate-500 underline decoration-slate-700 underline-offset-4">Repor ${descartadas} ${descartadas === 1 ? 'empresa descartada' : 'empresas descartadas'}</button>` : '';
}

function criarCard(empresa) {
  const tipo = KINDS[empresa.kind] || KINDS.unknown;
  const setor = SECTORS[empresa.sector] || SECTORS.outros;
  const ev = empresa.evidence || {};
  const ultimo = estado.pedidos
    .filter((pedido) => pedido.companyId === empresa.id && pedido.status !== 'draft')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
  const recebidos = ev.totalRecebidos ?? ev.count ?? 0;

  const gravidade = gravidadeDe(empresa).chave;

  const estadoPedido = ultimo ? `
    <a href="#pedidos" data-action="ver-no-mapa" data-id="${esc(empresa.id)}" class="mt-3 flex items-center gap-2 rounded-xl border border-slate-800 px-3 py-2 text-[11px] text-slate-300">
      <span class="inline-block h-2 w-2 rounded-full ${BUCKETS[baldeDoPedido(ultimo)]?.dot || 'bg-slate-500'}"></span>${esc(RIGHTS[ultimo.right].short)}: ${esc(descreverPedido(ultimo))}
    </a>` : '';

  const cancelada = empresa.unsubscribedAt ? `
    <p class="mt-3 rounded-xl bg-amber-400/10 px-3 py-2 text-[11px] leading-4 text-amber-100">Subscrição cancelada. A ${esc(empresa.name)} continua a guardar os teus dados.</p>` : '';

  // O essencial à vista; o porquê fica um toque abaixo
  return `<article class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
    <div class="flex items-center gap-3">
      <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-base font-bold text-ink">${esc(empresa.icon)}</div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-2 gap-y-1"><h4 class="truncate font-semibold">${esc(empresa.name)}</h4>${tiposDe(empresa).map((chave) => `<span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${KINDS[chave].style}">${KINDS[chave].label}</span>`).join('')}</div>
        <p class="mt-0.5 truncate text-xs text-mist">≈ ${recebidos} emails · ${duracaoCurta(tempoPerdidoS(empresa))} gastos</p>
      </div>
      <span class="mt-1 shrink-0" title="Gravidade ${SEVERITY[gravidade].label.toLowerCase()}" aria-label="Gravidade ${SEVERITY[gravidade].label.toLowerCase()}" role="img">${iconeGravidade(gravidade)}</span>
    </div>
    ${estadoPedido}
    ${cancelada}
    <div class="mt-3 flex gap-2">
      <button data-action="gerir" data-id="${esc(empresa.id)}" type="button" class="flex-1 rounded-lg bg-white py-2.5 text-xs font-bold text-ink">Gerir os meus dados</button>
      ${empresa.unsubscribe && !empresa.unsubscribedAt ? `<button data-action="cancelar-subscricao" data-id="${esc(empresa.id)}" type="button" class="rounded-lg bg-slate-800 px-3 py-2.5 text-xs font-bold text-slate-200">Cancelar subscrição</button>` : ''}
    </div>
    ${!estado.demo ? `<button data-action="apagar-emails" data-id="${esc(empresa.id)}" type="button" class="mt-3 block text-[11px] font-semibold text-rose-200/90 underline decoration-rose-300/30 underline-offset-4">Apagar os emails desta empresa no Gmail</button>` : ''}
    <details class="mt-2 text-xs leading-5 text-mist">
      <summary class="cursor-pointer font-semibold text-slate-500">Porquê esta empresa?</summary>
      ${porqueEstaEmpresa(empresa)}
      <button data-action="descartar" data-id="${esc(empresa.id)}" type="button" class="mt-2 font-semibold text-slate-400 underline decoration-slate-700 underline-offset-4">Não tenho dados aqui</button>
    </details>
  </article>`;
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
    newsletter: 'Trazem um link para cancelar a subscrição: estás na lista de marketing.',
    unknown: 'Nenhum indica conta, compra ou marketing. Confirma se a empresa é tua.'
  }[empresa.kind] || '';
  const linha = (titulo, texto) => `<div><dt class="font-semibold text-slate-300">${titulo}</dt><dd class="mt-0.5">${texto}</dd></div>`;
  return `<dl class="mt-2 space-y-2">
    ${linha('O que encontrámos', `Recebeste ≈ ${recebidos} ${plural(recebidos, 'email', 'emails')} de ${esc(dominios)}${ev.lastDate ? `, o último a ${formatarData(ev.lastDate)}` : ''}.${ev.enviados ? ` Escreveste-lhes ${ev.enviados} ${plural(ev.enviados, 'vez', 'vezes')}.` : ''} ${sinal}`)}
    ${linha('O que costumam guardar', O_QUE_GUARDAM[empresa.kind] || O_QUE_GUARDAM.unknown)}
    ${linha('Área', `${esc(setor.label)}${empresa.sectorEstimated ? ' (estimada pelo nome)' : ''}. ${esc(setor.porque || '')}`)}
  </dl>`;
}

function irParaMapa(empresaId) {
  selecaoMapa = { tipo: 'empresa', chave: empresaId };
  if (vistaAtual() === 'pedidos') renderPedidos();
  else location.hash = '#pedidos';
}

// Cancelar a subscrição não apaga os dados: a app diz isso antes e depois.
function cancelarSubscricao(empresaId) {
  const empresa = obterEmpresa(empresaId);
  if (!empresa?.unsubscribe) return;
  abrirFolha({
    titulo: `Cancelar a subscrição da ${empresa.name}?`,
    texto: `Deixas de receber os emails de marketing, mas a ${empresa.name} continua a guardar os teus dados. Para os apagar, faz um pedido de apagamento no mapa de exposição.`,
    opcoes: [
      { label: 'Cancelar subscrição', estilo: 'primary', acao: () => abrirCancelamento(empresa) },
      { label: 'Gerir os meus dados no mapa', estilo: 'secondary', acao: () => irParaMapa(empresa.id) },
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
  registarEvento('subscricao_cancelada', { area: empresa.sector, demo: estado.demo });
  if (porEmail) return; // a escolha da app de email já está no ecrã
  abrirFolha({
    titulo: 'Subscrição cancelada',
    texto: `A ${empresa.name} deixa de te enviar marketing, mas os teus dados continuam lá. Queres pedir que os apague?`,
    opcoes: [
      { label: 'Pedir apagamento no mapa', estilo: 'primary', acao: () => irParaMapa(empresa.id) },
      { label: 'Agora não', estilo: 'ghost', acao: () => {} }
    ]
  });
}

function mostrarMaisOpcoes(empresaId) {
  const empresa = obterEmpresa(empresaId);
  if (!empresa) return;
  abrirFolha({
    titulo: empresa.name,
    texto: (!empresa.dpo_email ? 'Ainda não temos um contacto de privacidade para esta empresa.'
      : empresa.contactExample ? `Contacto de exemplo: ${empresa.dpo_email}. Na versão final, o contacto vem de um catálogo verificado.`
      : `Contacto de privacidade: ${empresa.dpo_email}`)
      + (empresa.privacyForm ? ` Esta empresa recebe pedidos no formulário oficial: ${empresa.privacyForm.replace(/^https?:\/\/(www\.)?/, '')}` : ''),
    opcoes: [
      { label: RIGHTS.erasure.label, estilo: 'secondary', acao: () => prepararPedido(empresa.id, 'erasure') },
      { label: RIGHTS.objection.label, estilo: 'secondary', acao: () => prepararPedido(empresa.id, 'objection') },
      { label: 'Não tenho dados aqui', estilo: 'secondary', acao: () => definirDescartada(empresa.id, true) },
      { label: 'Cancelar', estilo: 'ghost', acao: () => {} }
    ]
  });
}

function renderPedidos() {
  const nos = nosDoMapa();
  const temPedidos = estado.pedidos.length > 0;
  const temMapa = nos.length > 0;
  document.getElementById('map-empty').classList.toggle('hidden', temMapa || temPedidos);
  document.getElementById('map-content').classList.toggle('hidden', !temMapa && !temPedidos);
  if (!temMapa && !temPedidos) return;

  document.getElementById('map-card').classList.toggle('hidden', !temMapa);
  if (temMapa) {
    const rede = construirRede(nos);
    // A seleção pode deixar de existir (empresa descartada, análise nova...)
    if (selecaoMapa) {
      const existe = {
        empresa: () => nos.some((no) => no.id === selecaoMapa.chave),
        setor: () => nos.some((no) => no.sector === selecaoMapa.chave),
        terceiro: () => rede.terceiros.some((t) => t.id === selecaoMapa.chave),
        incidente: () => rede.incidentes.some((inc) => inc.id === selecaoMapa.chave)
      }[selecaoMapa.tipo];
      if (!existe || !existe()) selecaoMapa = null;
    }
    document.getElementById('dot-map').innerHTML = desenharRede(rede);
    aplicarZoom();
    animarMapa = false;
    document.getElementById('map-legend').innerHTML = legendaDaRede(rede);
    document.getElementById('map-detail').innerHTML = detalheDoMapa(nos, rede);
  }

  document.getElementById('no-requests').classList.toggle('hidden', temPedidos);
  document.getElementById('requests-section').classList.toggle('hidden', !temPedidos);
  if (!temPedidos) return;

  const pedidos = [...estado.pedidos];
  const concluido = (pedido) => pedido.status === 'closed' || (pedido.status === 'reply_received' && pedido.holdsData !== null);
  // À espera: os que precisam de uma ação tua primeiro, depois pelo prazo
  const espera = pedidos.filter((pedido) => !concluido(pedido))
    .sort((a, b) => precisaDeAtencao(b) - precisaDeAtencao(a) || (a.dueDate || '9').localeCompare(b.dueDate || '9'));
  const concluidos = pedidos.filter((pedido) => pedido.status === 'closed' || (pedido.status === 'reply_received' && pedido.holdsData !== null))
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
  const letra = computador ? 12 : REDE.LETRA;

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
      raios.set(no.id, (RAIO_EMPRESA[no.gravidade] || 3.5) + (no.balde !== 'sempedido' ? 2.2 : 0));
    });
  });

  // Zoom: até as vizinhas ficarem a ~40 px; os nomes aparecem quando ficam a ~22 px
  const zoomMax = Math.max(6, (40 * u) / REDE.PASSO);
  const zoomNomes = Math.max(1.5, (22 * u) / REDE.PASSO);
  const assinatura = `${rede.empresas.length}:${grupos.length}:${Math.round(W)}`;
  if (zoomMapa.assinatura !== assinatura) zoomMapa = { k: 1, x: 0, y: 0, assinatura };

  // 4. O que se escolhe: uma empresa mostra os seus terceiros e fugas à volta dela;
  //    um terceiro ou uma fuga mostra todas as empresas ligadas. O resto esbate-se.
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
    const ligadas = rede.ligacoes.filter((l) => l.de === sel.chave);
    const base = direcao(sel.chave);
    ligadas.forEach((l, i) => {
      satelites.push({ id: l.para, tipo: l.tipo, rel: { de: sel.chave, angulo: base + (i - (ligadas.length - 1) / 2) * 0.95 } });
      relacoes.push(l);
      acesos.add(l.para);
    });
  } else if (sel.tipo === 'terceiro' || sel.tipo === 'incidente') {
    const item = (sel.tipo === 'terceiro' ? rede.terceiros : rede.incidentes).find((x) => x.id === sel.chave);
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
  const raiosAreas = rede.empresas.map((no) => linha(`s:${no.sector}`, no.id, REDE.EMPRESA, 0.5, aceso(no.id) ? (acesos ? 0.45 : 0.18) : 0.04)).join('');
  const linhasRel = relacoes.map((l) => (l.tipo === 'terceiro'
    ? linha(l.de, l.para, REDE.TERCEIRO, 1, 0.9, true)
    : linha(l.de, l.para, REDE.INCIDENTE, 1.2, 0.95, false))).join('');

  let ordem2 = 0;
  const ponto = ({ id, r, cor, brilho, acao, titulo, anel, pulsar }) => {
    const ligado = aceso(id);
    const entrada = animarMapa ? ` class="dot-in" style="animation-delay:${Math.min(ordem2++ * 6, 700)}ms"` : '';
    return `<g data-no="${esc(id)}" opacity="${ligado ? 1 : 0.22}"><g${entrada}>
      ${brilho ? `<circle r="${r1(r * 2.6)}" fill="url(#${brilho})" pointer-events="none"/>` : ''}
      ${pulsar ? `<circle r="${r}" fill="none" stroke="${cor}" stroke-width="1.2" class="ponto-radar" pointer-events="none"/>` : ''}
      ${anel ? `<circle r="${r1(r + 2.2)}" fill="none" stroke="${REDE.PORMENOR}" stroke-width="1.4" pointer-events="none"/>` : ''}
      <circle r="${r}" fill="${cor}" stroke="${sel.chave === id ? '#ffffff' : 'none'}" stroke-width="1.6" pointer-events="none"/>
      <circle ${acao} r="${r1(Math.max(r + 3, 7 * u))}" fill="transparent" class="cursor-pointer"><title>${esc(titulo)}</title></circle>
    </g></g>`;
  };
  const nucleos = grupos.map((g) => `<g data-no="s:${g.chave}" opacity="${aceso(`s:${g.chave}`) ? 1 : 0.35}">
      <circle r="2.6" fill="${REDE.NUCLEO}" pointer-events="none"/>
      <circle data-action="mapa-setor" data-sector="${g.chave}" r="${r1(Math.max(6, 8 * u))}" fill="transparent" class="cursor-pointer"><title>${esc(SECTORS[g.chave].label)}</title></circle>
    </g>`).join('');
  const pontosEmpresas = grupos.flatMap((g) => g.nos).map((no) => ponto({
    id: no.id, r: RAIO_EMPRESA[no.gravidade] || 3.5, cor: SEVERITY[no.gravidade].hex, brilho: `brilho-${no.gravidade}`,
    acao: `data-action="mapa-empresa" data-id="${esc(no.id)}"`, titulo: `${no.name}: gravidade ${SEVERITY[no.gravidade].label.toLowerCase()}`,
    anel: no.balde !== 'sempedido'
  })).join('');
  const nomeDe = (s) => (s.tipo === 'terceiro' ? rede.terceiros : rede.incidentes).find((x) => x.id === s.id);
  const pontosSatelites = satelites.map((s) => {
    const item = nomeDe(s);
    return ponto({
      id: s.id, r: 4.6, cor: s.tipo === 'terceiro' ? REDE.TERCEIRO : REDE.INCIDENTE, brilho: s.tipo === 'terceiro' ? 'brilho-terceiro' : 'brilho-incidente',
      acao: `data-action="${s.tipo === 'terceiro' ? 'mapa-terceiro' : 'mapa-incidente'}" data-id="${esc(s.id)}"`,
      titulo: s.tipo === 'terceiro' ? `${item.nome}: terceiro` : item.noticia.titulo, pulsar: s.tipo === 'incidente'
    });
  }).join('');

  // 6. Nomes. Os das áreas veem-se sempre; os das empresas só com zoom (ou ligadas ao que escolheste),
  //    por ordem de importância e sem taparem nada. O escolhido e os seus terceiros e fugas, sempre.
  const ordemClasse = { fixa: 0, setor: 1, ligada: 2, normal: 3 };
  const etiquetas = [
    ...satelites.map((s) => ({ id: s.id, texto: nomeDe(s).nome, cor: s.tipo === 'terceiro' ? '#d9cdfb' : '#ffb4ab', classe: 'fixa', peso: 0 })),
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
      <defs>${SEVERITY_ORDER.map((chave) => gradiente(`brilho-${chave}`, SEVERITY[chave].hex)).join('')}${gradiente('brilho-empresa', REDE.EMPRESA)}${gradiente('brilho-terceiro', REDE.TERCEIRO)}${gradiente('brilho-incidente', REDE.INCIDENTE)}</defs>
      <rect data-action="mapa-limpar" x="${r1(-W / 2)}" y="${r1(-H / 2)}" width="${r1(W)}" height="${r1(H)}" fill="transparent"/>
      ${fundos}${raiosAreas}${linhasRel}${nucleos}${pontosEmpresas}${pontosSatelites}
      <g>${textos}</g>
    </svg>
    <div class="mt-2 flex items-center justify-between gap-3">
      <p id="map-zoom-hint" class="text-[11px] leading-4 text-mist">Aproxima para veres os nomes.</p>
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
  // Terceiros e fugas de uma empresa ficam a uma distância fixa dela, no ecrã
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
  return `<p class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
      <span class="text-slate-300"><span class="font-semibold text-white">${rede.empresas.length}</span> ${plural(rede.empresas.length, 'empresa', 'empresas')} em <span class="font-semibold text-white">${areas}</span> ${plural(areas, 'área', 'áreas')}</span>
      ${SEVERITY_ORDER.map((chave) => `<span class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full" style="background:${SEVERITY[chave].hex};box-shadow:0 0 8px ${SEVERITY[chave].hex}"></span><span class="text-slate-300">${SEVERITY[chave].label}</span></span>`).join('')}
    </p>
    <p class="mt-2 text-[11px] leading-4 text-mist">A cor e o tamanho mostram a gravidade de uma fuga. O anel verde marca um pedido enviado.</p>`;
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
      ultimo: item?.ultimo || null, empresa, gravidade: gravidade.chave, motivo: gravidade.motivo
    };
  });
  comPedidos.forEach((item) => {
    const empresa = obterEmpresa(item.id) || null;
    const gravidade = gravidadeDe(empresa || { sector: item.sector || 'outros' });
    nos.push({ ...item, sector: item.sector || 'outros', empresa, gravidade: gravidade.chave, motivo: gravidade.motivo });
  });
  return nos;
}

function detalheDoMapa(nos, rede) {
  const sel = selecaoMapa;
  const fechar = '<button data-action="mapa-limpar" type="button" class="shrink-0 text-xs font-semibold text-slate-400">Fechar</button>';
  const cabecalho = (marca, titulo, subtitulo) => `
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="flex items-center gap-2 font-semibold">${marca}${titulo}</p>
        ${subtitulo ? `<p class="mt-0.5 text-xs text-mist">${subtitulo}</p>` : ''}
      </div>
      ${sel ? fechar : ''}
    </div>`;
  const bola = (cor) => `<span class="h-2.5 w-2.5 shrink-0 rounded-full" style="background:${cor};box-shadow:0 0 8px ${cor}"></span>`;
  const porque = (chave, texto) => `
    <div class="mt-3 flex gap-2.5 rounded-xl bg-ink/60 px-3 py-2.5 text-xs leading-5 text-slate-300">
      <span class="mt-1">${iconeGravidade(chave)}</span>
      <p><span class="font-semibold text-white">Gravidade ${SEVERITY[chave].label.toLowerCase()}.</span> ${esc(texto)}</p>
    </div>`;
  const ordenar = (lista) => [...lista].sort((a, b) => SEVERITY_ORDER.indexOf(a.gravidade) - SEVERITY_ORDER.indexOf(b.gravidade)
    || MAP_ORDER.indexOf(a.balde) - MAP_ORDER.indexOf(b.balde) || a.name.localeCompare(b.name));
  const linhas = (lista, mostrarArea) => `<div class="mt-2">${ordenar(lista).map((no) => linhaDoMapa(no, mostrarArea)).join('')}</div>`;
  const contar = (n) => `${n} ${plural(n, 'empresa', 'empresas')}`;
  const nomes = (lista) => {
    const n = lista.map((no) => no.name);
    return n.length > 1 ? `${n.slice(0, -1).join(', ')} e ${n[n.length - 1]}` : n[0];
  };

  // Nada escolhido: uma frase e as três empresas mais graves
  if (!sel) {
    const primeiras = ordenar(nos).slice(0, 3);
    return `<p class="text-sm text-slate-300"><span class="lg:hidden">Toca</span><span class="hidden lg:inline">Clica</span> num ponto para veres o que podes fazer.</p>
      ${primeiras.length ? `<p class="mt-3 text-xs font-semibold text-slate-400">Começa pelas mais graves</p>${linhas(primeiras, true)}` : ''}`;
  }

  if (sel.tipo === 'terceiro') {
    const t = rede.terceiros.find((item) => item.id === sel.chave);
    const uma = t.ligados.length === 1;
    return `${cabecalho(bola(REDE.TERCEIRO), esc(t.nome), `Terceiro · ${esc(t.dominio)}`)}
      <p class="mt-3 text-sm leading-5 text-slate-300">${esc(nomes(t.ligados))} ${uma ? 'usa' : 'usam'} o ${esc(t.nome)} para te enviar emails. O ${esc(t.nome)} recebe o teu endereço em nome ${uma ? 'dela' : 'delas'} e pode registar quando abres as mensagens.</p>
      <p class="mt-2 text-xs leading-5 text-mist">Não comprou os teus dados: trabalha por conta ${uma ? 'da empresa' : 'das empresas'}. Se pedires o apagamento, ${uma ? 'ela tem' : 'elas têm'} de avisar o ${esc(t.nome)} (artigo 19.º do RGPD).</p>
      ${linhas(t.ligados, true)}`;
  }

  if (sel.tipo === 'incidente') {
    const inc = rede.incidentes.find((item) => item.id === sel.chave);
    const n = inc.noticia;
    return `${cabecalho(bola(REDE.INCIDENTE), esc(n.titulo), `${esc(n.empresa)} · ${formatarData(n.data)}${n.estado === 'por_confirmar' ? ' · por confirmar' : ''}`)}
      <p class="mt-3 text-sm leading-5 text-slate-300">${esc(n.importa)}</p>
      <a href="${esc(n.fonte.url)}" target="_blank" rel="noopener noreferrer" data-action="abrir-fonte" data-id="${esc(n.id)}" class="mt-2 inline-block text-xs font-semibold text-lime underline decoration-lime/40 underline-offset-4">Ler a notícia (${esc(n.fonte.nome)})</a>
      ${linhas(inc.ligados, true)}`;
  }

  if (sel.tipo === 'setor') {
    const setor = SECTORS[sel.chave];
    const daArea = nos.filter((no) => no.sector === sel.chave);
    return `${cabecalho(`<span class="text-slate-300">${icone(sel.chave, 'h-5 w-5')}</span>`, esc(setor.label), contar(daArea.length))}
      ${porque(setor.gravidade, setor.porque)}
      ${linhas(daArea, false)}`;
  }

  // Uma empresa
  const no = nos.find((item) => item.id === sel.chave);
  const setor = SECTORS[no.sector] || SECTORS.outros;
  const ev = no.empresa?.evidence;
  const pedidosDaEmpresa = estado.pedidos
    .filter((pedido) => pedido.companyId === no.id && pedido.status !== 'draft')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const historico = pedidosDaEmpresa.map((pedido) => `
    <div class="flex items-center justify-between gap-3 border-b border-slate-800 py-2 last:border-b-0">
      <span class="text-xs text-slate-300">${esc(RIGHTS[pedido.right].short)}: ${esc(descreverPedido(pedido))}</span>
      <button data-action="ver-pedido" data-id="${esc(pedido.id)}" type="button" class="shrink-0 text-[11px] font-bold text-lime">Ver pedido</button>
    </div>`).join('');
  const semContacto = !no.empresa?.dpo_email;
  // Com quem partilha e onde já houve problemas, só se houver
  const terceiro = no.empresa ? terceiroDe(no.empresa) : null;
  const incidentes = incidentesDe(no.empresa);
  const ligacoes = terceiro || incidentes.length ? `
    <p class="mt-4 text-xs font-semibold text-slate-400">Terceiros e fugas</p>
    <div class="mt-2 flex flex-col gap-1.5">
      ${terceiro ? `<button data-action="mapa-terceiro" data-id="${esc(terceiro.id)}" type="button" class="flex items-center gap-2 text-left text-xs text-slate-300">${bola(REDE.TERCEIRO)}Usa o ${esc(terceiro.nome)} para te enviar emails</button>` : ''}
      ${incidentes.map((n) => `<button data-action="mapa-incidente" data-id="i:${esc(n.id)}" type="button" class="flex items-center gap-2 text-left text-xs text-slate-300">${bola(REDE.INCIDENTE)}${n.tipo === 'fuga' ? 'Fuga de dados' : 'Burla com dados de clientes'} em ${n.data.slice(0, 4)}</button>`).join('')}
    </div>` : '';
  // Os quatro direitos: cada um mostra se já há um pedido aberto
  const direitos = no.empresa ? `
    <p class="mt-4 text-xs font-semibold text-slate-400">O que podes pedir</p>
    <div class="mt-2 grid grid-cols-2 gap-2">
      ${DIREITOS_NO_MAPA.map(({ right, titulo, frase }) => {
        const aberto = pedidosDaEmpresa.find((pedido) => pedido.right === right && pedido.status !== 'closed');
        return `<button data-action="pedido" data-id="${esc(no.id)}" data-right="${right}" type="button" ${semContacto ? 'disabled' : ''}
          class="flex flex-col rounded-xl border p-3 text-left transition ${aberto ? 'border-lime/40 bg-lime/5' : 'border-slate-800 bg-ink/60 hover:border-slate-600'} ${semContacto ? 'opacity-40' : ''}">
          <span class="text-sm font-semibold">${titulo}</span>
          <span class="mt-1 text-[11px] leading-4 text-mist">${frase}</span>
          ${aberto ? `<span class="mt-2 text-[10px] font-bold text-lime">${esc(descreverPedido(aberto))}</span>` : ''}
        </button>`;
      }).join('')}
    </div>` : '';
  return `${cabecalho(bola(REDE.EMPRESA), esc(no.name), `${esc(setor.label)}${ev ? ` · ≈ ${ev.totalRecebidos ?? ev.count} emails` : ''}`)}
    ${porque(no.gravidade, no.motivo)}
    ${ligacoes}
    ${direitos}
    ${no.empresa?.dpo_email ? `<p class="mt-2 truncate text-[11px] text-slate-500">Contacto${no.empresa.contactExample ? ' por verificar' : ''}: ${esc(no.empresa.dpo_email)}</p>` : ''}
    ${historico ? `<p class="mt-4 text-xs font-semibold text-slate-400">Os teus pedidos</p><div class="mt-1">${historico}</div>` : ''}`;
}

function linhaDoMapa(no, mostrarArea) {
  const setor = SECTORS[no.sector] || SECTORS.outros;
  const semContacto = !no.empresa?.dpo_email;
  const texto = no.ultimo
    ? `${RIGHTS[no.ultimo.right].short}: ${descreverPedido(no.ultimo)}`
    : semContacto ? 'Ainda sem pedido · contacto por verificar' : 'Ainda sem pedido';
  let acao = '';
  if (no.ultimo) {
    acao = `<button data-action="ver-pedido" data-id="${esc(no.ultimo.id)}" type="button" class="shrink-0 rounded-lg bg-slate-800 px-3 py-1.5 text-[11px] font-bold text-slate-200">Ver pedido</button>`;
  } else if (no.empresa && !semContacto) {
    acao = `<button data-action="mapa-empresa" data-id="${esc(no.id)}" type="button" class="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-ink">Ver opções</button>`;
  }
  const cor = SEVERITY[no.gravidade].hex;
  return `<div class="flex items-center gap-3 border-b border-slate-800 py-2.5 last:border-b-0">
    <span class="h-2.5 w-2.5 shrink-0 rounded-full" style="background:${cor}"></span>
    <button data-action="mapa-empresa" data-id="${esc(no.id)}" type="button" class="min-w-0 flex-1 text-left">
      <span class="flex items-center gap-1.5 truncate text-sm font-semibold">${esc(no.name)}${mostrarArea ? `<span class="text-slate-500" title="${esc(setor.label)}">${icone(no.sector, 'h-3.5 w-3.5')}</span>` : ''}</span>
      <span class="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-mist">${iconeGravidade(no.gravidade, 8)}<span>${SEVERITY[no.gravidade].label}</span><span>·</span><span class="truncate">${esc(texto)}</span></span>
    </button>
    ${acao}
  </div>`;
}

function alternarSelecao(tipo, chave) {
  const igual = selecaoMapa && selecaoMapa.tipo === tipo && selecaoMapa.chave === chave;
  selecaoMapa = igual ? null : { tipo, chave };
  renderPedidos();
  if (selecaoMapa) document.getElementById('map-detail').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function mostrarPedido(pedidoId) {
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
      : `<span class="font-semibold text-orange-300">Prazo terminou a ${formatarData(pedido.dueDate)} · há ${-prazo} ${prazo === -1 ? 'dia' : 'dias'}</span>`;
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
    acoes.push(`<button data-action="pedido" data-id="${esc(pedido.companyId)}" data-right="erasure" type="button" class="rounded-lg bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-200">Pedir apagamento</button>`);
  }

  const resultado = pedido.outcome ? `<span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${balde === 'confirmado' ? 'bg-rose-400/10 text-rose-200' : balde === 'atraso' ? 'bg-orange-400/10 text-orange-200' : 'bg-lime/10 text-lime'}">${esc(OUTCOMES[pedido.outcome].badge)}</span>` : '';

  return `<article id="pedido-${esc(pedido.id)}" class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="flex items-center gap-2 font-semibold"><span class="h-2 w-2 shrink-0 rounded-full ${balde ? BUCKETS[balde].dot : 'bg-slate-500'}"></span>${esc(pedido.companyName)} <span class="text-slate-500" title="${esc(setor.label)}">${icone(pedido.companySector || 'outros', 'h-3.5 w-3.5')}</span></p>
        <p class="mt-0.5 text-xs text-mist">${esc(direito.short)} · ${esc(direito.article)}</p>
      </div>
      ${resultado || (['sent', 'awaiting_confirmation'].includes(pedido.status) && pedido.email ? `<button data-action="enviar-novamente" data-id="${esc(pedido.id)}" type="button" class="shrink-0 rounded-lg border border-slate-700 px-2.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:border-slate-500">Enviar novamente</button>` : '')}
    </div>
    <div class="mt-3 flex flex-col gap-1 text-[11px] text-mist">
      <span>${esc(STATUS_LABELS[pedido.status])}</span>
      ${pedido.sentAt ? `<span>Enviado a ${formatarData(pedido.sentAt)}${pedido.followUpAt ? ` · insistência a ${formatarData(pedido.followUpAt)}` : ''}</span>` : ''}
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
  const { action, id, right, kind, sector, bucket, index } = alvo.dataset;
  switch (action) {
    case 'setor':
      filtroSetor = filtroSetor === sector ? 'todos' : sector;
      filtroTipo = 'todas';
      renderPainel();
      renderEmpresas();
      if (filtroSetor !== 'todos') document.getElementById('list-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    case 'filtro': filtroTipo = kind; renderPainel(); renderEmpresas(); break;
    case 'pedido': prepararPedido(id, right); break;
    case 'mais': mostrarMaisOpcoes(id); break;
    case 'gerir': irParaMapa(id); break;
    case 'ver-area': selecaoMapa = { tipo: 'setor', chave: sector }; location.hash = '#pedidos'; break;
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
        abrirEmail(pedido.email, RIGHTS[pedido.right].subject, RIGHTS[pedido.right].body(pedido.companyName), () => {});
      }
      break;
    }
    case 'pedir-acesso': pedirAcessoAoTeste(); break;
    case 'nova-analise': renderResumo.novaAnalise = true; renderResumo(); break;
    case 'mapa-setor': alternarSelecao('setor', sector); break;
    case 'mapa-empresa': alternarSelecao('empresa', id); break;
    case 'mapa-terceiro': alternarSelecao('terceiro', id); break;
    case 'mapa-incidente': alternarSelecao('incidente', id); break;
    case 'mapa-limpar': selecaoMapa = null; renderPedidos(); break;
    case 'ver-pedido': mostrarPedido(id); break;
    case 'ver-no-mapa': selecaoMapa = { tipo: 'empresa', chave: id }; break; // o link muda a página
    case 'opcao-folha': {
      const opcao = opcoesFolha[Number(index)];
      fecharFolha();
      if (opcao) opcao.acao();
      break;
    }
    default: break;
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
    comCancelamento: empresas.filter((empresa) => empresa.unsubscribe).length
  };
}

function registarEvento(evento, detalhes = {}) {
  if (!estado.teste?.consentimento) return;
  porNaFila({ codigo: estado.teste.codigo, dispositivo: estado.teste.dispositivo, evento, detalhes: { ...detalhes, origem: estado.teste.origem || undefined } });
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
    registarEvento('app_aberta', { vista: vistaAtual() });
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
      ['Um identificador aleatório', 'Um código deste dispositivo, que não te identifica, e de onde vieste (por exemplo, LinkedIn).'],
      ['A análise', 'Quantos emails e quantas empresas encontrámos, por área e por gravidade.'],
      ['Os pedidos', 'O tipo de pedido que preparas, envias ou registas, e a área da empresa.'],
      ['Outras ações', 'Quando abres a app, cancelas uma subscrição, abres uma notícia ou uma pergunta do guia, ou vês o Veto+.']
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