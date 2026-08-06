import type { SchemaTypeDefinition } from 'sanity'

import { siteSettings } from './siteSettings'
import { collection } from './collection'
import { piece } from './piece'
import { journalPost } from './journalPost'
import { timelineEvent, processStep, faq } from './house'
import { appointmentRequest } from './appointmentRequest'
import {
  dossier,
  metalLine,
  stoneLine,
  operationLine,
  outsourcedStep,
  hallmark,
  serviceRecord,
} from './dossier'

export const schemaTypes: SchemaTypeDefinition[] = [
  // documents
  siteSettings,
  collection,
  piece,
  journalPost,
  timelineEvent,
  processStep,
  faq,
  appointmentRequest,
  // objects (maker's dossier)
  dossier,
  metalLine,
  stoneLine,
  operationLine,
  outsourcedStep,
  hallmark,
  serviceRecord,
]
