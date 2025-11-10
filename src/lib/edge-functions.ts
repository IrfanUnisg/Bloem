const SUPABASE_FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_URL?.replace(
  'https://',
  'https://'
).replace('.supabase.co', '.supabase.co/functions/v1');

export const EDGE_FUNCTIONS = {
  ITEMS: `${SUPABASE_FUNCTIONS_URL}/items`,
  CART: `${SUPABASE_FUNCTIONS_URL}/cart`,
  ORDERS: `${SUPABASE_FUNCTIONS_URL}/orders`,
  STRIPE_CHECKOUT: `${SUPABASE_FUNCTIONS_URL}/stripe-checkout`,
  COMPLETE_ORDER: `${SUPABASE_FUNCTIONS_URL}/complete-order`,
} as const;

export default EDGE_FUNCTIONS;
