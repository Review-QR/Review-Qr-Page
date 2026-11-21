import { NextRequest, NextResponse } from "next/server";
import { enforceRateLimit } from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

/**
 * Contact form API endpoint.
 * Stores contact messages in Supabase.
 * POST /api/contact
 * Body: { name, email, phone, subject, message }
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimited = enforceRateLimit(request, "contact_form", 5, 3_600_000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const name = (body.name ?? "").trim();
    const email = (body.email ?? "").trim().toLowerCase();
    const phone = (body.phone ?? "").replace(/\D/g, "").slice(-10);
    const subject = (body.subject ?? "General Inquiry").trim().slice(0, 100);
    const message = (body.message ?? "").trim();

    // Validation
    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, error: "Please enter your name (at least 2 characters)." },
        { status: 400 }
      );
    }

    if (message.length < 10) {
      return NextResponse.json(
        { success: false, error: "Message must be at least 10 characters." },
        { status: 400 }
      );
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Store in Supabase (if admin client is available)
    try {
      const { createSupabaseAdminClient } = await import("@/lib/supabase-admin");
      const admin = createSupabaseAdminClient();
      await admin.from("contact_messages").insert({
        name,
        email: email || null,
        phone: phone || null,
        subject,
        message,
      });
    } catch {
      // If table doesn't exist yet, still accept the message
      // Log for manual processing
      console.log("[contact-form]", { name, email, subject, message: message.slice(0, 100) });
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! We've received your message and will get back to you within 24 hours.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to process contact form";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
