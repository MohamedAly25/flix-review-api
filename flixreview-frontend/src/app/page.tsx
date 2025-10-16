import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { TrendingMovies } from "@/components/home/TrendingMovies";
import { LatestMovies } from "@/components/home/LatestMovies";
import { ExperienceHighlights } from "@/components/home/ExperienceHighlights";

export default function Home() {
  return (
    <div className="flix-main-layout">
      <Header />
      <main className="flix-main-content">
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

        <ExperienceHighlights />

        <TrendingMovies />

        <LatestMovies />

        <section className="flix-section flix-text-center">
          <div className="flix-container">
            <h2 className="flix-title flix-mb-md">Ready to Explore?</h2>
            <p className="flix-body-lg flix-text-muted flix-cta-copy flix-mb-lg">
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
