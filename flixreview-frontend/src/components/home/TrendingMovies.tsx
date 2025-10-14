'use client';

import { useState } from 'react';

interface Movie {
  id: number;
  title: string;
  poster: string;
}

export function TrendingMovies() {
  // Top Rated Movies with Real IMDb Posters
  const trendingMovies: Movie[] = [
    { 
      id: 1, 
      title: "The Shawshank Redemption", 
      poster: "https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg"
    },
    { 
      id: 2, 
      title: "The Godfather", 
      poster: "https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg"
    },
    { 
      id: 3, 
      title: "The Dark Knight", 
      poster: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg"
    },
    { 
      id: 4, 
      title: "Pulp Fiction", 
      poster: "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg"
    },
    { 
      id: 5, 
      title: "Forrest Gump", 
      poster: "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg"
    },
  ];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, index: number) => {
    e.currentTarget.src = `https://via.placeholder.com/200x300/121212/E50914?text=${index + 1}`;
  };

  return (
    <section className="flix-section flix-bg-primary">
      <div className="flix-container">
        <h2 className="flix-subtitle flix-mb-lg">Top Rated Movies</h2>
        <div className="flix-trending-container">
          {trendingMovies.map((movie, index) => (
            <div key={movie.id} className="flix-trending-card">
              <div className="flix-trending-number">{index + 1}</div>
              <div className="flix-trending-poster">
                <div className="flix-netflix-badge">F</div>
                <img 
                  src={movie.poster} 
                  alt={movie.title}
                  onError={(e) => handleImageError(e, index)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
