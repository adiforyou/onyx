import type { Metadata } from "next";
import { ClerkProvider } from '@clerk/nextjs'
import {Manrope} from "next/font/google"
import "./globals.css";
import { ThemeProvider } from "@/components/theme";
const manrope = Manrope({subsets: ['latin']})

export const metadata: Metadata = {
  title: "Opal",
  description: "Share AI powered videos with your friends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
    <html lang="en">
      <body
        className={`${manrope.className} bg-[#171717] `}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
          {children}
          </ThemeProvider>
          </body>
    </html>
    </ClerkProvider>
  );
}

