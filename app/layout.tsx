import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GEMASIX — Karang Taruna Genuk Baru RT 06 RW 07",
  description:
    "Website resmi Karang Taruna GEMASIX (Genuk Baru RT 06 RW 07). Media informasi, program kerja, dokumentasi kegiatan, dan agenda organisasi.",
  keywords: ["karang taruna", "gemasix", "genuk baru", "rt06", "rw07", "semarang"],
  openGraph: {
    title: "GEMASIX — Karang Taruna Genuk Baru RT 06 RW 07",
    description:
      "Website resmi Karang Taruna GEMASIX. Media informasi, program kerja, dan agenda organisasi.",
    type: "website",
    locale: "id_ID",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geist.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
