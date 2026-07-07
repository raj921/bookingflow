import { limits, seats, tickete, type Slot } from '../../utils/tickete'

export default defineEventHandler(async event => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isFinite(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid experience id' })
  }

  const [detail, slots] = await Promise.all([
    tickete<{ experience: Record<string, unknown> }>(`/api/experiences/${id}`),
    tickete<{ slots: Slot[] }>(`/api/experiences/${id}/slots`)
  ])

  return {
    experience: detail.experience,
    slots: slots.slots.map(slot => ({
      ...slot,
      limits: limits(slot),
      seats: seats(slot)
    }))
  }
})
