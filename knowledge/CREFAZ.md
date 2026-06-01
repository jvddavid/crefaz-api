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
