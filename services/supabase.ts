import { createClient } from '@supabase/supabase-js';
import { Buffer } from 'buffer';
import 'react-native-url-polyfill/auto';

if (typeof global.Buffer === 'undefined') {
  global.Buffer = Buffer;
}

const supabaseUrl = "https://vrchswdchujryejphqih.supabase.co";
const supabaseAnonKey = "sb_publishable_e2r6eR6Yj3L8gNzk7ZW5cQ_ErC2OpIF";



export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
});