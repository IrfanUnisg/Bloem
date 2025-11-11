-- Create wishlist table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, item_id)
);

-- Create indexes for better performance
CREATE INDEX idx_wishlist_user_id ON wishlist_items(user_id);
CREATE INDEX idx_wishlist_item_id ON wishlist_items(item_id);

-- Enable RLS
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wishlist_items
-- Users can view their own wishlist items
CREATE POLICY "Users can view own wishlist"
  ON wishlist_items
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Users can add items to their own wishlist
CREATE POLICY "Users can add to own wishlist"
  ON wishlist_items
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Users can remove items from their own wishlist
CREATE POLICY "Users can remove from own wishlist"
  ON wishlist_items
  FOR DELETE
  USING (auth.uid()::text = user_id);
