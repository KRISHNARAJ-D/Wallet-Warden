import { supabase } from './supabase';
import type { Expense } from '../types';

// Helper function to format date ranges
export const getDateRange = (range: 'today' | 'yesterday' | 'week' | 'month' | 'year') => {
  const now = new Date();
  const start = new Date();
  const end = new Date();

  switch (range) {
    case 'today':
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end.setDate(end.getDate() - 1);
      end.setHours(23, 59, 59, 999);
      break;
    case 'week':
      start.setDate(start.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'month':
      start.setMonth(start.getMonth() - 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    case 'year':
      start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
};

// Expenses API
export const expensesAPI = {
  getExpenses: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data.map((expense: any) => ({
        ...expense,
        id: expense.id,
        date: new Date(expense.date)
      }));
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  addExpense: async (expenseData: any) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: expenseData.user_id,
          amount: expenseData.amount,
          description: expenseData.description,
          category: expenseData.category,
          date: expenseData.date,
          roast: expenseData.roast
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        ...data,
        date: new Date(data.date)
      };
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  getExpensesByDateRange: async (userId: string, range: 'today' | 'yesterday' | 'week' | 'month' | 'year') => {
    try {
      const { start, end } = getDateRange(range);
      
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', userId)
        .gte('date', start.toISOString())
        .lte('date', end.toISOString())
        .order('date', { ascending: false });
      
      if (error) throw error;
      
      return data.map((expense: any) => ({
        ...expense,
        id: expense.id,
        date: new Date(expense.date)
      }));
    } catch (error) {
      console.error('Error fetching expenses by date range:', error);
      throw error;
    }
  }
};

// User Profiles API
export const profilesAPI = {
  getProfile: async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // If no profile exists, create a default one
      if (!data) {
        const { user } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const defaultProfile = {
          id: userId,
          email: user.email || '',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
          avatar_url: user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
          total_points: 0,
          streak_days: 0,
          level: 1
        };

        const { data: newProfile, error: insertError } = await supabase
          .from('user_profiles')
          .insert(defaultProfile)
          .select()
          .single();

        if (insertError) throw insertError;
        return newProfile;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  updateProfile: async (userId: string, profileData: any) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...profileData,
          last_login: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();
      
      if (error) throw error;
      
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
};