import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchTable } from '../../lib/fetchTable'
import { formatDateTime } from '../../lib/formatDateTime'
import type { MemberPost } from '../../data/memberPosts'
import MemberPostForm from '../member/MemberPostForm'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'

export default function MemberPostsAdmin() {
  const [editingPost, setEditingPost] = useState<MemberPost | null>(null)
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

  function handleEdit(post: MemberPost) {
    setEditingPost(post)
    setSaveSuccess(null)
  }

  function handleCancelEdit() {
    setEditingPost(null)
  }

  function handleSaved(mode: 'created' | 'updated') {
    setEditingPost(null)
    setSaveSuccess(mode === 'created' ? 'Inlägget sparades' : 'Inlägget uppdaterades')
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

    if (editingPost?.id === id) {
      setEditingPost(null)
    }

    loadPosts()
  }

  return (
    <div>
      <div className="card flex max-w-xl flex-col gap-4">
        <MemberPostForm
          key={editingPost?.id ?? 'new'}
          post={editingPost}
          onSaved={handleSaved}
          onCancel={handleCancelEdit}
        />

        {saveSuccess && <StateMessage variant="success">{saveSuccess}</StateMessage>}
      </div>

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
