'use strict';

/* ==========================================================================
   Veto+ (subscrição)
   - Pagamento: Stripe Payment Links (sem servidor). O Stripe devolve a pessoa à app com
     ?plus=ok&plano=…&sessao=cs_test_… e a app ativa o Veto+ neste dispositivo.
   - Sem links configurados, o Veto+ ativa-se em modo de demonstração (sem pagar).
   - O estado do Veto+ fica em localStorage (PLUS_KEY), à parte do resto dos dados.
   LIMITE DESTA VERSÃO: sem servidor não há forma de confirmar um pagamento junto do Stripe, por isso
   quem souber o formato do link pode ativar o Veto+ sem pagar. Só se aceitam sessões de TESTE (cs_test_…);
   as reais (cs_live_…) são recusadas. Para cobrar a sério, é preciso uma função no servidor que confirme
   a sessão com a chave secreta do Stripe (e, com ela, recuperar a subscrição noutro dispositivo).
   Eventos: plus_visto, plus_aberto, plus_checkout_aberto, plus_ativado, plus_agora_nao.
   ========================================================================== */
const PLUS = {
  MENSAL: '2,99 €',
  ANUAL: '29,99 €',
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

function plusComStripe() {
  return Boolean(PLUS.PAGAMENTO.LINK_MENSAL && PLUS.PAGAMENTO.LINK_ANUAL);
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
    ? `Veto+ ativo. Podes juntar até ${PLUS.MAX_CONTAS} contas de email numa só análise.`
    : tempoTotal
      ? `Estes emails já te custaram ≈ ${formatarDuracao(tempoTotal)}. Com o Veto+ juntas as tuas contas numa só análise.`
      : 'Junta os teus emails pessoais e de trabalho numa só análise.';
  document.getElementById('plus-card-badge').textContent = ativo ? 'Ativo' : 'Novo';
  document.getElementById('plus-card-cta').textContent = ativo ? 'Gerir o Veto+' : 'Ver o Veto+';
  document.getElementById('plus-card-price').textContent = ativo ? '' : `${PLUS.MENSAL}/mês →`;
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
    nota: plusComStripe()
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
  registarEvento('plus_checkout_aberto', { plano, onde, modo: plusComStripe() ? 'stripe' : 'demonstracao' });
  if (!plusComStripe()) {
    ativarPlus(plano, 'demonstracao');
    renderTudo();
    mostrarRetornoPagamento('ok');
    return;
  }
  const url = new URL(plano === 'anual' ? PLUS.PAGAMENTO.LINK_ANUAL : PLUS.PAGAMENTO.LINK_MENSAL);
  url.searchParams.set('client_reference_id', gerarId().replace(/[^A-Za-z0-9_-]/g, '').slice(0, 40));
  url.searchParams.set('locale', 'pt');
  window.location.href = url.toString();
}
