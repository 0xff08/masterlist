import {createClient} from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

const signInWithPassword = await supabase.auth.signInWithPassword;

export {supabase, signInWithPassword};

export default supabase;
