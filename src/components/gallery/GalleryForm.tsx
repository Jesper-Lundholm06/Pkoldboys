import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'

const MAX_FILE_SIZE = 10 * 1024 * 1024

type GalleryFormProps = {
  onUploaded: () => void
}

// Shared upload form for gallery images, used both by the admin dashboard's "Bilder"
// tab and the inline admin controls on the public Bilder page. Upload-only — the
// original GalleryAdmin never supported editing an existing row, only upload +
// delete, so there is no edit mode here either.
export default function GalleryForm({ onUploaded }: GalleryFormProps) {
  const [title, setTitle] = useState('')
  const [album, setAlbum] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  function resetForm() {
    setTitle('')
    setAlbum('')
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setUploadError(null)

    if (!file) {
      setUploadError('Välj en bildfil.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Filen är för stor (max 10 MB).')
      return
    }

    setUploading(true)

    const path = `${Date.now()}_${file.name}`
    const { error: uploadErr } = await supabase.storage.from('gallery').upload(path, file)

    if (uploadErr) {
      setUploading(false)
      setUploadError('Kunde inte ladda upp bilden just nu.')
      return
    }

    const { error: insertErr } = await supabase
      .from('gallery_images')
      .insert({ title: title || null, file_path: path, album: album || null })

    setUploading(false)

    if (insertErr) {
      setUploadError('Kunde inte spara bilden just nu.')
      return
    }

    resetForm()
    onUploaded()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="image-title" className="label">
          Titel (valfritt)
        </label>
        <input
          id="image-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="image-album" className="label">
          Album (valfritt)
        </label>
        <input
          id="image-album"
          type="text"
          value={album}
          onChange={(e) => setAlbum(e.target.value)}
          className="input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="image-file" className="label">
          Bildfil
        </label>
        <input
          id="image-file"
          ref={fileInputRef}
          type="file"
          accept="image/*"
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
        {uploading ? 'Laddar upp…' : 'Ladda upp bild'}
      </button>

      {uploadError && <StateMessage variant="error">{uploadError}</StateMessage>}
    </form>
  )
}
