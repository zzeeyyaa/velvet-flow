import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
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
  title: "VelvetFlow - High-Concurrency Ticket Flash-Sale Simulator",
  description: "A high-concurrency ticket flash-sale simulator built with Hono (Bun/TypeScript), Next.js 16, Redis (SETNX) distributed locking, PostgreSQL, and Docker.",
  icons: {
    icon: "/cupcake.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid #EAE6E1',
            },
            className: 'font-sans dark:border-[#36322F]'
          }}
        />
      </body>
    </html>
  );
}
