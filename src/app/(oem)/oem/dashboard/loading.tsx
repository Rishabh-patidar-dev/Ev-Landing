export default function OEMDashboardLoading() {
  return (
    <div className="p-6 max-w-full space-y-6">
      <div className="h-8 w-48 skeleton rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 skeleton rounded-2xl" />)}
      </div>
      <div className="h-16 skeleton rounded-2xl" />
      <div className="flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => <div key={i} className="w-64 h-96 skeleton rounded-2xl flex-shrink-0" />)}
      </div>
    </div>
  )
}
