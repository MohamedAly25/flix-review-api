export const EmptyState = ({ title = 'Nothing to show yet.', description }) => (
  <div className="rounded-xl border border-white/10 bg-muted/40 p-10 text-center text-white/70">
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    {description ? <p className="mt-2 text-sm text-white/60">{description}</p> : null}
  </div>
)
