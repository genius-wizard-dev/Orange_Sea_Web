import { Metadata } from "next";
import OceanBackground from "@/components/background/OceanBackground";
import MainLayout from "@/components/Main";
import { Toaster } from "@/components/ui/sonner";
import FCMToken from "@/lib/firebaseForeground";
import { Geist, Geist_Mono } from "next/font/google";
import "./bg.css";
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
  title: "Orange Sea",
  description: "Orange Sea Web Application",
  icons: {
    icon: "/images/icon.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/icon.jpg" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  min-w-screen min-h-screen pointer-events-smooth!important`}
      >
        <OceanBackground speed={0.5} />
        <FCMToken />
        <MainLayout>{children}</MainLayout>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
