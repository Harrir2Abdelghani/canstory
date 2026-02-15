import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'

export function SettingsProfile() {
  return (
    <ContentSection title="Profile" desc="Manage your profile settings">
      <ProfileForm />
    </ContentSection>
  )
}
