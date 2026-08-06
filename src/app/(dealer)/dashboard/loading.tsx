export default function DashboardLoading() {
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="h-8 w-64 skeleton rounded-xl" />
      <div className="h-32 skeleton rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-64 skeleton rounded-2xl" />
        <div className="lg:col-span-2 h-64 skeleton rounded-2xl" />
      </div>
    </div>
  )
}
