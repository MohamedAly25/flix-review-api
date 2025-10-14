# Generated migration for TMDB fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('movies', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='movie',
            name='tmdb_id',
            field=models.IntegerField(blank=True, db_index=True, help_text='The Movie Database (TMDB) ID', null=True, unique=True),
        ),
        migrations.AddField(
            model_name='movie',
            name='imdb_id',
            field=models.CharField(blank=True, db_index=True, default='', help_text='IMDB ID (e.g., tt1234567)', max_length=20),
        ),
        migrations.AddField(
            model_name='movie',
            name='runtime',
            field=models.IntegerField(blank=True, help_text='Runtime in minutes', null=True),
        ),
        migrations.AddField(
            model_name='movie',
            name='budget',
            field=models.BigIntegerField(default=0, help_text='Production budget in USD'),
        ),
        migrations.AddField(
            model_name='movie',
            name='revenue',
            field=models.BigIntegerField(default=0, help_text='Box office revenue in USD'),
        ),
        migrations.AddField(
            model_name='movie',
            name='backdrop_url',
            field=models.URLField(blank=True, default='', help_text='Backdrop/hero image URL'),
        ),
        migrations.AddIndex(
            model_name='movie',
            index=models.Index(fields=['tmdb_id'], name='movies_movi_tmdb_id_idx'),
        ),
        migrations.AddIndex(
            model_name='movie',
            index=models.Index(fields=['imdb_id'], name='movies_movi_imdb_id_idx'),
        ),
    ]
