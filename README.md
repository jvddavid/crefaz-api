# @jvddavid/crefaz-api

SDK TypeScript/ESM para integrar com a API Parceiro V2 da Crefaz.

Este pacote encapsula autenticação, chamadas autenticadas, operações assíncronas de proposta, parsing de webhook, helpers de cidades e normalização de erros para consumo em aplicações Node.js.

## Quando usar

Use esta biblioteca quando for necessário:

- autenticar com login, senha e `apiKey` da Crefaz;
- iniciar operações assíncronas de proposta e acompanhar o processamento;
- consultar cidades e países suportados pela API;
- interpretar payloads de webhook com tipagem estável;
- consumir uma taxonomia de erros própria em vez de lidar diretamente com respostas HTTP brutas.

## Requisitos

- Node.js `>=24`
- pacote publicado como ESM/CJS com tipos TypeScript
- gerenciador recomendado: `pnpm`

## Instalação

O pacote é publicado no GitHub Packages (`https://npm.pkg.github.com`). Configure o escopo do pacote no seu `.npmrc` e então instale:

````ini
@jvddavid:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=SEU_GITHUB_TOKEN
````

Depois instale:

````bash
pnpm add @jvddavid/crefaz-api
````

## Ambientes da Crefaz

A biblioteca exporta os base URLs oficiais em `crefazBaseUrls`:

- `crefazBaseUrls.homologacao` → `https://api-externo-stag.crefazon.com.br/api/v2`
- `crefazBaseUrls.producao` → `https://api-externo.crefazon.com.br/api`

Por padrão, `CrefazClient` usa homologação.

## Uso rápido

````ts
import { CrefazClient, crefazBaseUrls } from '@jvddavid/crefaz-api'

const client = new CrefazClient({
  credentials: {
    login: process.env.CREFAZ_LOGIN ?? '',
    senha: process.env.CREFAZ_SENHA ?? '',
    apiKey: process.env.CREFAZ_API_KEY ?? '',
  },
  baseUrl: crefazBaseUrls.homologacao,
})

const auth = await client.authenticate()
console.log(auth.token)
````

## Como a SDK deve ser usada

O fluxo típico é:

1. criar uma instância de `CrefazClient` com `login`, `senha` e `apiKey`;
2. usar operações autenticadas do cliente;
3. para rotas assíncronas, armazenar `processo.id` retornado pela Crefaz;
4. receber o resultado principal via webhook;
5. usar `getProcessingStatus` ou `waitForProcessing` como fallback quando a notificação não chegar.

## Exemplo mínimo de operação assíncrona

As rotas críticas da Crefaz funcionam de forma assíncrona e exigem `operacao.urlNotificacao` no payload.

````ts
import { CrefazClient } from '@jvddavid/crefaz-api'

const client = new CrefazClient({
  credentials: {
    login: process.env.CREFAZ_LOGIN ?? '',
    senha: process.env.CREFAZ_SENHA ?? '',
    apiKey: process.env.CREFAZ_API_KEY ?? '',
  },
})

const accepted = await client.preAnalyseProposal({
  cliente: {
    cpf: '435.901.808-89',
    nome: 'Nome do cliente',
    nascimento: '1974-07-10',
  },
  profissional: {
    ocupacaoId: 1,
  },
  contato: {
    telefone: '44999167734',
  },
  endereco: {
    logradouro: 'Rua Rui Barbosa',
    bairro: 'Limoeiro',
    cep: '63080000',
    cidadeId: '1762',
  },
  operacao: {
    urlNotificacao: 'https://sua-aplicacao.exemplo/webhooks/crefaz',
  },
})

const processId = accepted.data.processo.id
const status = await client.waitForProcessing(processId)
console.log(status.evento.status)
````

## Operações disponíveis

### Autenticação

- `authenticate(forceRefresh?)`
- `getAccessToken()`

### Propostas e processamento assíncrono

- `preAnalyseProposal(payload)`
- `selectOfferedProduct(proposalId, productId, payload)`
- `submitCreditProposal(proposalId, payload)`
- `consultVehicleOfferedProducts(proposalId, payload)`
- `authorizeMarginConsultation(proposalId, payload)`
- `getProcessingStatus(processId)`
- `waitForProcessing(processId, options?)`

### Consultas e complementos de proposta

- `listOfferedProducts(proposalId)`
- `calculateDueDate(proposalId, payload)`
- `getCreditLimit(proposalId, payload)`
- `simulateOffer(proposalId, payload)`
- `listRequiredDocuments(payload)`
- `uploadProposalDocument(proposalId, payload)`
- `getSignatureLink(proposalId)`
- `getProposalBankData(proposalId)`
- `updateProposalBankData(proposalId, payload)`
- `cancelProposal(proposalId)`

### Endereços e catálogos

- `findCities(payload)`
- `listCountries()`

## Webhooks

Use `parseWebhookNotification` para validar e tipar o payload recebido pela sua rota de webhook:

````ts
import { parseWebhookNotification } from '@jvddavid/crefaz-api'

const notification = parseWebhookNotification(payloadRecebido)
console.log(notification.evento.nome)
console.log(notification.evento.status)
````

Em produção, trate webhooks como fonte principal do resultado e polling como mecanismo de contingência.

## Exemplo de busca de cidade

````ts
import { CrefazClient } from '@jvddavid/crefaz-api'

const client = new CrefazClient({
  credentials: {
    login: process.env.CREFAZ_LOGIN ?? '',
    senha: process.env.CREFAZ_SENHA ?? '',
    apiKey: process.env.CREFAZ_API_KEY ?? '',
  },
})

const cities = await client.findCities({
  endereco: {
    nomeCidade: 'Londrina',
    uf: 'PR',
  },
})

console.log(cities.endereco)
````

## Principais recursos exportados

### Cliente principal

- `CrefazClient`
- `crefazBaseUrls`
- `parseWebhookNotification`

### Helpers de cidades

- `crefazCitiesByUf`
- `findLocalCityByNameAndUf`
- `findLocalCityIdByNameAndUf`
- tipo `CrefazLocalCity`

> Os dados de cidades são gerados a partir de `docs/cidade_uf.xlsx` pelo script `scripts/generate-city-constants.mjs`.

### Tipos exportados

A biblioteca expõe tipos públicos para autenticação, propostas, polling, webhook, países, cidades, crédito, assinatura e documentos, incluindo:

- `CrefazCredentials`
- `CrefazAuthentication`
- `AcceptedProcessResponse`
- `FindCitiesResponse`
- `ListCountriesResponse`
- `CreditLimitResponse`
- `SimulateOfferResponse`
- `RequiredDocumentsResponse`
- `WebhookNotification`
- `WebhookEvent`
- `PollingOptions`

### Erros exportados

- `AuthenticationError`
- `AuthorizationError`
- `CrefazApiError`
- `NetworkError`
- `ProviderBusinessError`
- `ProviderContractError`
- `RateLimitError`
- `TimeoutError`
- `UnexpectedProviderStateError`
- `ValidationError`

## Observações importantes

- o script `test` ainda não está implementado em `package.json`;
- `pnpm run start` e `pnpm run dev` não validam comportamento da SDK;
- o build depende da geração de constantes de cidades;
- a documentação pública da Crefaz adota fluxo assíncrono com webhook e fallback por polling, então consumidores devem armazenar `processo.id` e tratar duplicidade no próprio sistema.

## Desenvolvimento local da biblioteca

## Validação local

````bash
pnpm run lint
pnpm run typecheck
pnpm run build
````

## Teste de homologação do fluxo Energia

O repositório agora inclui um teste real com `node:test` para o fluxo de homologação do produto Energia até a etapa de retorno das ofertas.

Execute com:

````bash
pnpm run test:homologacao:energia
````

Variáveis esperadas:

- `CREFAZ_LOGIN`
- `CREFAZ_SENHA`
- `CREFAZ_API_KEY`
- `CREFAZ_HOMOLOG_ENERGIA_PRE_ANALISE_PAYLOAD` com o JSON da pre-análise, ou `CREFAZ_HOMOLOG_ENERGIA_PRE_ANALISE_PAYLOAD_FILE` apontando para um arquivo JSON

Variáveis opcionais:

- `CREFAZ_BASE_URL` para sobrescrever a URL de homologação
- `CREFAZ_HOMOLOG_POLLING_ATTEMPTS`
- `CREFAZ_HOMOLOG_POLLING_INTERVAL_MS`
- `CREFAZ_HOMOLOG_ENERGIA_NOME_PRODUTO` para ajustar o texto esperado na resposta de ofertas

Quando as credenciais ou o payload não estiverem configurados, o teste é marcado como `skip` em vez de falhar.

## Referências

- [knowledge/RUNTIME.md](knowledge/RUNTIME.md)
- [knowledge/CREFAZ.md](knowledge/CREFAZ.md)
- [knowledge/ARCH.md](knowledge/ARCH.md)
- [knowledge/EVENTS.md](knowledge/EVENTS.md)
- [knowledge/TESTS.md](knowledge/TESTS.md)
