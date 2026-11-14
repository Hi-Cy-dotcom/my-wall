import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MY WALL",
  description: "A 2008-style wall application with real-time updates",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {children}
      </body>
    </html>
  );
}
