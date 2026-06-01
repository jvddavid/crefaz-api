import type { CrefazAuthentication, CrefazCredentials, LoginResponse } from './modules/auth/contracts.js'
import type {
  AcceptedProcessResponse,
  AsyncOperationRequest,
  CrefazAsyncPayload,
  PollingOptions,
  WebhookEvent,
  WebhookNotification,
} from './modules/proposals/contracts.js'
import { AuthenticationError, ProviderContractError, ValidationError } from './shared/errors.js'
import { ensureJsonObject, HttpClient } from './shared/http.js'
import { isJsonObject, type JsonObject } from './shared/json.js'

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

  public async getProcessingStatus(processId: number): Promise<WebhookNotification> {
    const token = await this.getAccessToken()
    const response = await this.#httpClient.request<unknown>({
      method: 'GET',
      path: `/propostas/processamento/${processId}`,
      token,
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

    throw new ProviderContractError(
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

    const token = await this.getAccessToken()
    const response = await this.#httpClient.request<unknown>({
      method: request.method,
      path: request.path,
      body: request.payload,
      token,
      expectedStatus: [200, 202],
    })

    return parseAcceptedProcessResponse(response, request.path, request.method)
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

  if (value['mensagens'] !== null && value['mensagens'] !== undefined && typeof value['mensagens'] !== 'string') {
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
    mensagens: typeof value['mensagens'] === 'string' ? value['mensagens'] : null,
    detalhes: isJsonObject(value['detalhes']) ? value['detalhes'] : null,
  }
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
