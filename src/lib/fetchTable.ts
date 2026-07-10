import { supabase } from './supabase'

export async function fetchTable<T>(
  table: string,
  orderBy: { column: string; ascending?: boolean },
): Promise<{ data: T[] | null; error: string | null }> {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order(orderBy.column, { ascending: orderBy.ascending ?? true })

  if (error) {
    console.error(`Failed to fetch "${table}":`, error)
    return { data: null, error: error.message }
  }

  return { data: data as T[], error: null }
}
