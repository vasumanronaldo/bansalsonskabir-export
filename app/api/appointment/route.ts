// POST /api/appointment. Validate → honeypot + timing → rate limit 5/hr/IP →
// PERSIST a row to D1 `enquiries` (always — this is the record) → notify by email
// via Resend and stamp notified_at on success. The visitor never sees a failure;
// a submission is never silently lost.
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { getCloudflareContext } from '@opennextjs/cloudflare'
import { appointmentSchema, normalizeAppointment } from '@/lib/appointment'
import { rateLimit } from '@/lib/rate-limit'
import { getSettings } from '@/lib/client-content'
import { clientConfirmation, internalNotification } from '@/lib/emails/appointment'

export const dynamic = 'force-dynamic'

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

  // Honeypot + timing: return a success shape so bots aren't taught the trap.
  const tooFast = typeof data.renderedAt === 'number' && Date.now() - data.renderedAt < 3000
  if (data.company || tooFast) {
    return NextResponse.json({ ok: true })
  }

  // Rate limit 5/hr/IP.
  if (!rateLimit(`appt:${clientIp(req)}`).ok) {
    return NextResponse.json({ ok: false, error: 'Too many requests. Please call or WhatsApp us.' }, { status: 429 })
  }

  const { data: settings } = getSettings()
  const { env } = getCloudflareContext()
  const id = crypto.randomUUID()
  const submittedAt = new Date().toISOString()

  // 1) Persist to D1 — ALWAYS. The enquiry is the record; email is a notification.
  let persisted = false
  try {
    await env.DB.prepare(
      `INSERT INTO enquiries
         (id, name, phone, email, preferred_date, preferred_time, occasion, interest, budget, requirement, contact_method, status, submitted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`,
    )
      .bind(
        id,
        data.name,
        data.phone,
        data.email ?? null,
        data.preferredDate,
        data.preferredTime,
        data.occasion,
        JSON.stringify(data.interest ?? []),
        data.budget ?? null,
        data.requirement ?? null,
        data.contactMethod,
        submittedAt,
      )
      .run()
    persisted = true
  } catch (e) {
    // Last-resort so a request is never truly lost even if D1 is momentarily down.
    console.error('appointment: D1 write FAILED', e, JSON.stringify({ ...data, company: undefined, renderedAt: undefined }))
  }

  // 2) Notify by email (Resend). On success, stamp notified_at.
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
      if (persisted) {
        await env.DB.prepare('UPDATE enquiries SET notified_at = ? WHERE id = ?').bind(new Date().toISOString(), id).run()
      }
    } catch (e) {
      console.error('appointment: email send failed (row still persisted)', e)
    }
  } else {
    console.warn('appointment: RESEND_API_KEY not set — row persisted, no email sent. id=', id)
  }

  return NextResponse.json({ ok: true, contactMethod: data.contactMethod })
}
