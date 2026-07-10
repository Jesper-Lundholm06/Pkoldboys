import { useEffect, useState } from 'react'
import MatchTable from '../components/ui/MatchTable'
import type { Match } from '../data/matches'
import { fetchTable } from '../lib/fetchTable'
import StateMessage from '../components/ui/StateMessage'

export default function VaraAktiviteter() {
  const [matches, setMatches] = useState<Match[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTable<Match>('matches', { column: 'id', ascending: true }).then(
      ({ data, error }) => {
        setMatches(data)
        setError(error)
      },
    )
  }, [])

  return (
    <div>
      <h1>Våra aktiviteter</h1>

      <section className="mt-6">
        <h2>Riksserien</h2>
        <div className="card">
          <ul className="flex flex-col gap-2 text-lg">
            <li>
              <a
                href="https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8614"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium"
              >
                Riksserien Division 3
              </a>
            </li>
            <li>
              <a
                href="https://www.sbhf.se/ligaservice/index.php/serie/index?parentId=8617"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium"
              >
                Riksserien Division 6
              </a>
            </li>
          </ul>
        </div>
      </section>

      <section className="mt-10">
        <h2>Utbytesmatcher</h2>

        {matches === null && error === null && (
          <StateMessage>Laddar matcher…</StateMessage>
        )}

        {error !== null && (
          <StateMessage variant="error">
            Kunde inte hämta matcher just nu.
          </StateMessage>
        )}

        {matches !== null && error === null && (
          <MatchTable matches={matches} />
        )}
      </section>
    </div>
  )
}
