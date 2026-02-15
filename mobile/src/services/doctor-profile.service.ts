import { supabase } from '../lib/supabase';

export interface DoctorProfileData {
  specialization: string;
  license_number: string;
  hospital_affiliation?: string;
  consultation_fee?: number;
  years_of_experience?: number;
  education?: any[];
  certifications?: any[];
  languages_spoken?: string[];
  accepts_new_patients?: boolean;
}

export class DoctorProfileService {
  async getAnnuaireEntryId(userId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('annuaire_entries')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.warn('Error fetching annuaire entry:', error);
        return null;
      }

      if (!data) {
        console.warn('Annuaire entry not found for user:', userId);
        return null;
      }

      console.log('Annuaire entry found:', (data as any).id);
      return (data as any).id;
    } catch (error) {
      console.error('Error fetching annuaire entry:', error);
      return null;
    }
  }

  async saveDoctorProfile(userId: string, annuaireEntryId: string, data: DoctorProfileData): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('annuaire_medecin')
        .update({
          specialization: data.specialization,
          license_number: data.license_number,
          hospital_affiliation: data.hospital_affiliation || null,
          consultation_fee: data.consultation_fee || null,
          years_of_experience: data.years_of_experience || null,
          education: data.education || null,
          certifications: data.certifications || null,
          languages_spoken: data.languages_spoken || null,
          accepts_new_patients: data.accepts_new_patients !== false,
          updated_at: new Date().toISOString(),
        })
        .eq('annuaire_entry_id', annuaireEntryId);

      if (error) {
        console.error('Error saving doctor profile:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Error in saveDoctorProfile:', error);
      return { error: error as Error };
    }
  }

  async getDoctorProfile(annuaireEntryId: string): Promise<DoctorProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('annuaire_medecin')
        .select('specialization, license_number, hospital_affiliation, consultation_fee, years_of_experience, education, certifications, languages_spoken, accepts_new_patients')
        .eq('annuaire_entry_id', annuaireEntryId)
        .single();

      if (error) {
        console.warn('Doctor profile not found:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching doctor profile:', error);
      return null;
    }
  }

  async checkIfDoctorProfileComplete(annuaireEntryId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('annuaire_medecin')
        .select('specialization, license_number')
        .eq('annuaire_entry_id', annuaireEntryId)
        .single();

      if (error || !data) return false;

      const { specialization, license_number } = data as any;
      
      // Profile is incomplete if it has placeholder values
      const hasPlaceholders = 
        specialization === 'À compléter' || 
        license_number === 'À compléter' ||
        specialization === 'General Practice' ||
        license_number?.startsWith('TEMP-');
      
      return !hasPlaceholders && !!specialization && !!license_number;
    } catch (error) {
      console.error('Error checking doctor profile:', error);
      return false;
    }
  }
}

export const doctorProfileService = new DoctorProfileService();
