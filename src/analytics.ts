import type { PostHog } from 'posthog-js'
import { safeProperties } from './analyticsPayload'

const key = import.meta.env.VITE_POSTHOG_KEY as string | undefined
const host = import.meta.env.VITE_POSTHOG_HOST || 'https://us.i.posthog.com'
const preferenceKey = 'tvm-usage-choice'
let client: PostHog | undefined
let allowed = false
let starting: Promise<void> | undefined
export const analyticsConfigured = Boolean(key)

export function analyticsChoice(): boolean {
  try {
    return localStorage.getItem(preferenceKey) === 'yes'
  } catch {
    return false
  }
}

// Load the SDK only after permission; no replay, DOM capture, names, emails or answers.
export async function setAnalytics(enabled: boolean): Promise<void> {
  allowed = enabled
  try {
    localStorage.setItem(preferenceKey, enabled ? 'yes' : 'no')
  } catch {
    /* optional */
  }
  if (!enabled) {
    client?.opt_out_capturing()
    client?.reset()
    return
  }
  if (!key) return
  if (client) {
    client.opt_in_capturing({ captureEventName: false })
    return
  }
  if (!starting)
    starting = import('posthog-js')
      .then(({ default: posthog }) => {
        if (!allowed) return
        const instance = posthog.init(key, {
          api_host: host,
          autocapture: false,
          capture_pageview: false,
          capture_pageleave: false,
          disable_session_recording: true,
          disable_surveys: true,
          enable_heatmaps: false,
          capture_performance: false,
          capture_exceptions: false,
          disable_external_dependency_loading: true,
          person_profiles: 'never',
          persistence: 'localStorage',
          respect_dnt: true,
          ip: false,
          advanced_disable_feature_flags: true,
          before_send: (event) => {
            if (!event || !allowed) return null
            event.properties = safeProperties(event.properties)
            return event
          },
          property_denylist: [
            '$current_url',
            '$referrer',
            '$initial_referrer',
            '$initial_current_url',
            '$pathname',
            '$search',
            '$hash',
          ],
        })
        instance.opt_in_capturing({ captureEventName: false })
        client = instance
      })
      .catch((error: unknown) => {
        /* Analytics must never block studying. */
        if (import.meta.env.DEV) console.warn('Usage statistics could not start.', error)
      })
      .finally(() => {
        starting = undefined
      })
  await starting
}

type Properties = Record<string, string | number | boolean>
export async function track(event: string, properties: Properties = {}) {
  if (!allowed || !key) return
  await starting
  if (!allowed) return
  // Only explicit campaign labels, never arbitrary query strings or referrer URLs.
  const params = new URLSearchParams(location.search)
  const campaign: Properties = {}
  for (const name of ['utm_source', 'utm_medium', 'utm_campaign']) {
    const value = params.get(name)
    if (value && /^[a-zA-Z0-9_-]{1,60}$/.test(value)) campaign[name] = value
  }
  client?.capture(event, {
    ...campaign,
    ...properties,
    app: 'tvm-study-desk',
    is_test: params.get('test_analytics') === '1',
  })
}
