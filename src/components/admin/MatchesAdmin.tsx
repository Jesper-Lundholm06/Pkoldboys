import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchTable } from '../../lib/fetchTable'
import type { Match } from '../../data/matches'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'

const emptyForm = {
  date: '',
  time: '',
  home: '',
  away: '',
  location: '',
  result: '',
}

export default function MatchesAdmin() {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const [matches, setMatches] = useState<Match[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  async function loadMatches() {
    const { data, error } = await fetchTable<Match>('matches', {
      column: 'id',
      ascending: true,
    })
    setMatches(data)
    setListError(error)
  }

  useEffect(() => {
    loadMatches()
  }, [])

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function resetForm() {
    setEditingId(null)
    setForm(emptyForm)
  }

  function handleEdit(match: Match) {
    setEditingId(match.id)
    setForm({
      date: match.date,
      time: match.time,
      home: match.home,
      away: match.away,
      location: match.location,
      result: match.result,
    })
    setSaveError(null)
    setSaveSuccess(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSaveError(null)
    setSaveSuccess(null)
    setSaving(true)

    if (editingId) {
      const { error } = await supabase
        .from('matches')
        .update(form)
        .eq('id', editingId)

      setSaving(false)

      if (error) {
        setSaveError('Kunde inte uppdatera matchen just nu.')
        return
      }

      resetForm()
      setSaveSuccess('Matchen uppdaterades')
      loadMatches()
      return
    }

    const { error } = await supabase.from('matches').insert(form)

    setSaving(false)

    if (error) {
      setSaveError('Kunde inte spara matchen just nu.')
      return
    }

    resetForm()
    setSaveSuccess('Matchen sparades')
    loadMatches()
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Ta bort matchen?')) {
      return
    }

    const { error } = await supabase.from('matches').delete().eq('id', id)

    if (error) {
      setListError('Kunde inte ta bort matchen just nu.')
      return
    }

    if (editingId === id) {
      resetForm()
    }

    loadMatches()
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="card flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="match-date" className="label">
            Datum
          </label>
          <input
            id="match-date"
            type="text"
            placeholder="t.ex. 13/1"
            value={form.date}
            onChange={(e) => updateField('date', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="match-time" className="label">
            Tid
          </label>
          <input
            id="match-time"
            type="text"
            placeholder="t.ex. 09:00"
            value={form.time}
            onChange={(e) => updateField('time', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="match-home" className="label">
            Hemma
          </label>
          <input
            id="match-home"
            type="text"
            required
            value={form.home}
            onChange={(e) => updateField('home', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="match-away" className="label">
            Borta
          </label>
          <input
            id="match-away"
            type="text"
            required
            value={form.away}
            onChange={(e) => updateField('away', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="match-location" className="label">
            Plats
          </label>
          <input
            id="match-location"
            type="text"
            value={form.location}
            onChange={(e) => updateField('location', e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="match-result" className="label">
            Resultat
          </label>
          <input
            id="match-result"
            type="text"
            value={form.result}
            onChange={(e) => updateField('result', e.target.value)}
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
                ? 'Uppdatera match'
                : 'Spara match'}
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
        {matches === null && listError === null && (
          <StateMessage>Laddar matcher…</StateMessage>
        )}

        {listError !== null && (
          <StateMessage variant="error">Kunde inte hämta matcher just nu.</StateMessage>
        )}

        {matches !== null && matches.length === 0 && (
          <StateMessage>Inga matcher inlagda än.</StateMessage>
        )}

        {matches !== null && matches.length > 0 && (
          <ul className="flex flex-col gap-4">
            {matches.map((match) => (
              <li
                key={match.id}
                className="card flex flex-wrap items-center justify-between gap-4"
              >
                <p className="text-lg">
                  {match.date} {match.time} {match.home}–{match.away}{' '}
                  {match.location} {match.result}
                </p>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(match)}
                    className={buttonClass('secondary')}
                  >
                    Ändra
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(match.id)}
                    className={buttonClass('danger')}
                  >
                    Ta bort
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
