// webhook.ts

import { NextRequest, NextResponse } from 'next/server';
import { Paddle, Environment, EventName } from '@paddle/paddle-node-sdk';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Ensure Supabase environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// IMPORTANT: Use the Service Role Key for backend operations that need to bypass RLS
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Service Role Key not configured. Webhook handler will not be able to connect to the database.');
  // You might throw an error or handle this startup failure appropriately
}

// IMPORTANT: Ensure Paddle API Key and Environment are set
const paddleApiKey = process.env.PADDLE_API_KEY;
const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV;

// Determine Paddle Environment Enum using lowercase members
const environment: Environment = paddleEnv === 'production' 
  ? Environment.production // Use lowercase enum member
  : Environment.sandbox;    // Use lowercase enum member

if (!paddleApiKey) {
  console.error('Paddle API Key not configured. Webhook handler cannot initialize Paddle SDK.');
}

// Initialize Paddle SDK (Server-Side) using the determined enum value
const paddle = paddleApiKey ? new Paddle(paddleApiKey, { environment }) : null;

/**
 * Type definition for customer data from Paddle webhook
 */
type PaddleCustomerData = {
  id: string;
  email: string;
};

/**
 * Handles subscription-related webhook events
 * @param eventData The webhook event data from Paddle
 * @param supabase Supabase client instance
 */
async function handleSubscriptionEvent(
  eventData: any,
  supabase: SupabaseClient
): Promise<void> {
  const data = eventData.data;
  
  if (!data || !data.id || !data.customerId) {
    console.error('Invalid subscription data in webhook payload');
    return;
  }

  // Extract subscription details
  const subscriptionId = data.id;
  const customerId = data.customerId;
  const status = data.status;
  
  // Extract price and product IDs if available
  const priceId = data.items?.[0]?.price?.id || null;
  const productId = data.items?.[0]?.product?.id || null;
  
  // Extract scheduled change if available
  const scheduledChange = data.scheduledChange ? 
    JSON.stringify(data.scheduledChange) : 
    null;
  
  // Check if customer exists
  const { data: customerData, error: customerError } = await supabase
    .from('customers')
    .select('customer_id')
    .eq('customer_id', customerId)
    .single();
    
  if (customerError && customerError.code !== 'PGRST116') { // PGRST116 is 'not found'
    console.error('Error checking customer:', customerError);
    return;
  }
  
  if (!customerData) {
    console.warn(`Customer ${customerId} not found in database. Subscription update skipped.`);
    return;
  }
  
  // Check if subscription exists
  const { data: existingSubscription, error: subCheckError } = await supabase
    .from('subscriptions')
    .select('subscription_id')
    .eq('subscription_id', subscriptionId)
    .single();
    
  if (subCheckError && subCheckError.code !== 'PGRST116') {
    console.error('Error checking subscription:', subCheckError);
    return;
  }
  
  // Upsert subscription data
  const { error: upsertError } = await supabase
    .from('subscriptions')
    .upsert({
      subscription_id: subscriptionId,
      subscription_status: status,
      price_id: priceId,
      product_id: productId,
      scheduled_change: scheduledChange,
      customer_id: customerId,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'subscription_id'
    });
    
  if (upsertError) {
    console.error('Error upserting subscription:', upsertError);
    return;
  }
  
  console.log(`Successfully processed subscription ${subscriptionId} for customer ${customerId}`);
}

/**
 * Handles customer-related webhook events
 * @param eventData The webhook event data from Paddle
 * @param supabase Supabase client instance
 */
async function handleCustomerEvent(
  eventData: any,
  supabase: SupabaseClient
): Promise<void> {
  const data = eventData.data as PaddleCustomerData;
  
  if (!data || !data.id || !data.email) {
    console.error('Invalid customer data in webhook payload');
    return;
  }
  
  const customerId = data.id;
  const email = data.email;
  
  // Upsert customer data
  const { error } = await supabase
    .from('customers')
    .upsert({
      customer_id: customerId,
      email: email,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'customer_id'
    });
    
  if (error) {
    console.error('Error upserting customer:', error);
    return;
  }
  
  console.log(`Successfully processed customer ${customerId} with email ${email}`);
}

export async function POST(req: NextRequest) {
  console.log('Received Paddle webhook request');

  // Check if Supabase and Paddle clients are initialized
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase not configured. Cannot process webhook.');
    return NextResponse.json({ error: 'Webhook processor misconfigured (Supabase)' }, { status: 500 });
  }
  if (!paddle) {
    console.error('Paddle SDK not initialized. Cannot process webhook.');
    return NextResponse.json({ error: 'Webhook processor misconfigured (Paddle)' }, { status: 500 });
  }

  // Initialize Supabase client within the handler
  const supabase = createClient(supabaseUrl!, supabaseKey!); 

  try {
    const signature = req.headers.get('paddle-signature') || '';
    const rawRequestBody = await req.text(); // Read raw body for signature verification
    console.log('Raw request body:', rawRequestBody);

    const webhookSecret = process.env.PADDLE_NOTIFICATION_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Paddle webhook secret is not configured.');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // Verify and unmarshal the webhook payload
    const eventData = await paddle.webhooks.unmarshal(rawRequestBody, webhookSecret, signature);
    console.log('Event data:', eventData);
    if (!eventData) {
      console.error('Failed to unmarshal webhook payload');
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const eventName = eventData.eventType;
    console.log(`Processing Paddle event: ${eventName}`);

    // Handle different event types
    switch (eventName) {
      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated:
      case EventName.SubscriptionCanceled:
        await handleSubscriptionEvent(eventData, supabase);
        break;
      case EventName.CustomerCreated:
      case EventName.CustomerUpdated:
        await handleCustomerEvent(eventData, supabase);
        break;
      default:
        console.log(`Unhandled event type: ${eventName}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
