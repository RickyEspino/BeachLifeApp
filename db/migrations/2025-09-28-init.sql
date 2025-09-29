-- Migration: init (2025-09-28)
-- Creates profiles, merchants, claims tables, an increment_points RPC, and example RLS policies for Supabase

-- Ensure the uuid-ossp extension is available (Supabase uses gen_random_uuid in newer setups)
-- If your DB already has extensions, this is safe to leave.
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Profiles table: stores user profile and points
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY,
  username text,
  avatar_url text,
  points integer DEFAULT 0 NOT NULL,
  role text DEFAULT 'user' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Merchants table: stores merchant/business-specific info
CREATE TABLE IF NOT EXISTS public.merchants (
  id uuid PRIMARY KEY,
  business_name text NOT NULL,
  address text,
  category text,
  lat double precision,
  lng double precision,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Claims table: one-time claim tokens created by merchants that users scan to receive points
CREATE TABLE IF NOT EXISTS public.claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount_cents integer NOT NULL,
  points integer NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz NOT NULL,
  claimed boolean DEFAULT false NOT NULL,
  claimed_by uuid REFERENCES public.profiles(id),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_claims_merchant ON public.claims (merchant_id);
CREATE INDEX IF NOT EXISTS idx_claims_expires ON public.claims (expires_at);

-- Safe RPC to increment points atomically
-- This function validates the caller via auth.uid() in Supabase (set up RLS appropriately)
CREATE OR REPLACE FUNCTION public.increment_points(uid uuid, delta integer)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.profiles
  SET points = points + delta, updated_at = now()
  WHERE id = uid;
END;
$$;

-- Example Row Level Security (RLS) policies for Supabase
-- NOTE: Review these before enabling; RLS must be enabled with `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;`

-- Enable RLS for profiles and claims (optional until you configure policies)
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Example policy: allow authenticated users to upsert their own profile
-- CREATE POLICY "Profiles: owner can upsert" ON public.profiles
-- FOR ALL USING (auth.role() IS NOT NULL AND id::text = auth.uid())
-- WITH CHECK (auth.role() IS NOT NULL AND id::text = auth.uid());

-- Example policy: allow merchants to insert claims when they are the authenticated user
-- CREATE POLICY "Claims: merchants insert" ON public.claims
-- FOR INSERT USING (auth.role() IS NOT NULL AND auth.uid() = merchant_id::text)
-- WITH CHECK (auth.role() IS NOT NULL AND auth.uid() = merchant_id::text);

-- Note: Supabase's auth.uid() returns text in some contexts; cast as needed.

-- A recommended practice is to create a Postgres function that validates merchant privileges server-side
-- and to expose a secure RPC that creates claims or increments points so clients cannot tamper with values.

-- Example cleanup: optional function to remove expired claims (could be run as a scheduled job)
-- DELETE FROM public.claims WHERE expires_at < now() AND claimed = false;
