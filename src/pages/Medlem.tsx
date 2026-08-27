import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { fetchTable } from '../lib/fetchTable'
import { formatDateTime } from '../lib/formatDateTime'
import type { MemberPost } from '../data/memberPosts'
import StateMessage from '../components/ui/StateMessage'
import { buttonClass } from '../components/ui/buttonStyles'
import MemberPostForm from '../components/member/MemberPostForm'
// Reuses the modal built for the inline calendar/news admin controls (Steps 13f/14)
// so all inline-admin features share one accessible modal implementation.
import CalendarEventModal from '../components/calendar/CalendarEventModal'

export default function Medlem() {
  const { isAdmin } = useAuth()

  const [posts, setPosts] = useState<MemberPost[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [actionError, setActionError] = useState<string | null>(null)

  // undefined = modal closed, null = modal open in create mode, a post = modal open in
  // edit mode for that post.
  const [modalPost, setModalPost] = useState<MemberPost | null | undefined>(undefined)

  function refreshPosts() {
    setReloadKey((key) => key + 1)
  }

  function handlePostSaved() {
    setModalPost(undefined)
    refreshPosts()
  }

  async function handleDeletePost(id: string) {
    if (!window.confirm('Ta bort inlägget?')) {
      return
    }

    setActionError(null)
    const { error: deleteError } = await supabase
      .from('member_posts')
      .delete()
      .eq('id', id)

    if (deleteError) {
      setActionError('Kunde inte ta bort inlägget just nu.')
      return
    }

    if (modalPost && modalPost.id === id) {
      setModalPost(undefined)
    }

    refreshPosts()
  }

  useEffect(() => {
    fetchTable<MemberPost>('member_posts', {
      column: 'created_at',
      ascending: false,
    }).then(({ data, error }) => {
      setPosts(data)
      setError(error)
    })
  }, [reloadKey])

  return (
    <div>
      <h1>Medlemssida</h1>
      <p className="text-lg">
        Välkommen! Här är intern information för medlemmar.
      </p>

      <section className="mt-8">
        {isAdmin && (
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setModalPost(null)}
              className={buttonClass('primary')}
            >
              + Nytt inlägg
            </button>
          </div>
        )}

        {isAdmin && actionError && (
          <div className="mb-4">
            <StateMessage variant="error">{actionError}</StateMessage>
          </div>
        )}

        {posts === null && error === null && <StateMessage>Laddar…</StateMessage>}

        {error !== null && (
          <StateMessage variant="error">
            Kunde inte hämta inläggen just nu.
          </StateMessage>
        )}

        {posts !== null && error === null && posts.length === 0 && (
          <StateMessage>Inga inlägg än.</StateMessage>
        )}

        {posts !== null && error === null && posts.length > 0 && (
          <ul className="flex flex-col gap-4">
            {posts.map((post) => (
              <li key={post.id} className="card">
                <h3 className="text-xl font-bold text-primary">
                  {post.title}
                </h3>
                <p className="mt-1 text-base text-gray-500">
                  {formatDateTime(post.created_at)}
                </p>
                <p className="mt-2 text-lg text-gray-700">{post.body}</p>

                {isAdmin && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setModalPost(post)}
                      className="min-h-9 rounded-md border-2 border-primary bg-white px-3 py-1 text-sm font-semibold text-primary hover:bg-gray-50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      Ändra
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(post.id)}
                      className="min-h-9 rounded-md border-2 border-danger bg-white px-3 py-1 text-sm font-semibold text-danger hover:bg-danger-light focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      Ta bort
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {isAdmin && modalPost !== undefined && (
          <CalendarEventModal
            title={modalPost ? 'Ändra inlägg' : 'Nytt inlägg'}
            onClose={() => setModalPost(undefined)}
          >
            <MemberPostForm
              key={modalPost?.id ?? 'new'}
              post={modalPost}
              onSaved={handlePostSaved}
              onCancel={() => setModalPost(undefined)}
            />
          </CalendarEventModal>
        )}
      </section>
    </div>
  )
}
