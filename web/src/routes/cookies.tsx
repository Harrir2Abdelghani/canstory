import { createFileRoute } from '@tanstack/react-router'
import { CookiesPage } from '@/features/landing/pages/cookies-page'

export const Route = createFileRoute('/cookies')({
  component: CookiesPage,
})
