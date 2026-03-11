import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recruitment Application",
  description: "Recruitment workflow platform frontend",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
