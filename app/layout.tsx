import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AuthorCredit } from "@/app/components/author-credit";
import { LinkedInLink } from "@/app/components/linkedin-link";
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
            <div className="site-header-brand">
              <SiteBrand compact />
              <AuthorCredit compact />
            </div>
            <LinkedInLink compact />
          </div>
        </header>
        {children}
        <footer className="site-footer">
          <div className="site-footer-inner">
            <div>
              <p className="site-footer-title">Philo-Snacks</p>
              <AuthorCredit compact />
            </div>
            <LinkedInLink />
          </div>
        </footer>
      </body>
    </html>
  );
}
