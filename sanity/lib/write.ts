// Server-only Sanity write client (appointment requests, Phase 5). Uses a write
// token; never imported into client code. Returns null when unconfigured so the
// handler degrades gracefully.
import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId, sanityConfigured } from '../env'

const writeToken = process.env.SANITY_API_WRITE_TOKEN || ''

export function getWriteClient() {
  if (!sanityConfigured || !writeToken) return null
  return createClient({ projectId, dataset, apiVersion, token: writeToken, useCdn: false })
}
