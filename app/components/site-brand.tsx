import Link from "next/link";

type SiteBrandProps = {
  compact?: boolean;
};

export function SiteBrand({ compact = false }: SiteBrandProps) {
  return (
    <Link className={`site-brand${compact ? " site-brand-compact" : ""}`} href="/">
      <span className="site-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 280 220" role="img">
          <ellipse cx="146" cy="190" rx="92" ry="14" className="brand-shadow" />

          <path
            d="M68 146c20-20 52-28 78-22 17 4 33 14 50 31l-8 14c-24-16-42-24-62-27-18-2-34 1-55 12z"
            className="brand-book-fill"
          />
          <path
            d="M210 146c-20-20-52-28-78-22-17 4-33 14-50 31l8 14c24-16 42-24 62-27 18-2 34 1 55 12z"
            className="brand-book-fill"
          />
          <path
            d="M66 146c23-25 59-34 93-27 20 4 38 16 55 36"
            className="brand-book-line"
          />
          <path
            d="M214 146c-23-25-59-34-93-27-20 4-38 16-55 36"
            className="brand-book-line"
          />
          <path d="M140 122v48" className="brand-book-line" />

          <circle cx="82" cy="78" r="27" className="brand-bulb-glow" />
          <path
            d="M81 51c-15 0-27 11-27 25 0 10 6 18 14 23 3 2 4 5 5 8h17c1-3 2-6 5-8 8-5 14-13 14-23 0-14-12-25-28-25z"
            className="brand-bulb"
          />
          <path d="M72 111h18M74 118h14M81 72v20M81 92l-8-8M81 92l8-8" className="brand-bulb-line" />
          <path d="M81 38v-16M54 48 44 35M108 48l10-13M49 77H32M130 77h-17" className="brand-spark-line" />

          <path
            d="M221 56c15 0 28 10 28 23 0 8-5 15-12 19l2 14-13-10h-5c-15 0-28-10-28-23s13-23 28-23z"
            className="brand-bubble"
          />
          <path d="M205 74h25M201 86h29" className="brand-bubble-line" />

          <path
            d="M136 43c-23 0-39 16-39 36 0 14 7 28 19 36l-4 17 15-9c4 1 8 2 12 2 23 0 39-16 39-37 0-20-16-45-42-45z"
            className="brand-face"
          />
          <path
            d="M138 80c-7 0-12 6-12 12 0 5 2 9 7 12-4 4-7 11-7 19h24c0-9-3-15-7-19 5-3 8-7 8-12 0-6-6-12-13-12z"
            className="brand-beard"
          />
          <path d="M124 66c4-6 10-9 16-9 10 0 18 7 20 18" className="brand-hair-line" />
          <path d="M129 82c3-2 5-3 8-3M149 82c-3-2-5-3-8-3M135 94c2 1 6 1 9 0" className="brand-face-line" />

          <path d="M167 124c14-6 29-5 44 5-11 3-20 3-30 1z" className="brand-cup-fill" />
          <path d="M167 124c14-6 29-5 44 5" className="brand-cup-line" />
          <path d="M211 130c6 0 10 4 10 9s-4 9-10 9" className="brand-cup-line" />

          <path d="M54 132l6-6 6 6-6 6zM214 122l6-6 6 6-6 6zM190 30l6-6 6 6-6 6z" className="brand-star" />
        </svg>
      </span>
      <span className="site-brand-copy">
        <span className="site-brand-name">
          <span className="site-brand-name-top">Philo-</span>
          <span className="site-brand-name-bottom">Snacks</span>
        </span>
        <span className="site-brand-tag">public philosophy, one sharp piece at a time</span>
      </span>
    </Link>
  );
}
