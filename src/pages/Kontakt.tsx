import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import type { Contact } from '../data/contacts'
import StateMessage from '../components/ui/StateMessage'
import { buttonClass } from '../components/ui/buttonStyles'
import ContactForm from '../components/contacts/ContactForm'
// Reuses the modal built for the inline calendar/news admin controls (Steps 13f/14)
// so all inline-admin features share one accessible modal implementation.
import CalendarEventModal from '../components/calendar/CalendarEventModal'

const contactLinkClass =
  'inline-flex min-h-11 items-center gap-2 text-lg font-medium text-primary underline underline-offset-2 transition-opacity hover:opacity-75'

function PhoneIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-current stroke-2">
      <path
        d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-none stroke-current stroke-2">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function Kontakt() {
  const { isAdmin } = useAuth()

  const [contacts, setContacts] = useState<Contact[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [actionError, setActionError] = useState<string | null>(null)

  // undefined = modal closed, null = modal open in create mode, a contact = modal open
  // in edit mode for that contact.
  const [modalContact, setModalContact] = useState<Contact | null | undefined>(undefined)

  function refreshContacts() {
    setReloadKey((key) => key + 1)
  }

  function handleContactSaved() {
    setModalContact(undefined)
    refreshContacts()
  }

  async function handleDeleteContact(id: string) {
    if (!window.confirm('Ta bort kontakten?')) {
      return
    }

    setActionError(null)
    const { error: deleteError } = await supabase.from('contacts').delete().eq('id', id)

    if (deleteError) {
      setActionError('Kunde inte ta bort kontakten just nu.')
      return
    }

    if (modalContact && modalContact.id === id) {
      setModalContact(undefined)
    }

    refreshContacts()
  }

  // fetchTable only supports a single order column, so query directly.
  useEffect(() => {
    supabase
      .from('contacts')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to fetch "contacts":', error)
          setError(error.message)
          return
        }
        setContacts(data as Contact[])
        setError(null)
      })
  }, [reloadKey])

  return (
    <div>
      <h1>Kontakt</h1>

      <section>
        {isAdmin && (
          <div className="mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setModalContact(null)}
              className={buttonClass('primary')}
            >
              + Ny kontakt
            </button>
          </div>
        )}

        {isAdmin && actionError && (
          <div className="mb-4">
            <StateMessage variant="error">{actionError}</StateMessage>
          </div>
        )}

        {contacts === null && error === null && <StateMessage>Laddar kontakter…</StateMessage>}

        {error !== null && (
          <StateMessage variant="error">Kunde inte hämta kontakter just nu.</StateMessage>
        )}

        {contacts !== null && error === null && contacts.length === 0 && (
          <StateMessage>Inga kontakter just nu.</StateMessage>
        )}

        {contacts !== null && error === null && contacts.length > 0 && (
          <ul className="grid gap-4 md:grid-cols-2">
            {contacts.map((contact) => (
              <li key={contact.id} className="card">
                <h2 className="mb-0 block border-b-0 pb-0 text-2xl font-bold text-primary">
                  {contact.name}
                </h2>
                {contact.role && (
                  <p className="mt-1 text-lg text-gray-700">{contact.role}</p>
                )}

                {(contact.phone || contact.email) && (
                  <div className="mt-3 flex flex-col">
                    {contact.phone && (
                      <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className={contactLinkClass}>
                        <PhoneIcon />
                        <span>
                          <span className="sr-only">Ring </span>
                          {contact.phone}
                        </span>
                      </a>
                    )}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className={contactLinkClass}>
                        <MailIcon />
                        <span className="break-all">
                          <span className="sr-only">Mejla </span>
                          {contact.email}
                        </span>
                      </a>
                    )}
                  </div>
                )}

                {isAdmin && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setModalContact(contact)}
                      className="min-h-9 rounded-md border-2 border-primary bg-white px-3 py-1 text-sm font-semibold text-primary hover:bg-gray-50 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      Ändra
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContact(contact.id)}
                      className="min-h-9 rounded-md border-2 border-danger bg-white px-3 py-1 text-sm font-semibold text-danger hover:bg-danger-light focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      Ta bort
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}

        {isAdmin && modalContact !== undefined && (
          <CalendarEventModal
            title={modalContact ? 'Ändra kontakt' : 'Ny kontakt'}
            onClose={() => setModalContact(undefined)}
          >
            <ContactForm
              key={modalContact?.id ?? 'new'}
              contact={modalContact}
              onSaved={handleContactSaved}
              onCancel={() => setModalContact(undefined)}
            />
          </CalendarEventModal>
        )}
      </section>
    </div>
  )
}
