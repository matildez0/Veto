# Monitorização contínua do Veto+

A monitorização contínua corre no dispositivo e guarda as preferências, o último snapshot e os resultados em armazenamento local seguro.

## Fluxo

1. A pessoa escolhe diário, semanal ou mensal.
2. Antes de ativar, a app explica a permissão de notificações e a execução em segundo plano.
3. Ao ativar, a app pede notificações e regista uma tarefa `expo-background-task`.
4. A app verifica ao abrir e quando o sistema operativo executar a tarefa.
5. `runMonitoringScan` compara o snapshot atual com o anterior.
6. Só empresas e notícias com IDs novos geram uma notificação local.
7. Desligar a opção remove a tarefa. A permissão também pode ser revogada nas definições do dispositivo.

## Ligar o scanner Gmail

O módulo não envia tokens para nenhum servidor. O scanner real deve ser criado na camada local da integração Gmail e registado antes da primeira análise:

```ts
setMailboxScanner(async () => {
  const result = await scanGmailOnDevice();
  return {
    scannedAt: new Date().toISOString(),
    companies: result.companies,
    news: result.news
  };
});
```

O scanner deve devolver IDs estáveis:

- `companies[].id`: ID estável da empresa/domínio.
- `news[].id`: ID estável da notícia.

O exemplo atualmente usado pelo ecrã é um scanner de demonstração para testar o fluxo sem Gmail.

## Limitações do sistema operativo

Uma tarefa em segundo plano não corre exatamente à hora escolhida. O iOS e o Android decidem quando executá-la, respeitando o intervalo mínimo, bateria e condições do dispositivo. A verificação ao abrir a app é o caminho garantido.
