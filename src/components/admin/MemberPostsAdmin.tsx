import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchTable } from '../../lib/fetchTable'
import { formatDateTime } from '../../lib/formatDateTime'
import type { MemberPost } from '../../data/memberPosts'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'

export default function MemberPostsAdmin() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const [posts, setPosts] = useState<MemberPost[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  async function loadPosts() {
    const { data, error } = await fetchTable<MemberPost>('member_posts', {
      column: 'created_at',
      ascending: false,
    })
    setPosts(data)
    setListError(error)
  }

  useEffect(() => {
    loadPosts()
  }, [])

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setBody('')
  }

  function handleEdit(post: MemberPost) {
    setEditingId(post.id)
    setTitle(post.title)
    setBody(post.body)
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
        .from('member_posts')
        .update({ title, body })
        .eq('id', editingId)

      setSaving(false)

      if (error) {
        setSaveError('Kunde inte uppdatera inlägget just nu.')
        return
      }

      resetForm()
      setSaveSuccess('Inlägget uppdaterades')
      loadPosts()
      return
    }

    const { error } = await supabase.from('member_posts').insert({ title, body })

    setSaving(false)

    if (error) {
      setSaveError('Kunde inte spara inlägget just nu.')
      return
    }

    resetForm()
    setSaveSuccess('Inlägget sparades')
    loadPosts()
  }

  async function handleDelete(id: string) {
    if (!window.confirm('Ta bort inlägget?')) {
      return
    }

    const { error } = await supabase.from('member_posts').delete().eq('id', id)

    if (error) {
      setListError('Kunde inte ta bort inlägget just nu.')
      return
    }

    if (editingId === id) {
      resetForm()
    }

    loadPosts()
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="card flex max-w-xl flex-col gap-4">
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
        {posts === null && listError === null && (
          <StateMessage>Laddar inlägg…</StateMessage>
        )}

        {listError !== null && (
          <StateMessage variant="error">Kunde inte hämta inläggen just nu.</StateMessage>
        )}

        {posts !== null && posts.length === 0 && (
          <StateMessage>Inga inlägg än.</StateMessage>
        )}

        {posts !== null && posts.length > 0 && (
          <ul className="flex flex-col gap-4">
            {posts.map((post) => (
              <li
                key={post.id}
                className="card flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <p className="text-lg font-semibold">{post.title}</p>
                  <p className="text-base text-gray-500">
                    {formatDateTime(post.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(post)}
                    className={buttonClass('secondary')}
                  >
                    Ändra
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(post.id)}
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
