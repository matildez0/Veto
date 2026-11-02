# Veto+

Este documento explica como testar o Veto+ no protótipo web da Veto.

## O que é o Veto+

O Veto+ permite juntar até **5 contas Gmail** numa só análise. O plano gratuito permite analisar uma conta de cada vez.

No protótipo, o Veto+ usa o **Stripe em modo de teste**. Não são cobrados pagamentos reais.

## Pré-requisitos

- Python instalado.
- Acesso à conta Stripe da equipa.
- Os Payment Links Stripe em modo de teste configurados em [`veto-plus.js`](./veto-plus.js).
- Um navegador com acesso ao Gmail e autorização para a aplicação.

## Iniciar a aplicação localmente

Abra o PowerShell na pasta `mvp\prototipo` e execute:

```powershell
python -m http.server 8000
```

Abra depois:

```text
http://localhost:8000
```

Não abra o `index.html` diretamente com `file://`, porque o login Google pode falhar devido ao `origin_mismatch`.

## Configuração do Stripe

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
http://localhost:8000/?plus=ok&plano=mensal&sessao={CHECKOUT_SESSION_ID}
```

e:

```text
http://localhost:8000/?plus=ok&plano=anual&sessao={CHECKOUT_SESSION_ID}
```

É importante manter `{CHECKOUT_SESSION_ID}` exatamente assim. O Stripe substitui-o pelo identificador da sessão de teste.

Se os dois links estiverem vazios, a aplicação usa o modo de demonstração e ativa o Veto+ sem abrir o Stripe.

## Testar uma subscrição

1. Abra `http://localhost:8000`.
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

É possível adicionar até 5 contas. Remover o Veto+ neste dispositivo não apaga imediatamente os dados já analisados, mas impede adicionar novas contas acima do limite gratuito.

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
