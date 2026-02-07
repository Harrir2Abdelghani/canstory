-- =====================================================
-- CANSTORY DATABASE SCHEMA
-- PostgreSQL/Supabase Schema for Cancer Patient Platform
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- ENUMS
-- =====================================================

-- User role types
CREATE TYPE user_role AS ENUM (
  'patient',
  'doctor',
  'pharmacy',
  'association',
  'cancer_center',
  'laboratory',
  'admin'
);

-- Cancer types
CREATE TYPE cancer_type AS ENUM (
  'breast',
  'lung',
  'colon',
  'prostate',
  'uterus',
  'other'
);

-- Content status
CREATE TYPE content_status AS ENUM (
  'draft',
  'published',
  'archived'
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'article',
  'appointment',
  'message',
  'system',
  'community'
);

-- Language preference
CREATE TYPE language_preference AS ENUM (
  'ar',
  'fr',
  'en'
);

-- =====================================================
-- CORE TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'patient',
  phone TEXT,
  wilaya TEXT NOT NULL,
  commune TEXT NOT NULL,
  language language_preference DEFAULT 'fr',
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- User profiles by role (additional role-specific information)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bio TEXT,
  specialization TEXT,
  license_number TEXT,
  address TEXT,
  working_hours JSONB,
  services JSONB,
  website TEXT,
  social_links JSONB,
  verification_status TEXT DEFAULT 'pending',
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Doctors table (specific to medical professionals)
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
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
  UNIQUE(user_id)
);

-- Pharmacies table
CREATE TABLE public.pharmacies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  pharmacy_name TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  emergency_phone TEXT,
  working_hours JSONB NOT NULL,
  services JSONB,
  has_delivery BOOLEAN DEFAULT false,
  is_24_hours BOOLEAN DEFAULT false,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Associations table
CREATE TABLE public.associations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  association_name TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  website TEXT,
  focus_areas TEXT[],
  services_offered JSONB,
  volunteer_opportunities JSONB,
  donation_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Cancer centers table
CREATE TABLE public.cancer_centers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  center_name TEXT NOT NULL,
  registration_number TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  emergency_phone TEXT,
  email TEXT NOT NULL,
  website TEXT,
  departments JSONB,
  services JSONB,
  equipment JSONB,
  bed_capacity INTEGER,
  has_emergency BOOLEAN DEFAULT true,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Laboratories table
CREATE TABLE public.laboratories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lab_name TEXT NOT NULL,
  license_number TEXT UNIQUE NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  working_hours JSONB NOT NULL,
  test_types JSONB,
  accreditations TEXT[],
  has_home_service BOOLEAN DEFAULT false,
  average_turnaround_time INTEGER,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- CONTENT TABLES
-- =====================================================

-- Articles table
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image TEXT,
  cancer_types cancer_type[],
  tags TEXT[],
  status content_status DEFAULT 'draft',
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Nutrition guides table
CREATE TABLE public.nutrition_guides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  cancer_type cancer_type NOT NULL,
  description TEXT,
  content JSONB NOT NULL,
  dietary_recommendations JSONB,
  foods_to_avoid JSONB,
  meal_plans JSONB,
  status content_status DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Accommodations table (free housing during treatment)
CREATE TABLE public.accommodations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  wilaya TEXT NOT NULL,
  commune TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  capacity INTEGER NOT NULL,
  available_beds INTEGER NOT NULL,
  amenities TEXT[],
  rules TEXT[],
  photos TEXT[],
  is_active BOOLEAN DEFAULT true,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- COMMUNITY TABLES
-- =====================================================

-- Community posts table
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  cancer_type cancer_type,
  tags TEXT[],
  is_anonymous BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  status content_status DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INTERACTION TABLES
-- =====================================================

-- Likes table (polymorphic)
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  likeable_type TEXT NOT NULL,
  likeable_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, likeable_type, likeable_id)
);

-- Bookmarks table
CREATE TABLE public.bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  bookmarkable_type TEXT NOT NULL,
  bookmarkable_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, bookmarkable_type, bookmarkable_id)
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification settings table
CREATE TABLE public.notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  article_notifications BOOLEAN DEFAULT true,
  appointment_notifications BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  system_notifications BOOLEAN DEFAULT true,
  community_notifications BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- =====================================================
-- MESSAGING TABLES
-- =====================================================

-- Conversations table
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  is_group BOOLEAN DEFAULT false,
  created_by UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversation participants table
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ,
  UNIQUE(conversation_id, user_id)
);

-- Messages table
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS TABLES
-- =====================================================

-- User activity logs
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id UUID,
  metadata JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search history
CREATE TABLE public.search_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  query TEXT NOT NULL,
  filters JSONB,
  results_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_wilaya ON public.users(wilaya);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_created_at ON public.users(created_at DESC);

-- Articles indexes
CREATE INDEX idx_articles_author ON public.articles(author_id);
CREATE INDEX idx_articles_status ON public.articles(status);
CREATE INDEX idx_articles_published ON public.articles(published_at DESC);
CREATE INDEX idx_articles_cancer_types ON public.articles USING GIN(cancer_types);
CREATE INDEX idx_articles_tags ON public.articles USING GIN(tags);

-- Community posts indexes
CREATE INDEX idx_community_posts_user ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_created ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_posts_cancer_type ON public.community_posts(cancer_type);

-- Comments indexes
CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_comments_parent ON public.comments(parent_id);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at DESC);

-- Messages indexes
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created ON public.messages(created_at DESC);

-- Likes indexes
CREATE INDEX idx_likes_user ON public.likes(user_id);
CREATE INDEX idx_likes_likeable ON public.likes(likeable_type, likeable_id);

-- Activity logs indexes
CREATE INDEX idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-populate role-specific tables on user creation
CREATE OR REPLACE FUNCTION create_role_specific_record()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'doctor' THEN
    INSERT INTO public.doctors (user_id, specialization, license_number)
    VALUES (NEW.id, 'General Practice', 'TEMP-' || NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF NEW.role = 'pharmacy' THEN
    INSERT INTO public.pharmacies (user_id, pharmacy_name, license_number, address, phone, working_hours)
    VALUES (NEW.id, NEW.full_name, 'TEMP-' || NEW.id, NEW.wilaya || ', ' || NEW.commune, COALESCE(NEW.phone, ''), '{"monday": "09:00-20:00"}')
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF NEW.role = 'association' THEN
    INSERT INTO public.associations (user_id, association_name, registration_number, address, phone, email)
    VALUES (NEW.id, NEW.full_name, 'TEMP-' || NEW.id, NEW.wilaya || ', ' || NEW.commune, COALESCE(NEW.phone, ''), NEW.email)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF NEW.role = 'cancer_center' THEN
    INSERT INTO public.cancer_centers (user_id, center_name, registration_number, address, phone, email)
    VALUES (NEW.id, NEW.full_name, 'TEMP-' || NEW.id, NEW.wilaya || ', ' || NEW.commune, COALESCE(NEW.phone, ''), NEW.email)
    ON CONFLICT (user_id) DO NOTHING;
  ELSIF NEW.role = 'laboratory' THEN
    INSERT INTO public.laboratories (user_id, lab_name, license_number, address, phone, email, working_hours)
    VALUES (NEW.id, NEW.full_name, 'TEMP-' || NEW.id, NEW.wilaya || ', ' || NEW.commune, COALESCE(NEW.phone, ''), NEW.email, '{"monday": "08:00-18:00"}')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-populate role-specific tables on user creation
CREATE TRIGGER create_role_specific_record_trigger AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION create_role_specific_record();

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON public.doctors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pharmacies_updated_at BEFORE UPDATE ON public.pharmacies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_associations_updated_at BEFORE UPDATE ON public.associations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cancer_centers_updated_at BEFORE UPDATE ON public.cancer_centers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_laboratories_updated_at BEFORE UPDATE ON public.laboratories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON public.community_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to increment counters
CREATE OR REPLACE FUNCTION increment_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'likes' THEN
    IF NEW.likeable_type = 'article' THEN
      UPDATE public.articles SET likes_count = likes_count + 1 WHERE id = NEW.likeable_id;
    ELSIF NEW.likeable_type = 'community_post' THEN
      UPDATE public.community_posts SET likes_count = likes_count + 1 WHERE id = NEW.likeable_id;
    ELSIF NEW.likeable_type = 'comment' THEN
      UPDATE public.comments SET likes_count = likes_count + 1 WHERE id = NEW.likeable_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'comments' THEN
    UPDATE public.community_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement counters
CREATE OR REPLACE FUNCTION decrement_counter()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'likes' THEN
    IF OLD.likeable_type = 'article' THEN
      UPDATE public.articles SET likes_count = likes_count - 1 WHERE id = OLD.likeable_id;
    ELSIF OLD.likeable_type = 'community_post' THEN
      UPDATE public.community_posts SET likes_count = likes_count - 1 WHERE id = OLD.likeable_id;
    ELSIF OLD.likeable_type = 'comment' THEN
      UPDATE public.comments SET likes_count = likes_count - 1 WHERE id = OLD.likeable_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'comments' THEN
    UPDATE public.community_posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Apply counter triggers
CREATE TRIGGER increment_likes_counter AFTER INSERT ON public.likes
  FOR EACH ROW EXECUTE FUNCTION increment_counter();

CREATE TRIGGER decrement_likes_counter AFTER DELETE ON public.likes
  FOR EACH ROW EXECUTE FUNCTION decrement_counter();

CREATE TRIGGER increment_comments_counter AFTER INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION increment_counter();

CREATE TRIGGER decrement_comments_counter AFTER DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION decrement_counter();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cancer_centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laboratories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accommodations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.users
  FOR DELETE USING (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON public.user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Articles policies
CREATE POLICY "Published articles are viewable by everyone" ON public.articles
  FOR SELECT USING (status = 'published' OR author_id = auth.uid());

CREATE POLICY "Authors can create articles" ON public.articles
  FOR INSERT WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own articles" ON public.articles
  FOR UPDATE USING (auth.uid() = author_id);

CREATE POLICY "Authors can delete own articles" ON public.articles
  FOR DELETE USING (auth.uid() = author_id);

-- Community posts policies
CREATE POLICY "Posts are viewable by everyone" ON public.community_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can create posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts" ON public.community_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON public.comments
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments" ON public.comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments" ON public.comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" ON public.comments
  FOR DELETE USING (auth.uid() = user_id);

-- Notification settings policies
CREATE POLICY "Users can view own notification settings" ON public.notification_settings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings" ON public.notification_settings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings" ON public.notification_settings
  FOR UPDATE USING (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send messages to their conversations" ON public.messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Likes policies
CREATE POLICY "Likes are viewable by everyone" ON public.likes
  FOR SELECT USING (true);

CREATE POLICY "Users can create own likes" ON public.likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON public.likes
  FOR DELETE USING (auth.uid() = user_id);

-- Bookmarks policies
CREATE POLICY "Users can view own bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookmarks" ON public.bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON public.bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Role-specific table policies
-- Doctors
CREATE POLICY "Doctor profiles are viewable by everyone" ON public.doctors
  FOR SELECT USING (true);

CREATE POLICY "Doctors can insert own profile" ON public.doctors
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Doctors can update own profile" ON public.doctors
  FOR UPDATE USING (auth.uid() = user_id);

-- Pharmacies
CREATE POLICY "Pharmacy profiles are viewable by everyone" ON public.pharmacies
  FOR SELECT USING (true);

CREATE POLICY "Pharmacies can insert own profile" ON public.pharmacies
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pharmacies can update own profile" ON public.pharmacies
  FOR UPDATE USING (auth.uid() = user_id);

-- Associations
CREATE POLICY "Association profiles are viewable by everyone" ON public.associations
  FOR SELECT USING (true);

CREATE POLICY "Associations can insert own profile" ON public.associations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Associations can update own profile" ON public.associations
  FOR UPDATE USING (auth.uid() = user_id);

-- Cancer Centers
CREATE POLICY "Cancer center profiles are viewable by everyone" ON public.cancer_centers
  FOR SELECT USING (true);

CREATE POLICY "Cancer centers can insert own profile" ON public.cancer_centers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Cancer centers can update own profile" ON public.cancer_centers
  FOR UPDATE USING (auth.uid() = user_id);

-- Laboratories
CREATE POLICY "Laboratory profiles are viewable by everyone" ON public.laboratories
  FOR SELECT USING (true);

CREATE POLICY "Laboratories can insert own profile" ON public.laboratories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Laboratories can update own profile" ON public.laboratories
  FOR UPDATE USING (auth.uid() = user_id);

-- Activity logs
CREATE POLICY "Users can view own activity logs" ON public.activity_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create activity logs" ON public.activity_logs
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- PLATFORM CONFIGURATION TABLES
-- =====================================================

-- Wilayas (Geographic reference data)
CREATE TABLE IF NOT EXISTS public.wilayas (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  ar_name TEXT NOT NULL,
  longitude TEXT,
  latitude TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Communes (Sub-regions within wilayas)
CREATE TABLE IF NOT EXISTS public.communes (
  id TEXT PRIMARY KEY,
  post_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  ar_name TEXT NOT NULL,
  wilaya_id TEXT NOT NULL REFERENCES public.wilayas(id) ON DELETE CASCADE,
  longitude TEXT,
  latitude TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Specialties (Medical specialties taxonomy)
CREATE TABLE IF NOT EXISTS public.specialties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Article Categories (Categories for articles/news)
CREATE TABLE IF NOT EXISTS public.article_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Guide Categories (Categories for guides)
CREATE TABLE IF NOT EXISTS public.guide_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_fr TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform configuration (Global settings)
CREATE TABLE IF NOT EXISTS public.platform_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  config_type TEXT DEFAULT 'string' CHECK (config_type IN ('string', 'boolean', 'number', 'json')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PLATFORM CONFIGURATION
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_wilayas_code ON public.wilayas(code);
CREATE INDEX IF NOT EXISTS idx_wilayas_is_active ON public.wilayas(is_active);
CREATE INDEX IF NOT EXISTS idx_communes_wilaya ON public.communes(wilaya_id);
CREATE INDEX IF NOT EXISTS idx_communes_post_code ON public.communes(post_code);
CREATE INDEX IF NOT EXISTS idx_specialties_slug ON public.specialties(slug);
CREATE INDEX IF NOT EXISTS idx_specialties_status ON public.specialties(status);
CREATE INDEX IF NOT EXISTS idx_article_categories_slug ON public.article_categories(slug);
CREATE INDEX IF NOT EXISTS idx_article_categories_is_active ON public.article_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_guide_categories_slug ON public.guide_categories(slug);
CREATE INDEX IF NOT EXISTS idx_guide_categories_is_active ON public.guide_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_platform_config_key ON public.platform_config(key);

-- =====================================================
-- TRIGGERS FOR PLATFORM CONFIGURATION
-- =====================================================

DROP TRIGGER IF EXISTS update_wilayas_updated_at ON public.wilayas;
CREATE TRIGGER update_wilayas_updated_at BEFORE UPDATE ON public.wilayas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_communes_updated_at ON public.communes;
CREATE TRIGGER update_communes_updated_at BEFORE UPDATE ON public.communes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_specialties_updated_at ON public.specialties;
CREATE TRIGGER update_specialties_updated_at BEFORE UPDATE ON public.specialties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_article_categories_updated_at ON public.article_categories;
CREATE TRIGGER update_article_categories_updated_at BEFORE UPDATE ON public.article_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_guide_categories_updated_at ON public.guide_categories;
CREATE TRIGGER update_guide_categories_updated_at BEFORE UPDATE ON public.guide_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_platform_config_updated_at ON public.platform_config;
CREATE TRIGGER update_platform_config_updated_at BEFORE UPDATE ON public.platform_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY FOR PLATFORM CONFIGURATION
-- =====================================================

ALTER TABLE public.wilayas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.article_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guide_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

-- Admin-only policies for wilayas
DROP POLICY IF EXISTS "Wilayas are viewable by everyone" ON public.wilayas;
CREATE POLICY "Wilayas are viewable by everyone" ON public.wilayas
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify wilayas" ON public.wilayas;
CREATE POLICY "Only admins can modify wilayas" ON public.wilayas
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can update wilayas" ON public.wilayas;
CREATE POLICY "Only admins can update wilayas" ON public.wilayas
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Policies for communes
DROP POLICY IF EXISTS "Communes are viewable by everyone" ON public.communes;
CREATE POLICY "Communes are viewable by everyone" ON public.communes
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify communes" ON public.communes;
CREATE POLICY "Only admins can modify communes" ON public.communes
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can update communes" ON public.communes;
CREATE POLICY "Only admins can update communes" ON public.communes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin-only policies for specialties
DROP POLICY IF EXISTS "Specialties are viewable by everyone" ON public.specialties;
CREATE POLICY "Specialties are viewable by everyone" ON public.specialties
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify specialties" ON public.specialties;
CREATE POLICY "Only admins can modify specialties" ON public.specialties
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can update specialties" ON public.specialties;
CREATE POLICY "Only admins can update specialties" ON public.specialties
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can delete specialties" ON public.specialties;
CREATE POLICY "Only admins can delete specialties" ON public.specialties
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin-only policies for article categories
DROP POLICY IF EXISTS "Article categories are viewable by everyone" ON public.article_categories;
CREATE POLICY "Article categories are viewable by everyone" ON public.article_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify article categories" ON public.article_categories;
CREATE POLICY "Only admins can modify article categories" ON public.article_categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can update article categories" ON public.article_categories;
CREATE POLICY "Only admins can update article categories" ON public.article_categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can delete article categories" ON public.article_categories;
CREATE POLICY "Only admins can delete article categories" ON public.article_categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin-only policies for guide categories
DROP POLICY IF EXISTS "Guide categories are viewable by everyone" ON public.guide_categories;
CREATE POLICY "Guide categories are viewable by everyone" ON public.guide_categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify guide categories" ON public.guide_categories;
CREATE POLICY "Only admins can modify guide categories" ON public.guide_categories
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can update guide categories" ON public.guide_categories;
CREATE POLICY "Only admins can update guide categories" ON public.guide_categories
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can delete guide categories" ON public.guide_categories;
CREATE POLICY "Only admins can delete guide categories" ON public.guide_categories
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Admin-only policies for platform config
DROP POLICY IF EXISTS "Platform config is viewable by everyone" ON public.platform_config;
CREATE POLICY "Platform config is viewable by everyone" ON public.platform_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify platform config" ON public.platform_config;
CREATE POLICY "Only admins can modify platform config" ON public.platform_config
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Only admins can update platform config" ON public.platform_config;
CREATE POLICY "Only admins can update platform config" ON public.platform_config
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- INITIAL DATA / SEED DATA
-- =====================================================

-- Insert default specialties
INSERT INTO public.specialties (name_fr, name_ar, slug, is_active, status) VALUES
  ('Oncologie', 'الأورام', 'oncologie', true, 'active'),
  ('Cardiologie', 'أمراض القلب', 'cardiologie', true, 'active'),
  ('Pneumologie', 'أمراض الجهاز التنفسي', 'pneumologie', true, 'active'),
  ('Gastro-entérologie', 'أمراض الجهاز الهضمي', 'gastro-enterologie', true, 'active'),
  ('Chirurgie générale', 'الجراحة العامة', 'chirurgie-generale', true, 'active'),
  ('Hématologie', 'أمراض الدم', 'hematologie', true, 'active'),
  ('Gynécologie Oncologique', 'أمراض النساء الأورام', 'gynecologie-oncologique', true, 'active'),
  ('Urologie Oncologique', 'أمراض المسالك البولières الأورام', 'urologie-oncologique', true, 'active'),
  ('Dermatologie', 'الأمراض الجلدية', 'dermatologie', true, 'active'),
  ('ORL', 'أنف وأذن وحنجرة', 'orl', true, 'active'),
  ('Radiologie', 'الأشعات', 'radiologie', true, 'active'),
  ('Anatomie Pathologique', 'علم الأنسجة المرضية', 'anatomie-pathologique', true, 'active'),
  ('Médecine Nucléaire', 'الطب النووي', 'medecine-nucleaire', true, 'active'),
  ('Psycho-oncologie', 'علم النفس الأورام', 'psycho-oncologie', true, 'active')
ON CONFLICT (slug) DO NOTHING;

-- Insert default article categories
INSERT INTO public.article_categories (name_fr, name_ar, slug, is_active) VALUES
  ('Nutrition', 'التغذية', 'nutrition', true),
  ('Traitement', 'العلاج', 'traitement', true),
  ('Psychologie', 'علم النفس', 'psychologie', true),
  ('Recherche', 'البحث', 'recherche', true),
  ('Prévention', 'الوقاية', 'prevention', true),
  ('Témoignages', 'شهادات', 'temoignages', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default guide categories
INSERT INTO public.guide_categories (name_fr, name_ar, slug, is_active) VALUES
  ('Démarches administratives', 'الإجراءات الإدارية', 'demarches-administratives', true),
  ('Droits des patients', 'حقوق المرضى', 'droits-patients', true),
  ('Aides financières', 'المساعدات المالية', 'aides-financieres', true),
  ('Couverture santé', 'التغطية الصحية', 'couverture-sante', true)
ON CONFLICT (slug) DO NOTHING;

-- Insert default platform configuration
INSERT INTO public.platform_config (key, value, description, config_type) VALUES
  ('platform_name', '"Canstory"', 'Platform name', 'string'),
  ('contact_email', '"contact@canstory.com"', 'Platform contact email', 'string'),
  ('default_language', '"fr"', 'Default language (fr, en, ar)', 'string'),
  ('enable_registration', 'true', 'Enable user registration', 'boolean'),
  ('enable_community', 'true', 'Enable community features', 'boolean'),
  ('maintenance_mode', 'false', 'Platform maintenance mode', 'boolean')
ON CONFLICT (key) DO NOTHING;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for user directory (public profiles)
CREATE OR REPLACE VIEW public.user_directory AS
SELECT 
  u.id,
  u.full_name,
  u.role,
  u.wilaya,
  u.commune,
  u.avatar_url,
  up.bio,
  up.specialization,
  up.verification_status,
  CASE 
    WHEN u.role = 'doctor' THEN d.specialization
    WHEN u.role = 'pharmacy' THEN p.pharmacy_name
    WHEN u.role = 'association' THEN a.association_name
    WHEN u.role = 'cancer_center' THEN cc.center_name
    WHEN u.role = 'laboratory' THEN l.lab_name
    ELSE NULL
  END as entity_name
FROM public.users u
LEFT JOIN public.user_profiles up ON u.id = up.user_id
LEFT JOIN public.doctors d ON u.id = d.user_id
LEFT JOIN public.pharmacies p ON u.id = p.user_id
LEFT JOIN public.associations a ON u.id = a.user_id
LEFT JOIN public.cancer_centers cc ON u.id = cc.user_id
LEFT JOIN public.laboratories l ON u.id = l.user_id
WHERE u.is_active = true;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE public.users IS 'Main users table extending Supabase auth';
COMMENT ON TABLE public.articles IS 'Medical articles and information content';
COMMENT ON TABLE public.community_posts IS 'User-generated community posts and discussions';
COMMENT ON TABLE public.notifications IS 'User notifications for various events';
COMMENT ON TABLE public.messages IS 'Direct messaging between users';

-- =====================================================
-- END OF SCHEMA
-- =====================================================
