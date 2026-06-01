import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const readWorksheetXml = () =>
  new Promise((resolve, reject) => {
    const unzip = spawn('unzip', ['-p', 'docs/cidade_uf.xlsx', 'xl/worksheets/sheet1.xml'], {
      stdio: ['ignore', 'pipe', 'inherit'],
    })

    let xml = ''

    unzip.stdout.setEncoding('utf8')
    unzip.stdout.on('data', (chunk) => {
      xml += chunk
    })

    unzip.on('error', reject)
    unzip.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Falha ao extrair worksheet do XLSX. Codigo: ${code ?? 'desconhecido'}`))
        return
      }

      resolve(xml)
    })
  })

const decodeXml = (value) =>
  value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")

const parseCities = (xml) => {
  const rows = [...xml.matchAll(/<row[^>]*>([\s\S]*?)<\/row>/g)]
  const entries = []

  for (const [, rowXml] of rows.slice(1)) {
    const cells = {}

    for (const match of rowXml.matchAll(/<c[^>]*r="([A-Z]+)\d+"[^>]*>([\s\S]*?)<\/c>/g)) {
      const [, column, cellXml] = match
      const inlineString = cellXml.match(/<is><t>([\s\S]*?)<\/t><\/is>/)
      const value = cellXml.match(/<v>([\s\S]*?)<\/v>/)
      const raw = inlineString ? inlineString[1] : value ? value[1] : ''
      cells[column] = decodeXml(raw)
    }

    if (!cells.A || !cells.B || !cells.C || !cells.D || !cells.E) {
      continue
    }

    entries.push({
      cidadeId: Number(cells.A),
      nome: cells.B,
      ufId: Number(cells.C),
      uf: cells.D,
      codigoIbge: Number(cells.E),
    })
  }

  return entries.sort(
    (left, right) => left.uf.localeCompare(right.uf, 'pt-BR') || left.nome.localeCompare(right.nome, 'pt-BR'),
  )
}

const buildContent = (entries) => {
  const groupedEntries = new Map()

  for (const entry of entries) {
    const cities = groupedEntries.get(entry.uf) ?? []
    cities.push(entry)
    groupedEntries.set(entry.uf, cities)
  }

  const groups = [...groupedEntries.entries()].map(([uf, cities]) => {
    const cityLines = cities.map(
      (city) =>
        `    { cidadeId: ${city.cidadeId}, nome: ${JSON.stringify(city.nome)}, ufId: ${city.ufId}, codigoIbge: ${city.codigoIbge} },`,
    )

    return `  ${uf}: [\n${cityLines.join('\n')}\n  ],`
  })

  return `export interface CrefazLocalCity {
  readonly cidadeId: number
  readonly nome: string
  readonly ufId: number
  readonly uf: string
  readonly codigoIbge: number
}

export const crefazCitiesByUf = {
${groups.join('\n')}
} as const satisfies Readonly<Record<string, readonly Omit<CrefazLocalCity, 'uf'>[]>>

const normalizeCityLookupValue = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()

const localCityIndex = new Map<string, CrefazLocalCity>(
  Object.entries(crefazCitiesByUf).flatMap(([uf, cities]) =>
    cities.map((city) => [
      \`${'${'}uf}:${'${'}normalizeCityLookupValue(city.nome)}\`,
      { ...city, uf },
    ] as const),
  ),
)

export const findLocalCityByNameAndUf = (nome: string, uf: string): CrefazLocalCity | null => {
  const normalizedUf = uf.trim().toUpperCase()
  const normalizedName = normalizeCityLookupValue(nome)

  return localCityIndex.get(\`${'${'}normalizedUf}:${'${'}normalizedName}\`) ?? null
}

export const findLocalCityIdByNameAndUf = (nome: string, uf: string): number | null =>
  findLocalCityByNameAndUf(nome, uf)?.cidadeId ?? null
`
}

const main = async () => {
  const xml = await readWorksheetXml()
  const entries = parseCities(xml)
  const content = buildContent(entries)
  const targetDirectory = join(process.cwd(), 'src', 'constants')
  const targetFile = join(targetDirectory, 'cities.ts')

  mkdirSync(targetDirectory, { recursive: true })
  writeFileSync(targetFile, content)

  console.log(`Gerado ${targetFile} com ${entries.length} cidades.`)
}

await main()
