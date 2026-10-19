/**
 * Veto: recolha dos eventos do programa de teste numa folha de cálculo.
 *
 * Como instalar:
 * 1. Cria uma folha de cálculo no Google Sheets (por exemplo, "Veto: teste").
 * 2. Extensões > Apps Script. Apaga o que lá estiver e cola este ficheiro.
 * 3. Implementar > Nova implementação > tipo "Aplicação Web".
 *    Executar como: Eu. Quem tem acesso: Qualquer pessoa.
 * 4. Copia o URL da aplicação Web (termina em /exec) e cola-o em TESTE.URL, no início do app.js.
 *
 * Cada evento fica numa linha da folha "Eventos". A app só envia contagens:
 * nunca endereços de email, nomes de empresas, assuntos ou conteúdo de emails.
 * A exceção são os pedidos de acesso ao teste: o email que a pessoa escreve fica na folha
 * "Testers", para a equipa o acrescentar em Google Cloud > Público-alvo > Utilizadores de teste.
 * Depois de alterar este ficheiro: Implementar > Gerir implementações > editar > Nova versão.
 */
function doPost(e) {
  const livro = SpreadsheetApp.getActiveSpreadsheet();
  const folha = livro.getSheetByName('Eventos') || livro.insertSheet('Eventos');
  if (folha.getLastRow() === 0) {
    folha.appendRow(['Recebido', 'Código', 'Dispositivo', 'Evento', 'Detalhes', 'Hora no dispositivo', 'Versão']);
  }
  const dados = JSON.parse(e.postData.contents || '{}');
  // Pedidos de acesso ao teste: o único sítio onde chega um email, numa folha à parte
  if (dados.pedidoAcesso) {
    const testers = livro.getSheetByName('Testers') || livro.insertSheet('Testers');
    if (testers.getLastRow() === 0) testers.appendRow(['Recebido', 'Email', 'Hora no dispositivo', 'Versão', 'Acrescentado na Google Cloud?']);
    const email = String(dados.pedidoAcesso.email || '').trim().toLowerCase().slice(0, 120);
    if (!/^[^\s@]+@(gmail|googlemail)\.com$/.test(email)) return ContentService.createTextOutput('email inválido');
    const existentes = testers.getLastRow() > 1 ? testers.getRange(2, 2, testers.getLastRow() - 1, 1).getValues().flat() : [];
    if (!existentes.includes(email)) testers.appendRow([new Date(), email, String(dados.pedidoAcesso.quando || ''), String(dados.pedidoAcesso.versao || ''), 'não']);
    return ContentService.createTextOutput('ok');
  }
  const linhas = (dados.eventos || []).map((ev) => [
    new Date(),
    String(ev.codigo || '').slice(0, 40),
    String(ev.dispositivo || '').slice(0, 60),
    String(ev.evento || '').slice(0, 40),
    JSON.stringify(ev.detalhes || {}).slice(0, 2000),
    String(ev.quando || ''),
    String(ev.versao || '')
  ]);
  if (linhas.length) {
    folha.getRange(folha.getLastRow() + 1, 1, linhas.length, linhas[0].length).setValues(linhas);
  }
  return ContentService.createTextOutput('ok');
}

// ---------------------------------------------------------------------------
// Resumo: transforma as linhas da folha "Eventos" nos números do teste.
// Na folha de cálculo aparece o menu Veto > Atualizar resumo.
// Para atualizar sozinho: Apps Script > Acionadores > Adicionar acionador >
// função atualizarResumo > Baseado no tempo > De hora a hora.
// Isto não precisa de nova implementação: só o doPost é que precisa.
// ---------------------------------------------------------------------------
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Veto').addItem('Atualizar resumo', 'atualizarResumo').addToUi();
}

function atualizarResumo() {
  const livro = SpreadsheetApp.getActiveSpreadsheet();
  const fuso = Session.getScriptTimeZone();
  const folhaEventos = livro.getSheetByName('Eventos');
  const linhas = folhaEventos && folhaEventos.getLastRow() > 1
    ? folhaEventos.getRange(2, 1, folhaEventos.getLastRow() - 1, 7).getValues()
    : [];

  const quem = {};          // evento -> pessoas (dispositivos) diferentes
  const dias = {};          // dispositivo -> dias com atividade
  const ultimaAnalise = {}; // dispositivo -> última análise
  const somar = (mapa, chave) => { mapa[chave] = (mapa[chave] || 0) + 1; };
  const porDireito = {};
  const respostas = {};
  const planos = {};
  const origens = {};
  const notas = [];
  const comentarios = [];

  linhas.forEach(([recebido, , dispositivo, evento, texto]) => {
    let d = {};
    try { d = JSON.parse(texto || '{}'); } catch (erro) { d = {}; }
    // Pedidos e respostas feitos no modo de exemplo não contam
    if (d.demo === true && /^(pedido_|resposta_)/.test(evento)) return;
    const id = String(dispositivo || '');
    if (id) {
      (quem[evento] = quem[evento] || new Set()).add(id);
      if (recebido instanceof Date) (dias[id] = dias[id] || new Set()).add(Utilities.formatDate(recebido, fuso, 'yyyy-MM-dd'));
    }
    if (evento === 'analise_concluida' && id) ultimaAnalise[id] = d;
    if (evento === 'pedido_enviado') somar(porDireito, d.direito || '?');
    if (evento === 'resposta_registada') somar(respostas, d.resultado || '?');
    if (evento === 'plus_quero') somar(planos, d.plano || '?');
    if (evento === 'adesao') somar(origens, d.origem || 'sem origem no link');
    if (evento === 'opiniao') {
      if (Number(d.nota)) notas.push(Number(d.nota));
      if (d.comentario) comentarios.push([recebido instanceof Date ? Utilities.formatDate(recebido, fuso, 'dd/MM HH:mm') : '', String(d.comentario).slice(0, 400)]);
    }
  });

  const n = (evento) => (quem[evento] ? quem[evento].size : 0);
  const pct = (parte, base) => (base ? Math.round((parte / base) * 100) + '%' : '');
  const media = (lista) => (lista.length ? Math.round((lista.reduce((a, b) => a + b, 0) / lista.length) * 10) / 10 : '');
  const testers = Object.keys(dias).length;
  const voltaram = Object.keys(dias).filter((id) => dias[id].size >= 2).length;
  const analises = Object.values(ultimaAnalise);
  const daAnalise = (ler) => media(analises.map((a) => Number(ler(a)) || 0));
  const NOMES = {
    access: 'Acesso', erasure: 'Apagamento', objection: 'Oposição', portability: 'Portabilidade',
    data_received: 'Enviou os dados', data_erased: 'Apagou os dados', objection_accepted: 'Deixou de usar para marketing',
    no_data: 'Diz que não tem dados', company_refused: 'Recusou o pedido', partial: 'Respondeu, sem resultado', no_reply: 'Sem resposta no prazo',
    mensal: 'Mensal', anual: 'Anual'
  };
  const lista = (mapa, prefixo) => Object.keys(mapa).sort((a, b) => mapa[b] - mapa[a]).map((chave) => [`${prefixo}${NOMES[chave] || chave}`, mapa[chave], '']);

  const folhaTesters = livro.getSheetByName('Testers');
  const pedidosAcesso = folhaTesters && folhaTesters.getLastRow() > 1 ? folhaTesters.getRange(2, 5, folhaTesters.getLastRow() - 1, 1).getValues().flat() : [];

  const titulos = [];
  const linhasResumo = [];
  const titulo = (texto, b = '', c = '') => { titulos.push(linhasResumo.length + 1); linhasResumo.push([texto, b, c]); };
  const linha = (a, b = '', c = '') => linhasResumo.push([a, b, c]);

  titulo('Resumo do teste do Veto');
  linha('Atualizado em', Utilities.formatDate(new Date(), fuso, 'dd/MM/yyyy HH:mm'));
  linha('Só conta quem aceitou as estatísticas. Cada pessoa é um browser ou telemóvel.');
  linha('');
  titulo('Funil', 'Pessoas', '% dos testers');
  linha('Aceitaram as estatísticas', testers, testers ? '100%' : '');
  linha('O login do Google falhou ou foi cancelado', n('login_google_interrompido'), pct(n('login_google_interrompido'), testers));
  linha('Concluíram a análise do Gmail', n('analise_concluida'), pct(n('analise_concluida'), testers));
  linha('Prepararam um pedido', n('pedido_preparado'), pct(n('pedido_preparado'), testers));
  linha('Confirmaram que enviaram um pedido', n('pedido_enviado'), pct(n('pedido_enviado'), testers));
  linha('Registaram a resposta de uma empresa', n('resposta_registada'), pct(n('resposta_registada'), testers));
  linha('Voltaram noutro dia', voltaram, pct(voltaram, testers));
  linha('Abriram o guia ou uma notícia', new Set([...(quem.guia_aberto || []), ...(quem.noticia_aberta || [])]).size, '');
  linha('');
  titulo('Veto+', 'Pessoas', '% dos que viram');
  linha('Viram o cartão', n('plus_visto'), '');
  linha('Abriram o plano', n('plus_aberto'), pct(n('plus_aberto'), n('plus_visto')));
  linha('Disseram que queriam', n('plus_quero'), pct(n('plus_quero'), n('plus_visto')));
  lista(planos, '   escolhas: ').forEach((l) => linha(...l));
  linha('Disseram "agora não"', n('plus_agora_nao'), pct(n('plus_agora_nao'), n('plus_visto')));
  linha('');
  titulo('Análises (última de cada pessoa)', 'Média', '');
  linha('Emails analisados', daAnalise((a) => a.emails));
  linha('Empresas encontradas', daAnalise((a) => a.empresas));
  linha('   de gravidade crítica', daAnalise((a) => a.porGravidade && a.porGravidade.critica));
  linha('   de gravidade alta', daAnalise((a) => a.porGravidade && a.porGravidade.alta));
  linha('   de gravidade média', daAnalise((a) => a.porGravidade && a.porGravidade.media));
  linha('   de gravidade baixa', daAnalise((a) => a.porGravidade && a.porGravidade.baixa));
  linha('   sem área conhecida ("Outros")', daAnalise((a) => a.porArea && a.porArea.outros));
  linha('   com link para cancelar a subscrição', daAnalise((a) => a.comCancelamento));
  linha('');
  titulo('Pedidos enviados, por direito', 'Pedidos', '');
  lista(porDireito, '').forEach((l) => linha(...l));
  linha('');
  titulo('Respostas registadas', 'Respostas', '');
  lista(respostas, '').forEach((l) => linha(...l));
  linha('');
  titulo('De onde vieram (?origem= no link)', 'Pessoas', '');
  lista(origens, '').forEach((l) => linha(...l));
  linha('');
  titulo('Opiniões', '', '');
  linha('Número de opiniões', notas.length);
  linha('Nota média (1 a 5)', media(notas));
  linha('');
  titulo('Pedidos de acesso ao teste', '', '');
  linha('Recebidos', pedidosAcesso.length);
  linha('Ainda por acrescentar na Google Cloud', pedidosAcesso.filter((v) => String(v).toLowerCase() !== 'sim').length);
  linha('');
  titulo('Últimos comentários', 'Quando', '');
  comentarios.slice(-15).reverse().forEach(([quando, texto]) => linha(texto, quando));

  const resumo = livro.getSheetByName('Resumo') || livro.insertSheet('Resumo', 0);
  resumo.clear();
  resumo.getRange(1, 1, linhasResumo.length, 3).setValues(linhasResumo);
  titulos.forEach((l) => resumo.getRange(l, 1, 1, 3).setFontWeight('bold'));
  resumo.getRange(1, 1).setFontSize(14);
  resumo.setColumnWidth(1, 380);
  resumo.setColumnWidths(2, 2, 130);
  resumo.getRange(1, 1, linhasResumo.length, 1).setWrap(true);
}