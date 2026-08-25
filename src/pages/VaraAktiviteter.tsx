import Calendar from '../components/calendar/Calendar'
import ExternalLink from '../components/ui/ExternalLink'

export default function VaraAktiviteter() {
  return (
    <div>
      <h1>Våra aktiviteter</h1>

      <section className="mt-6">
        <h2>Riksserien</h2>
        <div className="card">
          <ul className="flex flex-col gap-2 text-lg">
            <li>
              <ExternalLink href="https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8614">
                Riksserien Division 3
              </ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8617">
                Riksserien Division 6
              </ExternalLink>
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2>Kalender</h2>
        <Calendar />
      </section>
    </div>
  )
}
