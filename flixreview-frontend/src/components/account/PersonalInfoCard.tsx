interface PersonalInfoCardProps {
  user: {
    username: string
    email: string
    first_name?: string
    last_name?: string
  }
}

export function PersonalInfoCard({ user }: PersonalInfoCardProps) {
  return (
    <div className="personal-card-container bg-[var(--flix-bg-hover)] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-[var(--shadow-md)] h-full flex flex-col overflow-hidden">
      {/* Card Header Section */}
      <div className="personal-card-header flix-p-lg border-b border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center flix-gap-sm">
          <div className="personal-card-icon flex items-center justify-center w-10 h-10 rounded-xl" style={{ backgroundColor: 'rgba(229, 9, 20, 0.15)', color: '#ff6b6b' }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="personal-card-title text-lg font-semibold text-[var(--flix-text-primary)]">Personal Information</h3>
        </div>
      </div>

      {/* Card Content Section */}
      <div className="personal-card-content flex-1 flix-p-lg">
        <div className="personal-info-list flex flex-col divide-y divide-[rgba(255,255,255,0.06)]">
          <div className="personal-info-item flex justify-between items-center flix-py-sm">
            <span className="personal-info-label text-sm font-medium text-[var(--flix-text-secondary)]">Username</span>
            <span className="personal-info-value text-sm text-[var(--flix-text-primary)] font-semibold">{user.username}</span>
          </div>

          <div className="personal-info-item flex justify-between items-center flix-py-sm">
            <span className="personal-info-label text-sm font-medium text-[var(--flix-text-secondary)]">Email</span>
            <span className="personal-info-value text-sm text-[var(--flix-text-primary)] font-semibold">{user.email}</span>
          </div>

          {user.first_name && (
            <div className="personal-info-item flex justify-between items-center flix-py-sm">
              <span className="personal-info-label text-sm font-medium text-[var(--flix-text-secondary)]">First Name</span>
              <span className="personal-info-value text-sm text-[var(--flix-text-primary)] font-semibold">{user.first_name}</span>
            </div>
          )}

          {user.last_name && (
            <div className="personal-info-item flex justify-between items-center flix-py-sm">
              <span className="personal-info-label text-sm font-medium text-[var(--flix-text-secondary)]">Last Name</span>
              <span className="personal-info-value text-sm text-[var(--flix-text-primary)] font-semibold">{user.last_name}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}