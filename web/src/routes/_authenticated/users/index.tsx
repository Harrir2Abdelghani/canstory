import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { AdminUsers } from '@/features/admin/users'

const usersSearchSchema = z.object({
  page: z.number().optional().catch(1),
  pageSize: z.number().optional().catch(10),
  status: z
    .array(
      z.union([
        z.literal('active'),
        z.literal('inactive'),
        z.literal('invited'),
        z.literal('suspended'),
      ])
    )
    .optional()
    .catch([]),
  role: z
    .array(
      z.union([
        z.literal('superadmin'),
        z.literal('admin'),
        z.literal('doctor'),
        z.literal('pharmacy'),
        z.literal('patient'),
        z.literal('association'),
      ])
    )
    .optional()
    .catch([]),
  username: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/users/')({
  validateSearch: usersSearchSchema,
  component: AdminUsers,
})
