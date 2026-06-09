# Bodies e Webhooks

Este documento centraliza os bodies aceitos pelos métodos públicos da SDK e os formatos de webhook processados por `parseWebhookNotification`.

O objetivo aqui é documentar o que a biblioteca expõe hoje, sem inventar contratos além do que está implementado em [src/client.ts](src/client.ts), [src/modules/proposals/contracts.ts](src/modules/proposals/contracts.ts) e na documentação consolidada em [knowledge/CREFAZ.md](knowledge/CREFAZ.md).

## Visão Geral

Existem dois grupos de payload na SDK:

- bodies de request enviados para a API da Crefaz;
- payloads de webhook e de fallback de processamento recebidos da Crefaz.

Nem todos os bodies são rigidamente tipados pela SDK. Em várias rotas, o tipo exposto é `JsonObject`, então a validação de shape depende principalmente do contrato externo da Crefaz.

## Resumo dos Bodies

| Método | Endpoint | Tipo do body na SDK | Regra principal |
| --- | --- | --- | --- |
| `authenticate()` | `POST /usuarios/login` | interno | envia `usuario.login`, `usuario.senha`, `usuario.apiKey` |
| `preAnalyseProposal(payload)` | `POST /propostas/pre-analise` | `CrefazAsyncPayload` | `operacao.urlNotificacao` é obrigatório |
| `selectOfferedProduct(proposalId, productId, payload)` | `PUT /propostas/{id}/produtos-ofertados/{produtoId}` | `CrefazAsyncPayload` | `operacao.urlNotificacao` é obrigatório |
| `submitCreditProposal(proposalId, payload)` | `PUT /propostas/{id}/proposta-credito` | `CrefazAsyncPayload` | `operacao.urlNotificacao` é obrigatório |
| `consultVehicleOfferedProducts(proposalId, payload)` | `PUT /proposta/{id}/produtos-ofertados/consultar` | `CrefazAsyncPayload` | `operacao.urlNotificacao` é obrigatório |
| `authorizeMarginConsultation(proposalId, payload)` | `POST /propostas/{id}/autorizacao-consulta` | `CrefazAsyncPayload` | `operacao.urlNotificacao` é obrigatório |
| `findCities(payload)` | `POST /enderecos/cidades` | `JsonObject` | body livre conforme contrato da Crefaz |
| `calculateDueDate(proposalId, payload)` | `POST /propostas/{id}/calculo-vencimento` | `JsonObject` | body livre conforme contrato da Crefaz |
| `getCreditLimit(proposalId, payload)` | `POST /propostas/{id}/limite-credito` | `JsonObject` | body livre conforme contrato da Crefaz |
| `simulateOffer(proposalId, payload)` | `POST /propostas/{id}/simulacao-credito` | `JsonObject` | body livre conforme contrato da Crefaz |
| `listRequiredDocuments(payload)` | `POST /Propostas/tipos-documentos` | `JsonObject` | body livre conforme contrato da Crefaz |
| `uploadProposalDocument(proposalId, payload)` | `PUT /propostas/{id}/documento` | `JsonObject` | body livre conforme contrato da Crefaz |
| `updateProposalBankData(proposalId, payload)` | `POST /propostas/{id}/dados-bancarios` | `JsonObject` | body livre conforme contrato da Crefaz |

## Body de Autenticação

O método `authenticate()` não recebe body diretamente do consumidor. A SDK monta o payload a partir de `CrefazCredentials`.

```json
{
  "usuario": {
    "login": "seu-login",
    "senha": "sua-senha",
    "apiKey": "sua-api-key"
  }
}
```

Campos usados pela SDK:

- `usuario.login`
- `usuario.senha`
- `usuario.apiKey`

## Rotas Assíncronas

As rotas assíncronas compartilham a mesma exigência local da SDK: o body precisa conter `operacao.urlNotificacao` como string não vazia. Essa validação acontece em [src/client.ts](src/client.ts).

Tipo público exposto:

```ts
type CrefazAsyncPayload = JsonObject & {
  readonly operacao: {
    readonly urlNotificacao: string
  }
}
```

Se `operacao.urlNotificacao` estiver ausente ou vazio, a SDK lança `ValidationError` antes de enviar a requisição.

### 1. `preAnalyseProposal(payload)`

Endpoint: `POST /propostas/pre-analise`

Exemplo documentado na Crefaz:

```json
{
  "cliente": {
    "cpf": "12345678911",
    "nome": "Jose Silva Santos",
    "nascimento": "1974-07-10"
  },
  "profissional": {
    "ocupacaoId": 1
  },
  "contato": {
    "telefone": "449999699999"
  },
  "endereco": {
    "logradouro": "Rua Rui Barbosa",
    "bairro": "Limoeiro",
    "cep": "63080000",
    "cidadeId": "1762"
  },
  "operacao": {
    "urlNotificacao": "https://sua-aplicacao.exemplo/webhooks/crefaz"
  }
}
```

Campos descritos na documentação consolidada:

- `cliente.cpf`: obrigatório
- `cliente.nome`: obrigatório
- `cliente.nascimento`: obrigatório
- `profissional.ocupacaoId`: obrigatório
- `contato.telefone`: obrigatório
- `endereco.cidadeId`: obrigatório
- `endereco.logradouro`, `endereco.bairro`, `endereco.cep`: opcionais
- `operacao.urlNotificacao`: obrigatório

### 2. `selectOfferedProduct(proposalId, productId, payload)`

Endpoint: `PUT /propostas/{id}/produtos-ofertados/{produtoId}`

A SDK trata o body como `CrefazAsyncPayload`. A documentação consolidada confirma que essa rota é assíncrona, então `operacao.urlNotificacao` continua obrigatório.

Observação:

- o shape completo do body depende do produto e da etapa anterior da proposta;
- a SDK não impõe outros campos além de `operacao.urlNotificacao`.

### 3. `submitCreditProposal(proposalId, payload)`

Endpoint: `PUT /propostas/{id}/proposta-credito`

Essa rota finaliza ou atualiza a proposta e também é assíncrona. O contrato mínimo garantido pela SDK continua sendo:

```json
{
  "operacao": {
    "urlNotificacao": "https://sua-aplicacao.exemplo/webhooks/crefaz"
  }
}
```

Observação:

- a documentação consolidada confirma que o restante do body depende do produto e dos dados complementares exigidos pela proposta.

### 4. `consultVehicleOfferedProducts(proposalId, payload)`

Endpoint: `PUT /proposta/{id}/produtos-ofertados/consultar`

Rota assíncrona usada para consulta de produtos ofertados no fluxo de veículo. O requisito mínimo garantido pela SDK é:

```json
{
  "operacao": {
    "urlNotificacao": "https://sua-aplicacao.exemplo/webhooks/crefaz"
  }
}
```

### 5. `authorizeMarginConsultation(proposalId, payload)`

Endpoint: `POST /propostas/{id}/autorizacao-consulta`

Exemplo documentado na Crefaz:

```json
{
  "contato": {
    "telefone": "2199462000"
  },
  "operacao": {
    "urlNotificacao": "https://sua-aplicacao.exemplo/webhooks/crefaz"
  }
}
```

Campos documentados:

- `contato.telefone`: obrigatório
- `operacao.urlNotificacao`: obrigatório na SDK e na API assíncrona

Observação importante:

- a documentação da Crefaz indica que essa rota pode gerar múltiplos webhooks até chegar ao resultado final.

## Rotas com Body Livre (`JsonObject`)

Nestas rotas, a SDK não valida o shape do request antes do envio. O contrato efetivo vem da API da Crefaz.

### 6. `findCities(payload)`

Endpoint: `POST /enderecos/cidades`

O body é um `JsonObject`. A SDK apenas envia o payload e valida o response.

Exemplo de uso coerente com a documentação pública:

```json
{
  "endereco": {
    "nomeCidade": "Londrina",
    "uf": "PR"
  }
}
```

### 7. `calculateDueDate(proposalId, payload)`

Endpoint: `POST /propostas/{id}/calculo-vencimento`

Exemplo documentado na Crefaz:

```json
{
  "produto": {
    "id": 4,
    "convenio": {
      "id": null
    },
    "tabelaJuros": {
      "id": 521
    }
  },
  "operacao": {
    "vencimento": null,
    "diaRecebimentoId": -5
  }
}
```

Campos documentados:

- `produto.id`: obrigatório
- `produto.convenio.id`: em alguns fluxos, enviar `null`
- `produto.tabelaJuros.id`: obrigatório
- `operacao.vencimento`: pode ser `null`, conforme o fluxo
- `operacao.diaRecebimentoId`: opcional

### 8. `getCreditLimit(proposalId, payload)`

Endpoint: `POST /propostas/{id}/limite-credito`

Campos documentados pela Crefaz para esse body:

- `produto.id`: obrigatório
- `produto.convenio.id`: em alguns fluxos, enviar `null`
- `produto.tabelaJuros.id`: obrigatório
- `operacao.vencimento`: obrigatório
- `operacao.diaRecebimentoId`: opcional
- `operacao.valorRenda`: obrigatório
- `operacao.recalculo`: pode ser `null`

Observação:

- a documentação consolidada informa que `valorRenda` e `tabelaJuros` podem vir do webhook final da rota `authorizeMarginConsultation`.

### 9. `simulateOffer(proposalId, payload)`

Endpoint: `POST /propostas/{id}/simulacao-credito`

Observações documentadas:

- usado para obter parcelas a partir de um valor selecionado;
- em alguns fluxos, `tipoCalculo` deve ser `0`;
- em alguns fluxos, `convenio.id` deve ser `null`.

Como a SDK expõe `JsonObject`, o shape final depende do produto negociado.

### 10. `listRequiredDocuments(payload)`

Endpoint: `POST /Propostas/tipos-documentos`

Exemplo documentado na Crefaz:

```json
{
  "proposta": {
    "id": 1028773808
  },
  "operacao": {
    "tipoModalidade": 2,
    "tipoRenda": 0
  }
}
```

Campos documentados:

- `proposta.id`: obrigatório
- `operacao.tipoModalidade`: obrigatório
- `operacao.tipoRenda`: opcional

### 11. `uploadProposalDocument(proposalId, payload)`

Endpoint: `PUT /propostas/{id}/documento`

Exemplo documentado na Crefaz:

```json
{
  "documento": {
    "id": 1,
    "conteudo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABg....."
  }
}
```

Campos documentados:

- `documento.id`: obrigatório
- `documento.conteudo`: obrigatório

Observação:

- a documentação da Crefaz exige conteúdo em Base64 com prefixo MIME, como `data:image/jpeg;base64,`.

### 12. `updateProposalBankData(proposalId, payload)`

Endpoint: `POST /propostas/{id}/dados-bancarios`

O body é livre na SDK e deve seguir o contrato vigente da Crefaz para atualização de dados bancários.

Como referência de resposta, a SDK expõe `ProposalBankDataResponse` com os campos:

- `bancoId`
- `agencia`
- `digito`
- `numero`
- `conta`
- `tipoConta`
- `tempoConta`

## Webhooks

O parser público é `parseWebhookNotification(value)` e ele aceita o payload bruto enviado pela Crefaz ou recuperado do fallback de processamento.

O shape normalizado retornado pela SDK é:

```ts
interface WebhookNotification {
  readonly evento: {
    readonly nome: string
    readonly id: number | null
    readonly status: 'sucesso' | 'erro' | null
    readonly mensagens: readonly string[] | null
    readonly detalhes: JsonObject | null
  }
}
```

### Regras de normalização da SDK

- `evento.nome` deve ser string;
- `evento.id` pode ser `number` ou `null`;
- `evento.status` só pode ser `sucesso`, `erro` ou `null`;
- `evento.mensagens` pode vir como string única, array de strings ou `null`;
- a SDK sempre normaliza string única para array com um item;
- `evento.detalhes` precisa ser objeto JSON ou `null`.

### Tipos de webhook documentados pela Crefaz

#### Webhook de Processo

Usado para resultado de rotas assíncronas.

Características:

- normalmente traz `evento.id` com o `processoId`;
- `evento.status` tende a vir como `sucesso` ou `erro`;
- `evento.detalhes` contém o resultado da operação executada;
- pode ser consultado de novo pelo fallback `GET /propostas/processamento/{processoId}`.

Exemplo de sucesso:

```json
{
  "evento": {
    "nome": "Processo",
    "id": 1,
    "status": "sucesso",
    "mensagens": "Processado com sucesso",
    "detalhes": {
      "proposta": {
        "id": 7000307,
        "aprovado": true
      }
    }
  }
}
```

Exemplo de erro:

```json
{
  "evento": {
    "nome": "Processo",
    "id": 25,
    "status": "erro",
    "mensagens": "Falha de comunicacao com o Motor de Credito. Tente novamente mais tarde.",
    "detalhes": null
  }
}
```

#### Webhook de Status

Usado para alteração de status da proposta.

Características:

- `evento.id` pode vir como `null`;
- `evento.status` pode vir como `null`;
- `evento.detalhes.proposta.situacaoDescricao` concentra o estado atualizado da proposta;
- não usa o fallback de `processoId` da mesma forma que o webhook de processo.

Exemplo de atualização de status:

```json
{
  "evento": {
    "id": null,
    "nome": "atualizacao-status-proposta",
    "status": null,
    "mensagens": null,
    "detalhes": {
      "proposta": {
        "id": 7000307,
        "situacaoDescricao": {
          "nome": "Selecao Oferta",
          "observacoes": null,
          "motivos": [],
          "usuario": {
            "login": null
          }
        }
      }
    }
  }
}
```

Exemplo de pendência:

```json
{
  "evento": {
    "id": null,
    "nome": "atualizacao-status-proposta",
    "status": null,
    "mensagens": null,
    "detalhes": {
      "proposta": {
        "id": 1028820935,
        "situacaoDescricao": {
          "nome": "Proposta Pendente",
          "observacoes": "observacao do analista",
          "motivos": [
            {
              "id": 6,
              "nome": "Pendente documento"
            },
            {
              "id": 36,
              "nome": "Data de nascimento divergente "
            }
          ],
          "usuario": {
            "login": "Augusto Cedaro"
          }
        }
      }
    }
  }
}
```

## Relação entre Webhook e Fallback

Para rotas assíncronas, o fluxo esperado é:

1. a SDK envia o body com `operacao.urlNotificacao`;
2. a Crefaz responde `202 Accepted` com `data.processo.id`;
3. o parceiro armazena esse `processo.id`;
4. o resultado final chega por webhook de processo;
5. se o webhook não chegar, a aplicação pode consultar `getProcessingStatus(processId)` ou `waitForProcessing(processId, options?)`.

Importante:

- segundo a documentação consolidada, o fallback se aplica ao webhook de processo;
- para webhooks de status, a consulta complementar depende do fluxo específico da proposta, não do `processoId`.

## Fontes

- [src/client.ts](src/client.ts)
- [src/modules/proposals/contracts.ts](src/modules/proposals/contracts.ts)
- [knowledge/CREFAZ.md](knowledge/CREFAZ.md)
- [knowledge/EVENTS.md](knowledge/EVENTS.md)
