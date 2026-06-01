export interface CrefazErrorContext {
  readonly endpoint: string
  readonly method: string
  readonly statusCode: number | undefined
  readonly providerErrors: readonly string[] | undefined
  readonly cause: unknown
}

export class CrefazApiError extends Error {
  public readonly endpoint: string
  public readonly method: string
  public readonly statusCode: number | undefined
  public readonly providerErrors: readonly string[] | undefined

  public constructor(message: string, context: CrefazErrorContext) {
    super(message, context.cause ? { cause: context.cause } : undefined)
    this.name = new.target.name
    this.endpoint = context.endpoint
    this.method = context.method
    this.statusCode = context.statusCode
    this.providerErrors = context.providerErrors
  }
}

export class AuthenticationError extends CrefazApiError {}

export class AuthorizationError extends CrefazApiError {}

export class ValidationError extends CrefazApiError {}

export class ProviderBusinessError extends CrefazApiError {}

export class ProviderContractError extends CrefazApiError {}

export class NetworkError extends CrefazApiError {}

export class TimeoutError extends CrefazApiError {}
