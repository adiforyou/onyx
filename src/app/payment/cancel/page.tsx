import Link from "next/link"
import { XCircle } from "lucide-react"

const PaymentCancel = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="text-center flex flex-col items-center gap-4 p-8">
      <XCircle size={64} className="text-red-500" />
      <h1 className="text-3xl font-bold text-white">Payment cancelled</h1>
      <p className="text-[#9d9d9d]">No worries — you can upgrade anytime from your billing page.</p>
      <Link href="/dashboard/billing" className="bg-[#1d1d1d] hover:bg-[#2d2d2d] border border-[#2d2d2d] text-white rounded-xl px-8 py-3 font-semibold transition">
        Back to Billing
      </Link>
    </div>
  </div>
)

export default PaymentCancel
