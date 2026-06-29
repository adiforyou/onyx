const Sk = ({ className }: { className: string }) => (
  <div className={`bg-[#2d2d2d] rounded animate-pulse ${className}`} />
)

export default function BillingLoading() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="flex flex-col gap-1">
        <Sk className="h-8 w-24" />
        <Sk className="h-4 w-48" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-[#1d1d1d] border border-[#2d2d2d] rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Sk className="h-5 w-12" />
              <Sk className="h-5 w-16 rounded-full" />
            </div>
            <Sk className="h-9 w-28" />
            <div className="flex flex-col gap-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center gap-2">
                  <Sk className="w-3 h-3 rounded-full shrink-0" />
                  <Sk className="h-3 w-36" />
                </div>
              ))}
            </div>
            <Sk className="h-10 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
