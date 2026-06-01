import type { JsonObject, JsonValue } from '../../shared/json.js'

export interface CrefazOperationPayload extends JsonObject {
  readonly urlNotificacao: string
}

export type CrefazAsyncPayload = JsonObject & {
  readonly operacao: CrefazOperationPayload
}

export interface AcceptedProcess {
  readonly id: number
  readonly mensagem: string
}

export interface AcceptedProposal {
  readonly id: number
}

export interface AcceptedProcessData {
  readonly processo: AcceptedProcess
  readonly proposta?: AcceptedProposal
}

export interface AcceptedProcessResponse {
  readonly success: boolean
  readonly data: AcceptedProcessData
  readonly errors: readonly string[] | null
}

export interface WebhookUser {
  readonly login: string | null
}

export interface WebhookReason {
  readonly id: number
  readonly nome: string
}

export interface ProposalStatusDescription {
  readonly nome: string
  readonly observacoes: string | null
  readonly motivos: readonly WebhookReason[]
  readonly usuario: WebhookUser
}

export interface WebhookProposalDetails {
  readonly id: number
  readonly aprovado?: boolean
  readonly situacaoDescricao?: ProposalStatusDescription
}

export interface WebhookEvent {
  readonly nome: string
  readonly id: number | null
  readonly status: 'sucesso' | 'erro' | null
  readonly mensagens: string | null
  readonly detalhes: JsonObject | null
}

export interface WebhookNotification {
  readonly evento: WebhookEvent
}

export interface PollingOptions {
  readonly attempts?: number
  readonly intervalMs?: number
}

export type AsyncOperationMethod = 'POST' | 'PUT'

export type WebhookDetails = JsonObject | null

export interface AsyncOperationRequest {
  readonly path: string
  readonly method: AsyncOperationMethod
  readonly payload: CrefazAsyncPayload
}

export type UnknownWebhookPayload = JsonValue
