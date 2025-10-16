import { ReactNode } from "react";

interface HighlightItem {
  title: string;
  description: string;
  icon: ReactNode;
  badge?: string;
  meta?: string;
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
    meta: "Powered by 40K+ rating signals",
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
    meta: "Every profile verified through playback telemetry",
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
    meta: "Latency under 120ms for co-watching events",
  },
  {
    title: "Studio Mode Dashboards",
    description:
      "Monitor trending reviews, session quality, and watch time from a single, cinematic view.",
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
          d="M4.5 5H19.5M4.5 12H15.5M4.5 19H13"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M17.5 10.5L19.5 12l-2 1.5"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M12 15.5L14 17l-2 1.5"
        />
      </svg>
    ),
    badge: "Pro Feature",
    meta: "Insights refreshed every 15 minutes",
  },
];

export function ExperienceHighlights() {
  return (
    <section className="flix-section-alt" aria-labelledby="experience-highlights-heading">
      <div className="flix-container">
        <div className="flix-highlight-header">
          <div className="max-w-2xl">
            <p className="flix-eyebrow">Why FlixReview</p>
            <h2 id="experience-highlights-heading" className="flix-title flix-mb-sm">
              A premium browsing experience for film lovers
            </h2>
            <p className="flix-body flix-text-muted">
              Everything about FlixReview is designed to feel cinematic—from the responsive browsing grid to the way your ratings inform smarter picks.
            </p>
          </div>
          <div className="flix-flex flix-items-center flix-gap-2xs flix-small flix-text-muted">
            <span
              className="flix-highlight-status flix-pulse"
              aria-hidden="true"
            ></span>
            Real-time sync with the FlixReview API
          </div>
        </div>

        <div className="flix-highlight-grid">
          {HIGHLIGHTS.map((highlight, index) => (
            <article
              key={highlight.title}
              className="flix-feature-card flix-glass-card flix-highlight-card"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              {highlight.badge && (
                <span className="flix-highlight-badge">{highlight.badge}</span>
              )}
              <span className="flix-highlight-ambient" aria-hidden="true" />
              <div className="flix-highlight-icon-ring" aria-hidden="true">
                <span className="flix-highlight-icon-orbit" />
                <div className="flix-highlight-icon-wrap">{highlight.icon}</div>
              </div>
              <div className="flix-highlight-body">
                <h3 className="flix-highlight-title">{highlight.title}</h3>
                <p className="flix-highlight-copy">{highlight.description}</p>
                {highlight.meta && (
                  <p className="flix-highlight-meta">{highlight.meta}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
