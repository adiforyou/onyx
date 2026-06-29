// Uses Resend REST API directly — no npm package needed
const sendEmail = async (to: string, subject: string, html: string) => {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return

  const from = process.env.NEXT_PUBLIC_SENDER_EMAIL ?? "onboarding@resend.dev"

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Resend error ${res.status}: ${err}`)
  }
}

export const sendFirstViewerEmail = async ({
  ownerEmail,
  ownerName,
  videoTitle,
  videoUrl,
  viewerName,
  thumbnailUrl,
}: {
  ownerEmail: string
  ownerName: string
  videoTitle: string
  videoUrl: string
  viewerName?: string
  thumbnailUrl?: string
}) => {
  try {
    await sendEmail(
      ownerEmail,
      `Someone watched your video: "${videoTitle}"`,
      `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #111; color: #fff; border-radius: 16px; overflow: hidden;">
          <div style="background: #7320DD; padding: 24px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">👁️ First Viewer!</h1>
          </div>
          <div style="padding: 32px;">
            <p style="color: #9d9d9d; margin-top: 0;">Hey ${ownerName},</p>
            <p style="color: #ccc;">
              ${viewerName ? `<strong style="color: #fff">${viewerName}</strong> just` : "Someone just"} watched your video
              <strong style="color: #fff"> "${videoTitle}"</strong> for the first time!
            </p>
            ${thumbnailUrl ? `
              <a href="${videoUrl}" style="display: block; margin: 24px 0; border-radius: 12px; overflow: hidden;">
                <img src="${thumbnailUrl}" alt="${videoTitle}" style="width: 100%; display: block;" />
              </a>
            ` : ""}
            <a href="${videoUrl}" style="display: inline-block; background: #7320DD; color: #fff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; margin-top: 16px;">
              View Video →
            </a>
          </div>
          <div style="padding: 16px 32px; border-top: 1px solid #2d2d2d; text-align: center;">
            <p style="color: #555; font-size: 12px; margin: 0;">Onyx · AI-Powered Video Messaging</p>
          </div>
        </div>
      `
    )
  } catch (err) {
    console.error("[resend] sendFirstViewerEmail failed:", err)
  }
}

export { sendEmail }
