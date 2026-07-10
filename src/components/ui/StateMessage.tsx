import type { ReactNode } from 'react'

type StateMessageVariant = 'info' | 'success' | 'error'

type StateMessageProps = {
  variant?: StateMessageVariant
  children: ReactNode
}

const variants: Record<StateMessageVariant, string> = {
  info: 'border-gray-200 bg-gray-50 text-gray-700',
  success: 'border-accent bg-gray-50 text-primary',
  error: 'border-danger bg-danger-light text-danger',
}

export default function StateMessage({ variant = 'info', children }: StateMessageProps) {
  return (
    <p className={`rounded-md border px-4 py-3 text-lg ${variants[variant]}`}>
      {children}
    </p>
  )
}
