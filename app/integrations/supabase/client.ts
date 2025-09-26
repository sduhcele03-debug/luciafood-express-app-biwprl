import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://oieaxdrjiwkotgxbkowp.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9pZWF4ZHJqaXdrb3RneGJrb3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNTU0MDEsImV4cCI6MjA3MzczMTQwMX0.oEWam7pOSJdBwJyQptpDt_pf8YavsJCi2UhazbiRfB0";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
