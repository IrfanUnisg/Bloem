# Deploy Contact Form Feature

## Step 1: Run the Database Migration

Go to your Supabase Dashboard:
1. Navigate to https://supabase.com/dashboard/project/opzvnmjnxiomuofduxjo/sql/new
2. Copy and paste this SQL:

```sql
-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by TEXT REFERENCES users(id)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- Enable RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "admins_can_view_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "admins_can_update_contact_messages" ON contact_messages;
DROP POLICY IF EXISTS "anyone_can_insert_contact_messages" ON contact_messages;

-- Admin can view all messages
CREATE POLICY "admins_can_view_contact_messages" ON contact_messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()::text
    )
  );

-- Admin can update messages (mark as resolved, etc.)
CREATE POLICY "admins_can_update_contact_messages" ON contact_messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admins
      WHERE admins.user_id = auth.uid()::text
    )
  );

-- Anyone can insert contact messages (public form)
CREATE POLICY "anyone_can_insert_contact_messages" ON contact_messages
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
```

3. Click **Run** to execute the migration

## Step 2: Deploy the Edge Function

### Quick Deploy via Dashboard (Easiest Method)

1. Go to https://supabase.com/dashboard/project/opzvnmjnxiomuofduxjo/functions
2. Click **Create a new function**
3. Function name: `contact`
4. Copy and paste this code:

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    if (req.method === "POST") {
      // Submit a new contact message
      const { name, email, subject, message } = await req.json();

      if (!name || !email || !subject || !message) {
        return new Response(
          JSON.stringify({ error: "Missing required fields" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const { data, error } = await supabaseClient
        .from("contact_messages")
        .insert([
          {
            name,
            email,
            subject,
            message,
            status: "new",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      });
    }

    if (req.method === "GET") {
      // Get all contact messages (admin only)
      const { data: messages, error } = await supabaseClient
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return new Response(JSON.stringify(messages), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "PATCH") {
      // Update contact message status (admin only)
      const { id, status, resolved_by } = await req.json();

      if (!id || !status) {
        return new Response(
          JSON.stringify({ error: "Missing id or status" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const updateData: any = { status };
      if (status === "resolved") {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolved_by = resolved_by;
      }

      const { data, error } = await supabaseClient
        .from("contact_messages")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
```

5. Click **Deploy function**
6. Wait for deployment to complete

## Verification

After deployment, test the contact form:

1. **Public User**: Go to `/contact` and submit a message
2. **Admin User**: Go to `/admin/support` to see the message appear
3. **Status Updates**: Mark messages as "in progress" or "resolved"

## What Was Implemented

✅ Database table `contact_messages` with RLS policies
✅ Edge Function `/contact` with POST, GET, PATCH methods
✅ Contact service `contact.service.ts`
✅ Updated Contact page with real form submission
✅ Updated Admin Support page to manage messages
✅ Full workflow: submit → view → track → resolve

## Files Changed/Created

- `supabase/migrations/20250111_create_contact_messages.sql` - New
- `supabase/functions/contact/index.ts` - New
- `src/services/contact.service.ts` - New
- `src/pages/Contact.tsx` - Updated
- `src/pages/admin/AdminSupport.tsx` - Updated
