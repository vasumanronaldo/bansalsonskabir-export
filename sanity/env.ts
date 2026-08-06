// Sanity connection config (docs/03 § Environment). Project id + dataset come
// from env; a harmless placeholder keeps typecheck/build green before the client
// creates a project. Studio is force-dynamic so a placeholder never prerenders.

export const apiVersion = process.env.SANITY_API_VERSION || '2024-01-01'

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

// Real id comes from sanity.io once a project is created; see README setup.
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder'

/** True when a real project id is configured (Studio/queries can connect). */
export const sanityConfigured = projectId !== 'placeholder' && projectId.length > 0

export const readToken = process.env.SANITY_API_READ_TOKEN || ''
