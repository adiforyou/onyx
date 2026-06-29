import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import {Manrope} from "next/font/google"
import "./globals.css";
import { ThemeProvider } from "@/components/theme"
import { Toaster } from "sonner";
const manrope = Manrope({subsets: ['latin']})

export const metadata: Metadata = {
  title: "Onyx",
  description: "AI-powered video messaging. Record, share, and let AI do the rest.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.className} bg-[#171717] `}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
          {children}
          <Toaster theme="dark" richColors />
          </ThemeProvider>
          </body>
    </html>
    </ClerkProvider>
  );
}

