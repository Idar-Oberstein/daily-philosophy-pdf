import Link from "next/link";

import { formatEssayDate } from "@/lib/archive/format";
import { listPublishedEssays } from "@/lib/archive/store";

export const metadata = {
  title: "Archive | Philo-Snacks",
  description: "Browse every public Philo-Snacks essay and download each PDF."
};

export default async function ArchivePage() {
  const essays = await listPublishedEssays(100);

  return (
    <main className="page-shell">
      <section className="archive-header">
        <p className="eyebrow">Archive</p>
        <h1>The full Philo-Snacks archive</h1>
        <p className="hero-text">
          Every entry here can be read online or downloaded as a PDF. The aim
          is not content volume, but a growing shelf of short, sharp philosophy.
        </p>
      </section>

      {essays.length === 0 ? (
        <div className="empty-card">
          <p>No public essays have been published yet.</p>
        </div>
      ) : (
        <div className="archive-list">
          {essays.map((essay) => (
            <article className="archive-item" key={essay.slug}>
              <div className="archive-copy">
                <p className="essay-date">{formatEssayDate(essay.dateKey)}</p>
                <h2>{essay.title}</h2>
                <p className="essay-subtitle">{essay.subtitle}</p>
                <p className="essay-hook">{essay.hook}</p>
                <div className="essay-meta">
                  <span>{essay.metadata.thinkerOrExperiment}</span>
                  <span>{essay.metadata.cluster}</span>
                </div>
              </div>
              <div className="archive-actions">
                <Link className="button-secondary" href={`/essay/${essay.slug}`}>
                  Read essay
                </Link>
                <a
                  className="button-secondary"
                  href={essay.pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Download PDF
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
