import { NextRequest, NextResponse } from "next/server"
import { client } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  try {
    const { getStripe } = await import("@/lib/stripe")
    const stripe = await getStripe()

    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any
        const userId = session.metadata?.userId
        if (!userId) break
        await client.subscription.upsert({
          where: { userId },
          update: { plan: "PRO", customerId: session.customer as string },
          create: { userId, plan: "PRO", customerId: session.customer as string },
        })
        break
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as any
        await client.subscription.updateMany({
          where: { customerId: sub.customer as string },
          data: { plan: "FREE" },
        })
        break
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as any
        await client.subscription.updateMany({
          where: { customerId: invoice.customer as string },
          data: { plan: "FREE" },
        })
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Stripe webhook error:", err)
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 })
  }
}
