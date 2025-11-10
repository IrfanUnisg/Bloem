import { supabase } from "@/lib/supabase";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "new" | "in_progress" | "resolved";
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
}

export interface ContactSubmission {
  name: string;
  email: string;
  subject: string;
  message: string;
}

class ContactService {
  async submitContact(data: ContactSubmission): Promise<void> {
    const { error } = await supabase
      .from("contact_messages")
      .insert({
        name: data.name,
        email: data.email,
        subject: data.subject,
        message: data.message,
        status: "new",
      });

    if (error) throw error;
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    const { data, error } = await supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async updateMessageStatus(
    id: string,
    status: "new" | "in_progress" | "resolved",
    resolvedBy?: string
  ): Promise<void> {
    const updateData: any = { status };
    
    if (status === "resolved") {
      updateData.resolved_at = new Date().toISOString();
      updateData.resolved_by = resolvedBy;
    } else if (status === "new" || status === "in_progress") {
      // Clear resolved fields when reopening
      updateData.resolved_at = null;
      updateData.resolved_by = null;
    }

    const { error } = await supabase
      .from("contact_messages")
      .update(updateData)
      .eq("id", id);

    if (error) throw error;
  }
}

export const contactService = new ContactService();
