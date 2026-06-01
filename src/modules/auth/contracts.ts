export interface CrefazCredentials {
  readonly login: string
  readonly senha: string
  readonly apiKey: string
}

export interface CrefazAuthentication {
  readonly usuarioId: number
  readonly login: string
  readonly token: string
  readonly expira: string
  readonly atualizaToken: string | null
  readonly nome: string
  readonly telefonia: string | null
}

export interface LoginResponse {
  readonly autenticacao?: CrefazAuthentication
}
