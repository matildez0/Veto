## Backend Supabase e Stripe

A configuração de produção do Veto+ está em [`../../supabase/README.md`](../../supabase/README.md).
Preenche [`supabase-config.js`](./supabase-config.js) com o Project URL e a
chave pública `anon` do Supabase. Nunca coloques neste ficheiro uma chave
`service_role` ou um segredo Stripe.

O estado da subscrição e o limite de cinco contas são confirmados no servidor.
O `localStorage` do protótipo é apenas uma cache dos resultados locais e nunca
deve decidir se um plano está pago.

## Login Google em desenvolvimento local

O cliente OAuth usado atualmente no `app.js` é:

```text
937297986746-k81vu89sv318tkvmv6ev8e2ht7dt3r82.apps.googleusercontent.com
```

Para testar o scan localmente, na Google Cloud Console abre **APIs e serviços → Credenciais**, edita esse cliente OAuth do tipo **Aplicação Web** e adiciona em **Origens JavaScript autorizadas**:

```text
http://127.0.0.1:8765
http://localhost:8765
```

Não acrescentes `/mvp/prototipo/index.html` neste campo: a origem inclui apenas protocolo, domínio e porta. Usa no browser o mesmo endereço que autorizaste. Se aparecer `Access blocked`, confirma também que a conta Google está em **Utilizadores de teste** no ecrã de consentimento OAuth.

No Stripe, configura os preços e o webhook seguindo o guia em
[`../../supabase/README.md`](../../supabase/README.md).

## Testar uma subscrição

1. Abra `http://localhost:8000/prototipo/index.html`.
2. Ligue uma conta Gmail através do botão de login.
3. Na página inicial, carregue em **Ver o Veto+**.
4. Escolha o plano mensal ou anual.
5. No checkout Stripe, use:

   ```text
   Cartão: 4242 4242 4242 4242
   Validade: qualquer data futura
   CVC: qualquer valor válido
   ```

6. Termine o checkout.
7. O Stripe deve redirecionar para a aplicação.
8. Confirme que aparece a mensagem **Veto+ ativo**.
9. Carregue em **Adicionar outra conta** para testar a análise de várias contas.

O checkout fica associado à conta Google autenticada no Supabase. A conta
Google usada para analisar o Gmail continua a ser autorizada separadamente.

## Testar várias contas

Com o Veto+ ativo:

1. Abra a página **Resultados**.
2. Escolha **Adicionar outra conta**.
3. Autorize outra conta Google.
4. Escolha a conta pretendida no seletor do Google.
5. Volte à aplicação e confirme que as contas aparecem juntas.

É possível adicionar até 5 contas. A associação das contas fica no Supabase,
enquanto os resultados detalhados continuam neste dispositivo. Depois de uma
análise, a conta analisada fica selecionada por defeito; o botão **Todas as
contas** mostra a agregação sem duplicar empresas.

## Monitorização contínua

Com o Veto+ ativo, abre **Monitorização** no menu lateral. Escolhe uma frequência, permite notificações e ativa a funcionalidade. A primeira verificação fica como referência; verificações seguintes mostram apenas empresas e notícias novas desde essa referência.

No computador, a verificação é feita quando a app abre, volta a ficar visível ou quando carregas em **Verificar agora**. O navegador não consegue garantir uma tarefa em segundo plano quando a página está fechada. A permissão de notificações pode ser revogada nas definições do navegador e a monitorização pode ser desligada na própria página.

## Estado local da análise

Os resultados da análise e os pedidos são guardados no `localStorage` do navegador:

```text
veto.prototipo.v2
```

O estado real do Veto+ não depende desta chave: é recuperado do Supabase depois
de iniciar sessão com a mesma conta Google.

## Gestão e cancelamento

O botão de gestão não cancela uma subscrição Stripe. O cancelamento deve ser
ligado ao portal de cliente Stripe quando este for configurado.

O `PORTAL_URL` está vazio por defeito. O portal de cliente Stripe não está configurado neste protótipo.

## Limitações importantes

Antes de aceitar pagamentos reais, é obrigatório publicar as Edge Functions,
configurar o webhook Stripe e preencher as variáveis secretas no Supabase.
Os resultados detalhados da análise ainda não são sincronizados entre
dispositivos.

Não colocar chaves secretas Stripe no código do navegador. Os segredos ficam
apenas nas Edge Functions do Supabase.
