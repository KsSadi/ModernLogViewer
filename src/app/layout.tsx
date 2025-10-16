import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Modern Log - Advanced Log Viewer & Analytics",
    template: "%s | Modern Log"
  },
  description: "A powerful, modern log analysis tool with advanced filtering, real-time analytics, and visualization capabilities. Support for Laravel, JSON, Apache, Nginx, and custom log formats.",
  keywords: ["log viewer", "log analyzer", "log analytics", "laravel logs", "nginx logs", "apache logs", "log monitoring", "error tracking", "log management"],
  authors: [{ name: "Modern Log" }],
  creator: "Modern Log",
  publisher: "Modern Log",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://modern-log.vercel.app",
    title: "Modern Log - Advanced Log Viewer & Analytics",
    description: "A powerful, modern log analysis tool with advanced filtering, real-time analytics, and visualization capabilities.",
    siteName: "Modern Log",
  },
  twitter: {
    card: "summary_large_image",
    title: "Modern Log - Advanced Log Viewer & Analytics",
    description: "A powerful, modern log analysis tool with advanced filtering, real-time analytics, and visualization capabilities.",
    creator: "@modernlog",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  metadataBase: new URL("https://modern-log.vercel.app"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
