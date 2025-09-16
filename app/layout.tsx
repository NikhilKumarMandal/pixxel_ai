import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pixxel AI – Advanced AI Image Editor",
  description:
    "Pixxel AI is your AI-powered image editor to crop, resize, upscale, and export images in multiple formats. Create stunning visuals in seconds with AI.",
  keywords: [
    "AI image editor",
    "crop image online",
    "resize image",
    "upscale image",
    "export image in various formats",
    "AI photo enhancer",
    "online image editor"
  ],
  authors: [{ name: "Pixxel AI" }],
  openGraph: {
    title: "Pixxel AI – AI Image Editor & Photo Enhancer",
    description:
      "Edit your images with AI: crop, resize, upscale, and export in multiple formats effortlessly.",
    url: "https://www.pixxelai.live",
    siteName: "Pixxel AI",
    images: [
      {
        url: "https://media.discordapp.net/attachments/1236920122522992701/1417610513671524524/pixxel.jpeg?ex=68cb1c2c&is=68c9caac&hm=ff1234e99d983b55699e95e3038a8c156c724797e8d8bc0007c367887f6d7207&=&format=webp&width=1796&height=923",
        width: 1200,
        height: 630,
        alt: "Pixxel AI Image Editing"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Pixxel AI – AI Image Editor & Photo Enhancer",
    description:
      "Edit your images with AI: crop, resize, upscale, and export in multiple formats effortlessly.",
    images: ["https://media.discordapp.net/attachments/1236920122522992701/1417610513671524524/pixxel.jpeg?ex=68cb1c2c&is=68c9caac&hm=ff1234e99d983b55699e95e3038a8c156c724797e8d8bc0007c367887f6d7207&=&format=webp&width=1796&height=923"]
  },
  metadataBase: new URL("https://www.pixxelai.live"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >

        <ClerkProvider
          publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
        >
          <main className="min-h-full">
            {children}
          </main>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
