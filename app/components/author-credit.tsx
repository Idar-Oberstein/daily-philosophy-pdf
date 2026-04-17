export function AuthorCredit({ compact = false }: { compact?: boolean }) {
  return (
    <p className={`author-credit${compact ? " author-credit-compact" : ""}`}>
      by Raphael Cullmann
    </p>
  );
}
