type Pax = 'Adult' | 'Senior' | 'Child'

export type Slot = {
  id: string
  startTime: string
  capacity?: number
  remaining: number | Partial<Record<Pax, number>>
}

export const paxTypes: Pax[] = ['Adult', 'Senior', 'Child']

export function limits(slot?: Slot | null) {
  const value = slot?.remaining
  if (!slot) return { Adult: 0, Senior: 0, Child: 0 }
  if (typeof value === 'number') return { Adult: value, Senior: value, Child: value }
  return {
    Adult: Number(value?.Adult || 0),
    Senior: Number(value?.Senior || 0),
    Child: Number(value?.Child || 0)
  }
}

export function seats(slot?: Slot | null) {
  const limit = limits(slot)
  return Math.max(limit.Adult, limit.Senior, limit.Child)
}

export function cleanPax(pax: Record<string, unknown>) {
  return paxTypes.reduce<Record<Pax, number>>((next, type) => {
    next[type] = Math.max(0, Math.trunc(Number(pax?.[type]) || 0))
    return next
  }, { Adult: 0, Senior: 0, Child: 0 })
}

export async function tickete<T>(path: string, init: RequestInit = {}) {
  const config = useRuntimeConfig()
  const key = config.ticketeApiKey
  if (!key) {
    throw createError({ statusCode: 500, statusMessage: 'Missing TICKETE_API_KEY' })
  }

  const res = await fetch(`${config.ticketeBaseUrl}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      'x-api-key': key,
      ...(init.headers || {})
    }
  })
  const body = await res.json().catch(() => null)

  if (!res.ok) {
    const msg = body?.message || body?.error || 'Tickete request failed'
    throw createError({ statusCode: res.status, statusMessage: msg, data: body })
  }

  return body as T
}
