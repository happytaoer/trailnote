# Paddle Billing Integration Setup

This document outlines the steps required to integrate Paddle Billing with TrailNote.

## 1. Database Setup

Connect to your Supabase database and execute the following SQL script to create the necessary tables for managing customer and subscription data:

```sql
-- Create customers table to map Paddle customer_id to user_id (assuming you have a users table)
-- If you store user email directly, adjust accordingly.
create table
  public.customers (
    paddle_customer_id text not null,
    user_id uuid not null, -- Assuming you use Supabase Auth, which uses UUIDs
    email text null,       -- Store email for reference if needed
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint customers_pkey primary key (paddle_customer_id),
    -- Add foreign key to your users table if it exists
    -- constraint customers_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
  ) tablespace pg_default;

-- Create subscription table to store webhook events sent by Paddle
create table
  public.subscriptions (
    subscription_id text not null,
    subscription_status text not null, -- e.g., 'active', 'past_due', 'canceled'
    price_id text null,
    product_id text null,
    scheduled_change text null,
    paddle_customer_id text not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    constraint subscriptions_pkey primary key (subscription_id),
    constraint public_subscriptions_customer_id_fkey foreign key (paddle_customer_id) references customers (paddle_customer_id) on delete cascade
  ) tablespace pg_default;

-- Grant access for your API/backend role (e.g., service_role) to interact with these tables
-- Grant SELECT, INSERT, UPDATE, DELETE on customers to service_role;
-- Grant SELECT, INSERT, UPDATE, DELETE on subscriptions to service_role;

-- RLS Policies (Example - Adjust based on your security model)
-- Ensure your API uses a role (like service_role) that bypasses RLS or has specific policies.

-- Allow authenticated users to potentially read their own subscription status (if needed in the frontend)
-- This requires joining through the customers table based on the logged-in user's ID.
-- create policy "Enable read access for users own subscription" on "public"."subscriptions" 
-- as permissive for select
-- to authenticated
-- using (
--   paddle_customer_id IN (
--     SELECT paddle_customer_id
--     FROM public.customers
--     WHERE user_id = auth.uid()
--   )
-- );

-- create policy "Enable read access for users own customer data" on "public"."customers"
-- as permissive for select
-- to authenticated
-- using (user_id = auth.uid());


```

**Note:** 
*   Adjust the `customers` table `user_id` column and foreign key constraint based on your actual users table (`auth.users` is common with Supabase Auth).
*   Review and implement appropriate Row Level Security (RLS) policies based on your application's needs. The example policies allow users to read their own data, but your backend service will likely need broader permissions (e.g., using the `service_role` key).

## 2. Environment Variables

Create or update your `.env.local` file in the project root with the following Paddle API keys and settings:

```env
# Paddle Environment ('sandbox' or 'production')
NEXT_PUBLIC_PADDLE_ENV="sandbox"

# Paddle Client-Side Token (Obtained from Paddle Dashboard)
NEXT_PUBLIC_PADDLE_CLIENT_TOKEN="YOUR_PADDLE_CLIENT_TOKEN"

# Paddle API Key (Secret - Server-Side Only)
PADDLE_API_KEY="YOUR_PADDLE_SECRET_API_KEY"

# Paddle Webhook Signing Secret (Secret - Server-Side Only)
PADDLE_NOTIFICATION_WEBHOOK_SECRET="YOUR_PADDLE_WEBHOOK_SECRET"

# Paddle Premium Plan Price ID (From your Paddle Product Catalog)
# Replace with your actual Price ID for the $3/month plan
NEXT_PUBLIC_PADDLE_PREMIUM_PRICE_ID="pri_xxxxxxxxxxxxxxxxx"
```

*   Replace the placeholder values (`YOUR_...`, `pri_...`) with your actual credentials and Price ID from your Paddle dashboard.
*   **Important:** Keep `PADDLE_API_KEY` and `PADDLE_NOTIFICATION_WEBHOOK_SECRET` secret and do not expose them in your client-side code.

## 3. Configure Paddle Webhook

1.  Go to your Paddle Dashboard.
2.  Navigate to Developer Tools > Notifications.
3.  Click "Add destination".
4.  Enter the URL where your webhook handler will be hosted. When running locally with tools like `ngrok`, it might look like `https://your-ngrok-subdomain.ngrok.io/api/paddle/webhook`. For production, it will be `https://yourdomain.com/api/paddle/webhook`.
5.  Paste the `PADDLE_NOTIFICATION_WEBHOOK_SECRET` you added to your `.env.local` file into the "Secret key" field.
6.  Select the events you want to subscribe to. At a minimum, include:
    *   `subscription.created`
    *   `subscription.updated`
    *   `subscription.canceled`
    *   `customer.created` (Optional, if you want to sync customer creation)
7.  Save the webhook destination.

## 4. Install Paddle SDK

Run the following command in your project's terminal:

```bash
npm install @paddle/paddle-node-sdk
# or
yarn add @paddle/paddle-node-sdk
# or
pnpm add @paddle/paddle-node-sdk
```

This installs the official Paddle Node.js SDK needed for verifying webhook signatures in the API route.
