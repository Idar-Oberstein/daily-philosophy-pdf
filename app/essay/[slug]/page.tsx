import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LinkedInLink } from "@/app/components/linkedin-link";
import { formatEssayDate } from "@/lib/archive/format";
import { getPublishedEssay } from "@/lib/archive/store";

type EssayPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateMetadata({ params }: EssayPageProps): Promise<Metadata> {
  const { slug } = await params;
  const essay = await getPublishedEssay(slug);

  if (!essay) {
    return {
      title: "Essay | Philo-Snacks"
    };
  }

  return {
    title: `${essay.title} | Philo-Snacks`,
    description: essay.subtitle || essay.hook
  };
}

export default async function EssayPage({ params }: EssayPageProps) {
  const { slug } = await params;
  const essay = await getPublishedEssay(slug);

  if (!essay) {
    notFound();
  }

  const getSectionText = (section: (typeof essay.sections)[number]) =>
    section.content ?? section.body ?? "";

  const tags = [essay.metadata.thinkerOrExperiment, essay.metadata.cluster].filter(Boolean);

  return (
    <>
      <section className="essay-hero">
        <div className="essay-hero-inner">
          <Link href="/archive" className="essay-hero-back">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to archive
          </Link>

          <span className="essay-hero-label">Philo-Snacks Essay</span>
          <h1>{essay.title}</h1>
          {essay.subtitle ? <p className="essay-hero-subtitle">{essay.subtitle}</p> : null}

          <div className="essay-hero-meta">
            <span className="essay-hero-meta-date">{formatEssayDate(essay.dateKey)}</span>
            <span className="essay-hero-meta-author">by Raphael Cullmann</span>
            <span className="essay-hero-meta-date">{essay.wordCount} words</span>
          </div>

          {tags.length > 0 ? (
            <div className="essay-hero-tags">
              {tags.map((tag) => (
                <span className="tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <div className="essay-body">
        <div className="essay-body-inner">
          <div className="essay-actions-bar">
            <a href={essay.pdfUrl} target="_blank" rel="noreferrer" className="btn-secondary">
              <svg
                width="13"
                height="13"
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
            <Link href="/archive" className="btn-secondary btn-subtle">
              Back to archive
            </Link>
            <LinkedInLink />
          </div>

          <div className="essay-content">
            <p>{essay.hook}</p>

            {essay.sections.map((section) => (
              <section key={section.heading}>
                <h2>{section.heading}</h2>
                <p>{getSectionText(section)}</p>
              </section>
            ))}
          </div>

          {essay.takeaways.length > 0 ? (
            <div className="essay-callout">
              <span className="essay-callout-label">Practical Takeaways</span>
              <ul>
                {essay.takeaways.map((takeaway) => (
                  <li key={takeaway}>{takeaway}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="essay-callout essay-callout-subtle">
            <span className="essay-callout-label essay-callout-label-subtle">
              Reflection for Today
            </span>
            <p>{essay.reflectionExercise}</p>
          </div>
        </div>
      </div>

      <div className="essay-footer">
        <span className="essay-footer-author">by Raphael Cullmann · Philo-Snacks</span>
        <div className="essay-footer-nav">
          <Link href="/archive" className="btn-secondary btn-subtle">
            ← Archive
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
            PDF
          </a>
        </div>
      </div>
    </>
  );
}
