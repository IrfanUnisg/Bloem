/**
 * Authentication Service
 * Handles user authentication using Supabase Auth
 */

import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  role?: "seller" | "store" | "admin";
  hours?: string;
  ownerName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  /**
   * Sign up a new user
   */
  async signUp(data: SignUpData) {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          phone: data.phone,
          address: data.address,
          role: data.role || "seller",
          hours: data.hours,
          owner_name: data.ownerName,
        },
      },
    });

    if (authError) throw authError;

    return authData;
  },

  /**
   * Sign in an existing user
   */
  async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) throw error;

    return authData;
  },

  /**
   * Sign out current user
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get current session
   */
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },

  /**
   * Get current user
   */
  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  /**
   * Listen to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Reset password
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
  },

  /**
   * Update password
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },
};

export default authService;
