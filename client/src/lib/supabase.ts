import { createClient } from '@supabase/supabase-js';

// Public project configuration supplied by the site owner. Publishable keys are
// intended for browser clients; privileged/service-role credentials never belong here.
const projectUrl = 'https://rebjcoazabhkcobjjzkj.supabase.co';
const publishableKey = 'sb_publishable_56dLyg6nM0RWsDsHy08kPA_cMQHPt1J';
const configuredUrl = import.meta.env.VITE_SUPABASE_URL;
const useProjectDefault = !configuredUrl || configuredUrl.includes('lgyfgdbbkzchwvmelftw');
const supabaseUrl = useProjectDefault ? projectUrl : configuredUrl;
const supabaseAnonKey = useProjectDefault ? publishableKey
  : (import.meta.env.VITE_SUPABASE_ANON_KEY || publishableKey);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
