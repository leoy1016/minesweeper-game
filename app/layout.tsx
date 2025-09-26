import type { Metadata } from "next";
import { Cutive_Mono } from "next/font/google";
import "./globals.css";

const cutiveMono = Cutive_Mono({
  variable: "--font-cutive-mono",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "sweeper",
  description: "A minimalist minesweeper game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${cutiveMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
