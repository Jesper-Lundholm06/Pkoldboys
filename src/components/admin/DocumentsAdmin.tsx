import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchTable } from '../../lib/fetchTable'
import type { Document } from '../../data/documents'
import DocumentForm from '../documents/DocumentForm'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'

export default function DocumentsAdmin() {
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const [documents, setDocuments] = useState<Document[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  async function loadDocuments() {
    const { data, error } = await fetchTable<Document>('documents', {
      column: 'created_at',
      ascending: false,
    })
    setDocuments(data)
    setListError(error)
  }

  useEffect(() => {
    loadDocuments()
  }, [])

  function handleUploaded() {
    setUploadSuccess('Dokumentet laddades upp')
    loadDocuments()
  }

  async function handleDelete(doc: Document) {
    if (!window.confirm('Ta bort dokumentet?')) {
      return
    }

    const { error: removeErr } = await supabase.storage
      .from('documents')
      .remove([doc.file_path])

    if (removeErr) {
      setListError('Kunde inte ta bort filen just nu.')
      return
    }

    const { error: deleteErr } = await supabase
      .from('documents')
      .delete()
      .eq('id', doc.id)

    if (deleteErr) {
      setListError('Kunde inte ta bort dokumentet just nu.')
      return
    }

    loadDocuments()
  }

  return (
    <div>
      <div className="card flex max-w-xl flex-col gap-4">
        <DocumentForm onUploaded={handleUploaded} />

        {uploadSuccess && (
          <StateMessage variant="success">{uploadSuccess}</StateMessage>
        )}
      </div>

      <div className="mt-8">
        {documents === null && listError === null && (
          <StateMessage>Laddar dokument…</StateMessage>
        )}

        {listError !== null && (
          <StateMessage variant="error">Kunde inte hämta dokument just nu.</StateMessage>
        )}

        {documents !== null && documents.length === 0 && (
          <StateMessage>Inga dokument än.</StateMessage>
        )}

        {documents !== null && documents.length > 0 && (
          <ul className="flex flex-col gap-4">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="card flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <p className="text-lg font-semibold">{doc.title}</p>
                  <p className="text-base text-gray-500">
                    {doc.category ? `${doc.category} · ` : ''}
                    {new Date(doc.created_at).toLocaleDateString('sv-SE')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(doc)}
                  className={buttonClass('danger', 'shrink-0')}
                >
                  Ta bort
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
