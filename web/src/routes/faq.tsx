import { createFileRoute } from '@tanstack/react-router'
import { FAQPage } from '@/features/landing/pages/faq-page'

export const Route = createFileRoute('/faq')({
  component: FAQPage,
})
