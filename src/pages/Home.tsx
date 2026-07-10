import { useEffect, useState } from 'react'
import logo from '../assets/logo.jpg'
import { fetchTable } from '../lib/fetchTable'
import { formatDateTime } from '../lib/formatDateTime'
import type { News } from '../data/news'
import StateMessage from '../components/ui/StateMessage'

export default function Home() {
  const [news, setNews] = useState<News[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTable<News>('news', { column: 'created_at', ascending: false }).then(
      ({ data, error }) => {
        setNews(data)
        setError(error)
      },
    )
  }, [])

  return (
    <div>
      <h1>PK Oldboys</h1>

      <img
        src={logo}
        alt="PK Oldboys Bowling logga"
        className="my-8 w-full rounded-xl shadow-md"
      />

      <p className="text-lg leading-relaxed text-gray-700">
        Föreningen bildad 1982 och har idag ca 25 aktiva utövare. PK Oldboys
        spelar senior bowling i Söderköping på{' '}
        <a
          href="https://fixbowlingcenter.se"
          target="_blank"
          rel="noopener noreferrer"
        >
          Fix Bowlingcenter
        </a>{' '}
        tisdagar 9.00 och 10.30 samt fredagar 12.00.
      </p>

      <section className="mt-12">
        <h2>Nyheter</h2>

        {news === null && error === null && (
          <StateMessage>Laddar nyheter…</StateMessage>
        )}

        {error !== null && (
          <StateMessage variant="error">
            Kunde inte hämta nyheter just nu.
          </StateMessage>
        )}

        {news !== null && error === null && news.length === 0 && (
          <StateMessage>Inga nyheter just nu.</StateMessage>
        )}

        {news !== null && error === null && news.length > 0 && (
          <ul className="flex flex-col gap-4">
            {news.map((item) => (
              <li key={item.id} className="card">
                <h3 className="text-xl font-bold text-primary">
                  {item.title}
                </h3>
                <p className="mt-1 text-base text-gray-500">
                  {formatDateTime(item.created_at)}
                </p>
                <p className="mt-2 text-lg text-gray-700">{item.body}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
