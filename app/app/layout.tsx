import type { Metadata, Viewport } from "next";
import "./globals.css";
import NotificationPrompt from "./components/NotificationPrompt";

export const metadata: Metadata = {
  title: "Wardrobe AI Closet",
  description: "Single-user, self-hosted wardrobe organizer powered by AI with ADHD-optimized design",
  applicationName: "Wardrobe AI Closet",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "My Closet",
  },
  formatDetection: {
    telephone: false,
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#6750a4",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className="antialiased">
        {children}
        <NotificationPrompt />
      </body>
    </html>
  );
}
