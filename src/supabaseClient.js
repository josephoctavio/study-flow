// 🔄 Change this line
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hcdgxxcjmamrlojhshxa.supabase.co';
const supabaseKey = 'sb_publishable_yRLsYMdodAsmjLfsB8QE_w_kdcA7Vja';

export const supabase = createClient(supabaseUrl, supabaseKey);