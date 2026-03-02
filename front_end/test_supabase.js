import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env', 'utf8');
const url = env.split('\n').find(line => line.startsWith('VITE_SUPABASE_URL=')).split('=')[1];
const key = env.split('\n').find(line => line.startsWith('VITE_SUPABASE_ANON_KEY=')).split('=')[1];

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('followers').select('*').limit(1);
  console.log("Followers table:", error ? error.message : "Exists");
}
test();
