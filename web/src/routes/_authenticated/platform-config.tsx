import { createFileRoute } from '@tanstack/react-router'
import { PlatformConfig } from '@/features/admin/platform-config'

export const Route = createFileRoute('/_authenticated/platform-config')({
  component: PlatformConfig,
})
