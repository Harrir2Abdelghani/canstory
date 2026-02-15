import { supabase } from '../lib/supabase';

export interface DoctorProfileData {
  specialization: string;
  license_number: string;
  hospital_affiliation?: string;
  consultation_fee?: number;
  years_of_experience?: number;
  languages_spoken?: string[];
  education?: string[];
  certifications?: string[];
  accepts_new_patients?: boolean;
}

export interface PharmacyProfileData {
  pharmacy_name: string;
  license_number: string;
  address: string;
  emergency_phone?: string;
  working_hours?: any;
  has_delivery?: boolean;
  is_24_hours?: boolean;
}

export interface LaboratoryProfileData {
  lab_name: string;
  license_number: string;
  address: string;
  working_hours?: any;
  test_types?: string[];
  has_home_service?: boolean;
  average_turnaround_time?: number;
}

export interface CancerCenterProfileData {
  center_name: string;
  license_number: string;
  address: string;
  emergency_phone?: string;
  website?: string;
  bed_capacity?: number;
}

export interface AssociationProfileData {
  association_name: string;
  license_number: string;
  address: string;
  description?: string;
  website?: string;
  focus_areas?: string[];
  services_offered?: string[];
}

class AnnuaireSignupService {
  /**
   * Create annuaire entry for doctor after signup
   */
  async createDoctorAnnuaireEntry(userId: string, userData: any) {
    try {
      // Create annuaire_entries record
      const { data: annuaireEntry, error: entryError } = await supabase
        .from('annuaire_entries')
        .insert({
          user_id: userId,
          annuaire_role: 'medecin',
          name: userData.full_name,
          email: userData.email,
          phone: userData.phone || null,
          wilaya: userData.wilaya,
          commune: userData.commune,
          status: 'pending',
        } as any)
        .select('id')
        .single();

      if (entryError) {
        console.error('Error creating annuaire entry:', entryError);
        throw entryError;
      }

      // Create initial annuaire_medecin entry with placeholder data
      const { error: medecineError } = await supabase
        .from('annuaire_medecin')
        .insert({
          annuaire_entry_id: annuaireEntry.id,
          specialization: 'À compléter',
          license_number: 'À compléter',
        } as any);

      if (medecineError) {
        console.error('Error creating annuaire_medecin entry:', medecineError);
        throw medecineError;
      }

      return { entryId: annuaireEntry.id, success: true };
    } catch (error) {
      console.error('Error creating doctor annuaire entry:', error);
      throw error;
    }
  }

  /**
   * Update doctor profile with complete data
   */
  async updateDoctorProfile(entryId: string, profileData: DoctorProfileData) {
    try {
      const { error } = await supabase
        .from('annuaire_medecin')
        .update({
          specialization: profileData.specialization,
          license_number: profileData.license_number,
          hospital_affiliation: profileData.hospital_affiliation || null,
          consultation_fee: profileData.consultation_fee || null,
          years_of_experience: profileData.years_of_experience || null,
          education: profileData.education || [],
          certifications: profileData.certifications || [],
          languages_spoken: profileData.languages_spoken || [],
          accepts_new_patients: profileData.accepts_new_patients !== false,
        })
        .eq('annuaire_entry_id', entryId);

      if (error) {
        console.error('Error updating doctor profile:', error);
        throw error;
      }

      // Update annuaire_entries status to 'pending_review'
      const { error: statusError } = await supabase
        .from('annuaire_entries')
        .update({ status: 'pending_review' })
        .eq('id', entryId);

      if (statusError) {
        console.error('Error updating entry status:', statusError);
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating doctor profile:', error);
      throw error;
    }
  }

  /**
   * Create annuaire entry for pharmacy after signup
   */
  async createPharmacyAnnuaireEntry(userId: string, userData: any) {
    try {
      const { data: annuaireEntry, error: entryError } = await supabase
        .from('annuaire_entries')
        .insert({
          user_id: userId,
          annuaire_role: 'pharmacie',
          name: userData.full_name,
          email: userData.email,
          phone: userData.phone || null,
          wilaya: userData.wilaya,
          commune: userData.commune,
          status: 'pending',
        })
        .select('id')
        .single();

      if (entryError) throw entryError;

      const { error: pharmacieError } = await supabase
        .from('annuaire_pharmacie')
        .insert({
          annuaire_entry_id: annuaireEntry.id,
          pharmacy_name: 'À compléter',
          license_number: 'À compléter',
          address: 'À compléter',
        } as any);

      if (pharmacieError) throw pharmacieError;

      return { entryId: annuaireEntry.id, success: true };
    } catch (error) {
      console.error('Error creating pharmacy annuaire entry:', error);
      throw error;
    }
  }

  /**
   * Update pharmacy profile with complete data
   */
  async updatePharmacyProfile(entryId: string, profileData: PharmacyProfileData) {
    try {
      const { error } = await supabase
        .from('annuaire_pharmacie')
        .update({
          pharmacy_name: profileData.pharmacy_name,
          license_number: profileData.license_number,
          address: profileData.address,
          emergency_phone: profileData.emergency_phone || null,
          working_hours: profileData.working_hours || null,
          has_delivery: profileData.has_delivery || false,
          is_24_hours: profileData.is_24_hours || false,
        })
        .eq('annuaire_entry_id', entryId);

      if (error) throw error;

      await supabase
        .from('annuaire_entries')
        .update({ status: 'pending_review' })
        .eq('id', entryId);

      return { success: true };
    } catch (error) {
      console.error('Error updating pharmacy profile:', error);
      throw error;
    }
  }

  /**
   * Create annuaire entry for laboratory after signup
   */
  async createLaboratoryAnnuaireEntry(userId: string, userData: any) {
    try {
      const { data: annuaireEntry, error: entryError } = await supabase
        .from('annuaire_entries')
        .insert({
          user_id: userId,
          annuaire_role: 'laboratoire',
          name: userData.full_name,
          email: userData.email,
          phone: userData.phone || null,
          wilaya: userData.wilaya,
          commune: userData.commune,
          status: 'pending',
        })
        .select('id')
        .single();

      if (entryError) throw entryError;

      const { error: labError } = await supabase
        .from('annuaire_laboratoire')
        .insert({
          annuaire_entry_id: annuaireEntry.id,
          lab_name: 'À compléter',
          license_number: 'À compléter',
          address: 'À compléter',
        });

      if (labError) throw labError;

      return { entryId: annuaireEntry.id, success: true };
    } catch (error) {
      console.error('Error creating laboratory annuaire entry:', error);
      throw error;
    }
  }

  /**
   * Update laboratory profile with complete data
   */
  async updateLaboratoryProfile(entryId: string, profileData: LaboratoryProfileData) {
    try {
      const { error } = await supabase
        .from('annuaire_laboratoire')
        .update({
          lab_name: profileData.lab_name,
          license_number: profileData.license_number,
          address: profileData.address,
          working_hours: profileData.working_hours || null,
          test_types: profileData.test_types || [],
          has_home_service: profileData.has_home_service || false,
          average_turnaround_time: profileData.average_turnaround_time || null,
        })
        .eq('annuaire_entry_id', entryId);

      if (error) throw error;

      await supabase
        .from('annuaire_entries')
        .update({ status: 'pending_review' })
        .eq('id', entryId);

      return { success: true };
    } catch (error) {
      console.error('Error updating laboratory profile:', error);
      throw error;
    }
  }

  /**
   * Create annuaire entry for cancer center after signup
   */
  async createCancerCenterAnnuaireEntry(userId: string, userData: any) {
    try {
      const { data: annuaireEntry, error: entryError } = await supabase
        .from('annuaire_entries')
        .insert({
          user_id: userId,
          annuaire_role: 'centre_cancer',
          name: userData.full_name,
          email: userData.email,
          phone: userData.phone || null,
          wilaya: userData.wilaya,
          commune: userData.commune,
          status: 'pending',
        })
        .select('id')
        .single();

      if (entryError) throw entryError;

      const { error: centerError } = await supabase
        .from('annuaire_centre_cancer')
        .insert({
          annuaire_entry_id: annuaireEntry.id,
          center_name: 'À compléter',
          license_number: 'À compléter',
          address: 'À compléter',
        });

      if (centerError) throw centerError;

      return { entryId: annuaireEntry.id, success: true };
    } catch (error) {
      console.error('Error creating cancer center annuaire entry:', error);
      throw error;
    }
  }

  /**
   * Update cancer center profile with complete data
   */
  async updateCancerCenterProfile(entryId: string, profileData: CancerCenterProfileData) {
    try {
      const { error } = await supabase
        .from('annuaire_centre_cancer')
        .update({
          center_name: profileData.center_name,
          license_number: profileData.license_number,
          address: profileData.address,
          emergency_phone: profileData.emergency_phone || null,
          website: profileData.website || null,
          bed_capacity: profileData.bed_capacity || null,
        })
        .eq('annuaire_entry_id', entryId);

      if (error) throw error;

      await supabase
        .from('annuaire_entries')
        .update({ status: 'pending_review' })
        .eq('id', entryId);

      return { success: true };
    } catch (error) {
      console.error('Error updating cancer center profile:', error);
      throw error;
    }
  }

  /**
   * Create annuaire entry for association after signup
   */
  async createAssociationAnnuaireEntry(userId: string, userData: any) {
    try {
      const { data: annuaireEntry, error: entryError } = await supabase
        .from('annuaire_entries')
        .insert({
          user_id: userId,
          annuaire_role: 'association',
          name: userData.full_name,
          email: userData.email,
          phone: userData.phone || null,
          wilaya: userData.wilaya,
          commune: userData.commune,
          status: 'pending',
        })
        .select('id')
        .single();

      if (entryError) throw entryError;

      const { error: assocError } = await supabase
        .from('annuaire_association')
        .insert({
          annuaire_entry_id: annuaireEntry.id,
          association_name: 'À compléter',
          license_number: 'À compléter',
          address: 'À compléter',
        } as any);

      if (assocError) throw assocError;

      return { entryId: annuaireEntry.id, success: true };
    } catch (error) {
      console.error('Error creating association annuaire entry:', error);
      throw error;
    }
  }

  /**
   * Update association profile with complete data
   */
  async updateAssociationProfile(entryId: string, profileData: AssociationProfileData) {
    try {
      const { error } = await supabase
        .from('annuaire_association')
        .update({
          association_name: profileData.association_name,
          license_number: profileData.license_number,
          address: profileData.address,
          description: profileData.description || null,
          website: profileData.website || null,
          focus_areas: profileData.focus_areas || [],
          services_offered: profileData.services_offered || [],
        })
        .eq('annuaire_entry_id', entryId);

      if (error) throw error;

      await supabase
        .from('annuaire_entries')
        .update({ status: 'pending_review' })
        .eq('id', entryId);

      return { success: true };
    } catch (error) {
      console.error('Error updating association profile:', error);
      throw error;
    }
  }

  /**
   * Get annuaire entry ID for user
   */
  async getAnnuaireEntryId(userId: string) {
    try {
      const { data, error } = await supabase
        .from('annuaire_entries')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;
      return data?.id || null;
    } catch (error) {
      console.error('Error getting annuaire entry:', error);
      return null;
    }
  }
}

export const annuaireSignupService = new AnnuaireSignupService();
