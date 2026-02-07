-- =====================================================
-- CANSTORY ADMIN CONTENT MANAGEMENT SCHEMA
-- Additional tables for admin dashboard features
-- =====================================================

-- =====================================================
-- CONTENT CATEGORIES & TAXONOMIES
-- =====================================================

-- Article categories (I3lam)
CREATE TABLE IF NOT EXISTS public.article_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_fr TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Medical specialties
CREATE TABLE IF NOT EXISTS public.medical_specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_fr TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guide categories (Nassa2ih)
CREATE TABLE IF NOT EXISTS public.guide_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_fr TEXT NOT NULL,
  name_ar TEXT,
  name_en TEXT,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ENHANCED CONTENT TABLES
-- =====================================================

-- Enhanced articles table with categories
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.article_categories(id);
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS language language_preference DEFAULT 'fr';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_title TEXT;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS meta_description TEXT;

-- Guides table (Nassa2ih)
CREATE TABLE IF NOT EXISTS public.guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES public.guide_categories(id),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  steps JSONB,
  featured_image TEXT,
  language language_preference DEFAULT 'fr',
  status content_status DEFAULT 'draft',
  views_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enhanced nutrition guides with recipes
ALTER TABLE public.nutrition_guides ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE public.nutrition_guides ADD COLUMN IF NOT EXISTS language language_preference DEFAULT 'fr';
ALTER TABLE public.nutrition_guides ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Recipes table
CREATE TABLE IF NOT EXISTS public.recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nutrition_guide_id UUID REFERENCES public.nutrition_guides(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cancer_type cancer_type,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  prep_time INTEGER,
  cook_time INTEGER,
  servings INTEGER,
  calories INTEGER,
  nutritional_info JSONB,
  image_url TEXT,
  difficulty TEXT,
  tags TEXT[],
  language language_preference DEFAULT 'fr',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PSYCHOLOGISTS & MENTAL HEALTH
-- =====================================================

-- Psychologists table
CREATE TABLE IF NOT EXISTS public.psychologists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  specialization TEXT[],
  bio TEXT,
  education JSONB,
  certifications JSONB,
  languages_spoken TEXT[],
  years_of_experience INTEGER,
  consultation_fee DECIMAL(10,2),
  consultation_types TEXT[],
  address TEXT,
  wilaya TEXT NOT NULL,
  commune TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  working_hours JSONB,
  accepts_new_patients BOOLEAN DEFAULT true,
  is_online_consultation BOOLEAN DEFAULT false,
  avatar_url TEXT,
  verification_status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Clinics/Therapy centers
CREATE TABLE IF NOT EXISTS public.therapy_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  commune TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  website TEXT,
  services JSONB,
  staff_count INTEGER,
  working_hours JSONB,
  has_emergency BOOLEAN DEFAULT false,
  accepts_insurance BOOLEAN DEFAULT true,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  photos TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ABOUT PAGE & STATIC CONTENT
-- =====================================================

-- About page content
CREATE TABLE IF NOT EXISTS public.about_page (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section TEXT NOT NULL UNIQUE,
  title_fr TEXT,
  title_ar TEXT,
  title_en TEXT,
  content_fr TEXT,
  content_ar TEXT,
  content_en TEXT,
  images JSONB,
  metadata JSONB,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  updated_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  position_fr TEXT NOT NULL,
  position_ar TEXT,
  position_en TEXT,
  bio_fr TEXT,
  bio_ar TEXT,
  bio_en TEXT,
  avatar_url TEXT,
  email TEXT,
  linkedin_url TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact information
CREATE TABLE IF NOT EXISTS public.contact_info (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  label_fr TEXT NOT NULL,
  label_ar TEXT,
  label_en TEXT,
  value TEXT NOT NULL,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- MODERATION & COMMENTS
-- =====================================================

-- Comment moderation status
CREATE TYPE moderation_status AS ENUM (
  'pending',
  'approved',
  'rejected',
  'flagged'
);

-- Enhanced comments with moderation
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS moderation_status moderation_status DEFAULT 'approved';
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.users(id);
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS moderation_reason TEXT;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS is_edited BOOLEAN DEFAULT false;
ALTER TABLE public.comments ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ;

-- Comment reports
CREATE TABLE IF NOT EXISTS public.comment_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doctor publications (Khibrati) - enhanced articles
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS is_doctor_publication BOOLEAN DEFAULT false;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS moderation_status moderation_status DEFAULT 'approved';
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES public.users(id);
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS moderation_reason TEXT;

-- =====================================================
-- ADVERTISING MANAGEMENT
-- =====================================================

-- Advertisement requests
CREATE TABLE IF NOT EXISTS public.advertisement_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  ad_type TEXT NOT NULL,
  duration_days INTEGER NOT NULL,
  start_date DATE,
  end_date DATE,
  target_audience TEXT,
  budget DECIMAL(10,2),
  creative_assets JSONB,
  description TEXT,
  status TEXT DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Active advertisements
CREATE TABLE IF NOT EXISTS public.advertisements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  request_id UUID REFERENCES public.advertisement_requests(id),
  company_name TEXT NOT NULL,
  ad_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  link_url TEXT,
  placement TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMUNES (ALGERIAN MUNICIPALITIES)
-- =====================================================

-- Communes table
CREATE TABLE IF NOT EXISTS public.communes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wilaya_code TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  postal_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Article categories indexes
CREATE INDEX IF NOT EXISTS idx_article_categories_slug ON public.article_categories(slug);
CREATE INDEX IF NOT EXISTS idx_article_categories_active ON public.article_categories(is_active);

-- Medical specialties indexes
CREATE INDEX IF NOT EXISTS idx_medical_specialties_slug ON public.medical_specialties(slug);
CREATE INDEX IF NOT EXISTS idx_medical_specialties_active ON public.medical_specialties(is_active);

-- Guides indexes
CREATE INDEX IF NOT EXISTS idx_guides_category ON public.guides(category_id);
CREATE INDEX IF NOT EXISTS idx_guides_status ON public.guides(status);
CREATE INDEX IF NOT EXISTS idx_guides_slug ON public.guides(slug);
CREATE INDEX IF NOT EXISTS idx_guides_published ON public.guides(published_at DESC);

-- Recipes indexes
CREATE INDEX IF NOT EXISTS idx_recipes_nutrition_guide ON public.recipes(nutrition_guide_id);
CREATE INDEX IF NOT EXISTS idx_recipes_cancer_type ON public.recipes(cancer_type);
CREATE INDEX IF NOT EXISTS idx_recipes_active ON public.recipes(is_active);

-- Psychologists indexes
CREATE INDEX IF NOT EXISTS idx_psychologists_wilaya ON public.psychologists(wilaya);
CREATE INDEX IF NOT EXISTS idx_psychologists_verification ON public.psychologists(verification_status);
CREATE INDEX IF NOT EXISTS idx_psychologists_active ON public.psychologists(is_active);

-- Comments moderation indexes
CREATE INDEX IF NOT EXISTS idx_comments_moderation_status ON public.comments(moderation_status);
CREATE INDEX IF NOT EXISTS idx_comment_reports_status ON public.comment_reports(status);

-- Advertisements indexes
CREATE INDEX IF NOT EXISTS idx_ad_requests_status ON public.advertisement_requests(status);
CREATE INDEX IF NOT EXISTS idx_advertisements_active ON public.advertisements(is_active);
CREATE INDEX IF NOT EXISTS idx_advertisements_dates ON public.advertisements(start_date, end_date);

-- Communes indexes
CREATE INDEX IF NOT EXISTS idx_communes_wilaya ON public.communes(wilaya_code);
CREATE INDEX IF NOT EXISTS idx_communes_code ON public.communes(code);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Apply updated_at triggers
CREATE TRIGGER update_article_categories_updated_at BEFORE UPDATE ON public.article_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_specialties_updated_at BEFORE UPDATE ON public.medical_specialties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guide_categories_updated_at BEFORE UPDATE ON public.guide_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guides_updated_at BEFORE UPDATE ON public.guides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_psychologists_updated_at BEFORE UPDATE ON public.psychologists
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapy_centers_updated_at BEFORE UPDATE ON public.therapy_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_page_updated_at BEFORE UPDATE ON public.about_page
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_info_updated_at BEFORE UPDATE ON public.contact_info
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_requests_updated_at BEFORE UPDATE ON public.advertisement_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON public.advertisements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.psychologists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.therapy_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_page ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisement_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communes ENABLE ROW LEVEL SECURITY;

-- Public read policies for reference data
CREATE POLICY "Categories are viewable by everyone" ON public.article_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Specialties are viewable by everyone" ON public.medical_specialties
  FOR SELECT USING (is_active = true);

CREATE POLICY "Guide categories are viewable by everyone" ON public.guide_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Communes are viewable by everyone" ON public.communes
  FOR SELECT USING (true);

-- Guides policies
CREATE POLICY "Published guides are viewable by everyone" ON public.guides
  FOR SELECT USING (status = 'published');

-- Recipes policies
CREATE POLICY "Active recipes are viewable by everyone" ON public.recipes
  FOR SELECT USING (is_active = true);

-- Psychologists policies
CREATE POLICY "Active psychologists are viewable by everyone" ON public.psychologists
  FOR SELECT USING (is_active = true AND verification_status = 'verified');

-- Therapy centers policies
CREATE POLICY "Active therapy centers are viewable by everyone" ON public.therapy_centers
  FOR SELECT USING (is_active = true);

-- About page policies
CREATE POLICY "Active about sections are viewable by everyone" ON public.about_page
  FOR SELECT USING (is_active = true);

CREATE POLICY "Active team members are viewable by everyone" ON public.team_members
  FOR SELECT USING (is_active = true);

CREATE POLICY "Active contact info is viewable by everyone" ON public.contact_info
  FOR SELECT USING (is_active = true);

-- Advertisements policies
CREATE POLICY "Active ads are viewable by everyone" ON public.advertisements
  FOR SELECT USING (is_active = true AND CURRENT_DATE BETWEEN start_date AND end_date);

-- =====================================================
-- SEED DATA
-- =====================================================

-- Insert default article categories
INSERT INTO public.article_categories (name_fr, name_ar, name_en, slug) VALUES
  ('Prévention', 'الوقاية', 'Prevention', 'prevention'),
  ('Traitement', 'العلاج', 'Treatment', 'treatment'),
  ('Témoignages', 'شهادات', 'Testimonials', 'testimonials'),
  ('Recherche', 'البحث', 'Research', 'research'),
  ('Nutrition', 'التغذية', 'Nutrition', 'nutrition'),
  ('Psychologie', 'علم النفس', 'Psychology', 'psychology')
ON CONFLICT (slug) DO NOTHING;

-- Insert default medical specialties
INSERT INTO public.medical_specialties (name_fr, name_ar, name_en, slug) VALUES
  ('Oncologie', 'علم الأورام', 'Oncology', 'oncology'),
  ('Oncologie Médicale', 'علم الأورام الطبي', 'Medical Oncology', 'medical-oncology'),
  ('Radiothérapie', 'العلاج الإشعاعي', 'Radiotherapy', 'radiotherapy'),
  ('Chirurgie Oncologique', 'جراحة الأورام', 'Surgical Oncology', 'surgical-oncology'),
  ('Hématologie', 'أمراض الدم', 'Hematology', 'hematology'),
  ('Gynécologie Oncologique', 'أمراض النساء الأورام', 'Gynecologic Oncology', 'gynecologic-oncology'),
  ('Urologie Oncologique', 'المسالك البولية الأورام', 'Urologic Oncology', 'urologic-oncology'),
  ('Psycho-oncologie', 'علم نفس الأورام', 'Psycho-oncology', 'psycho-oncology')
ON CONFLICT (slug) DO NOTHING;

-- Insert default guide categories
INSERT INTO public.guide_categories (name_fr, name_ar, name_en, slug) VALUES
  ('Couverture santé', 'التغطية الصحية', 'Health Coverage', 'health-coverage'),
  ('Droits des patients', 'حقوق المرضى', 'Patient Rights', 'patient-rights'),
  ('Aides financières', 'المساعدات المالية', 'Financial Aid', 'financial-aid'),
  ('Démarches administratives', 'الإجراءات الإدارية', 'Administrative Procedures', 'administrative-procedures')
ON CONFLICT (slug) DO NOTHING;

-- Insert default about page sections
INSERT INTO public.about_page (section, title_fr, content_fr) VALUES
  ('mission', 'Notre Mission', 'Canstory est une plateforme dédiée à l''accompagnement des patients atteints de cancer en Algérie.'),
  ('vision', 'Notre Vision', 'Devenir la référence en matière d''information et de soutien pour les patients cancéreux.'),
  ('values', 'Nos Valeurs', 'Solidarité, Transparence, Innovation, Accompagnement')
ON CONFLICT (section) DO NOTHING;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.article_categories IS 'Categories for I3lam articles';
COMMENT ON TABLE public.medical_specialties IS 'Medical specialties for doctors and professionals';
COMMENT ON TABLE public.guide_categories IS 'Categories for Nassa2ih administrative guides';
COMMENT ON TABLE public.guides IS 'Administrative and legal guides (Nassa2ih)';
COMMENT ON TABLE public.recipes IS 'Nutrition recipes for cancer patients';
COMMENT ON TABLE public.psychologists IS 'Registered psychologists and therapists';
COMMENT ON TABLE public.therapy_centers IS 'Mental health clinics and therapy centers';
COMMENT ON TABLE public.about_page IS 'About page content sections';
COMMENT ON TABLE public.team_members IS 'Team members displayed on about page';
COMMENT ON TABLE public.contact_info IS 'Contact information for the platform';
COMMENT ON TABLE public.comment_reports IS 'User reports on comments for moderation';
COMMENT ON TABLE public.advertisement_requests IS 'Advertisement requests from companies';
COMMENT ON TABLE public.advertisements IS 'Active advertisements on the platform';
COMMENT ON TABLE public.communes IS 'Algerian communes/municipalities';

-- =====================================================
-- END OF ADMIN CONTENT SCHEMA
-- =====================================================
