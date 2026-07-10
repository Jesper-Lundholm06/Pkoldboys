import { buttonClass } from '../components/ui/buttonStyles'
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

      {/* PDF link — wired to Supabase Storage in a later step */}
      <a href="#" className={buttonClass('primary', 'no-underline')}>
        Anmälningslista
      </a>

      <p className="mt-8">
        <a
          href="https://bowlit.nu/league.asp?groupi=4"
          target="_blank"
          rel="noopener noreferrer"
          className="text-lg font-medium"
        >
          Resultat
        </a>
      </p>
    </div>
  )
}
