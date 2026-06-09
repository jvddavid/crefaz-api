import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'

import { CrefazClient, crefazBaseUrls } from '../../dist/index.mjs'

const REQUIRED_ENV_VARS = ['CREFAZ_LOGIN', 'CREFAZ_SENHA', 'CREFAZ_API_KEY']

test('homologacao energia: pre-analise, polling e retorno de ofertas', { timeout: 180_000 }, async (t) => {
  const missingEnvVars = REQUIRED_ENV_VARS.filter((name) => isBlank(process.env[name]))
  if (missingEnvVars.length > 0) {
    t.skip(`Defina ${missingEnvVars.join(', ')} para executar o teste de homologação.`)
    return
  }

  const payload = await loadPreAnalysisPayload()
  if (!payload) {
    t.skip(
      'Defina CREFAZ_HOMOLOG_ENERGIA_PRE_ANALISE_PAYLOAD ou CREFAZ_HOMOLOG_ENERGIA_PRE_ANALISE_PAYLOAD_FILE com o JSON da pre-analise.',
    )
    return
  }

  const client = new CrefazClient({
    credentials: {
      login: process.env.CREFAZ_LOGIN,
      senha: process.env.CREFAZ_SENHA,
      apiKey: process.env.CREFAZ_API_KEY,
    },
    baseUrl: process.env.CREFAZ_BASE_URL ?? crefazBaseUrls.homologacao,
  })

  const accepted = await client.preAnalyseProposal(payload)

  assert.equal(accepted.success, true)
  assert.equal(accepted.errors, null)
  assert.ok(Number.isInteger(accepted.data.processo.id))

  const notification = await client.waitForProcessing(accepted.data.processo.id, {
    attempts: parseOptionalPositiveInteger(process.env.CREFAZ_HOMOLOG_POLLING_ATTEMPTS) ?? 30,
    intervalMs: parseOptionalPositiveInteger(process.env.CREFAZ_HOMOLOG_POLLING_INTERVAL_MS) ?? 3_000,
  })

  assert.equal(notification.evento.status, 'sucesso')

  const proposalId = resolveProposalId(accepted, notification)
  assert.ok(Number.isInteger(proposalId))

  const offeredProducts = await client.listOfferedProducts(proposalId)
  const energyLabel = process.env.CREFAZ_HOMOLOG_ENERGIA_NOME_PRODUTO ?? 'energia'

  assert.ok(hasObjectArray(offeredProducts), 'A resposta de ofertas nao trouxe nenhuma colecao de objetos.')
  assert.ok(
    containsStringValue(offeredProducts, energyLabel),
    `A resposta de ofertas nao contem nenhuma ocorrencia de "${energyLabel}".`,
  )
})

async function loadPreAnalysisPayload() {
  const inlinePayload = process.env.CREFAZ_HOMOLOG_ENERGIA_PRE_ANALISE_PAYLOAD
  if (!isBlank(inlinePayload)) {
    return parsePayload(inlinePayload)
  }

  const payloadFile = process.env.CREFAZ_HOMOLOG_ENERGIA_PRE_ANALISE_PAYLOAD_FILE
  if (isBlank(payloadFile)) {
    return null
  }

  const fileContents = await readFile(path.resolve(payloadFile), 'utf8')
  return parsePayload(fileContents)
}

function parsePayload(serializedPayload) {
  const parsed = JSON.parse(serializedPayload)

  assert.equal(typeof parsed, 'object')
  assert.notEqual(parsed, null)
  assert.equal(Array.isArray(parsed), false)

  return parsed
}

function resolveProposalId(accepted, notification) {
  const acceptedProposalId = accepted.data.proposta?.id
  if (Number.isInteger(acceptedProposalId)) {
    return acceptedProposalId
  }

  const proposalId = notification.evento.detalhes?.proposta?.id
  if (Number.isInteger(proposalId)) {
    return proposalId
  }

  assert.fail('Nao foi possivel resolver o proposalId a partir da resposta aceita ou do polling.')
}

function hasObjectArray(value) {
  if (!value || typeof value !== 'object') {
    return false
  }

  for (const entry of Object.values(value)) {
    if (Array.isArray(entry) && entry.some((item) => item && typeof item === 'object' && !Array.isArray(item))) {
      return true
    }

    if (hasObjectArray(entry)) {
      return true
    }
  }

  return false
}

function containsStringValue(value, expectedNeedle) {
  if (typeof value === 'string') {
    return value.toLowerCase().includes(expectedNeedle.toLowerCase())
  }

  if (Array.isArray(value)) {
    return value.some((entry) => containsStringValue(entry, expectedNeedle))
  }

  if (!value || typeof value !== 'object') {
    return false
  }

  return Object.values(value).some((entry) => containsStringValue(entry, expectedNeedle))
}

function parseOptionalPositiveInteger(rawValue) {
  if (isBlank(rawValue)) {
    return null
  }

  const parsed = Number.parseInt(rawValue, 10)
  assert.ok(Number.isInteger(parsed) && parsed > 0, `Valor invalido para inteiro positivo: ${rawValue}`)
  return parsed
}

function isBlank(value) {
  return typeof value !== 'string' || value.trim().length === 0
}
