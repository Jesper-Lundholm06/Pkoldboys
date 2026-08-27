import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { fetchTable } from '../lib/fetchTable'
import type { GalleryImage } from '../data/galleryImages'
import StateMessage from '../components/ui/StateMessage'
import Lightbox from '../components/ui/Lightbox'
import { buttonClass } from '../components/ui/buttonStyles'
import GalleryForm from '../components/gallery/GalleryForm'
// Reuses the modal built for the inline calendar/news/member-post/document admin
// controls so all inline-admin features share one accessible modal implementation.
import CalendarEventModal from '../components/calendar/CalendarEventModal'

function groupByAlbum(images: GalleryImage[]) {
  const groups = new Map<string, GalleryImage[]>()

  for (const image of images) {
    const key = image.album?.trim() || 'Övrigt'
    const existing = groups.get(key)
    if (existing) {
      existing.push(image)
    } else {
      groups.set(key, [image])
    }
  }

  return groups
}

export default function Bilder() {
  const { isAdmin } = useAuth()

  const [images, setImages] = useState<GalleryImage[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<{ src: string; alt: string } | null>(
    null,
  )
  const [reloadKey, setReloadKey] = useState(0)
  const [actionError, setActionError] = useState<string | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)

  function refreshImages() {
    setReloadKey((key) => key + 1)
  }

  function handleUploaded() {
    setShowUploadModal(false)
    refreshImages()
  }

  async function handleDelete(image: GalleryImage) {
    if (!window.confirm('Ta bort bilden?')) {
      return
    }

    setActionError(null)

    const { error: removeErr } = await supabase.storage
      .from('gallery')
      .remove([image.file_path])

    if (removeErr) {
      setActionError('Kunde inte ta bort filen just nu.')
      return
    }

    const { error: deleteErr } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', image.id)

    if (deleteErr) {
      setActionError('Kunde inte ta bort bilden just nu.')
      return
    }

    refreshImages()
  }

  useEffect(() => {
    fetchTable<GalleryImage>('gallery_images', {
      column: 'created_at',
      ascending: false,
    }).then(({ data, error }) => {
      setImages(data)
      setError(error)
    })
  }, [reloadKey])

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1>Bilder</h1>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className={buttonClass('primary')}
          >
            + Ny bild
          </button>
        )}
      </div>

      {isAdmin && actionError && (
        <div className="mb-4 max-w-2xl">
          <StateMessage variant="error">{actionError}</StateMessage>
        </div>
      )}

      <div className="mt-6 max-w-2xl">
        {images === null && error === null && (
          <StateMessage>Laddar bilder…</StateMessage>
        )}

        {error !== null && (
          <StateMessage variant="error">
            Kunde inte hämta bilder just nu.
          </StateMessage>
        )}

        {images !== null && error === null && images.length === 0 && (
          <StateMessage>Inga bilder än.</StateMessage>
        )}
      </div>

      {images !== null && error === null && images.length > 0 && (
        <div className="mt-6 flex flex-col gap-10">
          {Array.from(groupByAlbum(images)).map(([album, items]) => (
            <section key={album}>
              <h2>{album}</h2>
              <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((image) => {
                  const { data } = supabase.storage
                    .from('gallery')
                    .getPublicUrl(image.file_path)
                  const alt = image.title || image.album || 'Bild'

                  return (
                    <div key={image.id} className="relative">
                      <button
                        type="button"
                        onClick={() => setSelected({ src: data.publicUrl, alt })}
                        className="block overflow-hidden rounded-lg text-left shadow-md transition-shadow hover:shadow-lg focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <img
                          src={data.publicUrl}
                          alt={alt}
                          className="h-64 w-full object-cover"
                        />
                      </button>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => handleDelete(image)}
                          aria-label={`Ta bort bilden ${alt}`}
                          className="absolute right-2 top-2 min-h-9 rounded-md border-2 border-danger bg-white/90 px-3 py-1 text-sm font-semibold text-danger shadow-sm hover:bg-danger-light focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                        >
                          Ta bort
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {selected && (
        <Lightbox
          src={selected.src}
          alt={selected.alt}
          onClose={() => setSelected(null)}
        />
      )}

      {isAdmin && showUploadModal && (
        <CalendarEventModal title="Ny bild" onClose={() => setShowUploadModal(false)}>
          <GalleryForm onUploaded={handleUploaded} />
        </CalendarEventModal>
      )}
    </div>
  )
}
