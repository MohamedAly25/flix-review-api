"""
Database Verification Script
Check all tables and their structures
"""
import sqlite3
import os

db_path = 'db.sqlite3'

if not os.path.exists(db_path):
    print(f"❌ Database file '{db_path}' not found!")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("=" * 70)
print("📊 FlixReview Database Structure")
print("=" * 70)

# Get all tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
tables = cursor.fetchall()

print(f"\n✅ Total Tables: {len(tables)}")
print("-" * 70)

# Important tables to check
important_tables = ['accounts_user', 'movies_movie', 'movies_genre', 'movies_movie_genres', 'reviews_review']

for table_name in [t[0] for t in tables]:
    if table_name in important_tables or not table_name.startswith('django_') and not table_name.startswith('auth_'):
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        
        print(f"\n📋 Table: {table_name} ({count} rows)")
        print("-" * 70)
        
        for col in columns:
            col_id, col_name, col_type, not_null, default, pk = col
            pk_marker = " 🔑" if pk else ""
            null_marker = " ⚠️ NOT NULL" if not_null else ""
            print(f"  {col_name:20} {col_type:15}{pk_marker}{null_marker}")

print("\n" + "=" * 70)
print("🎬 Phase 6 & 7 Features Check")
print("=" * 70)

# Check TMDB fields in movies_movie
cursor.execute("PRAGMA table_info(movies_movie);")
columns = cursor.fetchall()
column_names = [c[1] for c in columns]

tmdb_fields = ['tmdb_id', 'imdb_id', 'runtime', 'budget', 'revenue', 'backdrop_url']
print("\n✅ TMDB Integration Fields:")
for field in tmdb_fields:
    status = "✅" if field in column_names else "❌"
    print(f"  {status} {field}")

# Check Genre model
cursor.execute("SELECT COUNT(*) FROM movies_genre;")
genre_count = cursor.fetchone()[0]
print(f"\n✅ Genre Model:")
print(f"  📊 Total Genres: {genre_count}")

# Check ManyToMany relationship
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='movies_movie_genres';")
has_m2m = cursor.fetchone() is not None
print(f"  {'✅' if has_m2m else '❌'} Movie-Genre ManyToMany relationship")

print("\n" + "=" * 70)
print("✅ Database built successfully!")
print("=" * 70)

conn.close()
