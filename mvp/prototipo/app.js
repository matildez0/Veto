'use strict';

/* ==========================================================================
   Áreas (setores). As sensíveis aparecem em destaque.
   A área vem do catálogo ou, para empresas fora dele, de palavras no domínio
   e no nome do remetente. É uma estimativa e o ecrã diz isso.
   A ordem conta: as regras mais específicas vêm primeiro.
   ========================================================================== */
const SECTORS = {
  saude: { label: 'Saúde', short: 'Saúde', emoji: '🏥', sensitive: true,
    gravidade: 'critica', porque: 'Dados de saúde são uma categoria especial no RGPD (artigo 9.º). Uma fuga pode expor doenças, consultas ou medicação.',
    re: /sa[uú]de|clinic|cl[ií]nica|hospital|farm[aá]c|pharm|medic|m[eé]dic|dent(al|ist|[aá]ri)|\bcuf\b|lusiadas|luz ?saude|fisio|[oó]ptica|optic|psic|terapia|an[aá]lises|laborat|unilabs|multicare|medis|wells/i },
  financas: { label: 'Finanças e seguros', short: 'Finanças', emoji: '💳', sensitive: true,
    gravidade: 'critica', porque: 'Dados bancários e de pagamento abrem a porta a fraude e roubo de identidade.',
    re: /bank|banco|\bcaixa|\bcgd\b|millennium|\bbcp\b|\bbpi\b|santander|novo ?banco|montepio|activobank|revolut|\bn26\b|\bwise\b|paypal|mbway|cetelem|cofidis|unicre|cr[eé]dito|seguro|insurance|fidelidade|ageas|tranquilidade|allianz|generali|zurich|invest|binance|coinbase|trading|klarna|scalapay/i },
  encontros: { label: 'Encontros', short: 'Encontros', emoji: '💘', sensitive: true,
    gravidade: 'critica', porque: 'Pode revelar a tua orientação sexual, fotos e conversas íntimas, que o RGPD protege como categoria especial.',
    re: /tinder|bumble|hinge|badoo|grindr|happn|meetic|okcupid|lovoo/i },
  comida: { label: 'Comida e entregas', short: 'Comida', emoji: '🍔', sensitive: false,
    gravidade: 'media', porque: 'Sabem a tua morada e os teus hábitos do dia a dia.',
    re: /glovo|uber ?eats|ubereats|bolt ?food|just ?eat|telepizza|domino|mcdonald|burger|\bkfc\b|pizza|restaur|too ?good|sushi|nespresso/i },
  viagens: { label: 'Transportes e viagens', short: 'Viagens', emoji: '✈️', sensitive: false,
    gravidade: 'alta', porque: 'Sabem onde estiveste e para onde vais, e por vezes guardam o teu documento de identificação.',
    re: /\buber\b|\bbolt\b|cabify|free ?now|ryanair|easyjet|flytap|tap ?air|vueling|booking|airbnb|expedia|hotels|trivago|edreams|skyscanner|flixbus|rede ?expressos|\bcp\.pt|comboios|via ?verde|carris/i },
  lazer: { label: 'Streaming e lazer', short: 'Lazer', emoji: '🎬', sensitive: false,
    gravidade: 'baixa', porque: 'Sobretudo gostos e hábitos de consumo.',
    re: /spotify|netflix|disney|\bhbo\b|primevideo|youtube|twitch|steam|playstation|xbox|epicgames|nintendo|ticketline|blueticket|\bbol\.pt|cinema|deezer|audible|crunchyroll/i },
  social: { label: 'Redes sociais', short: 'Social', emoji: '💬', sensitive: false,
    gravidade: 'alta', porque: 'Guardam perfil, fotos, mensagens e contactos, e as contas são um alvo frequente de roubo.',
    re: /linkedin|twitter|\bx\.com|tiktok|pinterest|reddit|discord|snapchat|tumblr|threads|telegram|whatsapp|bereal|quora|medium/i },
  servicos: { label: 'Casa e telecomunicações', short: 'Casa', emoji: '📡', sensitive: false,
    gravidade: 'alta', porque: 'Contratos de casa e telecomunicações têm morada, NIF e IBAN.',
    re: /\bmeo\b|\bnos\.pt|vodafone|nowo|digi\.pt|\bedp\b|galp|endesa|goldenergy|iberdrola|\bepal\b|[aá]guas|\bctt\b/i },
  educacao: { label: 'Educação e trabalho', short: 'Educação', emoji: '🎓', sensitive: false,
    gravidade: 'media', porque: 'Percurso académico ou profissional e dados de contacto.',
    re: /uminho|universid|\.edu\b|udemy|coursera|duolingo|\bedx\b|net-?empregos|indeed|glassdoor|itjobs|landing\.jobs/i },
  publico: { label: 'Serviços públicos', short: 'Público', emoji: '🏛️', sensitive: false,
    gravidade: 'alta', porque: 'Guardam NIF, morada e dados de identificação.',
    re: /gov\.pt|portaldasfinancas|seg-social|autenticacao|\bsns\b|\bimt\b|justica/i },
  compras: { label: 'Compras', short: 'Compras', emoji: '🛍️', sensitive: false,
    gravidade: 'media', porque: 'Morada de entrega, histórico de compras e, por vezes, o cartão.',
    re: /shop|store|loja|amazon|shein|temu|aliexpress|zara|inditex|bershka|stradivarius|mango|primark|asos|zalando|worten|fnac|continente|pingo ?doce|lidl|auchan|ikea|decathlon|sport ?zone|vinted|\bolx\b|ebay|wook|bertrand|kuantokusta|leroy/i },
  outros: { label: 'Outros', short: 'Outros', emoji: '📦', sensitive: false,
    gravidade: 'baixa', porque: 'Não sabemos que dados têm: à partida, o teu email e pouco mais.' }
};
const SECTOR_ORDER = Object.keys(SECTORS);

/* ==========================================================================
   Catálogo de demonstração
   - sector: área da empresa
   - kind: o que os emails indicam (conta provável, compra, newsletter, desconhecido)
   Os contactos de privacidade são todos de exemplo. As empresas que não têm um
   contacto aqui recebem um endereço gerado (privacy@dominio), também de exemplo.
   Na versão final, os contactos vêm de um catálogo verificado.
   ========================================================================== */
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
    evidence: { count, lastDate: diasAtras(days), sampleSubject: subject, reason: reasons[kind] }
  };
}

// Catálogo: as empresas conhecidas dão nome, área e contacto (de exemplo) às empresas encontradas na análise.
const empresasConhecidas = [
  ...empresasDemo.map(({ evidence, kind, ...empresa }) => empresa),
  { id: 'anthropic.com', name: 'Anthropic', domain: 'anthropic.com', sector: 'outros', icon: 'A', dpo_email: '' }
];
const knownCompanies = new Map(empresasConhecidas.map((company) => [company.domain, company]));

/* ==========================================================================
   Configuração
   ========================================================================== */
const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
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
  likely_account: { label: 'Conta provável', style: 'text-rose-200 bg-rose-400/10', bar: 'bg-ink', help: 'Recebeste um email de boas-vindas, de registo ou de palavra-passe. Provavelmente tens conta.' },
  purchase: { label: 'Compra', style: 'text-amber-200 bg-amber-400/10', bar: 'bg-ink/60', help: 'Recebeste recibos, faturas ou confirmações de encomenda. A empresa guarda dados da compra, como o nome e a morada.' },
  newsletter: { label: 'Newsletter', style: 'text-sky-200 bg-sky-400/10', bar: 'bg-ink/30', help: 'Só recebes marketing. A empresa tem o teu email, mas pode não haver conta.' },
  unknown: { label: 'Desconhecido', style: 'text-slate-300 bg-slate-700/60', bar: 'bg-ink/15', help: 'Há emails desta empresa, mas nenhuma regra os explica. Revê tu.' }
};
const KIND_ORDER = ['likely_account', 'purchase', 'newsletter', 'unknown'];

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
  }
};

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
  objection: ['objection_accepted', 'no_data', 'company_refused', 'partial']
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
  baixa: { label: 'Baixa', nivel: 1, hex: '#0ca30c', r: 4.5 }
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
  const barras = [0, 1, 2, 3].map((i) => `<rect x="${i * 3.5}" y="${9 - (i + 1) * 2.25}" width="2.5" height="${(i + 1) * 2.25}" rx="0.6" fill="${i < g.nivel ? g.hex : '#334155'}"/>`).join('');
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
  resolvido: { label: 'Já não têm', dot: 'bg-lime', hex: '#c8f169' },
  sempedido: { label: 'Ainda sem pedido', dot: 'bg-slate-600', hex: '#475569' }
};
const MAP_ORDER = ['confirmado', 'atraso', 'espera', 'resolvido', 'sempedido'];

// Medidas do mapa (em unidades do SVG, que no telemóvel são cerca de 1 px)
const MAPA = { LARGURA: 360, ANEL0: 24, PASSO_ANEL: 16, ARCO: 17, PONTO: 6.5, TOQUE: 8.5, FOLGA: 10 };

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
let selecaoMapa = null; // { tipo: 'setor' | 'empresa' | 'estado' | 'gravidade', chave }
let modoMapa = 'gravidade'; // a cor dos pontos: 'gravidade' ou 'pedidos'
let animarMapa = true;
const coresDosPontos = new Map(); // última cor de cada ponto, para animar quando muda
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
      evidence: empresa.evidence ? { count: empresa.evidence.count, lastDate: empresa.evidence.lastDate, reason: empresa.evidence.reason } : null
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
document.getElementById('analyze-button').addEventListener('click', ligarGmail);
document.getElementById('demo-button').addEventListener('click', () => {
  carregarExemplo(false);
  location.hash = '#resultados';
});
document.getElementById('search-input').addEventListener('input', renderEmpresas);
document.getElementById('privacy-button').addEventListener('click', () => mostrarToast('Só lemos remetente, assunto e data. O acesso ao Gmail é revogado no fim da análise e nada sai deste dispositivo.'));
document.addEventListener('click', tratarClique);
// As áreas do mapa são elementos SVG: Enter e Espaço também as abrem.
document.addEventListener('keydown', (evento) => {
  if ((evento.key === 'Enter' || evento.key === ' ') && evento.target instanceof SVGElement && evento.target.closest('[data-action]')) {
    evento.preventDefault();
    tratarClique(evento);
  }
});
document.getElementById('sheet').addEventListener('click', (evento) => {
  if (evento.target.id === 'sheet') fecharFolha();
});
window.addEventListener('hashchange', renderTudo);
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') setTimeout(verificarPendente, 400);
});
renderTudo();
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
  const tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: GMAIL_SCOPE,
    error_callback: (erro) => erroNaJanelaGoogle(erro, button),
    callback: (response) => {
      if (response.error) {
        repor(button);
        atualizarStatus(`A ligação foi recusada: ${response.error}`, true);
        return;
      }
      // O Google deixa desmarcar a permissão no ecrã de consentimento: sem ela, o Gmail responde 403.
      if (google.accounts.oauth2.hasGrantedAllScopes?.(response, GMAIL_SCOPE) === false) {
        repor(button);
        atualizarStatus('Não foi dada permissão para ler os emails. Tenta outra vez e, no ecrã do Google, marca a caixa "Ver as suas mensagens de email".', true);
        google.accounts.oauth2.revoke(response.access_token, () => {});
        return;
      }
      analisarCabecalhos(response.access_token)
        .catch((error) => { mostrarProgresso(null); atualizarStatus(`Não foi possível ler o Gmail: ${error.message}`, true); })
        .finally(() => {
          repor(button);
          // Ligação por análise: o acesso é revogado assim que a análise termina.
          google.accounts.oauth2.revoke(response.access_token, () => {});
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
    popup_closed: 'A janela do Google foi fechada antes de terminares. Se lá apareceu um erro (por exemplo, invalid_client), revê o Client ID na Google Cloud Console.'
  };
  atualizarStatus(mensagens[erro?.type] || `Não foi possível abrir o login do Google (${erro?.type || 'erro desconhecido'}).`, true);
}

function repor(button) {
  button.disabled = false;
  button.innerHTML = 'Ligar Gmail e analisar <span>→</span>';
}

async function analisarCabecalhos(accessToken) {
  atualizarStatus('A procurar os teus últimos emails. Só lemos remetente, assunto e data.');
  mostrarProgresso(0);
  gastosGmail.length = 0;
  const messages = await listarMensagens(accessToken);
  const porMinuto = Math.floor((GMAIL_QUOTA.UNIDADES * GMAIL_QUOTA.MARGEM) / GMAIL_QUOTA.CUSTO_GET);
  const minutos = Math.ceil(messages.length / porMinuto);
  const aviso = minutos > 1 ? ` O Gmail deixa ler cerca de ${porMinuto} por minuto, por isso demora uns ${minutos} minutos.` : '';
  const cabecalhos = ['From', 'Subject', 'Date', 'List-Unsubscribe'].map((nome) => `metadataHeaders=${nome}`).join('&');

  const detalhes = await emLotes(messages, GMAIL_PARALELO, (message) => gmailFetch(`/messages/${message.id}?format=metadata&${cabecalhos}`, accessToken, GMAIL_QUOTA.CUSTO_GET), (feitos) => {
    atualizarStatus(`A analisar ${feitos} de ${messages.length} emails…${aviso}`);
    mostrarProgresso(feitos / Math.max(messages.length, 1));
  });

  const porEmpresa = new Map();
  detalhes.forEach((detalhe) => {
    const headers = detalhe.payload?.headers || [];
    const obter = (nome) => headers.find((header) => header.name.toLowerCase() === nome.toLowerCase())?.value || '';
    const remetente = analisarRemetente(obter('From'));
    if (!remetente) return;
    const dominioEmpresa = obterDominioEmpresa(remetente.domain);
    const assunto = obter('Subject');
    const data = detalhe.internalDate ? new Date(Number(detalhe.internalDate)) : new Date(obter('Date'));
    const sinal = classificarEmail(assunto, Boolean(obter('List-Unsubscribe')));

    const atual = porEmpresa.get(dominioEmpresa) || { domain: dominioEmpresa, senderName: remetente.name, count: 0, lastDate: null, kind: 'unknown', sampleSubject: '', reason: 'Nenhuma regra correspondeu' };
    atual.count += 1;
    if (!atual.senderName && remetente.name) atual.senderName = remetente.name;
    if (!Number.isNaN(data.getTime()) && (!atual.lastDate || data > new Date(atual.lastDate))) atual.lastDate = data.toISOString();
    // A categoria da empresa é o sinal mais forte encontrado:
    // conta provável > compra > newsletter > desconhecido.
    const sinalMaisForte = KIND_ORDER.indexOf(sinal.kind) < KIND_ORDER.indexOf(atual.kind);
    const mesmoSinalSemExemplo = sinal.kind === atual.kind && !atual.sampleSubject;
    if (sinalMaisForte || mesmoSinalSemExemplo) {
      atual.kind = sinal.kind;
      atual.reason = sinal.reason;
      atual.sampleSubject = assunto;
    }
    porEmpresa.set(dominioEmpresa, atual);
  });

  const encontradas = [...porEmpresa.values()].map(criarEmpresaLocal);
  estado.emailsAnalisados = messages.length;
  substituirEmpresas(encontradas, false);
  mostrarProgresso(null);
  atualizarStatus(`${messages.length} emails analisados neste dispositivo. O conteúdo nunca foi lido.`);
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
      return;
    }
    atualizarStatus(`Limite do Gmail por minuto atingido. A continuar dentro de ${falta} s…`);
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
  const conhecido = [...knownCompanies.keys()].find((companyDomain) => (
    domain === companyDomain || domain.endsWith(`.${companyDomain}`)
  ));
  if (conhecido) return conhecido;

  const partes = domain.split('.');
  const suffixSize = multiPartPublicSuffixes.has(partes.slice(-2).join('.')) ? 2 : 1;
  return partes.slice(-(suffixSize + 1)).join('.');
}

function criarEmpresaLocal(agregado) {
  const evidence = { count: agregado.count, lastDate: agregado.lastDate, sampleSubject: agregado.sampleSubject, reason: agregado.reason };
  if (knownCompanies.has(agregado.domain)) {
    const conhecida = knownCompanies.get(agregado.domain);
    return {
      ...conhecida, id: agregado.domain, kind: agregado.kind, evidence, sectorEstimated: false,
      dpo_email: conhecida.dpo_email || contactoDeExemplo(agregado.domain), contactExample: true
    };
  }
  const label = agregado.domain.split('.')[0].replace(/[-_]/g, ' ');
  const nomeDominio = label.replace(/\b\w/g, (letter) => letter.toUpperCase());
  const name = agregado.senderName || nomeDominio;
  return {
    id: agregado.domain, name, domain: agregado.domain, sector: estimarSetor(agregado.domain, name), sectorEstimated: true,
    kind: agregado.kind, icon: (name[0] || '?').toUpperCase(), dpo_email: contactoDeExemplo(agregado.domain), contactExample: true, evidence
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
  const pendente = estado.pedidos.find((pedido) => pedido.status === 'awaiting_confirmation');
  if (pendente) {
    perguntarSeEnviou(pendente);
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
  // Guardado ANTES de abrir a app de email, para a pergunta "Enviaste?" sobreviver se o browser fechar a página.
  guardarEstado();
  abrirEmail(pedido.email, RIGHTS[right].subject, RIGHTS[right].body(empresa.name));
  renderTudo();
  setTimeout(() => {
    if (document.visibilityState === 'visible') verificarPendente();
  }, 2500);
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
  abrirEmail(pedido.email, RIGHTS[pedido.right].subject, RIGHTS[pedido.right].body(pedido.companyName));
  setTimeout(() => {
    if (document.visibilityState === 'visible') verificarPendente();
  }, 2500);
}

function abrirEmail(destinatario, assunto, corpo) {
  mostrarToast('A abrir a tua app de email…');
  window.location.href = `mailto:${destinatario}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

function verificarPendente() {
  if (folhaAberta) return;
  const pendente = estado.pedidos.find((pedido) => pedido.status === 'awaiting_confirmation');
  if (pendente) perguntarSeEnviou(pendente);
}

function perguntarSeEnviou(pedido) {
  abrirFolha({
    titulo: `Enviaste o pedido à ${pedido.companyName}?`,
    texto: 'Só tu sabes: o Veto não tem acesso ao teu email enviado. Se disseres que sim, começamos a contar o prazo de resposta.',
    opcoes: [
      { label: 'Sim, enviei', estilo: 'primary', acao: () => confirmarEnvio(pedido.id) },
      { label: 'Ainda não', estilo: 'secondary', acao: () => marcarNaoEnviado(pedido.id) }
    ]
  });
}

function confirmarEnvio(pedidoId) {
  const pedido = obterPedido(pedidoId);
  if (!pedido) return;
  pedido.sentAt = new Date().toISOString();
  pedido.dueDate = estimarPrazo(pedido.sentAt);
  mudarEstado(pedido, 'sent');
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
  const envio = new Date(dataEnvioISO);
  const ano = envio.getFullYear();
  const mes = envio.getMonth();
  const ultimoDiaMesSeguinte = new Date(ano, mes + 2, 0).getDate();
  const prazo = new Date(ano, mes + 1, Math.min(envio.getDate(), ultimoDiaMesSeguinte));
  prazo.setDate(prazo.getDate() + RESPONSE_BUFFER_DAYS);
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
  return ['inicio', 'resultados', 'pedidos'].includes(vista) ? vista : 'inicio';
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
    window.scrollTo(0, 0);
    if (vista === 'pedidos') animarMapa = true;
  }
  renderTudo.ultimaVista = vista;

  renderResumo();
  renderPainel();
  renderEmpresas();
  renderPedidos();
}

function visiveis() {
  return estado.empresas.filter((empresa) => !empresa.dismissed);
}

function renderResumo() {
  const lista = visiveis();
  const sensiveis = lista.filter((empresa) => SECTORS[empresa.sector]?.sensitive).length;
  const enviados = estado.pedidos.filter((pedido) => pedido.status !== 'draft').length;
  const atencao = estado.pedidos.filter(precisaDeAtencao).length;
  document.getElementById('service-count').textContent = lista.length;
  document.getElementById('risk-count').textContent = sensiveis;
  document.getElementById('analysis-date').textContent = estado.analisadoEm ? `analisado ${descreverDia(estado.analisadoEm)}` : 'ainda não analisado';

  const analisado = Boolean(estado.analisadoEm);
  document.getElementById('intro-panel').classList.toggle('hidden', analisado && !renderResumo.novaAnalise);
  document.getElementById('next-steps').classList.toggle('hidden', !analisado || renderResumo.novaAnalise);
  document.getElementById('next-steps-text').textContent = estado.demo
    ? 'Estás a ver um exemplo. Liga o teu Gmail para veres as tuas empresas.'
    : `Encontrámos ${lista.length} empresas nos teus emails, ${sensiveis} delas em áreas sensíveis.`;
  document.getElementById('next-steps-requests').textContent = enviados ? `(${enviados})` : '';

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
    ? 'podem ter os teus dados, a julgar pelos teus emails.'
    : `podem ter os teus dados, a julgar pelos teus últimos ${estado.emailsAnalisados} emails.`;
  const sensiveis = SECTOR_ORDER.filter((chave) => SECTORS[chave].sensitive)
    .map((chave) => ({ chave, n: lista.filter((empresa) => empresa.sector === chave).length }))
    .filter((item) => item.n > 0);
  const totalSensiveis = sensiveis.reduce((soma, item) => soma + item.n, 0);
  document.getElementById('dash-sensitive').innerHTML = totalSensiveis
    ? `<span class="text-base">⚠️</span><span>${totalSensiveis} em áreas sensíveis: ${sensiveis.map((item) => `${esc(SECTORS[item.chave].label.toLowerCase())} (${item.n})`).join(', ')}</span>`
    : '<span>Nenhuma empresa em áreas sensíveis.</span>';

  // O que os emails indicam
  const porTipo = KIND_ORDER.map((chave) => ({ chave, n: lista.filter((empresa) => empresa.kind === chave).length }));
  document.getElementById('dash-kind-bar').innerHTML = porTipo.filter((item) => item.n)
    .map((item) => `<div class="${KINDS[item.chave].bar} h-full border-r border-lime last:border-r-0" style="width:${(item.n / Math.max(lista.length, 1)) * 100}%"></div>`).join('');
  document.getElementById('dash-kind-legend').innerHTML = porTipo
    .map((item) => `<span class="flex items-center gap-1"><span class="h-2 w-2 rounded-full ${KINDS[item.chave].bar}"></span>${item.n} ${esc(KINDS[item.chave].label.toLowerCase())}</span>`).join('');

  // Gravidade se os dados se perderem
  const porGravidade = SEVERITY_ORDER.map((chave) => ({ chave, n: lista.filter((empresa) => gravidadeDe(empresa).chave === chave).length }));
  document.getElementById('severity-bar').innerHTML = porGravidade.filter((item) => item.n)
    .map((item) => `<div class="h-full rounded-[3px]" style="width:${(item.n / Math.max(lista.length, 1)) * 100}%;background:${SEVERITY[item.chave].hex}" title="${SEVERITY[item.chave].label}: ${item.n}"></div>`).join('');
  document.getElementById('severity-legend').innerHTML = porGravidade
    .map((item) => `<span class="flex items-center gap-1.5 ${item.n ? '' : 'opacity-40'}">${iconeGravidade(item.chave)}<span class="text-slate-300">${SEVERITY[item.chave].label}</span><span class="font-display text-sm font-semibold text-white">${item.n}</span></span>`).join('');

  // Grelha por área (sensíveis primeiro, depois por número de empresas)
  const areas = SECTOR_ORDER
    .map((chave) => ({ chave, empresas: lista.filter((empresa) => empresa.sector === chave) }))
    .filter((area) => area.empresas.length)
    .sort((a, b) => SEVERITY_ORDER.indexOf(SECTORS[a.chave].gravidade) - SEVERITY_ORDER.indexOf(SECTORS[b.chave].gravidade) || (b.empresas.length - a.empresas.length));
  document.getElementById('sector-grid').innerHTML = areas.map(({ chave, empresas }) => {
    const setor = SECTORS[chave];
    const ativo = filtroSetor === chave;
    const nomes = empresas.slice(0, 2).map((empresa) => empresa.name).join(', ') + (empresas.length > 2 ? '…' : '');
    return `<button data-action="setor" data-sector="${chave}" type="button"
      class="flex flex-col rounded-2xl border p-3 text-left transition ${ativo ? 'border-lime bg-lime/10' : setor.sensitive ? 'border-rose-400/30 bg-rose-400/5' : 'border-slate-800 bg-slate-900/60'}">
      <div class="flex items-start justify-between">
        <span class="text-2xl" aria-hidden="true">${setor.emoji}</span>
        <span class="font-display text-2xl font-semibold">${empresas.length}</span>
      </div>
      <p class="mt-2 text-sm font-semibold leading-tight">${esc(setor.label)}</p>
      <p class="mt-1.5">${seloGravidade(setor.gravidade, '')}</p>
      <p class="mt-1 truncate text-[11px] text-mist">${esc(nomes)}</p>
    </button>`;
  }).join('');
  document.getElementById('sector-reset').classList.toggle('hidden', filtroSetor === 'todos');

  // Filtros pelo que os emails indicam
  const naArea = lista.filter((empresa) => filtroSetor === 'todos' || empresa.sector === filtroSetor);
  const filtros = [['todas', `Todas · ${naArea.length}`], ...KIND_ORDER.map((chave) => [chave, `${KINDS[chave].label} · ${naArea.filter((empresa) => empresa.kind === chave).length}`])];
  document.getElementById('kind-filters').innerHTML = filtros.map(([chave, texto]) => `
    <button data-action="filtro" data-kind="${chave}" type="button" class="shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold ${filtroTipo === chave ? 'border-lime bg-lime text-ink' : 'border-slate-700 text-slate-300'}">${esc(texto)}</button>`).join('');

  // Explicação
  document.getElementById('kind-legend').innerHTML = `
    <p>Olhamos só para quem te enviou emails, o assunto e a data. Cada empresa fica numa área (estimada pelo nome, quando não está no nosso catálogo) e numa de quatro categorias:</p>
    ${KIND_ORDER.map((chave) => `<p><span class="mr-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${KINDS[chave].style}">${KINDS[chave].label}</span>${esc(KINDS[chave].help)}</p>`).join('')}
    <p>Se uma empresa não for tua, abre "Mais opções" e escolhe "Não é minha".</p>`;
}

function renderEmpresas() {
  if (!estado.empresas.length) return;
  const container = document.getElementById('companies-container');
  const query = document.getElementById('search-input').value.toLowerCase();
  const lista = visiveis();
  const filtradas = lista
    .filter((empresa) => filtroSetor === 'todos' || empresa.sector === filtroSetor)
    .filter((empresa) => filtroTipo === 'todas' || empresa.kind === filtroTipo)
    .filter((empresa) => `${empresa.name} ${empresa.domain} ${SECTORS[empresa.sector]?.label || ''}`.toLowerCase().includes(query))
    .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || (b.evidence?.count || 0) - (a.evidence?.count || 0));

  document.getElementById('list-title').textContent = filtroSetor === 'todos' ? 'Todas as empresas' : SECTORS[filtroSetor].label;
  document.getElementById('service-total').textContent = `${filtradas.length} de ${lista.length}${estado.demo ? ' · exemplo' : ''}`;

  if (!filtradas.length) {
    container.innerHTML = '<p class="py-8 text-center text-sm text-mist">Nenhuma empresa encontrada.</p>';
  } else if (filtroSetor === 'todos' && !query && filtroTipo === 'todas') {
    // Sem filtros: agrupar por área, sensíveis primeiro.
    const grupos = SECTOR_ORDER
      .map((chave) => ({ chave, empresas: filtradas.filter((empresa) => empresa.sector === chave) }))
      .filter((grupo) => grupo.empresas.length)
      .sort((a, b) => (SECTORS[b.chave].sensitive - SECTORS[a.chave].sensitive) || (b.empresas.length - a.empresas.length));
    container.innerHTML = grupos.map((grupo) => `
      <h3 class="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] ${SECTORS[grupo.chave].sensitive ? 'text-rose-200' : 'text-slate-400'}">
        <span class="text-base normal-case tracking-normal">${SECTORS[grupo.chave].emoji}</span>${esc(SECTORS[grupo.chave].label)} · ${grupo.empresas.length}
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
  const ev = empresa.evidence;
  const semContacto = !empresa.dpo_email;
  const ultimo = estado.pedidos
    .filter((pedido) => pedido.companyId === empresa.id && pedido.status !== 'draft')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];

  const evidencia = ev ? `
    <p class="mt-3 text-[11px] leading-4 text-mist">
      <span class="font-semibold text-slate-300">${ev.count} ${ev.count === 1 ? 'email' : 'emails'}</span>${ev.lastDate ? ` · último a ${formatarData(ev.lastDate)}` : ''}<br>
      ${esc(ev.reason || 'Nenhuma regra correspondeu')}${ev.sampleSubject ? `: "${esc(ev.sampleSubject)}"` : ''}
    </p>` : '';

  const estadoPedido = ultimo ? `
    <a href="#pedidos" data-action="ver-no-mapa" data-id="${esc(empresa.id)}" class="mt-3 flex items-center justify-between rounded-xl border border-slate-800 px-3 py-2 text-[11px] text-slate-300">
      <span><span class="mr-1 inline-block h-2 w-2 rounded-full ${BUCKETS[baldeDoPedido(ultimo)]?.dot || 'bg-slate-500'}"></span>${esc(RIGHTS[ultimo.right].short)}: ${esc(descreverPedido(ultimo))}</span><span>Ver no mapa →</span>
    </a>` : '';

  return `<article class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
    <div class="flex items-center gap-3">
      <div class="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-bold text-ink">
        ${esc(empresa.icon)}
        <span class="absolute -bottom-1 -right-1 text-sm" title="${esc(setor.label)}">${setor.emoji}</span>
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2"><h4 class="font-semibold">${esc(empresa.name)}</h4><span class="rounded-full px-2 py-0.5 text-[10px] font-bold ${tipo.style}">${tipo.label}</span></div>
        <p class="mt-0.5 truncate text-xs text-mist">${esc(empresa.domain)} · ${esc(setor.label)}${empresa.sectorEstimated ? ' (estimado)' : ''}</p>
      </div>
    </div>
    <div class="mt-3">${seloGravidade(gravidadeDe(empresa).chave)}</div>
    ${evidencia}
    ${empresa.dpo_email ? `<p class="mt-2 truncate text-[11px] text-slate-500">Contacto${empresa.contactExample ? ' de exemplo' : ''}: ${esc(empresa.dpo_email)}</p>` : ''}
    ${estadoPedido}
    <div class="mt-3 flex gap-2">
      <button data-action="pedido" data-id="${esc(empresa.id)}" data-right="access" type="button"
        class="flex-1 rounded-lg py-2.5 text-xs font-bold ${semContacto ? 'bg-slate-800 text-slate-500' : 'bg-white text-ink'}">${semContacto ? 'Contacto por verificar' : 'Pedir os meus dados'}</button>
      <button data-action="mais" data-id="${esc(empresa.id)}" type="button" class="rounded-lg bg-slate-800 px-3 py-2.5 text-xs font-bold text-slate-200" aria-label="Mais opções para ${esc(empresa.name)}">Mais opções</button>
    </div>
  </article>`;
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
      { label: 'Não é minha', estilo: 'secondary', acao: () => definirDescartada(empresa.id, true) },
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
  document.getElementById('demo-banner').classList.toggle('hidden', !estado.pedidos.some((pedido) => pedido.demo));
  document.getElementById('demo-banner-text').textContent = estado.demo
    ? 'Isto é um exemplo: as empresas e os pedidos não são reais.'
    : 'Os pedidos são um exemplo, mas as empresas vêm da tua análise.';
  if (!temMapa && !temPedidos) return;

  // A seleção pode deixar de existir (empresa descartada, exemplo apagado...)
  if (selecaoMapa) {
    const campo = { setor: 'sector', empresa: 'id', estado: 'balde', gravidade: 'gravidade' }[selecaoMapa.tipo];
    if (!nos.some((no) => no[campo] === selecaoMapa.chave)) selecaoMapa = null;
  }

  document.getElementById('map-card').classList.toggle('hidden', !temMapa);
  if (temMapa) {
    const areas = new Set(nos.map((no) => no.sector)).size;
    const enviados = estado.pedidos.filter((pedido) => pedido.status !== 'draft').length;
    document.getElementById('map-summary').innerHTML = `<span class="font-semibold text-white">${nos.length} ${plural(nos.length, 'empresa', 'empresas')}</span> em ${areas} ${plural(areas, 'área', 'áreas')} · ${enviados ? `${enviados} ${plural(enviados, 'pedido enviado', 'pedidos enviados')}` : 'ainda sem pedidos'}`;
    document.getElementById('map-mode').innerHTML = [['gravidade', 'Gravidade'], ['pedidos', 'Estado dos pedidos']].map(([chave, texto]) => `
      <button data-action="modo-mapa" data-mode="${chave}" type="button" aria-pressed="${modoMapa === chave}" class="flex-1 rounded-lg py-2 transition ${modoMapa === chave ? 'bg-white text-ink' : 'text-slate-400'}">${texto}</button>`).join('');
    document.getElementById('map-mode-help').textContent = modoMapa === 'gravidade'
      ? 'A cor mostra quão grave seria se os dados de cada empresa se perdessem. Quanto maior o ponto, mais grave.'
      : 'A cor mostra em que ponto está o teu pedido a cada empresa.';
    document.getElementById('dot-map').innerHTML = desenharMapa(nos);
    animarMapa = false;

    const legenda = modoMapa === 'gravidade'
      ? SEVERITY_ORDER.map((chave) => {
        const n = nos.filter((no) => no.gravidade === chave).length;
        const ativo = selecaoMapa?.tipo === 'gravidade' && selecaoMapa.chave === chave;
        return chipLegenda('mapa-gravidade', `data-severity="${chave}"`, ativo, n, iconeGravidade(chave), SEVERITY[chave].label);
      })
      : MAP_ORDER.map((chave) => {
        const n = nos.filter((no) => no.balde === chave).length;
        const ativo = selecaoMapa?.tipo === 'estado' && selecaoMapa.chave === chave;
        return chipLegenda('mapa-estado', `data-bucket="${chave}"`, ativo, n, `<span class="h-2 w-2 rounded-full" style="background:${BUCKETS[chave].hex}"></span>`, BUCKETS[chave].label);
      });
    document.getElementById('map-legend').innerHTML = legenda.join('');
    document.getElementById('map-detail').innerHTML = detalheDoMapa(nos);
  }

  document.getElementById('no-requests').classList.toggle('hidden', temPedidos);
  document.getElementById('requests-section').classList.toggle('hidden', !temPedidos);
  if (!temPedidos) return;

  const pedidos = [...estado.pedidos];
  const atencao = pedidos.filter(precisaDeAtencao).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  const espera = pedidos.filter((pedido) => !precisaDeAtencao(pedido) && pedido.status === 'sent')
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));
  const concluidos = pedidos.filter((pedido) => pedido.status === 'closed' || (pedido.status === 'reply_received' && pedido.holdsData !== null))
    .sort((a, b) => (b.closedAt || b.replyAt || '').localeCompare(a.closedAt || a.replyAt || ''));

  preencherGrupo('group-attention', atencao, 'Nada pendente. Está tudo em dia.');
  preencherGrupo('group-waiting', espera, 'Nenhum pedido à espera de resposta.');
  preencherGrupo('group-done', concluidos, 'Ainda nenhum pedido concluído.');
}

function chipLegenda(acao, atributo, ativo, n, icone, texto) {
  return `<button data-action="${acao}" ${atributo} type="button" ${n ? '' : 'disabled'} aria-pressed="${ativo}"
    class="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${ativo ? 'border-lime bg-lime/10 text-white' : 'border-slate-800 text-slate-300'} ${n ? '' : 'opacity-40'}">
    ${icone}${esc(texto)} · ${n}</button>`;
}

function preencherGrupo(id, pedidos, vazio) {
  const lista = document.querySelector(`#${id} > div`);
  lista.innerHTML = pedidos.length ? pedidos.map(criarCartaoPedido).join('') : `<p class="rounded-xl border border-dashed border-slate-800 px-4 py-4 text-center text-xs text-mist">${vazio}</p>`;
}

/* ==========================================================================
   Mapa de exposição: cada ponto é uma empresa, cada bolha é uma área
   ========================================================================== */
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

function desenharMapa(nos) {
  const porGravidade = modoMapa === 'gravidade';
  const ordemDoPonto = (a, b) => (porGravidade
    ? SEVERITY_ORDER.indexOf(a.gravidade) - SEVERITY_ORDER.indexOf(b.gravidade) || MAP_ORDER.indexOf(a.balde) - MAP_ORDER.indexOf(b.balde)
    : MAP_ORDER.indexOf(a.balde) - MAP_ORDER.indexOf(b.balde) || SEVERITY_ORDER.indexOf(a.gravidade) - SEVERITY_ORDER.indexOf(b.gravidade))
    || a.name.localeCompare(b.name);
  const grupos = SECTOR_ORDER
    .map((chave) => ({ chave, nos: nos.filter((no) => no.sector === chave).sort(ordemDoPonto) }))
    .filter((grupo) => grupo.nos.length)
    .map((grupo) => ({ ...grupo, ...posicoesEmAneis(grupo.nos.length), etiqueta: `${SECTORS[grupo.chave].short} · ${grupo.nos.length}` }))
    // As áreas mais graves primeiro, para ficarem no centro do mapa
    .sort((a, b) => SEVERITY_ORDER.indexOf(SECTORS[a.chave].gravidade) - SEVERITY_ORDER.indexOf(SECTORS[b.chave].gravidade) || b.nos.length - a.nos.length);
  arrumarBolhas(grupos);

  const r1 = (n) => Math.round(n * 10) / 10;
  const minX = Math.min(...grupos.map((g) => Math.min(g.x - g.r, etiquetaDe(g, g.x, g.y).x1)));
  const maxX = Math.max(...grupos.map((g) => Math.max(g.x + g.r, etiquetaDe(g, g.x, g.y).x2)));
  const minY = Math.min(...grupos.map((g) => g.y - g.r)) - 8;
  const maxY = Math.max(...grupos.map((g) => g.y + g.r + 22)) + 4;
  const largura = Math.max(MAPA.LARGURA, maxX - minX + 16);
  const x0 = (minX + maxX) / 2 - largura / 2;
  const sel = selecaoMapa || {};
  let ordemAnimacao = 0;

  const bolhas = grupos.map((g, indiceBolha) => {
    const setor = SECTORS[g.chave];
    const ativo = sel.tipo === 'setor' && sel.chave === g.chave;
    const contemSelecionada = sel.tipo === 'empresa' && g.nos.some((no) => no.id === sel.chave);
    const apagada = (sel.tipo === 'setor' && !ativo) || (sel.tipo === 'empresa' && !contemSelecionada);
    // No modo gravidade, o contorno da bolha tem a cor da gravidade base da área.
    const corArea = porGravidade ? SEVERITY[setor.gravidade].hex : setor.sensitive ? '#fb7185' : null;
    const tracejado = porGravidade ? setor.gravidade === 'critica' : setor.sensitive;
    const contorno = ativo ? '#c8f169' : corArea ? comAlfa(corArea, 0.55) : '#1e293b';
    const fundo = corArea && (!porGravidade || setor.gravidade === 'critica') ? comAlfa(corArea, 0.07) : 'rgba(15,23,42,0.85)';

    const pontos = g.nos.map((no, i) => {
      const x = r1(g.x + g.pos[i].x);
      const y = r1(g.y + g.pos[i].y);
      const cor = porGravidade ? SEVERITY[no.gravidade].hex : BUCKETS[no.balde].hex;
      const raio = porGravidade ? SEVERITY[no.gravidade].r : MAPA.PONTO;
      const escolhido = sel.tipo === 'empresa' && sel.chave === no.id;
      const esbatido = (sel.tipo === 'estado' && sel.chave !== no.balde) || (sel.tipo === 'gravidade' && sel.chave !== no.gravidade);
      const comBrilho = porGravidade ? no.gravidade === 'critica' : ['confirmado', 'atraso'].includes(no.balde);
      // Animações: entrada (ao abrir), "mudou" (quando a cor do ponto muda), radar (nos mais graves)
      const chaveCor = `${modoMapa}:${no.id}`;
      const corAntes = coresDosPontos.get(chaveCor);
      const mudou = !animarMapa && corAntes && corAntes !== cor;
      coresDosPontos.set(chaveCor, cor);
      const entrada = animarMapa ? ` class="dot-in" style="animation-delay:${Math.min(ordemAnimacao++ * 22, 900)}ms"` : '';
      const animacao = mudou ? ' class="ponto-mudou"' : entrada;
      const radar = comBrilho && !esbatido
        ? `<circle cx="${x}" cy="${y}" r="${raio}" fill="none" stroke="${cor}" stroke-width="1.5" class="ponto-radar" style="animation-delay:-${r1((i * 0.73 + indiceBolha * 0.41) % 2.4)}s" pointer-events="none"/>` : '';
      const onda = mudou ? `<circle cx="${x}" cy="${y}" r="${raio}" fill="none" stroke="${cor}" stroke-width="2" class="ponto-onda" pointer-events="none"/>` : '';
      const brilho = comBrilho && !esbatido ? `${radar}<circle cx="${x}" cy="${y}" r="${r1(raio + 3.5)}" fill="${cor}" opacity="0.22" pointer-events="none"${entrada}/>` : '';
      const descricao = `${no.name}: gravidade ${SEVERITY[no.gravidade].label.toLowerCase()}, ${BUCKETS[no.balde].label.toLowerCase()}`;
      // O ponto visível pode ser pequeno; um círculo invisível maior recebe o toque.
      return `${onda}${brilho}<circle data-dot="${esc(no.id)}" cx="${x}" cy="${y}" r="${raio}" fill="${cor}"
        stroke="${escolhido ? '#ffffff' : '#07111f'}" stroke-width="${escolhido ? 2.5 : 1.5}" opacity="${esbatido ? 0.18 : 1}" pointer-events="none"${animacao}/>
        <circle data-action="mapa-empresa" data-id="${esc(no.id)}" cx="${x}" cy="${y}" r="${MAPA.TOQUE}" fill="transparent" class="cursor-pointer"><title>${esc(descricao)}</title></circle>`;
    }).join('');

    return `<g data-action="mapa-setor" data-sector="${g.chave}" role="button" tabindex="0" aria-label="${esc(setor.label)}: ${g.nos.length} ${plural(g.nos.length, 'empresa', 'empresas')}, gravidade ${SEVERITY[setor.gravidade].label.toLowerCase()}" class="cursor-pointer outline-none" opacity="${apagada ? 0.35 : 1}">
      <g class="bolha-flutua" style="--dur:${r1(5.5 + (indiceBolha % 4) * 0.8)}s;--atraso:-${r1(indiceBolha * 0.9)}s">
        <circle cx="${r1(g.x)}" cy="${r1(g.y)}" r="${r1(g.r)}" fill="${fundo}" stroke="${contorno}" stroke-width="${ativo ? 2 : 1.25}"${tracejado && !ativo ? ' stroke-dasharray="4 4"' : ''}${ativo ? ' class="bolha-ativa"' : ''}/>
        <text x="${r1(g.x)}" y="${r1(g.y + 7)}" text-anchor="middle" font-size="19" pointer-events="none">${setor.emoji}</text>
        ${pontos}
        <text x="${r1(g.x)}" y="${r1(g.y + g.r + 15)}" text-anchor="middle" font-size="11.5" font-weight="600" fill="#cbd5e1">${esc(g.etiqueta)}</text>
      </g>
    </g>`;
  }).join('');

  return `<svg viewBox="${r1(x0)} ${r1(minY)} ${r1(largura)} ${r1(maxY - minY)}" class="block h-auto w-full select-none" role="group" aria-label="Mapa de exposição por área">
    <rect data-action="mapa-limpar" x="${r1(x0)}" y="${r1(minY)}" width="${r1(largura)}" height="${r1(maxY - minY)}" fill="transparent"/>
    ${bolhas}
  </svg>`;
}

function comAlfa(hex, alfa) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${alfa})`;
}

// Os pontos ficam em anéis à volta do emoji da área, repartidos pelos anéis
// em proporção ao espaço de cada um, para a bolha ficar equilibrada.
function posicoesEmAneis(n) {
  const aneis = [];
  let raio = MAPA.ANEL0;
  let capacidadeTotal = 0;
  while (capacidadeTotal < n) {
    const capacidade = Math.max(1, Math.floor((2 * Math.PI * raio) / MAPA.ARCO));
    aneis.push({ raio, capacidade });
    capacidadeTotal += capacidade;
    raio += MAPA.PASSO_ANEL;
  }
  aneis.forEach((anel) => { anel.k = Math.floor((n * anel.capacidade) / capacidadeTotal); });
  let resto = n - aneis.reduce((soma, anel) => soma + anel.k, 0);
  for (let i = aneis.length - 1; resto > 0; i = (i - 1 + aneis.length) % aneis.length) {
    if (aneis[i].k < aneis[i].capacidade) { aneis[i].k += 1; resto -= 1; }
  }
  const pos = [];
  aneis.forEach((anel, indice) => {
    const rodar = indice % 2 ? Math.PI / Math.max(anel.k, 1) : 0;
    for (let i = 0; i < anel.k; i++) {
      const angulo = -Math.PI / 2 + rodar + (2 * Math.PI * i) / anel.k;
      pos.push({ x: anel.raio * Math.cos(angulo), y: anel.raio * Math.sin(angulo) });
    }
  });
  const ultimo = aneis.filter((anel) => anel.k > 0).pop();
  return { pos, r: ultimo.raio + MAPA.PONTO + 8 };
}

// Coloca as bolhas uma a uma, encostadas às que já estão, o mais perto possível
// do centro e sem passar da largura do ecrã. A etiqueta por baixo de cada bolha
// também conta: nem bolhas nem etiquetas se podem tocar.
function arrumarBolhas(grupos) {
  const meiaLargura = MAPA.LARGURA / 2 - 6;
  const colocadas = [];
  const cabe = (g, x, y) => {
    const etiqueta = etiquetaDe(g, x, y);
    if (Math.abs(x) + g.r > meiaLargura || etiqueta.x1 < -meiaLargura || etiqueta.x2 > meiaLargura) return false;
    return colocadas.every((q) => {
      const etiquetaQ = etiquetaDe(q, q.x, q.y);
      return Math.hypot(q.x - x, q.y - y) >= q.r + g.r + MAPA.FOLGA
        && !circuloTocaRetangulo(q.x, q.y, q.r + 4, etiqueta)
        && !circuloTocaRetangulo(x, y, g.r + 4, etiquetaQ)
        && !retangulosTocam(etiqueta, etiquetaQ, 6);
    });
  };
  grupos.forEach((g) => {
    let melhor = colocadas.length ? null : { x: 0, y: 0 };
    colocadas.forEach((p) => {
      [0, 12, 24].forEach((extra) => {
        for (let graus = 0; graus < 360; graus += 6) {
          const angulo = (graus * Math.PI) / 180;
          const distancia = p.r + g.r + MAPA.FOLGA + extra;
          const x = p.x + distancia * Math.cos(angulo);
          const y = p.y + distancia * Math.sin(angulo);
          if (!cabe(g, x, y)) continue;
          const custo = x * x * 0.12 + y * y;
          if (!melhor || custo < melhor.custo) melhor = { x, y, custo };
        }
      });
    });
    if (!melhor) melhor = { x: 0, y: Math.max(...colocadas.map((q) => q.y + q.r + 20)) + MAPA.FOLGA + g.r };
    g.x = melhor.x;
    g.y = melhor.y;
    colocadas.push(g);
  });
}

// Caixa aproximada da etiqueta por baixo da bolha (texto de 11,5 px)
function etiquetaDe(g, x, y) {
  const largura = g.etiqueta.length * 6.6 + 6;
  return { x1: x - largura / 2, x2: x + largura / 2, y1: y + g.r + 3, y2: y + g.r + 19 };
}

function circuloTocaRetangulo(cx, cy, r, ret) {
  const px = Math.min(Math.max(cx, ret.x1), ret.x2);
  const py = Math.min(Math.max(cy, ret.y1), ret.y2);
  return Math.hypot(cx - px, cy - py) < r;
}

function retangulosTocam(a, b, folga) {
  return a.x1 - folga < b.x2 && b.x1 - folga < a.x2 && a.y1 - folga < b.y2 && b.y1 - folga < a.y2;
}

function detalheDoMapa(nos) {
  const sel = selecaoMapa;
  const fechar = '<button data-action="mapa-limpar" type="button" class="shrink-0 text-xs font-semibold text-slate-400">Fechar</button>';
  const dica = '<p class="mt-3 text-[11px] leading-4 text-mist">Toca numa área para veres as empresas que lá estão, ou num ponto para veres uma empresa.</p>';
  const cabecalho = (icone, titulo, subtitulo) => `
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="flex items-center gap-2 font-semibold">${icone}${titulo}</p>
        ${subtitulo ? `<p class="mt-0.5 text-xs text-mist">${subtitulo}</p>` : ''}
      </div>
      ${sel ? fechar : ''}
    </div>`;
  const porque = (chave, texto) => `
    <div class="mt-3 flex gap-2.5 rounded-xl bg-ink/60 px-3 py-2.5 text-xs leading-5 text-slate-300">
      <span class="mt-1">${iconeGravidade(chave)}</span>
      <p><span class="font-semibold text-white">Gravidade ${SEVERITY[chave].label.toLowerCase()}.</span> ${esc(texto)}</p>
    </div>`;
  const ordenar = (lista) => [...lista].sort((a, b) => SEVERITY_ORDER.indexOf(a.gravidade) - SEVERITY_ORDER.indexOf(b.gravidade)
    || MAP_ORDER.indexOf(a.balde) - MAP_ORDER.indexOf(b.balde) || a.name.localeCompare(b.name));
  const linhas = (lista, mostrarArea) => `<div class="mt-2">${ordenar(lista).map((no) => linhaDoMapa(no, mostrarArea)).join('')}</div>`;
  const contar = (n) => `${n} ${plural(n, 'empresa', 'empresas')}`;

  if (!sel) {
    if (modoMapa === 'gravidade') {
      const nivel = SEVERITY_ORDER.find((chave) => nos.some((no) => no.gravidade === chave));
      const lista = nos.filter((no) => no.gravidade === nivel);
      return `${cabecalho(iconeGravidade(nivel, 12), `Gravidade ${SEVERITY[nivel].label.toLowerCase()}`, `${contar(lista.length)}: ${nivel === 'critica' ? 'começa por estas' : 'as mais graves que encontrámos'}`)}
        ${linhas(lista, true)}${dica}`;
    }
    const confirmadas = nos.filter((no) => no.balde === 'confirmado');
    if (!confirmadas.length) return `<p class="text-sm font-semibold">O que mostra o mapa</p>${dica}`;
    return `${cabecalho('<span class="h-2.5 w-2.5 rounded-full bg-rose-400"></span>', 'Confirmaram que têm os teus dados', contar(confirmadas.length))}
      ${linhas(confirmadas, true)}${dica}`;
  }

  if (sel.tipo === 'setor') {
    const setor = SECTORS[sel.chave];
    const daArea = nos.filter((no) => no.sector === sel.chave);
    const confirmadas = daArea.filter((no) => no.balde === 'confirmado').length;
    return `${cabecalho(`<span class="text-lg" aria-hidden="true">${setor.emoji}</span>`, esc(setor.label), `${contar(daArea.length)}${confirmadas ? ` · ${confirmadas} ${plural(confirmadas, 'confirmou', 'confirmaram')} que tem os teus dados` : ''}`)}
      ${porque(setor.gravidade, setor.porque)}
      ${linhas(daArea, false)}`;
  }

  if (sel.tipo === 'estado') {
    const comEstado = nos.filter((no) => no.balde === sel.chave);
    return `${cabecalho(`<span class="h-2.5 w-2.5 rounded-full" style="background:${BUCKETS[sel.chave].hex}"></span>`, esc(BUCKETS[sel.chave].label), contar(comEstado.length))}
      ${linhas(comEstado, true)}`;
  }

  if (sel.tipo === 'gravidade') {
    const doNivel = nos.filter((no) => no.gravidade === sel.chave);
    return `${cabecalho(iconeGravidade(sel.chave, 12), `Gravidade ${SEVERITY[sel.chave].label.toLowerCase()}`, contar(doNivel.length))}
      ${linhas(doNivel, true)}`;
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
  const pedir = !pedidosDaEmpresa.length && no.empresa
    ? `<button data-action="pedido" data-id="${esc(no.id)}" data-right="access" type="button" class="rounded-lg px-3 py-2 text-xs font-bold ${semContacto ? 'bg-slate-800 text-slate-500' : 'bg-white text-ink'}">${semContacto ? 'Contacto por verificar' : 'Pedir os meus dados'}</button>` : '';
  return `${cabecalho(`<span class="h-2.5 w-2.5 rounded-full" style="background:${modoMapa === 'gravidade' ? SEVERITY[no.gravidade].hex : BUCKETS[no.balde].hex}"></span>`, esc(no.name), `${no.empresa ? `${esc(no.empresa.domain)} · ` : ''}${setor.emoji} ${esc(setor.label)}`)}
    ${porque(no.gravidade, no.motivo)}
    <p class="mt-3 text-xs text-slate-300">Pedido: ${esc(BUCKETS[no.balde].label.toLowerCase())}${ev ? ` · ${ev.count} ${plural(ev.count, 'email', 'emails')} na análise` : ''}</p>
    ${no.empresa?.dpo_email ? `<p class="mt-1 truncate text-[11px] text-slate-500">Contacto${no.empresa.contactExample ? ' de exemplo' : ''}: ${esc(no.empresa.dpo_email)}</p>` : ''}
    ${historico ? `<div class="mt-2">${historico}</div>` : ''}
    <div class="mt-3 flex flex-wrap gap-2">
      ${pedir}
      <button data-action="mapa-setor" data-sector="${no.sector}" type="button" class="rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-slate-200">Ver a área ${esc(setor.short)}</button>
    </div>`;
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
    acao = `<button data-action="pedido" data-id="${esc(no.id)}" data-right="access" type="button" class="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-ink">Pedir dados</button>`;
  }
  const cor = modoMapa === 'gravidade' ? SEVERITY[no.gravidade].hex : BUCKETS[no.balde].hex;
  return `<div class="flex items-center gap-3 border-b border-slate-800 py-2.5 last:border-b-0">
    <span class="h-2.5 w-2.5 shrink-0 rounded-full" style="background:${cor}"></span>
    <button data-action="mapa-empresa" data-id="${esc(no.id)}" type="button" class="min-w-0 flex-1 text-left">
      <span class="block truncate text-sm font-semibold">${esc(no.name)}${mostrarArea ? ` <span aria-hidden="true">${setor.emoji}</span>` : ''}</span>
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
    acoes.push(botao('resposta', pedido.id, 'A empresa respondeu', 'primary'));
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
        <p class="flex items-center gap-2 font-semibold"><span class="h-2 w-2 shrink-0 rounded-full ${balde ? BUCKETS[balde].dot : 'bg-slate-500'}"></span>${esc(pedido.companyName)} <span class="text-sm" aria-hidden="true">${setor.emoji}</span></p>
        <p class="mt-0.5 text-xs text-mist">${esc(direito.short)} · ${esc(direito.article)}</p>
      </div>
      ${resultado}
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
function abrirFolha({ titulo, texto, opcoes }) {
  opcoesFolha = opcoes;
  folhaAberta = true;
  document.getElementById('sheet-title').textContent = titulo;
  document.getElementById('sheet-text').textContent = texto;
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
    case 'repor-descartadas': estado.empresas.forEach((empresa) => { empresa.dismissed = false; }); guardarEstado(); renderTudo(); break;
    case 'confirmar-envio': confirmarEnvio(id); break;
    case 'nao-enviado': marcarNaoEnviado(id); break;
    case 'reabrir': reabrirRascunho(id); break;
    case 'apagar-rascunho': apagarRascunho(id); break;
    case 'resposta': registarResposta(id); break;
    case 'insistir': enviarInsistencia(id); break;
    case 'sem-resposta': aplicarResultado(id, 'no_reply'); break;
    case 'exemplo-mapa': carregarExemplo(true); break;
    case 'limpar-exemplo': limparExemplo(); mostrarToast('Exemplo apagado.'); break;
    case 'apagar-tudo': confirmarApagarTudo(); break;
    case 'nova-analise': renderResumo.novaAnalise = true; renderResumo(); break;
    case 'mapa-setor': alternarSelecao('setor', sector); break;
    case 'mapa-empresa': alternarSelecao('empresa', id); break;
    case 'mapa-estado': alternarSelecao('estado', bucket); break;
    case 'mapa-gravidade': alternarSelecao('gravidade', alvo.dataset.severity); break;
    case 'modo-mapa':
      if (modoMapa !== alvo.dataset.mode) {
        modoMapa = alvo.dataset.mode;
        if (selecaoMapa && ['estado', 'gravidade'].includes(selecaoMapa.tipo)) selecaoMapa = null;
        animarMapa = true;
        renderPedidos();
      }
      break;
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

// Apaga só o que é do exemplo: os pedidos reais nunca são tocados.
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
  estado = { empresas: [], pedidos: [], analisadoEm: null, demo: false };
  renderResumo.novaAnalise = false;
  selecaoMapa = null;
  try { localStorage.removeItem(STORAGE_KEY); } catch (erro) { /* sem armazenamento */ }
  renderTudo();
}

/* ==========================================================================
   Exemplo (demonstração)
   ========================================================================== */
// Exemplo de pedidos: [direito, há quantos dias foi enviado, resposta da empresa]
const PLANO_EXEMPLO = [
  ['access', 30, 'data_received'],        // tem os teus dados
  ['access', 40, null],                   // em atraso
  ['erasure', 10, null],                  // à espera
  ['objection', 20, 'objection_accepted'], // tem os dados, mas sem marketing
  ['erasure', 25, 'data_erased']          // já não tem
];

function carregarExemplo(comPedidos) {
  renderResumo.novaAnalise = false;
  selecaoMapa = null;
  // Com uma análise real, o exemplo usa as empresas dessa análise: só os pedidos são simulados.
  const temAnaliseReal = estado.empresas.length > 0 && !estado.demo;
  if (!comPedidos || !temAnaliseReal) {
    if (!estado.empresas.length || !estado.demo) substituirEmpresas(empresasDemo.map((empresa) => ({ ...empresa })), true);
  }
  if (comPedidos) {
    estado.pedidos = estado.pedidos.filter((pedido) => !pedido.demo);
    escolherParaExemplo(PLANO_EXEMPLO.length).forEach((empresa, i) => {
      const [right, diasEnvio, outcome] = PLANO_EXEMPLO[i];
      const sentAt = diasAtras(diasEnvio);
      const pedido = {
        id: gerarId(), companyId: empresa.id, companyName: empresa.name, companySector: empresa.sector, domain: empresa.domain, email: empresa.dpo_email,
        right, status: 'sent', createdAt: sentAt, sentAt, dueDate: estimarPrazo(sentAt), replyAt: null, closedAt: null,
        closeReason: null, outcome: null, holdsData: null, followUpAt: null, demo: true,
        timeline: [{ to: 'awaiting_confirmation', at: sentAt }, { to: 'sent', at: sentAt }]
      };
      if (outcome) {
        const resultado = OUTCOMES[outcome];
        pedido.replyAt = diasAtras(Math.max(diasEnvio - 12, 0));
        pedido.outcome = outcome;
        pedido.holdsData = resultado.holdsData;
        pedido.status = resultado.closeReason ? 'closed' : 'reply_received';
        pedido.closeReason = resultado.closeReason;
        pedido.closedAt = resultado.closeReason ? pedido.replyAt : null;
      }
      pedido.timeline.push(...(pedido.replyAt ? [{ to: 'reply_received', at: pedido.replyAt }] : []), ...(pedido.closedAt ? [{ to: 'closed', at: pedido.closedAt }] : []));
      estado.pedidos.push(pedido);
    });
    guardarEstado();
  }
  renderTudo();
}

// Escolhe empresas da análise para o exemplo: uma por área (as sensíveis primeiro),
// a com mais emails de cada área, e nunca uma que já tenha pedidos reais.
function escolherParaExemplo(quantas) {
  const comPedidosReais = new Set(estado.pedidos.map((pedido) => pedido.companyId));
  const porArea = SECTOR_ORDER
    .map((chave) => visiveis()
      .filter((empresa) => empresa.sector === chave && empresa.dpo_email && !comPedidosReais.has(empresa.id))
      .sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || (b.evidence?.count || 0) - (a.evidence?.count || 0)))
    .filter((lista) => lista.length)
    .sort((a, b) => SEVERITY_ORDER.indexOf(SECTORS[a[0].sector].gravidade) - SEVERITY_ORDER.indexOf(SECTORS[b[0].sector].gravidade) || b.length - a.length);
  const escolhidas = [];
  for (let volta = 0; escolhidas.length < quantas && porArea.some((lista) => lista[volta]); volta++) {
    porArea.forEach((lista) => { if (lista[volta] && escolhidas.length < quantas) escolhidas.push(lista[volta]); });
  }
  return escolhidas;
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