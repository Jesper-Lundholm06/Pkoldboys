import { useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { buttonClass } from '../ui/buttonStyles'
import StateMessage from '../ui/StateMessage'
import type { Contact } from '../../data/contacts'

type ContactFormProps = {
  // undefined/null = create mode, a contact = edit mode (pre-filled).
  contact?: Contact | null
  onSaved: (mode: 'created' | 'updated') => void
  onCancel: () => void
}

// Create/edit form for contacts, used by the inline admin controls on the Kontakt page.
// Pass a changing `key` (e.g. keyed on contact id) from the caller when switching which
// contact is being edited, so this component remounts with fresh initial field values.
export default function ContactForm({ contact, onSaved, onCancel }: ContactFormProps) {
  const [name, setName] = useState(contact?.name ?? '')
  const [role, setRole] = useState(contact?.role ?? '')
  const [phone, setPhone] = useState(contact?.phone ?? '')
  const [email, setEmail] = useState(contact?.email ?? '')
  const [sortOrder, setSortOrder] = useState(String(contact?.sort_order ?? 0))
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const editingId = contact?.id ?? null

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault()
    setSaveError(null)
    setSaving(true)

    // Empty optional fields are stored as null so the page hides them.
    const values = {
      name: name.trim(),
      role: role.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      sort_order: Number.parseInt(sortOrder, 10) || 0,
    }

    if (editingId) {
      const { error } = await supabase.from('contacts').update(values).eq('id', editingId)

      setSaving(false)

      if (error) {
        setSaveError('Kunde inte uppdatera kontakten just nu.')
        return
      }

      onSaved('updated')
      return
    }

    const { error } = await supabase.from('contacts').insert(values)

    setSaving(false)

    if (error) {
      setSaveError('Kunde inte spara kontakten just nu.')
      return
    }

    onSaved('created')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="contact-name" className="label">
          Namn
        </label>
        <input
          id="contact-name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-role" className="label">
          Roll (valfritt)
        </label>
        <input
          id="contact-role"
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-phone" className="label">
          Telefon (valfritt)
        </label>
        <input
          id="contact-phone"
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-email" className="label">
          E-post (valfritt)
        </label>
        <input
          id="contact-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="contact-sort-order" className="label">
          Sorteringsordning (lägre visas först)
        </label>
        <input
          id="contact-sort-order"
          type="number"
          step={1}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="input max-w-[10rem]"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={saving} className={buttonClass('primary')}>
          {saving
            ? editingId
              ? 'Uppdaterar…'
              : 'Sparar…'
            : editingId
              ? 'Uppdatera kontakt'
              : 'Spara kontakt'}
        </button>

        {editingId && (
          <button type="button" onClick={onCancel} className={buttonClass('secondary')}>
            Avbryt
          </button>
        )}
      </div>

      {saveError && <StateMessage variant="error">{saveError}</StateMessage>}
    </form>
  )
}
