import { buttonClass } from '../components/ui/buttonStyles'
import ExternalLink from '../components/ui/ExternalLink'
import affisch from '../assets/affish.png'

export default function Tavlingar() {
  return (
    <div>
      <h1>Tävlingar</h1>

      <img
        src={affisch}
        alt="Tävlingsaffisch: Kanalslaget 2025"
        className="my-6 w-full max-w-sm rounded-xl shadow-md"
      />

      <a
        href="/Kanalslaget_2026_anmalan.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className={buttonClass('primary', 'no-underline')}
      >
        Anmälningslista
      </a>

      <p className="mt-8 text-lg">
        <ExternalLink href="https://bowlit.nu/league.asp?groupi=4">
          Resultat
        </ExternalLink>
      </p>
    </div>
  )
}
