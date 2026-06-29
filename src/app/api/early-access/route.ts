import { NextRequest, NextResponse } from "next/server"
import { client } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    await client.earlyAccessRequest.create({
      data: { name, email, message, status: "pending" },
    })

    const adminEmail = process.env.ADMIN_EMAIL
    const resendKey = process.env.RESEND_API_KEY

    if (resendKey && adminEmail) {
      const from = process.env.NEXT_PUBLIC_SENDER_EMAIL ?? "onboarding@resend.dev"
      const hostUrl = process.env.NEXT_PUBLIC_HOST_URL ?? "http://localhost:3000"

      const html = `
        <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; background: #111; color: #fff; border-radius: 16px; overflow: hidden;">
          <div style="background: #7320DD; padding: 24px;">
            <h1 style="margin: 0; font-size: 20px;">⚡ New Pro Access Request</h1>
          </div>
          <div style="padding: 32px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #9d9d9d; width: 80px; vertical-align: top;">Name</td>
                <td style="padding: 10px 0; color: #fff; font-weight: 600;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #9d9d9d; vertical-align: top;">Email</td>
                <td style="padding: 10px 0;">
                  <a href="mailto:${email}" style="color: #a78bfa;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #9d9d9d; vertical-align: top;">Message</td>
                <td style="padding: 10px 0; color: #ccc; line-height: 1.6;">${message.replace(/\n/g, "<br/>")}</td>
              </tr>
            </table>
            <hr style="border: none; border-top: 1px solid #2d2d2d; margin: 16px 0;" />
            <p style="color: #9d9d9d; font-size: 13px; margin: 0 0 10px;">Manage from admin panel:</p>
            <a href="${hostUrl}/admin" style="display: inline-block; background: #7320DD; color: #fff; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Open Admin Panel →
            </a>
          </div>
          <div style="padding: 16px 32px; border-top: 1px solid #2d2d2d; text-align: center;">
            <p style="color: #555; font-size: 12px; margin: 0;">Onyx · Early Access</p>
          </div>
        </div>
      `

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ from, to: adminEmail, subject: `⚡ Onyx Pro Request — ${name}`, html }),
      })

      if (!emailRes.ok) {
        console.error("[early-access] Resend error:", await emailRes.text())
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[early-access]", err)
    return NextResponse.json({ error: "Failed to send" }, { status: 500 })
  }
}
