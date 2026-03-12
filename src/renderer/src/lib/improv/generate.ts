import { formatImprovFacts } from './context'
import type { ImprovContextEntity, ImprovGenerationResult, TavernScenarioInput } from './types'

interface LlmConfig {
  baseUrl: string
  apiKey: string
  model: string
}

const RESPONSE_KEYS: Array<keyof Omit<ImprovGenerationResult, 'usedFallback' | 'diagnostics'>> = [
  'dialogueOpener',
  'motive',
  'secret',
  'escalationBeat',
  'fallbackBeat'
]

const improvJsonSchema = {
  name: 'improv_tavern_scene',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: RESPONSE_KEYS,
    properties: {
      dialogueOpener: { type: 'string' },
      motive: { type: 'string' },
      secret: { type: 'string' },
      escalationBeat: { type: 'string' },
      fallbackBeat: { type: 'string' }
    }
  }
}

function readLlmConfig(): LlmConfig | null {
  const env = import.meta.env
  const envKey = env.VITE_LLM_API_KEY as string | undefined
  const envModel = (env.VITE_LLM_MODEL as string | undefined) || 'gpt-4o-mini'
  const envBaseUrl = (env.VITE_LLM_BASE_URL as string | undefined) || 'https://api.openai.com/v1'

  if (envKey) {
    return { apiKey: envKey, model: envModel, baseUrl: envBaseUrl }
  }

  const rawLocal = localStorage.getItem('improvTool.llmConfig')
  if (!rawLocal) return null

  try {
    const parsed = JSON.parse(rawLocal) as Partial<LlmConfig>
    if (!parsed.apiKey || !parsed.model) return null
    return {
      apiKey: parsed.apiKey,
      model: parsed.model,
      baseUrl: parsed.baseUrl || 'https://api.openai.com/v1'
    }
  } catch {
    return null
  }
}

function safeJsonExtract(value: string): Record<string, unknown> | null {
  const trimmed = value.trim()
  try {
    return JSON.parse(trimmed)
  } catch {
    const firstBrace = trimmed.indexOf('{')
    const lastBrace = trimmed.lastIndexOf('}')
    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) return null
    const inner = trimmed.slice(firstBrace, lastBrace + 1)
    try {
      return JSON.parse(inner)
    } catch {
      return null
    }
  }
}

function parseStructuredResponse(
  payload: unknown
): Omit<ImprovGenerationResult, 'usedFallback' | 'diagnostics'> | null {
  if (!payload || typeof payload !== 'object') return null
  const typed = payload as Record<string, unknown>
  const output: Partial<Omit<ImprovGenerationResult, 'usedFallback' | 'diagnostics'>> = {}

  for (const key of RESPONSE_KEYS) {
    const value = typed[key]
    if (typeof value !== 'string' || !value.trim()) return null
    output[key] = value.trim()
  }

  return output as Omit<ImprovGenerationResult, 'usedFallback' | 'diagnostics'>
}

function fallbackGenerate(
  input: TavernScenarioInput,
  context: ImprovContextEntity[],
  diagnostics: string
): ImprovGenerationResult {
  const contextTag = context[0] ? `${context[0].name}` : 'the room'
  return {
    dialogueOpener: `"${input.bartender || 'The barkeep'} wipes a mug and says, 'If you're asking about ${input.rumor || 'trouble'}, buy a drink first.'"`,
    motive: `${input.suspiciousPatron || 'A nervous patron'} wants leverage over ${contextTag} and will trade information only for protection.`,
    secret: `${input.complication || 'The tavern staff'} is quietly involved: the rumor points to a staged event, not an accident.`,
    escalationBeat: `Escalate if players push: ${input.suspiciousPatron || 'the patron'} bolts through the kitchen as armed enforcers enter ${input.tavern || 'the tavern'}.`,
    fallbackBeat: `If momentum dips, ${input.bartender || 'the bartender'} slides over a marked ledger entry that points to the next lead.`,
    usedFallback: true,
    diagnostics
  }
}

export async function generateTavernImprov(
  input: TavernScenarioInput,
  contextEntities: ImprovContextEntity[]
): Promise<ImprovGenerationResult> {
  const config = readLlmConfig()
  if (!config) {
    return fallbackGenerate(
      input,
      contextEntities,
      'No LLM config found (VITE_LLM_* env vars or localStorage improvTool.llmConfig).'
    )
  }

  const prompt = `You are a tabletop GM improv assistant.\nGenerate concise, usable outputs for a live DM.\n\nScenario seeds:\n- Tavern: ${input.tavern}\n- Bartender: ${input.bartender}\n- Suspicious patron: ${input.suspiciousPatron}\n- Rumor: ${input.rumor}\n- Complication: ${input.complication}\n\nWorld facts:\n${formatImprovFacts(contextEntities)}\n\nReturn JSON matching the provided schema.`

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.8,
        response_format: {
          type: 'json_schema',
          json_schema: improvJsonSchema
        },
        messages: [
          {
            role: 'system',
            content:
              'Output helpful, table-ready fantasy improv beats grounded in provided facts. Keep each field under 2 sentences.'
          },
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!response.ok) {
      return fallbackGenerate(
        input,
        contextEntities,
        `LLM request failed: ${response.status} ${response.statusText}`
      )
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      return fallbackGenerate(input, contextEntities, 'LLM response missing message content.')
    }

    const parsedJson = safeJsonExtract(content)
    const parsed = parseStructuredResponse(parsedJson)
    if (!parsed) {
      return fallbackGenerate(input, contextEntities, 'LLM response did not match expected schema.')
    }

    return {
      ...parsed,
      usedFallback: false,
      diagnostics: `LLM generation succeeded via model ${config.model}.`
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown request error'
    return fallbackGenerate(input, contextEntities, `LLM request exception: ${message}`)
  }
}
