import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { fetchTable } from '../lib/fetchTable'
import type { Document } from '../data/documents'
import StateMessage from '../components/ui/StateMessage'
import { buttonClass } from '../components/ui/buttonStyles'
import DocumentForm from '../components/documents/DocumentForm'
// Reuses the modal built for the inline calendar/news/member-post admin controls so
// all inline-admin features share one accessible modal implementation.
import CalendarEventModal from '../components/calendar/CalendarEventModal'

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
  const { isAdmin } = useAuth()

  const [documents, setDocuments] = useState<Document[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  function refreshDocuments() {
    setReloadKey((key) => key + 1)
  }

  function handleUploaded() {
    setShowUploadModal(false)
    refreshDocuments()
  }

  async function handleDelete(doc: Document) {
    if (!window.confirm('Ta bort dokumentet?')) {
      return
    }

    setActionError(null)

    const { error: removeErr } = await supabase.storage
      .from('documents')
      .remove([doc.file_path])

    if (removeErr) {
      setActionError('Kunde inte ta bort filen just nu.')
      return
    }

    const { error: deleteErr } = await supabase
      .from('documents')
      .delete()
      .eq('id', doc.id)

    if (deleteErr) {
      setActionError('Kunde inte ta bort dokumentet just nu.')
      return
    }

    refreshDocuments()
  }

  useEffect(() => {
    fetchTable<Document>('documents', {
      column: 'created_at',
      ascending: false,
    }).then(({ data, error }) => {
      setDocuments(data)
      setError(error)
    })
  }, [reloadKey])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Dokument</h1>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className={buttonClass('primary')}
          >
            + Nytt dokument
          </button>
        )}
      </div>

      {isAdmin && actionError && (
        <div className="mb-4 max-w-2xl">
          <StateMessage variant="error">{actionError}</StateMessage>
        </div>
      )}

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
                    <li key={doc.id} className={isAdmin ? 'flex items-stretch gap-2' : undefined}>
                      <a
                        href={data.publicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`card flex min-h-11 items-center gap-3 text-lg font-medium no-underline hover:bg-gray-50${isAdmin ? ' flex-1' : ''}`}
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
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(doc)}
                          className="min-h-9 shrink-0 self-center rounded-md border-2 border-danger bg-white px-3 py-1 text-sm font-semibold text-danger hover:bg-danger-light focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          Ta bort
                        </button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {isAdmin && showUploadModal && (
        <CalendarEventModal title="Nytt dokument" onClose={() => setShowUploadModal(false)}>
          <DocumentForm onUploaded={handleUploaded} />
        </CalendarEventModal>
      )}
    </div>
  )
}
