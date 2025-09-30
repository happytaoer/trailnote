import { NextRequest, NextResponse } from 'next/server';
import { Paddle, Environment } from '@paddle/paddle-node-sdk';
import { createClient } from '@supabase/supabase-js';

// Ensure Supabase environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// IMPORTANT: Use the Service Role Key for backend operations that need to bypass RLS
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// IMPORTANT: Ensure Paddle API Key and Environment are set
const paddleApiKey = process.env.PADDLE_API_KEY;
const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV;

// Determine Paddle Environment Enum
const environment: Environment = paddleEnv === 'production' 
  ? Environment.production 
  : Environment.sandbox;

// Initialize Paddle SDK (Server-Side)
const paddle = paddleApiKey ? new Paddle(paddleApiKey, { environment }) : null;

/**
 * API route for resuming a canceled subscription
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  // Check if Supabase and Paddle clients are initialized
  if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase not configured. Cannot process subscription resumption.');
    return NextResponse.json({ error: 'Service misconfigured (Supabase)' }, { status: 500 });
  }
  if (!paddle) {
    console.error('Paddle SDK not initialized. Cannot process subscription resumption.');
    return NextResponse.json({ error: 'Service misconfigured (Paddle)' }, { status: 500 });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request body
    const body = await req.json();
    const { subscriptionId } = body;
    
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Subscription ID is required' }, { status: 400 });
    }
    
    // Get the authentication token from request headers
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.substring(7);
    
    // Validate token and get user info
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify the subscription belongs to the user
    const { data: customerData } = await supabase
      .from('customers')
      .select('customer_id')
      .eq('email', user.email)
      .single();
      
    if (!customerData) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('subscription_id, scheduled_change')
      .eq('subscription_id', subscriptionId)
      .eq('customer_id', customerData.customer_id)
      .single();
      
    if (!subscriptionData) {
      return NextResponse.json({ error: 'Subscription not found or does not belong to user' }, { status: 404 });
    }
    
    // Check if there's a scheduled change to cancel
    let scheduledChange;
    try {
      scheduledChange = subscriptionData.scheduled_change ? JSON.parse(subscriptionData.scheduled_change) : null;
    } catch (e) {
      console.error('Error parsing scheduled_change:', e);
      scheduledChange = null;
    }
    
    if (!scheduledChange || scheduledChange.action !== 'cancel') {
      return NextResponse.json({ 
        error: 'Subscription does not have a pending cancellation to resume' 
      }, { status: 400 });
    }
    
    // Resume the subscription via Paddle API by removing the scheduled cancellation
    // Using the Paddle API to resume a subscription that was scheduled to be canceled
    const resumeResult = await paddle.subscriptions.update(subscriptionId, {
      scheduledChange: null // Removing the scheduled cancellation
    });
    
    if (!resumeResult) {
      throw new Error('Failed to resume subscription with Paddle');
    }
    
    console.log(`Subscription ${subscriptionId} resumed successfully`);
    
    // The subscription status will be updated via webhook when Paddle sends the event
    
    return NextResponse.json({ 
      success: true, 
      message: 'Subscription resumed successfully' 
    });
  } catch (error) {
    console.error('Error resuming subscription:', error);
    return NextResponse.json({ 
      error: 'Failed to resume subscription' 
    }, { 
      status: 500 
    });
  }
}
