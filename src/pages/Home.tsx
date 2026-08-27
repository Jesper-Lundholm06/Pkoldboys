import { useEffect, useState } from 'react'
import logo from '../assets/logo.jpg'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { fetchTable } from '../lib/fetchTable'
import { formatDateTime, getEventDayMonth } from '../lib/formatDateTime'
import type { News } from '../data/news'
import type { Event } from '../data/events'
import StateMessage from '../components/ui/StateMessage'
import { buttonClass } from '../components/ui/buttonStyles'
import NewsForm from '../components/news/NewsForm'
// Reuses the modal built for the inline calendar admin controls (Step 13f) so both
// inline-admin features share one accessible modal implementation.
import CalendarEventModal from '../components/calendar/CalendarEventModal'

// event_time is free text ("16:00", "16.00", "9.00" …) — normalize to
// minutes-since-midnight for sorting; missing/unparseable times sort last.
function parseTimeToMinutes(time: string | null): number {
  if (!time) return Infinity
  const [hoursStr, minutesStr] = time.trim().replace('.', ':').split(':')
  const hours = Number(hoursStr)
  const minutes = Number(minutesStr)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return Infinity
  return hours * 60 + minutes
}

export default function Home() {
  const { isAdmin } = useAuth()

  const [news, setNews] = useState<News[] | null>(null)
  const [newsError, setNewsError] = useState<string | null>(null)
  const [newsReloadKey, setNewsReloadKey] = useState(0)
  const [newsActionError, setNewsActionError] = useState<string | null>(null)

  // undefined = modal closed, null = modal open in create mode, a news item = modal
  // open in edit mode for that item.
  const [modalNewsItem, setModalNewsItem] = useState<News | null | undefined>(undefined)

  const [events, setEvents] = useState<Event[] | null>(null)
  const [eventsError, setEventsError] = useState<string | null>(null)

  function refreshNews() {
    setNewsReloadKey((key) => key + 1)
  }

  function handleNewsSaved() {
    setModalNewsItem(undefined)
    refreshNews()
  }

  async function handleDeleteNews(id: string) {
    if (!window.confirm('Ta bort nyheten?')) {
      return
    }

    setNewsActionError(null)
    const { error: deleteError } = await supabase.from('news').delete().eq('id', id)

    if (deleteError) {
      setNewsActionError('Kunde inte ta bort nyheten just nu.')
      return
    }

    if (modalNewsItem && modalNewsItem.id === id) {
      setModalNewsItem(undefined)
    }

    refreshNews()
  }

  useEffect(() => {
    fetchTable<News>('news', { column: 'created_at', ascending: false }).then(
      ({ data, error }) => {
        setNews(data)
        setNewsError(error)
      },
    )
  }, [newsReloadKey])

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)

    supabase
      .from('events')
      .select('*')
      .gte('event_date', today)
      .order('event_date', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to fetch "events":', error)
          setEventsError(error.message)
          return
        }
        const sorted = [...(data as Event[])].sort((a, b) => {
          if (a.event_date !== b.event_date) {
            return a.event_date < b.event_date ? -1 : 1
          }
          return parseTimeToMinutes(a.event_time) - parseTimeToMinutes(b.event_time)
        })
        setEvents(sorted)
      })
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
        <h2>Kommande händelser</h2>

        {events === null && eventsError === null && (
          <StateMessage>Laddar händelser…</StateMessage>
        )}

        {eventsError !== null && (
          <StateMessage variant="error">
            Kunde inte hämta händelser just nu.
          </StateMessage>
        )}

        {events !== null && eventsError === null && events.length === 0 && (
          <StateMessage>Det finns inga planerade aktiviteter just nu.</StateMessage>
        )}

        {events !== null && eventsError === null && events.length > 0 && (
          <ul className="flex flex-col gap-2">
            {events.map((event) => {
              const { day, month } = getEventDayMonth(event.event_date)

              return (
                <li
                  key={event.id}
                  className="flex items-start gap-4 rounded-md border-l-4 border-[#d4af37] bg-[#eef5fb] px-4 py-3"
                >
                  <div className="w-20 shrink-0 border-r border-[#1d3557]/20 pr-4 text-center">
                    <p className="text-2xl font-bold leading-none text-[#1d3557]">
                      {day}
                    </p>
                    <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-[#1d3557]/70">
                      {month}
                    </p>
                    {event.event_time && (
                      <p className="mt-1 text-base font-bold text-[#1d3557]">
                        {event.event_time}
                      </p>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-base font-bold text-[#1d3557]">
                      {event.title}
                    </p>
                    {event.location && (
                      <p className="mt-1 text-sm font-semibold text-[#1d3557]/80">
                        {event.location}
                      </p>
                    )}
                    {event.description && (
                      <p className="mt-1 text-sm text-[#1d3557]/70">
                        {event.description}
                      </p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2>Nyheter</h2>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setModalNewsItem(null)}
              className={buttonClass('primary')}
            >
              + Ny nyhet
            </button>
          )}
        </div>

        {isAdmin && newsActionError && (
          <div className="mb-4">
            <StateMessage variant="error">{newsActionError}</StateMessage>
          </div>
        )}

        {news === null && newsError === null && (
          <StateMessage>Laddar nyheter…</StateMessage>
        )}

        {newsError !== null && (
          <StateMessage variant="error">
            Kunde inte hämta nyheter just nu.
          </StateMessage>
        )}

        {news !== null && newsError === null && news.length === 0 && (
          <StateMessage>Inga nyheter just nu.</StateMessage>
        )}

        {news !== null && newsError === null && news.length > 0 && (
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

                {isAdmin && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setModalNewsItem(item)}
                      className="min-h-9 rounded-md border-2 border-primary bg-white px-3 py-1 text-sm font-semibold text-primary hover:bg-gray-50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      Ändra
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteNews(item.id)}
                      className="min-h-9 rounded-md border-2 border-danger bg-white px-3 py-1 text-sm font-semibold text-danger hover:bg-danger-light focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      Ta bort
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {isAdmin && modalNewsItem !== undefined && (
          <CalendarEventModal
            title={modalNewsItem ? 'Ändra nyhet' : 'Ny nyhet'}
            onClose={() => setModalNewsItem(undefined)}
          >
            <NewsForm
              key={modalNewsItem?.id ?? 'new'}
              item={modalNewsItem}
              onSaved={handleNewsSaved}
              onCancel={() => setModalNewsItem(undefined)}
            />
          </CalendarEventModal>
        )}
      </section>
    </div>
  )
}
