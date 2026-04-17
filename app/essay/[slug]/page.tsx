import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
      title: "Essay not found | Philo-Snacks"
    };
  }

  return {
    title: `${essay.title} | Philo-Snacks`,
    description: essay.subtitle
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

  return (
    <main className="page-shell">
      <article className="essay-page">
        <div className="essay-page-header">
          <p className="eyebrow">Philo-Snacks Essay</p>
          <p className="essay-date">{formatEssayDate(essay.dateKey)}</p>
          <h1>{essay.title}</h1>
          <p className="essay-subtitle essay-subtitle-large">{essay.subtitle}</p>
          <div className="essay-page-actions">
            <a className="button-primary" href={essay.pdfUrl} target="_blank" rel="noreferrer">
              Download PDF
            </a>
            <Link className="button-secondary" href="/archive">
              Back to archive
            </Link>
          </div>
        </div>

        <section className="essay-intro">
          <p>{essay.hook}</p>
        </section>

        <div className="essay-meta essay-meta-wide">
          <span>{essay.metadata.thinkerOrExperiment}</span>
          <span>{essay.metadata.cluster}</span>
          <span>{essay.wordCount} words</span>
        </div>

        <div className="essay-sections">
          {essay.sections.map((section) => (
            <section className="essay-section" key={section.heading}>
              <h2>{section.heading}</h2>
              <p>{getSectionText(section)}</p>
            </section>
          ))}
        </div>

        <section className="takeaways-card">
          <p className="eyebrow">Practical Takeaways</p>
          <ul className="takeaway-list">
            {essay.takeaways.map((takeaway) => (
              <li key={takeaway}>{takeaway}</li>
            ))}
          </ul>
        </section>

        <section className="reflection-card">
          <p className="eyebrow">Reflection for Today</p>
          <p>{essay.reflectionExercise}</p>
        </section>
      </article>
    </main>
  );
}
