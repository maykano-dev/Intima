export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="space-y-6 max-w-lg mx-auto">
        <div className="h-8 bg-surface rounded w-48 mx-auto animate-pulse" />
        <div className="h-4 bg-surface rounded w-64 mx-auto animate-pulse" />
        <div className="h-64 bg-surface rounded-2xl animate-pulse mt-8" />
      </div>
    </div>
  )
}
