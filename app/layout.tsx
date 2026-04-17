import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
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
        <header className="site-nav">
          <div className="nav-inner">
            <div className="nav-brand-wrap">
              <SiteBrand compact />
            </div>

            <nav aria-label="Main navigation">
              <ul className="nav-links">
                <li>
                  <Link href="/archive">Archive</Link>
                </li>
              </ul>
            </nav>

            <div className="nav-meta">
              <AuthorCredit compact />
              <LinkedInLink compact variant="ghost" />
            </div>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="site-footer-inner">
            <div className="footer-brand">
              <SiteBrand compact />
              <AuthorCredit compact />
            </div>
            <div className="footer-links">
              <LinkedInLink variant="white" />
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
