const Sk = ({ className }: { className: string }) => (
  <div className={`bg-[#2d2d2d] rounded animate-pulse ${className}`} />
)

export default function SettingsLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <Sk className="h-8 w-32" />

      {/* Profile card */}
      <div className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-2xl p-6 flex flex-col gap-5">
        <Sk className="h-4 w-20" />
        <div className="flex items-center gap-4">
          <Sk className="w-16 h-16 rounded-full shrink-0" />
          <div className="flex flex-col gap-2 flex-1">
            <Sk className="h-5 w-40" />
            <Sk className="h-4 w-56" />
            <Sk className="h-5 w-12 rounded-full" />
          </div>
        </div>
        <Sk className="h-4 w-3/4" />
      </div>

      {/* Notifications card */}
      <div className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-2xl p-6 flex flex-col gap-4">
        <Sk className="h-4 w-28" />
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center justify-between">
            <Sk className="h-4 w-72" />
            <Sk className="w-10 h-5 rounded-full shrink-0" />
          </div>
        ))}
      </div>

      {/* AI card */}
      <div className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-2xl p-6 flex flex-col gap-3">
        <Sk className="h-4 w-24" />
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <Sk className="h-4 w-28" />
            <Sk className="h-3 w-52" />
          </div>
          <Sk className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}
