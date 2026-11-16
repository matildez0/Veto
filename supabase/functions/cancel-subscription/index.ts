import Stripe from 'npm:stripe@17.5.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const secret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!secret) throw new Error('STRIPE_SECRET_KEY não está configurada.');
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error('Autenticação necessária.');
    const authClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) throw new Error('Sessão inválida.');
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data: subscription, error } = await admin.from('subscriptions')
      .select('stripe_subscription_id').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (!subscription?.stripe_subscription_id) throw new Error('Não foi encontrada uma subscrição ativa.');
    const stripe = new Stripe(secret, { apiVersion: '2024-12-18.acacia' });
    const cancelled = await stripe.subscriptions.cancel(subscription.stripe_subscription_id);
    return new Response(JSON.stringify({ ok: true, status: cancelled.status }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Não foi possível cancelar.' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
