import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  // We don't throw here to allow app to start for other checks, but DB ops will fail
  // logger.warn('Supabase URL or Key missing. Database features will fail.'); 
  // Commented out to avoid noise during build/test if env not set yet, 
  // but in production it should be set.
}

export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
    auth: {
        persistSession: false
    }
});
