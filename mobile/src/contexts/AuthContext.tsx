import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { annuaireSignupService } from '../services/annuaire-signup.service';
import { AuthState, User, UserProfile, SignUpData, SignInData, UpdateProfileData } from '../types';

interface AuthContextType extends AuthState {
  signUp: (data: SignUpData) => Promise<{ error: AuthError | null }>;
  signIn: (data: SignInData) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
  deleteAccount: () => Promise<{ error: Error | null }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    initialized: false,
  });

  const fetchUserData = useCallback(async (userId: string, retryCount = 0) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (userError) throw userError;

      if (!userData && retryCount < 5) {
        const delayMs = 300 + (retryCount * 200);
        await new Promise(resolve => setTimeout(resolve, delayMs));
        return fetchUserData(userId, retryCount + 1);
      }

      if (!userData) {
        console.warn('User data not found after 5 retries, returning null');
        return { user: null, profile: null };
      }

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        console.warn('Profile fetch error:', profileError);
      }

      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userId);

      return {
        user: userData as User,
        profile: profileData as UserProfile | null,
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      return { user: null, profile: null };
    }
  }, []);

  const initializeAuth = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const { user, profile } = await fetchUserData(session.user.id);
        setState({
          user,
          profile,
          session,
          loading: false,
          initialized: true,
        });
      } else {
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          initialized: true,
        });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
      setState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        initialized: true,
      });
    }
  }, [fetchUserData]);

  useEffect(() => {
    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          const { user, profile } = await fetchUserData(session.user.id);
          setState({
            user,
            profile,
            session,
            loading: false,
            initialized: true,
          });
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            initialized: true,
          });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setState(prev => ({
            ...prev,
            session,
          }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initializeAuth, fetchUserData]);

  const signUp = async (data: SignUpData) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            role: data.role,
          },
        },
      });

      if (authError) {
        setState(prev => ({ ...prev, loading: false }));
        return { error: authError };
      }

      if (authData.user) {
        try {
          console.log('Signup successful, user ID:', authData.user.id);
          
          const { error: insertError } = await supabase.from('users').insert({
            id: authData.user.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role,
            wilaya: data.wilaya,
            commune: data.commune,
            phone: data.phone,
            language: data.language || 'fr',
            is_active: data.role === 'doctor' ? false : true,
          });

          if (insertError) {
            console.error('Error creating user record:', insertError);
            console.error('Error code:', insertError.code);
            console.error('Error message:', insertError.message);
            setState(prev => ({ ...prev, loading: false }));
            return { error: insertError as any };
          }

          console.log('User record created successfully for:', authData.user.id);

          // Create annuaire entry for doctors and other professionals
          if (data.role === 'doctor') {
            try {
              await annuaireSignupService.createDoctorAnnuaireEntry(authData.user.id, {
                full_name: data.full_name,
                email: data.email,
                phone: data.phone,
                wilaya: data.wilaya,
                commune: data.commune,
              });
              console.log('Doctor annuaire entry created successfully for:', authData.user.id);
            } catch (annuaireCreateError) {
              console.warn('Error creating doctor annuaire entry:', annuaireCreateError);
            }
          }

          const { data: existingProfile } = await supabase
            .from('user_profiles')
            .select('id')
            .eq('user_id', authData.user.id)
            .maybeSingle();

          if (!existingProfile) {
            const { error: profileError } = await supabase.from('user_profiles').insert({
              user_id: authData.user.id,
            });

            if (profileError) {
              console.warn('Error creating user profile:', profileError);
            }
          }

          const { data: existingNotif } = await supabase
            .from('notification_settings')
            .select('id')
            .eq('user_id', authData.user.id)
            .maybeSingle();

          if (!existingNotif) {
            const { error: notificationSettingsError } = await supabase
              .from('notification_settings')
              .insert({
                user_id: authData.user.id,
              });

            if (notificationSettingsError) {
              console.warn('Error creating notification settings:', notificationSettingsError);
            }
          }

          console.log('Signup completed successfully');
          setState(prev => ({ ...prev, loading: false }));
          return { error: null };
        } catch (insertError) {
          console.error('Error during user creation:', insertError);
          setState(prev => ({ ...prev, loading: false }));
          return { error: insertError as AuthError };
        }
      }

      setState(prev => ({ ...prev, loading: false }));
      return { error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      setState(prev => ({ ...prev, loading: false }));
      return { error: error as AuthError };
    }
  };

  const signIn = async (data: SignInData) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setState(prev => ({ ...prev, loading: false }));
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      setState(prev => ({ ...prev, loading: false }));
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await supabase.auth.signOut();
      setState({
        user: null,
        profile: null,
        session: null,
        loading: false,
        initialized: true,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    try {
      if (!state.user) {
        return { error: new Error('No user logged in') };
      }

      setState(prev => ({ ...prev, loading: true }));

      const userUpdates: any = {};
      const profileUpdates: any = {};

      if (data.full_name !== undefined) userUpdates.full_name = data.full_name;
      if (data.phone !== undefined) userUpdates.phone = data.phone;
      if (data.wilaya !== undefined) userUpdates.wilaya = data.wilaya;
      if (data.commune !== undefined) userUpdates.commune = data.commune;
      if (data.language !== undefined) userUpdates.language = data.language;
      if (data.avatar_url !== undefined) userUpdates.avatar_url = data.avatar_url;

      if (data.bio !== undefined) profileUpdates.bio = data.bio;
      if (data.specialization !== undefined) profileUpdates.specialization = data.specialization;
      if (data.address !== undefined) profileUpdates.address = data.address;
      if (data.website !== undefined) profileUpdates.website = data.website;

      if (Object.keys(userUpdates).length > 0) {
        const { error: userError } = await supabase
          .from('users')
          .update(userUpdates)
          .eq('id', state.user.id);

        if (userError) {
          setState(prev => ({ ...prev, loading: false }));
          return { error: userError as any };
        }
      }

      if (Object.keys(profileUpdates).length > 0) {
        const { error: profileError } = await supabase
          .from('user_profiles')
          .update(profileUpdates)
          .eq('user_id', state.user.id);

        if (profileError) {
          setState(prev => ({ ...prev, loading: false }));
          return { error: profileError as any };
        }
      }

      const { user, profile } = await fetchUserData(state.user.id);
      setState(prev => ({
        ...prev,
        user,
        profile,
        loading: false,
      }));

      return { error: null };
    } catch (error) {
      console.error('Update profile error:', error);
      setState(prev => ({ ...prev, loading: false }));
      return { error: error as Error };
    }
  };

  const refreshUser = async () => {
    if (!state.user) return;

    try {
      const { user, profile } = await fetchUserData(state.user.id);
      setState(prev => ({
        ...prev,
        user,
        profile,
      }));
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  };

  const deleteAccount = async () => {
    try {
      if (!state.user) {
        return { error: new Error('No user logged in') };
      }

      setState(prev => ({ ...prev, loading: true }));

      const { error } = await supabase.rpc('delete_user_account', {
        user_id: state.user.id,
      });

      if (error) {
        setState(prev => ({ ...prev, loading: false }));
        return { error: error as any };
      }

      await signOut();
      return { error: null };
    } catch (error) {
      console.error('Delete account error:', error);
      setState(prev => ({ ...prev, loading: false }));
      return { error: error as Error };
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setState(prev => ({ ...prev, loading: true }));

      // Check if user exists in the public.users table first
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (userError) {
        console.error('Error checking user existence:', userError);
        setState(prev => ({ ...prev, loading: false }));
        return { error: userError as any };
      }

      if (!userData) {
        setState(prev => ({ ...prev, loading: false }));
        return { 
          error: { 
            name: 'AuthError',
            message: 'Aucun compte n\'est associé à cette adresse email.',
            status: 404 
          } as AuthError 
        };
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'canstory://reset-password',
      });
      setState(prev => ({ ...prev, loading: false }));
      return { error };
    } catch (error) {
      console.error('Reset password error:', error);
      setState(prev => ({ ...prev, loading: false }));
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
    ...state,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refreshUser,
    deleteAccount,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
