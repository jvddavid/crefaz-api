# Eventos e Contratos Externos

## Objetivo

Este documento define como tratar eventos, webhooks, mudanças de contrato e sinais operacionais vindos de APIs financeiras externas.

Em integrações desse tipo, evento não é apenas mensagem de negócio. Também inclui qualquer evidência de mudança de comportamento do provedor.

## Tipos de evento relevantes

### Eventos de domínio interno

Eventos internos representam fatos relevantes da biblioteca após normalização.

Exemplos:

- QuoteUpdated;
- OrderSubmitted;
- OrderRejected;
- OrderFilled;
- PositionChanged;
- TokenRefreshed;
- WebhookSignatureValidated;
- ProviderContractChangedDetected.

Esses eventos devem usar nomenclatura interna, sem acoplamento direto ao provedor.

### Eventos externos do provedor

São payloads brutos ou semibrutos recebidos por webhook, streaming, polling ou resposta HTTP.

Exemplos:

- alteração de status de ordem;
- atualização de saldo;
- invalidação de token;
- mudança de schema;
- novo campo obrigatório;
- enum inesperado;
- alteração de paginação;
- mudança de rate limit.

## Regras de modelagem

- o payload externo nunca deve ser tratado como evento de domínio final;
- todo evento externo deve ser validado, classificado e traduzido;
- campos desconhecidos devem ser observados, mas não incorporados automaticamente ao domínio;
- eventos devem ter versionamento explícito quando o formato interno evoluir.

## Pipeline recomendado

1. Receber o evento externo.
2. Validar autenticidade, assinatura e origem.
3. Validar schema mínimo.
4. Traduzir para modelo interno.
5. Classificar impacto operacional.
6. Publicar evento interno ou erro normalizado.
7. Registrar evidências para auditoria e diagnóstico.

## Webhooks

### Requisitos mínimos

- verificação de assinatura obrigatória;
- validação de replay quando o provedor suportar timestamp ou nonce;
- idempotência no processamento;
- logs com request id e provider event id;
- resposta rápida ao provedor, desacoplando trabalho pesado quando necessário.

### Estratégia de desenho

- implementar parser por provedor;
- normalizar o webhook para eventos internos estáveis;
- manter o payload bruto apenas em camada técnica ou armazenamento temporário seguro quando necessário para auditoria.

## Detecção de mudança de contrato

Mudança de contrato é um evento operacional de primeira classe.

Sinais típicos:

- campo removido ou renomeado;
- tipo alterado;
- enum novo ou inválido;
- resposta com shape incompatível;
- status code inesperado para fluxo conhecido;
- paginação alterada;
- limite de taxa diferente do documentado.

### Como reagir

1. Classificar o desvio como ProviderContractError quando houver quebra estrutural.
2. Registrar contexto suficiente para reproduzir o caso.
3. Fazer o teste de integração correspondente falhar explicitamente.
4. Ajustar o adaptador do provedor antes de considerar mudança no domínio.

## Normalização de estados

Cada provedor tende a modelar estados de forma diferente. O projeto deve ter estados canônicos internos.

Exemplo para ordens:

- pending;
- accepted;
- partially-filled;
- filled;
- cancelled;
- rejected;
- expired.

Mapeamentos do provedor para esses estados devem ficar documentados no próprio adaptador.

## Idempotência de eventos

Eventos recebidos externamente podem ser duplicados, reordenados ou atrasados.

Regras:

- usar provider event id quando existir;
- combinar event id, aggregate id e timestamp quando necessário;
- tratar duplicidade como condição esperada;
- não assumir monotonicidade sem garantia explícita do provedor.

## Observabilidade orientada a eventos

Cada fluxo importante deve gerar sinais operacionais mínimos:

- nome do provedor;
- tipo de evento externo;
- tipo de evento interno;
- latência de processamento;
- resultado final;
- motivo de rejeição quando houver;
- correlação com request anterior, ordem ou conta.

## Política de compatibilidade

- eventos internos são contrato do projeto e devem evoluir com cuidado;
- eventos externos são instáveis e devem ficar isolados;
- qualquer campo derivado de provedor deve ter origem clara e semântica documentada.

## Prática recomendada para bibliotecas

Se a biblioteca não publicar eventos para um barramento, ainda assim vale modelar eventos como artefatos internos de diagnóstico e consistência. Isso melhora rastreabilidade e facilita detectar quando a API financeira mudou silenciosamente.
