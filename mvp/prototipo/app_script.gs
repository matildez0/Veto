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