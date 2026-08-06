// Created by the appointment API (Phase 5); read-only in Studio. Never edited by
// hand — staff only move it through the status pipeline.
import { defineField, defineType } from 'sanity'

export const APPOINTMENT_STATUS = ['new', 'contacted', 'booked', 'closed'] as const

export const appointmentRequest = defineType({
  name: 'appointmentRequest',
  title: 'Appointment request',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({ name: 'name', title: 'Name', type: 'string' }),
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'preferredDate', title: 'Preferred date', type: 'date' }),
    defineField({ name: 'preferredTime', title: 'Preferred time', type: 'string' }),
    defineField({ name: 'occasion', title: 'Occasion', type: 'string' }),
    defineField({ name: 'budgetRange', title: 'Budget range', type: 'string' }),
    defineField({ name: 'interest', title: 'Interest', type: 'string' }),
    defineField({ name: 'requirement', title: 'Requirement', type: 'text', rows: 3 }),
    defineField({ name: 'contactMethod', title: 'Preferred contact method', type: 'string' }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      // Status is the one field staff change — override read-only for it.
      readOnly: false,
      options: { list: [...APPOINTMENT_STATUS], layout: 'radio' },
      initialValue: 'new',
    }),
    defineField({ name: 'submittedAt', title: 'Submitted at', type: 'datetime' }),
  ],
  orderings: [{ title: 'Most recent', name: 'submittedAt', by: [{ field: 'submittedAt', direction: 'desc' }] }],
  preview: { select: { title: 'name', date: 'submittedAt', status: 'status' }, prepare: ({ title, date, status }) => ({ title: title || 'Request', subtitle: [status, date && new Date(date).toLocaleDateString('en-IN')].filter(Boolean).join(' · ') }) },
})
