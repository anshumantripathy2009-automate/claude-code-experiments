const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.warn(
    '[supabase-client] SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set — conversation memory will not persist.'
  );
} else {
  supabase = createClient(supabaseUrl, supabaseServiceRoleKey);
}

module.exports = supabase;
