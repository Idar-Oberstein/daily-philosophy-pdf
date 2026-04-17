const LINKEDIN_URL =
  "https://www.linkedin.com/in/raphaelcullmann/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BbLGn7KfHTEynPJ53yQWBzA%3D%3D";

export function LinkedInLink({
  compact = false,
  variant = "default"
}: {
  compact?: boolean;
  variant?: "default" | "ghost" | "white";
}) {
  const variantClass =
    variant === "ghost"
      ? " linkedin-link-ghost"
      : variant === "white"
        ? " linkedin-link-white"
        : "";

  return (
    <a
      className={`linkedin-link${compact ? " linkedin-link-compact" : ""}${variantClass}`}
      href={LINKEDIN_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Raphael Cullmann on LinkedIn"
      title="Raphael Cullmann on LinkedIn"
    >
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect x="2" y="2" width="60" height="60" rx="12" className="linkedin-tile" />
        <circle cx="18.5" cy="19" r="4.4" className="linkedin-glyph" />
        <path className="linkedin-glyph" d="M14 28h9v22h-9z" />
        <path
          className="linkedin-glyph"
          d="M29 28h8.6v3c2-2.4 4.8-3.7 8.7-3.7 8 0 11.7 5 11.7 13.8V50h-9.3v-8.1c0-4.2-1.5-7.1-5-7.1-3.4 0-5.4 2.3-5.4 7.1V50H29z"
        />
      </svg>
      {!compact ? <span>LinkedIn</span> : null}
    </a>
  );
}
