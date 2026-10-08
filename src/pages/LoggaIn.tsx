import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { buttonClass } from '../components/ui/buttonStyles'
import StateMessage from '../components/ui/StateMessage'

// The two shared Supabase accounts. Users only type a code (= the account's password,
// validated server-side by Supabase); we try the member account first, then admin.
const MEMBER_EMAIL = 'medlem@pkoldboys.se'
const ADMIN_EMAIL = 'admin@pkoldboys.se'

export default function LoggaIn() {
  const { user, loading, isAdmin, signIn } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [code, setCode] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!loading && user) {
    return <Navigate to={isAdmin ? '/admin' : '/medlem'} replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    let result = await signIn(MEMBER_EMAIL, code)

    // Only fall through to the admin account on wrong credentials (HTTP 400), not on
    // network/server errors.
    if (result.error && result.error.status === 400) {
      result = await signIn(ADMIN_EMAIL, code)
    }

    setSubmitting(false)

    const { data, error } = result

    if (error || !data.user) {
      setError(
        error && error.status !== 400
          ? 'Kunde inte logga in just nu. Försök igen om en stund.'
          : 'Fel kod, försök igen.',
      )
      return
    }

    const loggedInAsAdmin = data.user.email === ADMIN_EMAIL
    showToast(loggedInAsAdmin ? 'Välkommen, admin!' : 'Välkommen, medlem!')
    navigate(loggedInAsAdmin ? '/admin' : '/medlem')
  }

  return (
    <div>
      <div className="card mx-auto mt-6 w-full max-w-md">
        <h1>Logga in</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="login-code" className="label">
              Kod
            </label>
            <p id="login-code-hint" className="text-lg text-gray-700">
              Skriv din kod för att logga in.
            </p>
            <input
              id="login-code"
              type="password"
              required
              autoComplete="current-password"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-describedby="login-code-hint"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={buttonClass('primary', 'w-full')}
          >
            {submitting ? 'Loggar in…' : 'Logga in'}
          </button>

          {error && <StateMessage variant="error">{error}</StateMessage>}
        </form>
      </div>
    </div>
  )
}
