import { formatImprovFacts } from './context'
import type { ImprovContextEntity, ImprovDetailRequest, ImprovDetailResult } from './types'

interface LlmConfig {
  baseUrl: string
  apiKey: string
  model: string
}

const schemaKeys: Array<keyof Omit<ImprovDetailResult, 'usedFallback' | 'diagnostics'>> = [
  'openingDescription',
  'sensoryDetails',
  'notableFeatures',
  'immediateOpportunities',
  'hiddenTwist'
]

const detailJsonSchema = {
  name: 'improv_detail_generator',
  schema: {
    type: 'object',
    additionalProperties: false,
    required: schemaKeys,
    properties: {
      openingDescription: { type: 'string' },
      sensoryDetails: {
        type: 'array',
        minItems: 3,
        maxItems: 5,
        items: { type: 'string' }
      },
      notableFeatures: {
        type: 'array',
        minItems: 3,
        maxItems: 6,
        items: { type: 'string' }
      },
      immediateOpportunities: {
        type: 'array',
        minItems: 2,
        maxItems: 4,
        items: { type: 'string' }
      },
      hiddenTwist: { type: 'string' }
    }
  }
}

function readLlmConfig(): LlmConfig | null {
  const env = import.meta.env
  const envKey = env.VITE_LLM_API_KEY as string | undefined
  const envModel = (env.VITE_LLM_MODEL as string | undefined) || 'gpt-4o-mini'
  const envBaseUrl = (env.VITE_LLM_BASE_URL as string | undefined) || 'https://api.openai.com/v1'

  if (envKey) return { apiKey: envKey, model: envModel, baseUrl: envBaseUrl }

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
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start === -1 || end === -1 || start >= end) return null
    try {
      return JSON.parse(trimmed.slice(start, end + 1))
    } catch {
      return null
    }
  }
}

function isStringArray(value: unknown, min: number): value is string[] {
  return (
    Array.isArray(value) && value.length >= min && value.every((entry) => typeof entry === 'string')
  )
}

function parseStructuredResponse(
  payload: unknown
): Omit<ImprovDetailResult, 'usedFallback' | 'diagnostics'> | null {
  if (!payload || typeof payload !== 'object') return null
  const typed = payload as Record<string, unknown>

  if (typeof typed.openingDescription !== 'string' || !typed.openingDescription.trim()) return null
  if (!isStringArray(typed.sensoryDetails, 3)) return null
  if (!isStringArray(typed.notableFeatures, 3)) return null
  if (!isStringArray(typed.immediateOpportunities, 2)) return null
  if (typeof typed.hiddenTwist !== 'string' || !typed.hiddenTwist.trim()) return null

  return {
    openingDescription: typed.openingDescription.trim(),
    sensoryDetails: typed.sensoryDetails
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 5),
    notableFeatures: typed.notableFeatures
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 6),
    immediateOpportunities: typed.immediateOpportunities
      .map((entry) => entry.trim())
      .filter(Boolean)
      .slice(0, 4),
    hiddenTwist: typed.hiddenTwist.trim()
  }
}

function fallbackGenerate(
  request: ImprovDetailRequest,
  context: ImprovContextEntity[],
  diagnostics: string
): ImprovDetailResult {
  const subject = request.subject || 'an unplanned location'
  const hint = context[0]?.name || 'the area'

  return {
    openingDescription: `The party steps into ${subject}, where the mood is ${request.tone || 'tense'} and everyone seems to be reacting to ${hint}.`,
    sensoryDetails: [
      `Smell: stale drink, wet wool, and lamp oil hang in the air.`,
      `Sound: low conversations cut off whenever strangers move deeper in.`,
      `Visual: mismatched furnishings and small signs of hurried repairs stand out.`
    ],
    notableFeatures: [
      `A staff member or regular immediately clocks what the players are looking for: ${request.playerIntent || 'answers'}.`,
      `One corner contains the cleanest sightline, clearly used by someone who watches arrivals.`,
      `A minor but memorable detail (crest, chalk mark, broken seal) ties this place to wider campaign events.`
    ],
    immediateOpportunities: [
      'A willing local offers a lead if the party helps with a small immediate problem.',
      'A tense misunderstanding can be defused for information or escalated into a short confrontation.'
    ],
    hiddenTwist:
      request.constraints ||
      'Someone present is not what they seem and is quietly steering the situation for a third party.',
    usedFallback: true,
    diagnostics
  }
}

export async function generateImprovDetails(
  request: ImprovDetailRequest,
  contextEntities: ImprovContextEntity[]
): Promise<ImprovDetailResult> {
  const config = readLlmConfig()
  if (!config) {
    return fallbackGenerate(
      request,
      contextEntities,
      'No LLM config found (VITE_LLM_* env vars or localStorage improvTool.llmConfig).'
    )
  }

  const prompt = `You are a GM improv assistant that generates concise details DMs can narrate immediately.

Subject players engage with: ${request.subject}
What players are trying to do: ${request.playerIntent}
Desired tone: ${request.tone}
Scope/scale: ${request.scale}
Constraints to respect: ${request.constraints || 'none'}

World facts:
${formatImprovFacts(contextEntities)}

Return valid JSON only.`

  try {
    const response = await fetch(`${config.baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.model,
        temperature: 0.85,
        response_format: {
          type: 'json_schema',
          json_schema: detailJsonSchema
        },
        messages: [
          {
            role: 'system',
            content:
              'Generate practical world details for live play. Avoid dialogue scripting and avoid full scene outlines. Keep each bullet concise.'
          },
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!response.ok) {
      return fallbackGenerate(
        request,
        contextEntities,
        `LLM request failed: ${response.status} ${response.statusText}`
      )
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }

    const content = data.choices?.[0]?.message?.content
    if (!content) {
      return fallbackGenerate(request, contextEntities, 'LLM response missing message content.')
    }

    const parsed = parseStructuredResponse(safeJsonExtract(content))
    if (!parsed) {
      return fallbackGenerate(
        request,
        contextEntities,
        'LLM response did not match expected schema.'
      )
    }

    return {
      ...parsed,
      usedFallback: false,
      diagnostics: `LLM generation succeeded via model ${config.model}.`
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown request error'
    return fallbackGenerate(request, contextEntities, `LLM request exception: ${message}`)
  }
}
