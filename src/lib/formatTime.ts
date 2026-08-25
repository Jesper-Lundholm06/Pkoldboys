// Normalizes free-text time input (as typed by admins, e.g. "14", "9.30",
// "14:00") to a consistent "HH:MM" string.
//
// Examples:
//   normalizeTime("14")     -> "14:00"  (hour only, minutes default to 00)
//   normalizeTime("9")      -> "09:00"  (single-digit hour padded)
//   normalizeTime("14.30")  -> "14:30"  (dot treated as colon)
//   normalizeTime("9:15")   -> "09:15"  (hour padded, minutes kept as given)
//   normalizeTime("14:00")  -> "14:00"  (already normalized)
//   normalizeTime("")       -> ""       (no time)
//   normalizeTime("abc")    -> "abc"    (unparseable, returned unchanged)
export function normalizeTime(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return ''

  const withColons = trimmed.replace(/\./g, ':')
  const parts = withColons.split(':')

  if (parts.length === 1) {
    // No colon at all — treat the whole value as an hour.
    if (/^\d+$/.test(parts[0])) {
      return `${parts[0].padStart(2, '0')}:00`
    }
    return withColons
  }

  if (parts.length === 2) {
    const [hours, minutes] = parts
    if (/^\d+$/.test(hours) && /^\d+$/.test(minutes)) {
      return `${hours.padStart(2, '0')}:${minutes}`
    }
    return withColons
  }

  // More than one colon, or otherwise unexpected shape — leave as-is.
  return withColons
}
