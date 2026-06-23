import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "RideShare — Tally Solutions",
  description: "Employee carpooling — find and share rides",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0078D4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-surface-hover">
        <div className="h-1 bg-accent safe-top" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
