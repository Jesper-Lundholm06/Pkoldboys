import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchTable } from '../../lib/fetchTable'
import type { Document } from '../../data/documents'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function DocumentsAdmin() {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
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

  function resetForm() {
    setTitle('')
    setCategory('')
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setUploadError(null)
    setUploadSuccess(null)

    if (!file) {
      setUploadError('Välj en PDF-fil.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Filen är för stor (max 10 MB).')
      return
    }

    setUploading(true)

    const path = `${Date.now()}_${file.name}`
    const { error: uploadErr } = await supabase.storage
      .from('documents')
      .upload(path, file)

    if (uploadErr) {
      setUploading(false)
      setUploadError('Kunde inte ladda upp filen just nu.')
      return
    }

    const { error: insertErr } = await supabase
      .from('documents')
      .insert({ title, file_path: path, category: category || null })

    setUploading(false)

    if (insertErr) {
      setUploadError('Kunde inte spara dokumentet just nu.')
      return
    }

    resetForm()
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
      <form onSubmit={handleSubmit} className="card flex max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="doc-title" className="label">
            Titel
          </label>
          <input
            id="doc-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="doc-category" className="label">
            Kategori (valfritt)
          </label>
          <input
            id="doc-category"
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="doc-file" className="label">
            PDF-fil
          </label>
          <input
            id="doc-file"
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="cursor-pointer text-lg text-gray-700 file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-base file:font-semibold file:text-white file:shadow-sm hover:file:brightness-110"
          />
        </div>

        <button
          type="submit"
          disabled={uploading}
          className={buttonClass('primary', 'self-start')}
        >
          {uploading ? 'Laddar upp…' : 'Ladda upp dokument'}
        </button>

        {uploadError && <StateMessage variant="error">{uploadError}</StateMessage>}
        {uploadSuccess && (
          <StateMessage variant="success">{uploadSuccess}</StateMessage>
        )}
      </form>

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
