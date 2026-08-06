export default function StageLoading() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="h-10 w-80 skeleton rounded-xl" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="h-48 skeleton rounded-2xl" />
        <div className="lg:col-span-2 space-y-4">
          <div className="h-48 skeleton rounded-2xl" />
          <div className="h-32 skeleton rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
