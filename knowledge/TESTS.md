# Estratégia de Testes

## Objetivo

Os testes deste projeto existem principalmente para verificar se o comportamento das APIs financeiras externas continua compatível com o contrato assumido pela biblioteca.

Por isso, a estratégia é orientada a testes reais de integração, sem uso de mocks como mecanismo principal de confiança.

## Princípio central

Mock não detecta mudança do provedor.

Se o objetivo é saber quando a API externa alterou schema, autenticação, enum, paginação, semântica ou erro, o teste precisa exercitar o provedor real, preferencialmente em ambiente sandbox ou homologação controlada.

## Pirâmide adaptada para integrações externas

### 1. Testes de contrato real

São os testes mais importantes do projeto.

Eles devem:

- chamar o endpoint real;
- validar shape mínimo e semântica da resposta;
- detectar campos obrigatórios removidos ou alterados;
- detectar novos estados inesperados;
- validar códigos de erro relevantes;
- garantir que o adaptador continue traduzindo corretamente o provedor.

### 2. Testes de fluxo integrado

Cobrem jornadas completas contra o provedor.

Exemplos:

- autenticar e renovar token;
- consultar conta e posições;
- enviar ordem de teste em ambiente permitido;
- cancelar ordem;
- receber e validar webhook em sandbox;
- paginar resultados até condição conhecida.

### 3. Testes puros de domínio

São aceitáveis para regras internas determinísticas, sem dependência do provedor.

Exemplos:

- cálculo de transição de estado;
- normalização de erros;
- validação de invariantes;
- conversão entre value objects.

Esses testes não substituem os testes reais de contrato.

## O que evitar

- mocks de payload como fonte principal de verdade;
- snapshots enormes de resposta bruta sem assertiva semântica;
- testes que passam mesmo quando o provedor muda um campo crítico;
- suíte dependente de ambiente compartilhado sem isolamento mínimo;
- testes de escrita irreversível em produção.

## Ambientes de teste

### Prioridade

1. sandbox oficial do provedor;
2. homologação dedicada;
3. conta real com operação estritamente controlada, apenas se inevitável.

### Requisitos

- credenciais próprias de teste;
- dados conhecidos e resetáveis quando possível;
- segregação por provedor;
- rate limit respeitado;
- janelas de execução definidas para evitar flakiness operacional.

## Desenho da suíte

### Separação por intenção

- smoke: valida disponibilidade e autenticação básica;
- contract: valida schema mínimo e semântica das respostas;
- workflow: valida fluxos completos com efeitos controlados;
- domain: valida lógica interna pura.

### Separação por risco

- operações de leitura devem compor a maior parte da suíte contínua;
- operações de escrita devem ser mínimas, idempotentes e revertíveis;
- fluxos destrutivos devem ficar isolados e depender de ambiente apropriado.

## Assertividade correta

Cada teste deve verificar o que realmente importa para detectar regressão externa.

Preferir assertivas como:

- o endpoint retorna um identificador válido;
- o status mapeia para um estado interno conhecido;
- a moeda retornada pertence ao conjunto suportado;
- o timestamp possui formato e timezone esperados;
- a paginação avança sem duplicar ou perder registros;
- o erro 401 ou 429 é traduzido para a taxonomia interna correta.

Evitar assertivas frágeis como comparar o payload completo quando campos cosméticos variam frequentemente.

## Gestão de dados de teste

- criar fixtures apenas para entrada controlada da biblioteca, não para simular o provedor;
- registrar casos reais relevantes de resposta para análise humana quando houver falha, sem transformar isso em mock obrigatório;
- manter contas, ordens e ativos de teste previsíveis.

## Falhas esperadas e classificação

Quando um teste falhar, a triagem deve responder:

- houve instabilidade transitória de rede;
- o provedor mudou contrato;
- a autenticação expirou ou mudou;
- o ambiente sandbox está inconsistente;
- a biblioteca introduziu regressão interna.

Os testes devem ajudar a diferenciar essas categorias com mensagens objetivas.

## Estratégia sem mocks

Sem mocks não significa sem isolamento.

Significa:

- a confiança principal vem do provedor real;
- dependências internas podem ser organizadas para manter testes claros;
- regras puras podem ser testadas isoladas;
- contratos externos devem ser validados contra respostas reais.

## Frequência recomendada

- smoke e contract: em CI recorrente e antes de release;
- workflow: em janelas controladas, nightly ou pré-release;
- domain: em toda alteração relevante.

## Critério de aceite para novas integrações

Uma nova integração só deve ser considerada pronta quando possuir:

- autenticação testada em ambiente real;
- ao menos um teste de contrato por endpoint crítico;
- mapeamento explícito de erros relevantes;
- validação de paginação, limites e estados;
- cobertura mínima de fluxo operacional principal;
- documentação clara das restrições do ambiente de teste.
