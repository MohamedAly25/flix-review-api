export const ErrorState = ({ title = 'Something went wrong.', description, action }) => (
  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-10 text-center text-red-200">
    <h3 className="text-lg font-semibold text-red-200">{title}</h3>
    {description ? <p className="mt-2 text-sm text-red-100/80">{description}</p> : null}
    {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
  </div>
)
