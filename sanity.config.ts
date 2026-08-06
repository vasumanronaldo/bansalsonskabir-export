'use client'

// Sanity Studio config, embedded at /studio (docs/03 § Studio configuration).
// Vision (the query playground) is enabled in development only.
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { apiVersion, dataset, projectId } from './sanity/env'
import { schemaTypes } from './sanity/schemaTypes'
import { structure } from './sanity/structure'

const plugins = [structureTool({ structure })]
if (process.env.NODE_ENV === 'development') {
  plugins.push(visionTool({ defaultApiVersion: apiVersion }))
}

export default defineConfig({
  name: 'bansal-sons',
  title: 'Bansal Sons Jewellers',
  basePath: '/studio',
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins,
})
