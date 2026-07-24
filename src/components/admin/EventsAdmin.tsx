import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchTable } from '../../lib/fetchTable'
import { formatEventDate } from '../../lib/formatDateTime'
import type { Event } from '../../data/events'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'

const emptyForm = {
  title: '',
  event_date: '',
  event_time: '',
  location: '',
  description: '',
}

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export default function EventsAdmin() {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const [events, setEvents] = useState<Event[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  async function loadEvents() {
    const { data, error } = await fetchTable<Event>('events', {
      column: 'event_date',
      ascending: true,
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

  function handleEdit(event: Event) {
    setEditingId(event.id)
    setForm({
      title: event.title,
      event_date: event.event_date,
      event_time: event.event_time ?? '',
      location: event.location ?? '',
      description: event.description ?? '',
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
      event_time: form.event_time || null,
      location: form.location || null,
      description: form.description || null,
    }

    if (editingId) {
      const { error } = await supabase
        .from('events')
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

    const { error } = await supabase.from('events').insert(payload)

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

    const { error } = await supabase.from('events').delete().eq('id', id)

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
          <label htmlFor="event-title" className="label">
            Rubrik
          </label>
          <input
            id="event-title"
            type="text"
            required
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="event-date" className="label">
            Datum
          </label>
          <input
            id="event-date"
            type="date"
            required
            value={form.event_date}
            onChange={(e) => updateField('event_date', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="event-time" className="label">
            Tid (valfritt)
          </label>
          <input
            id="event-time"
            type="text"
            placeholder="t.ex. 18.00"
            value={form.event_time}
            onChange={(e) => updateField('event_time', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="event-location" className="label">
            Plats (valfritt)
          </label>
          <input
            id="event-location"
            type="text"
            value={form.location}
            onChange={(e) => updateField('location', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="event-description" className="label">
            Beskrivning (valfritt)
          </label>
          <textarea
            id="event-description"
            rows={4}
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            className="input"
          />
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
              const isPast = event.event_date < todayIso()

              return (
                <li
                  key={event.id}
                  className={`card flex flex-wrap items-center justify-between gap-4 ${
                    isPast ? 'opacity-60' : ''
                  }`}
                >
                  <div>
                    <p className="text-base font-semibold text-gray-500">
                      {formatEventDate(event.event_date)}
                      {event.event_time ? ` · ${event.event_time}` : ''}
                      {isPast ? ' (passerad)' : ''}
                    </p>
                    <p className="text-lg font-semibold">{event.title}</p>
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
