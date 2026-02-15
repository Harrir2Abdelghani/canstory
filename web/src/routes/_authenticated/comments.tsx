import { createFileRoute } from '@tanstack/react-router'
import { CommentsModeration } from '@/features/admin/comments'

export const Route = createFileRoute('/_authenticated/comments')({
  component: CommentsModeration,
})
