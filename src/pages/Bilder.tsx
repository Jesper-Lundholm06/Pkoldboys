import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { fetchTable } from '../lib/fetchTable'
import type { GalleryImage } from '../data/galleryImages'
import StateMessage from '../components/ui/StateMessage'
import Lightbox from '../components/ui/Lightbox'

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
  const [images, setImages] = useState<GalleryImage[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<{ src: string; alt: string } | null>(
    null,
  )

  useEffect(() => {
    fetchTable<GalleryImage>('gallery_images', {
      column: 'created_at',
      ascending: false,
    }).then(({ data, error }) => {
      setImages(data)
      setError(error)
    })
  }, [])

  return (
    <div>
      <h1>Bilder</h1>

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
                    <button
                      key={image.id}
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
    </div>
  )
}
