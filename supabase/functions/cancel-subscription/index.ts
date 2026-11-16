import Stripe from 'npm:stripe@17.5.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: cors });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método não permitido.' }), {
      status: 405,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }

  try {
    const secret = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!secret) throw new Error('STRIPE_SECRET_KEY não está configurada.');
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error('A configuração do Supabase está incompleta.');
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error('Autenticação necessária.');

    const authClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Sessão inválida.' }), {
        status: 401,
        headers: { ...cors, 'Content-Type': 'application/json' }
      });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey);
    const { data: subscription, error: subscriptionError } = await admin
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subscriptionError) throw subscriptionError;
    if (!subscription?.stripe_subscription_id) {
      throw new Error('Não foi encontrada uma subscrição associada à tua conta.');
    }

    const stripe = new Stripe(secret, { apiVersion: '2024-12-18.acacia' });
    const scheduled = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    const currentPeriodEnd = scheduled.current_period_end
      ? new Date(scheduled.current_period_end * 1000).toISOString()
      : null;

    return new Response(JSON.stringify({
      ok: true,
      status: scheduled.status,
      cancel_at_period_end: scheduled.cancel_at_period_end,
      current_period_end: currentPeriodEnd
    }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Não foi possível agendar o cancelamento.';
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...cors, 'Content-Type': 'application/json' }
    });
  }
});
