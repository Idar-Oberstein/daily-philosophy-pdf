import Link from "next/link";

import { SiteBrand } from "@/app/components/site-brand";
import { formatEssayDate } from "@/lib/archive/format";
import { listPublishedEssays } from "@/lib/archive/store";

export default async function HomePage() {
  const latestEssays = await listPublishedEssays(3);

  return (
    <main className="page-shell">
      <section className="hero">
        <div className="hero-copy">
          <SiteBrand />
          <p className="eyebrow">Public Archive</p>
          <h1>Short philosophy with teeth</h1>
          <p className="hero-text">
            A living archive of elegant essays on ethics, character, fairness,
            power, and moral psychology. Every published entry can be read in
            the browser or downloaded as a clean PDF.
          </p>
          <div className="hero-actions">
            <Link className="button-primary" href="/archive">
              Browse the archive
            </Link>
          </div>
        </div>
        <aside className="hero-note">
          <p className="hero-note-label">What you will find</p>
          <ul className="hero-list">
            <li>Ancient and modern thinkers</li>
            <li>Serious public philosophy instead of generic self-help</li>
            <li>Readable HTML pages and PDF downloads for every piece</li>
          </ul>
        </aside>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <p className="eyebrow">Latest Essays</p>
          <h2>Fresh from the daily run</h2>
        </div>

        {latestEssays.length === 0 ? (
          <div className="empty-card">
            <p>
              The public archive is ready, but no essay has been published yet.
              The next scheduled run will add the first entry automatically.
            </p>
          </div>
        ) : (
          <div className="essay-grid">
            {latestEssays.map((essay) => (
              <article className="essay-card" key={essay.slug}>
                <p className="essay-date">{formatEssayDate(essay.dateKey)}</p>
                <h3>{essay.title}</h3>
                <p className="essay-subtitle">{essay.subtitle}</p>
                <p className="essay-hook">{essay.hook}</p>
                <div className="essay-meta">
                  <span>{essay.metadata.thinkerOrExperiment}</span>
                  <span>{essay.metadata.cluster}</span>
                </div>
                <div className="essay-links">
                  <Link href={`/essay/${essay.slug}`}>Read online</Link>
                  <a href={essay.pdfUrl} target="_blank" rel="noreferrer">
                    Download PDF
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
