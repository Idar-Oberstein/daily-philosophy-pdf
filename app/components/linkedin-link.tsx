const LINKEDIN_URL =
  "https://www.linkedin.com/in/raphaelcullmann/?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BbLGn7KfHTEynPJ53yQWBzA%3D%3D";

export function LinkedInLink({ compact = false }: { compact?: boolean }) {
  return (
    <a
      className={`linkedin-link${compact ? " linkedin-link-compact" : ""}`}
      href={LINKEDIN_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Raphael Cullmann on LinkedIn"
      title="Raphael Cullmann on LinkedIn"
    >
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <rect x="4" y="4" width="56" height="56" rx="10" className="linkedin-tile" />
        <circle cx="20" cy="20" r="5" className="linkedin-glyph" />
        <path className="linkedin-glyph" d="M15 28h10v21H15z" />
        <path
          className="linkedin-glyph"
          d="M31 28h9v3.5c2.2-2.5 4.9-4.1 8.9-4.1 8 0 11.1 5.2 11.1 13.4V49H50V42c0-4.4-1-7.4-4.9-7.4-3.6 0-5.2 2.4-5.2 7.4V49H31z"
        />
      </svg>
      {!compact ? <span>LinkedIn</span> : null}
    </a>
  );
}
