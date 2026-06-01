import {
  AuthenticationError,
  AuthorizationError,
  CrefazApiError,
  NetworkError,
  ProviderBusinessError,
  ProviderContractError,
  TimeoutError,
  ValidationError,
} from './errors.js'
import { isJsonObject, type JsonObject, type JsonValue } from './json.js'

export interface HttpClientOptions {
  readonly baseUrl: string
  readonly timeoutMs: number
  readonly fetchFn?: typeof fetch
}

export interface HttpRequestOptions {
  readonly path: string
  readonly method: 'GET' | 'POST' | 'PUT'
  readonly body?: JsonValue
  readonly token?: string
  readonly expectedStatus?: readonly number[]
}

export class HttpClient {
  readonly #baseUrl: string
  readonly #timeoutMs: number
  readonly #fetchFn: typeof fetch

  public constructor(options: HttpClientOptions) {
    this.#baseUrl = options.baseUrl.replace(/\/+$/, '')
    this.#timeoutMs = options.timeoutMs
    this.#fetchFn = options.fetchFn ?? fetch
  }

  public async request<T>(options: HttpRequestOptions): Promise<T> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), this.#timeoutMs)
    const expectedStatus = options.expectedStatus ?? [200]

    try {
      const requestInit: RequestInit = {
        method: options.method,
        headers: this.#buildHeaders(options.token),
        signal: controller.signal,
      }

      if (options.body !== undefined) {
        requestInit.body = JSON.stringify(options.body)
      }

      const response = await this.#fetchFn(this.#buildUrl(options.path), requestInit)

      const payload = await this.#parseResponse(response)

      if (!expectedStatus.includes(response.status)) {
        this.#throwHttpError({
          endpoint: options.path,
          method: options.method,
          payload,
          statusCode: response.status,
        })
      }

      if (isErrorEnvelope(payload)) {
        this.#throwHttpError({
          endpoint: options.path,
          method: options.method,
          payload,
          statusCode: response.status,
        })
      }

      return payload as T
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TimeoutError('A requisição para a API Crefaz expirou.', {
          endpoint: options.path,
          method: options.method,
          statusCode: undefined,
          providerErrors: undefined,
          cause: error,
        })
      }

      if (error instanceof CrefazApiError) {
        throw error
      }

      throw new NetworkError('Falha de rede ao chamar a API Crefaz.', {
        endpoint: options.path,
        method: options.method,
        statusCode: undefined,
        providerErrors: undefined,
        cause: error,
      })
    } finally {
      clearTimeout(timeout)
    }
  }

  #buildUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path
    }

    return new URL(path.replace(/^\//, ''), `${this.#baseUrl}/`).toString()
  }

  #buildHeaders(token?: string): Headers {
    const headers = new Headers({
      Accept: 'application/json',
      'Content-Type': 'application/json',
    })

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return headers
  }

  async #parseResponse(response: Response): Promise<unknown> {
    const text = await response.text()

    if (!text) {
      return null
    }

    try {
      return JSON.parse(text) as unknown
    } catch (error) {
      throw new ProviderContractError('A API Crefaz retornou um payload inválido.', {
        endpoint: response.url,
        method: 'UNKNOWN',
        statusCode: response.status,
        providerErrors: undefined,
        cause: error,
      })
    }
  }

  #throwHttpError(input: {
    readonly endpoint: string
    readonly method: string
    readonly payload: unknown
    readonly statusCode: number
  }): never {
    const providerErrors = extractProviderErrors(input.payload)
    const message = providerErrors?.[0] ?? `A API Crefaz respondeu com status ${input.statusCode}.`
    const context = {
      endpoint: input.endpoint,
      method: input.method,
      providerErrors,
      statusCode: input.statusCode,
      cause: undefined,
    }

    if (input.statusCode === 400) {
      throw new ValidationError(message, context)
    }

    if (input.statusCode === 401) {
      throw new AuthenticationError(message, context)
    }

    if (input.statusCode === 403) {
      throw new AuthorizationError(message, context)
    }

    if (input.statusCode === 422) {
      throw new ProviderBusinessError(message, context)
    }

    throw new ProviderBusinessError(message, context)
  }
}

const isErrorEnvelope = (value: unknown): value is { errors: readonly string[] } => {
  if (!isJsonObject(value)) {
    return false
  }

  const errors = value['errors']
  return Array.isArray(errors) && errors.every((item) => typeof item === 'string') && errors.length > 0
}

const extractProviderErrors = (value: unknown): readonly string[] | undefined => {
  if (!isJsonObject(value)) {
    return undefined
  }

  const { errors } = value
  if (!Array.isArray(errors)) {
    return undefined
  }

  const normalizedErrors = errors.filter((item): item is string => typeof item === 'string')
  return normalizedErrors.length > 0 ? normalizedErrors : undefined
}

export const ensureJsonObject = (value: unknown, endpoint: string, method: string): JsonObject => {
  if (isJsonObject(value)) {
    return value
  }

  throw new ProviderContractError('A API Crefaz retornou um objeto em formato inesperado.', {
    endpoint,
    method,
    statusCode: undefined,
    providerErrors: undefined,
    cause: undefined,
  })
}
