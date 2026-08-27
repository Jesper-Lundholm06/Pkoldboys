import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'

const MAX_FILE_SIZE = 10 * 1024 * 1024

type DocumentFormProps = {
  onUploaded: () => void
}

// Shared upload form for documents, used both by the admin dashboard's "Dokument" tab
// and the inline admin controls on the public Dokument page. Upload-only — the
// original DocumentsAdmin never supported editing an existing row, only upload +
// delete, so there is no edit mode here either (delete + re-upload stays the flow).
export default function DocumentForm({ onUploaded }: DocumentFormProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

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
    onUploaded()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
    </form>
  )
}
