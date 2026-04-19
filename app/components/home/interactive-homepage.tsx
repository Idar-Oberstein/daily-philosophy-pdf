"use client";

import Link from "next/link";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { useMemo, useRef, useState } from "react";

import type {
  HomepageConstellationNode,
  HomepageEssayEntry
} from "@/lib/archive/homepage";

const tensionScenes = [
  {
    title: "Duty / Consequence",
    kicker: "When the outcome gleams, principle still resists.",
    sentence: "Philosophy begins when winning and doing right stop being the same thing.",
    pair: [0, 1] as const
  },
  {
    title: "Consequence / Character",
    kicker: "A clean result can still deform the person who produced it.",
    sentence: "Good consequences do not always come from a good moral shape.",
    pair: [1, 2] as const
  },
  {
    title: "Character / Duty",
    kicker: "Virtue feels warm. Obligation often does not.",
    sentence: "What sounds noble and what binds us are often different claims.",
    pair: [2, 0] as const
  },
  {
    title: "The Point",
    kicker: "The mind sharpens where moral languages collide.",
    sentence: "Philo-Snacks tracks the pressure points instead of smoothing them away.",
    pair: [0, 2] as const
  }
];

const processScenes = [
  {
    label: "Library",
    title: "Start with durable thought.",
    line: "Texts first. Memory second. Vague improvisation never."
  },
  {
    label: "Conflict",
    title: "Find the pressure.",
    line: "Every essay begins where principles stop fitting neatly together."
  },
  {
    label: "Essay",
    title: "Write under tension.",
    line: "The goal is not summary. It is a sharpened encounter with a live problem."
  },
  {
    label: "Archive / PDF",
    title: "Publish what survives rereading.",
    line: "Online reading and PDF delivery remain two forms of the same finished piece."
  }
];

function getActiveIndex(progress: number, count: number) {
  return Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
}

function clusterClass(value: string) {
  const slug = value.toLowerCase();
  if (slug.includes("duty")) return "duty";
  if (slug.includes("consequence")) return "consequence";
  if (slug.includes("character") || slug.includes("virtue")) return "character";
  if (slug.includes("psychology")) return "psychology";
  if (slug.includes("polit")) return "politics";
  return "philosophy";
}

function TensionDiagram({ activeIndex }: { activeIndex: number }) {
  const points = [
    { x: 50, y: 12, label: "Duty" },
    { x: 15, y: 76, label: "Consequence" },
    { x: 85, y: 76, label: "Character" }
  ];
  const scene = tensionScenes[activeIndex];
  const [start, end] = scene.pair;
  const a = points[start];
  const b = points[end];

  return (
    <svg viewBox="0 0 100 100" className="tension-diagram" aria-hidden="true">
      <defs>
        <radialGradient id="tensionGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a779ff" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#a779ff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <polygon points="50,12 15,76 85,76" className="tension-triangle" />
      <motion.line
        key={`${start}-${end}`}
        x1={a.x}
        y1={a.y}
        x2={b.x}
        y2={b.y}
        className="tension-beam"
        initial={{ pathLength: 0, opacity: 0.15 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      />
      <motion.circle
        key={`glow-${activeIndex}`}
        cx={(a.x + b.x) / 2}
        cy={(a.y + b.y) / 2}
        r="18"
        fill="url(#tensionGlow)"
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1.05, opacity: 0.8 }}
        transition={{ duration: 0.6 }}
      />

      {points.map((point, index) => (
        <g key={point.label}>
          {(() => {
            const isActivePoint =
              activeIndex === 3 || (scene.pair as readonly number[]).includes(index);

            return (
              <>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isActivePoint ? 5.4 : 4}
                  className={`tension-node${isActivePoint ? " is-active" : ""}`}
                />
                <text
                  x={point.x}
                  y={point.y + (point.y < 20 ? -9 : 12)}
                  className="tension-label"
                >
                  {point.label}
                </text>
              </>
            );
          })()}
        </g>
      ))}
    </svg>
  );
}

export function InteractiveHomepage({
  entries,
  constellationNodes
}: {
  entries: HomepageEssayEntry[];
  constellationNodes: HomepageConstellationNode[];
}) {
  const prefersReducedMotion = useReducedMotion();

  const tensionRef = useRef<HTMLElement | null>(null);
  const processRef = useRef<HTMLElement | null>(null);

  const { scrollYProgress: tensionProgress } = useScroll({
    target: tensionRef,
    offset: ["start start", "end end"]
  });
  const { scrollYProgress: processProgress } = useScroll({
    target: processRef,
    offset: ["start start", "end end"]
  });

  const [activeTension, setActiveTension] = useState(0);
  const [activeProcess, setActiveProcess] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState(entries[0]?.slug ?? "");
  const [selectedNodeId, setSelectedNodeId] = useState(constellationNodes[0]?.id ?? "");

  useMotionValueEvent(tensionProgress, "change", (latest) => {
    setActiveTension(getActiveIndex(latest, tensionScenes.length));
  });

  useMotionValueEvent(processProgress, "change", (latest) => {
    setActiveProcess(getActiveIndex(latest, processScenes.length));
  });

  const featuredEssay = useMemo(
    () => entries.find((entry) => entry.slug === selectedSlug) ?? entries[0] ?? null,
    [entries, selectedSlug]
  );

  const selectedNode = useMemo(
    () =>
      constellationNodes.find((node) => node.id === selectedNodeId) ??
      constellationNodes[0] ??
      null,
    [constellationNodes, selectedNodeId]
  );

  return (
    <div className="interactive-home">
      <section className="manifesto-section">
        <div className="manifesto-grid">
          <div className="manifesto-copy">
            <span className="manifesto-eyebrow">Daily public philosophy</span>
            <h1>Thought that cuts through moral fog.</h1>
            <p>Short essays. Real conflict. No soft landing.</p>
            <div className="manifesto-actions">
              <Link href="/archive" className="btn-primary">
                Enter the archive
              </Link>
              <span className="manifesto-note">Scroll to watch the argument change shape.</span>
            </div>
          </div>

          <div className="manifesto-stage" aria-hidden="true">
            <motion.div
              className="manifesto-orb manifesto-orb-a"
              animate={prefersReducedMotion ? undefined : { y: [0, -18, 8, 0], x: [0, 18, -8, 0] }}
              transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="manifesto-orb manifesto-orb-b"
              animate={prefersReducedMotion ? undefined : { y: [0, 12, -10, 0], x: [0, -20, 12, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="manifesto-orb manifesto-orb-c"
              animate={prefersReducedMotion ? undefined : { scale: [1, 1.12, 0.92, 1] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />

            <motion.div
              className="manifesto-signal"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            >
              <span>Duty</span>
              <span>Consequence</span>
              <span>Character</span>
            </motion.div>

            <motion.div
              className="manifesto-brand-field"
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
            >
              <div className="manifesto-brand-title">
                <span>Philo-</span>
                <span>Snacks</span>
              </div>
              <p>The daily archive for difficult moral clarity.</p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="scroll-scene-section tension-scene" ref={tensionRef}>
        <div className="sticky-scene">
          <div className="scene-shell">
            <div className="scene-copy">
              <span className="scene-index">01</span>
              <span className="scene-eyebrow">The tension field</span>
              <motion.h2
                key={tensionScenes[activeTension].title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {tensionScenes[activeTension].kicker}
              </motion.h2>
              <motion.p
                key={tensionScenes[activeTension].sentence}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
              >
                {tensionScenes[activeTension].sentence}
              </motion.p>
              <div className="scene-step-list" aria-label="Tension scenes">
                {tensionScenes.map((scene, index) => (
                  <div
                    key={scene.title}
                    className={`scene-step${index === activeTension ? " is-active" : ""}`}
                  >
                    <span>{scene.title}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="scene-visual">
              <TensionDiagram activeIndex={activeTension} />
            </div>
          </div>
        </div>
      </section>

      <section className="scroll-scene-section process-scene" ref={processRef}>
        <div className="sticky-scene">
          <div className="scene-shell process-shell">
            <div className="scene-copy">
              <span className="scene-index">02</span>
              <span className="scene-eyebrow">How Philo-Snacks thinks</span>
              <motion.h2
                key={processScenes[activeProcess].title}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
              >
                {processScenes[activeProcess].title}
              </motion.h2>
              <motion.p
                key={processScenes[activeProcess].line}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.05 }}
              >
                {processScenes[activeProcess].line}
              </motion.p>
            </div>
            <div className="process-rail" aria-hidden="true">
              <div className="process-line" />
              <motion.div
                className="process-line process-line-active"
                animate={{
                  height: `${((activeProcess + 1) / processScenes.length) * 100}%`
                }}
                transition={{ duration: 0.35 }}
              />
              {processScenes.map((scene, index) => (
                <motion.div
                  key={scene.label}
                  className={`process-stop${index === activeProcess ? " is-active" : ""}`}
                  animate={{ opacity: index <= activeProcess ? 1 : 0.42 }}
                  transition={{ duration: 0.25 }}
                >
                  <span className="process-stop-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="process-stop-label">{scene.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="constellation-section">
        <div className="constellation-header">
          <span className="scene-index">03</span>
          <span className="scene-eyebrow">Thinkers / problems / clusters</span>
          <h2>The archive is a field, not a feed.</h2>
          <p>Move through the current constellation of essays.</p>
        </div>

        {constellationNodes.length === 0 ? (
          <div className="interactive-empty">The first successful daily run will seed the field.</div>
        ) : (
          <div className="constellation-shell">
            <div className="constellation-map">
              <svg viewBox="0 0 100 100" className="constellation-svg" role="img">
                {constellationNodes.map((node) => {
                  const active = node.id === selectedNode?.id;
                  return (
                    <g key={node.id}>
                      <motion.line
                        x1="50"
                        y1="52"
                        x2={node.x}
                        y2={node.y}
                        className={`constellation-link cluster-${clusterClass(node.cluster)}`}
                        animate={{ opacity: active ? 0.9 : 0.22 }}
                        transition={{ duration: 0.25 }}
                      />
                      <motion.circle
                        cx={node.x}
                        cy={node.y}
                        r={active ? node.size + 1.8 : node.size}
                        className={`constellation-node cluster-${clusterClass(node.cluster)}${active ? " is-active" : ""}`}
                        animate={{ scale: active ? 1.08 : 1 }}
                        transition={{ duration: 0.22 }}
                        onHoverStart={() => setSelectedNodeId(node.id)}
                        onClick={() => setSelectedNodeId(node.id)}
                      />
                    </g>
                  );
                })}
                <circle cx="50" cy="52" r="8.5" className="constellation-core" />
              </svg>
            </div>

            <div className="constellation-detail">
              <motion.div
                key={selectedNode?.id ?? "empty"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28 }}
              >
                <span className="constellation-chip">{selectedNode?.cluster ?? "Archive"}</span>
                <h3>{selectedNode?.label ?? "No essays yet"}</h3>
                <p>{selectedNode?.problemLine ?? "The archive will begin to form once essays are published."}</p>
                {selectedNode ? (
                  <Link href={`/essay/${selectedNode.slug}`} className="btn-secondary">
                    Read this essay
                  </Link>
                ) : null}
              </motion.div>
            </div>
          </div>
        )}
      </section>

      <section className="latest-section">
        <div className="latest-header">
          <span className="scene-index">04</span>
          <span className="scene-eyebrow">Latest essays</span>
          <h2>Not volume. A sharper shelf.</h2>
        </div>

        {featuredEssay ? (
          <div className="latest-shell">
            <motion.article
              key={featuredEssay.slug}
              className="featured-essay"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
            >
              <span className="featured-date">{featuredEssay.dateLabel}</span>
              <h3>{featuredEssay.title}</h3>
              <p className="featured-problem">{featuredEssay.problemLine}</p>
              <div className="featured-meta">
                <span>{featuredEssay.thinker}</span>
                <span>{featuredEssay.cluster}</span>
              </div>
              <div className="featured-actions">
                <Link href={`/essay/${featuredEssay.slug}`} className="btn-primary">
                  Read essay
                </Link>
                <a href={featuredEssay.pdfUrl} target="_blank" rel="noreferrer" className="btn-secondary">
                  PDF
                </a>
              </div>
            </motion.article>

            <div className="latest-rail" role="list" aria-label="Recent essays">
              {entries.map((entry) => {
                const active = featuredEssay.slug === entry.slug;
                return (
                  <button
                    type="button"
                    key={entry.slug}
                    role="listitem"
                    className={`latest-rail-item${active ? " is-active" : ""}`}
                    onMouseEnter={() => setSelectedSlug(entry.slug)}
                    onFocus={() => setSelectedSlug(entry.slug)}
                    onClick={() => setSelectedSlug(entry.slug)}
                  >
                    <span className="latest-rail-date">{entry.dateLabel}</span>
                    <span className="latest-rail-title">{entry.title}</span>
                    <span className="latest-rail-line">{entry.problemLine}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="interactive-empty">No essays yet — the first publication will activate the homepage.</div>
        )}
      </section>
    </div>
  );
}
