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
    <div className="flex flex-col gap-6 lg:gap-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-5">
          <div className="inline-flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-rose-800 shadow-neumorphic">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              Account Settings
            </h1>
            <p className="text-base text-white/70 sm:text-lg lg:max-w-2xl">
              Manage your profile details, avatar, and personalized genre picks in one comfortable dashboard.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:self-center lg:self-start">
          {!isEditing ? (
            <Button
              variant="primary"
              onClick={onEditClick}
              className="inline-flex items-center gap-2 px-7 py-3 text-base font-medium shadow-neumorphic transition-all duration-300 hover:shadow-lg"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit profile
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={onCancelEdit}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium transition-all duration-300 hover:bg-surface"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={onSaveProfile}
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-7 py-3 text-base font-semibold shadow-neumorphic transition-all duration-300 hover:shadow-lg"
              >
                {isSaving ? (
                  <>
                    <div className="h-5 w-5 rounded-full border-b-2 border-white animate-spin"></div>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save changes
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}