-- =====================================================
-- ANNUAIRE MANAGEMENT SCHEMA
-- PostgreSQL/Supabase Schema for Annuaire (Directory) Management
-- =====================================================

-- Annuaire role types enum
CREATE TYPE annuaire_role AS ENUM (
  'medecin',
  'centre_cancer',
  'psychologue',
  'laboratoire',
  'pharmacie',
  'association'
);

-- Annuaire entries table (unified management for all roles)
CREATE TABLE public.annuaire_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  annuaire_role annuaire_role NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  wilaya TEXT,
  commune TEXT,
  avatar_url TEXT,
  bio TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, annuaire_role)
);

CREATE TABLE public.annuaire_medecin (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annuaire_entry_id UUID NOT NULL REFERENCES public.annuaire_entries(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  hospital_affiliation TEXT,
  consultation_fee DECIMAL(10,2),
  years_of_experience INTEGER,
  education JSONB,
  certifications JSONB,
  languages_spoken TEXT[],
  accepts_new_patients BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (annuaire_entry_id)
);

-- Cancer centers details
CREATE TABLE public.annuaire_cancer_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annuaire_entry_id UUID NOT NULL REFERENCES public.annuaire_entries(id) ON DELETE CASCADE,
  center_name TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  emergency_phone TEXT,
  website TEXT,
  departments JSONB,
  services JSONB,
  equipment JSONB,
  bed_capacity INTEGER,
  has_emergency BOOLEAN DEFAULT true,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Psychologists details
CREATE TABLE public.annuaire_psychologists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annuaire_entry_id UUID NOT NULL REFERENCES public.annuaire_entries(id) ON DELETE CASCADE,
  specialization TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  office_address TEXT,
  consultation_fee DECIMAL(10,2),
  years_of_experience INTEGER,
  education JSONB,
  certifications JSONB,
  languages_spoken TEXT[],
  accepts_new_patients BOOLEAN DEFAULT true,
  therapy_types JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Laboratories details
CREATE TABLE public.annuaire_laboratories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annuaire_entry_id UUID NOT NULL REFERENCES public.annuaire_entries(id) ON DELETE CASCADE,
  lab_name TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  working_hours JSONB NOT NULL,
  test_types JSONB,
  accreditations TEXT[],
  has_home_service BOOLEAN DEFAULT false,
  average_turnaround_time INTEGER,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pharmacies details
CREATE TABLE public.annuaire_pharmacies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annuaire_entry_id UUID NOT NULL REFERENCES public.annuaire_entries(id) ON DELETE CASCADE,
  pharmacy_name TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  emergency_phone TEXT,
  working_hours JSONB NOT NULL,
  services JSONB,
  has_delivery BOOLEAN DEFAULT false,
  is_24_hours BOOLEAN DEFAULT false,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Associations details
CREATE TABLE public.annuaire_associations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  annuaire_entry_id UUID NOT NULL REFERENCES public.annuaire_entries(id) ON DELETE CASCADE,
  association_name TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  website TEXT,
  focus_areas TEXT[],
  services_offered JSONB,
  volunteer_opportunities JSONB,
  donation_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_annuaire_entries_user ON public.annuaire_entries(user_id);
CREATE INDEX idx_annuaire_entries_role ON public.annuaire_entries(annuaire_role);
CREATE INDEX idx_annuaire_entries_status ON public.annuaire_entries(status);
CREATE INDEX idx_annuaire_entries_wilaya ON public.annuaire_entries(wilaya);
CREATE INDEX idx_annuaire_entries_created ON public.annuaire_entries(created_at DESC);

CREATE INDEX idx_annuaire_medecin_entry ON public.annuaire_medecin(annuaire_entry_id);
CREATE INDEX idx_cancer_centers_entry ON public.annuaire_cancer_centers(annuaire_entry_id);
CREATE INDEX idx_psychologists_entry ON public.annuaire_psychologists(annuaire_entry_id);
CREATE INDEX idx_laboratories_entry ON public.annuaire_laboratories(annuaire_entry_id);
CREATE INDEX idx_pharmacies_entry ON public.annuaire_pharmacies(annuaire_entry_id);
CREATE INDEX idx_associations_entry ON public.annuaire_associations(annuaire_entry_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_annuaire_entries_updated_at BEFORE UPDATE ON public.annuaire_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annuaire_medecin_updated_at BEFORE UPDATE ON public.annuaire_medecin
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cancer_centers_updated_at BEFORE UPDATE ON public.annuaire_cancer_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_psychologists_updated_at BEFORE UPDATE ON public.annuaire_psychologists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_laboratories_updated_at BEFORE UPDATE ON public.annuaire_laboratories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON public.annuaire_pharmacies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_associations_updated_at BEFORE UPDATE ON public.annuaire_associations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

ALTER TABLE public.annuaire_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annuaire_medecin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annuaire_cancer_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annuaire_psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annuaire_laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annuaire_pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annuaire_associations ENABLE ROW LEVEL SECURITY;

-- Annuaire entries policies
CREATE POLICY "Annuaire entries are viewable by everyone" ON public.annuaire_entries
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own annuaire entry" ON public.annuaire_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own annuaire entry" ON public.annuaire_entries
  FOR UPDATE USING (auth.uid() = user_id);

-- Doctor profiles policies
CREATE POLICY "Annuaire medecins are viewable by everyone" ON public.annuaire_medecin
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own annuaire medecin" ON public.annuaire_medecin
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own annuaire medecin" ON public.annuaire_medecin
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );

-- Cancer centers policies
CREATE POLICY "Cancer centers are viewable by everyone" ON public.annuaire_cancer_centers
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own cancer center" ON public.annuaire_cancer_centers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own cancer center" ON public.annuaire_cancer_centers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );

-- Psychologists policies
CREATE POLICY "Psychologists are viewable by everyone" ON public.annuaire_psychologists
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own psychologist profile" ON public.annuaire_psychologists
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own psychologist profile" ON public.annuaire_psychologists
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );

-- Laboratories policies
CREATE POLICY "Laboratories are viewable by everyone" ON public.annuaire_laboratories
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own laboratory" ON public.annuaire_laboratories
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own laboratory" ON public.annuaire_laboratories
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );

-- Pharmacies policies
CREATE POLICY "Pharmacies are viewable by everyone" ON public.annuaire_pharmacies
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own pharmacy" ON public.annuaire_pharmacies
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own pharmacy" ON public.annuaire_pharmacies
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );

-- Associations policies
CREATE POLICY "Associations are viewable by everyone" ON public.annuaire_associations
  FOR SELECT USING (true);

CREATE POLICY "Users can manage own association" ON public.annuaire_associations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own association" ON public.annuaire_associations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.annuaire_entries
      WHERE id = annuaire_entry_id AND user_id = auth.uid()
    )
  );

-- =====================================================
-- END OF ANNUAIRE SCHEMA
-- =====================================================
