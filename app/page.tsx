import Link from "next/link";

import { LinkedInLink } from "@/app/components/linkedin-link";
import { SiteBrand } from "@/app/components/site-brand";
import { formatEssayDate } from "@/lib/archive/format";
import { listPublishedEssays } from "@/lib/archive/store";

function buildEssayTags(essay: Awaited<ReturnType<typeof listPublishedEssays>>[number]) {
  return [essay.metadata.thinkerOrExperiment, essay.metadata.cluster].filter(Boolean);
}

export default async function HomePage() {
  const essays = await listPublishedEssays(5);

  return (
    <>
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-brand">
            <SiteBrand />
          </div>
          <span className="hero-eyebrow">Daily philosophy archive</span>
          <h1>
            Short philosophy
            <br />
            with <em>teeth</em>
          </h1>
          <p className="hero-desc">
            A living archive of elegant essays on ethics, character, fairness,
            power, and moral psychology. Every published entry can be read in
            the browser or downloaded as a clean PDF.
          </p>
          <div className="hero-actions">
            <Link href="/archive" className="btn-primary">
              Browse the archive
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <LinkedInLink variant="ghost" />
          </div>
        </div>
      </section>

      <section className="pillars">
        <div className="pillars-inner">
          <div className="pillar">
            <div className="pillar-icon">
              <span>∞</span>
            </div>
            <div className="pillar-title">Ancient &amp; Modern</div>
            <p className="pillar-desc">
              From Socrates to contemporary thinkers — ideas that outlast their
              own era.
            </p>
          </div>
          <div className="pillar">
            <div className="pillar-icon">
              <span>§</span>
            </div>
            <div className="pillar-title">Serious Philosophy</div>
            <p className="pillar-desc">
              Not self-help. Not life-hacks. Careful reasoning about how to
              live, judge, and act well.
            </p>
          </div>
          <div className="pillar">
            <div className="pillar-icon">
              <span>↓</span>
            </div>
            <div className="pillar-title">HTML + PDF</div>
            <p className="pillar-desc">
              Every essay is readable in-browser and downloadable as a clean,
              typeset PDF.
            </p>
          </div>
        </div>
      </section>

      <section className="essays-section">
        <div className="essays-header">
          <div className="essays-header-left">
            <span className="section-label">Fresh from the daily run</span>
            <h2>Latest Essays</h2>
          </div>
          <Link href="/archive" className="btn-secondary">
            Full archive
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {essays.length === 0 ? (
          <div className="empty-state">
            No essays yet — the next successful daily run will publish the
            first one here.
          </div>
        ) : (
          <div className="essays-list">
            {essays.map((essay) => (
              <article className="essay-card" key={essay.slug}>
                <div className="essay-card-date">{formatEssayDate(essay.dateKey)}</div>
                <h3 className="essay-card-title">{essay.title}</h3>
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
      </section>
    </>
  );
}
