import Image from 'next/image'
import { AvatarUpload } from '@/components/auth/AvatarUpload'

interface ProfilePictureCardProps {
  user: {
    username: string
    profile_picture_url?: string | null
  }
  isEditing: boolean
}

export function ProfilePictureCard({ user, isEditing }: ProfilePictureCardProps) {
  return (
    <div className="lg:col-span-1">
      <div className="profile-card-container bg-[var(--flix-bg-hover)] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-[var(--shadow-md)] flex flex-col overflow-hidden">
        {/* Card Header Section */}
        <div className="profile-card-header flix-p-lg border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center justify-center flix-gap-sm">
            <div className="profile-card-icon flex items-center justify-center w-8 h-8 rounded-xl" style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)', color: '#ff6b6b' }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="profile-card-title text-lg font-semibold text-[var(--flix-text-primary)]">Profile Picture</h3>
          </div>
        </div>

        {/* Card Content Section */}
  <div className="profile-card-content flex-1 flix-p-lg flex flex-col items-center text-center md:items-start md:text-left">
          {/* Profile Image Container */}
          <div className="profile-image-container flex-shrink-0 mb-6">
            <div className="relative inline-block">
              {user.profile_picture_url ? (
                <Image
                  src={user.profile_picture_url}
                  alt="Profile picture"
                  width={128}
                  height={128}
                  className="profile-image rounded-full object-cover transition-transform duration-300 hover:scale-105"
                  style={{ border: '3px solid rgba(229, 9, 20, 0.45)' }}
                />
              ) : (
                <div
                  className="profile-image-placeholder rounded-full bg-[rgba(255,255,255,0.04)] flex items-center justify-center transition-transform duration-300 hover:scale-105"
                  style={{ width: '128px', height: '128px', border: '3px solid rgba(229, 9, 20, 0.2)' }}
                >
                  <svg className="text-[var(--flix-text-muted)]" style={{ width: '64px', height: '64px' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              <div className="profile-status-indicator absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-[var(--flix-bg-hover)] shadow-[var(--shadow-sm)]">
                <div className="w-full h-full bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* User Info Section */}
          <div className="profile-info-section flex flex-col flix-gap-xs mb-6 md:w-full">
            <h3 className="profile-username text-xl font-semibold text-[var(--flix-text-primary)] md:text-2xl">{user.username}</h3>
            <p className="profile-status text-sm text-[var(--flix-text-secondary)]">Active member</p>
          </div>

          {/* Upload Section */}
          {isEditing && (
            <div className="profile-upload-section w-full md:max-w-sm">
              <AvatarUpload />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}