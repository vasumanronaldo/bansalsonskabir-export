// GET /api/newsletter/confirm?e=&t= — the second step of double opt-in. Verifies
// the signed link, then adds the contact to the Resend Audience. Shows a plain
// confirmation page.
import { Resend } from 'resend'
import { verifyValue } from '@/lib/sign'

export const runtime = 'nodejs'

function page(title: string, body: string) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title><body style="font-family:Georgia,serif;color:#22211f;background:#f7f5f1;display:flex;min-height:100vh;align-items:center;justify-content:center;margin:0"><div style="max-width:34ch;padding:2rem;text-align:center"><p style="font-size:1.5rem;margin:0 0 .5rem">${title}</p><p style="color:#8c8a85;line-height:1.6">${body}</p><p><a href="/journal" style="color:#b08d57">Back to the journal</a></p></div></body>`,
    { headers: { 'content-type': 'text/html; charset=utf-8' } },
  )
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const email = (url.searchParams.get('e') || '').trim().toLowerCase()
  const token = url.searchParams.get('t') || ''
  if (!email || !token || !(await verifyValue(email, token))) {
    return page('Link not valid', 'This confirmation link is invalid or has expired. Please subscribe again.')
  }

  const resendKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID
  if (resendKey && audienceId) {
    try {
      const resend = new Resend(resendKey)
      await resend.contacts.create({ email, audienceId, unsubscribed: false })
    } catch (e) {
      console.error('newsletter confirm: audience add failed', e)
    }
  } else {
    console.info('newsletter confirmed (no audience configured):', email)
  }

  return page('You are subscribed.', 'Thank you — we will write only occasionally, and never share your address.')
}
