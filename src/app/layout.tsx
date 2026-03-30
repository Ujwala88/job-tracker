import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Job Tracker",
  description: "Job application tracker and interview prep",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}