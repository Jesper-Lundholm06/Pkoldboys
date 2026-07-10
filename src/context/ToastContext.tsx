import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { ReactNode } from 'react'

const TOAST_DURATION_MS = 3000

type ToastContextValue = {
  showToast: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showToast = useCallback((text: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setMessage(text)
    timeoutRef.current = setTimeout(() => setMessage(null), TOAST_DURATION_MS)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="fixed left-1/2 top-20 z-50 -translate-x-1/2"
      >
        {message && (
          <div className="rounded-lg border-b-2 border-accent bg-primary px-8 py-4 text-xl font-semibold text-white shadow-lg">
            {message}
          </div>
        )}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
