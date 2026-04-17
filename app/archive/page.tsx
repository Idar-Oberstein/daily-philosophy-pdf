import Link from "next/link";

import { formatEssayDate } from "@/lib/archive/format";
import { listPublishedEssays } from "@/lib/archive/store";

export const metadata = {
  title: "Archive | Philo-Snacks",
  description: "Every Philo-Snacks essay — readable online or downloadable as PDF."
};

function buildEssayTags(essay: Awaited<ReturnType<typeof listPublishedEssays>>[number]) {
  return [essay.metadata.thinkerOrExperiment, essay.metadata.cluster].filter(Boolean);
}

export default async function ArchivePage() {
  const essays = await listPublishedEssays(100);

  return (
    <>
      <section className="archive-hero">
        <div className="archive-hero-inner">
          <span className="section-label">Complete collection</span>
          <h1>
            The full
            <br />
            <em>Philo-Snacks</em> archive
          </h1>
          <p className="archive-hero-desc">
            Every entry here can be read online or downloaded as a PDF. The aim
            is not content volume, but a growing shelf of short, sharp
            philosophy.
          </p>
        </div>
      </section>

      <section className="archive-body">
        <div className="archive-body-inner">
          {essays.length === 0 ? (
            <p className="empty-state">No essays yet — check back soon.</p>
          ) : (
            <div className="essays-list">
              {essays.map((essay) => (
                <article className="essay-card" key={essay.slug}>
                  <div className="essay-card-date">{formatEssayDate(essay.dateKey)}</div>
                  <h2 className="essay-card-title">{essay.title}</h2>
                  {essay.subtitle ? (
                    <p className="essay-card-subtitle">{essay.subtitle}</p>
                  ) : null}
                  <p className="essay-card-excerpt">{essay.hook}</p>
                  <div className="essay-card-tags">
                    {buildEssayTags(essay).map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="essay-card-actions">
                    <Link href={`/essay/${essay.slug}`} className="btn-secondary">
                      Read essay
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                    <a href={essay.pdfUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      Download PDF
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
