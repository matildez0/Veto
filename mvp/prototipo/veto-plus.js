'use strict';

/* ==========================================================================
   Veto+ (subscrição)
   - Pagamento: Stripe Payment Links (sem servidor). O Stripe devolve a pessoa à app com
     ?plus=ok&plano=…&sessao=cs_test_… e a app ativa o Veto+ neste dispositivo.
   - Em localhost, o Veto+ ativa-se em modo de desenvolvimento (sem pagar).
   - O estado do Veto+ fica em localStorage (PLUS_KEY), à parte do resto dos dados.
   LIMITE DESTA VERSÃO: sem servidor não há forma de confirmar um pagamento junto do Stripe, por isso
   quem souber o formato do link pode ativar o Veto+ sem pagar. Só se aceitam sessões de TESTE (cs_test_…);
   as reais (cs_live_…) são recusadas. Para cobrar a sério, é preciso uma função no servidor que confirme
   a sessão com a chave secreta do Stripe (e, com ela, recuperar a subscrição noutro dispositivo).
   Eventos: plus_visto, plus_aberto, plus_checkout_aberto, plus_ativado, plus_agora_nao.
   ========================================================================== */
const PLUS = {
  MENSAL: '1,99 €',
  ANUAL: '19,99 €',
  MAX_CONTAS: 5,
  PAGAMENTO: {
    LINK_MENSAL: 'https://buy.stripe.com/test_eVq4gBefq8Bc8k1eZGeQM00',
    LINK_ANUAL: 'https://buy.stripe.com/test_14A28t1sEcRsbwd5p6eQM01',
    PORTAL_URL: ''
  },
  FUNCOES: [
    ['Várias contas', 'Junta os teus emails pessoais e de trabalho numa só análise.', true],
    ['Limpeza profunda', 'Cancela as subscrições todas de uma vez e apaga os emails antigos dessas empresas.', false],
    ['Análise contínua', 'A contagem de emails e a gravidade de cada empresa sempre atualizadas.', false],
    ['Pedidos acompanhados', 'Segue cada pedido ao DPO, avisa quando o prazo passa e prepara a insistência.', false]
  ]
};
const PLUS_KEY = 'veto.plus.v1';
let plus = null;
const MONITOR_KEY = 'veto.plus.monitorizacao.v1';
let monitorizacao = {
  ativa: false,
  frequencia: 'semanal',
  verificadaEm: null,
  empresasConhecidas: [],
  noticiasConhecidas: [],
  novasEmpresas: [],
  novasNoticias: []
};

function carregarMonitorizacao() {
  try {
    const guardado = JSON.parse(localStorage.getItem(MONITOR_KEY) || 'null');
    if (guardado) monitorizacao = { ...monitorizacao, ...guardado };
  } catch (erro) {
    // Sem armazenamento: a monitorização vale só nesta sessão.
  }
}

function guardarMonitorizacao() {
  try { localStorage.setItem(MONITOR_KEY, JSON.stringify(monitorizacao)); } catch (erro) { /* só nesta sessão */ }
}

function intervaloMonitorizacao() {
  return { diaria: 86400000, semanal: 604800000, mensal: 2592000000 }[monitorizacao.frequencia] || 604800000;
}

function empresasMonitorizadas() {
  return estado.empresas.filter((empresa) => !empresa.dismissed).map((empresa) => ({
    id: empresa.id, name: empresa.name, domain: empresa.domain
  }));
}

function noticiasDasMinhasEmpresas() {
  const dominios = new Set(empresasMonitorizadas().map((empresa) => empresa.domain));
  return NOTICIAS.filter((noticia) => (noticia.dominios || []).some((dominio) => [...dominios].some((d) => d === dominio || d.endsWith(`.${dominio}`))));
}

function verificarMonitorizacao(forcar = false) {
  if (!monitorizacao.ativa) {
    mostrarToast('Ativa primeiro a monitorização.');
    return;
  }
  if (!estado.empresas.length) {
    mostrarToast('Faz primeiro uma análise do Gmail.');
    return;
  }
  if (!forcar && monitorizacao.verificadaEm && Date.now() - new Date(monitorizacao.verificadaEm).getTime() < intervaloMonitorizacao()) {
    mostrarToast(`A próxima verificação está definida para ${monitorizacao.frequencia}.`);
    return;
  }
  const empresas = empresasMonitorizadas();
  const noticias = noticiasDasMinhasEmpresas();
  const empresasAnteriores = new Set(monitorizacao.empresasConhecidas);
  const noticiasAnteriores = new Set(monitorizacao.noticiasConhecidas);
  monitorizacao.novasEmpresas = empresas.filter((empresa) => !empresasAnteriores.has(empresa.id));
  monitorizacao.novasNoticias = noticias.filter((noticia) => !noticiasAnteriores.has(noticia.id));
  monitorizacao.empresasConhecidas = empresas.map((empresa) => empresa.id);
  monitorizacao.noticiasConhecidas = noticias.map((noticia) => noticia.id);
  monitorizacao.verificadaEm = new Date().toISOString();
  guardarMonitorizacao();
  const total = monitorizacao.novasEmpresas.length + monitorizacao.novasNoticias.length;
  if (total && 'Notification' in window && Notification.permission === 'granted') {
    new Notification('Atualização do Veto+', { body: `${total} novidade${total === 1 ? '' : 's'} desde a última verificação.` });
  }
  renderMonitorizacao();
  mostrarToast(total ? `${total} novidade${total === 1 ? '' : 's'} encontrada${total === 1 ? '' : 's'}.` : 'Nenhuma novidade desde a última verificação.');
}

async function ativarMonitorizacao() {
  if (!temPlus()) {
    abrirPlus('monitorizacao');
    return;
  }
  if (!estado.empresas.length) {
    mostrarToast('Faz primeiro uma análise do Gmail para ativar a monitorização.');
    return;
  }
  const frequencia = document.querySelector('input[name="monitor-frequencia"]:checked')?.value || 'semanal';
  if ('Notification' in window && Notification.permission !== 'granted') {
    const permissao = await Notification.requestPermission();
    if (permissao !== 'granted') {
      mostrarToast('A monitorização precisa de permissão para mostrar notificações.');
      return;
    }
  }
  monitorizacao = {
    ...monitorizacao,
    ativa: true,
    frequencia,
    verificadaEm: new Date().toISOString(),
    empresasConhecidas: empresasMonitorizadas().map((empresa) => empresa.id),
    noticiasConhecidas: noticiasDasMinhasEmpresas().map((noticia) => noticia.id),
    novasEmpresas: [],
    novasNoticias: []
  };
  guardarMonitorizacao();
  renderMonitorizacao();
  mostrarToast('Monitorização ativada. A primeira verificação fica como referência.');
}

function desativarMonitorizacao() {
  monitorizacao.ativa = false;
  monitorizacao.novasEmpresas = [];
  monitorizacao.novasNoticias = [];
  guardarMonitorizacao();
  renderMonitorizacao();
  mostrarToast('Monitorização desligada. Podes voltar a ativá-la quando quiseres.');
}

function renderMonitorizacao() {
  const estadoEl = document.getElementById('monitorizacao-estado');
  const novasEl = document.getElementById('monitorizacao-novas');
  if (!estadoEl || !novasEl) return;
  document.querySelectorAll('input[name="monitor-frequencia"]').forEach((input) => { input.checked = input.value === monitorizacao.frequencia; });
  const ultima = monitorizacao.verificadaEm ? `Última verificação: ${formatarData(monitorizacao.verificadaEm)}` : 'Ainda não foi verificado.';
  estadoEl.textContent = monitorizacao.ativa ? `Ativa · ${monitorizacao.frequencia}. ${ultima}` : 'Desligada.';
  const toggle = document.getElementById('monitorizacao-toggle');
  toggle.textContent = monitorizacao.ativa ? 'Desligar monitorização' : 'Ativar monitorização';
  toggle.dataset.action = monitorizacao.ativa ? 'desativar-monitorizacao' : 'ativar-monitorizacao';
  toggle.setAttribute('aria-pressed', String(monitorizacao.ativa));
  const itens = [
    ...monitorizacao.novasEmpresas.map((empresa) => `<li class="rounded-xl border border-lime/30 bg-lime/10 px-3 py-2 text-xs"><strong>${esc(empresa.name)}</strong> é uma empresa nova desde a última verificação.</li>`),
    ...monitorizacao.novasNoticias.map((noticia) => `<li class="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs"><strong>${esc(noticia.empresa)}</strong>: ${esc(noticia.titulo)}</li>`)
  ];
  novasEl.innerHTML = itens.length ? `<ul class="flex flex-col gap-2">${itens.join('')}</ul>` : '<p class="text-xs text-mist">Não há empresas ou notícias novas.</p>';
}

function plusComStripe() {
  return Boolean(PLUS.PAGAMENTO.LINK_MENSAL && PLUS.PAGAMENTO.LINK_ANUAL);
}

function desenvolvimentoLocal() {
  return ['localhost', '127.0.0.1', '::1'].includes(location.hostname);
}

function temPlus() {
  return Boolean(plus);
}

function limiteDeContas() {
  return temPlus() ? PLUS.MAX_CONTAS : 1;
}

function carregarPlus() {
  try {
    const guardado = JSON.parse(localStorage.getItem(PLUS_KEY) || 'null');
    if (guardado && ['mensal', 'anual'].includes(guardado.plano)) plus = guardado;
  } catch (erro) {
    // Sem armazenamento: o Veto+ vale só nesta sessão.
  }
}

function guardarPlus() {
  try {
    if (plus) localStorage.setItem(PLUS_KEY, JSON.stringify(plus));
    else localStorage.removeItem(PLUS_KEY);
  } catch (erro) {
    // Ignorar
  }
}

function ativarPlus(plano, origem, sessao = '') {
  plus = { plano, origem, sessao, ativadoEm: new Date().toISOString() };
  guardarPlus();
  registarEvento('plus_ativado', { plano, origem });
}

function desativarPlus() {
  plus = null;
  guardarPlus();
  renderTudo();
}

// Chamado no arranque: o Stripe volta à app com ?plus=ok&plano=…&sessao=…
function tratarRetornoPagamento() {
  const params = new URLSearchParams(location.search);
  if (params.get('plus') !== 'ok') return null;
  const plano = params.get('plano') === 'anual' ? 'anual' : 'mensal';
  const sessao = params.get('sessao') || '';
  ['plus', 'plano', 'sessao'].forEach((nome) => params.delete(nome));
  const resto = params.toString();
  try { history.replaceState(null, '', location.pathname + (resto ? `?${resto}` : '') + location.hash); } catch (erro) { /* ignorar */ }
  if (!/^cs_test_[A-Za-z0-9]{10,}$/.test(sessao)) return 'invalido';
  ativarPlus(plano, 'stripe', sessao);
  return 'ok';
}

function mostrarRetornoPagamento(resultado) {
  if (resultado === 'ok') {
    abrirFolha({
      titulo: 'Veto+ ativo',
      texto: `Obrigado! Já podes juntar até ${PLUS.MAX_CONTAS} contas de email numa só análise.`,
      nota: 'Pagamento de teste (Stripe): não foi cobrado dinheiro real.',
      opcoes: [
        { label: 'Adicionar outra conta', estilo: 'primary', acao: () => adicionarConta() },
        { label: 'Mais tarde', estilo: 'ghost', acao: () => {} }
      ]
    });
  } else if (resultado === 'invalido') {
    abrirFolha({
      titulo: 'Não conseguimos confirmar o pagamento',
      texto: 'O link de retorno do pagamento não é válido. Se já pagaste e o Veto+ não ficou ativo, escreve-nos com o recibo do Stripe.',
      opcoes: [{ label: 'Fechar', estilo: 'primary', acao: () => {} }]
    });
  }
}

function funcoesDoPlus() {
  return PLUS.FUNCOES.map(([nome, descricao, pronta]) => [nome, pronta ? descricao : `${descricao} Em breve.`]);
}

function renderPlus(tempoTotal) {
  const ativo = temPlus();
  document.getElementById('plus-card-text').textContent = ativo
    ? tt('Veto+ ativo. Podes juntar até {0} contas de email numa só análise.', [PLUS.MAX_CONTAS])
    : tempoTotal
      ? tt('Estes emails já te custaram ≈ {0}. Com o Veto+ juntas as tuas contas numa só análise.', [formatarDuracao(tempoTotal)])
      : tt('Junta os teus emails pessoais e de trabalho numa só análise.');
  document.getElementById('plus-card-badge').textContent = ativo ? tt('Ativo') : tt('Novo');
  document.getElementById('plus-card-cta').textContent = ativo ? tt('Gerir o Veto+') : tt('Ver o Veto+');
  document.getElementById('plus-card-price').textContent = ativo ? '' : tt('{0}/mês →', [PLUS.MENSAL]);
}

function registarPlusVisto() {
  if (estado.plusVisto || !estado.teste?.consentimento) return;
  estado.plusVisto = true;
  registarEvento('plus_visto', { onde: 'inicio', analisou: estado.empresas.length > 0 });
}

function abrirPlus(onde = 'outro') {
  registarEvento('plus_aberto', { onde, ativo: temPlus() });
  if (temPlus()) {
    abrirGestaoDoPlus();
    return;
  }
  abrirFolha({
    titulo: 'Veto+',
    texto: 'Para deixares de perder tempo com os emails das empresas e teres os teus pedidos tratados até ao fim.',
    lista: funcoesDoPlus(),
    nota: desenvolvimentoLocal()
      ? 'Modo de desenvolvimento local: o Veto+ ativa-se sem pagamento.'
      : plusComStripe()
      ? 'Modo de teste: no pagamento usa o cartão 4242 4242 4242 4242, uma data futura e qualquer CVC. Não é cobrado dinheiro real.'
      : 'Modo de demonstração: o Veto+ ativa-se sem pagamento, só para o experimentares.',
    opcoes: [
      { label: `Subscrever mensal · ${PLUS.MENSAL}/mês`, estilo: 'primary', acao: () => comprarPlus('mensal', onde) },
      { label: `Subscrever anual · ${PLUS.ANUAL}/ano (2 meses grátis)`, estilo: 'secondary', acao: () => comprarPlus('anual', onde) },
      { label: 'Agora não', estilo: 'ghost', acao: () => registarEvento('plus_agora_nao', { onde }) }
    ]
  });
}

function abrirGestaoDoPlus() {
  const desde = new Date(plus.ativadoEm).toLocaleDateString('pt-PT');
  const doStripe = plus.origem === 'stripe';
  const opcoes = [{ label: 'Adicionar outra conta', estilo: 'primary', acao: () => adicionarConta() }];
  if (doStripe && PLUS.PAGAMENTO.PORTAL_URL) {
    opcoes.push({
      label: 'Gerir ou cancelar a subscrição', estilo: 'secondary',
      acao: () => { window.open(PLUS.PAGAMENTO.PORTAL_URL, '_blank', 'noopener'); }
    });
  }
  opcoes.push({
    label: doStripe ? 'Desativar o Veto+ neste dispositivo' : 'Desativar o modo de demonstração', estilo: 'secondary',
    acao: () => { desativarPlus(); mostrarToast('Veto+ desativado neste dispositivo.'); }
  });
  opcoes.push({ label: 'Fechar', estilo: 'ghost', acao: () => {} });
  abrirFolha({
    titulo: 'Veto+ ativo',
    texto: `Plano ${plus.plano}, ativo desde ${desde}. Podes juntar até ${PLUS.MAX_CONTAS} contas de email.`,
    lista: funcoesDoPlus(),
    nota: doStripe
      ? 'Pagamento de teste (Stripe): não foi cobrado dinheiro real. Desativar aqui não cancela a subscrição no Stripe.'
      : 'Ativado em modo de demonstração, sem pagamento.',
    opcoes
  });
}

function comprarPlus(plano, onde) {
  const stripeAtivo = plusComStripe() && !desenvolvimentoLocal();
  registarEvento('plus_checkout_aberto', { plano, onde, modo: stripeAtivo ? 'stripe' : 'desenvolvimento_local' });
  if (!stripeAtivo) {
    ativarPlus(plano, desenvolvimentoLocal() ? 'desenvolvimento_local' : 'demonstracao');
    renderTudo();
    mostrarRetornoPagamento('ok');
    return;
  }
  const url = new URL(plano === 'anual' ? PLUS.PAGAMENTO.LINK_ANUAL : PLUS.PAGAMENTO.LINK_MENSAL);
  url.searchParams.set('client_reference_id', gerarId().replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40));
  url.searchParams.set('locale', 'pt');
  window.location.href = url.toString();
}
