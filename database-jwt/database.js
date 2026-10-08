const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://xhzuanvlkhkhxufzhdhe.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_kziBdZtJmottETSHBN6wLA_FzIuKC4S';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

module.exports = supabase;