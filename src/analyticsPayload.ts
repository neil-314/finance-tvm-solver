// Keep this small and explicit: never send the page URL, typed answers or calculator values.
const permitted = new Set([
  'token',
  'distinct_id',
  '$device_id',
  '$session_id',
  '$window_id',
  '$lib',
  '$lib_version',
  '$process_person_profile',
  'page',
  'item',
  'question',
  'correct',
  'hints',
  'solution_revealed',
  'hint',
  'target',
  'success',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'is_test',
  'app',
])
export function safeProperties(properties: Record<string, unknown>) {
  return Object.fromEntries(Object.entries(properties).filter(([name]) => permitted.has(name)))
}
