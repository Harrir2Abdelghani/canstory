import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Category {
  id: string
  name_fr: string
  name_ar: string
  slug: string
  is_active: boolean
  description?: string
  created_at?: string
  updated_at?: string
}

export const categoriesService = {
  // Specialties
  async getSpecialties(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('specialties')
      .select('*')
      .order('name_fr', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createSpecialty(specialty: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('specialties')
      .insert([specialty])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateSpecialty(id: string, specialty: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('specialties')
      .update(specialty)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteSpecialty(id: string): Promise<void> {
    const { error } = await supabase
      .from('specialties')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async deleteSpecialtyByToggle(id: string): Promise<Category> {
    const { data, error } = await supabase
      .from('specialties')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async toggleSpecialtyStatus(id: string, is_active: boolean): Promise<Category> {
    const { data, error } = await supabase
      .from('specialties')
      .update({ is_active })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data?.[0] || { id, is_active } as Category
  },

  // Article Categories
  async getArticleCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('article_categories')
      .select('*')
      .order('name_fr', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createArticleCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('article_categories')
      .insert([category])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateArticleCategory(id: string, category: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('article_categories')
      .update(category)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteArticleCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('article_categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async deleteArticleCategoryByToggle(id: string): Promise<Category> {
    const { data, error } = await supabase
      .from('article_categories')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async toggleArticleCategoryStatus(id: string, is_active: boolean): Promise<Category> {
    const { data, error } = await supabase
      .from('article_categories')
      .update({ is_active })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data?.[0] || { id, is_active } as Category
  },

  // Guide Categories
  async getGuideCategories(): Promise<Category[]> {
    const { data, error } = await supabase
      .from('guide_categories')
      .select('*')
      .order('name_fr', { ascending: true })
    
    if (error) throw error
    return data || []
  },

  async createGuideCategory(category: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<Category> {
    const { data, error } = await supabase
      .from('guide_categories')
      .insert([category])
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async updateGuideCategory(id: string, category: Partial<Category>): Promise<Category> {
    const { data, error } = await supabase
      .from('guide_categories')
      .update(category)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async deleteGuideCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from('guide_categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  async deleteGuideCategoryByToggle(id: string): Promise<Category> {
    const { data, error } = await supabase
      .from('guide_categories')
      .update({ is_active: false })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async toggleGuideCategoryStatus(id: string, is_active: boolean): Promise<Category> {
    const { data, error } = await supabase
      .from('guide_categories')
      .update({ is_active })
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data?.[0] || { id, is_active } as Category
  },
}
