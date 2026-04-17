import Link from "next/link";

type SiteBrandProps = {
  compact?: boolean;
};

export function SiteBrand({ compact = false }: SiteBrandProps) {
  return (
    <Link className={`site-brand${compact ? " site-brand-compact" : ""}`} href="/">
      <span className="site-brand-mark" aria-hidden="true">
        <svg viewBox="0 0 96 96" role="img">
          <rect x="8" y="8" width="80" height="80" rx="22" className="brand-tile" />
          <circle cx="72" cy="24" r="10" className="brand-bite" />
          <path
            d="M28 64c8-16 16-24 24-24s16 8 24 24"
            className="brand-book"
          />
          <path d="M48 40v26" className="brand-glyph" />
          <path d="M40 48h16" className="brand-glyph" />
          <path d="M42 40c0-6 3-10 6-10s6 4 6 10" className="brand-glyph" />
        </svg>
      </span>
      <span className="site-brand-copy">
        <span className="site-brand-name">Philo-Snacks</span>
        <span className="site-brand-tag">public philosophy, one sharp piece at a time</span>
      </span>
    </Link>
  );
}
