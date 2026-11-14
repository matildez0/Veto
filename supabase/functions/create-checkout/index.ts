import Stripe from 'npm:stripe@17.5.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' };

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeSecret) throw new Error('STRIPE_SECRET_KEY não está configurada na Edge Function.');
    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-12-18.acacia' });
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) throw new Error('Autenticação necessária.');
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) throw new Error('Sessão inválida.');
    const { plano } = await request.json();
    const price = plano === 'anual' ? Deno.env.get('STRIPE_PRICE_ANUAL') : plano === 'mensal' ? Deno.env.get('STRIPE_PRICE_MENSAL') : null;
    if (!price) throw new Error('Plano inválido.');
    const customer = await stripe.customers.create({ email: user.email, metadata: { supabase_user_id: user.id } });
    const origin = request.headers.get('origin') || Deno.env.get('APP_URL')!;
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customer.id,
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/mvp/prototipo/index.html?checkout=ok`,
      cancel_url: `${origin}/mvp/prototipo/index.html?checkout=cancelado`,
      client_reference_id: user.id,
      metadata: { supabase_user_id: user.id, plano }
    });
    return new Response(JSON.stringify({ url: session.url }), { headers: { ...cors, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Erro ao criar checkout.' }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
