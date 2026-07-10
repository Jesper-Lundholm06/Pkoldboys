import { useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { buttonClass } from '../components/ui/buttonStyles'
import StateMessage from '../components/ui/StateMessage'

export default function LoggaIn() {
  const { user, loading, isAdmin, signIn } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!loading && user) {
    return <Navigate to={isAdmin ? '/admin' : '/medlem'} replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)

    const { data, error } = await signIn(email, password)

    setSubmitting(false)

    if (error || !data.user) {
      setError('Fel e-post eller lösenord.')
      return
    }

    const loggedInAsAdmin = data.user.email === 'admin@pkoldboys.se'
    showToast(loggedInAsAdmin ? 'Välkommen, admin!' : 'Välkommen, medlem!')
    navigate(loggedInAsAdmin ? '/admin' : '/medlem')
  }

  return (
    <div>
      <div className="card mx-auto mt-6 w-full max-w-md">
        <h1>Logga in</h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="login-email" className="label">
              E-post
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="login-password" className="label">
              Lösenord
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
