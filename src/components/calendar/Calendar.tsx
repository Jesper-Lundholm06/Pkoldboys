import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import StateMessage from '../ui/StateMessage'

export type CalendarEvent = {
  id: number
  title: string
  event_date: string
  start_time: string | null
  end_time: string | null
  location: string | null
  tag: string | null
}

const TAG_COLORS: Record<string, string> = {
  riksserien: 'bg-blue-100 text-blue-800',
  klubbmatcher: 'bg-green-100 text-green-800',
  träning: 'bg-gray-200 text-gray-800',
}

const DEFAULT_TAG_COLOR = 'bg-amber-100 text-amber-800'

function tagColorClass(tag: string) {
  return TAG_COLORS[tag.trim().toLowerCase()] ?? DEFAULT_TAG_COLOR
}

// start_time/end_time are free text ("12:00"/"12.00") — normalize to
// minutes-since-midnight for sorting; missing/unparseable times sort last.
function parseTimeToMinutes(time: string | null): number {
  if (!time) return Infinity
  const [hoursStr, minutesStr] = time.trim().replace('.', ':').split(':')
  const hours = Number(hoursStr)
  const minutes = Number(minutesStr)
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return Infinity
  return hours * 60 + minutes
}

function pad(n: number) {
  return String(n).padStart(2, '0')
}

// Builds an 'YYYY-MM-DD' key from local date parts (avoids the UTC-shift
// bug that new Date(...).toISOString() has for Sweden's UTC+1/+2 offset).
function dateKey(year: number, month: number, day: number) {
  return `${year}-${pad(month + 1)}-${pad(day)}`
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function weekdayAbbr(year: number, month: number, day: number) {
  const raw = new Date(year, month, day).toLocaleDateString('sv-SE', {
    weekday: 'short',
  })
  return capitalize(raw.replace(/\.$/, ''))
}

export default function Calendar() {
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [events, setEvents] = useState<CalendarEvent[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setEvents(null)
    setError(null)

    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
    const firstDay = dateKey(cursor.year, cursor.month, 1)
    const lastDay = dateKey(cursor.year, cursor.month, daysInMonth)

    supabase
      .from('calendar_events')
      .select('*')
      .gte('event_date', firstDay)
      .lte('event_date', lastDay)
      .order('event_date', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return
        if (error) {
          console.error('Failed to fetch "calendar_events":', error)
          setError(error.message)
          return
        }
        setEvents(data as CalendarEvent[])
      })

    return () => {
      cancelled = true
    }
  }, [cursor.year, cursor.month])

  function goToPrevMonth() {
    setCursor(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    )
  }

  function goToNextMonth() {
    setCursor(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    )
  }

  const monthLabel = capitalize(
    new Date(cursor.year, cursor.month, 1).toLocaleDateString('sv-SE', {
      month: 'long',
      year: 'numeric',
    }),
  )

  const eventsByDay = new Map<number, CalendarEvent[]>()
  if (events) {
    for (const event of events) {
      const day = Number(event.event_date.slice(8, 10))
      const list = eventsByDay.get(day) ?? []
      list.push(event)
      eventsByDay.set(day, list)
    }
    for (const list of eventsByDay.values()) {
      list.sort(
        (a, b) => parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time),
      )
    }
  }

  const daysWithEvents = [...eventsByDay.keys()].sort((a, b) => a - b)

  const navButtonClass =
    'flex min-h-11 min-w-11 items-center justify-center rounded-md border-2 border-primary bg-white text-2xl font-bold text-primary shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent'

  return (
    <div className="card">
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={goToPrevMonth}
          aria-label="Föregående månad"
          className={navButtonClass}
        >
          ◀
        </button>
        <p className="text-2xl font-bold text-primary">{monthLabel}</p>
        <button
          type="button"
          onClick={goToNextMonth}
          aria-label="Nästa månad"
          className={navButtonClass}
        >
          ▶
        </button>
      </div>

      <div className="mt-6">
        {events === null && error === null && (
          <StateMessage>Laddar kalender…</StateMessage>
        )}

        {error !== null && (
          <StateMessage variant="error">
            Kunde inte hämta kalendern just nu.
          </StateMessage>
        )}

        {events !== null && error === null && daysWithEvents.length === 0 && (
          <StateMessage>Inga händelser den här månaden.</StateMessage>
        )}

        {events !== null && error === null && daysWithEvents.length > 0 && (
          <ul className="flex flex-col divide-y divide-gray-200">
            {daysWithEvents.map((day) => (
              <li
                key={day}
                className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:gap-4"
              >
                <div className="shrink-0 sm:w-20 sm:text-center">
                  <p className="text-2xl font-bold leading-none text-primary">
                    {day}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-gray-500">
                    {weekdayAbbr(cursor.year, cursor.month, day)}
                  </p>
                </div>

                <ul className="flex flex-1 flex-col gap-4 sm:border-l sm:border-gray-200 sm:pl-4">
                  {(eventsByDay.get(day) ?? []).map((event) => (
                    <li key={event.id} className="flex flex-wrap items-start gap-3">
                      {(event.start_time || event.end_time) && (
                        <div className="w-16 shrink-0 text-base font-semibold text-gray-700">
                          {event.start_time && <p>{event.start_time}</p>}
                          {event.end_time && (
                            <p className="text-gray-400">{event.end_time}</p>
                          )}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-bold text-text">
                            {event.title}
                          </p>
                          {event.tag && (
                            <span
                              className={`rounded-full px-3 py-0.5 text-sm font-semibold ${tagColorClass(event.tag)}`}
                            >
                              {event.tag}
                            </span>
                          )}
                        </div>
                        {event.location && (
                          <p className="mt-1 text-base text-gray-500">
                            {event.location}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
