// Shared appointment schema + field vocab (docs/04 § Appointment). Used by the
// client form (react-hook-form) and the server handler — one source of truth.
import { z } from 'zod'
import { CATEGORY_LIST } from '@/sanity/schemaTypes/piece'

export const TIME_VALUES = ['morning', 'afternoon', 'evening'] as const

export const OCCASIONS = [
  'Bridal', 'Engagement', 'Gift', 'Everyday',
  'Remodelling an existing piece', 'Just looking', 'Other',
] as const

export const CONTACT_METHODS = ['Phone', 'WhatsApp', 'Email'] as const

const todayIso = () => new Date().toISOString().slice(0, 10)
const maxDateIso = () => new Date(Date.now() + 90 * 86400_000).toISOString().slice(0, 10)

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Indian mobile, optionally +91 prefixed.
const phoneRe = /^(?:\+91[\s-]?)?[6-9]\d{9}$/

// No .transform()/.default() here: they'd make the form's input type diverge
// from the parsed output type and break the react-hook-form resolver generic.
// Normalisation (phone stripping, empty→undefined) happens server-side.
export const appointmentSchema = z.object({
  name: z.string().trim().min(1, 'Please tell us your name').max(120),
  phone: z
    .string()
    .min(1, 'Please give us a number we can reach you on')
    .refine((s) => phoneRe.test(s.replace(/[\s-]/g, '')), 'Enter a valid mobile number'),
  email: z
    .string()
    .optional()
    .refine((s) => !s || emailRe.test(s.trim()), 'Enter a valid email, or leave it blank'),
  preferredDate: z
    .string()
    .refine((s) => s >= todayIso(), 'Please choose today or a future date')
    .refine((s) => s <= maxDateIso(), 'Please choose a date within the next 90 days'),
  preferredTime: z.enum(TIME_VALUES),
  occasion: z.enum(OCCASIONS),
  interest: z.array(z.enum(CATEGORY_LIST)).optional(),
  budget: z.string().max(120).optional(),
  requirement: z.string().max(2000).optional(),
  contactMethod: z.enum(CONTACT_METHODS),
  // anti-spam honeypot — accepted by the schema so a filled value doesn't reveal
  // the trap; the handler checks it and silently drops (returns ok).
  company: z.string().optional(),
  // client render time (ms epoch) for the timing check
  renderedAt: z.number().optional(),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>

/** Normalise a validated payload for storage/email. */
export function normalizeAppointment(d: AppointmentInput) {
  return {
    ...d,
    phone: d.phone.replace(/[\s-]/g, ''),
    email: d.email?.trim() || undefined,
    interest: d.interest ?? [],
    budget: d.budget?.trim() || undefined,
    requirement: d.requirement?.trim() || undefined,
  }
}

export const dateBounds = () => ({ min: todayIso(), max: maxDateIso() })
