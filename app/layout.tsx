import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SIPADI - Sistem Pakar Diagnosa Padi",
  description:
    "SIPADI adalah sistem pakar berbasis AI untuk mendiagnosa penyakit dan hama pada tanaman padi. Dapatkan hasil diagnosa akurat dan panduan penanganan secara instan.",
  keywords: [
    "diagnosa padi",
    "sistem pakar",
    "penyakit padi",
    "hama padi",
    "AI pertanian",
    "SIPADI",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${plusJakartaSans.variable} antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
