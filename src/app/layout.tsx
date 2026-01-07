import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const viewport: Viewport = {
  themeColor: "#FDFCDC",
};

export const metadata: Metadata = {
  title: APP_NAME,
  description: "A shared space for us.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(outfit.className, "min-h-screen bg-background text-foreground antialiased")}>
        {children}
      </body>
    </html>
  );
}
