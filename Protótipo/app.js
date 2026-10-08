const empresasDemo = [
  { id: 'uber', name: 'Uber', domain: 'uber.com', dpo_email: 'dpo@uber.com', category: 'Transporte', risk: 'alto', icon: 'U' },
  { id: 'shein', name: 'Shein', domain: 'shein.com', dpo_email: 'data@shein.com', category: 'Comércio', risk: 'médio', icon: 'S' },
  { id: 'spotify', name: 'Spotify', domain: 'spotify.com', dpo_email: 'privacy@spotify.com', category: 'Streaming', risk: 'baixo', icon: '♫' },
  { id: 'glovo', name: 'Glovo', domain: 'glovoapp.com', dpo_email: 'dpo@glovoapp.com', category: 'Entregas', risk: 'médio', icon: 'G' },
  { id: 'vinted', name: 'Vinted', domain: 'vinted.pt', dpo_email: 'privacysupport@vinted.pt', contact_type: 'canal RGPD', category: 'Marketplace', risk: 'médio', icon: 'V' }
];

const knownCompanies = new Map(empresasDemo.map((company) => [company.domain, company]));
const GMAIL_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly';
const ignoredDomains = new Set([
  'gmail.com', 'googlemail.com', 'google.com', 'accounts.google.com',
  'mail.google.com', 'googleusercontent.com', 'googleapis.com',
  'facebookmail.com', 'facebook.com', 'instagram.com'
]);
let empresas = [];
let pedidos = new Set();
let tokenClient;

const container = document.getElementById('companies-container');
const status = document.getElementById('analysis-status');

document.getElementById('analyze-button').addEventListener('click', ligarGmail);
document.getElementById('demo-button').addEventListener('click', () => mostrarEmpresas(empresasDemo, 'Demonstração local — nenhum email foi lido.'));
document.getElementById('search-input').addEventListener('input', renderEmpresas);
document.getElementById('privacy-button').addEventListener('click', () => mostrarToast('Só os cabeçalhos são usados e o token desaparece ao fechar a página.'));

function ligarGmail() {
  const clientId = document.getElementById('google-client-id').value.trim();
  if (!clientId) {
    atualizarStatus('Introduz o Google OAuth Client ID para ligar a tua conta.', true);
    return;
  }
  if (!window.google?.accounts?.oauth2) {
    atualizarStatus('A biblioteca de autenticação do Google ainda está a carregar. Tenta novamente.', true);
    return;
  }
  const button = document.getElementById('analyze-button');
  button.disabled = true;
  button.innerHTML = 'A preparar ligação <span class="animate-pulse">•••</span>';
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: GMAIL_SCOPE,
    callback: (response) => {
      if (response.error) {
        button.disabled = false;
        button.innerHTML = 'Ligar Gmail e analisar <span>→</span>';
        atualizarStatus(`A ligação foi recusada: ${response.error}`, true);
        return;
      }
      analisarCabecalhos(response.access_token).catch((error) => {
        button.disabled = false;
        button.innerHTML = 'Tentar novamente <span>→</span>';
        atualizarStatus(`Não foi possível ler o Gmail: ${error.message}`, true);
      });
    }
  });
  tokenClient.requestAccessToken({ prompt: 'consent' });
}

async function analisarCabecalhos(accessToken) {
  atualizarStatus('A ler apenas cabeçalhos do Gmail — nada é guardado ou enviado.');
  const query = encodeURIComponent('-in:spam -in:trash newer_than:2y');
  const listResponse = await gmailFetch(`/messages?maxResults=100&q=${query}`, accessToken);
  const messages = listResponse.messages || [];
  const headers = [];
  for (const message of messages) {
    const detail = await gmailFetch(`/messages/${message.id}?format=metadata&metadataHeaders=From&metadataHeaders=List-Unsubscribe`, accessToken);
    headers.push(...(detail.payload?.headers || []));
  }
  const domains = new Set();
  headers.forEach((header) => extrairDominios(header.value).forEach((domain) => domains.add(domain)));
  const encontrados = [...domains].map(criarEmpresaLocal).filter(Boolean);
  mostrarEmpresas(encontrados, `${messages.length} cabeçalhos analisados localmente. Conteúdo nunca foi lido.`);
}

async function gmailFetch(path, accessToken) {
  const response = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!response.ok) throw new Error(`Gmail respondeu com ${response.status}`);
  return response.json();
}

function extrairDominios(value) {
  const domains = [];
  const emails = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [];
  emails.forEach((email) => {
    const domain = email.split('@')[1].toLowerCase().replace(/^www\./, '');
    if (domain && !isProviderDomain(domain)) domains.push(domain);
  });
  return domains;
}

function isProviderDomain(domain) {
  return ignoredDomains.has(domain);
}

function criarEmpresaLocal(domain) {
  if (knownCompanies.has(domain)) return { ...knownCompanies.get(domain) };
  const label = domain.split('.')[0].replace(/[-_]/g, ' ');
  const name = label.replace(/\b\w/g, (letter) => letter.toUpperCase());
  return { id: domain, name, domain, category: 'Serviço detetado', risk: 'por avaliar', icon: name[0] || '?', dpo_email: '' };
}

function mostrarEmpresas(novasEmpresas, mensagem) {
  empresas = novasEmpresas;
  document.getElementById('intro-panel').classList.add('hidden');
  document.getElementById('services-section').classList.remove('hidden');
  document.getElementById('service-count').textContent = empresas.length;
  document.getElementById('risk-count').textContent = empresas.filter((item) => item.risk !== 'baixo').length;
  document.getElementById('service-total').textContent = `${empresas.length} encontrados`;
  atualizarStatus(mensagem);
  renderEmpresas();
}

function renderEmpresas() {
  const query = document.getElementById('search-input').value.toLowerCase();
  const filtradas = empresas.filter((item) => `${item.name} ${item.category} ${item.domain}`.toLowerCase().includes(query));
  container.innerHTML = filtradas.length ? filtradas.map(criarCard).join('') : '<p class="py-8 text-center text-sm text-mist">Nenhum serviço encontrado.</p>';
}

function criarCard(empresa) {
  const pedidoEnviado = pedidos.has(empresa.id);
  const indisponivel = !empresa.dpo_email;
  const corRisco = empresa.risk === 'alto' ? 'text-rose-300 bg-rose-400/10' : empresa.risk === 'médio' ? 'text-amber-200 bg-amber-400/10' : 'text-lime bg-lime/10';
  const action = indisponivel ? `mostrarToast('Ainda não temos um contacto RGPD validado para este serviço.')` : `enviarPedido('${empresa.id}')`;
  return `<article class="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
    <div class="flex items-center gap-3"><div class="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-bold text-ink">${empresa.icon}</div>
    <div class="min-w-0 flex-1"><div class="flex items-center gap-2"><h3 class="font-semibold">${empresa.name}</h3><span class="rounded-full px-2 py-0.5 text-[10px] font-bold ${corRisco}">${empresa.risk}</span></div><p class="mt-0.5 text-xs text-mist">${empresa.category} · ${empresa.domain}</p><p class="mt-1 text-[10px] text-slate-500">Evidência encontrada nos cabeçalhos</p></div></div>
    <button class="mt-4 w-full rounded-lg ${pedidoEnviado ? 'bg-slate-800 text-lime' : indisponivel ? 'bg-slate-800 text-slate-400' : 'bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'} py-2.5 text-xs font-bold transition" onclick="${action}">${pedidoEnviado ? '✓ Pedido preparado' : indisponivel ? 'Contacto RGPD desconhecido' : 'Preparar pedido RGPD · Art. 17.º'}</button>
  </article>`;
}

function enviarPedido(id) {
  const empresa = empresas.find((item) => item.id === id);
  if (!empresa?.dpo_email) return;
  const assunto = encodeURIComponent('Exercício do Direito ao Apagamento (Art. 17.º RGPD)');
  const corpo = encodeURIComponent(`Exmo.(a) Encarregado(a) de Proteção de Dados da ${empresa.name},\n\nAo abrigo do Artigo 17.º do RGPD, solicito o apagamento definitivo de todos os meus dados pessoais associados a este endereço de email.\n\nAguardo confirmação formal no prazo legal aplicável.\n\nCom os melhores cumprimentos.`);
  pedidos.add(id);
  renderEmpresas();
  mostrarToast('Pedido preparado. A abrir o teu email…');
  window.location.href = `mailto:${empresa.dpo_email}?subject=${assunto}&body=${corpo}`;
}

function atualizarStatus(mensagem, isError = false) {
  status.classList.remove('hidden', 'text-rose-300');
  if (isError) status.classList.add('text-rose-300');
  status.textContent = mensagem;
}

function mostrarPedidos() {
  mostrarToast(pedidos.size ? `${pedidos.size} pedido(s) preparado(s) nesta sessão.` : 'Ainda não preparaste nenhum pedido.');
}

function mostrarToast(mensagem) {
  const toast = document.getElementById('toast');
  toast.textContent = mensagem;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2800);
}
