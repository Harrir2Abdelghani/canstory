-- Fix annuaire entries status - set all entries to pending initially
-- This ensures newly created entries show as "En attente" (pending) until approved by admin

UPDATE public.annuaire_entries 
SET status = 'pending' 
WHERE status IS NULL OR status != 'approved';

-- Verify the update
SELECT id, status, created_at FROM public.annuaire_entries ORDER BY created_at DESC LIMIT 10;
