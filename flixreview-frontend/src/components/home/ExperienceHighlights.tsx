import { ReactNode } from "react";

interface HighlightItem {
  title: string;
  description: string;
  icon: ReactNode;
  badge?: string;
}

const HIGHLIGHTS: HighlightItem[] = [
  {
    title: "Precision Recommendations",
    description:
      "We blend IMDb-grade metadata with your taste profile to surface the perfect watch for every mood.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="flix-highlight-icon"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 3v18m9-9H3"
        />
      </svg>
    ),
    badge: "Adaptive Engine",
  },
  {
    title: "Verified Community Voices",
    description:
      "Trust the takes. Every review is moderated, timestamped, and tied to genuine viewing activity.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="flix-highlight-icon"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M5 13l4 4L19 7"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    badge: "Trust & Safety",
  },
  {
    title: "Shared Watchrooms",
    description:
      "Host synchronized sessions, compare ratings live, and keep your watch party on the same page.",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        className="flix-highlight-icon"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M3 5h18M8 5v14m8-14v14M5 19h14"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M9 10h6m-6 4h6"
        />
      </svg>
    ),
    badge: "New",
  },
];

export function ExperienceHighlights() {
  return (
    <section className="flix-section">
      <div className="flix-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between md:gap-12">
          <div className="max-w-2xl">
            <p className="flix-eyebrow">Why FlixReview</p>
            <h2 className="flix-title flix-mb-sm">
              A premium browsing experience for film lovers
            </h2>
            <p className="flix-body flix-text-muted">
              Everything about FlixReview is designed to feel cinematic—from the responsive browsing grid to the way your ratings inform smarter picks.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-white/50">
            <span className="inline-flex h-2 w-2 rounded-full bg-flix-accent animate-pulse" aria-hidden="true"></span>
            Real-time sync with the FlixReview API
          </div>
        </div>

        <div className="grid gap-6 pt-12 md:grid-cols-2 xl:grid-cols-3">
          {HIGHLIGHTS.map((highlight) => (
            <article key={highlight.title} className="flix-feature-card flix-glass-card">
              {highlight.badge && (
                <span className="flix-highlight-badge">{highlight.badge}</span>
              )}
              <div className="flix-highlight-icon-wrap" aria-hidden="true">
                {highlight.icon}
              </div>
              <h3 className="flix-highlight-title">{highlight.title}</h3>
              <p className="flix-highlight-copy">{highlight.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
