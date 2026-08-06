// POST /api/newsletter (docs/03 § Route handlers) — double opt-in. Validate +
// honeypot/timing + rate limit, then email a signed confirmation link. The
// contact is only added to the Resend Audience after the link is clicked
// (see ./confirm). Degrades gracefully (logs) when Resend isn't configured.
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { rateLimit } from '@/lib/rate-limit'
import { signValue } from '@/lib/sign'
import { getSettings } from '@/lib/client-content'

export const runtime = 'nodejs'

const schema = z.object({
  email: z.string().refine((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim()), 'Enter a valid email'),
  company: z.string().optional(), // honeypot
  renderedAt: z.number().optional(),
})

function ip(req: Request) {
  const f = req.headers.get('x-forwarded-for')
  return (f ? f.split(',')[0] : '')?.trim() || req.headers.get('x-real-ip') || 'unknown'
}

export async function POST(req: Request) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid request' }, { status: 400 })
  }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, error: 'Enter a valid email' }, { status: 400 })
  const { email, company, renderedAt } = parsed.data

  const tooFast = typeof renderedAt === 'number' && Date.now() - renderedAt < 3000
  if (company || tooFast) return NextResponse.json({ ok: true }) // honeypot: silent

  if (!rateLimit(`news:${ip(req)}`, 5).ok) {
    return NextResponse.json({ ok: false, error: 'Too many requests.' }, { status: 429 })
  }

  const clean = email.trim().toLowerCase()
  const token = await signValue(clean)
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const confirmUrl = `${base}/api/newsletter/confirm?e=${encodeURIComponent(clean)}&t=${token}`

  const resendKey = process.env.RESEND_API_KEY
  const from = process.env.APPOINTMENT_FROM || 'Bansal Sons <onboarding@resend.dev>'
  const { data: s } = getSettings()

  if (resendKey) {
    try {
      const resend = new Resend(resendKey)
      await resend.emails.send({
        from,
        to: clean,
        subject: `Confirm your subscription — ${s.legalName}`,
        html: `<div style="font-family:Georgia,serif;color:#22211f;max-width:520px;line-height:1.6"><p>Please confirm you would like the occasional letter from ${s.legalName}.</p><p><a href="${confirmUrl}" style="color:#b08d57">Confirm subscription</a></p><p style="color:#8c8a85;font-size:14px">If this wasn't you, ignore this email — nothing happens without the click.</p></div>`,
        text: `Confirm your subscription to ${s.legalName}: ${confirmUrl}`,
      })
    } catch (e) {
      console.error('newsletter: confirm email failed', e)
    }
  } else {
    console.info('newsletter (no email configured) — confirm link:', confirmUrl)
  }

  return NextResponse.json({ ok: true })
}
