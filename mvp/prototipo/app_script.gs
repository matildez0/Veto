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
 */
function doPost(e) {
  const livro = SpreadsheetApp.getActiveSpreadsheet();
  const folha = livro.getSheetByName('Eventos') || livro.insertSheet('Eventos');
  if (folha.getLastRow() === 0) {
    folha.appendRow(['Recebido', 'Código', 'Dispositivo', 'Evento', 'Detalhes', 'Hora no dispositivo', 'Versão']);
  }
  const dados = JSON.parse(e.postData.contents || '{}');
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