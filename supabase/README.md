# Configuração do backend do Veto+

Este diretório contém a configuração que liga o protótipo do Veto ao
Supabase e ao Stripe:

- autenticação do utilizador através do Google;
- associação persistente da subscrição à conta Supabase;
- limite de cinco contas Gmail por subscrição ativa;
- checkout Stripe;
- atualização da subscrição através de webhooks Stripe.

Os resultados detalhados da análise continuam guardados localmente no
dispositivo. O backend guarda apenas a identidade da conta, o estado do plano
e os emails das contas Gmail associadas.

## Arquitetura

```text
Frontend
  ├─ Supabase Auth (login Google)
  ├─ create-checkout (cria a sessão Stripe)
  └─ link-account (associa uma conta Gmail e valida o limite)

Stripe
  └─ stripe-webhook (confirma e atualiza a subscrição)

Supabase Database
  ├─ profiles
  ├─ subscriptions
  └─ linked_accounts
```

O `localStorage` não decide se o Veto+ está ativo. É apenas uma cache local.
O estado válido vem da tabela `subscriptions`.

## Pré-requisitos

- Um projeto criado no [Supabase](https://supabase.com).
- Uma conta Stripe com **Test mode** ativo.
- Node.js e `npx`.
- Supabase CLI.
- O projeto ligado ao repositório.

No Windows, usa `npx.cmd` se o PowerShell bloquear `npx.ps1`.

## 1. Ligar a CLI ao projeto

Na raiz do repositório:

```powershell
cd C:\Users\ritam\Desktop\Veto
npx.cmd supabase login
npx.cmd supabase link --project-ref krzsowlvgonjtzucsltt
```

O `project-ref` também pode ser encontrado no URL do projeto Supabase.

## 2. Aplicar a migração da base de dados

A migração está em
[`migrations/20261113000000_billing.sql`](./migrations/20261113000000_billing.sql).

Como a base de dados é remota, usa `--remote`:

```powershell
npx.cmd supabase db push --remote --yes
```

Não uses apenas `supabase db push`, porque esse comando tenta ligar a um
Postgres local em `127.0.0.1:54322`.

Depois, em **Supabase → Table Editor**, devem existir:

- `profiles`;
- `subscriptions`;
- `linked_accounts`.

## 3. Configurar o Google Auth

### Google Cloud

No cliente OAuth do tipo **Aplicação Web**, adiciona este URI de
redirecionamento:

```text
https://krzsowlvgonjtzucsltt.supabase.co/auth/v1/callback
```

As origens JavaScript para desenvolvimento podem incluir:

```text
http://localhost:8000
http://localhost:5500
```

### Supabase

1. Abre **Authentication → Sign In / Providers**.
2. Ativa **Google**.
3. Cola o **Client ID** e o **Client Secret** do Google Cloud.
4. Em **Authentication → URL Configuration**, adiciona:

   ```text
   http://localhost:8000/mvp/prototipo/index.html
   http://localhost:5500/mvp/prototipo/index.html
   ```

5. Adiciona também o endereço de produção da aplicação.

O Client Secret do Google fica apenas no Supabase. Não deve ser colocado em
[`mvp/prototipo/supabase-config.js`](../mvp/prototipo/supabase-config.js).

## 4. Configurar o frontend

Em [`mvp/prototipo/supabase-config.js`](../mvp/prototipo/supabase-config.js),
preenche apenas o Project URL e a chave pública:

```js
const SUPABASE_CONFIG = {
  URL: 'https://krzsowlvgonjtzucsltt.supabase.co',
  ANON_KEY: 'sb_publishable_...'
};
```

O Project URL **não** termina em `/rest/v1/`. A chave `sb_publishable_...`
pode ser usada no browser. Nunca coloques neste ficheiro:

- `sk_test_...` ou `sk_live_...`;
- `whsec_...`;
- `service_role`;
- qualquer outro segredo de servidor.

## 5. Criar os preços no Stripe

Com **Test mode** ativo:

1. Cria o produto mensal com preço recorrente mensal.
2. Copia o ID `price_...` para `STRIPE_PRICE_MENSAL`.
3. Cria o produto anual com preço recorrente anual.
4. Copia o ID `price_...` para `STRIPE_PRICE_ANUAL`.

Os IDs `price_...` não são segredos.

## 6. Configurar os segredos das Edge Functions

No Stripe, copia:

- **Developers → API keys → Secret key** para `STRIPE_SECRET_KEY`;
- o **Signing secret** do endpoint webhook para `STRIPE_WEBHOOK_SECRET`.

Para desenvolvimento local, o `APP_URL` é `http://localhost:8000`.

```powershell
npx.cmd supabase secrets set `
  STRIPE_SECRET_KEY="sk_test_..." `
  STRIPE_WEBHOOK_SECRET="whsec_..." `
  STRIPE_PRICE_MENSAL="price_..." `
  STRIPE_PRICE_ANUAL="price_..." `
  APP_URL="http://localhost:8000"
```

Confirma apenas os nomes dos segredos:

```powershell
npx.cmd supabase secrets list
```

Os valores não devem ser publicados, enviados por chat ou commitados no
repositório. Se uma chave for exposta, revoga-a no Stripe e cria outra.

## 7. Publicar as Edge Functions

As funções estão em [`functions/`](./functions/):

```powershell
npx.cmd supabase functions deploy create-checkout --yes
npx.cmd supabase functions deploy link-account --yes
npx.cmd supabase functions deploy stripe-webhook --no-verify-jwt --yes
```

O `--no-verify-jwt` é necessário no webhook porque o Stripe não envia um
token JWT do Supabase. A função valida a assinatura `stripe-signature` com
`STRIPE_WEBHOOK_SECRET`.

## 8. Configurar o webhook Stripe

No Stripe, em **Developers → Webhooks**, cria um endpoint:

```text
https://krzsowlvgonjtzucsltt.supabase.co/functions/v1/stripe-webhook
```

Seleciona estes eventos:

```text
checkout.session.completed
customer.subscription.updated
customer.subscription.deleted
```

Depois copia o **Signing secret** (`whsec_...`) e guarda-o no Supabase como
`STRIPE_WEBHOOK_SECRET`.

## 9. Testar localmente

Na raiz do repositório:

```powershell
python -m http.server 8000
```

Abre:

```text
http://localhost:8000/mvp/prototipo/index.html
```

Testa nesta ordem:

1. Abre o Veto+.
2. Escolhe o plano mensal ou anual.
3. Entra com Google quando o Supabase pedir.
4. No Stripe Test mode, usa:

   ```text
   Cartão: 4242 4242 4242 4242
   Validade: qualquer data futura
   CVC: 123
   ```

5. Confirma o pagamento.
6. Verifica `public.subscriptions` no Supabase.
7. Associa contas Gmail e confirma `public.linked_accounts`.
8. Testa o limite de cinco contas.

O fluxo esperado é:

```text
Login Google
→ create-checkout
→ Stripe Checkout
→ checkout.session.completed
→ stripe-webhook
→ subscriptions.status = active
```

## 10. Diagnóstico

### `db push` tenta usar `127.0.0.1:54322`

Usa:

```powershell
npx.cmd supabase db push --remote --yes
```

### `Neither apiKey nor config.authenticator provided`

`STRIPE_SECRET_KEY` não está disponível na função. Confirma o nome e publica
novamente:

```powershell
npx.cmd supabase secrets list
npx.cmd supabase functions deploy create-checkout --yes
```

### O utilizador aparece, mas `subscriptions` está vazia

O login funcionou, mas o pagamento ou o webhook não terminou. Verifica:

- **Edge Functions → create-checkout → Logs**;
- **Stripe → Developers → Webhooks → Events**;
- se o webhook usa a URL correta;
- se `STRIPE_WEBHOOK_SECRET` corresponde ao endpoint atual;
- se estás no mesmo modo Stripe: **Test mode**.

### O checkout abre, mas a app não reconhece o plano

Confirma que:

- `checkout.session.completed` foi entregue com sucesso;
- a linha em `subscriptions` tem `status = active` ou `trialing`;
- o utilizador autenticado é o mesmo que iniciou o checkout.

### O PowerShell bloqueia `npx`

Usa `npx.cmd`:

```powershell
npx.cmd supabase functions deploy create-checkout --yes
```

## Segurança

- Nunca guardar segredos Stripe no frontend.
- Nunca usar a chave `service_role` no browser.
- Não confiar em `plus=ok`, `localStorage` ou valores enviados pelo cliente
  para autorizar uma subscrição.
- Manter RLS ativo nas tabelas públicas.
- Rodar imediatamente qualquer segredo exposto.
- Usar chaves `sk_test_...` durante o desenvolvimento.

O OAuth usado para ler o Gmail continua separado doKT login Supabase. O token
temporário do Gmail é revogado depois da análise, conforme o comportamento do
protótipo.
