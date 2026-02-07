-- Create annuaire_entries table
CREATE TABLE IF NOT EXISTS public.annuaire_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  annuaire_role TEXT NOT NULL DEFAULT 'doctor',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  wilaya TEXT,
  commune TEXT,
  avatar_url TEXT,
  bio TEXT,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create annuaire_medecin table
CREATE TABLE IF NOT EXISTS public.annuaire_medecin (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annuaire_entry_id UUID NOT NULL UNIQUE REFERENCES public.annuaire_entries(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  hospital_affiliation TEXT,
  consultation_fee NUMERIC(10, 2),
  years_of_experience INTEGER,
  education JSONB,
  certifications JSONB,
  languages_spoken TEXT[],
  accepts_new_patients BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create trigger to auto-populate annuaire_entries when doctor signs up
CREATE OR REPLACE FUNCTION create_annuaire_entry_for_doctor()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'doctor' THEN
    INSERT INTO public.annuaire_entries (user_id, role, name, email, phone, wilaya, commune, status)
    VALUES (NEW.id, 'doctor', NEW.full_name, NEW.email, NEW.phone, NEW.wilaya, NEW.commune, 'pending')
    ON CONFLICT (user_id) DO NOTHING;
    
    -- Also create initial annuaire_medecin entry with placeholder data
    INSERT INTO public.annuaire_medecin (annuaire_entry_id, specialization, license_number)
    SELECT id, 'General Practice', 'TEMP-' || NEW.id
    FROM public.annuaire_entries
    WHERE user_id = NEW.id
    ON CONFLICT (annuaire_entry_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger disabled - will be handled in mobile app after user creation
-- DROP TRIGGER IF EXISTS create_annuaire_entry_for_doctor_trigger ON public.users;
-- CREATE TRIGGER create_annuaire_entry_for_doctor_trigger AFTER INSERT ON public.users
--   FOR EACH ROW EXECUTE FUNCTION create_annuaire_entry_for_doctor();
