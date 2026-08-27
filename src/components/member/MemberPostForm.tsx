import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'
import type { MemberPost } from '../../data/memberPosts'

type MemberPostFormProps = {
  // undefined/null = create mode, a post = edit mode (pre-filled).
  post?: MemberPost | null
  onSaved: (mode: 'created' | 'updated') => void
  onCancel: () => void
}

// Shared create/edit form for member_posts, used both by the admin dashboard's
// "Medlemsinlägg" tab and the inline admin controls on the Medlem page. Pass a
// changing `key` (e.g. keyed on post id) from the caller when switching which post is
// being edited, so this component remounts with fresh initial field values instead of
// needing to sync via an effect.
export default function MemberPostForm({ post, onSaved, onCancel }: MemberPostFormProps) {
  const [title, setTitle] = useState(post?.title ?? '')
  const [body, setBody] = useState(post?.body ?? '')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const editingId = post?.id ?? null

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault()
    setSaveError(null)
    setSaving(true)

    if (editingId) {
      const { error } = await supabase
        .from('member_posts')
        .update({ title, body })
        .eq('id', editingId)

      setSaving(false)

      if (error) {
        setSaveError('Kunde inte uppdatera inlägget just nu.')
        return
      }

      onSaved('updated')
      return
    }

    const { error } = await supabase.from('member_posts').insert({ title, body })

    setSaving(false)

    if (error) {
      setSaveError('Kunde inte spara inlägget just nu.')
      return
    }

    onSaved('created')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="post-title" className="label">
          Rubrik
        </label>
        <input
          id="post-title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="post-body" className="label">
          Text
        </label>
        <textarea
          id="post-body"
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
              ? 'Uppdatera inlägg'
              : 'Spara inlägg'}
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
