
'use strict';

/* ==========================================================================
   Veto+ (subscrição)
   - A subscrição e o limite de contas são confirmados no Supabase através do webhook do Stripe.
   - O localStorage continua apenas como cache visual; nunca decide permissões de pagamento.
   ========================================================================== */

const PLUS = {
  MENSAL: '2,99 €',
  ANUAL: '29,99 €',
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
let supabaseSession = null;

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
  try {
    localStorage.setItem(MONITOR_KEY, JSON.stringify(monitorizacao));
  } catch (erro) {
    // Só nesta sessão.
  }
}

// Depois de remover uma conta: a monitorização deixa de guardar empresas e notícias que só vinham dela.
// "empresasRestantes" são as empresas das contas que ficam.
function limparMonitorizacaoDeContaRemovida(empresasRestantes) {
  const empresas = (empresasRestantes || []).filter((empresa) => !empresa.dismissed);
  const ids = new Set(empresas.map((empresa) => empresa.id));
  const dominios = empresas.map((empresa) => empresa.domain);
  const idsNoticias = new Set(NOTICIAS
    .filter((noticia) => (noticia.dominios || []).some((dominio) => dominios.some((d) => d === dominio || d.endsWith(`.${dominio}`))))
    .map((noticia) => noticia.id));

  monitorizacao.empresasConhecidas = monitorizacao.empresasConhecidas.filter((id) => ids.has(id));
  monitorizacao.noticiasConhecidas = monitorizacao.noticiasConhecidas.filter((id) => idsNoticias.has(id));
  monitorizacao.novasEmpresas = monitorizacao.novasEmpresas.filter((empresa) => ids.has(empresa.id));
  monitorizacao.novasNoticias = monitorizacao.novasNoticias.filter((noticia) => idsNoticias.has(noticia.id));

  // Sem empresas, não há nada para monitorizar
  if (!ids.size) {
    monitorizacao.ativa = false;
    monitorizacao.verificadaEm = null;
  }

  guardarMonitorizacao();
  renderMonitorizacao();
}

function intervaloMonitorizacao() {
  return {
    diaria: 86400000,
    semanal: 604800000,
    mensal: 2592000000
  }[monitorizacao.frequencia] || 604800000;
}

function empresasMonitorizadas() {
  return estado.empresas
    .filter((empresa) => !empresa.dismissed)
    .map((empresa) => ({
      id: empresa.id,
      name: empresa.name,
      domain: empresa.domain
    }));
}

function noticiasDasMinhasEmpresas() {
  const dominios = new Set(
    empresasMonitorizadas().map((empresa) => empresa.domain)
  );

  return NOTICIAS.filter((noticia) =>
    (noticia.dominios || []).some((dominio) =>
      [...dominios].some((d) =>
        d === dominio || d.endsWith(`.${dominio}`)
      )
    )
  );
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

  if (
    !forcar &&
    monitorizacao.verificadaEm &&
    Date.now() - new Date(monitorizacao.verificadaEm).getTime()
      < intervaloMonitorizacao()
  ) {
    mostrarToast(`A próxima verificação está definida para ${monitorizacao.frequencia}.`);
    return;
  }

  const empresas = empresasMonitorizadas();
  const noticias = noticiasDasMinhasEmpresas();

  const empresasAnteriores = new Set(monitorizacao.empresasConhecidas);
  const noticiasAnteriores = new Set(monitorizacao.noticiasConhecidas);

  monitorizacao.novasEmpresas = empresas.filter(
    (empresa) => !empresasAnteriores.has(empresa.id)
  );

  monitorizacao.novasNoticias = noticias.filter(
    (noticia) => !noticiasAnteriores.has(noticia.id)
  );

  monitorizacao.empresasConhecidas = empresas.map((empresa) => empresa.id);
  monitorizacao.noticiasConhecidas = noticias.map((noticia) => noticia.id);
  monitorizacao.verificadaEm = new Date().toISOString();

  guardarMonitorizacao();

  const total =
    monitorizacao.novasEmpresas.length +
    monitorizacao.novasNoticias.length;

  if (
    total &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    new Notification('Atualização do Veto+', {
      body: `${total} novidade${total === 1 ? '' : 's'} desde a última verificação.`
    });
  }

  renderMonitorizacao();

  mostrarToast(
    total
      ? `${total} novidade${total === 1 ? '' : 's'} encontrada${total === 1 ? '' : 's'}.`
      : 'Nenhuma novidade desde a última verificação.'
  );
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

  const frequencia =
    document.querySelector('input[name="monitor-frequencia"]:checked')?.value
    || 'semanal';

  if (
    'Notification' in window &&
    Notification.permission !== 'granted'
  ) {
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

  document.querySelectorAll('input[name="monitor-frequencia"]').forEach((input) => {
    input.checked = input.value === monitorizacao.frequencia;
  });

  const ultima = monitorizacao.verificadaEm
    ? `Última verificação: ${formatarData(monitorizacao.verificadaEm)}`
    : 'Ainda não foi verificado.';

  estadoEl.textContent = monitorizacao.ativa
    ? `Ativa · ${monitorizacao.frequencia}. ${ultima}`
    : 'Desligada.';

  const toggle = document.getElementById('monitorizacao-toggle');

  toggle.textContent = monitorizacao.ativa
    ? 'Desligar monitorização'
    : 'Ativar monitorização';

  toggle.dataset.action = monitorizacao.ativa
    ? 'desativar-monitorizacao'
    : 'ativar-monitorizacao';

  toggle.setAttribute('aria-pressed', String(monitorizacao.ativa));

  const itens = [
    ...monitorizacao.novasEmpresas.map((empresa) =>
      `<li class="rounded-xl border border-lime/30 bg-lime/10 px-3 py-2 text-xs"><strong>${esc(empresa.name)}</strong> é uma empresa nova desde a última verificação.</li>`
    ),
    ...monitorizacao.novasNoticias.map((noticia) =>
      `<li class="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs"><strong>${esc(noticia.empresa)}</strong>: ${esc(noticia.titulo)}</li>`
    )
  ];

  novasEl.innerHTML = itens.length
    ? `<ul class="flex flex-col gap-2">${itens.join('')}</ul>`
    : '<p class="text-xs text-mist">Não há empresas ou notícias novas.</p>';
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

    if (guardado && ['mensal', 'anual'].includes(guardado.plano)) {
      plus = guardado;
    }
  } catch (erro) {}

  if (!supabaseClient) return;

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  supabaseSession = session;

  if (!session) {
    plus = null;
    guardarPlus();
    renderSessaoSupabase();
    return;
  }

  const { data, error } = await supabaseClient
    .from('subscriptions')
    .select('plan,status,current_period_end,cancel_at_period_end')
    .eq('user_id', session.user.id)
    .maybeSingle();

  if (error) throw error;

  const ativo =
    data &&
    ['active', 'trialing'].includes(data.status) &&
    (
      !data.current_period_end ||
      new Date(data.current_period_end).getTime() > Date.now()
    );

  plus = ativo
    ? {
        plano: data.plan,
        origem: 'supabase',
        ativadoEm: data.current_period_end,
        currentPeriodEnd: data.current_period_end,
        cancelAtPeriodEnd: Boolean(data.cancel_at_period_end)
      }
    : null;

  guardarPlus();
  renderSessaoSupabase();
}

function renderSessaoSupabase() {
  const button = document.getElementById('supabase-auth-button');
  const profile = document.getElementById('supabase-profile');
  const cta = document.getElementById('analyze-button');
  const topPlus = document.getElementById('plus-top-button');

  if (!button) return;

  if (!supabaseClient) {
    button.textContent = tt('Entrar');
    button.dataset.action = 'entrar-supabase';
    button.title = tt('Login Veto+ indisponível: configura o Supabase.');

    profile?.classList.add('hidden');
    profile?.classList.remove('flex');

    topPlus?.classList.remove('hidden');
    topPlus?.replaceChildren(document.createTextNode('Veto+'));

    return;
  }

  if (supabaseSession?.user) {
    const email = supabaseSession.user.email || tt('Conta Veto');

    button.classList.add('hidden');

    profile?.classList.remove('hidden');
    profile?.classList.add('flex');

    document.getElementById('supabase-avatar').textContent =
      email[0].toUpperCase();

    //document.getElementById('supabase-plan').textContent = 
      //plus ? tt('Veto+') : tt('Plano Grátis'); 

    profile?.setAttribute('title', email);

    topPlus?.replaceChildren(
      document.createTextNode(plus ? `Veto+ · ${plus.plano}` : 'Veto+')
    );

    topPlus?.setAttribute(
      'aria-label',
      plus ? `Veto+ ${plus.plano}` : 'Veto+'
    );

    atualizarTextoCTA();
  } else {
    button.classList.remove('hidden');
    button.textContent = tt('Entrar');
    button.dataset.action = 'entrar-supabase';
    button.title = tt('Entrar com Google para guardar o Veto+');
    button.setAttribute('aria-label', tt('Entrar com Google'));

    profile?.classList.add('hidden');
    profile?.classList.remove('flex');

    cta?.setAttribute('data-action', 'analisar-ou-entrar');

    cta?.replaceChildren(
      document.createTextNode(tt('Criar Conta / Iniciar Sessão')),
      document.createTextNode(' →')
    );
  }

  function atualizarTextoCTA() {
    const cta = document.getElementById('analyze-button');

    if (!cta) return;

    const texto = !autenticado()
      ? 'Criar Conta / Iniciar Sessão'
      : contasAtivas().length
        ? 'Analisar email'
        : 'Associar email';

    cta.dataset.action = !autenticado()
      ? 'analisar-ou-entrar'
      : contasAtivas().length
        ? 'analisar-email'
        : 'associar-email';

    cta.replaceChildren(
      document.createTextNode(tt(texto)),
      document.createTextNode(' →')
    );
  }

  document.querySelectorAll('[data-nav]:not([data-nav="inicio"])').forEach((link) => {
    link.classList.toggle('opacity-50', !supabaseSession);
    link.classList.toggle('cursor-not-allowed', !supabaseSession);
    link.setAttribute('aria-disabled', String(!supabaseSession));
  });
}

function autenticado() {
  return Boolean(supabaseSession?.user);
}



function fecharAuthModal() {
  const modal = document.getElementById('auth-modal');

  if (!modal) return;

  modal.classList.add('hidden');
  modal.classList.remove('flex');
}


async function entrarSupabase() {
  if (!supabaseClient) {
    mostrarToast(tt('O login ainda não está configurado.'));
    return;
  }

  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href,
      scopes: 'openid email profile',
      queryParams: { prompt: 'select_account' }
    }
  });

  if (error) throw error;
}

let modoAuth = 'registo';

function definirModoAuth(modo) {
  modoAuth = modo === 'login' ? 'login' : 'registo';
  const isLogin = modoAuth === 'login';

  document.querySelectorAll('[data-auth-tab]').forEach((btn) => {
    const ativo = btn.dataset.authTab === modoAuth;
    btn.classList.toggle('bg-lime', ativo);
    btn.classList.toggle('text-ink', ativo);
    btn.classList.toggle('text-slate-400', !ativo);
  });

  document.getElementById('auth-plans-box')?.classList.toggle('hidden', isLogin);
  const subtitulo = document.getElementById('auth-modal-subtitle');
  if (subtitulo) {
    subtitulo.textContent = isLogin
      ? tt('Entra na tua conta para acederes ao teu plano.')
      : tt('Escolhe o teu plano antes de continuar.');
  }

  const pass = document.getElementById('auth-password');
  if (pass) pass.setAttribute('autocomplete', isLogin ? 'current-password' : 'new-password');

  document.getElementById('auth-error')?.classList.add('hidden');
  atualizarTextoPlanoAuth();
}

function abrirAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (!modal) return;

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  document.querySelectorAll('[data-auth-tab]').forEach((btn) => {
    btn.onclick = () => definirModoAuth(btn.dataset.authTab);
  });

  document.querySelectorAll('input[name="auth-plan"]').forEach((input) => {
    input.onchange = atualizarTextoPlanoAuth;
  });

  definirModoAuth('registo');
  document.getElementById('auth-email')?.focus();
}

function atualizarTextoPlanoAuth() {
  const submit = document.getElementById('auth-submit');
  if (!submit) return;

  if (modoAuth === 'login') {
    submit.textContent = tt('Iniciar sessão');
    return;
  }

  const plano =
    document.querySelector('input[name="auth-plan"]:checked')?.value || 'gratis';

  submit.textContent =
    plano === 'plus_anual'
      ? tt('Subscrever Veto+ anual')
      : plano === 'plus_mensal'
        ? tt('Subscrever Veto+ mensal')
        : tt('Continuar com plano grátis');
}

async function submeterAuth(evento) {
  evento.preventDefault();

  if (!supabaseClient) {
    throw new Error('O login ainda não está configurado.');
  }

  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;
  const plano =
    document.querySelector('input[name="auth-plan"]:checked')?.value || 'gratis';

  const submit = document.getElementById('auth-submit');
  const erro = document.getElementById('auth-error');

  submit.disabled = true;
  erro.classList.add('hidden');

  try {
    let data, error;

    if (modoAuth === 'login') {
      ({ data, error } = await supabaseClient.auth.signInWithPassword({ email, password }));
    } else {
      ({ data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: { data: { plano } }
      }));

      if (error?.message?.toLowerCase().includes('already registered')) {
        ({ data, error } = await supabaseClient.auth.signInWithPassword({ email, password }));
      }
    }

    if (error) throw error;

    if (!data.session) {
      erro.textContent = tt(
        'Confirma o teu email para concluir o registo e depois inicia sessão.'
      );
      erro.classList.remove('hidden');
      return;
    }

    fecharAuthModal();

    if (modoAuth === 'registo' && plano !== 'gratis') {
      comprarPlus(plano === 'plus_anual' ? 'anual' : 'mensal', 'registo');
    }
  } catch (error) {
    erro.textContent = error.message || tt('Não foi possível autenticar.');
    erro.classList.remove('hidden');
  } finally {
    submit.disabled = false;
  }
}

async function loginGoogleAuth() {
  if (!supabaseClient) {
    throw new Error('O login ainda não está configurado.');
  }

  const url = new URL(window.location.href);
  if (modoAuth === 'registo') {
    const plano =
      document.querySelector('input[name="auth-plan"]:checked')?.value || 'gratis';
    url.searchParams.set('auth_plan', plano);
  }

  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: url.toString(),
      scopes: 'openid email profile',
      queryParams: { prompt: 'select_account' }
    }
  });

  if (error) throw error;
}

async function sairSupabase() {
  if (!supabaseClient) return;

  const { error } = await supabaseClient.auth.signOut();

  if (error) throw error;

  supabaseSession = null;
  plus = null;

  guardarPlus();
  renderSessaoSupabase();
  renderTudo();
}

function iniciarSessaoSupabase() {
  if (!supabaseClient) {
    renderSessaoSupabase();
    return;
  }

  supabaseClient.auth.onAuthStateChange((event, session) => {
    supabaseSession = session;

    if (event === 'SIGNED_OUT') {
      plus = null;
      guardarPlus();
    } else if (session) {
      carregarPlus().catch((error) => {
        console.error(
          'Não foi possível atualizar a subscrição:',
          error
        );
      });

      const params = new URLSearchParams(location.search);
      const plano = params.get('auth_plan');

      if (plano) {
        params.delete('auth_plan');

        history.replaceState(
          null,
          '',
          location.pathname +
            (params.toString() ? `?${params}` : '') +
            location.hash
        );

        if (plano !== 'gratis' && !plus) {
          comprarPlus(
            plano === 'plus_anual' ? 'anual' : 'mensal',
            'registo'
          );
        }
      }
    }

    renderSessaoSupabase();
  });
}

function guardarPlus() {
  try {
    if (plus) {
      localStorage.setItem(PLUS_KEY, JSON.stringify(plus));
    } else {
      localStorage.removeItem(PLUS_KEY);
    }
  } catch (erro) {
    // Ignorar.
  }
}

function ativarPlus(plano, origem, sessao = '') {
  plus = {
    plano,
    origem,
    sessao,
    ativadoEm: new Date().toISOString()
  };

  guardarPlus();
  registarEvento('plus_ativado', { plano, origem });
}

async function garantirSessao(plano) {
  if (!supabaseClient) {
    throw new Error(
      'Configura o Supabase em supabase-config.js antes de aceitar pagamentos.'
    );
  }

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) return session;

  const url = new URL(location.href);
  url.searchParams.set('checkout_plan', plano);

  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: url.toString(),
      scopes: 'openid email profile',
      queryParams: { prompt: 'select_account' }
    }
  });

  if (error) throw error;

  return null;
}

async function associarContaRemota(email) {
  if (!supabaseClient || !email) return;

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) return;

  const { error } = await supabaseClient.functions.invoke(
    'link-account',
    { body: { email } }
  );

  if (error) throw error;
}

async function contasRemotas() {
  if (!supabaseClient) return [];

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) return [];

  const { data, error } = await supabaseClient
    .from('linked_accounts')
    .select('email')
    .order('created_at');

  if (error) throw error;

  return (data || [])
    .map((conta) => conta.email)
    .filter(Boolean);
}

// Desassocia o endereço no servidor. Precisa de uma política RLS de DELETE em linked_accounts
// (ver notas): sem ela o Supabase apaga 0 linhas sem dar erro, e por isso confirmamos no fim.
async function desassociarContaRemota(email) {
  if (!supabaseClient || !email) return;

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) return;

  const variantes = [...new Set([email, email.toLowerCase()])];

  const { error } = await supabaseClient
    .from('linked_accounts')
    .delete()
    .in('email', variantes);

  if (error) throw error;

  const restantes = await contasRemotas();

  if (restantes.some((conta) => conta.toLowerCase() === email.toLowerCase())) {
    throw new Error('A conta continua associada no servidor.');
  }
}

async function abrirPerfilSupabase() {
  const email = supabaseSession?.user?.email || 'Conta Veto';

  let contas = [];

  try {
    contas = await contasRemotas();
  } catch (error) {
    mostrarToast(error.message || 'Não foi possível carregar as contas.');
    return;
  }

  const associadas = contas.filter(
    (conta) => conta.toLowerCase() !== email.toLowerCase()
  );

  abrirFolha({
    titulo: tt('A tua conta'),
    texto: email,
    lista: [
      [tt('Conta principal'), email],
      [
        tt('Contas associadas'),
        associadas.length
          ? associadas.join(', ')
          : tt('Ainda não tens contas associadas.')
      ]
    ],
    nota: plus
      ? tt(
          'Plano Veto+ {0}. Podes associar até {1} contas.',
          [plus.plano, PLUS.MAX_CONTAS]
        )
      : tt('Plano Grátis. Podes associar uma conta Gmail.'),
    opcoes: [
      {
        label: tt('Fechar'),
        estilo: 'ghost',
        acao: () => {}
      }
    ]
  });
}

async function contaDisponivelRemota() {
  if (!supabaseClient || !temPlus()) return true;

  const emails = await contasRemotas();

  return emails.length < (PLUS.MAX_CONTAS);
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

    try {
      history.replaceState(
        null,
        '',
        location.pathname +
          (resto ? `?${resto}` : '') +
          location.hash
      );
    } catch (erro) {}

    return checkout === 'ok' ? 'a_confirmar' : 'cancelado';
  }

  if (params.get('plus') !== 'ok') return null;

  const plano = params.get('plano') === 'anual' ? 'anual' : 'mensal';
  const sessao = params.get('sessao') || '';

  ['plus', 'plano', 'sessao'].forEach((nome) => params.delete(nome));

  const resto = params.toString();

  try {
    history.replaceState(
      null,
      '',
      location.pathname +
        (resto ? `?${resto}` : '') +
        location.hash
    );
  } catch (erro) {
    // Ignorar.
  }

  return 'invalido';
}

function mostrarRetornoPagamento(resultado) {
  if (resultado === 'ok' || resultado === 'a_confirmar') {
    abrirFolha({
      titulo: tt('Veto+ ativo'),
      texto: tt(
        'Obrigado! Já podes juntar até {0} contas de email numa só análise.',
        [PLUS.MAX_CONTAS]
      ),
      nota: resultado === 'a_confirmar'
        ? tt(
            'O pagamento foi recebido. O Veto+ fica ativo assim que o Stripe confirmar a subscrição.'
          )
        : tt('Subscrição confirmada pelo servidor.'),
      opcoes: [
        {
          label: tt('Adicionar outra conta'),
          estilo: 'primary',
          acao: () => adicionarConta()
        },
        {
          label: tt('Mais tarde'),
          estilo: 'ghost',
          acao: () => {}
        }
      ]
    });
  } else if (resultado === 'invalido') {
    abrirFolha({
      titulo: tt('Não conseguimos confirmar o pagamento'),
      texto: tt(
        'O link de retorno do pagamento não é válido. Se já pagaste e o Veto+ não ficou ativo, escreve-nos com o recibo do Stripe.'
      ),
      opcoes: [
        {
          label: tt('Fechar'),
          estilo: 'primary',
          acao: () => {}
        }
      ]
    });
  }
}

async function iniciarCheckoutPendente() {
  const params = new URLSearchParams(location.search);
  const plano = params.get('checkout_plan');

  if (
    !plano ||
    !['mensal', 'anual'].includes(plano) ||
    !supabaseClient
  ) return;

  params.delete('checkout_plan');

  const resto = params.toString();

  try {
    history.replaceState(
      null,
      '',
      location.pathname +
        (resto ? `?${resto}` : '') +
        location.hash
    );
  } catch (erro) {}

  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (session) comprarPlus(plano, 'login_google');
}

function funcoesDoPlus() {
  return PLUS.FUNCOES.map(([nome, descricao, pronta]) => [
    tt(nome),
    tt(pronta ? descricao : `${descricao} Em breve.`)
  ]);
}

function renderPlus(tempoTotal) {
  const ativo = temPlus();

  document.getElementById('plus-card-text').textContent = ativo
    ? tt(
        'Veto+ ativo. Podes juntar até {0} contas de email numa só análise.',
        [PLUS.MAX_CONTAS]
      )
    : tempoTotal
      ? tt(
          'Estes emails já te custaram ≈ {0}. Com o Veto+ juntas as tuas contas numa só análise.',
          [formatarDuracao(tempoTotal)]
        )
      : tt('Junta os teus emails pessoais e de trabalho numa só análise.');

  document.getElementById('plus-card-badge').textContent =
    ativo ? tt('Ativo') : tt('Novo');

  document.getElementById('plus-card-cta').textContent =
    ativo ? tt('Gerir o Veto+') : tt('Ver o Veto+');

  document.getElementById('plus-card-price').textContent =
    ativo ? '' : tt('{0}/mês →', [PLUS.MENSAL]);
}

function registarPlusVisto() {
  if (estado.plusVisto || !estado.teste?.consentimento) return;

  estado.plusVisto = true;

  registarEvento('plus_visto', {
    onde: 'inicio',
    analisou: estado.empresas.length > 0
  });
}

function abrirPlus(onde = 'outro') {
  registarEvento('plus_aberto', {
    onde,
    ativo: temPlus()
  });

  if (temPlus()) {
    abrirGestaoDoPlus();
    return;
  }

  abrirFolha({
    titulo: tt('Veto+'),
    texto: tt(
      'Para deixares de perder tempo com os emails das empresas e teres os teus pedidos tratados até ao fim.'
    ),
    lista: funcoesDoPlus(),
    nota: supabaseClient
      ? tt(
          'Serás encaminhada para um checkout seguro do Stripe. O plano fica associado à tua conta Google.'
        )
      : tt('O pagamento ainda não está configurado.'),
    opcoes: [
      {
        label: tt('Subscrever mensal · {0}/mês', [PLUS.MENSAL]),
        estilo: 'primary',
        acao: () => comprarPlus('mensal', onde)
      },
      {
        label: tt('Subscrever anual · {0}/ano (2 meses grátis)', [PLUS.ANUAL]),
        estilo: 'secondary',
        acao: () => comprarPlus('anual', onde)
      },
      {
        label: tt('Agora não'),
        estilo: 'ghost',
        acao: () => registarEvento('plus_agora_nao', { onde })
      }
    ]
  });
}

/* ==========================================================================
   GESTÃO DA SUBSCRIÇÃO
   ========================================================================== */

function abrirGestaoDoPlus() {
  const desde = plus.ativadoEm
    ? new Date(plus.ativadoEm).toLocaleDateString('pt-PT')
    : '—';

  const doStripe = ['stripe', 'supabase'].includes(plus.origem);
  const cancelamentoAgendado = Boolean(plus.cancelAtPeriodEnd);

  const fimPeriodo = plus.currentPeriodEnd
    ? new Date(plus.currentPeriodEnd).toLocaleDateString('pt-PT')
    : null;

  const opcoes = [
    {
      label: tt('Adicionar outra conta'),
      estilo: 'primary',
      acao: () => adicionarConta()
    }
  ];

  if (doStripe && PLUS.PAGAMENTO.PORTAL_URL) {
    opcoes.push({
      label: tt('Gerir a subscrição'),
      estilo: 'secondary',
      acao: () => {
        window.open(
          PLUS.PAGAMENTO.PORTAL_URL,
          '_blank',
          'noopener'
        );
      }
    });
  }

  if (doStripe && !cancelamentoAgendado) {
    opcoes.push({
      label: tt('Cancelar subscrição'),
      estilo: 'secondary',
      acao: () => cancelarPlanoVetoPlus()
    });
  }

  if (!doStripe) {
    opcoes.push({
      label: tt('Desativar o modo de demonstração'),
      estilo: 'secondary',
      acao: () => {
        desativarPlus();
        mostrarToast(tt('Veto+ desativado neste dispositivo.'));
      }
    });
  }

  opcoes.push({
    label: tt('Fechar'),
    estilo: 'ghost',
    acao: () => {}
  });

  const nota = cancelamentoAgendado
    ? tt(
        'O cancelamento está agendado. Manténs o acesso ao Veto+ até {0}; não haverá nova cobrança.',
        [fimPeriodo || tt('ao fim do período pago')]
      )
    : doStripe
      ? tt(
          'A subscrição é gerida pelo Stripe. Podes cancelar quando quiseres e manterás o acesso até ao fim do período já pago.'
        )
      : tt('Ativado em modo de demonstração, sem pagamento.');

  abrirFolha({
    titulo: cancelamentoAgendado
      ? tt('Veto+ ativo · cancelamento agendado')
      : tt('Veto+ ativo'),
    texto: tt(
      'Plano {0}, ativo desde {1}. Podes juntar até {2} contas de email.',
      [plus.plano, desde, PLUS.MAX_CONTAS]
    ),
    lista: funcoesDoPlus(),
    nota,
    opcoes
  });
}

/* ==========================================================================
   CANCELAMENTO NO FINAL DO PERÍODO PAGO
   ========================================================================== */

function cancelarPlanoVetoPlus() {
  if (!supabaseClient || !plus || plus.cancelAtPeriodEnd) return;

  // Usa o sistema nativo da app em vez do window.confirm
  abrirFolha({
    titulo: tt('Agendar cancelamento?'),
    texto: tt('Continuarás a ter acesso ao Veto+ até ao fim do período já pago e não haverá nova cobrança.'),
    opcoes: [
      {
        label: tt('Sim, cancelar plano'),
        estilo: 'primary',
        acao: async () => {
          // O modal fecha sozinho ao clicar, mostramos um aviso de carregamento
          mostrarToast(tt('A processar o cancelamento no Stripe...'));
          
          try {
            const { data, error } = await supabaseClient.functions.invoke(
              'cancel-subscription',
              { body: {} }
            );

            if (error) {
              let detalhe = error.message;
              if (error.context instanceof Response) {
                try {
                  const body = await error.context.json();
                  detalhe = body.error || detalhe;
                } catch (parseError) {}
              }
              throw new Error(detalhe);
            }

            if (!data?.ok || !data?.cancel_at_period_end) {
              throw new Error(tt('O Stripe não confirmou o agendamento do cancelamento.'));
            }

            // Atualiza o estado local
            plus = {
              ...plus,
              cancelAtPeriodEnd: true,
              currentPeriodEnd: data.current_period_end
                ? new Date(data.current_period_end * 1000).toISOString()
                : plus.currentPeriodEnd
            };

            guardarPlus();
            renderSessaoSupabase();
            renderTudo();

            // Reabre o menu de gestão com o novo estado (já cancelado)
            abrirGestaoDoPlus();
            mostrarToast(tt('Cancelamento agendado. Manténs o acesso até ao fim do período pago.'));
            
          } catch (error) {
            mostrarToast(error.message || tt('Não foi possível agendar o cancelamento.'));
          }
        }
      },
      {
        label: tt('Voltar atrás'),
        estilo: 'ghost',
        acao: () => abrirGestaoDoPlus() // Se cancelar, volta ao menu do Veto+
      }
    ]
  });
}

function comprarPlus(plano, onde) {
  registarEvento('plus_checkout_aberto', {
    plano,
    onde,
    modo: 'supabase_stripe'
  });

  garantirSessao(plano)
    .then(async (session) => {
      if (!session) return;

      const { data, error } = await supabaseClient.functions.invoke(
        'create-checkout',
        { body: { plano } }
      );

      if (error) throw error;

      if (!data?.url) {
        throw new Error('O servidor não devolveu o checkout.');
      }

      window.location.href = data.url;
    })
    .catch((error) => {
      mostrarToast(
        error.message ||
        'Não foi possível iniciar o pagamento.'
      );
    });
}
