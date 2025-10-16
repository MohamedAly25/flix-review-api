import React from 'react'

interface MoviesPageHeaderProps {
  title?: string
  description?: string
}

export function MoviesPageHeader({
  title = "Discover Movies",
  description = "Browse cinematic highlights inspired by Netflix's immersive browsing and IMDb's rich metadata. Filter, sort, or search to find your next watch."
}: MoviesPageHeaderProps) {
  return (
    <div className="movies-page-header">
      <h1 className="movies-page-title">{title}</h1>
      <p className="movies-page-subtitle">{description}</p>
    </div>
  )
}