## Configuração do Stripe

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

No Stripe, confirme que está ativo o **Test mode**.

O ficheiro [`veto-plus.js`](./veto-plus.js) deve conter os Payment Links de teste:

```js
PAGAMENTO: {
  LINK_MENSAL: 'https://buy.stripe.com/test_...',
  LINK_ANUAL: 'https://buy.stripe.com/test_...',
  PORTAL_URL: ''
}
```

Os Payment Links devem redirecionar para:

```text
http://localhost:8000/prototipo/index.html?plus=ok&plano=mensal&sessao={CHECKOUT_SESSION_ID}
```

e:

```text
http://localhost:8000/prototipo/index.html?plus=ok&plano=anual&sessao={CHECKOUT_SESSION_ID}
```

É importante manter `{CHECKOUT_SESSION_ID}` exatamente assim. O Stripe substitui-o pelo identificador da sessão de teste.

Se o Payment Link ainda estiver configurado com `http://localhost:8000/`, atualiza-o para um dos URLs acima. O ficheiro `index.html` na raiz também encaminha esse endereço para a aplicação, mantendo os parâmetros do Stripe.

Se os dois links estiverem vazios, a aplicação usa o modo de demonstração e ativa o Veto+ sem abrir o Stripe.

Durante o desenvolvimento local, qualquer endereço em `localhost`, `127.0.0.1` ou `::1` ativa o Veto+ sem pagamento, mesmo que os Payment Links estejam configurados. Em produção, os Payment Links continuam a ser usados normalmente.

Se estiveres a executar o servidor a partir da raiz do repositório (`Veto`), usa `/mvp/prototipo/index.html` nos URLs acima. Se o servidor for executado a partir da pasta `mvp`, usa `/prototipo/index.html`.

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

O email usado no checkout Stripe e o email usado no login Gmail podem ser diferentes. No protótipo, não existe associação entre esses dois emails.

## Testar várias contas

Com o Veto+ ativo:

1. Abra a página **Resultados**.
2. Escolha **Adicionar outra conta**.
3. Autorize outra conta Google.
4. Escolha a conta pretendida no seletor do Google.
5. Volte à aplicação e confirme que as contas aparecem juntas.

É possível adicionar até 5 contas. Cada conta é guardada separadamente neste dispositivo. Depois de uma análise, a conta analisada fica selecionada por defeito; o botão **Todas as contas** mostra a agregação sem duplicar empresas. Ao adicionar uma conta, o Google abre o seletor de contas (`select_account`) e a app confirma o email devolvido pelo Gmail antes de guardar o resultado. O botão deixa de aparecer quando se atinge o limite. Remover o Veto+ neste dispositivo não apaga imediatamente os dados já analisados, mas impede adicionar novas contas acima do limite gratuito.

## Monitorização contínua

Com o Veto+ ativo, abre **Monitorização** no menu lateral. Escolhe uma frequência, permite notificações e ativa a funcionalidade. A primeira verificação fica como referência; verificações seguintes mostram apenas empresas e notícias novas desde essa referência.

No computador, a verificação é feita quando a app abre, volta a ficar visível ou quando carregas em **Verificar agora**. O navegador não consegue garantir uma tarefa em segundo plano quando a página está fechada. A permissão de notificações pode ser revogada nas definições do navegador e a monitorização pode ser desligada na própria página.

## Estado do Veto+

O estado do Veto+ é guardado no `localStorage` do navegador, separado dos restantes dados da aplicação:

```text
veto.plus.v1
```

Por isso, a ativação fica associada ao mesmo navegador e dispositivo. Limpar os dados do site ou usar outro navegador pode fazer com que o Veto+ deixe de aparecer como ativo.

Para testar novamente desde o início, pode-se remover a chave `veto.plus.v1` nas ferramentas de desenvolvimento do navegador, em **Application/Storage → Local Storage**.

## Gestão e cancelamento

O botão **Desativar o Veto+ neste dispositivo** apenas remove a ativação local da aplicação. Não cancela uma subscrição no Stripe.

O `PORTAL_URL` está vazio por defeito. O portal de cliente Stripe não está configurado neste protótipo.

## Limitações importantes

Esta integração é apenas para testes:

- A aplicação não confirma o pagamento através da API Stripe.
- Não existem webhooks.
- A ativação é guardada apenas no navegador.
- A URL de retorno aceita sessões de teste com o formato `cs_test_...`.
- Qualquer pessoa com acesso ao código pode ativar o Veto+ localmente.
- O modo live e pagamentos reais não devem ser usados com esta implementação.

Não colocar chaves secretas Stripe no código do navegador. Os Payment Links podem estar no código, mas as chaves secretas nunca devem ser partilhadas.
