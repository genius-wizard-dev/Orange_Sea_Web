// import { store } from "@/redux/store";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased  min-w-screen min-h-screen`}
      >
        <OceanBackground speed={0.5} />
        <FCMToken />
        <MainLayout>{children}</MainLayout>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
