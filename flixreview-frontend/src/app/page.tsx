import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TrendingMovies } from "@/components/home/TrendingMovies";

export default function Home() {
  return (
    <div className="flix-min-h-screen flix-flex flix-flex-col">
      <Header />
      <main className="flix-flex-1">
        {/* Hero Section - FlixReview Style */}
        <section className="flix-hero">
          <div className="flix-hero-background"></div>
          <div className="flix-hero-content flix-fade-in">
            <h1 className="flix-hero-title">
              Discover, Review, and Rate Movies
            </h1>
            <p className="flix-hero-subtitle">
              Join thousands of movie enthusiasts. Share your passion for cinema.
            </p>
            <p className="flix-body flix-mb-md">
              Ready to start? Enter your email to create your free account.
            </p>
            <form className="flix-email-form">
              <input
                type="email"
                placeholder="Email address"
                className="flix-email-input"
              />
              <button className="flix-btn flix-btn-primary flix-btn-lg">
                Get Started →
              </button>
            </form>
          </div>
        </section>

        {/* Trending Movies Section */}
        <TrendingMovies />

        {/* Why FlixReview Section */}
        <section className="flix-section flix-bg-secondary">
          <div className="flix-container">
            <h2 className="flix-subtitle flix-text-center flix-mb-xl">Why FlixReview?</h2>
            <div className="flix-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div className="flix-feature-card flix-slide-up">
                <div className="flix-feature-icon">📺</div>
                <h3 className="flix-subtitle flix-mb-sm">Enjoy on your TV</h3>
                <p className="flix-body flix-text-muted">
                  Watch on Smart TVs, Playstation, Xbox, Chromecast, Apple TV, Blu-ray players, and more.
                </p>
              </div>
              <div className="flix-feature-card flix-slide-up" style={{ animationDelay: '100ms' }}>
                <div className="flix-feature-icon">⬇️</div>
                <h3 className="flix-subtitle flix-mb-sm">Download your shows to watch offline</h3>
                <p className="flix-body flix-text-muted">
                  Save your favorites easily and always have something to watch.
                </p>
              </div>
              <div className="flix-feature-card flix-slide-up" style={{ animationDelay: '200ms' }}>
                <div className="flix-feature-icon">📱</div>
                <h3 className="flix-subtitle flix-mb-sm">Watch everywhere</h3>
                <p className="flix-body flix-text-muted">
                  Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.
                </p>
              </div>
              <div className="flix-feature-card flix-slide-up" style={{ animationDelay: '300ms' }}>
                <div className="flix-feature-icon">👨‍👩‍👧‍�</div>
                <h3 className="flix-subtitle flix-mb-sm">Create profiles for kids</h3>
                <p className="flix-body flix-text-muted">
                  Send kids on adventures with their favorite characters in a space made just for them—free with your membership.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Browse Movies CTA */}
        <section className="flix-section flix-text-center">
          <div className="flix-container">
            <h2 className="flix-title flix-mb-md">Ready to Explore?</h2>
            <p className="flix-body flix-mb-lg" style={{ fontSize: '18px', maxWidth: '600px', margin: '0 auto 32px' }}>
              Browse our extensive collection, read community reviews, and share your thoughts with movie lovers worldwide.
            </p>
            <div className="flix-flex flix-justify-center flix-gap-md flix-flex-wrap">
              <Link href="/movies">
                <button className="flix-btn flix-btn-primary flix-btn-lg">
                  Browse Movies
                </button>
              </Link>
              <Link href="/register">
                <button className="flix-btn flix-btn-secondary flix-btn-lg">
                  Create Account
                </button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
