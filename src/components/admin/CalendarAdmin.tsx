import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchTable } from '../../lib/fetchTable'
import { formatEventDate } from '../../lib/formatDateTime'
import type { CalendarEvent } from '../calendar/Calendar'
import CalendarEventForm from '../calendar/CalendarEventForm'
import { tagColorClass } from '../calendar/tagColors'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'

function formatTimeRange(start: string | null, end: string | null) {
  if (start && end) return `${start}–${end}`
  return start || end || null
}

export default function CalendarAdmin() {
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const [events, setEvents] = useState<CalendarEvent[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  async function loadEvents() {
    const { data, error } = await fetchTable<CalendarEvent>('calendar_events', {
      column: 'event_date',
      ascending: true,
    })
    setEvents(data)
    setListError(error)
  }

  useEffect(() => {
    loadEvents()
  }, [])

  function handleEdit(event: CalendarEvent) {
    setEditingEvent(event)
    setSaveSuccess(null)
  }

  function handleCancelEdit() {
    setEditingEvent(null)
  }

  function handleSaved(mode: 'created' | 'updated') {
    setEditingEvent(null)
    setSaveSuccess(mode === 'created' ? 'Händelsen sparades' : 'Händelsen uppdaterades')
    loadEvents()
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Ta bort händelsen?')) {
      return
    }

    const { error } = await supabase.from('calendar_events').delete().eq('id', id)

    if (error) {
      setListError('Kunde inte ta bort händelsen just nu.')
      return
    }

    if (editingEvent?.id === id) {
      setEditingEvent(null)
    }

    loadEvents()
  }

  return (
    <div>
      <div className="card flex max-w-xl flex-col gap-4">
        <CalendarEventForm
          key={editingEvent?.id ?? 'new'}
          event={editingEvent}
          onSaved={handleSaved}
          onCancel={handleCancelEdit}
        />

        {saveSuccess && <StateMessage variant="success">{saveSuccess}</StateMessage>}
      </div>

      <div className="mt-8">
        {events === null && listError === null && (
          <StateMessage>Laddar händelser…</StateMessage>
        )}

        {listError !== null && (
          <StateMessage variant="error">
            Kunde inte hämta händelser just nu.
          </StateMessage>
        )}

        {events !== null && events.length === 0 && (
          <StateMessage>Inga händelser än.</StateMessage>
        )}

        {events !== null && events.length > 0 && (
          <ul className="flex flex-col gap-4">
            {events.map((event) => {
              const timeRange = formatTimeRange(event.start_time, event.end_time)

              return (
                <li
                  key={event.id}
                  className="card flex flex-wrap items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-base font-semibold text-gray-500">
                      {formatEventDate(event.event_date)}
                      {timeRange ? ` · ${timeRange}` : ''}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <p className="text-lg font-semibold">{event.title}</p>
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
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(event)}
                      className={buttonClass('secondary')}
                    >
                      Ändra
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(event.id)}
                      className={buttonClass('danger')}
                    >
                      Ta bort
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
