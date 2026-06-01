export {
  CrefazClient,
  crefazBaseUrls,
  parseWebhookNotification,
} from './client.js'
export type {
  CrefazAuthentication,
  CrefazCredentials,
  LoginResponse,
} from './modules/auth/contracts.js'
export type {
  AcceptedProcess,
  AcceptedProcessData,
  AcceptedProcessResponse,
  AcceptedProposal,
  AsyncOperationMethod,
  AsyncOperationRequest,
  CrefazAsyncPayload,
  CrefazOperationPayload,
  PollingOptions,
  ProposalStatusDescription,
  WebhookDetails,
  WebhookEvent,
  WebhookNotification,
  WebhookProposalDetails,
  WebhookReason,
  WebhookUser,
} from './modules/proposals/contracts.js'
export {
  AuthenticationError,
  AuthorizationError,
  CrefazApiError,
  NetworkError,
  ProviderBusinessError,
  ProviderContractError,
  TimeoutError,
  ValidationError,
} from './shared/errors.js'

export type {
  JsonArray,
  JsonObject,
  JsonPrimitive,
  JsonValue,
} from './shared/json.js'
