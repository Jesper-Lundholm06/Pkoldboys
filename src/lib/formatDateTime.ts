export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}

export function formatEventDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('sv-SE', {
    day: 'numeric',
    month: 'long',
  })
}

export function getEventDayMonth(dateStr: string) {
  const date = new Date(dateStr)
  const shortMonth = date
    .toLocaleDateString('sv-SE', { month: 'short' })
    .replace(/\.$/, '')
    .toUpperCase()
    .slice(0, 3)

  return {
    day: date.toLocaleDateString('sv-SE', { day: 'numeric' }),
    month: shortMonth,
  }
}
