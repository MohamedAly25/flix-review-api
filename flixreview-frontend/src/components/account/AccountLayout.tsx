import type { ReactNode } from 'react'

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
  preferredGenresCard?: ReactNode
}

export function AccountLayout({
  user,
  isEditing,
  editedBio,
  isSaving,
  onEditClick,
  onCancelEdit,
  onSaveProfile,
  onBioChange,
  preferredGenresCard,
}: AccountLayoutProps) {
  return (
    <section className="w-full space-y-12 sm:space-y-14 lg:space-y-16">
      <div className="relative overflow-hidden rounded-3xl border border-[rgba(255,255,255,0.06)] bg-[var(--flix-bg-secondary)] shadow-[var(--shadow-lg)] account-card-wide">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(229,9,20,0.22),transparent_60%)] opacity-80"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(229,9,20,0.2),transparent_65%)] blur-3xl opacity-70"
        />

        <div className="relative flex flex-col gap-12">
          <AccountHeader
            isEditing={isEditing}
            onEditClick={onEditClick}
            onCancelEdit={onCancelEdit}
            onSaveProfile={onSaveProfile}
            isSaving={isSaving}
          />

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

              {preferredGenresCard && (
                <div className="min-h-[320px]">
                  {preferredGenresCard}
                </div>
              )}
            </div>
          </div>

          <AccountActions />
        </div>
      </div>
    </section>
  )
}