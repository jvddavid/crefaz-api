# CREFAZ API Parceiro V2

Este arquivo consolida o texto recuperado da documentacao publica da Crefaz em 1 de junho de 2026.

## Fonte indice

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/documentacao-api-parceiro-v2-rfl3whkRcw

Texto recuperado:

# Documentacao Api Parceiro - V2

## Documentos

- Primeiros Passos
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/primeiros-passos-J6CPVKWqRZ
- Processamento Assincrono
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/processamento-assincrono-WfuVvRHocC
- Webhook
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/webhook-iVRiFeLkgP
- GET - Consulta Processamento (Fallback)
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/get-consulta-processamento-fallback-ZFfUI4L79h
- Proposta
  O indice exibiu a URL de forma truncada como:
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/proposta-aqijkgz...

Observacao:
- A URL completa da pagina Proposta nao foi exposta integralmente pelo indice recuperado.
- As tentativas de acesso direto a variacoes da URL retornaram not found ou too many requests.

---

## Primeiros Passos

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/primeiros-passos-J6CPVKWqRZ

Texto recuperado:

# Primeiros Passos

## Introducao

Bem-vindo a API 2.0 Parceiros. Esta nova versao representa uma evolucao significativa em termos de arquitetura e experiencia de desenvolvimento.

## O que mudou na V2?

A V2 implementa uma arquitetura de microsservicos em .NET baseada em Clean Architecture, trazendo melhorias estruturais e funcionais importantes.

### Principais Mudancas

Padronizacao RESTful
- V1: api/Usuario/login
- V2: api/v2/usuarios/login
- Todas as rotas seguem convencoes RESTful consistentes

Processamento Assincrono
- Rotas criticas operam de forma assincrona
- Resposta imediata com HTTP 202 (Accepted)
- Notificacao via webhook ao termino do processamento
- Maior resiliencia e performance do sistema

Webhooks Aprimorados
- Entrega do payload completo da operacao
- Nao apenas notificacoes de mudanca de status
- Visibilidade total dos resultados processados

## Dominios API Parceiros

- O dominio para chamadas de endpoints, no ambiente de homologacao e:
  https://api-externo-stag.crefazon.com.br/api/v2
- O dominio para chamadas de endpoints, no ambiente de producao e:
  https://api-externo.crefazon.com.br/api

## Autenticacao

Para autenticar na API V2, voce precisara de:
- Login e senha do usuario autorizado
- API Key, que deve ser solicitada ao Gerente Comercial ou Supervisor responsavel

Importante:
- Os tokens de acesso possuem validade de 12 horas
- Deve ser implementado um mecanismo de renovacao automatica de tokens

O primeiro passo e obter um token de acesso atraves da rota de autenticacao:

Endpoint:
POST /usuarios/login

Exemplo de requisicao:

```bash
curl -X POST 'https://api-externo-stag.crefazon.com.br/api/v2/usuarios/login' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
  "usuario": {
    "login": "string",
    "senha": "string",
    "apiKey": "string"
  }
}'
```

Response de sucesso:

```json
{
  "autenticacao": {
    "usuarioId": 87896,
    "login": "treinamento",
    "token": "eyJhbGciOiJIUz...",
    "expira": "2025-09-12T00:11:42.0615601Z",
    "atualizaToken": null,
    "nome": "Fulano de tal ",
    "telefonia": "xxxxx"
  }
}
```

Response de erro:

```json
{
  "success": false,
  "data": null,
  "errors": [
    "Usuario nao cadastrado",
    "Usuario ou senha incorretos",
    "Identificador unico invalido!"
  ]
}
```

## Diagrama de processos

O diagrama tem como objetivo deixar mais clara a sequencia de acionamentos para inserir uma proposta de credito.

Referencia visivel na pagina:
- Imagem de diagrama: https://docs.cfzsistemas.com.br/images/diagrams.png
- Viewer draw.io disponibilizado na propria pagina

---

## Processamento Assincrono

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/processamento-assincrono-WfuVvRHocC

Texto recuperado:

# Processamento Assincrono

A API V2 utiliza um modelo de comunicacao assincrona para operacoes criticas, como criacao e atualizacao de propostas. Esta arquitetura, baseada em microsservicos e Apache Kafka, proporciona maior resiliencia, escalabilidade e desacoplamento entre os componentes do sistema.

## Visao Geral do Fluxo

O processo de contratacao segue tres etapas principais:
1. Envio da Proposta: o parceiro submete os dados para analise
2. Processamento Assincrono: o sistema processa a requisicao em background
3. Notificacao de Resultado: o parceiro recebe o resultado via webhook

## Rotas que Operam de Forma Assincrona

| Metodo | Rota | Finalidade | Produto |
| --- | --- | --- | --- |
| POST | /api/v2/propostas/pre-analise | Cadastra proposta e aciona Motor de Credito | Todos |
| PUT | /api/v2/propostas/{id}/produtos-ofertados/{produtoId} | Seleciona oferta do cliente e aciona Motor de Credito | Todos exceto informacao truncada na pagina recuperada |
| PUT | /api/v2/propostas/{id}/proposta-credito | Envia proposta para Mesa de Analise e aciona Motor de Credito | Todos |
| PUT | /api/v2/proposta/{id}/produtos-ofertados/consultar | Envia placa do veiculo para consulta ao Motor de Credito | CP Auto |
| POST | /api/v2/propostas/{id}/autorizacao-consulta | Envia autorizacao para consulta de margem e consulta motor de credito | Credito ao Trabalhador |

### Requisitos para Rotas Assincronas

Ao acionar qualquer rota assincrona, observe os seguintes requisitos:
- Campo obrigatorio: urlNotificacao
- URL do webhook onde o resultado sera enviado apos o processamento

Exemplo de request documentado:

```json
{
  "cliente": {
    "cpf": "435.901.808-89",
    "nome": "Nome do cliente",
    "nascimento": "1974-07-10"
  },
  "profissional": {
    "ocupacaoId": 1
  },
  "contato": {
    "telefone": "44999167734"
  },
  "endereco": {
    "logradouro": "Rua Rui Barbosa",
    "bairro": "Limoeiro",
    "cep": "63080000",
    "cidadeId": "1762"
  },
  "operacao": {
    "urlNotificacao": "null"
  }
}
```

### Resposta Imediata

Todas as rotas assincronas retornam imediatamente o status HTTP 202 (Accepted), indicando que a solicitacao foi recebida e esta sendo processada em background.

Estrutura da resposta:

```json
{
  "success": true,
  "data": {
    "processo": {
      "id": 2603,
      "mensagem": "Informacoes recebidas. Voce sera notificado via webhook quando o processamento for concluido"
    },
    "proposta": {
      "id": 707770
    }
  },
  "errors": null
}
```

Campos retornados:
- id (processoId): identificador unico do processamento, utilizado para consultas posteriores
- mensagem: confirmacao de recebimento

### Notificacao via Webhook

Ao concluir o processamento, o sistema envia automaticamente o resultado completo para a URL configurada em urlNotificacao.

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

## Etapa 3: Consulta de Status (Fallback)

A rota de consulta funciona como mecanismo complementar ao webhook. Utilize-a caso nao receba a notificacao devido a falhas de comunicacao ou instabilidades.

Endpoint:
GET /api/v2/propostas/processamento/{processoId}

Parametro:
- processoId: ID retornado na resposta 202 Accepted

Retorna o mesmo JSON enviado via webhook com todos os detalhes da operacao.

## Boas Praticas de Implementacao

### Endpoint de Webhook
- Implemente um endpoint robusto para receber notificacoes POST com payload JSON
- Configure timeout adequado, recomendado minimo de 30 segundos

### Tratamento de Falhas
- Sempre implemente o mecanismo de consulta via GET como fallback
- Configure retry logic para casos onde o webhook nao seja recebido
- Armazene o processoId para consultas posteriores
- O sistema garante que cada mensagem sera processada apenas uma vez
- Utilize o processoId para rastrear e evitar processamento duplicado em sua aplicacao

---

## Webhook

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/webhook-iVRiFeLkgP

Texto recuperado:

# Webhook

O webhook na API V2 e o mecanismo principal de comunicacao utilizado para notificar os parceiros sobre o resultado final de requisicoes processadas de forma assincrona, garantindo resiliencia e desacoplamento do sistema.

## Quando e Por Que o Webhook e Acionado

O webhook esta integrado a arquitetura de comunicacao assincrona da V2, que utiliza Apache Kafka para processamento em background.

### Momentos de Acionamento

O webhook e disparado em dois cenarios principais:
1. Alteracao de Status da Proposta
   - comportamento padrao mantido da versao anterior
   - acionado sempre que o status de uma proposta e alterado no sistema
2. Conclusao de Processamento Assincrono
   - comportamento especifico da V2
   - acionado apos a conclusao do processamento em background de rotas criticas que envolvem o motor de credito

### Tipos de Webhook

A API V2 trabalha com dois tipos distintos de notificacao via webhook, diferenciados pela estrutura do payload:

Webhook de Processo, evento "Processo"
- utilizado para notificar o resultado de operacoes assincronas
- acionado apos a conclusao do processamento em background de rotas criticas
- retorna o response completo da operacao executada

Webhook de Status, evento "Status"
- utilizado para notificar alteracoes no status da proposta
- acionado sempre que uma proposta tem seu status modificado no sistema
- retorna informacoes sobre a nova situacao da proposta, incluindo observacoes e motivos

### Razao do Modelo Assincrono

Rotas como POST /api/v2/propostas/pre-analise dependem de sistemas externos que podem levar tempo significativo para responder. Para evitar timeouts e garantir escalabilidade durante picos de requisicao, a V2 adota processamento assincrono.

Fluxo de execucao:
1. Parceiro envia requisicao, exemplo POST /api/v2/propostas/pre-analise
2. API responde imediatamente com HTTP 202 (Accepted)
3. Requisicao e processada em background
4. Webhook e acionado posteriormente com o resultado completo da operacao

### Requisito Obrigatorio

O campo urlNotificacao e obrigatorio em todas as rotas assincronas a partir da V2. Este campo contem a URL do endpoint que recebera as notificacoes do webhook.

## Estrutura do Payload

Na V2, o webhook de processo foi redesenhado para entregar nao apenas o status da proposta, mas o resultado completo da operacao executada. Todas as notificacoes seguem uma estrutura padronizada encapsulada no objeto evento.

Campos do payload:

| Campo | Tipo | Descricao |
| --- | --- | --- |
| evento | Objeto | Contenedor principal da notificacao |
| evento.nome | String | Nome do processo, exemplo Processo ou Status |
| evento.id | Number | ID de rastreamento do processamento, processoId |
| evento.status | String | Status final, sucesso ou erro |
| evento.mensagens | String | Mensagem descritiva do resultado |
| evento.detalhes | Object | Response completo da rota executada. Conteudo varia conforme a operacao |

## Exemplos de Notificacao

Exemplo A: Processamento concluido com sucesso

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

Exemplo B: Atualizacao de status

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

Exemplo C: Pendencia da proposta

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

Exemplo D: Falha no processamento

Erro generico de processamento:

```json
{
  "evento": {
    "nome": "Processo",
    "id": 10,
    "status": "erro",
    "mensagens": "Falha no processamento dos dados.",
    "detalhes": null
  }
}
```

Falha de comunicacao com o Motor Credito:

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

## Implementacao do Endpoint de Webhook

### Requisitos Tecnicos

Seu endpoint de webhook deve atender aos seguintes requisitos:
- Aceitar requisicoes POST via HTTPS
- Processar payload JSON
- Header esperado: Content-Type: application/json

## Mecanismos de Resiliencia: Rota de Consulta (Fallback)

O webhook e o mecanismo principal, mas falhas de rede podem impedir seu recebimento. A API V2 oferece uma rota complementar para consultar o resultado do processamento.

Endpoint:
GET /api/v2/propostas/processamento/{processoId}

Utilizacao:
- Armazene o processoId retornado na resposta 202 Accepted inicial
- Utilize-o para consultar o status caso o webhook nao seja recebido

Importante:
- Esta rota de consulta aplica-se apenas aos webhooks de processo
- Para webhooks de status, consulte diretamente a rota de detalhes da proposta

---

## GET - Consulta Processamento (Fallback)

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/get-consulta-processamento-fallback-ZFfUI4L79h

Texto recuperado:

# GET - Consulta Processamento (Fallback)

### Endpoint

/api/v2/propostas/processamento/{processoId}

- Endpoint de resiliencia caso o servico de Webhook falhe
- Atraves dele e possivel consultar o status de um processoId

### Exemplo Request Sucesso

/api/v2/propostas/processamento/{12345}

### Exemplo Response Sucesso

```json
{
  "success": true,
  "data": {
    "evento": {
      "id": 12345,
      "nome": "processo",
      "status": "sucesso",
      "mensagens": [
        "Processado com sucesso!"
      ],
      "detalhes": {
        "proposta": {
          "id": 102877xxxx,
          "aprovado": true
        }
      }
    }
  },
  "errors": null
}
```

---

## Proposta

URL descoberta pelo browser MCP:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/proposta-aqijkgz8bb

Texto visivel recuperado:

# Proposta

A pagina principal de Proposta foi carregada no browser MCP, mas o conteudo textual central apareceu praticamente vazio na arvore acessivel. Ainda assim, a navegacao renderizada revelou os documentos filhos da secao.

### Documentos filhos visiveis em Proposta

- Contexto
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/contexto-DU3C8irXtJ
- Endereco
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/endereco-oK1WZMA8pJ
- Produtos
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/produtos-DkapeQbVV4
- PUT - Cancelamento de Proposta
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-cancelamento-de-proposta-G73flq1dPH

---

## Contexto

URL descoberta pelo browser MCP:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/contexto-DU3C8irXtJ

Texto visivel recuperado:

# Contexto

## Rotas de Contexto

As rotas de contexto sao endpoints especializados da API Parceiros projetados para fornecer dados de referencia essenciais a integracao. Estas rotas disponibilizam listas de opcoes, enumeradores e informacoes estruturadas necessarias para o correto preenchimento e validacao de propostas.

## Finalidade e Caracteristicas

Objetivo Principal

As rotas de contexto servem como catalogos de dados de referencia, retornando informacoes estruturadas que definem as opcoes validas para diversos campos utilizados nas operacoes da API. Elas eliminam a necessidade de hardcoding de valores na aplicacao do parceiro, garantindo sempre o uso de dados atualizados.

Caracteristicas Principais
- Dados estaticos e semi-estaticos: retornam informacoes que raramente mudam, como listas de ocupacoes, estados civis e graus de instrucao
- Validacao de entrada: fornecem os valores aceitos pela API, permitindo validacao no lado do cliente antes do envio
- Independencia de autenticacao: algumas rotas de contexto podem nao exigir autenticacao, verifique a documentacao especifica de cada endpoint
- Performance: dados podem ser armazenados em cache local para otimizacao

## Contextos Disponiveis

### Ocupacoes

Retorna a lista completa de ocupacoes profissionais aceitas pelo sistema.

Utilizacao: preenchimento do campo de ocupacao do cliente na proposta.

Exemplos de dados retornados:
- Assalariado CLT
- Autonomo
- Empresario
- Aposentado/Pensionista

### Grau de Instrucao

Lista os niveis de escolaridade aceitos pelo sistema.

Utilizacao: preenchimento do campo de escolaridade do cliente.

Exemplos de dados retornados:
- Ensino Fundamental Incompleto
- Ensino Medio Completo
- Ensino Superior Completo
- Pos-Graduacao

### Contexto de Proposta

Fornece enumeradores e opcoes especificas relacionadas ao processo de propostas.

Utilizacao: validacao de status, tipos de produtos, formas de pagamento, entre outros.

Exemplos de dados retornados:
- Status possiveis de proposta
- Tipos de produtos disponiveis
- Modalidades de contratacao

---

## Endereco

URL descoberta pelo browser MCP:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/endereco-oK1WZMA8pJ

Texto visivel recuperado:

# Endereco

## Rotas de Endereco

As rotas sao de uso obrigatorio para que o usuario da API obtenha informacoes sobre o endereco do cliente, mais especificamente o cidadeId, id retornado pelo banco de dados, necessario nas demais integracoes e endpoints dessa API.

### Documentos filhos visiveis em Endereco

- POST - Consultar Id Cidade
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-consultar-id-cidade-CXZuHObwtj
- GET - Listar Id Pais
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/get-listar-id-pais-5SJxBafL9x

### POST - Consultar Id Cidade

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-consultar-id-cidade-CXZuHObwtj

Endpoint:
api/v2/enderecos/cidades

Descricao:
Consulta realizada para se obter o cidadeId dos dados enviados.

Request:

```json
{ "endereco": { "nomeCidade": "string", "uf": "string" } }
```

Response exemplo sucesso:

```json
{ "endereco": [ { "cidadeId": 5320, "nomeCidade": "Sao Paulo", "codigoIBGE": 3550308, "ufId": 25, "uf": "SP" } ] }
```

Response exemplo erro:

```json
{ "success": false, "data": null, "errors": [ "Nenhum registro encontrado!" ] }
```

Pontos importantes:
- O campo nomeCidade e case sensitive, portanto requer atencao a acentos e forma de escrita
- O cidadeId e a chave de endereco para os endpoints de lancamento de proposta

### GET - Listar Id Pais

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/get-listar-id-pais-5SJxBafL9x

Endpoint:
api/v2/enderecos/paises

Descricao:
Consulta realizada para se obter o paisId.

Response exemplo sucesso:

```json
{ "paises": [ { "id": 1, "nome": "Brasil", "alfa2": "BR", "alfa3": "BRA", "ativo": true } ] }
```

Sugestao da documentacao:
- Deixar o valor paisId = 1 fixo no codigo, visto que sempre vai ser esse

---

## Produtos

URL descoberta pelo browser MCP:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/produtos-DkapeQbVV4

Texto visivel recuperado:

# Produtos

A pagina principal de Produtos foi carregada, mas o texto central veio praticamente vazio na arvore acessivel. Ainda assim, o browser MCP revelou os submodulos e seus endpoints principais.

### Modulos filhos visiveis em Produtos

- Energia
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/energia-55KgSoIXSP
- Credito do Trabalhador
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/credito-do-trabalhador-KkvARqLXwO
- CP Auto
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/cp-auto-we97ZoafXO
- CDC Energia
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/cdc-energia-8v47KPAQQT

---

## Energia

URL descoberta pelo browser MCP:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/energia-55KgSoIXSP

Texto visivel recuperado:

# Energia

O browser MCP revelou a lista de documentos da jornada do produto Energia.

### Documentos filhos visiveis em Energia

- POST - Criar Proposta/Pre-Analise
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-criar-propostapre-analise-cygoF57q4E
- GET - Listar Produtos/Ofertas Disponiveis
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/get-listar-produtosofertas-disponiveis-BqIbbSxDUF
- POST - Calcular Vencimento
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-calcular-vencimento-TR769mQei2
- POST - Consultar Valor Limite Cliente
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-consultar-valor-limite-cliente-WnB614Nf7K
- POST - Simular Oferta Cliente
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-simular-oferta-cliente-fO58FYAMlg
- PUT - Selecionar Oferta Cliente
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-selecionar-oferta-cliente-cJopuWfsCV
- POST - Listar Documentos Para Anexar
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-listar-documentos-para-anexar-zYUvEzeuR6
- PUT - Upload Documentos Proposta
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-upload-documentos-proposta-QiMvZWzJjY
- PUT - Finalizar Proposta / Atualizar Proposta
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-finalizar-proposta-atualizar-proposta-RZawnPzOMp

### POST - Criar Proposta/Pre-Analise

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-criar-propostapre-analise-cygoF57q4E

Endpoint:
/api/v2/propostas/pre-analise

Observacoes da pagina:
- Rota assincrona
- Endpoint usado para criar uma nova proposta de credito dentro da Crefaz
- Primeira validacao no motor de credito, indicando se o cliente esta pre-aprovado ou nao

Exemplo request documentado:

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
    "urlNotificacao": "null"
  }
}
```

Exemplo response sucesso do endpoint:

```json
{
  "success": true,
  "data": {
    "processo": {
      "id": 2603,
      "mensagem": "Informacoes recebidas. Voce sera notificado via webhook quando o processamento for concluido"
    },
    "proposta": {
      "id": 707770
    }
  },
  "errors": null
}
```

Exemplo response sucesso via webhook:

```json
{
  "evento": {
    "nome": "processo",
    "id": 1,
    "status": "mensagem de status",
    "mensagens": ["mensagens de info / erros"],
    "detalhes": {
      "proposta": {
        "id": 7000307,
        "aprovado": true
      }
    }
  }
}
```

Campos descritos na pagina:
- cliente.cpf: string, obrigatorio
- cliente.nome: string, obrigatorio
- cliente.nascimento: string, obrigatorio
- profissional.ocupacaoId: int, obrigatorio
- contato.telefone: string, obrigatorio
- endereco.logradouro: string, nao obrigatorio
- endereco.bairro: string, nao obrigatorio
- endereco.cep: string, nao obrigatorio
- endereco.cidadeId: int, obrigatorio
- operacao.urlNotificacao: string, obrigatorio

### GET - Listar Produtos/Ofertas Disponiveis

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/get-listar-produtosofertas-disponiveis-BqIbbSxDUF

Endpoint:
/api/v2/propostas/{id}/produtos-ofertados

Observacoes da pagina:
- Lista todos os produtos disponiveis para a proposta obtida
- Traz dados adicionais dos produtos, quando houver
- A documentacao chama atencao para o campo valorRendaPresumida no final do response, necessario nas proximas rotas

Exemplo request:
- https://api-externo-stag.crefazon.com.br/api/v2/Propostas/1028773808/produtos-ofertados

Exemplo response sucesso:
- retorna produtos, convenios, dados adicionais, tabelas de juros, dias de recebimento e bloqueios
- o exemplo da pagina mostra produtos como Energia e CP Auto
- o objeto proposta no response inclui cpf, nome e valorRendaPresumida

### POST - Calcular Vencimento

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-calcular-vencimento-TR769mQei2

Endpoint:
api/v2/propostas/{id}/calculo-vencimento

Observacoes da pagina:
- Responsavel por calcular o primeiro vencimento disponivel para a proposta
- Vencimentos diferem de acordo com as regras de cada produto

Exemplo request:

```json
{
  "produto": {
    "id": 6,
    "convenio": {
      "id": 5041
    },
    "tabelaJuros": {
      "id": 477
    }
  },
  "operacao": {
    "vencimento": null,
    "diaRecebimentoId": -5
  }
}
```

Exemplo response sucesso:

```json
{
  "success": true,
  "data": {
    "vencimento": [
      {
        "data": "2025-12-11"
      }
    ]
  },
  "errors": null
}
```

Campos descritos na pagina:
- produto.id: int, obrigatorio
- convenio.id: int, obrigatorio
- tabelaJuros.id: int, obrigatorio
- operacao.vencimento: string, obrigatorio, enviar null
- operacao.diaRecebimentoId: int, nao obrigatorio

### POST - Consultar Valor Limite Cliente

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-consultar-valor-limite-cliente-WnB614Nf7K

Endpoint:
api/v2/propostas/{id}/limite-credito

Observacoes da pagina:
- Retorna o valor limite que o cliente pode solicitar de credito
- Inclui valor total maximo e valor maximo da parcela

Exemplo request:

```json
{
  "produto": {
    "id": 6,
    "convenio": {
      "id": 5
    },
    "tabelaJuros": {
      "id": 326
    }
  },
  "operacao": {
    "diaRecebimentoId": -5,
    "valorRenda": 2028.02,
    "recalculo": null,
    "vencimento": "2026-01-05"
  }
}
```

Exemplo response sucesso:

```json
{
  "success": true,
  "data": {
    "valorLimite": {
      "valorMaximoSolicitado": 2890.97,
      "valorMaximoParcela": 507.01,
      "valorMinimoParcela": 0.0
    }
  },
  "errors": null
}
```

Campos descritos na pagina:
- produto.id: int, obrigatorio
- convenio.id: int, obrigatorio
- tabelaJuros.id: int, obrigatorio
- operacao.vencimento: string, obrigatorio
- operacao.diaRecebimentoId: int, nao obrigatorio
- operacao.valorRenda: int, obrigatorio
- operacao.recalculo: string, nao obrigatorio

### POST - Simular Oferta Cliente

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-simular-oferta-cliente-fO58FYAMlg

Endpoint:
api/v2/propostas/{id}/simulacao-credito

Observacoes da pagina:
- Traz o valor da parcela e a quantidade de prestacoes de acordo com o valor solicitado

Exemplo request:

```json
{
  "produto": {
    "id": 6,
    "convenio": {
      "id": 5041
    },
    "tabelaJuros": {
      "id": 477
    }
  },
  "operacao": {
    "vencimento": "2025-12-11",
    "diaRecebimentoId": -5,
    "valor": 1800,
    "valorRenda": 1518.0,
    "tipoCalculo": 0
  }
}
```

Exemplo response sucesso:

```json
{
  "success": true,
  "data": {
    "proposta": {
      "id": 6,
      "tipoCalculo": 0,
      "tabelaJuros": {
        "id": 477
      },
      "operacao": {
        "valorSolicitado": 1800.0,
        "valorParcela": null
      },
      "prazoValor": [
        {
          "prazo": 24,
          "valorParcela": 270.57
        },
        {
          "prazo": 22,
          "valorParcela": 274.35
        }
      ]
    }
  },
  "errors": null
}
```

Campos descritos na pagina:
- produto.id: int, obrigatorio
- convenio.id: int, obrigatorio
- tabelaJuros.id: int, obrigatorio
- operacao.vencimento: string, obrigatorio
- operacao.diaRecebimentoId: int, nao obrigatorio
- operacao.valor: int, obrigatorio
- operacao.valorRenda: int, obrigatorio
- operacao.tipoCalculo: int, obrigatorio

Regra de negocio documentada:
- tipoCalculo aceita 2 valores possiveis, validados na rota de contexto GET - Proposta
- tipoCalculo = 0: simula os valores de parcela de acordo com o valor total contratado
- tipoCalculo = 1: simula de acordo com o valor de parcela desejado pelo cliente

### PUT - Selecionar Oferta Cliente

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-selecionar-oferta-cliente-cJopuWfsCV

Endpoint:
/api/v2/propostas/{id}/produtos-ofertados/{produtoId}

Observacoes da pagina:
- Rota assincrona
- Seleciona o valor de prestacao e a quantidade de parcelas do cliente
- Informa os dados da fatura de energia do cliente
- Ocorre a segunda validacao do cliente no Motor de Credito

Exemplo request:

```json
{
  "produto": {
    "convenio": {
      "id": 5041,
      "dadosAdicionais": [
        {
          "convenioDadosId": 22089,
          "valor": "1804030",
          "convenioId": 5041
        },
        {
          "convenioDadosId": 22090,
          "valor": "2025-09-04",
          "convenioId": 5041
        }
      ]
    }
  },
  "operacao": {
    "tabelaJuros": {
      "id": 477
    },
    "prazo": 0,
    "valorParcela": 0,
    "valorRenda": 0,
    "diaRecebimento": 0,
    "tipoRenda": 0,
    "vencimento": "2025-11-18",
    "valorSolicitado": 0,
    "tipoCalculo": 0
  }
}
```

Exemplo response sucesso do endpoint:

```json
{
  "success": true,
  "data": {
    "processo": {
      "id": 1283,
      "mensagem": "Informacoes recebidas. Voce sera notificado via webhook quando o processamento for concluido"
    }
  },
  "errors": null
}
```

Exemplo response sucesso via webhook:

```json
{
  "evento": {
    "id": 1283,
    "nome": "processo",
    "status": "sucesso",
    "mensagens": ["Processado com sucesso!"],
    "detalhes": {
      "proposta": {
        "id": 1028773808,
        "aprovado": true,
        "novoLimite": {
          "valorLimiteSolicitado": 1800,
          "valorLimiteParcela": 326.65,
          "valorLimiteMinimoParcela": 63.59
        }
      }
    }
  }
}
```

Regra de negocio documentada:
- o objeto adicionais deve ser enviado no request sempre que o produto for Energia
- esses dados sao obtidos no endpoint GET - Listar Produtos/Ofertas Disponiveis
- convenioDadosId representa os dados obrigatorios exigidos pela companhia de energia
- esse valor e extraido da fatura do cliente e usado pela Crefaz para inserir a cobranca diretamente na conta de energia

### POST - Listar Documentos Para Anexar

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-listar-documentos-para-anexar-zYUvEzeuR6

Endpoint:
/api/v2/Propostas/tipos-documentos

Observacoes da pagina:
- Lista os documentos obrigatorios para serem anexados na proposta
- Para o produto Energia, a pagina cita documento de identificacao e fatura de energia recente do cliente

Exemplo request:

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

Exemplo response sucesso:

```json
{
  "success": true,
  "data": {
    "documentosProduto": [
      {
        "id": 1,
        "produto": {
          "id": 6
        },
        "nome": "DOCUMENTO DE IDENTIFICACAO",
        "obrigatorio": true
      },
      {
        "id": 48,
        "produto": {
          "id": 6
        },
        "nome": "FATURA DE ENERGIA",
        "obrigatorio": true
      }
    ]
  },
  "errors": null
}
```

Campos descritos na pagina:
- produto.id: int, obrigatorio
- operacao.tipoModalidade: int, obrigatorio
- operacao.tipoRenda: int, nao obrigatorio

### PUT - Upload Documentos Proposta

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-upload-documentos-proposta-QiMvZWzJjY

Endpoint:
/api/v2/propostas/{id}/documento

Observacoes da pagina:
- Efetua o upload de arquivos em Base64
- E necessario utilizar o prefixo data:image/png;base64, antes do conteudo codificado

Exemplo request:

```json
{
  "documento": {
    "id": 1,
    "conteudo": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABg....."
  }
}
```

Exemplo response sucesso:

```json
{
  "success": true,
  "data": {
    "mensagem": "Upload Concluido"
  },
  "errors": null
}
```

Campos descritos na pagina:
- documento.id: int, obrigatorio
- documento.conteudo: string, obrigatorio

### PUT - Finalizar Proposta / Atualizar Proposta

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-finalizar-proposta-atualizar-proposta-RZawnPzOMp

Endpoint:
/api/v2/propostas/{id}/proposta-credito

Observacoes da pagina:
- Rota assincrona
- Completa o envio de dados na proposta
- Preenche o restante das informacoes sobre o cliente

Exemplo response sucesso do endpoint:

```json
{
  "success": true,
  "data": {
    "processo": {
      "id": 1301,
      "mensagem": "Informacoes recebidas. Voce sera notificado via webhook quando o processamento for concluido"
    }
  },
  "errors": null
}
```

Exemplo response sucesso via webhook:

```json
{
  "evento": {
    "id": 1301,
    "nome": "processo",
    "status": "sucesso",
    "mensagens": ["sucesso"],
    "detalhes": null
  }
}
```

Campos descritos na pagina incluem, entre outros:
- proposta.cliente.nome, rg, rgEmissor, rgUfId, rgEmissao, sexo, estadoCivil, nacionalidadeId, naturalidadeUfId, naturalidadeCidadeId, grauInstrucaoId, nomeMae, nomeConjuge, pep
- proposta.contatos.contato.email, telefone, telefoneExtra
- proposta.contatos.referencia.id, nome, telefone, grau
- proposta.endereco.cep, logradouro, numero, bairro, complemento, cidadeId
- proposta.bancario.bancoId, agencia, digito, numero e demais campos bancarios
- proposta.profissional, proposta.unidade e proposta.operacao conforme exemplo completo da pagina

---

## Credito do Trabalhador

URL descoberta pelo browser MCP:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/credito-do-trabalhador-KkvARqLXwO

Texto visivel recuperado:

# Credito do Trabalhador

O browser MCP revelou a lista de documentos da jornada do produto Credito do Trabalhador.

### Documentos filhos visiveis em Credito do Trabalhador

- POST - Criar Proposta/Pre-Analise
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-criar-propostapre-analise-3WWb6YsvEl
- GET - Listar Produtos/Ofertas Disponiveis
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/get-listar-produtosofertas-disponiveis-oK3HOaZOiI
- POST - Autorizacao/Consulta Cliente
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-autorizacaoconsulta-cliente-fKhZ2pXF0a
- POST - Calcular Vencimento
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-calcular-vencimento-OqdGNsiBZI
- POST - Consultar Valor Limite Cliente
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-consultar-valor-limite-cliente-VwyEixCfiZ
- POST - Simular Oferta Cliente
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-simular-oferta-cliente-E4jstQOqWf
- PUT - Selecionar Oferta Cliente
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-selecionar-oferta-cliente-da3ASTzXGL
- PUT - Finalizar Proposta / Atualizar Proposta
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-finalizar-proposta-atualizar-proposta-4kqkwkVlUg
- GET - Consulta Link Assinatura
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/get-consulta-link-assinatura-W87tSGir76
- Reapresentacao de Pagamento
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/reapresentacao-de-pagamento-o2RVrdhl2f

### POST - Criar Proposta/Pre-Analise

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-criar-propostapre-analise-3WWb6YsvEl

Endpoint:
/api/v2/propostas/pre-analise

Observacoes da pagina:
- Rota assincrona
- Endpoint usado para criar uma nova proposta de credito dentro da Crefaz
- Primeira validacao no motor de credito, indicando se o cliente esta pre-aprovado ou nao
- Para este produto, a pagina orienta enviar profissional.ocupacaoId = 1

Exemplo response sucesso do endpoint:

```json
{
  "success": true,
  "data": {
    "processo": {
      "id": 3962,
      "mensagem": "Informacoes recebidas. Voce sera notificado via webhook quando o processamento for concluido"
    },
    "proposta": null
  },
  "errors": null
}
```

Campos descritos na pagina:
- cliente.cpf, cliente.nome, cliente.nascimento: obrigatorios
- profissional.ocupacaoId: obrigatorio
- contato.telefone: obrigatorio
- endereco.logradouro, bairro, cep: nao obrigatorios
- endereco.cidadeId: obrigatorio
- operacao.urlNotificacao: obrigatorio

### GET - Listar Produtos/Ofertas Disponiveis

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/get-listar-produtosofertas-disponiveis-oK3HOaZOiI

Endpoint:
/api/v2/propostas/{id}/produtos-ofertados

Observacoes da pagina:
- Lista os produtos disponiveis para a proposta obtida
- Traz dados adicionais, quando houver
- O exemplo mostra Consignado Privado com controleRenda = 1 e valorRendaPresumida na proposta

### POST - Autorizacao/Consulta Cliente

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-autorizacaoconsulta-cliente-fKhZ2pXF0a

Endpoint:
/api/v2/propostas/{id}/autorizacao-consulta

Observacoes da pagina:
- Rota assincrona
- Coleta a autorizacao do cliente para consulta de margem no DataPrev
- Consulta a margem do cliente no DataPrev
- Aciona o motor de credito para validacao de politicas

Exemplo request:

```json
{
  "contato": {
    "telefone": "2199462000"
  }
}
```

Observacoes sobre contato.telefone:
- Deve ser informado o telefone real do cliente, que recebera o SMS de autorizacao
- Evitar numeros randomizados, pois isso impacta o fluxo da proposta

Exemplo response sucesso do endpoint:

```json
{
  "success": true,
  "data": {
    "processo": {
      "id": 3532,
      "mensagem": "Informacoes recebidas. Voce sera notificado via webhook quando o processamento for concluido"
    },
    "proposta": {
      "id": 707770
    }
  },
  "errors": null
}
```

Fluxo de webhooks documentado:
- O endpoint pode gerar multiplas respostas de webhook
- Processos listados: coleta da autorizacao, consulta de margem no Dataprev, consulta ao motor de credito
- O webhook final de sucesso traz valorRendaPresumida e tabelaJuros, informacoes obrigatorias para as rotas seguintes

Regras de negocio documentadas:
- Deve ser acionado apos GET /api/v2/propostas/{id}/produtos-ofertados e antes de PUT /api/v2/propostas/{id}/produtos-ofertados/{produtoId}
- O sistema valida se o telefone informado ja esta vinculado a autorizacao ativa de CPF diferente
- Se o cliente ja tiver autorizacao vigente, o sistema pula direto para a consulta de margem
- Se nao tiver, envia SMS e a proposta fica em Selecao de Ofertas ate o cliente concluir a autorizacao
- Se Consignado Privado for o unico produto e for negado, a proposta vai para status NEGADA
- Se houver outros produtos, o status nao muda e o sistema apenas informa a negativa via webhook

Campo descrito na pagina:
- contato.telefone: string, obrigatorio

### POST - Calcular Vencimento

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-calcular-vencimento-OqdGNsiBZI

Endpoint:
api/v2/propostas/{id}/calculo-vencimento

Observacoes da pagina:
- Responsavel por calcular o primeiro vencimento disponivel para a proposta
- Vencimentos diferem de acordo com as regras de cada produto
- Para este produto, convenio.id deve ser enviado como null
- tabelaJuros.id e obtido no webhook da rota POST - Autorizacao/Consulta Cliente

Exemplo request:

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

Exemplo response sucesso:

```json
{
  "success": true,
  "data": {
    "vencimento": [
      {
        "data": "2026-05-23"
      }
    ]
  },
  "errors": null
}
```

Campos descritos na pagina:
- produto.id: int, obrigatorio
- convenio.id: int, enviar null
- tabelaJuros.id: int, obrigatorio
- operacao.vencimento: string, enviar null
- operacao.diaRecebimentoId: int, nao obrigatorio

### POST - Consultar Valor Limite Cliente

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-consultar-valor-limite-cliente-VwyEixCfiZ

Endpoint:
api/v2/propostas/{id}/limite-credito

Observacoes da pagina:
- Retorna o valor limite que o cliente pode solicitar de credito
- Inclui valor total maximo e valor maximo da parcela
- Para este produto, convenio.id deve ser enviado null
- valorRenda e tabelaJuros sao obtidos no webhook da rota POST - Autorizacao/Consulta Cliente

Exemplo response sucesso:

```json
{
  "success": true,
  "data": {
    "valorLimite": {
      "valorMaximoSolicitado": 25000.0,
      "valorMaximoParcela": 1413.78,
      "valorMinimoParcela": 1.0
    }
  },
  "errors": null
}
```

Campos descritos na pagina:
- produto.id: int, obrigatorio
- convenio.id: int, enviar null
- tabelaJuros.id: int, obrigatorio
- operacao.vencimento: string, obrigatorio
- operacao.diaRecebimentoId: int, nao obrigatorio
- operacao.valorRenda: int, obrigatorio
- operacao.recalculo: string, enviar null

### POST - Simular Oferta Cliente

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-simular-oferta-cliente-E4jstQOqWf

Endpoint:
api/v2/propostas/{id}/simulacao-credito

Observacoes da pagina:
- Retorna as quantidades de parcelas de acordo com o valor selecionado
- Rota de simulacao para apresentar ao cliente os valores que ele pode solicitar
- Para este produto, tipoCalculo deve ser sempre 0
- convenio.id deve ser enviado null

Exemplo response sucesso:

```json
{
  "success": true,
  "data": {
    "proposta": {
      "id": 4,
      "tipoCalculo": 0,
      "tabelaJuros": {
        "id": 521
      },
      "operacao": {
        "valorSolicitado": 25000.0,
        "prazoValor": [
          {
            "prazo": 48,
            "valorParcela": 1076.02
          },
          {
            "prazo": 47,
            "valorParcela": 1086.11
          }
        ]
      }
    }
  },
  "errors": null
}
```

Campos descritos na pagina:
- produto.id: int, obrigatorio
- convenio.id: int, enviar null
- tabelaJuros.id: int, obrigatorio
- operacao.vencimento: string, obrigatorio
- operacao.diaRecebimentoId: int, nao obrigatorio
- operacao.valor: int, obrigatorio
- operacao.valorRenda: int, obrigatorio
- operacao.tipoCalculo: int, enviar 0

### PUT - Selecionar Oferta Cliente

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-selecionar-oferta-cliente-da3ASTzXGL

Endpoint:
/api/v2/propostas/{id}/produtos-ofertados/{produtoId}

Observacoes da pagina:
- Rota assincrona
- Seleciona a oferta desejada para o cliente
- Define valor de parcela e quantidade de parcelas
- Ocorre a segunda validacao no motor de credito

Exemplo response sucesso do endpoint:

```json
{
  "success": true,
  "data": {
    "processo": {
      "id": 3956,
      "mensagem": "Informacoes recebidas. Voce sera notificado via webhook quando o processamento for concluido"
    },
    "proposta": null
  },
  "errors": null
}
```

Exemplo response sucesso via webhook:

```json
{
  "evento": {
    "id": 3958,
    "nome": "processo",
    "status": "sucesso",
    "mensagens": ["Processado com sucesso!"],
    "detalhes": {
      "proposta": {
        "id": 1028788920,
        "aprovado": true,
        "novoLimite": {
          "valorLimiteSolicitado": 25000.0,
          "valorLimiteParcela": 1413.78,
          "valorLimiteMinimoParcela": 1.0
        }
      }
    }
  }
}
```

Campos descritos na pagina:
- produto.convenio.id: int, enviar null
- produto.convenio.dadosAdicionais: enviar vazio
- operacao.tabelaJuros.id: int, obrigatorio
- operacao.prazo: int, obrigatorio
- operacao.valorParcela: float, obrigatorio
- operacao.valorRenda: float, obrigatorio
- operacao.diaRecebimento: int, nao obrigatorio
- operacao.tipoRenda: int, enviar 0
- operacao.vencimento: string, obrigatorio
- operacao.valorSolicitado: int, obrigatorio
- operacao.tipoCalculo: int, enviar 0

### PUT - Finalizar Proposta / Atualizar Proposta

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-finalizar-proposta-atualizar-proposta-4kqkwkVlUg

Endpoint:
/api/v2/propostas/{id}/proposta-credito

Observacoes da pagina:
- Rota assincrona
- Completa o envio de dados da proposta
- Preenche o restante das informacoes do cliente
- Para este produto, tipoModalidade = 2, tipoRenda = 0 e tipoCalculo = 0

Exemplo response sucesso do endpoint:

```json
{
  "success": true,
  "data": {
    "processo": {
      "id": 3970,
      "mensagem": "Informacoes recebidas. Voce sera notificado via webhook quando o processamento for concluido"
    },
    "proposta": null
  },
  "errors": null
}
```

Campos descritos na pagina incluem, entre outros:
- proposta.cliente.nome, rg, rgEmissor, rgUfId, rgEmissao, sexo, estadoCivil, nacionalidadeId, naturalidadeUfId, naturalidadeCidadeId, grauInstrucaoId, nomeMae, nomeConjuge, pep
- proposta.contatos.contato.email, telefone, telefoneExtra
- proposta.contatos.referencia.id, nome, telefone, grau
- proposta.endereco.cep, logradouro, numero, bairro, complemento, cidadeId
- proposta.bancario.bancoId, agencia, digito, numero, conta, tipoConta, tempoConta
- proposta.unidade.nomeVendedor, cpfVendedor, celularVendedor
- proposta.operacao.produtoId, diaRecebimento, tipoModalidade, convenioId, vencimento, tabelaJurosId, valorSolicitado, prazo, valorParcela, valorRenda, tipoRenda, tipoCalculo

### GET - Consulta Link Assinatura

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/get-consulta-link-assinatura-W87tSGir76

Endpoint:
/api/v2/propostas/{id}/link-assinatura

Observacoes da pagina:
- Captura o link para realizacao da biometria e assinatura do contrato
- Exclusivo para o produto Credito do Trabalhador
- A proposta deve estar no status Aguard. Assinatura
- Se o link ainda estiver em geracao pela Unico, o endpoint pode retornar erro temporario
- Apos a conclusao da assinatura, o link deixa de ser disponibilizado
- A propostaId deve pertencer ao usuario autenticado

Exemplo response sucesso:

```json
{
  "success": true,
  "data": {
    "url": "https://cadastro.uat.unico.app/process/a970801b-2b23-4c28-b905-ba636c087386"
  },
  "errors": null
}
```

Exemplo response erro:

```json
{
  "success": false,
  "data": {
    "url": "Link Indisponivel no Momento"
  },
  "errors": null
}
```

### Reapresentacao de Pagamento

URL:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/reapresentacao-de-pagamento-o2RVrdhl2f

Texto visivel recuperado:
- O fluxo so deve ocorrer quando a proposta receber o status Pagamento Pendente
- Esse status ocorre quando algum dado bancario enviado em PUT - Finalizar Proposta / Atualizar Proposta esta incorreto ou inconsistente

Webhook de exemplo:

```json
{
  "evento": {
    "nome": "atualizacao-status-proposta",
    "detalhes": {
      "proposta": {
        "id": 1028792712,
        "situacaoDescricao": {
          "nome": "Pagamento Pendente"
        }
      }
    }
  }
}
```

Passos documentados:
1. Acionar a rota GET /api/v2/propostas/{id}/dados-bancarios para verificar os dados enviados
2. Identificar o dado incorreto e corrigi-lo
3. Acionar a rota POST /api/v2/propostas/{id}/dados-bancarios para corrigir o dado inconsistente

Exemplo response GET dados bancarios:

```json
{
  "bancario": {
    "bancoId": "237",
    "agencia": "1234",
    "digito": "7",
    "numero": "56789-x",
    "conta": "0",
    "tipoConta": "2",
    "tempoConta": "0"
  },
  "mensagem": null
}
```

Exemplo request POST de correcao:

```json
{
  "bancario": {
    "bancoId": "237",
    "agencia": "1234",
    "digito": "2",
    "numero": "56789-x",
    "conta": "0",
    "tipoConta": "2",
    "tempoConta": "0"
  }
}
```

Exemplo response sucesso da correcao:

```json
{
  "success": true,
  "data": {
    "mensagem": "Dados bancarios atualizados com sucesso"
  },
  "errors": null
}
```

Mensagens da API documentadas:
- Sucesso: Dados bancarios enviados com sucesso.
- ID inexistente: Proposta invalida.
- Sem permissao: A proposta nao pertence ao seu usuario!
- Proposta encerrada: Nao e possivel realizar essa acao. Proposta ja cancelada ou negada
- Etapa bloqueada: Nao e possivel enviar os dados bancarios: o status atual nao permite edicao.
- Banco invalido: Banco invalido ou inativo.

---

## CP Auto

URL descoberta pelo browser MCP:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/cp-auto-we97ZoafXO

Texto visivel recuperado:

# CP Auto

Modalidade de credito Crefaz, que permite ao cliente garantir o credito, utilizando-se de seu veiculo como meio de garantia.

A seguir voce tera todos os endpoints para lancamento de uma proposta do produto CP Auto, os mesmos estao na sequencia, bastando somente ser implementados.

### Documentos filhos visiveis em CP Auto

- POST - Criar Proposta/Pre-Analise
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-criar-propostapre-analise-ryu78st546
- GET - Listar Produtos/Ofertas Disponiveis
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/get-listar-produtosofertas-disponiveis-bcfnig4oDH
- PUT - Consultar CP Auto
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-consultar-cp-auto-TGc0TVQLxx
- POST - Calcular Vencimento
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-calcular-vencimento-0s4VZ1AkDq
- POST - Consultar Valor Limite Cliente
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-consultar-valor-limite-cliente-XesO2zJ2sm
- POST - Simular Oferta Cliente
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-simular-oferta-cliente-JpT3fJoZOl
- PUT - Selecionar Oferta Cliente
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-selecionar-oferta-cliente-NOxp4XwC30
- POST - Listar Documentos Para Anexar
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-listar-documentos-para-anexar-8iNhCd4w7a
- PUT - Upload Documentos Proposta
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-upload-documentos-proposta-AG0wcT6J1p
- PUT - Finalizar Proposta / Atualizar Proposta
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-finalizar-proposta-atualizar-proposta-wIAwdoS0Ar

---

## CDC Energia

URL descoberta pelo browser MCP:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/cdc-energia-8v47KPAQQT

Texto visivel recuperado:

# CDC Energia

A pagina abriu no browser MCP e a navegacao revelou a lista de endpoints do modulo.

### Documentos filhos visiveis em CDC Energia

- POST - Criar Proposta/Pre-Analise
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-criar-propostapre-analise-iPixQ7VAot
- GET - Listar Produtos/Ofertas Disponiveis
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/get-listar-produtosofertas-disponiveis-bX8aDGflri
- POST - Calcular Vencimento
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-calcular-vencimento-6NuETDyw6s
- POST - Consultar Valor Limite Cliente
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-consultar-valor-limite-cliente-qG9x3rPHc1
- POST - Simular Oferta Cliente
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-simular-oferta-cliente-6eLjIdbN3w
- PUT - Selecionar Oferta Cliente
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-selecionar-oferta-cliente-wA8MEKvEw9
- POST - Listar Documentos Para Anexar
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/post-listar-documentos-para-anexar-TA0iuQ2X0E
- PUT - Upload Documentos Proposta
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-upload-documentos-proposta-gjcEO6LHhl
- PUT - Finalizar Proposta / Atualizar Proposta
  https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-finalizar-proposta-atualizar-proposta-vRDsrHxk2r

---

## PUT - Cancelamento de Proposta

URL descoberta pelo browser MCP:
https://docs.cfzsistemas.com.br/s/a344fcb8-d5fb-494f-a1df-4276392be4b6/doc/put-cancelamento-de-proposta-G73flq1dPH

Texto visivel recuperado:

# PUT - Cancelamento de Proposta

### Endpoint

/api/v2/propostas/{id}/cancelamento

- Endpoint utilizado para cancelar uma proposta de sua posse, lancada pelo seu login vendedor

### Exemplo Response Sucesso

```json
{ "success": true, "data": { "status": "cancelada", "mensagem": "Proposta cancelada com sucesso." }, "errors": null }
```

### Exemplo Response Erro

```json
{ "success": false, "data": null, "errors": [ "Proposta invalida." ] }
```

## Condicoes e Regras de Negocio

Para que o cancelamento seja processado, o sistema realiza as seguintes validacoes em ordem:
- Existencia: o propostaId deve ser valido no sistema
- Propriedade: a proposta deve pertencer obrigatoriamente ao usuario autenticado
- Status de decisao: nao e permitido cancelar propostas que ja possuam status final, como Cancelada ou Negada
- Elegibilidade da etapa: o cancelamento so e permitido se a etapa atual da proposta permitir a acao

Etapas listadas na documentacao:
- Pre-analise
- Selecao Oferta
- Aguard. Cadastro
- Aguard. Analise
- Proposta Pendente
- Fila Contato
- Contato Pendente
- Aguard. Assinatura
- Aguard. Validacao
- Atuacao Cliente
- Aguard. Averbacao - Consignado
- Falha de Comunicacao
- Aguard. Analise Garantia
- Aguard. Vistoria
- Aguard. Analise Vistoria
- Pendente Garantia
- Consulta Margem
- Autorizacao Cliente
- Pagamento Pendente

## Fluxo de Sucesso e Notificacao

- Acao no sistema: o status da proposta no CrefazON sera alterado para Cancelada com o motivo Solicitado pela Loja
- Webhook: a mudanca de status sera enviada ao parceiro atraves do evento de atualizacao de status ja existente

Exemplo de webhook de status associado ao cancelamento:

```json
{
  "evento": {
    "id": null,
    "nome": "atualizacao-status-proposta",
    "status": null,
    "mensagens": null,
    "detalhes": {
      "proposta": {
        "id": 1028791507,
        "situacaoDescricao": {
          "nome": "Cancelada",
          "observacoes": null,
          "motivos": [
            { "id": 48, "nome": "Solicitado pela loja" }
          ],
          "usuario": {
            "login": null
          }
        }
      }
    }
  }
}
```

## Respostas da API

- Sucesso: "Proposta cancelada com sucesso."
- ID inexistente: "Proposta invalida."
- Usuario sem permissao: "A proposta nao pertence ao seu usuario!"
- Ja finalizada: "Nao e possivel realizar essa acao. Proposta ja cancelada ou negada"
- Etapa nao permite: "Nao e possivel cancelar a proposta, pois status atual nao permite cancelamento."
- Erro interno/timeout: "Nao foi possivel realizar operacao."
