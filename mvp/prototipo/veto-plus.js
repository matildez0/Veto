'use strict';

/* ==========================================================================
   Veto+ (subscrição)
   - A subscrição e o limite de contas são confirmados no Supabase através do webhook do Stripe.
   - O localStorage continua apenas como cache visual; nunca decide permissões de pagamento.
   Eventos: plus_visto, plus_aberto, plus_checkout_aberto, plus_ativado, plus_agora_nao.
   ========================================================================== */
const PLUS = {
  MENSAL: '1,99 €',
  ANUAL: '19,99 €',
  MAX_CONTAS: 5,
  PAGAMENTO: {
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
  return Boolean(supabaseClient);
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

async function carregarPlus() {
  try {
    const guardado = JSON.parse(localStorage.getItem(PLUS_KEY) || 'null');
    if (guardado && ['mensal', 'anual'].includes(guardado.plano)) plus = guardado;
  } catch (erro) {}
  if (!supabaseClient) return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;
  const { data, error } = await supabaseClient.from('subscriptions')
    .select('plan,status,current_period_end,cancel_at_period_end')
    .eq('user_id', session.user.id).maybeSingle();
  if (error) throw error;
  const ativo = data && ['active', 'trialing'].includes(data.status)
    && (!data.current_period_end || new Date(data.current_period_end).getTime() > Date.now());
  plus = ativo ? { plano: data.plan, origem: 'supabase', ativadoEm: data.current_period_end } : null;
  guardarPlus();
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

async function garantirSessao(plano) {
  if (!supabaseClient) {
    throw new Error('Configura o Supabase em supabase-config.js antes de aceitar pagamentos.');
  }
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) return session;
  const url = new URL(location.href);
  url.searchParams.set('checkout_plan', plano);
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: url.toString(), scopes: 'openid email profile' }
  });
  if (error) throw error;
  return null;
}

async function associarContaRemota(email) {
  if (!supabaseClient || !email) return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return;
  const { error } = await supabaseClient.functions.invoke('link-account', {
    body: { email }
  });
  if (error) throw error;
}

async function contasRemotas() {
  if (!supabaseClient) return [];
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (!session) return [];
  const { data, error } = await supabaseClient.from('linked_accounts').select('email').order('created_at');
  if (error) throw error;
  return (data || []).map((conta) => conta.email).filter(Boolean);
}

async function contaDisponivelRemota() {
  if (!supabaseClient || !temPlus()) return true;
  const emails = await contasRemotas();
  return emails.length < PLUS.MAX_CONTAS;
}

function desativarPlus() {
  plus = null;
  guardarPlus();
  renderTudo();
}

// Chamado no arranque: o Stripe volta à app com ?plus=ok&plano=…&sessao=…
function tratarRetornoPagamento() {
  const params = new URLSearchParams(location.search);
  const checkout = params.get('checkout');
  if (checkout) {
    ['checkout', 'checkout_plan'].forEach((nome) => params.delete(nome));
    const resto = params.toString();
    try { history.replaceState(null, '', location.pathname + (resto ? `?${resto}` : '') + location.hash); } catch (erro) {}
    return checkout === 'ok' ? 'a_confirmar' : 'cancelado';
  }
  if (params.get('plus') !== 'ok') return null;
  const plano = params.get('plano') === 'anual' ? 'anual' : 'mensal';
  const sessao = params.get('sessao') || '';
  ['plus', 'plano', 'sessao'].forEach((nome) => params.delete(nome));
  const resto = params.toString();
  try { history.replaceState(null, '', location.pathname + (resto ? `?${resto}` : '') + location.hash); } catch (erro) { /* ignorar */ }
  return 'invalido';
}

function mostrarRetornoPagamento(resultado) {
  if (resultado === 'ok' || resultado === 'a_confirmar') {
    abrirFolha({
      titulo: tt('Veto+ ativo'),
      texto: tt('Obrigado! Já podes juntar até {0} contas de email numa só análise.', [PLUS.MAX_CONTAS]),
      nota: resultado === 'a_confirmar'
        ? tt('O pagamento foi recebido. O Veto+ fica ativo assim que o Stripe confirmar a subscrição.')
        : tt('Subscrição confirmada pelo servidor.'),
      opcoes: [
        { label: tt('Adicionar outra conta'), estilo: 'primary', acao: () => adicionarConta() },
        { label: tt('Mais tarde'), estilo: 'ghost', acao: () => {} }
      ]
    });
  } else if (resultado === 'invalido') {
    abrirFolha({
      titulo: tt('Não conseguimos confirmar o pagamento'),
      texto: tt('O link de retorno do pagamento não é válido. Se já pagaste e o Veto+ não ficou ativo, escreve-nos com o recibo do Stripe.'),
      opcoes: [{ label: tt('Fechar'), estilo: 'primary', acao: () => {} }]
    });
  }
}

async function iniciarCheckoutPendente() {
  const params = new URLSearchParams(location.search);
  const plano = params.get('checkout_plan');
  if (!plano || !['mensal', 'anual'].includes(plano) || !supabaseClient) return;
  params.delete('checkout_plan');
  const resto = params.toString();
  try { history.replaceState(null, '', location.pathname + (resto ? `?${resto}` : '') + location.hash); } catch (erro) {}
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) comprarPlus(plano, 'login_google');
}

function funcoesDoPlus() {
  return PLUS.FUNCOES.map(([nome, descricao, pronta]) => [tt(nome), tt(pronta ? descricao : `${descricao} Em breve.`)]);
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
    titulo: tt('Veto+'),
    texto: tt('Para deixares de perder tempo com os emails das empresas e teres os teus pedidos tratados até ao fim.'),
    lista: funcoesDoPlus(),
    nota: supabaseClient
      ? tt('Serás encaminhada para um checkout seguro do Stripe. O plano fica associado à tua conta Google.')
      : tt('O pagamento ainda não está configurado.'),
    opcoes: [
      { label: tt('Subscrever mensal · {0}/mês', [PLUS.MENSAL]), estilo: 'primary', acao: () => comprarPlus('mensal', onde) },
      { label: tt('Subscrever anual · {0}/ano (2 meses grátis)', [PLUS.ANUAL]), estilo: 'secondary', acao: () => comprarPlus('anual', onde) },
      { label: tt('Agora não'), estilo: 'ghost', acao: () => registarEvento('plus_agora_nao', { onde }) }
    ]
  });
}

function abrirGestaoDoPlus() {
  const desde = new Date(plus.ativadoEm).toLocaleDateString('pt-PT');
  const doStripe = ['stripe', 'supabase'].includes(plus.origem);
  const opcoes = [{ label: tt('Adicionar outra conta'), estilo: 'primary', acao: () => adicionarConta() }];
  if (doStripe && PLUS.PAGAMENTO.PORTAL_URL) {
    opcoes.push({
      label: tt('Gerir ou cancelar a subscrição'), estilo: 'secondary',
      acao: () => { window.open(PLUS.PAGAMENTO.PORTAL_URL, '_blank', 'noopener'); }
    });
  }
  if (!doStripe) {
    opcoes.push({
      label: tt('Desativar o modo de demonstração'), estilo: 'secondary',
      acao: () => { desativarPlus(); mostrarToast(tt('Veto+ desativado neste dispositivo.')); }
    });
  }
  opcoes.push({ label: tt('Fechar'), estilo: 'ghost', acao: () => {} });
  abrirFolha({
    titulo: tt('Veto+ ativo'),
    texto: tt('Plano {0}, ativo desde {1}. Podes juntar até {2} contas de email.', [plus.plano, desde, PLUS.MAX_CONTAS]),
    lista: funcoesDoPlus(),
    nota: doStripe
      ? tt('A subscrição é gerida pelo Stripe. Desativar aqui não cancela a subscrição.')
      : tt('Ativado em modo de demonstração, sem pagamento.'),
    opcoes
  });
}

function comprarPlus(plano, onde) {
  registarEvento('plus_checkout_aberto', { plano, onde, modo: 'supabase_stripe' });
  garantirSessao(plano).then(async (session) => {
    if (!session) return;
    const { data, error } = await supabaseClient.functions.invoke('create-checkout', { body: { plano } });
    if (error) throw error;
    if (!data?.url) throw new Error('O servidor não devolveu o checkout.');
    window.location.href = data.url;
  }).catch((error) => mostrarToast(error.message || 'Não foi possível iniciar o pagamento.'));
}
