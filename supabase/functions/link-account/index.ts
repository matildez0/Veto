import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (request) => {
  const headers = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };
  if (request.method === 'OPTIONS') return new Response('ok', { headers });
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error('Autenticação necessária.');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) throw new Error('Sessão inválida.');
    const { data: subscription } = await supabase.from('subscriptions').select('status').eq('user_id', user.id).maybeSingle();
    if (!subscription || !['active', 'trialing'].includes(subscription.status)) throw new Error('É necessária uma subscrição Veto+ ativa.');
    const { email, google_account_id: googleAccountId } = await request.json();
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Conta Google inválida.');
    const normalizedEmail = email.toLowerCase();
    const { data: existing } = await supabase.from('linked_accounts').select('id').eq('email', normalizedEmail).maybeSingle();
    const { count } = await supabase.from('linked_accounts').select('id', { count: 'exact', head: true });
    if (!existing && (count || 0) >= 5) throw new Error('Atingiste o limite de 5 contas.');
    const { error } = await supabase.from('linked_accounts').upsert({ user_id: user.id, email: normalizedEmail, google_account_id: typeof googleAccountId === 'string' ? googleAccountId : null }, { onConflict: 'user_id,email' });
    if (error) throw error;
    return new Response(JSON.stringify({ ok: true }), { headers: { ...headers, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Não foi possível associar a conta.' }), { status: 400, headers: { ...headers, 'Content-Type': 'application/json' } });
  }
});
