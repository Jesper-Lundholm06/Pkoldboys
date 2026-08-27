import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchTable } from '../../lib/fetchTable'
import { formatDateTime } from '../../lib/formatDateTime'
import type { News } from '../../data/news'
import NewsForm from '../news/NewsForm'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'

export default function NewsAdmin() {
  const [editingItem, setEditingItem] = useState<News | null>(null)
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

  function handleEdit(item: News) {
    setEditingItem(item)
    setSaveSuccess(null)
  }

  function handleCancelEdit() {
    setEditingItem(null)
  }

  function handleSaved(mode: 'created' | 'updated') {
    setEditingItem(null)
    setSaveSuccess(mode === 'created' ? 'Nyheten sparades' : 'Nyheten uppdaterades')
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

    if (editingItem?.id === id) {
      setEditingItem(null)
    }

    loadNews()
  }

  return (
    <div>
      <div className="card flex max-w-xl flex-col gap-4">
        <NewsForm
          key={editingItem?.id ?? 'new'}
          item={editingItem}
          onSaved={handleSaved}
          onCancel={handleCancelEdit}
        />

        {saveSuccess && <StateMessage variant="success">{saveSuccess}</StateMessage>}
      </div>

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
