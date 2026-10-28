// Veto: assina o catálogo com a chave privada do grupo, para ninguém de fora o conseguir alterar.
//
// A app (e o GitHub, em cada pull request) só aceita um catalogo.json cuja assinatura
// (catalogo.json.sig) foi feita com a chave privada do grupo. Quem não tem essa chave pode mudar
// o ficheiro, mas a app recusa-o e passa a pedir os contactos às pessoas.
//
// Usa só o Node (sem pacotes). Algoritmo: ECDSA P-256 com SHA-256, o mesmo que o browser verifica.
//
//   node mvp/catalogo/assinar.mjs chaves      Cria o par de chaves (uma vez, por uma pessoa do grupo)
//   node mvp/catalogo/assinar.mjs assinar     Assina o catalogo.json (sempre que ele muda)
//   node mvp/catalogo/assinar.mjs verificar   Confirma a assinatura (o GitHub corre isto)
//
// A chave privada fica FORA do repositório, por defeito em ~/.veto/catalogo-privada.pem
// (no Windows, C:\Users\<nome>\.veto\). Outro caminho: variável VETO_CHAVE_CATALOGO.
// Guardem uma cópia num gestor de palavras-passe partilhado pelo grupo. Nunca a ponham no Git.
import { createPrivateKey, createPublicKey, generateKeyPairSync, sign, verify } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PASTA = dirname(fileURLToPath(import.meta.url));
const CATALOGO = join(PASTA, 'catalogo.json');
const ASSINATURA = `${CATALOGO}.sig`;
const PUBLICA = join(PASTA, 'catalogo.pub.json');
const APP = join(PASTA, '..', 'prototipo', 'app.js');
const PRIVADA = process.env.VETO_CHAVE_CATALOGO || join(homedir(), '.veto', 'catalogo-privada.pem');
const LINHA_DA_CHAVE = /^const CATALOGO_CHAVE_PUBLICA = .*;$/m;

// O que se assina: o texto do catálogo com fins de linha \n (o Git no Windows pode trocá-los por \r\n)
const conteudo = () => Buffer.from(readFileSync(CATALOGO, 'utf8').replace(/\r\n/g, '\n'), 'utf8');
const falhar = (mensagem) => {
  console.error(`Erro: ${mensagem}`);
  process.exit(1);
};

function chaves() {
  if (existsSync(PRIVADA)) falhar(`já existe uma chave privada em ${PRIVADA}. Para a substituir, apaga-a primeiro (e assina outra vez o catálogo).`);
  const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
  mkdirSync(dirname(PRIVADA), { recursive: true });
  writeFileSync(PRIVADA, privateKey.export({ type: 'pkcs8', format: 'pem' }), { mode: 0o600 });
  const jwk = publicKey.export({ format: 'jwk' });
  const publica = { kty: jwk.kty, crv: jwk.crv, x: jwk.x, y: jwk.y };
  writeFileSync(PUBLICA, `${JSON.stringify(publica, null, 2)}\n`);
  // A chave pública vai para dentro da app, para ela verificar o catálogo sozinha
  const app = readFileSync(APP, 'utf8');
  if (!LINHA_DA_CHAVE.test(app)) falhar(`não encontrei a linha "const CATALOGO_CHAVE_PUBLICA = …;" em ${APP}`);
  writeFileSync(APP, app.replace(LINHA_DA_CHAVE, `const CATALOGO_CHAVE_PUBLICA = ${JSON.stringify(publica)};`));
  console.log(`Chave privada: ${PRIVADA}`);
  console.log('   Guarda uma cópia no gestor de palavras-passe do grupo. Nunca a ponhas no Git.');
  console.log(`Chave pública: ${PUBLICA} e dentro de mvp/prototipo/app.js`);
  console.log('Agora assina o catálogo: node mvp/catalogo/assinar.mjs assinar');
}

function assinar() {
  if (!existsSync(PRIVADA)) falhar(`não encontrei a chave privada em ${PRIVADA}. Pede-a a quem a criou, ou indica o caminho em VETO_CHAVE_CATALOGO.`);
  const privada = createPrivateKey(readFileSync(PRIVADA));
  const assinatura = sign('sha256', conteudo(), { key: privada, dsaEncoding: 'ieee-p1363' });
  writeFileSync(ASSINATURA, `${assinatura.toString('base64')}\n`);
  console.log(`Catálogo assinado: ${ASSINATURA}`);
  verificar();
}

function verificar() {
  if (!existsSync(PUBLICA)) falhar('ainda não há chave pública (catalogo.pub.json). Cria as chaves com: node mvp/catalogo/assinar.mjs chaves');
  if (!existsSync(ASSINATURA)) falhar('o catálogo não está assinado (falta catalogo.json.sig). Assina com: node mvp/catalogo/assinar.mjs assinar');
  const publica = JSON.parse(readFileSync(PUBLICA, 'utf8'));
  const chave = createPublicKey({ key: publica, format: 'jwk' });
  const assinatura = Buffer.from(readFileSync(ASSINATURA, 'utf8').trim(), 'base64');
  if (!verify('sha256', conteudo(), { key: chave, dsaEncoding: 'ieee-p1363' }, assinatura)) {
    falhar('a assinatura não corresponde ao catalogo.json. O catálogo foi alterado depois de assinado: alguém do grupo tem de o rever e assinar outra vez.');
  }
  // A chave dentro da app tem de ser a mesma, senão a app recusaria o catálogo
  const linha = readFileSync(APP, 'utf8').match(LINHA_DA_CHAVE);
  if (!linha || !linha[0].includes(publica.x) || !linha[0].includes(publica.y)) {
    falhar('a chave pública dentro de mvp/prototipo/app.js não é a do catalogo.pub.json.');
  }
  const empresas = JSON.parse(conteudo().toString('utf8')).companies?.length ?? 0;
  console.log(`Assinatura válida: ${empresas} empresas, assinadas pelo grupo.`);
}

const comandos = { chaves, assinar, verificar };
const comando = comandos[process.argv[2]];
if (!comando) falhar('usa "chaves", "assinar" ou "verificar". Por exemplo: node mvp/catalogo/assinar.mjs assinar');
comando();
