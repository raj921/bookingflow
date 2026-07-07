import { cleanPax, paxTypes, tickete } from '../utils/tickete'

export default defineEventHandler(async event => {
  const body = await readBody(event)
  const pax = cleanPax(body?.pax || {})
  const count = paxTypes.reduce((sum, type) => sum + pax[type], 0)

  if (!body?.experienceId || !body?.slotId || !body?.customerName || !body?.customerEmail) {
    throw createError({ statusCode: 400, statusMessage: 'Add your slot, name, and email.' })
  }

  if (count < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Choose at least one guest.' })
  }

  return tickete('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({
      experienceId: Number(body.experienceId),
      slotId: String(body.slotId),
      pax,
      customerName: String(body.customerName).trim(),
      customerEmail: String(body.customerEmail).trim()
    })
  })
})
