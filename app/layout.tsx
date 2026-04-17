import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteBrand } from "@/app/components/site-brand";
import "./globals.css";

export const metadata: Metadata = {
  title: "Philo-Snacks",
  description: "A public archive of sharp philosophy essays and downloadable PDFs."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="site-header-inner">
            <SiteBrand compact />
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
