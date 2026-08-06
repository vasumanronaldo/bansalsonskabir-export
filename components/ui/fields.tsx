// Form field primitives (docs/02 § Component inventory). Hairline underline,
// mono label, zero radius, 16px input to avoid iOS zoom. Forward refs so
// react-hook-form's register() attaches cleanly.
import { forwardRef, type ReactNode } from 'react'

function Frame({ label, htmlFor, error, optional, children }: { label: string; htmlFor: string; error?: string; optional?: boolean; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <label htmlFor={htmlFor} className="flex items-baseline justify-between font-[family-name:var(--font-mono)] text-[length:var(--text-label)] uppercase tracking-[0.12em] text-stone">
        <span>{label}</span>
        {optional && <span className="text-faint normal-case tracking-normal">Optional</span>}
      </label>
      {children}
      {error && <span className="font-[family-name:var(--font-body)] text-[length:var(--text-body-sm)] text-[var(--color-danger,#e5484d)]">{error}</span>}
    </div>
  )
}

const inputCls =
  'w-full border-b border-[var(--color-hairline)] bg-transparent py-2.5 text-[16px] text-charcoal ' +
  'outline-none transition-colors duration-200 placeholder:text-faint focus:border-gold'

export const FieldText = forwardRef<HTMLInputElement, { label: string; error?: string; optional?: boolean } & React.InputHTMLAttributes<HTMLInputElement>>(
  function FieldText({ label, error, optional, id, ...rest }, ref) {
    const fid = id || rest.name || label
    return (
      <Frame label={label} htmlFor={fid!} error={error} optional={optional}>
        <input id={fid} ref={ref} className={inputCls} {...rest} />
      </Frame>
    )
  },
)

export const FieldDate = forwardRef<HTMLInputElement, { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>>(
  function FieldDate({ label, error, id, ...rest }, ref) {
    const fid = id || rest.name || label
    return (
      <Frame label={label} htmlFor={fid!} error={error}>
        <input id={fid} ref={ref} type="date" className={inputCls} {...rest} />
      </Frame>
    )
  },
)

export const FieldSelect = forwardRef<HTMLSelectElement, { label: string; error?: string; optional?: boolean; options: Array<{ value: string; label: string }>; placeholder?: string } & React.SelectHTMLAttributes<HTMLSelectElement>>(
  function FieldSelect({ label, error, optional, options, placeholder, id, ...rest }, ref) {
    const fid = id || rest.name || label
    return (
      <Frame label={label} htmlFor={fid!} error={error} optional={optional}>
        <select id={fid} ref={ref} className={inputCls} defaultValue="" {...rest}>
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </Frame>
    )
  },
)

export const FieldTextarea = forwardRef<HTMLTextAreaElement, { label: string; error?: string; optional?: boolean } & React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function FieldTextarea({ label, error, optional, id, ...rest }, ref) {
    const fid = id || rest.name || label
    return (
      <Frame label={label} htmlFor={fid!} error={error} optional={optional}>
        <textarea id={fid} ref={ref} rows={4} className={`${inputCls} resize-y`} {...rest} />
      </Frame>
    )
  },
)
