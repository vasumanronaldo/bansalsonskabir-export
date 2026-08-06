// Sanity CLI config — used by `npx sanity dataset import`, `sanity deploy`, etc.
import { defineCliConfig } from 'sanity/cli'
import { dataset, projectId } from './sanity/env'

export default defineCliConfig({
  api: { projectId, dataset },
  autoUpdates: true,
})
