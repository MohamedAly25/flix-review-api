export const LoadingSpinner = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-white/60">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    <p className="text-sm text-white/70">{label}</p>
  </div>
)
