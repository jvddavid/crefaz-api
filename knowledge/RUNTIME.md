# Runtime e Stack

## Base técnica

O projeto adota:

- Node.js 24 como runtime principal;
- TypeScript 5 como linguagem e camada de segurança de tipos;
- Biome como formatador, linter e guardrail de consistência.

Essa combinação é adequada para SDKs e bibliotecas de integração porque oferece runtime moderno, tipagem rigorosa, tooling simples e baixo custo de manutenção.

## Node.js 24

### Diretrizes

- usar ESM como padrão;
- preferir APIs nativas do runtime antes de adicionar dependências;
- tratar I/O, rede e serialização como pontos críticos de falha;
- não depender de comportamento implícito do event loop para consistência de integrações.

### Práticas recomendadas

- preferir fetch nativo e AbortController para chamadas HTTP;
- definir timeout por operação, nunca deixar requisição indefinida;
- modelar concorrência explicitamente, especialmente em paginação, polling e processamento de lotes;
- usar URL, Headers e Request nativos quando possível;
- evitar dependências pesadas apenas para utilidades triviais.

### Cuidados operacionais

- não assumir ordem de resposta em operações concorrentes;
- não misturar exceções de rede com erros de contrato do provedor;
- não usar cache implícito para dados financeiros sensíveis sem estratégia clara de invalidação;
- não encapsular erro original sem preservar causa.

## TypeScript 5

### Papel no projeto

TypeScript deve ser tratado como parte do design, não apenas como validação superficial.

Ele serve para:

- representar domínio financeiro com precisão;
- impedir estados inválidos;
- tornar mudanças de contrato mais visíveis no build;
- orientar o uso correto da biblioteca pelos consumidores.

### Convenções de modelagem

- preferir tipos explícitos no boundary público;
- usar unions discriminadas para estados e erros;
- usar branded types ou value objects para identificadores críticos quando necessário;
- evitar campos opcionais vagos quando o domínio exigir estados distintos;
- representar dinheiro, preço, quantidade e percentuais com tipos nomeados, não com number solto.

### Convenções de API

- requests e responses públicas devem ter nomes estáveis e sem ambiguidade;
- tipos internos do provedor não devem vazar como contrato principal;
- campos desconhecidos da API externa devem ser capturados apenas em metadados isolados quando necessário;
- datas devem ser documentadas com timezone e formato esperado.

### Uso do modo estrito

As flags já configuradas no tsconfig devem ser mantidas como baseline.

Especial atenção para:

- noUncheckedIndexedAccess: evita assumir presença de campos em coleções e payloads;
- exactOptionalPropertyTypes: diferencia ausência de valor de undefined explícito;
- useUnknownInCatchVariables: força tratamento consciente de erro;
- noPropertyAccessFromIndexSignature: reduz acesso inseguro a payloads arbitrários.

## Biome

### Papel do Biome

Biome deve impor legibilidade, consistência e disciplina de revisão, sem depender de uma pilha extensa de plugins.

### Regras práticas

- formatação automática faz parte do fluxo padrão;
- lint deve falhar para código inseguro ou inconsistente;
- mudanças de estilo não devem ser misturadas com mudanças comportamentais sem necessidade;
- convenções devem ser mantidas simples para minimizar ruído em PRs.

### Aplicação no time

- rodar format e lint antes de publicar pacote;
- evitar desativar regra localmente, exceto com justificativa objetiva;
- se uma regra atrapalhar um padrão deliberado do projeto, ajustar a configuração central em vez de espalhar exceções.

## Como essas tecnologias trabalham juntas

### Fluxo esperado

1. Node.js executa as chamadas externas, controle de concorrência e I/O.
2. TypeScript define o domínio, o contrato público e as invariantes.
3. Biome mantém o código consistente e reduz divergência de estilo e problemas triviais.

### Resultado desejado

- código previsível para manutenção;
- mudanças de contrato detectáveis cedo;
- menor risco de vazamento de detalhe externo para consumidores;
- revisões focadas em comportamento, não em formatação.

## Convenções de implementação

### Dependências

- adicionar dependências apenas quando substituírem complexidade real;
- preferir bibliotecas pequenas, maduras e com semântica clara;
- toda dependência nova deve ter justificativa de runtime ou manutenção.

### Design de clientes externos

- cada provedor deve ter um client interno e uma fachada pública estável;
- autenticação, retry, paginação e parsing não devem ficar dispersos por casos de uso;
- o client do provedor deve expor operações semânticas, não endpoints genéricos demais.

### Observabilidade

- toda chamada externa relevante deve ser observável;
- registrar latência, status, falha por categoria e provider request id;
- separar logs técnicos de dados sensíveis.

### Versionamento

- a biblioteca deve seguir semver;
- mudança em contrato público, comportamento documentado ou tipos exportados é potencial breaking change;
- alteração apenas no adaptador externo, sem impacto na API pública, deve ser tratada como patch ou minor conforme o alcance.

## Checklist de runtime

- timeout configurado por operação;
- retry limitado e seguro;
- erros traduzidos para taxonomia interna;
- tipos públicos estáveis;
- logs sem segredos;
- lint, format e typecheck executados antes de publicar.
