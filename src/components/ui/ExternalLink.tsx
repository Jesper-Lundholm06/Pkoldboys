import type { ReactNode } from 'react'

type ExternalLinkProps = {
  href: string
  children: ReactNode
  className?: string
}

export default function ExternalLink({ href, children, className = '' }: ExternalLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 font-medium text-primary underline underline-offset-2 transition-opacity hover:opacity-75 ${className}`}
    >
      {children}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-4 w-4 shrink-0 fill-none stroke-current stroke-2"
      >
        <path d="M7 17 17 7M9 7h8v8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="sr-only"> (öppnas i ny flik)</span>
    </a>
  )
}
