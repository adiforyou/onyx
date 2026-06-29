const Sk = ({ className }: { className: string }) => (
  <div className={`bg-[#2d2d2d] rounded animate-pulse ${className}`} />
)

export default function NotificationsLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Sk className="h-8 w-40" />

      <div className="flex flex-col gap-2">
        <Sk className="h-3 w-32 mb-1" />
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sk className="w-9 h-9 rounded-full shrink-0" />
              <div className="flex flex-col gap-1.5">
                <Sk className="h-4 w-32" />
                <Sk className="h-3 w-48" />
              </div>
            </div>
            <Sk className="h-8 w-20 rounded-lg shrink-0" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <Sk className="h-3 w-20 mb-1" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-xl p-4 flex items-start gap-3">
            <Sk className="w-2 h-2 rounded-full mt-1.5 shrink-0" />
            <Sk className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>
  )
}
