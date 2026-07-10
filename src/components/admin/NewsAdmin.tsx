import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchTable } from '../../lib/fetchTable'
import { formatDateTime } from '../../lib/formatDateTime'
import type { News } from '../../data/news'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'

export default function NewsAdmin() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const [news, setNews] = useState<News[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  async function loadNews() {
    const { data, error } = await fetchTable<News>('news', {
      column: 'created_at',
      ascending: false,
    })
    setNews(data)
    setListError(error)
  }

  useEffect(() => {
    loadNews()
  }, [])

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setBody('')
  }

  function handleEdit(item: News) {
    setEditingId(item.id)
    setTitle(item.title)
    setBody(item.body)
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
        .from('news')
        .update({ title, body })
        .eq('id', editingId)

      setSaving(false)

      if (error) {
        setSaveError('Kunde inte uppdatera nyheten just nu.')
        return
      }

      resetForm()
      setSaveSuccess('Nyheten uppdaterades')
      loadNews()
      return
    }

    const { error } = await supabase.from('news').insert({ title, body })

    setSaving(false)

    if (error) {
      setSaveError('Kunde inte spara nyheten just nu.')
      return
    }

    resetForm()
    setSaveSuccess('Nyheten sparades')
    loadNews()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Ta bort nyheten?')) {
      return
    }

    const { error } = await supabase.from('news').delete().eq('id', id)

    if (error) {
      setListError('Kunde inte ta bort nyheten just nu.')
      return
    }

    if (editingId === id) {
      resetForm()
    }

    loadNews()
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="card flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="news-title" className="label">
            Rubrik
          </label>
          <input
            id="news-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="news-body" className="label">
            Text
          </label>
          <textarea
            id="news-body"
            required
            rows={5}
            value={body}
            onChange={(e) => setBody(e.target.value)}
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
                ? 'Uppdatera nyhet'
                : 'Spara nyhet'}
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
        {news === null && listError === null && (
          <StateMessage>Laddar nyheter…</StateMessage>
        )}

        {listError !== null && (
          <StateMessage variant="error">Kunde inte hämta nyheter just nu.</StateMessage>
        )}

        {news !== null && news.length === 0 && (
          <StateMessage>Inga nyheter än.</StateMessage>
        )}

        {news !== null && news.length > 0 && (
          <ul className="flex flex-col gap-4">
            {news.map((item) => (
              <li
                key={item.id}
                className="card flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <p className="text-lg font-semibold">{item.title}</p>
                  <p className="text-base text-gray-500">
                    {formatDateTime(item.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(item)}
                    className={buttonClass('secondary')}
                  >
                    Ändra
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
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
