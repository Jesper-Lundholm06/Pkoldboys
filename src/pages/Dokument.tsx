import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchTable } from '../lib/fetchTable'
import type { Document } from '../data/documents'
import StateMessage from '../components/ui/StateMessage'

function groupByCategory(documents: Document[]) {
  const groups = new Map<string, Document[]>()

  for (const doc of documents) {
    const key = doc.category?.trim() || 'Övrigt'
    const existing = groups.get(key)
    if (existing) {
      existing.push(doc)
    } else {
      groups.set(key, [doc])
    }
  }

  return groups
}

export default function Dokument() {
  const [documents, setDocuments] = useState<Document[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchTable<Document>('documents', {
      column: 'created_at',
      ascending: false,
    }).then(({ data, error }) => {
      setDocuments(data)
      setError(error)
    })
  }, [])

  return (
    <div>
      <h1>Dokument</h1>

      <div className="mt-6 max-w-2xl">
        {documents === null && error === null && (
          <StateMessage>Laddar dokument…</StateMessage>
        )}

        {error !== null && (
          <StateMessage variant="error">
            Kunde inte hämta dokument just nu.
          </StateMessage>
        )}

        {documents !== null && error === null && documents.length === 0 && (
          <StateMessage>Inga dokument än.</StateMessage>
        )}
      </div>

      {documents !== null && error === null && documents.length > 0 && (
        <div className="mt-6 flex max-w-2xl flex-col gap-8">
          {Array.from(groupByCategory(documents)).map(([category, items]) => (
            <section key={category}>
              <h2>{category}</h2>
              <ul className="flex flex-col gap-3">
                {items.map((doc) => {
                  const { data } = supabase.storage
                    .from('documents')
                    .getPublicUrl(doc.file_path)

                  return (
                    <li key={doc.id}>
                      <a
                        href={data.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="card flex min-h-11 items-center gap-3 text-lg font-medium no-underline hover:bg-gray-50"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                          className="h-7 w-7 shrink-0 fill-none stroke-primary stroke-2"
                        >
                          <path
                            d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
                            strokeLinejoin="round"
                          />
                          <path d="M14 3v5h5" strokeLinejoin="round" />
                        </svg>
                        {doc.title}
                      </a>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
