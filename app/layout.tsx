import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mascot Madness Bracket",
  description: "NCAA Tournament Bracket - Pick winners by mascots!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
