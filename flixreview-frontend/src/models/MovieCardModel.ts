import { Movie } from '@/types/movie'

const FALLBACK_POSTER = '/placeholder-movie.svg'

function sanitizeText(value?: string | null, fallback = ''): string {
  if (!value) return fallback
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

export class BaseMovieCardModel {
  protected readonly source: Movie

  constructor(movie: Movie) {
    this.source = movie
  }

  get id(): number {
    return this.source.id
  }

  get title(): string {
    return sanitizeText(this.source.title, 'Untitled')
  }

  get description(): string {
    return sanitizeText(this.source.description, 'No description available for this title yet.')
  }

  get posterUrl(): string {
    const poster = sanitizeText(this.source.poster_url ?? undefined, FALLBACK_POSTER)
    return poster.length > 0 ? poster : FALLBACK_POSTER
  }

  get avgRating(): number | null {
    return typeof this.source.avg_rating === 'number' && !Number.isNaN(this.source.avg_rating)
      ? this.source.avg_rating
      : null
  }

  get reviewCount(): number {
    return typeof this.source.review_count === 'number' ? this.source.review_count : 0
  }

  get releaseDate(): string | null {
    return sanitizeText(this.source.release_date ?? undefined, '') || null
  }

  get releaseYear(): string {
    const { release_date: releaseDate } = this.source
    if (!releaseDate) return 'TBD'

    const parsed = new Date(releaseDate)
    if (Number.isNaN(parsed.getTime())) return 'TBD'

    return parsed.getFullYear().toString()
  }

  get genres(): string[] {
    const legacyGenre = sanitizeText(this.source.genre ?? undefined, '')
    const relatedGenres = Array.isArray(this.source.genres)
      ? this.source.genres
          .map((genre) => sanitizeText(genre?.name, ''))
          .filter((name): name is string => name.length > 0)
      : []

    const names = legacyGenre.length > 0 ? [legacyGenre, ...relatedGenres] : relatedGenres

    return names.length > 0 ? Array.from(new Set(names)) : []
  }

  get primaryGenre(): string | null {
    const [firstGenre] = this.genres
    return firstGenre ?? null
  }

  toMovie(): Movie {
    return {
      ...this.source,
      title: this.title,
      description: this.description,
      poster_url: this.posterUrl,
      avg_rating: this.avgRating ?? Number.NaN,
      review_count: this.reviewCount,
      release_date: this.releaseDate ?? this.source.release_date,
    }
  }
}

export class SimilarGenreMovieCardModel extends BaseMovieCardModel {
  private readonly targetGenre: string | null

  constructor(movie: Movie, targetGenre?: string | null) {
    super(movie)
    this.targetGenre = sanitizeText(targetGenre ?? undefined, '') || null
  }

  get isSameGenre(): boolean {
    if (!this.targetGenre) return true
    return this.genres.some((genre) => genre.toLowerCase() === this.targetGenre?.toLowerCase())
  }

  get similarityScore(): number {
    const ratingComponent = this.avgRating ?? 0
    const popularityComponent = Math.min(this.reviewCount / 10, 10)
    const recencyComponent = (() => {
      const releaseDate = this.releaseDate
      if (!releaseDate) return 0
      const diff = Date.now() - new Date(releaseDate).getTime()
      const years = diff / (1000 * 60 * 60 * 24 * 365.25)
      return Math.max(0, 10 - years)
    })()

    const baseScore = ratingComponent * 1.5 + popularityComponent + recencyComponent
    return Number.isFinite(baseScore) ? baseScore : 0
  }

  static fromMovies(movies: Movie[], genre?: string | null): SimilarGenreMovieCardModel[] {
    const targetGenre = sanitizeText(genre ?? undefined, '') || null

    return movies
      .map((movie) => new SimilarGenreMovieCardModel(movie, targetGenre))
      .filter((model) => model.isSameGenre)
      .sort((a, b) => b.similarityScore - a.similarityScore)
  }
}
