import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchTable } from '../../lib/fetchTable'
import { formatEventDate } from '../../lib/formatDateTime'
import type { CalendarEvent } from '../calendar/Calendar'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'
import { normalizeTime } from '../../lib/formatTime'

const TAG_SUGGESTIONS = ['Riksserien', 'Klubbmatcher', 'Träning']

const TAG_PILL_COLORS: Record<string, string> = {
  riksserien: 'bg-blue-100 text-blue-800',
  klubbmatcher: 'bg-green-100 text-green-800',
  träning: 'bg-gray-200 text-gray-800',
}

const DEFAULT_TAG_PILL_COLOR = 'bg-amber-100 text-amber-800'

function tagPillClass(tag: string) {
  return TAG_PILL_COLORS[tag.trim().toLowerCase()] ?? DEFAULT_TAG_PILL_COLOR
}

function formatTimeRange(start: string | null, end: string | null) {
  if (start && end) return `${start}–${end}`
  return start || end || null
}

const emptyForm = {
  title: '',
  event_date: '',
  start_time: '',
  end_time: '',
  location: '',
  tag: '',
}

export default function CalendarAdmin() {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const [events, setEvents] = useState<CalendarEvent[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  async function loadEvents() {
    const { data, error } = await fetchTable<CalendarEvent>('calendar_events', {
      column: 'event_date',
      ascending: false,
    })
    setEvents(data)
    setListError(error)
  }

  useEffect(() => {
    loadEvents()
  }, [])

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
  }

  function handleEdit(event: CalendarEvent) {
    setEditingId(event.id)
    setForm({
      title: event.title,
      event_date: event.event_date,
      start_time: event.start_time ?? '',
      end_time: event.end_time ?? '',
      location: event.location ?? '',
      tag: event.tag ?? '',
    })
    setSaveError(null)
    setSaveSuccess(null)
  }

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault()
    setSaveError(null)
    setSaveSuccess(null)
    setSaving(true)

    const payload = {
      title: form.title,
      event_date: form.event_date,
      start_time: normalizeTime(form.start_time) || null,
      end_time: normalizeTime(form.end_time) || null,
      location: form.location || null,
      tag: form.tag || null,
    }

    if (editingId) {
      const { error } = await supabase
        .from('calendar_events')
        .update(payload)
        .eq('id', editingId)

      setSaving(false)

      if (error) {
        setSaveError('Kunde inte uppdatera händelsen just nu.')
        return
      }

      resetForm()
      setSaveSuccess('Händelsen uppdaterades')
      loadEvents()
      return
    }

    const { error } = await supabase.from('calendar_events').insert(payload)

    setSaving(false)

    if (error) {
      setSaveError('Kunde inte spara händelsen just nu.')
      return
    }

    resetForm()
    setSaveSuccess('Händelsen sparades')
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

    if (editingId === id) {
      resetForm()
    }

    loadEvents()
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="card flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="calendar-event-title" className="label">
            Rubrik
          </label>
          <input
            id="calendar-event-title"
            type="text"
            required
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="calendar-event-date" className="label">
            Datum
          </label>
          <input
            id="calendar-event-date"
            type="date"
            required
            value={form.event_date}
            onChange={(e) => updateField('event_date', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="calendar-event-start-time" className="label">
            Starttid (valfritt)
          </label>
          <input
            id="calendar-event-start-time"
            type="text"
            placeholder="t.ex. 12:00"
            value={form.start_time}
            onChange={(e) => updateField('start_time', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="calendar-event-end-time" className="label">
            Sluttid (valfritt)
          </label>
          <input
            id="calendar-event-end-time"
            type="text"
            placeholder="t.ex. 13:30"
            value={form.end_time}
            onChange={(e) => updateField('end_time', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="calendar-event-location" className="label">
            Plats (valfritt)
          </label>
          <input
            id="calendar-event-location"
            type="text"
            value={form.location}
            onChange={(e) => updateField('location', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="calendar-event-tag" className="label">
            Tagg (valfritt)
          </label>
          <input
            id="calendar-event-tag"
            type="text"
            placeholder="t.ex. Riksserien"
            value={form.tag}
            onChange={(e) => updateField('tag', e.target.value)}
            className="input"
          />
          <div className="flex flex-wrap gap-2">
            {TAG_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => updateField('tag', suggestion)}
                className={`min-h-11 rounded-full px-4 text-base font-semibold transition-colors ${
                  form.tag === suggestion
                    ? 'bg-primary text-white'
                    : `${tagPillClass(suggestion)} hover:brightness-95`
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={saving} className={buttonClass('primary')}>
            {saving
              ? editingId
                ? 'Uppdaterar…'
                : 'Sparar…'
              : editingId
                ? 'Uppdatera händelse'
                : 'Spara händelse'}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className={buttonClass('secondary')}
            >
              Avbryt
            </button>
          )}
        </div>

        {saveError && <StateMessage variant="error">{saveError}</StateMessage>}
        {saveSuccess && <StateMessage variant="success">{saveSuccess}</StateMessage>}
      </form>

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
                          className={`rounded-full px-3 py-0.5 text-sm font-semibold ${tagPillClass(event.tag)}`}
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
