import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'
import type { News } from '../../data/news'

type NewsFormProps = {
  // undefined/null = create mode, a news item = edit mode (pre-filled).
  item?: News | null
  onSaved: (mode: 'created' | 'updated') => void
  onCancel: () => void
}

// Shared create/edit form for news, used both by the admin dashboard's "Nyheter" tab
// and the inline admin controls on the public Home page. Pass a changing `key` (e.g.
// keyed on item id) from the caller when switching which item is being edited, so this
// component remounts with fresh initial field values instead of needing to sync via an
// effect.
export default function NewsForm({ item, onSaved, onCancel }: NewsFormProps) {
  const [title, setTitle] = useState(item?.title ?? '')
  const [body, setBody] = useState(item?.body ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const editingId = item?.id ?? null

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault()
    setSaveError(null)
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

      onSaved('updated')
      return
    }

    const { error } = await supabase.from('news').insert({ title, body })

    setSaving(false)

    if (error) {
      setSaveError('Kunde inte spara nyheten just nu.')
      return
    }

    onSaved('created')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          <button type="button" onClick={onCancel} className={buttonClass('secondary')}>
            Avbryt
          </button>
        )}
      </div>

      {saveError && <StateMessage variant="error">{saveError}</StateMessage>}
    </form>
  )
}
