import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { normalizeTime } from '../../lib/formatTime'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'
import { TAG_SUGGESTIONS, tagColorClass } from './tagColors'
import type { CalendarEvent } from './Calendar'

type FormFields = {
  title: string
  event_date: string
  start_time: string
  end_time: string
  location: string
  tag: string
}

const emptyForm: FormFields = {
  title: '',
  event_date: '',
  start_time: '',
  end_time: '',
  location: '',
  tag: '',
}

function toFormFields(event: CalendarEvent): FormFields {
  return {
    title: event.title,
    event_date: event.event_date,
    start_time: event.start_time ?? '',
    end_time: event.end_time ?? '',
    location: event.location ?? '',
    tag: event.tag ?? '',
  }
}

type CalendarEventFormProps = {
  // undefined/null = create mode, an event = edit mode (pre-filled).
  event?: CalendarEvent | null
  onSaved: (mode: 'created' | 'updated') => void
  onCancel: () => void
}

// Shared create/edit form for calendar_events, used both by the admin dashboard's
// "Kalender" tab and the inline admin controls on the public calendar. Pass a
// changing `key` (e.g. keyed on event id) from the caller when switching which event
// is being edited, so this component remounts with fresh initial field values instead
// of needing to sync via an effect.
export default function CalendarEventForm({
  event,
  onSaved,
  onCancel,
}: CalendarEventFormProps) {
  const [form, setForm] = useState<FormFields>(event ? toFormFields(event) : emptyForm)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const editingId = event?.id ?? null

  function updateField(field: keyof FormFields, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault()
    setSaveError(null)
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

      onSaved('updated')
      return
    }

    const { error } = await supabase.from('calendar_events').insert(payload)

    setSaving(false)

    if (error) {
      setSaveError('Kunde inte spara händelsen just nu.')
      return
    }

    onSaved('created')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                  : `${tagColorClass(suggestion)} hover:brightness-95`
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
          <button type="button" onClick={onCancel} className={buttonClass('secondary')}>
            Avbryt
          </button>
        )}
      </div>

      {saveError && <StateMessage variant="error">{saveError}</StateMessage>}
    </form>
  )
}
