export default function DealerDetailLoading() {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 skeleton rounded-xl" />
        <div className="h-8 w-64 skeleton rounded-xl" />
      </div>
      <div className="h-20 skeleton rounded-2xl" />
      <div className="grid grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="h-48 skeleton rounded-2xl" />
          <div className="h-32 skeleton rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-32 skeleton rounded-2xl" />
          <div className="h-48 skeleton rounded-2xl" />
        </div>
        <div className="space-y-4">
          <div className="h-48 skeleton rounded-2xl" />
          <div className="h-32 skeleton rounded-2xl" />
        </div>
      </div>
    </div>
  )
}
