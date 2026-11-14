'use strict';

// Public Supabase settings only. Never put a service-role key or a Stripe secret here.
const SUPABASE_CONFIG = {
  URL: 'https://krzsowlvgonjtzucsltt.supabase.co',
  ANON_KEY: 'sb_publishable_0J0gEX8WRhDlFaz_vuZjCQ_tll_TUfY'
};

function supabaseConfigurado() {
  return Boolean(SUPABASE_CONFIG.URL && SUPABASE_CONFIG.ANON_KEY && window.supabase?.createClient);
}

const supabaseClient = supabaseConfigurado()
  ? window.supabase.createClient(SUPABASE_CONFIG.URL, SUPABASE_CONFIG.ANON_KEY)
  : null;