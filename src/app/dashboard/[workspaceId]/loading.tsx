const Sk = ({ className }: { className: string }) => (
  <div className={`bg-[#2d2d2d] rounded animate-pulse ${className}`} />
)

export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-8">
      {/* Workspace header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <Sk className="h-7 w-48" />
          <Sk className="h-4 w-32" />
        </div>
        <Sk className="h-9 w-32 rounded-lg" />
      </div>

      {/* Folders section */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Sk className="h-4 w-20" />
          <Sk className="h-8 w-28 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl p-4 flex flex-col gap-3">
              <Sk className="w-8 h-8 rounded-lg" />
              <Sk className="h-4 w-24" />
              <Sk className="h-3 w-16" />
            </div>
          ))}
        </div>
      </div>

      {/* Videos section */}
      <div className="flex flex-col gap-3">
        <Sk className="h-4 w-28" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl overflow-hidden">
              <Sk className="aspect-video w-full rounded-none" />
              <div className="p-3 flex flex-col gap-2">
                <Sk className="h-4 w-3/4" />
                <div className="flex items-center justify-between">
                  <Sk className="h-3 w-20" />
                  <Sk className="h-3 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
