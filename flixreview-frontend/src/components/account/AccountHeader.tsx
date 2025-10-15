import { Button } from '@/components/ui/Button'

interface AccountHeaderProps {
  isEditing: boolean
  onEditClick: () => void
  onCancelEdit: () => void
  onSaveProfile: () => void
  isSaving: boolean
}

export function AccountHeader({
  isEditing,
  onEditClick,
  onCancelEdit,
  onSaveProfile,
  isSaving
}: AccountHeaderProps) {
  return (
    <div className="text-center mb-8 lg:mb-12">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-rose-800 rounded-2xl mb-6 shadow-neumorphic">
        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      </div>
      <h1 className="text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
        Account Settings
      </h1>
      <p className="account-description">
        Manage your profile, customize your preferences, and control your account settings all in one place.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        {!isEditing ? (
          <Button
            variant="primary"
            onClick={onEditClick}
            className="px-8 py-3 text-lg font-medium shadow-neumorphic hover:shadow-lg transition-all duration-300"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit Profile
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={onCancelEdit}
              disabled={isSaving}
              className="px-6 py-3 border-2 border-surface hover:bg-surface transition-all duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={onSaveProfile}
              disabled={isSaving}
              className="px-8 py-3 text-lg font-medium shadow-neumorphic hover:shadow-lg transition-all duration-300"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}