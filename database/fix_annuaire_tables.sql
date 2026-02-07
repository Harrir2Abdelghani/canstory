-- Drop existing tables to recreate with correct structure
DROP TABLE IF EXISTS public.annuaire_medecin CASCADE;
DROP TABLE IF EXISTS public.annuaire_entries CASCADE;

-- Create annuaire_entries table with correct column names
CREATE TABLE public.annuaire_entries (
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
CREATE TABLE public.annuaire_medecin (
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

-- Enable RLS
ALTER TABLE public.annuaire_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annuaire_medecin ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for annuaire_entries
CREATE POLICY "Allow authenticated users to read annuaire_entries" ON public.annuaire_entries
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to insert their own annuaire_entries" ON public.annuaire_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to update their own annuaire_entries" ON public.annuaire_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for annuaire_medecin
CREATE POLICY "Allow authenticated users to read annuaire_medecin" ON public.annuaire_medecin
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow users to insert annuaire_medecin for their entry" ON public.annuaire_medecin
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Allow users to update annuaire_medecin for their entry" ON public.annuaire_medecin
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );
