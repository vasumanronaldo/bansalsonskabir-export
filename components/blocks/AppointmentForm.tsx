'use client'

// Appointment form (docs/04 § Appointment). Fields exactly as specified, in
// order. Zod + react-hook-form; honeypot + timing anti-spam; success state
// replaces the form without navigating away.
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { appointmentSchema, type AppointmentInput, OCCASIONS, CONTACT_METHODS, dateBounds } from '@/lib/appointment'
import { CATEGORY_LIST } from '@/sanity/schemaTypes/piece'
import { FieldText, FieldDate, FieldSelect, FieldTextarea } from '@/components/ui/fields'
import { Display, Body, Label } from '@/components/type'

const CATEGORY_LABEL: Record<string, string> = {
  bridal: 'Bridal', diamond: 'Diamond', polki: 'Polki', kundan: 'Kundan', jadau: 'Jadau',
  temple: 'Temple', platinum: 'Platinum', gold: 'Gold', gemstone: 'Gemstone', mens: "Men's", everyday: 'Everyday',
}

export function AppointmentForm({
  timeOptions,
  contactPhone,
}: {
  timeOptions: Array<{ value: string; label: string }>
  contactPhone: string
}) {
  const [done, setDone] = useState<null | { contactMethod: string }>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const renderedAt = useRef<number>(0)
  useEffect(() => {
    renderedAt.current = Date.now()
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AppointmentInput>({ resolver: zodResolver(appointmentSchema), mode: 'onBlur' })
  const bounds = dateBounds()

  async function onSubmit(values: AppointmentInput) {
    setSubmitError(null)
    try {
      const res = await fetch('/api/appointment', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...values, renderedAt: renderedAt.current }),
      })
      const json = (await res.json()) as { ok: boolean; contactMethod?: string; error?: string }
      if (!res.ok || !json.ok) throw new Error(json.error || 'Something went wrong')
      setDone({ contactMethod: json.contactMethod || values.contactMethod })
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  if (done) {
    return (
      <div aria-live="polite">
        <Display size="sm" as="h2">
          Thank you.
        </Display>
        <Body className="mt-4">
          We have your request and will confirm within one working day on {done.contactMethod}. If it is
          urgent, call or WhatsApp <a href={`tel:${contactPhone}`} className="text-gold hover:underline">{formatPhone(contactPhone)}</a>.
        </Body>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-7">
      <Body muted>We keep one hour aside for each appointment. Nothing is obligatory and nothing is charged.</Body>

      <FieldText label="Name" autoComplete="name" {...register('name')} error={errors.name?.message} />
      <FieldText label="Phone" type="tel" inputMode="tel" placeholder="+91" autoComplete="tel" {...register('phone')} error={errors.phone?.message} />
      <FieldText label="Email" type="email" inputMode="email" optional autoComplete="email" {...register('email')} error={errors.email?.message} />

      <div className="grid gap-7 sm:grid-cols-2">
        <FieldDate label="Preferred date" min={bounds.min} max={bounds.max} {...register('preferredDate')} error={errors.preferredDate?.message} />
        <FieldSelect label="Preferred time" placeholder="Choose a time" options={timeOptions} {...register('preferredTime')} error={errors.preferredTime?.message} />
      </div>

      <FieldSelect label="Occasion" placeholder="Choose an occasion" options={OCCASIONS.map((o) => ({ value: o, label: o }))} {...register('occasion')} error={errors.occasion?.message} />

      <fieldset className="grid gap-3">
        <Label as="legend">Jewellery interest</Label>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {CATEGORY_LIST.map((c) => (
            <label key={c} className="flex items-center gap-2 font-[family-name:var(--font-body)] text-[length:var(--text-body-sm)] text-charcoal">
              <input type="checkbox" value={c} {...register('interest')} className="h-4 w-4 accent-[var(--color-gold)]" />
              {CATEGORY_LABEL[c]}
            </label>
          ))}
        </div>
      </fieldset>

      <FieldText label="Budget range" optional placeholder="However you'd like to describe it" {...register('budget')} error={errors.budget?.message} />
      <FieldTextarea label="Brief requirement" optional placeholder="Tell us what the occasion is, if you like." {...register('requirement')} error={errors.requirement?.message} />

      <fieldset className="grid gap-3">
        <Label as="legend">Preferred contact</Label>
        <div className="flex flex-wrap gap-x-6 gap-y-3">
          {CONTACT_METHODS.map((m) => (
            <label key={m} className="flex items-center gap-2 font-[family-name:var(--font-body)] text-[length:var(--text-body-sm)] text-charcoal">
              <input type="radio" value={m} {...register('contactMethod')} className="h-4 w-4 accent-[var(--color-gold)]" />
              {m}
            </label>
          ))}
        </div>
        {errors.contactMethod && <span className="text-[length:var(--text-body-sm)] text-[var(--color-danger,#e5484d)]">Please choose how we should reach you</span>}
      </fieldset>

      {/* honeypot — visually hidden, off the tab order */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Company
          <input type="text" tabIndex={-1} autoComplete="off" {...register('company')} />
        </label>
      </div>

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="group inline-flex items-center justify-center border border-gold px-6 py-3 font-[family-name:var(--font-mono)] text-[length:var(--text-label-lg)] font-medium uppercase tracking-[0.12em] text-charcoal transition-colors duration-[250ms] ease-[var(--ease-editorial)] hover:bg-gold hover:text-obsidian focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:opacity-60"
        >
          {isSubmitting ? 'Sending…' : 'Request appointment'}
        </button>
        {submitError && <p className="mt-3 text-[length:var(--text-body-sm)] text-[var(--color-danger,#e5484d)]">{submitError}</p>}
        <Body size="sm" muted className="mt-6">
          <strong className="font-medium text-charcoal">We will contact you once to confirm, and once more on the day.</strong> We do not
          call after that, and we do not share your details with anyone.
        </Body>
      </div>
    </form>
  )
}

function formatPhone(raw: string): string {
  const m = raw.match(/^(\+91)(\d{5})(\d{5})$/)
  return m ? `${m[1]} ${m[2]} ${m[3]}` : raw
}
