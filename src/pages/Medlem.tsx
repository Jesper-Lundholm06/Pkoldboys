import { useEffect, useState } from 'react'
import { fetchTable } from '../lib/fetchTable'
import { formatDateTime } from '../lib/formatDateTime'
import type { MemberPost } from '../data/memberPosts'
import StateMessage from '../components/ui/StateMessage'

export default function Medlem() {
  const [posts, setPosts] = useState<MemberPost[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTable<MemberPost>('member_posts', {
      column: 'created_at',
      ascending: false,
    }).then(({ data, error }) => {
      setPosts(data)
      setError(error)
    })
  }, [])

  return (
    <div>
      <h1>Medlemssida</h1>
      <p className="text-lg">
        Välkommen! Här är intern information för medlemmar.
      </p>

      <section className="mt-8">
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
