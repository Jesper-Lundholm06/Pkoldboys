export const TAG_SUGGESTIONS = ['Riksserien', 'Klubbmatcher', 'Träning']

const TAG_COLORS: Record<string, string> = {
  riksserien: 'bg-blue-100 text-blue-800',
  klubbmatcher: 'bg-green-100 text-green-800',
  träning: 'bg-gray-200 text-gray-800',
}

const DEFAULT_TAG_COLOR = 'bg-amber-100 text-amber-800'

export function tagColorClass(tag: string) {
  return TAG_COLORS[tag.trim().toLowerCase()] ?? DEFAULT_TAG_COLOR
}
