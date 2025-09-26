
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

// Note: These are placeholder values. 
// To use Supabase, please enable it by pressing the Supabase button and connecting to your project.
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface Restaurant {
  id: string;
  name: string;
  tags: string[];
  logo_url?: string;
  min_order: number;
  delivery_from: number;
  eta: string;
  available_in: string[];
  created_at?: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category: string;
  name: string;
  price: number;
  image_url?: string;
  created_at?: string;
}

export interface Order {
  id: string;
  customer_name: string;
  phone: string;
  address: string;
  town: string;
  restaurant_id: string;
  items: any[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  status: string;
  created_at?: string;
}

export interface Profile {
  id: string;
  full_name: string;
  phone: string;
  address?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}
