Applying the DB migration
=========================

1) Supabase (recommended): open your Supabase project, go to SQL editor, paste the contents of `db/migrations/2025-09-28-init.sql` and run it.

2) CLI (psql): set your DATABASE_URL environment variable and run the helper script:

```bash
export DATABASE_URL="postgres://user:pass@host:5432/dbname"
bash scripts/apply-migration.sh
```

Note: Ensure your DB allows connections from your IP when using psql locally. Using the Supabase SQL editor avoids networking issues.
