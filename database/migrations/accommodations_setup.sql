-- =====================================================
-- ACCOMMODATIONS TABLE - MISSING COMPONENTS
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add trigger for updated_at timestamp
CREATE TRIGGER update_accommodations_updated_at BEFORE UPDATE ON public.accommodations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes for better query performance
CREATE INDEX idx_accommodations_wilaya ON public.accommodations(wilaya);
CREATE INDEX idx_accommodations_is_active ON public.accommodations(is_active);
CREATE INDEX idx_accommodations_available_beds ON public.accommodations(available_beds);
CREATE INDEX idx_accommodations_provider ON public.accommodations(provider_id);
CREATE INDEX idx_accommodations_created_at ON public.accommodations(created_at DESC);

-- Add RLS policies for accommodations
-- Everyone can view active accommodations
CREATE POLICY "Active accommodations are viewable by everyone" ON public.accommodations
  FOR SELECT USING (is_active = true OR provider_id = auth.uid());

-- Admins can insert accommodations
CREATE POLICY "Admins can create accommodations" ON public.accommodations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can update accommodations
CREATE POLICY "Admins can update accommodations" ON public.accommodations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Admins can delete accommodations
CREATE POLICY "Admins can delete accommodations" ON public.accommodations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Add constraint to ensure available_beds <= capacity
ALTER TABLE public.accommodations 
  ADD CONSTRAINT check_available_beds_capacity 
  CHECK (available_beds <= capacity);

-- Add constraint to ensure capacity is positive
ALTER TABLE public.accommodations 
  ADD CONSTRAINT check_capacity_positive 
  CHECK (capacity > 0);

-- Add constraint to ensure available_beds is non-negative
ALTER TABLE public.accommodations 
  ADD CONSTRAINT check_available_beds_non_negative 
  CHECK (available_beds >= 0);
