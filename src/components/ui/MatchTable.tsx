import type { Match } from '../../data/matches'
import StateMessage from './StateMessage'

type MatchTableProps = {
  matches: Match[]
}

export default function MatchTable({ matches }: MatchTableProps) {
  if (matches.length === 0) {
    return <StateMessage>Inga matcher inlagda än</StateMessage>
  }

  return (
    <>
      {/* Table view — wider screens */}
      <div className="card hidden overflow-x-auto md:block">
        <table className="w-full border-collapse text-lg">
          <thead>
            <tr className="border-b-2 border-primary text-left">
              <th className="py-3 pr-4">Datum</th>
              <th className="py-3 pr-4">Tid</th>
              <th className="py-3 pr-4">Hemma</th>
              <th className="py-3 pr-4">Borta</th>
              <th className="py-3 pr-4">Plats</th>
              <th className="py-3 pr-4">Resultat</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id} className="border-b border-gray-200 even:bg-gray-200">
                <td className="py-3 pr-4">{match.date}</td>
                <td className="py-3 pr-4">{match.time}</td>
                <td className="py-3 pr-4">{match.home}</td>
                <td className="py-3 pr-4">{match.away}</td>
                <td className="py-3 pr-4">{match.location}</td>
                <td className="py-3 pr-4">{match.result}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stacked cards — narrow screens */}
      <ul className="flex flex-col gap-4 md:hidden">
        {matches.map((match) => (
          <li key={match.id} className="card">
            <p className="text-xl font-bold text-primary">
              {match.home} – {match.away}
            </p>
            <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-lg">
              <dt className="font-medium text-primary">Datum</dt>
              <dd>{match.date}</dd>
              <dt className="font-medium text-primary">Tid</dt>
              <dd>{match.time}</dd>
              <dt className="font-medium text-primary">Plats</dt>
              <dd>{match.location}</dd>
              <dt className="font-medium text-primary">Resultat</dt>
              <dd>{match.result}</dd>
            </dl>
          </li>
        ))}
      </ul>
    </>
  )
}
