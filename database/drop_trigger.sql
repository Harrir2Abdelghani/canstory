-- Drop the problematic trigger
DROP TRIGGER IF EXISTS create_annuaire_entry_for_doctor_trigger ON public.users;
DROP FUNCTION IF EXISTS create_annuaire_entry_for_doctor();
