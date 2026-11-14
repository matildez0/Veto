import Stripe from 'npm:stripe@17.5.0';
import { createClient } from 'npm:@supabase/supabase-js@2';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (request) => {
  try {
    const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY');
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!stripeSecret || !webhookSecret) throw new Error('Segredos Stripe não configurados na Edge Function.');
    const stripe = new Stripe(stripeSecret, { apiVersion: '2024-12-18.acacia' });
    const signature = request.headers.get('stripe-signature');
    if (!signature) return new Response('Assinatura em falta.', { status: 400 });
    const event = await stripe.webhooks.constructEventAsync(await request.text(), signature, webhookSecret);
    const object = event.data.object as Stripe.Subscription | Stripe.Checkout.Session;
    const metadata = object.metadata || {};
    const userId = metadata.supabase_user_id || (event.type.startsWith('checkout.session') ? (object as Stripe.Checkout.Session).client_reference_id : null);
    if (!userId) return new Response('ok');
    if (event.type === 'checkout.session.completed') {
      const session = object as Stripe.Checkout.Session;
      const subscription = await stripe.subscriptions.retrieve(String(session.subscription));
      await admin.from('subscriptions').upsert({ user_id: userId, stripe_customer_id: String(session.customer), stripe_subscription_id: subscription.id, plan: metadata.plano, status: subscription.status, current_period_end: new Date(subscription.current_period_end * 1000).toISOString(), cancel_at_period_end: subscription.cancel_at_period_end, updated_at: new Date().toISOString() });
    } else if (['customer.subscription.updated', 'customer.subscription.deleted'].includes(event.type)) {
      const subscription = object as Stripe.Subscription;
      await admin.from('subscriptions').update({ status: subscription.status, current_period_end: new Date(subscription.current_period_end * 1000).toISOString(), cancel_at_period_end: subscription.cancel_at_period_end, updated_at: new Date().toISOString() }).eq('stripe_subscription_id', subscription.id);
    }
    return new Response('ok');
  } catch (error) {
    return new Response(error instanceof Error ? error.message : 'Webhook inválido.', { status: 400 });
  }
});
