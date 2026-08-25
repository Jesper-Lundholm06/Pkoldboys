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

type AgendaRow =
  | { kind: 'week'; weekNumber: number }
  | { kind: 'day'; day: number; weekday: number }

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

// Standard ISO-8601 week number (Monday-start weeks, week 1 contains the
// year's first Thursday).
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

// Directional border-*-color utilities only (never the all-sides `border-{color}`
// shorthand) so today's left accent border and the divider's top border never fight
// over the same CSS property when combined on the same row.
function dayRowClasses(isToday: boolean, weekday: number) {
  if (isToday) return 'border-l-4 border-l-accent bg-accent/15'
  if (weekday === 0) return 'bg-red-50'
  if (weekday === 6) return 'bg-gray-50'
  return ''
}

// Thin top-border divider between rows; the first row gets none so it sits flush
// under the month-nav header instead of double-lining the card edge.
function dividerClass(index: number) {
  return index > 0 ? 'border-t border-t-gray-200' : ''
}

function dayNumberClass(weekday: number) {
  return weekday === 0 ? 'text-red-600' : 'text-primary'
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

  function goToToday() {
    const now = new Date()
    setCursor({ year: now.getFullYear(), month: now.getMonth() })
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

  const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()

  const rows: AgendaRow[] = []
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(cursor.year, cursor.month, day)
    const weekday = date.getDay()
    if (weekday === 1 && day !== 1) {
      rows.push({ kind: 'week', weekNumber: getISOWeek(date) })
    }
    rows.push({ kind: 'day', day, weekday })
  }

  const today = new Date()
  const isCurrentMonth =
    cursor.year === today.getFullYear() && cursor.month === today.getMonth()

  const navButtonClass =
    'flex min-h-11 min-w-11 items-center justify-center rounded-md border-2 border-primary bg-white text-2xl font-bold text-primary shadow-sm hover:bg-gray-50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent'

  return (
    <div className="card">
      <button
        type="button"
        onClick={goToToday}
        className="mb-3 text-base font-semibold text-primary hover:underline focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
      >
        Gå till idag
      </button>

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

        {events !== null && error === null && (
          <ul className="flex flex-col overflow-hidden rounded-md">
            {rows.map((row, index) => {
              if (row.kind === 'week') {
                return (
                  <li
                    key={`week-${index}`}
                    className={`bg-gray-100 px-3 py-1 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 ${dividerClass(index)}`}
                  >
                    v.{row.weekNumber}
                  </li>
                )
              }

              const { day, weekday } = row
              const dayEvents = eventsByDay.get(day) ?? []
              const isToday = isCurrentMonth && day === today.getDate()

              return (
                <li
                  key={`day-${day}`}
                  className={`flex items-start gap-4 px-3 py-2 ${dividerClass(index)} ${dayRowClasses(isToday, weekday)}`}
                >
                  <div className="w-14 shrink-0 text-center">
                    <p
                      className={`text-lg font-bold leading-none ${dayNumberClass(weekday)}`}
                    >
                      {day}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold uppercase text-gray-500">
                      {weekdayAbbr(cursor.year, cursor.month, day)}
                    </p>
                  </div>

                  {dayEvents.length > 0 && (
                    <ul className="flex min-w-0 flex-1 flex-col gap-3 py-0.5">
                      {dayEvents.map((event) => (
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
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
