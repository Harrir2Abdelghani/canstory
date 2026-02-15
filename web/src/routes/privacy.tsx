import { createFileRoute } from '@tanstack/react-router'
import { PrivacyPage } from '@/features/landing/pages/privacy-page'

export const Route = createFileRoute('/privacy')({
  component: PrivacyPage,
})
