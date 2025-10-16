"""
ML-Based Recommendation Engine

This service provides:
- Content-based filtering (TF-IDF on descriptions and genres)
- Collaborative filtering (user-user similarity based on ratings)
- Hybrid recommendations combining both approaches
"""
import logging
from typing import List, Dict, Optional, Tuple
from collections import defaultdict


logger = logging.getLogger(__name__)


class RecommendationEngine:
    """Advanced recommendation engine using ML algorithms"""
    
    def __init__(self):
        """Initialize the recommendation engine"""
        self.enabled = self._check_ml_libraries()
    
    def _check_ml_libraries(self) -> bool:
        """Check if required ML libraries are installed"""
        try:
            import numpy
            import pandas
            import sklearn
            return True
        except ImportError as e:
            logger.warning(f"ML libraries not available: {e}. Recommendations will use fallback methods.")
            return False
    
    def is_enabled(self) -> bool:
        """Check if ML recommendations are enabled"""
        return self.enabled
    
    def get_content_based_recommendations(
        self, 
        movie_id: int, 
        limit: int = 10
    ) -> List[Dict]:
        """
        Get recommendations based on movie content similarity
        
        Uses TF-IDF on movie descriptions and genre similarity
        
        Args:
            movie_id: ID of the source movie
            limit: Number of recommendations to return
            
        Returns:
            List of movie dictionaries with similarity scores
        """
        from movies.models import Movie
        from django.db.models import Q
        
        try:
            source_movie = Movie.objects.prefetch_related('genres').get(id=movie_id)
        except Movie.DoesNotExist:
            logger.error(f"Movie {movie_id} not found")
            return []
        
        if self.enabled:
            return self._ml_content_based(source_movie, limit)
        else:
            # Fallback to simple genre-based recommendations
            return self._simple_genre_based(source_movie, limit)
    
    def _ml_content_based(self, source_movie, limit: int) -> List[Dict]:
        """ML-based content filtering using TF-IDF"""
        try:
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.metrics.pairwise import cosine_similarity
            import numpy as np
            import pandas as pd
            from movies.models import Movie
            
            # Get all movies
            movies = Movie.objects.prefetch_related('genres').all()
            
            if len(movies) < 2:
                return []
            
            # Create feature matrix: combine description and genres
            movie_data = []
            for movie in movies:
                genres_text = ' '.join([g.name for g in movie.genres.all()])
                combined_text = f"{movie.description} {genres_text} {genres_text}"  # Weight genres more
                movie_data.append({
                    'id': movie.id,
                    'text': combined_text,
                    'title': movie.title,
                    'avg_rating': float(movie.avg_rating),
                    'poster_url': movie.poster_url or '',
                    'release_date': str(movie.release_date) if movie.release_date else '',
                })
            
            df = pd.DataFrame(movie_data)
            
            # TF-IDF vectorization
            tfidf = TfidfVectorizer(
                max_features=500,
                stop_words='english',
                ngram_range=(1, 2)
            )
            tfidf_matrix = tfidf.fit_transform(df['text'])
            
            # Calculate cosine similarity
            similarities = cosine_similarity(tfidf_matrix, tfidf_matrix)
            
            # Get index of source movie
            source_idx = df[df['id'] == source_movie.id].index[0]
            
            # Get similarity scores
            sim_scores = list(enumerate(similarities[source_idx]))
            
            # Sort by similarity (excluding the source movie itself)
            sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:limit+1]
            
            # Get movie indices
            movie_indices = [i[0] for i in sim_scores]
            
            # Build recommendations
            recommendations = []
            for idx, (movie_idx, score) in enumerate(sim_scores):
                movie_row = df.iloc[movie_idx]
                recommendations.append({
                    'movie_id': int(movie_row['id']),
                    'title': movie_row['title'],
                    'similarity_score': float(score),
                    'avg_rating': movie_row['avg_rating'],
                    'poster_url': movie_row['poster_url'],
                    'release_date': movie_row['release_date'],
                    'rank': idx + 1
                })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error in ML content-based recommendations: {e}")
            return self._simple_genre_based(source_movie, limit)
    
    def _simple_genre_based(self, source_movie, limit: int) -> List[Dict]:
        """Fallback: Simple genre-based recommendations"""
        from movies.models import Movie
        from django.db.models import Q, Count
        
        # Get source movie genres
        source_genres = set(source_movie.genres.values_list('id', flat=True))
        
        if not source_genres:
            # If no genres, return popular movies
            movies = Movie.objects.exclude(id=source_movie.id).order_by('-avg_rating')[:limit]
        else:
            # Find movies with matching genres
            movies = (
                Movie.objects
                .exclude(id=source_movie.id)
                .filter(genres__id__in=source_genres)
                .annotate(matching_genres=Count('genres'))
                .order_by('-matching_genres', '-avg_rating')
                .distinct()[:limit]
            )
        
        recommendations = []
        for idx, movie in enumerate(movies):
            matching = set(movie.genres.values_list('id', flat=True))
            similarity = len(source_genres & matching) / len(source_genres | matching) if source_genres | matching else 0
            
            recommendations.append({
                'movie_id': movie.id,
                'title': movie.title,
                'similarity_score': similarity,
                'avg_rating': float(movie.avg_rating),
                'poster_url': movie.poster_url or '',
                'release_date': str(movie.release_date) if movie.release_date else '',
                'rank': idx + 1
            })
        
        return recommendations
    
    def get_collaborative_recommendations(
        self,
        user_id: int,
        limit: int = 10
    ) -> List[Dict]:
        """
        Get recommendations based on collaborative filtering
        
        Finds similar users based on rating patterns and recommends
        movies they liked that the target user hasn't seen yet
        
        Args:
            user_id: ID of the user to get recommendations for
            limit: Number of recommendations to return
            
        Returns:
            List of movie dictionaries with predicted ratings
        """
        from django.contrib.auth import get_user_model
        from reviews.models import Review
        
        User = get_user_model()
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            logger.error(f"User {user_id} not found")
            return []
        
        # Get user's ratings
        user_ratings = Review.objects.filter(user=user).select_related('movie')
        
        if user_ratings.count() < 3:
            # Not enough data for collaborative filtering
            # Return popular movies they haven't reviewed
            return self._popular_unwatched(user, limit)
        
        if self.enabled:
            return self._ml_collaborative(user, user_ratings, limit)
        else:
            return self._simple_collaborative(user, user_ratings, limit)
    
    def _ml_collaborative(self, user, user_ratings, limit: int) -> List[Dict]:
        """ML-based collaborative filtering using user-user similarity"""
        try:
            from sklearn.metrics.pairwise import cosine_similarity
            import numpy as np
            import pandas as pd
            from reviews.models import Review
            from movies.models import Movie
            from django.contrib.auth import get_user_model
            
            User = get_user_model()
            
            # Build user-item rating matrix
            all_reviews = Review.objects.select_related('user', 'movie').all()
            
            # Create DataFrame
            ratings_data = []
            for review in all_reviews:
                ratings_data.append({
                    'user_id': review.user.id,
                    'movie_id': review.movie.id,
                    'rating': review.rating
                })
            
            if len(ratings_data) < 10:
                return self._popular_unwatched(user, limit)
            
            df = pd.DataFrame(ratings_data)
            
            # Create pivot table (users x movies)
            rating_matrix = df.pivot_table(
                index='user_id',
                columns='movie_id',
                values='rating'
            ).fillna(0)
            
            # Calculate user-user similarity
            user_similarity = cosine_similarity(rating_matrix)
            user_similarity_df = pd.DataFrame(
                user_similarity,
                index=rating_matrix.index,
                columns=rating_matrix.index
            )
            
            # Get similar users
            if user.id not in user_similarity_df.index:
                return self._popular_unwatched(user, limit)
            
            similar_users = user_similarity_df[user.id].sort_values(ascending=False)[1:21]  # Top 20 similar users
            
            # Get movies rated highly by similar users that target user hasn't seen
            user_movie_ids = set(user_ratings.values_list('movie_id', flat=True))
            
            recommendations = defaultdict(lambda: {'score': 0, 'count': 0})
            
            for similar_user_id, similarity in similar_users.items():
                if similarity <= 0:
                    continue
                
                similar_user_reviews = Review.objects.filter(
                    user_id=similar_user_id,
                    rating__gte=4  # Only high ratings
                ).exclude(movie_id__in=user_movie_ids)
                
                for review in similar_user_reviews:
                    recommendations[review.movie_id]['score'] += similarity * review.rating
                    recommendations[review.movie_id]['count'] += 1
            
            # Calculate predicted ratings
            movie_scores = []
            for movie_id, data in recommendations.items():
                if data['count'] > 0:
                    predicted_rating = data['score'] / data['count']
                    movie_scores.append((movie_id, predicted_rating))
            
            # Sort by predicted rating
            movie_scores.sort(key=lambda x: x[1], reverse=True)
            top_movie_ids = [movie_id for movie_id, _ in movie_scores[:limit]]
            
            # Fetch movie details
            movies = Movie.objects.filter(id__in=top_movie_ids).prefetch_related('genres')
            movie_dict = {m.id: m for m in movies}
            
            # Build recommendations
            result = []
            for idx, (movie_id, predicted_rating) in enumerate(movie_scores[:limit]):
                if movie_id in movie_dict:
                    movie = movie_dict[movie_id]
                    result.append({
                        'movie_id': movie.id,
                        'title': movie.title,
                        'predicted_rating': float(predicted_rating),
                        'avg_rating': float(movie.avg_rating),
                        'poster_url': movie.poster_url or '',
                        'release_date': str(movie.release_date) if movie.release_date else '',
                        'rank': idx + 1
                    })
            
            return result
            
        except Exception as e:
            logger.error(f"Error in ML collaborative filtering: {e}")
            return self._simple_collaborative(user, user_ratings, limit)
    
    def _simple_collaborative(self, user, user_ratings, limit: int) -> List[Dict]:
        """Fallback: Simple collaborative filtering"""
        from reviews.models import Review
        from movies.models import Movie
        from django.db.models import Avg, Count
        
        # Get movies user rated highly (4-5 stars)
        liked_movies = user_ratings.filter(rating__gte=4).values_list('movie_id', flat=True)
        
        # Get all movies user has reviewed
        reviewed_movies = user_ratings.values_list('movie_id', flat=True)
        
        # Find users who also liked those movies
        similar_users = Review.objects.filter(
            movie_id__in=liked_movies,
            rating__gte=4
        ).exclude(user=user).values_list('user_id', flat=True).distinct()
        
        # Get movies those users liked that target user hasn't seen
        recommendations = (
            Review.objects
            .filter(user_id__in=similar_users, rating__gte=4)
            .exclude(movie_id__in=reviewed_movies)
            .values('movie_id')
            .annotate(
                recommendation_score=Avg('rating'),
                num_recommendations=Count('id')
            )
            .order_by('-recommendation_score', '-num_recommendations')[:limit]
        )
        
        # Fetch movie details
        movie_ids = [r['movie_id'] for r in recommendations]
        movies = Movie.objects.filter(id__in=movie_ids)
        movie_dict = {m.id: m for m in movies}
        
        result = []
        for idx, rec in enumerate(recommendations):
            movie_id = rec['movie_id']
            if movie_id in movie_dict:
                movie = movie_dict[movie_id]
                result.append({
                    'movie_id': movie.id,
                    'title': movie.title,
                    'predicted_rating': float(rec['recommendation_score']),
                    'avg_rating': float(movie.avg_rating),
                    'poster_url': movie.poster_url or '',
                    'release_date': str(movie.release_date) if movie.release_date else '',
                    'rank': idx + 1,
                    'num_similar_users': rec['num_recommendations']
                })
        
        return result
    
    def _popular_unwatched(self, user, limit: int) -> List[Dict]:
        """Fallback: Return popular movies user hasn't reviewed"""
        from movies.models import Movie
        from reviews.models import Review
        
        reviewed_movies = Review.objects.filter(user=user).values_list('movie_id', flat=True)
        
        movies = (
            Movie.objects
            .exclude(id__in=reviewed_movies)
            .order_by('-avg_rating')[:limit]
        )
        
        result = []
        for idx, movie in enumerate(movies):
            result.append({
                'movie_id': movie.id,
                'title': movie.title,
                'predicted_rating': float(movie.avg_rating),
                'avg_rating': float(movie.avg_rating),
                'poster_url': movie.poster_url or '',
                'release_date': str(movie.release_date) if movie.release_date else '',
                'rank': idx + 1
            })
        
        return result
    
    def get_hybrid_recommendations(
        self,
        user_id: int,
        limit: int = 10,
        content_weight: float = 0.4,
        collaborative_weight: float = 0.6
    ) -> List[Dict]:
        """Get hybrid recommendations with genre preference prioritisation"""
        from django.db.models import Count
        from reviews.models import Review
        from accounts.models import UserProfile

        profile = UserProfile.objects.filter(user_id=user_id).prefetch_related('preferred_genres').first()
        preferred_genre_ids = list(profile.preferred_genres.values_list('id', flat=True)) if profile else []

        # Track movies the user already interacted with to avoid repeats
        reviewed_movie_ids = set(
            Review.objects.filter(user_id=user_id).values_list('movie_id', flat=True)
        )

        # Compute base hybrid recommendations (content + collaborative)
        base_recommendations = self._calculate_base_hybrid_scores(
            user_id=user_id,
            limit=limit * 2,
            content_weight=content_weight,
            collaborative_weight=collaborative_weight,
        )

        if not preferred_genre_ids:
            return self._finalize_recommendations(base_recommendations[:limit])

        # Prioritise preferred genres
        genre_priority_recs = self._genre_priority_recommendations(
            preferred_genre_ids=preferred_genre_ids,
            exclude_movie_ids=reviewed_movie_ids,
            limit=limit * 2,
        )

        merged = self._merge_preference_recommendations(
            preferred_recommendations=genre_priority_recs,
            base_recommendations=base_recommendations,
            limit=limit,
        )

        return merged

    def _calculate_base_hybrid_scores(
        self,
        user_id: int,
        limit: int,
        content_weight: float,
        collaborative_weight: float,
    ) -> List[Dict]:
        """Internal helper to calculate hybrid scores without genre prioritisation"""
        from reviews.models import Review

        total_weight = content_weight + collaborative_weight
        content_weight = content_weight / total_weight
        collaborative_weight = collaborative_weight / total_weight

        recent_liked = Review.objects.filter(
            user_id=user_id,
            rating__gte=4
        ).order_by('-created_at').select_related('movie').first()

        content_recs: List[Dict] = []
        if recent_liked:
            content_recs = self.get_content_based_recommendations(
                recent_liked.movie_id,
                limit=limit
            )

        collab_recs = self.get_collaborative_recommendations(user_id, limit=limit)

        combined = defaultdict(lambda: {'content_score': 0.0, 'collab_score': 0.0, 'data': None})

        for rec in content_recs:
            movie_id = rec['movie_id']
            combined[movie_id]['content_score'] = rec.get('similarity_score', 0.0)
            combined[movie_id]['data'] = rec

        for rec in collab_recs:
            movie_id = rec['movie_id']
            combined[movie_id]['collab_score'] = rec.get('predicted_rating', 0.0) / 5.0
            if combined[movie_id]['data'] is None:
                combined[movie_id]['data'] = rec

        hybrid_recommendations: List[Dict] = []
        for movie_id, scores in combined.items():
            rec_data = scores['data'] or {}
            hybrid_score = (
                content_weight * scores['content_score'] +
                collaborative_weight * scores['collab_score']
            )
            rec_data['hybrid_score'] = hybrid_score
            rec_data.setdefault('source', 'hybrid')
            hybrid_recommendations.append(rec_data)

        hybrid_recommendations.sort(key=lambda x: x.get('hybrid_score', 0), reverse=True)
        return hybrid_recommendations

    def _genre_priority_recommendations(
        self,
        preferred_genre_ids: List[int],
        exclude_movie_ids: Optional[set],
        limit: int,
    ) -> List[Dict]:
        """Return high-quality movies matching the user's preferred genres"""
        from django.db.models import Count
        from movies.models import Movie

        exclude_movie_ids = exclude_movie_ids or set()

        movies = (
            Movie.objects
            .filter(genres__id__in=preferred_genre_ids)
            .exclude(id__in=exclude_movie_ids)
            .annotate(
                review_count=Count('reviews', distinct=True),
            )
            .prefetch_related('genres')
            .distinct()
            .order_by('-avg_rating', '-review_count', '-release_date')[:limit]
        )

        preferred_set = set(preferred_genre_ids)
        preferred_count = max(1, len(preferred_set))
        recommendations: List[Dict] = []

        for movie in movies:
            movie_genres = set(movie.genres.values_list('id', flat=True))
            match_ratio = len(movie_genres & preferred_set) / preferred_count
            popularity_score = min(movie.review_count or 0, 50) / 50  # Normalise to 0-1
            rating_score = float(movie.avg_rating or 0) / 5.0
            composite_score = (0.5 * match_ratio) + (0.3 * rating_score) + (0.2 * popularity_score)

            recommendations.append({
                'movie_id': movie.id,
                'title': movie.title,
                'avg_rating': float(movie.avg_rating or 0),
                'poster_url': movie.poster_url or '',
                'release_date': str(movie.release_date) if movie.release_date else '',
                'genre_match_ratio': round(match_ratio, 3),
                'hybrid_score': composite_score,
                'source': 'preferred_genres',
            })

        return recommendations

    def _merge_preference_recommendations(
        self,
        preferred_recommendations: List[Dict],
        base_recommendations: List[Dict],
        limit: int,
    ) -> List[Dict]:
        """Merge genre-prioritised and base recommendations while respecting uniqueness"""

        combined: List[Dict] = []
        seen = set()

        for rec in preferred_recommendations:
            movie_id = rec['movie_id']
            if movie_id in seen:
                continue
            seen.add(movie_id)
            combined.append(rec)
            if len(combined) >= limit:
                break

        if len(combined) < limit:
            for rec in base_recommendations:
                movie_id = rec.get('movie_id')
                if movie_id in seen:
                    continue
                seen.add(movie_id)
                rec.setdefault('source', 'hybrid')
                combined.append(rec)
                if len(combined) >= limit:
                    break

        return self._finalize_recommendations(combined[:limit])

    def _finalize_recommendations(self, recommendations: List[Dict]) -> List[Dict]:
        """Ensure recommendations are ranked sequentially"""
        for idx, rec in enumerate(recommendations):
            rec['rank'] = idx + 1
        return recommendations
    
    def get_user_taste_profile(self, user_id: int) -> Dict:
        """
        Analyze user's taste profile based on their ratings
        
        Returns genre preferences, average ratings, favorite decades, etc.
        """
        from reviews.models import Review
        from movies.models import Genre
        from django.db.models import Avg, Count
        from collections import Counter
        
        try:
            reviews = Review.objects.filter(user_id=user_id).select_related('movie').prefetch_related('movie__genres')
            
            if reviews.count() == 0:
                return {'message': 'No reviews yet'}
            
            # Genre preferences
            genre_ratings = defaultdict(list)
            for review in reviews:
                for genre in review.movie.genres.all():
                    genre_ratings[genre.name].append(review.rating)
            
            genre_preferences = []
            for genre_name, ratings in genre_ratings.items():
                avg_rating = sum(ratings) / len(ratings)
                genre_preferences.append({
                    'genre': genre_name,
                    'avg_rating': round(avg_rating, 2),
                    'count': len(ratings)
                })
            
            genre_preferences.sort(key=lambda x: (x['avg_rating'], x['count']), reverse=True)
            
            # Favorite decades
            decade_counter = Counter()
            for review in reviews:
                if review.movie.release_date:
                    decade = (review.movie.release_date.year // 10) * 10
                    decade_counter[decade] += 1
            
            favorite_decades = [
                {'decade': f"{decade}s", 'count': count}
                for decade, count in decade_counter.most_common(5)
            ]
            
            # Rating distribution
            rating_distribution = dict(Counter(reviews.values_list('rating', flat=True)))
            
            # Overall stats
            stats = reviews.aggregate(
                total_reviews=Count('id'),
                avg_rating=Avg('rating'),
                min_rating=Count('rating'),
                max_rating=Count('rating')
            )
            
            return {
                'total_reviews': stats['total_reviews'],
                'average_rating': round(float(stats['avg_rating'] or 0), 2),
                'rating_distribution': rating_distribution,
                'favorite_genres': genre_preferences[:5],
                'favorite_decades': favorite_decades,
                'most_lenient': stats['avg_rating'] and stats['avg_rating'] > 3.5,
            }
            
        except Exception as e:
            logger.error(f"Error generating taste profile for user {user_id}: {e}")
            return {'error': 'Could not generate taste profile'}
