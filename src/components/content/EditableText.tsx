import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { parseInlineText } from '../../lib/parseInlineText'
import ExternalLink from '../ui/ExternalLink'
import StateMessage from '../ui/StateMessage'
import { buttonClass } from '../ui/buttonStyles'
// Same shared modal as the other inline admin controls (calendar, news, …).
import CalendarEventModal from '../calendar/CalendarEventModal'

// Last-known values per key, so returning to a page renders instantly without a jump.
const contentCache = new Map<string, string>()

type EditableTextProps = {
  // Row key in public.site_content, e.g. "intro" or "contact".
  contentKey: string
  // Shown (in the same [text](länk) syntax) while loading, or if the row is missing or
  // the fetch fails — keeps the layout stable instead of rendering an empty gap.
  fallback?: string
  // Classes for each rendered paragraph.
  className?: string
}

export default function EditableText({
  contentKey,
  fallback = '',
  className = 'text-lg leading-relaxed text-gray-700',
}: EditableTextProps) {
  const { isAdmin } = useAuth()
  const [value, setValue] = useState<string | null>(contentCache.get(contentKey) ?? null)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    supabase
      .from('site_content')
      .select('value')
      .eq('key', contentKey)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error(`Failed to fetch site_content "${contentKey}":`, error)
          return
        }
        if (data) {
          contentCache.set(contentKey, data.value)
          setValue(data.value)
        }
      })
  }, [contentKey])

  const text = value ?? fallback

  function handleSaved(newValue: string) {
    contentCache.set(contentKey, newValue)
    setValue(newValue)
    setEditing(false)
  }

  return (
    // flow-root contains the (sm+) floated admin button so it never overlaps what follows.
    <div className="flow-root">
      {isAdmin && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          // Mobile: own line above the text (full-width text). sm+: floated right.
          className={buttonClass('primary', 'mb-3 sm:float-right sm:mb-2 sm:ml-4')}
        >
          Ändra
        </button>
      )}

      <div className="flex flex-col gap-4">
        {parseInlineText(text).map((paragraph, paragraphIndex) => (
          <p key={paragraphIndex} className={className}>
            {paragraph.map((token, tokenIndex) => {
              if (token.type === 'break') return <br key={tokenIndex} />
              if (token.type === 'text') return token.text
              if (token.href.startsWith('mailto:')) {
                return (
                  <a
                    key={tokenIndex}
                    href={token.href}
                    className="font-medium text-primary underline underline-offset-2 transition-opacity hover:opacity-75"
                  >
                    {token.label}
                  </a>
                )
              }
              return (
                <ExternalLink key={tokenIndex} href={token.href}>
                  {token.label}
                </ExternalLink>
              )
            })}
          </p>
        ))}
      </div>

      {isAdmin && editing && (
        <CalendarEventModal title="Ändra text" onClose={() => setEditing(false)}>
          <EditableTextForm
            contentKey={contentKey}
            initialValue={text}
            onSaved={handleSaved}
            onCancel={() => setEditing(false)}
          />
        </CalendarEventModal>
      )}
    </div>
  )
}

type EditableTextFormProps = {
  contentKey: string
  initialValue: string
  onSaved: (value: string) => void
  onCancel: () => void
}

function EditableTextForm({ contentKey, initialValue, onSaved, onCancel }: EditableTextFormProps) {
  const [draft, setDraft] = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const fieldId = `editable-text-${contentKey}`

  async function handleSubmit(formEvent: FormEvent) {
    formEvent.preventDefault()
    setSaveError(null)
    setSaving(true)

    // upsert so a missing row is created; RLS only lets the admin write.
    const { error } = await supabase
      .from('site_content')
      .upsert({ key: contentKey, value: draft, updated_at: new Date().toISOString() })
      .select()
      .single()

    setSaving(false)

    if (error) {
      setSaveError('Kunde inte spara texten just nu.')
      return
    }

    onSaved(draft)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId} className="label">
          Text
        </label>
        <textarea
          id={fieldId}
          required
          rows={8}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="input"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button type="submit" disabled={saving} className={buttonClass('primary')}>
          {saving ? 'Sparar…' : 'Spara'}
        </button>
        <button type="button" onClick={onCancel} className={buttonClass('secondary')}>
          Avbryt
        </button>
      </div>

      {saveError && <StateMessage variant="error">{saveError}</StateMessage>}
    </form>
  )
}
