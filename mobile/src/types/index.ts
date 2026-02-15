import { UserRole, LanguagePreference } from './database.types';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  phone?: string;
  wilaya: string;
  commune: string;
  language: LanguagePreference;
  avatar_url?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  bio?: string;
  specialization?: string;
  license_number?: string;
  address?: string;
  working_hours?: any;
  services?: any;
  website?: string;
  social_links?: any;
  verification_status: string;
  verified_at?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: any | null;
  loading: boolean;
  initialized: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  full_name: string;
  role: UserRole;
  wilaya: string;
  commune: string;
  phone?: string;
  language?: LanguagePreference;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  full_name?: string;
  phone?: string;
  wilaya?: string;
  commune?: string;
  language?: LanguagePreference;
  avatar_url?: string;
  bio?: string;
  specialization?: string;
  address?: string;
  website?: string;
}

export * from './database.types';
