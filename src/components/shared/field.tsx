import { AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useState, type ComponentProps, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={htmlFor} className={error ? 'text-foreground' : undefined}>
        {label}
        {required && <span className="text-primary/80">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-[11px] leading-relaxed text-muted-foreground/80">{hint}</p>}
      {error && (
        <p
          id={`${htmlFor}-error`}
          role="alert"
          className="flex items-start gap-1.5 text-[11px] leading-relaxed text-destructive"
        >
          <AlertCircle className="mt-px size-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

export function FormError({ message }: { message?: string | null }) {
  if (!message) return null

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/25 bg-destructive/[0.08] px-3.5 py-3 text-xs leading-relaxed text-destructive"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  )
}

export function PasswordInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('pr-10', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
        aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
