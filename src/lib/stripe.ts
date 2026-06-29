// Package loaded lazily — install when on personal network:
// npm install stripe

export const createCheckoutSession = async (userId: string, userEmail: string) => {
  const Stripe = (await import(/* webpackIgnore: true */ "stripe")).default
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20", typescript: true })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    billing_address_collection: "auto",
    customer_email: userEmail,
    line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_SUBSCRIPTION_PRICE_ID!, quantity: 1 }],
    metadata: { userId },
    success_url: `${process.env.NEXT_PUBLIC_HOST_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_HOST_URL}/payment/cancel`,
  })
  return session
}

export const getStripe = async () => {
  const Stripe = (await import(/* webpackIgnore: true */ "stripe")).default
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2024-06-20", typescript: true })
}
