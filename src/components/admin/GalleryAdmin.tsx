import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { fetchTable } from '../../lib/fetchTable'
import type { GalleryImage } from '../../data/galleryImages'
import GalleryForm from '../gallery/GalleryForm'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'

export default function GalleryAdmin() {
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

  function handleUploaded() {
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
      <div className="card flex max-w-xl flex-col gap-4">
        <GalleryForm onUploaded={handleUploaded} />

        {uploadSuccess && (
          <StateMessage variant="success">{uploadSuccess}</StateMessage>
        )}
      </div>

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
