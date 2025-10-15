import { TextArea } from '@/components/ui/TextArea'

interface BioCardProps {
  user: {
    bio?: string | null
  }
  isEditing: boolean
  editedBio: string
  onBioChange: (value: string) => void
}

export function BioCard({ user, isEditing, editedBio, onBioChange }: BioCardProps) {
  return (
    <div className="bio-card-container bg-[var(--flix-bg-hover)] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-[var(--shadow-md)] h-full flex flex-col overflow-hidden">
      {/* Card Header Section */}
      <div className="bio-card-header flix-p-lg border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center flix-gap-sm">
          <div className="bio-card-icon flex items-center justify-center w-10 h-10 rounded-xl" style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)', color: '#ff6b6b' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="bio-card-title text-lg font-semibold text-[var(--flix-text-primary)]">Movie Preferences</h3>
        </div>
      </div>

      {/* Card Content Section */}
      <div className="bio-card-content flex-1 flix-p-lg">
        <div className="bio-form-group flex flex-col flix-gap-md">
          <label className="bio-form-label text-sm font-medium text-[var(--flix-text-secondary)]">Bio</label>
          <div className="bio-form-field">
            {isEditing ? (
              <TextArea
                value={editedBio}
                onChange={(e) => onBioChange(e.target.value)}
                placeholder="Tell us about your movie preferences, favorite genres, or what you're looking for in movies..."
                rows={4}
                className="bio-textarea w-full resize-none"
              />
            ) : (
              <div className="bio-display text-sm text-[var(--flix-text-primary)] bg-[rgba(255,255,255,0.03)] rounded-xl flix-p-md min-h-[110px] whitespace-pre-wrap border border-[rgba(255,255,255,0.06)]">
                {user.bio || 'No bio added yet. Click Edit Profile to add your movie preferences!'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}