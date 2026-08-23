// Transactional email content (docs/03: client confirmation + internal
// notification). Plain, restrained HTML — the house voice, no marketing chrome.
import type { AppointmentInput } from '@/lib/appointment'

interface Settings {
  legalName: string
  phone: string
  whatsapp: string
  email: string
  address: { line1: string; line2: string; city: string; postalCode: string }
  hours: Array<{ days: string; open: string | null; close: string | null; label?: string }>
}

const TIME_LABEL: Record<string, string> = {
  morning: 'Morning · 11:00–13:00',
  afternoon: 'Afternoon · 13:00–16:00',
  evening: 'Evening · 16:00–18:30',
}
const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' })[c]!)

function shell(inner: string): string {
  return `<div style="font-family:Georgia,'Times New Roman',serif;color:#22211f;max-width:560px;margin:0 auto;padding:8px 4px;line-height:1.6">${inner}</div>`
}
function rule() {
  return `<div style="height:1px;background:#22211f1f;margin:20px 0"></div>`
}

/** Sent to the visitor. */
export function clientConfirmation(d: AppointmentInput, s: Settings) {
  const when = `${d.preferredDate}, ${TIME_LABEL[d.preferredTime] ?? d.preferredTime}`
  const inner = `
    <p style="font-size:20px;margin:0 0 16px">Thank you — we have your request.</p>
    <p>We will contact you once to confirm, and once more on the day. We do not call after that, and we do not share your details with anyone.</p>
    ${rule()}
    <p style="margin:0 0 6px"><strong>Requested</strong></p>
    <p style="margin:0;color:#555">${esc(when)}<br/>Occasion: ${esc(d.occasion)}<br/>Preferred contact: ${esc(d.contactMethod)}</p>
    ${rule()}
    <p style="margin:0 0 6px"><strong>${esc(s.legalName)}</strong></p>
    <p style="margin:0;color:#555">${esc(s.address.line1)}, ${esc(s.address.line2)}<br/>${esc(s.address.city)} ${esc(s.address.postalCode)}<br/>
      ${s.hours.map((h) => `${esc(h.days)}: ${h.open && h.close ? `${h.open}–${h.close}` : esc(h.label ?? 'Closed')}`).join('<br/>')}
    </p>
    <p style="margin:16px 0 0;color:#555">If it is urgent, call or WhatsApp <a href="tel:${s.phone}" style="color:#b08d57">${esc(s.phone)}</a>.</p>`
  return {
    subject: `Your appointment request — ${s.legalName}`,
    html: shell(inner),
    text: `Thank you — we have your request.\n\nWe will contact you once to confirm, and once more on the day.\n\nRequested: ${when}\nOccasion: ${d.occasion}\nPreferred contact: ${d.contactMethod}\n\n${s.legalName}\n${s.address.line1}, ${s.address.line2}, ${s.address.city} ${s.address.postalCode}\n\nUrgent? Call/WhatsApp ${s.phone}.`,
  }
}

/** Sent to the house. */
export function internalNotification(d: AppointmentInput) {
  const when = `${d.preferredDate}, ${TIME_LABEL[d.preferredTime] ?? d.preferredTime}`
  const rows: Array<[string, string]> = [
    ['Name', d.name],
    ['Phone', d.phone],
    ['Email', d.email || '—'],
    ['When', when],
    ['Occasion', d.occasion],
    ['Interest', d.interest?.length ? d.interest.join(', ') : '—'],
    ['Budget', d.budget || '—'],
    ['Contact via', d.contactMethod],
    ['Requirement', d.requirement || '—'],
  ]
  // Tap-to-act links so it's actionable from a phone, no login needed.
  const digits = d.phone.replace(/\D/g, '')
  const wa = digits.length === 10 ? `91${digits}` : digits
  const btn = 'display:inline-block;padding:11px 18px;margin:0 8px 8px 0;background:#191108;color:#f4ede1;text-decoration:none;font-size:14px'
  const actions = `<p style="margin:0 0 20px">
      <a href="tel:${esc(d.phone)}" style="${btn}">Call ${esc(d.phone)}</a>
      <a href="https://wa.me/${esc(wa)}" style="${btn}">WhatsApp</a>
      ${d.email ? `<a href="mailto:${esc(d.email)}" style="${btn}">Email</a>` : ''}
    </p>`
  const inner = `
    <p style="font-size:18px;margin:0 0 16px">New appointment request</p>
    ${actions}
    <table style="width:100%;border-collapse:collapse">${rows
      .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#8c8a85;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:6px 0">${esc(v)}</td></tr>`)
      .join('')}</table>`
  return {
    subject: `Appointment: ${d.name} — ${d.preferredDate} (${d.occasion})`,
    html: shell(inner),
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
  }
}
