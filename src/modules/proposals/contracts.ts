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

export interface CrefazCity {
  readonly cidadeId: number
  readonly nomeCidade: string
  readonly codigoIBGE: number
  readonly ufId: number
  readonly uf: string
}

export interface FindCitiesResponse {
  readonly endereco: readonly CrefazCity[]
}

export interface CrefazCountry {
  readonly id: number
  readonly nome: string
  readonly alfa2: string
  readonly alfa3: string
  readonly ativo: boolean
}

export interface ListCountriesResponse {
  readonly paises: readonly CrefazCountry[]
}

export interface DueDateOption {
  readonly data: string
}

export interface DueDateData {
  readonly vencimento: readonly DueDateOption[]
}

export interface DueDateResponse {
  readonly success: boolean
  readonly data: DueDateData
  readonly errors: readonly string[] | null
}

export interface CreditLimit {
  readonly valorMaximoSolicitado: number
  readonly valorMaximoParcela: number
  readonly valorMinimoParcela: number
}

export interface CreditLimitData {
  readonly valorLimite: CreditLimit
}

export interface CreditLimitResponse {
  readonly success: boolean
  readonly data: CreditLimitData
  readonly errors: readonly string[] | null
}

export interface SimulatedInstallment {
  readonly prazo: number
  readonly valorParcela: number
}

export interface SimulatedOffer {
  readonly id: number
  readonly tipoCalculo: number | null
  readonly tabelaJurosId: number | null
  readonly valorSolicitado: number | null
  readonly valorParcela: number | null
  readonly prazoValor: readonly SimulatedInstallment[]
}

export interface SimulateOfferData {
  readonly proposta: SimulatedOffer
}

export interface SimulateOfferResponse {
  readonly success: boolean
  readonly data: SimulateOfferData
  readonly errors: readonly string[] | null
}

export interface RequiredDocument {
  readonly id: number
  readonly produtoId: number | null
  readonly nome: string
  readonly obrigatorio: boolean
}

export interface RequiredDocumentsData {
  readonly documentosProduto: readonly RequiredDocument[]
}

export interface RequiredDocumentsResponse {
  readonly success: boolean
  readonly data: RequiredDocumentsData
  readonly errors: readonly string[] | null
}

export interface MessageData {
  readonly mensagem: string
}

export interface MessageResponse {
  readonly success: boolean
  readonly data: MessageData
  readonly errors: readonly string[] | null
}

export interface SignatureLinkData {
  readonly url: string
}

export interface SignatureLinkResponse {
  readonly success: boolean
  readonly data: SignatureLinkData
  readonly errors: readonly string[] | null
}

export interface ProposalBankData {
  readonly bancoId: string
  readonly agencia: string
  readonly digito: string
  readonly numero: string
  readonly conta: string
  readonly tipoConta: string
  readonly tempoConta: string
}

export interface ProposalBankDataResponse {
  readonly bancario: ProposalBankData
  readonly mensagem: string | null
}

export interface CancelProposalData {
  readonly status: string
  readonly mensagem: string
}

export interface CancelProposalResponse {
  readonly success: boolean
  readonly data: CancelProposalData
  readonly errors: readonly string[] | null
}

export interface OfferedProductsResponse extends JsonObject {}

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
  readonly mensagens: readonly string[] | null
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
