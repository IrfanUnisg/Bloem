# Supabase Functions Configuration

# Deploy all functions:
# supabase functions deploy

# Deploy individual function:
# supabase functions deploy items
# supabase functions deploy cart
# supabase functions deploy orders
# supabase functions deploy stripe-checkout
# supabase functions deploy complete-order

# Required environment variables (set in Supabase Dashboard):
# - SUPABASE_URL (auto-set)
# - SUPABASE_ANON_KEY (auto-set)
# - STRIPE_SECRET_KEY (for stripe-checkout function)

# Test locally:
# supabase functions serve items --env-file .env.local
