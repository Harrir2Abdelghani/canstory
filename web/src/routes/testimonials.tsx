import { createFileRoute } from '@tanstack/react-router'
import { TestimonialsPage } from '@/features/landing/pages/testimonials-page'

export const Route = createFileRoute('/testimonials')({
  component: TestimonialsPage,
})
