import type { CrefazAuthentication, CrefazCredentials, LoginResponse } from './modules/auth/contracts.js'
import type {
  AcceptedProcessResponse,
  AsyncOperationRequest,
  CancelProposalResponse,
  CreditLimitResponse,
  CrefazAsyncPayload,
  DueDateResponse,
  FindCitiesResponse,
  ListCountriesResponse,
  MessageResponse,
  OfferedProductsResponse,
  PollingOptions,
  ProposalBankDataResponse,
  RequiredDocumentsResponse,
  SignatureLinkResponse,
  SimulateOfferResponse,
  WebhookEvent,
  WebhookNotification,
} from './modules/proposals/contracts.js'
import {
  AuthenticationError,
  ProviderContractError,
  UnexpectedProviderStateError,
  ValidationError,
} from './shared/errors.js'
import { ensureJsonObject, HttpClient } from './shared/http.js'
import { isJsonObject, type JsonObject, type JsonValue } from './shared/json.js'

const DEFAULT_TIMEOUT_MS = 30_000
const DEFAULT_TOKEN_REFRESH_WINDOW_MS = 60_000
const DEFAULT_POLLING_ATTEMPTS = 10
const DEFAULT_POLLING_INTERVAL_MS = 3_000

export const crefazBaseUrls = {
  homologacao: 'https://api-externo-stag.crefazon.com.br/api/v2',
  producao: 'https://api-externo.crefazon.com.br/api',
} as const

export interface CrefazClientOptions {
  readonly credentials: CrefazCredentials
  readonly baseUrl?: string
  readonly timeoutMs?: number
  readonly fetchFn?: typeof fetch
  readonly now?: () => Date
}

export class CrefazClient {
  readonly #credentials: CrefazCredentials
  readonly #httpClient: HttpClient
  readonly #now: () => Date
  readonly #tokenRefreshWindowMs: number
  #authentication: CrefazAuthentication | null = null
  #authenticationPromise: Promise<CrefazAuthentication> | null = null

  public constructor(options: CrefazClientOptions) {
    const httpOptions = {
      baseUrl: options.baseUrl ?? crefazBaseUrls.homologacao,
      timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    }

    this.#credentials = options.credentials
    this.#httpClient = new HttpClient(options.fetchFn ? { ...httpOptions, fetchFn: options.fetchFn } : httpOptions)
    this.#now = options.now ?? (() => new Date())
    this.#tokenRefreshWindowMs = DEFAULT_TOKEN_REFRESH_WINDOW_MS
  }

  public async authenticate(forceRefresh = false): Promise<CrefazAuthentication> {
    if (!forceRefresh && this.#authentication && !this.#shouldRefreshToken(this.#authentication)) {
      return this.#authentication
    }

    if (!this.#authenticationPromise) {
      this.#authenticationPromise = this.#login().finally(() => {
        this.#authenticationPromise = null
      })
    }

    return this.#authenticationPromise
  }

  public async getAccessToken(): Promise<string> {
    const authentication = await this.authenticate()
    return authentication.token
  }

  public async preAnalyseProposal(payload: CrefazAsyncPayload): Promise<AcceptedProcessResponse> {
    return this.#runAsyncOperation({
      method: 'POST',
      path: '/propostas/pre-analise',
      payload,
    })
  }

  public async selectOfferedProduct(
    proposalId: number,
    productId: number,
    payload: CrefazAsyncPayload,
  ): Promise<AcceptedProcessResponse> {
    return this.#runAsyncOperation({
      method: 'PUT',
      path: `/propostas/${proposalId}/produtos-ofertados/${productId}`,
      payload,
    })
  }

  public async submitCreditProposal(proposalId: number, payload: CrefazAsyncPayload): Promise<AcceptedProcessResponse> {
    return this.#runAsyncOperation({
      method: 'PUT',
      path: `/propostas/${proposalId}/proposta-credito`,
      payload,
    })
  }

  public async consultVehicleOfferedProducts(
    proposalId: number,
    payload: CrefazAsyncPayload,
  ): Promise<AcceptedProcessResponse> {
    return this.#runAsyncOperation({
      method: 'PUT',
      path: `/proposta/${proposalId}/produtos-ofertados/consultar`,
      payload,
    })
  }

  public async authorizeMarginConsultation(
    proposalId: number,
    payload: CrefazAsyncPayload,
  ): Promise<AcceptedProcessResponse> {
    return this.#runAsyncOperation({
      method: 'POST',
      path: `/propostas/${proposalId}/autorizacao-consulta`,
      payload,
    })
  }

  public async findCities(payload: JsonObject): Promise<FindCitiesResponse> {
    const response = await this.#requestAuthenticated<unknown>({
      method: 'POST',
      path: '/enderecos/cidades',
      body: payload,
    })

    return parseFindCitiesResponse(response)
  }

  public async listCountries(): Promise<ListCountriesResponse> {
    const response = await this.#requestAuthenticated<unknown>({
      method: 'GET',
      path: '/enderecos/paises',
    })

    return parseListCountriesResponse(response)
  }

  public async listOfferedProducts(proposalId: number): Promise<OfferedProductsResponse> {
    const endpoint = `/propostas/${proposalId}/produtos-ofertados`
    const response = await this.#requestAuthenticated<unknown>({
      method: 'GET',
      path: endpoint,
    })

    return ensureJsonObject(response, endpoint, 'GET')
  }

  public async calculateDueDate(proposalId: number, payload: JsonObject): Promise<DueDateResponse> {
    const endpoint = `/propostas/${proposalId}/calculo-vencimento`
    const response = await this.#requestAuthenticated<unknown>({
      method: 'POST',
      path: endpoint,
      body: payload,
    })

    return parseDueDateResponse(response, endpoint, 'POST')
  }

  public async getCreditLimit(proposalId: number, payload: JsonObject): Promise<CreditLimitResponse> {
    const endpoint = `/propostas/${proposalId}/limite-credito`
    const response = await this.#requestAuthenticated<unknown>({
      method: 'POST',
      path: endpoint,
      body: payload,
    })

    return parseCreditLimitResponse(response, endpoint, 'POST')
  }

  public async simulateOffer(proposalId: number, payload: JsonObject): Promise<SimulateOfferResponse> {
    const endpoint = `/propostas/${proposalId}/simulacao-credito`
    const response = await this.#requestAuthenticated<unknown>({
      method: 'POST',
      path: endpoint,
      body: payload,
    })

    return parseSimulateOfferResponse(response, endpoint, 'POST')
  }

  public async listRequiredDocuments(payload: JsonObject): Promise<RequiredDocumentsResponse> {
    const endpoint = '/Propostas/tipos-documentos'
    const response = await this.#requestAuthenticated<unknown>({
      method: 'POST',
      path: endpoint,
      body: payload,
    })

    return parseRequiredDocumentsResponse(response, endpoint, 'POST')
  }

  public async uploadProposalDocument(proposalId: number, payload: JsonObject): Promise<MessageResponse> {
    const endpoint = `/propostas/${proposalId}/documento`
    const response = await this.#requestAuthenticated<unknown>({
      method: 'PUT',
      path: endpoint,
      body: payload,
    })

    return parseMessageResponse(response, endpoint, 'PUT')
  }

  public async getSignatureLink(proposalId: number): Promise<SignatureLinkResponse> {
    const endpoint = `/propostas/${proposalId}/link-assinatura`
    const response = await this.#requestAuthenticated<unknown>({
      method: 'GET',
      path: endpoint,
      expectedStatus: [200, 202],
    })

    return parseSignatureLinkResponse(response, endpoint, 'GET')
  }

  public async getProposalBankData(proposalId: number): Promise<ProposalBankDataResponse> {
    const endpoint = `/propostas/${proposalId}/dados-bancarios`
    const response = await this.#requestAuthenticated<unknown>({
      method: 'GET',
      path: endpoint,
    })

    return parseProposalBankDataResponse(response, endpoint, 'GET')
  }

  public async updateProposalBankData(proposalId: number, payload: JsonObject): Promise<MessageResponse> {
    const endpoint = `/propostas/${proposalId}/dados-bancarios`
    const response = await this.#requestAuthenticated<unknown>({
      method: 'POST',
      path: endpoint,
      body: payload,
    })

    return parseMessageResponse(response, endpoint, 'POST')
  }

  public async cancelProposal(proposalId: number): Promise<CancelProposalResponse> {
    const endpoint = `/propostas/${proposalId}/cancelamento`
    const response = await this.#requestAuthenticated<unknown>({
      method: 'PUT',
      path: endpoint,
    })

    return parseCancelProposalResponse(response, endpoint, 'PUT')
  }

  public async getProcessingStatus(processId: number): Promise<WebhookNotification> {
    const response = await this.#requestAuthenticated<unknown>({
      method: 'GET',
      path: `/propostas/processamento/${processId}`,
    })

    return parseWebhookNotification(response)
  }

  public async waitForProcessing(processId: number, options: PollingOptions = {}): Promise<WebhookNotification> {
    const attempts = options.attempts ?? DEFAULT_POLLING_ATTEMPTS
    const intervalMs = options.intervalMs ?? DEFAULT_POLLING_INTERVAL_MS

    for (let currentAttempt = 1; currentAttempt <= attempts; currentAttempt += 1) {
      const notification = await this.getProcessingStatus(processId)
      if (notification.evento.status !== null) {
        return notification
      }

      if (currentAttempt < attempts) {
        await delay(intervalMs)
      }
    }

    throw new UnexpectedProviderStateError(
      'O processamento não foi concluído dentro da janela de polling configurada.',
      baseErrorContext(`/propostas/processamento/${processId}`, 'GET'),
    )
  }

  async #login(): Promise<CrefazAuthentication> {
    const response = await this.#httpClient.request<LoginResponse>({
      method: 'POST',
      path: '/usuarios/login',
      body: {
        usuario: {
          login: this.#credentials.login,
          senha: this.#credentials.senha,
          apiKey: this.#credentials.apiKey,
        },
      },
    })

    const authentication = parseAuthentication(response)
    this.#authentication = authentication
    return authentication
  }

  async #runAsyncOperation(request: AsyncOperationRequest): Promise<AcceptedProcessResponse> {
    ensureNotificationUrl(request.payload, request.path, request.method)

    const response = await this.#requestAuthenticated<unknown>({
      method: request.method,
      path: request.path,
      body: request.payload,
      expectedStatus: [200, 202],
    })

    return parseAcceptedProcessResponse(response, request.path, request.method)
  }

  async #requestAuthenticated<T>(request: {
    readonly method: 'GET' | 'POST' | 'PUT'
    readonly path: string
    readonly body?: JsonValue
    readonly expectedStatus?: readonly number[]
  }): Promise<T> {
    const token = await this.getAccessToken()

    return this.#httpClient.request<T>({
      method: request.method,
      path: request.path,
      token,
      ...(request.body !== undefined ? { body: request.body } : {}),
      ...(request.expectedStatus ? { expectedStatus: request.expectedStatus } : {}),
    })
  }

  #shouldRefreshToken(authentication: CrefazAuthentication): boolean {
    const expiresAt = new Date(authentication.expira)
    if (Number.isNaN(expiresAt.getTime())) {
      return true
    }

    return expiresAt.getTime() - this.#now().getTime() <= this.#tokenRefreshWindowMs
  }
}

export const parseWebhookNotification = (value: unknown): WebhookNotification => {
  const root = ensureJsonObject(value, 'webhook', 'POST')
  const eventValue = root['evento']

  if (!isJsonObject(eventValue)) {
    throw new ProviderContractError(
      'O webhook da Crefaz não contém o objeto evento.',
      baseErrorContext('webhook', 'POST'),
    )
  }

  const event = parseWebhookEvent(eventValue)
  return { evento: event }
}

const parseAuthentication = (response: LoginResponse): CrefazAuthentication => {
  const authentication = response.autenticacao

  if (!authentication) {
    throw new AuthenticationError(
      'A autenticação da Crefaz não retornou token.',
      baseErrorContext('/usuarios/login', 'POST'),
    )
  }

  if (
    typeof authentication.usuarioId !== 'number' ||
    typeof authentication.login !== 'string' ||
    typeof authentication.token !== 'string' ||
    typeof authentication.expira !== 'string' ||
    typeof authentication.nome !== 'string'
  ) {
    throw new ProviderContractError(
      'A resposta de autenticação da Crefaz está em formato inesperado.',
      baseErrorContext('/usuarios/login', 'POST'),
    )
  }

  return {
    usuarioId: authentication.usuarioId,
    login: authentication.login,
    token: authentication.token,
    expira: authentication.expira,
    atualizaToken: typeof authentication.atualizaToken === 'string' ? authentication.atualizaToken : null,
    nome: authentication.nome,
    telefonia: typeof authentication.telefonia === 'string' ? authentication.telefonia : null,
  }
}

const ensureNotificationUrl = (payload: CrefazAsyncPayload, endpoint: string, method: string): void => {
  if (typeof payload.operacao?.urlNotificacao === 'string' && payload.operacao.urlNotificacao.length > 0) {
    return
  }

  throw new ValidationError(
    'O campo operacao.urlNotificacao é obrigatório nas rotas assíncronas da Crefaz.',
    baseErrorContext(endpoint, method),
  )
}

const parseAcceptedProcessResponse = (value: unknown, endpoint: string, method: string): AcceptedProcessResponse => {
  const root = ensureJsonObject(value, endpoint, method)

  if (root['success'] !== true) {
    throw new ProviderContractError(
      'A API Crefaz não confirmou o recebimento da operação assíncrona.',
      baseErrorContext(endpoint, method),
    )
  }

  const data = ensureJsonObject(root['data'], endpoint, method)
  const processo = ensureJsonObject(data['processo'], endpoint, method)

  if (typeof processo['id'] !== 'number' || typeof processo['mensagem'] !== 'string') {
    throw new ProviderContractError(
      'A resposta 202 da Crefaz não contém processo válido.',
      baseErrorContext(endpoint, method),
    )
  }

  const propostaValue = data['proposta']
  const proposta = propostaValue === undefined ? undefined : ensureJsonObject(propostaValue, endpoint, method)

  if (proposta && typeof proposta['id'] !== 'number') {
    throw new ProviderContractError(
      'A resposta 202 da Crefaz não contém proposta válida.',
      baseErrorContext(endpoint, method),
    )
  }

  return {
    ...root,
    success: true,
    data: {
      processo: {
        id: processo['id'],
        mensagem: processo['mensagem'],
      },
      ...(proposta ? { proposta: { id: proposta['id'] as number } } : {}),
    },
    errors: Array.isArray(root['errors'])
      ? root['errors'].filter((item): item is string => typeof item === 'string')
      : null,
  }
}

const parseWebhookEvent = (value: JsonObject): WebhookEvent => {
  if (typeof value['nome'] !== 'string') {
    throw new ProviderContractError(
      'O webhook da Crefaz não contém evento.nome válido.',
      baseErrorContext('webhook', 'POST'),
    )
  }

  if (value['id'] !== null && value['id'] !== undefined && typeof value['id'] !== 'number') {
    throw new ProviderContractError(
      'O webhook da Crefaz não contém evento.id válido.',
      baseErrorContext('webhook', 'POST'),
    )
  }

  if (
    value['status'] !== null &&
    value['status'] !== undefined &&
    value['status'] !== 'sucesso' &&
    value['status'] !== 'erro'
  ) {
    throw new ProviderContractError(
      'O webhook da Crefaz não contém evento.status válido.',
      baseErrorContext('webhook', 'POST'),
    )
  }

  const mensagensValue = value['mensagens']

  if (
    mensagensValue !== null &&
    mensagensValue !== undefined &&
    !(typeof mensagensValue === 'string') &&
    !(Array.isArray(mensagensValue) && mensagensValue.every((item) => typeof item === 'string'))
  ) {
    throw new ProviderContractError(
      'O webhook da Crefaz não contém evento.mensagens válido.',
      baseErrorContext('webhook', 'POST'),
    )
  }

  if (value['detalhes'] !== null && value['detalhes'] !== undefined && !isJsonObject(value['detalhes'])) {
    throw new ProviderContractError(
      'O webhook da Crefaz não contém evento.detalhes válido.',
      baseErrorContext('webhook', 'POST'),
    )
  }

  return {
    nome: value['nome'],
    id: typeof value['id'] === 'number' ? value['id'] : null,
    status: value['status'] === 'sucesso' || value['status'] === 'erro' ? value['status'] : null,
    mensagens:
      typeof mensagensValue === 'string'
        ? [mensagensValue]
        : Array.isArray(mensagensValue)
          ? mensagensValue.filter((item): item is string => typeof item === 'string')
          : null,
    detalhes: isJsonObject(value['detalhes']) ? value['detalhes'] : null,
  }
}

const parseFindCitiesResponse = (value: unknown): FindCitiesResponse => {
  const endpoint = '/enderecos/cidades'
  const method = 'POST'
  const root = ensureJsonObject(value, endpoint, method)
  const citiesValue = root['endereco']

  if (!Array.isArray(citiesValue)) {
    throw new ProviderContractError(
      'A API Crefaz não retornou a lista de cidades esperada.',
      baseErrorContext(endpoint, method),
    )
  }

  return {
    endereco: citiesValue.map((item) => {
      const city = ensureJsonObject(item, endpoint, method)

      if (
        typeof city['cidadeId'] !== 'number' ||
        typeof city['nomeCidade'] !== 'string' ||
        typeof city['codigoIBGE'] !== 'number' ||
        typeof city['ufId'] !== 'number' ||
        typeof city['uf'] !== 'string'
      ) {
        throw new ProviderContractError(
          'A API Crefaz retornou uma cidade em formato inesperado.',
          baseErrorContext(endpoint, method),
        )
      }

      return {
        cidadeId: city['cidadeId'],
        nomeCidade: city['nomeCidade'],
        codigoIBGE: city['codigoIBGE'],
        ufId: city['ufId'],
        uf: city['uf'],
      }
    }),
  }
}

const parseListCountriesResponse = (value: unknown): ListCountriesResponse => {
  const endpoint = '/enderecos/paises'
  const method = 'GET'
  const root = ensureJsonObject(value, endpoint, method)
  const countriesValue = root['paises']

  if (!Array.isArray(countriesValue)) {
    throw new ProviderContractError(
      'A API Crefaz não retornou a lista de países esperada.',
      baseErrorContext(endpoint, method),
    )
  }

  return {
    paises: countriesValue.map((item) => {
      const country = ensureJsonObject(item, endpoint, method)

      if (
        typeof country['id'] !== 'number' ||
        typeof country['nome'] !== 'string' ||
        typeof country['alfa2'] !== 'string' ||
        typeof country['alfa3'] !== 'string' ||
        typeof country['ativo'] !== 'boolean'
      ) {
        throw new ProviderContractError(
          'A API Crefaz retornou um país em formato inesperado.',
          baseErrorContext(endpoint, method),
        )
      }

      return {
        id: country['id'],
        nome: country['nome'],
        alfa2: country['alfa2'],
        alfa3: country['alfa3'],
        ativo: country['ativo'],
      }
    }),
  }
}

const parseDueDateResponse = (value: unknown, endpoint: string, method: string): DueDateResponse => {
  const { data, errors } = parseSuccessEnvelopeData(value, endpoint, method)
  const dueDatesValue = data['vencimento']

  if (!Array.isArray(dueDatesValue)) {
    throw new ProviderContractError(
      'A API Crefaz não retornou os vencimentos esperados.',
      baseErrorContext(endpoint, method),
    )
  }

  return {
    success: true,
    data: {
      vencimento: dueDatesValue.map((item) => {
        const dueDate = ensureJsonObject(item, endpoint, method)

        if (typeof dueDate['data'] !== 'string') {
          throw new ProviderContractError(
            'A API Crefaz não retornou um vencimento em formato inesperado.',
            baseErrorContext(endpoint, method),
          )
        }

        return { data: dueDate['data'] }
      }),
    },
    errors,
  }
}

const parseCreditLimitResponse = (value: unknown, endpoint: string, method: string): CreditLimitResponse => {
  const { data, errors } = parseSuccessEnvelopeData(value, endpoint, method)
  const limit = ensureJsonObject(data['valorLimite'], endpoint, method)

  if (
    typeof limit['valorMaximoSolicitado'] !== 'number' ||
    typeof limit['valorMaximoParcela'] !== 'number' ||
    typeof limit['valorMinimoParcela'] !== 'number'
  ) {
    throw new ProviderContractError(
      'A API Crefaz não retornou o limite de crédito em formato esperado.',
      baseErrorContext(endpoint, method),
    )
  }

  return {
    success: true,
    data: {
      valorLimite: {
        valorMaximoSolicitado: limit['valorMaximoSolicitado'],
        valorMaximoParcela: limit['valorMaximoParcela'],
        valorMinimoParcela: limit['valorMinimoParcela'],
      },
    },
    errors,
  }
}

const parseSimulateOfferResponse = (value: unknown, endpoint: string, method: string): SimulateOfferResponse => {
  const { data, errors } = parseSuccessEnvelopeData(value, endpoint, method)
  const proposal = ensureJsonObject(data['proposta'], endpoint, method)
  const operation = isJsonObject(proposal['operacao']) ? proposal['operacao'] : null
  const interestTable = isJsonObject(proposal['tabelaJuros']) ? proposal['tabelaJuros'] : null
  const prazoValue = operation?.['prazoValor'] ?? proposal['prazoValor']

  if (typeof proposal['id'] !== 'number' || !Array.isArray(prazoValue)) {
    throw new ProviderContractError(
      'A API Crefaz não retornou a simulação em formato esperado.',
      baseErrorContext(endpoint, method),
    )
  }

  return {
    success: true,
    data: {
      proposta: {
        id: proposal['id'],
        tipoCalculo: typeof proposal['tipoCalculo'] === 'number' ? proposal['tipoCalculo'] : null,
        tabelaJurosId: interestTable && typeof interestTable['id'] === 'number' ? interestTable['id'] : null,
        valorSolicitado:
          operation && typeof operation['valorSolicitado'] === 'number' ? operation['valorSolicitado'] : null,
        valorParcela: operation && typeof operation['valorParcela'] === 'number' ? operation['valorParcela'] : null,
        prazoValor: prazoValue.map((item) => {
          const installment = ensureJsonObject(item, endpoint, method)

          if (typeof installment['prazo'] !== 'number' || typeof installment['valorParcela'] !== 'number') {
            throw new ProviderContractError(
              'A API Crefaz não retornou uma parcela simulada em formato inesperado.',
              baseErrorContext(endpoint, method),
            )
          }

          return {
            prazo: installment['prazo'],
            valorParcela: installment['valorParcela'],
          }
        }),
      },
    },
    errors,
  }
}

const parseRequiredDocumentsResponse = (
  value: unknown,
  endpoint: string,
  method: string,
): RequiredDocumentsResponse => {
  const { data, errors } = parseSuccessEnvelopeData(value, endpoint, method)
  const documentsValue = data['documentosProduto']

  if (!Array.isArray(documentsValue)) {
    throw new ProviderContractError(
      'A API Crefaz não retornou os documentos obrigatórios esperados.',
      baseErrorContext(endpoint, method),
    )
  }

  return {
    success: true,
    data: {
      documentosProduto: documentsValue.map((item) => {
        const document = ensureJsonObject(item, endpoint, method)
        const product = isJsonObject(document['produto']) ? document['produto'] : null

        if (
          typeof document['id'] !== 'number' ||
          typeof document['nome'] !== 'string' ||
          typeof document['obrigatorio'] !== 'boolean'
        ) {
          throw new ProviderContractError(
            'A API Crefaz não retornou um documento em formato inesperado.',
            baseErrorContext(endpoint, method),
          )
        }

        return {
          id: document['id'],
          produtoId: product && typeof product['id'] === 'number' ? product['id'] : null,
          nome: document['nome'],
          obrigatorio: document['obrigatorio'],
        }
      }),
    },
    errors,
  }
}

const parseMessageResponse = (value: unknown, endpoint: string, method: string): MessageResponse => {
  const { data, errors } = parseSuccessEnvelopeData(value, endpoint, method)

  if (typeof data['mensagem'] !== 'string') {
    throw new ProviderContractError(
      'A API Crefaz não retornou a mensagem esperada.',
      baseErrorContext(endpoint, method),
    )
  }

  return {
    success: true,
    data: {
      mensagem: data['mensagem'],
    },
    errors,
  }
}

const parseSignatureLinkResponse = (value: unknown, endpoint: string, method: string): SignatureLinkResponse => {
  const root = ensureJsonObject(value, endpoint, method)

  if (typeof root['success'] !== 'boolean') {
    throw new ProviderContractError(
      'A API Crefaz não retornou o status do link de assinatura.',
      baseErrorContext(endpoint, method),
    )
  }

  const data = ensureJsonObject(root['data'], endpoint, method)

  if (typeof data['url'] !== 'string') {
    throw new ProviderContractError(
      'A API Crefaz não retornou a URL de assinatura esperada.',
      baseErrorContext(endpoint, method),
    )
  }

  return {
    success: root['success'],
    data: {
      url: data['url'],
    },
    errors: normalizeErrors(root['errors']),
  }
}

const parseProposalBankDataResponse = (value: unknown, endpoint: string, method: string): ProposalBankDataResponse => {
  const root = ensureJsonObject(value, endpoint, method)
  const bankData = ensureJsonObject(root['bancario'], endpoint, method)

  if (
    typeof bankData['bancoId'] !== 'string' ||
    typeof bankData['agencia'] !== 'string' ||
    typeof bankData['digito'] !== 'string' ||
    typeof bankData['numero'] !== 'string' ||
    typeof bankData['conta'] !== 'string' ||
    typeof bankData['tipoConta'] !== 'string' ||
    typeof bankData['tempoConta'] !== 'string'
  ) {
    throw new ProviderContractError(
      'A API Crefaz não retornou os dados bancários em formato esperado.',
      baseErrorContext(endpoint, method),
    )
  }

  if (root['mensagem'] !== null && root['mensagem'] !== undefined && typeof root['mensagem'] !== 'string') {
    throw new ProviderContractError(
      'A API Crefaz não retornou a mensagem bancária em formato esperado.',
      baseErrorContext(endpoint, method),
    )
  }

  return {
    bancario: {
      bancoId: bankData['bancoId'],
      agencia: bankData['agencia'],
      digito: bankData['digito'],
      numero: bankData['numero'],
      conta: bankData['conta'],
      tipoConta: bankData['tipoConta'],
      tempoConta: bankData['tempoConta'],
    },
    mensagem: typeof root['mensagem'] === 'string' ? root['mensagem'] : null,
  }
}

const parseCancelProposalResponse = (value: unknown, endpoint: string, method: string): CancelProposalResponse => {
  const { data, errors } = parseSuccessEnvelopeData(value, endpoint, method)

  if (typeof data['status'] !== 'string' || typeof data['mensagem'] !== 'string') {
    throw new ProviderContractError(
      'A API Crefaz não retornou o cancelamento em formato esperado.',
      baseErrorContext(endpoint, method),
    )
  }

  return {
    success: true,
    data: {
      status: data['status'],
      mensagem: data['mensagem'],
    },
    errors,
  }
}

const parseSuccessEnvelopeData = (value: unknown, endpoint: string, method: string) => {
  const root = ensureJsonObject(value, endpoint, method)

  if (root['success'] !== true) {
    throw new ProviderContractError(
      'A API Crefaz não confirmou o processamento da operação.',
      baseErrorContext(endpoint, method),
    )
  }

  return {
    data: ensureJsonObject(root['data'], endpoint, method),
    errors: normalizeErrors(root['errors']),
  }
}

const normalizeErrors = (value: unknown): readonly string[] | null => {
  if (!Array.isArray(value)) {
    return null
  }

  const errors = value.filter((item): item is string => typeof item === 'string')
  return errors.length > 0 ? errors : null
}

const delay = async (ms: number): Promise<void> => {
  await new Promise((resolve) => setTimeout(resolve, ms))
}

const baseErrorContext = (endpoint: string, method: string) => ({
  endpoint,
  method,
  statusCode: undefined,
  providerErrors: undefined,
  cause: undefined,
})
