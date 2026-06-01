# Arquitetura

## Objetivo

Este projeto existe para publicar bibliotecas de integração com APIs financeiras externas, expondo uma interface estável para consumidores internos enquanto isola particularidades de cada provedor.

O foco arquitetural é:

- preservar contratos internos mesmo quando a API externa evolui;
- reduzir acoplamento com detalhes HTTP, autenticação e payloads de terceiros;
- permitir testes de integração reais contra ambientes sandbox ou homologação;
- manter o domínio explícito, com falhas classificadas e observabilidade suficiente para diagnosticar incidentes.

## Princípios

- Cada provedor externo deve ser tratado como uma dependência instável.
- O domínio interno nunca deve depender diretamente do formato bruto da API externa.
- Toda tradução de payload deve ocorrer na borda, em adaptadores.
- Regras de negócio internas devem ser representadas por tipos, value objects e serviços de domínio.
- Erros externos devem ser normalizados antes de sair da biblioteca.
- Operações com efeito colateral devem ser idempotentes sempre que o provedor permitir.

## Padrões adotados

### DDD

Usar DDD para modelar o vocabulário do negócio financeiro e as capacidades que a biblioteca oferece.

Elementos esperados:

- bounded contexts por capacidade, como contas, ordens, cotações, carteira, autenticação e liquidação;
- entidades quando houver identidade e ciclo de vida observável;
- value objects para tipos sensíveis, como Money, AssetSymbol, OrderId, AccountId, Timestamp, Currency e Percentage;
- serviços de domínio quando a regra não pertencer naturalmente a uma entidade;
- repositórios apenas se houver persistência local relevante.

### DDS

Neste projeto, DDS deve ser aplicado como organização dirigida por domínio, com slices pequenas e coesas por capacidade de negócio, evitando estrutura baseada apenas em tecnologia.

Exemplo de slices:

- trading;
- accounts;
- positions;
- market-data;
- auth;
- settlements.

Cada slice deve concentrar:

- contratos públicos;
- tipos de domínio;
- casos de uso;
- mapeadores entre domínio e provedor;
- erros específicos;
- testes da própria capacidade.

### Ports and Adapters

Adotar arquitetura hexagonal para separar domínio da infraestrutura externa.

- ports definem o que o domínio precisa executar;
- adapters implementam esses ports chamando o provedor externo;
- translators convertem request e response externos para tipos internos;
- policies encapsulam comportamento operacional, como retry, timeout, circuit breaker e rate limit.

### Anti-Corruption Layer

Toda integração com provedores financeiros deve passar por uma camada anticorrupção.

Ela deve:

- traduzir nomes, enums e códigos externos para o modelo interno;
- impedir vazamento de campos arbitrários do provedor para a API pública;
- estabilizar o contrato público mesmo quando o provedor alterar detalhes cosméticos.

## Estrutura recomendada

```text
src/
  shared/
    domain/
    errors/
    types/
    observability/
    http/
    resilience/
  modules/
    market-data/
      domain/
      application/
      infrastructure/
      contracts/
      tests/
    accounts/
      domain/
      application/
      infrastructure/
      contracts/
      tests/
    trading/
      domain/
      application/
      infrastructure/
      contracts/
      tests/
  providers/
    broker-x/
      auth/
      mappers/
      client/
      webhooks/
    broker-y/
      auth/
      mappers/
      client/
      webhooks/
  index.ts
```

## Responsabilidades por camada

### Domain

- linguagem ubíqua;
- invariantes;
- tipos e regras financeiras;
- classificação de erros de negócio.

### Application

- orquestração de casos de uso;
- validação de entrada da biblioteca;
- composição de ports;
- controle de idempotência e política operacional.

### Infrastructure

- chamadas HTTP;
- autenticação;
- paginação;
- retry;
- serialização;
- observabilidade;
- adaptação para webhooks.

## Contrato público da biblioteca

Toda API pública deve priorizar estabilidade sem esconder semântica importante.

Boas práticas:

- expor interfaces e tipos próprios do projeto;
- evitar expor tipos de bibliotecas HTTP;
- evitar retornar payload bruto do provedor como resposta principal;
- versionar breaking changes com semver real;
- documentar claramente quais campos são estáveis e quais são pass-through.

## Gestão de erros

Toda falha deve ser traduzida para uma taxonomia interna.

Categorias mínimas:

- AuthenticationError;
- AuthorizationError;
- RateLimitError;
- TimeoutError;
- NetworkError;
- ProviderContractError;
- ProviderBusinessError;
- IdempotencyError;
- ValidationError;
- UnexpectedProviderStateError.

Cada erro deve carregar contexto operacional suficiente, como request id, provider, endpoint, operation e status code, sem vazar segredos.

## Resiliência

Integrações financeiras exigem comportamento previsível sob instabilidade.

Políticas recomendadas:

- timeout explícito por operação;
- retry apenas para falhas transitórias e chamadas idempotentes;
- backoff exponencial com jitter;
- circuit breaker por provedor ou por capacidade crítica;
- rate limiting local quando o provedor tiver cotas estritas;
- suporte a correlation id e idempotency key quando disponível.

## Segurança

- nunca registrar tokens, secrets, assinaturas ou payloads sensíveis completos;
- centralizar autenticação e renovação de credenciais;
- separar credenciais de sandbox, homologação e produção;
- validar assinaturas de webhook antes de processar eventos;
- sanitizar logs, erros e métricas.

## Evolução

Quando um provedor mudar comportamento:

1. detectar a mudança pelos testes reais;
2. corrigir primeiro o adaptador externo;
3. atualizar mapeadores e classificação de erros;
4. preservar o contrato público sempre que possível;
5. publicar breaking change apenas quando a semântica interna realmente precisar mudar.
