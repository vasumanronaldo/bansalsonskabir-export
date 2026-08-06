import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Static generation + webhook revalidation (docs/03 § Rendering).
  useCdn: true,
})
