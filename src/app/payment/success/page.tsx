import Link from "next/link"
import { CheckCircle } from "lucide-react"

const PaymentSuccess = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="text-center flex flex-col items-center gap-4 p-8">
      <CheckCircle size={64} className="text-green-500" />
      <h1 className="text-3xl font-bold text-white">You&apos;re on Pro!</h1>
      <p className="text-[#9d9d9d]">Your subscription is active. Enjoy all the Pro features.</p>
      <Link href="/dashboard" className="bg-[#7320DD] hover:bg-[#7320DD]/80 text-white rounded-xl px-8 py-3 font-semibold transition">
        Go to Dashboard
      </Link>
    </div>
  </div>
)

export default PaymentSuccess
