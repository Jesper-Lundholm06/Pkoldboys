export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString('sv-SE', {
    dateStyle: 'short',
    timeStyle: 'short',
  })
}
