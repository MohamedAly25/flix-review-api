import { AccountHeader } from './AccountHeader'
import { ProfilePictureCard } from './ProfilePictureCard'
import { PersonalInfoCard } from './PersonalInfoCard'
import { BioCard } from './BioCard'
import { AccountActions } from './AccountActions'

interface AccountLayoutProps {
  user: {
    username: string
    email: string
    first_name?: string
    last_name?: string
    bio?: string | null
    profile_picture_url?: string | null
  }
  isEditing: boolean
  editedBio: string
  isSaving: boolean
  onEditClick: () => void
  onCancelEdit: () => void
  onSaveProfile: () => void
  onBioChange: (value: string) => void
}

export function AccountLayout({
  user,
  isEditing,
  editedBio,
  isSaving,
  onEditClick,
  onCancelEdit,
  onSaveProfile,
  onBioChange
}: AccountLayoutProps) {
  return (
    <section className="w-full min-h-[80vh] flex items-center justify-center py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="bg-[var(--flix-bg-secondary)] border border-[rgba(255,255,255,0.06)] rounded-3xl shadow-[var(--shadow-lg)] account-card-wide overflow-hidden flex flex-col">
        <AccountHeader
          isEditing={isEditing}
          onEditClick={onEditClick}
          onCancelEdit={onCancelEdit}
          onSaveProfile={onSaveProfile}
          isSaving={isSaving}
        />

        <div className="flix-mt-xl">
          <div className="grid grid-cols-1 xl:grid-cols-[352px_1fr] flix-gap-lg">
            <ProfilePictureCard user={user} isEditing={isEditing} />

            <div className="flex flex-col flix-gap-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 flix-gap-md">
                <PersonalInfoCard user={user} />
                <BioCard
                  user={user}
                  isEditing={isEditing}
                  editedBio={editedBio}
                  onBioChange={onBioChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flix-mt-2xl">
          <AccountActions />
        </div>
      </div>
    </section>
  )
}