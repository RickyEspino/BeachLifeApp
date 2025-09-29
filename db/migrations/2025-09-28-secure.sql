-- Secure migration: create server-side helpers and RLS for Supabase
-- Run this AFTER the init migration (2025-09-28-init.sql)

-- create_claim: allows an authenticated merchant to atomically create a claim
CREATE OR REPLACE FUNCTION public.create_claim(merchant uuid, amount_cents integer, points integer, expires_at timestamptz)
RETURNS TABLE(id uuid) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  claim_id uuid;
BEGIN
  -- Verify caller is authenticated and matches merchant
  -- In Supabase, auth.uid() is available as a text value. Compare auth.uid() (text)
  -- to merchant::text to avoid text = uuid operator errors.
  IF auth.uid() IS NULL OR auth.uid() <> merchant::text THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  INSERT INTO public.claims (merchant_id, amount_cents, points, expires_at)
  VALUES (merchant, amount_cents, points, expires_at)
  RETURNING id INTO claim_id;

  RETURN QUERY SELECT claim_id;
END;
$$;

-- Enable RLS on profiles and claims
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.claims ENABLE ROW LEVEL SECURITY;

-- Profiles: allow authenticated users to manage their profile rows
CREATE POLICY "Profiles: owner full access" ON public.profiles
FOR ALL
-- Compare auth.uid() (text) to id::text to avoid operator mismatches
USING (auth.uid() = id::text)
WITH CHECK (auth.uid() = id::text);

-- Claims: allow select for all (so users can validate QR), but only merchants may insert via RPC
CREATE POLICY "Claims: public select" ON public.claims
FOR SELECT USING (true);

-- Prevent direct inserts by clients: allow inserts only via the create_claim function (SECURITY DEFINER)
-- For INSERT policies only a WITH CHECK expression is allowed (no USING). Set WITH CHECK to false to block direct inserts.
CREATE POLICY "Claims: no direct insert" ON public.claims
FOR INSERT WITH CHECK (false);

-- Allow updates to mark claims as claimed, but only where claimed_by equals auth.uid()
CREATE POLICY "Claims: claim by owner" ON public.claims
FOR UPDATE USING (true) WITH CHECK (claimed = true AND claimed_by::text = auth.uid());

-- Allow RPC execution for increment_points only for authenticated users (RPC will run as the authenticated user)
-- No explicit policy is required to call a function, but ensure your function checks auth.uid() as needed.

-- Notes for applying on Supabase:
-- 1) Go to your Supabase project SQL Editor: https://omxponlfmipuqxontoum.supabase.co
-- 2) Run 2025-09-28-init.sql first, then run this secure migration
-- 3) Ensure you test the create_claim RPC from a signed-in merchant client via the Supabase client library
