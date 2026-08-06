// POST /api/appointment (docs/03 § Route handlers). Zod validate → honeypot +
// timing check → rate limit 5/hr/IP → Sanity appointmentRequest doc → Resend
// (client confirmation + internal notification). Degrades gracefully when a
// service isn't configured yet, so the visitor never sees a failure and the
// request is never silently lost (it's logged server-side).
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { appointmentSchema, normalizeAppointment } from '@/lib/appointment'
import { rateLimit } from '@/lib/rate-limit'
import { getSettings } from '@/lib/client-content'
import { getWriteClient } from '@/sanity/lib/write'
import { clientConfirmation, internalNotification } from '@/lib/emails/appointment'

export const runtime = 'nodejs'

function clientIp(req: Request): string {
  const fwd = req.headers.get('x-forwarded-for')
  return (fwd ? fwd.split(',')[0] : '')?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }

  const parsed = appointmentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ ok: false, errors: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const data = normalizeAppointment(parsed.data)

  // Honeypot + timing: bots fill hidden fields and submit instantly. Return a
  // success shape so we don't teach them what tripped the filter — but do nothing.
  const tooFast = typeof data.renderedAt === 'number' && Date.now() - data.renderedAt < 3000
  if (data.company || tooFast) {
    return NextResponse.json({ ok: true })
  }

  // Rate limit 5/hr/IP.
  if (!rateLimit(`appt:${clientIp(req)}`).ok) {
    return NextResponse.json({ ok: false, error: 'Too many requests. Please call or WhatsApp us.' }, { status: 429 })
  }

  const { data: settings } = getSettings()
  const submittedAt = new Date().toISOString()

  // 1) Persist to Sanity (if configured).
  try {
    const sanity = getWriteClient()
    if (sanity) {
      await sanity.create({
        _type: 'appointmentRequest',
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        occasion: data.occasion,
        budgetRange: data.budget || undefined,
        interest: data.interest?.join(', ') || undefined,
        requirement: data.requirement || undefined,
        contactMethod: data.contactMethod,
        status: 'new',
        submittedAt,
      })
    }
  } catch (e) {
    console.error('appointment: sanity write failed', e)
  }

  // 2) Email (if configured).
  const resendKey = process.env.RESEND_API_KEY
  const notifyTo = process.env.APPOINTMENT_NOTIFY_EMAIL || settings.email
  const from = process.env.APPOINTMENT_FROM || 'Bansal Sons <onboarding@resend.dev>'
  if (resendKey) {
    try {
      const resend = new Resend(resendKey)
      const internal = internalNotification(data)
      await resend.emails.send({ from, to: notifyTo, subject: internal.subject, html: internal.html, text: internal.text, replyTo: data.email || undefined })
      if (data.email) {
        const confirm = clientConfirmation(data, settings)
        await resend.emails.send({ from, to: data.email, subject: confirm.subject, html: confirm.html, text: confirm.text })
      }
    } catch (e) {
      console.error('appointment: email send failed', e)
    }
  } else {
    // Nothing configured yet — never lose the request.
    console.info('appointment (no email configured):', JSON.stringify({ ...data, company: undefined, renderedAt: undefined }))
  }

  return NextResponse.json({ ok: true, contactMethod: data.contactMethod })
}
