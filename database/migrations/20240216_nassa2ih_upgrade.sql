-- Nassa2ih (Guides) Upgrade Migration
-- Date: 2024-02-16

-- 1. Create Enums
DO $$ BEGIN
    CREATE TYPE public.guide_difficulty AS ENUM ('Facile', 'Moyen', 'Complexe');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.guide_workflow_status AS ENUM ('brouillon', 'en_revision', 'publie', 'archive');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Update Guides Table
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS estimated_time TEXT;
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS difficulty public.guide_difficulty DEFAULT 'Facile';
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS target_audience TEXT;
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS workflow_status public.guide_workflow_status DEFAULT 'brouillon';
ALTER TABLE public.guides ADD COLUMN IF NOT EXISTS required_documents_list JSONB DEFAULT '[]'::jsonb;

-- 3. Create Guide Steps Table
CREATE TABLE IF NOT EXISTS public.guide_steps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guide_id UUID NOT NULL REFERENCES public.guides(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    required_documents TEXT,
    attachment_url TEXT,
    external_link TEXT,
    notes TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Add Indexes
CREATE INDEX IF NOT EXISTS idx_guide_steps_guide_id ON public.guide_steps(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_steps_order ON public.guide_steps(order_index);

-- 5. Seeding Sample Data
-- 5. Seeding Sample Data
DO $$
DECLARE
    v_category_id UUID;
    v_guide_id UUID;
BEGIN
    -- Get Administrative Procedures category
    SELECT id INTO v_category_id FROM public.guide_categories WHERE slug = 'administrative-procedures' LIMIT 1;
    
    IF v_category_id IS NOT NULL THEN
        -- Sample 1: Carte Chifa
        INSERT INTO public.guides (category_id, title, slug, description, content, difficulty, estimated_time, target_audience, workflow_status)
        VALUES (
            v_category_id,
            'Obtention de la carte Chifa',
            'obtention-carte-chifa',
            'Guide complet pour obtenir votre carte de sécurité sociale Chifa.',
            '{"blocks": []}'::jsonb,
            'Moyen',
            '15 jours',
            'Nouveaux assurés sociaux',
            'publie'
        )
        ON CONFLICT (slug) DO UPDATE SET workflow_status = EXCLUDED.workflow_status
        RETURNING id INTO v_guide_id;

        -- Cleanup existing steps if any
        DELETE FROM public.guide_steps WHERE guide_id = v_guide_id;

        INSERT INTO public.guide_steps (guide_id, title, description, required_documents, order_index)
        VALUES 
        (v_guide_id, 'Préparation du dossier', 'Rassemblez tous les documents nécessaires.', 'Acte de naissance, Photo, Copie CNI', 0),
        (v_guide_id, 'Dépôt du dossier', 'Rendez-vous à l''agence CNAS de votre wilaya.', 'Dossier complet', 1),
        (v_guide_id, 'Retrait de la carte', 'Récupérez votre carte après notification.', 'Récépissé', 2);

        -- Sample 2: Passeport
        INSERT INTO public.guides (category_id, title, slug, description, content, difficulty, estimated_time, target_audience, workflow_status)
        VALUES (
            v_category_id,
            'Renouvellement de passeport',
            'renouvellement-passeport-dz',
            'Toutes les étapes pour renouveler votre passeport biométrique.',
            '{"blocks": []}'::jsonb,
            'Facile',
            '7 jours',
            'Citoyens résidents',
            'publie'
        )
        ON CONFLICT (slug) DO UPDATE SET workflow_status = EXCLUDED.workflow_status
        RETURNING id INTO v_guide_id;

        DELETE FROM public.guide_steps WHERE guide_id = v_guide_id;

        INSERT INTO public.guide_steps (guide_id, title, description, required_documents, order_index)
        VALUES 
        (v_guide_id, 'Formulaire en ligne', 'Remplissez le formulaire sur le site du ministère.', 'Aucun', 0),
        (v_guide_id, 'Paiement du timbre', 'Achetez le timbre fiscal électronique.', 'Carte CIB ou Dahabia', 1),
        (v_guide_id, 'Rendez-vous', 'Présentez-vous à la daira.', 'Dossier physique', 2);
    END IF;

    -- Get Patient Rights category
    SELECT id INTO v_category_id FROM public.guide_categories WHERE slug = 'patient-rights' LIMIT 1;
    IF v_category_id IS NOT NULL THEN
        -- Sample 3: Dossier médical
        INSERT INTO public.guides (category_id, title, slug, description, content, difficulty, estimated_time, target_audience, workflow_status)
        VALUES (
            v_category_id,
            'Accès au dossier médical',
            'acces-dossier-medical',
            'Comment demander une copie de votre dossier médical.',
            '{"blocks": []}'::jsonb,
            'Moyen',
            '48 heures',
            'Patients',
            'publie'
        )
        ON CONFLICT (slug) DO UPDATE SET workflow_status = EXCLUDED.workflow_status
        RETURNING id INTO v_guide_id;

        DELETE FROM public.guide_steps WHERE guide_id = v_guide_id;

        INSERT INTO public.guide_steps (guide_id, title, description, order_index)
        VALUES 
        (v_guide_id, 'Demande écrite', 'Rédigez une demande au directeur.', 0),
        (v_guide_id, 'Preuve d''identité', 'Préparez votre pièce d''identité.', 1);
    END IF;
END $$;
