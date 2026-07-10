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
      <div aria-live="polite" role="status" className="fixed inset-x-0 top-0 z-50">
        {message && (
          <div className="animate-[toast-slide-down_0.4s_ease-out] border-b-2 border-[#d4af37] bg-[#eef5fb] px-6 py-3 text-center text-2xl font-bold text-[#1d3557] shadow-lg sm:px-10">
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
