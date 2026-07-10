import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchTable } from '../../lib/fetchTable'
import type { GalleryImage } from '../../data/galleryImages'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'

const MAX_FILE_SIZE = 10 * 1024 * 1024

export default function GalleryAdmin() {
  const [title, setTitle] = useState('')
  const [album, setAlbum] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)

  const [images, setImages] = useState<GalleryImage[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)

  async function loadImages() {
    const { data, error } = await fetchTable<GalleryImage>('gallery_images', {
      column: 'created_at',
      ascending: false,
    })
    setImages(data)
    setListError(error)
  }

  useEffect(() => {
    loadImages()
  }, [])

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
    setUploadSuccess(null)

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
    const { error: uploadErr } = await supabase.storage
      .from('gallery')
      .upload(path, file)

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
    setUploadSuccess('Bilden laddades upp')
    loadImages()
  }

  async function handleDelete(image: GalleryImage) {
    if (!window.confirm('Ta bort bilden?')) {
      return
    }

    const { error: removeErr } = await supabase.storage
      .from('gallery')
      .remove([image.file_path])

    if (removeErr) {
      setListError('Kunde inte ta bort filen just nu.')
      return
    }

    const { error: deleteErr } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', image.id)

    if (deleteErr) {
      setListError('Kunde inte ta bort bilden just nu.')
      return
    }

    loadImages()
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="card flex max-w-xl flex-col gap-4">
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
        {uploadSuccess && (
          <StateMessage variant="success">{uploadSuccess}</StateMessage>
        )}
      </form>

      <div className="mt-8">
        {images === null && listError === null && (
          <StateMessage>Laddar bilder…</StateMessage>
        )}

        {listError !== null && (
          <StateMessage variant="error">Kunde inte hämta bilder just nu.</StateMessage>
        )}

        {images !== null && images.length === 0 && (
          <StateMessage>Inga bilder än.</StateMessage>
        )}

        {images !== null && images.length > 0 && (
          <ul className="flex flex-col gap-4">
            {images.map((image) => (
              <li
                key={image.id}
                className="card flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <p className="text-lg font-semibold">
                    {image.title || image.file_path}
                  </p>
                  <p className="text-base text-gray-500">
                    {image.album ? `${image.album} · ` : ''}
                    {new Date(image.created_at).toLocaleDateString('sv-SE')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(image)}
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
