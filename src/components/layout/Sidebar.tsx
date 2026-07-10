import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '../../assets/logo.jpg'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

type SidebarProps = {
  isOpen: boolean
  onNavigate: () => void
}

const focusRing =
  'focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `flex min-h-11 items-center border-l-2 px-3 py-2.5 text-lg transition-colors ${focusRing} ${
    isActive
      ? 'border-accent bg-white/5 font-bold text-white'
      : 'border-transparent text-gray-200 hover:border-accent/50 hover:bg-white/10 hover:text-white'
  }`

const externalLinkClass = `flex min-h-11 items-center border-l-2 border-transparent px-3 py-2.5 text-lg text-gray-200 transition-colors hover:border-accent/50 hover:bg-white/10 hover:text-white ${focusRing}`

const logoutButtonClass = `flex min-h-11 w-full items-center border-l-2 border-transparent px-3 py-2.5 text-left text-lg text-gray-200 transition-colors hover:border-accent/50 hover:bg-white/10 hover:text-white ${focusRing}`

const ctaLinkClass = `flex min-h-11 items-center border-l-2 border-transparent border-b-2 border-b-accent px-3 py-2.5 text-lg font-bold text-white transition-colors hover:bg-white/10 ${focusRing}`

export default function Sidebar({ isOpen, onNavigate }: SidebarProps) {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()

  async function handleLogout() {
    await signOut()
    onNavigate()
    navigate('/')
    showToast('Du är utloggad.')
  }

  return (
    <nav
      id="main-sidebar"
      aria-label="Huvudmeny"
      className={`fixed inset-y-0 left-0 z-40 w-72 transform overflow-y-auto bg-primary transition-transform md:static md:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <Link
        to="/"
        onClick={onNavigate}
        className={`block px-4 py-6 text-center ${focusRing}`}
      >
        <img src={logo} alt="" className="mx-auto w-full max-w-[190px] rounded" />
        <span className="mt-3 block text-lg font-bold leading-tight text-white">
          PK Oldboys Bowling
        </span>
      </Link>
      <hr className="border-t border-white/15" />

      <div className="p-4">
        <ul className="flex flex-col">
          <li>
            <NavLink to="/" end className={navLinkClass} onClick={onNavigate}>
              PK Oldboys
            </NavLink>
          </li>
          <li>
            <NavLink to="/tavlingar" className={navLinkClass} onClick={onNavigate}>
              Tävlingar
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/vara-aktiviteter"
              className={navLinkClass}
              onClick={onNavigate}
            >
              Våra aktiviteter
            </NavLink>
          </li>
          <li>
            <a
              href="https://fixbowlingcenter.se/scoring/"
              target="_blank"
              rel="noopener noreferrer"
              className={externalLinkClass}
            >
              Scoring Online
            </a>
          </li>
          <li>
            <NavLink to="/bilder" className={navLinkClass} onClick={onNavigate}>
              Bilder
            </NavLink>
          </li>
          <li>
            <NavLink to="/dokument" className={navLinkClass} onClick={onNavigate}>
              Dokument
            </NavLink>
          </li>
          <li>
            <NavLink to="/ovrigt" className={navLinkClass} onClick={onNavigate}>
              Övrigt
            </NavLink>
          </li>
        </ul>

        {user ? (
          <div className="mt-8">
            <hr className="border-t border-accent" />
            <p className="mb-3 mt-4 px-3 text-sm font-semibold uppercase tracking-wide text-gray-300">
              Inloggad som {isAdmin ? 'admin' : 'medlem'}
            </p>
            <ul className="flex flex-col">
              {isAdmin && (
                <li>
                  <NavLink to="/admin" className={navLinkClass} onClick={onNavigate}>
                    Admin
                  </NavLink>
                </li>
              )}
              <li>
                <NavLink to="/medlem" className={navLinkClass} onClick={onNavigate}>
                  Medlemssida
                </NavLink>
              </li>
              <li>
                <button type="button" onClick={handleLogout} className={logoutButtonClass}>
                  Logga ut
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <div className="mt-8">
            <hr className="mb-4 border-t border-white/15" />
            <NavLink to="/logga-in" className={ctaLinkClass} onClick={onNavigate}>
              Logga in
            </NavLink>
          </div>
        )}
      </div>
    </nav>
  )
}
