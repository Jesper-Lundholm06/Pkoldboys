export type ButtonVariant = 'primary' | 'secondary' | 'danger'

const base =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-6 py-3 text-lg font-semibold shadow-sm transition-colors disabled:cursor-not-allowed disabled:opacity-60'

const variants: Record<ButtonVariant, string> = {
  primary: 'border-b-2 border-accent bg-primary text-white hover:brightness-110',
  secondary: 'border-2 border-primary bg-white text-primary hover:bg-gray-50',
  danger: 'border-2 border-danger bg-white text-danger hover:bg-danger-light',
}

export function buttonClass(variant: ButtonVariant = 'primary', extra = '') {
  return `${base} ${variants[variant]} ${extra}`.trim()
}
