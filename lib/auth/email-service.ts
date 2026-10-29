import { createHash } from "crypto";
import nodemailer from "nodemailer";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;

export interface CustomerProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  createdAt: string;
}

export interface CustomerSavedAddress {
  id: string;
  customerId: string;
  label: "Home" | "Work" | "Other" | string;
  street: string;
  landmark?: string | null;
  city: string;
  pincode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  isDefault: boolean;
}

function hashCode(code: string): string {
  return createHash("sha256").update(code.trim()).digest("hex");
}

/**
 * Creates Nodemailer Gmail SMTP transporter.
 * Supports GMAIL_USER / GMAIL_APP_PASSWORD or SMTP_USER / SMTP_PASS environment variables.
 */
function createSmtpTransporter() {
  const user =
    process.env.GMAIL_USER ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER;
  const pass =
    process.env.GMAIL_APP_PASSWORD ||
    process.env.GMAIL_APP_PASS ||
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/**
 * Generates a 6-digit OTP, stores hashed record in Supabase, and dispatches via Gmail SMTP.
 */
export async function generateAndSendEmailOtp(
  email: string,
): Promise<{ success: boolean; message: string; isSimulated?: boolean }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return { success: false, message: "Please enter a valid email address." };
  }

  const admin = createSupabaseAdminClient();

  // Rate limit: check if a valid OTP was generated in the last 30 seconds
  const thirtySecsAgo = new Date(Date.now() - 30_000).toISOString();
  const { data: recentCodes } = await admin
    .from("customer_auth_codes")
    .select("created_at")
    .eq("destination", cleanEmail)
    .gt("created_at", thirtySecsAgo)
    .limit(1);

  if (recentCodes && recentCodes.length > 0) {
    return {
      success: false,
      message: "Please wait 30 seconds before requesting another verification code.",
    };
  }

  // Generate 6-digit random code
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = hashCode(otpCode);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000).toISOString();

  // Store in database
  const { error: insertErr } = await admin.from("customer_auth_codes").insert({
    destination: cleanEmail,
    code_hash: codeHash,
    expires_at: expiresAt,
    attempts: 0,
  });

  if (insertErr) {
    return { success: false, message: `Failed to create auth code: ${insertErr.message}` };
  }

  // Attempt sending via Gmail SMTP
  const transporter = createSmtpTransporter();

  if (transporter) {
    try {
      const fromEmail = process.env.GMAIL_USER || process.env.SMTP_USER || "auth@trustitreview.com";
      await transporter.sendMail({
        from: `"Trustit Super-App" <${fromEmail}>`,
        to: cleanEmail,
        subject: `Your Trustit Verification Code: ${otpCode}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; font-weight: 900; font-size: 20px; padding: 8px 16px; border-radius: 12px; letter-spacing: -0.5px;">
                Trustit Super-App
              </span>
              <p style="color: #64748b; font-size: 13px; margin-top: 6px;">Hyperlocal Food, Grocery & Quick Delivery</p>
            </div>

            <div style="background-color: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
              <p style="font-size: 13px; font-weight: 600; color: #9a3412; margin: 0 0 10px 0;">Use the 6-digit verification code below to log in:</p>
              <div style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #ea580c; font-family: monospace; padding: 6px 0;">
                ${otpCode}
              </div>
              <p style="font-size: 11px; color: #c2410c; margin: 8px 0 0 0;">Valid for 5 minutes. Do not share this OTP with anyone.</p>
            </div>

            <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin-bottom: 16px;">
              If you did not request this login code, you can safely ignore this email.
            </p>

            <div style="border-top: 1px solid #f1f5f9; padding-top: 14px; text-align: center;">
              <span style="font-size: 11px; color: #94a3b8;">Bahraich, Uttar Pradesh · Verified Local Merchant Ecosystem</span>
            </div>
          </div>
        `,
      });

      return { success: true, message: `Verification code sent to ${cleanEmail}.` };
    } catch (mailErr) {
      console.warn("Gmail SMTP delivery notice:", mailErr);
      // Fallback response for dev environments
      return {
        success: true,
        isSimulated: true,
        message: `OTP generated for ${cleanEmail}: ${otpCode} (Gmail SMTP delivery attempted)`,
      };
    }
  } else {
    // If SMTP credentials are not yet placed in environment variables, provide seamless simulated OTP
    console.info(`[TRUSTIT AUTH OTP] Code for ${cleanEmail} is: ${otpCode}`);
    return {
      success: true,
      isSimulated: true,
      message: `Verification code generated: ${otpCode} (SMTP credentials can be added to .env)`,
    };
  }
}

/**
 * Validates the entered OTP code against the database.
 * On success, upserts the customer profile and loads their saved addresses.
 */
export async function verifyEmailOtp(
  email: string,
  enteredOtp: string,
  fullName?: string,
  phone?: string,
): Promise<{
  success: boolean;
  message: string;
  customer?: CustomerProfile;
  addresses?: CustomerSavedAddress[];
}> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = enteredOtp.trim();

  if (cleanOtp.length !== 6) {
    return { success: false, message: "Please enter a valid 6-digit verification code." };
  }

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  // Find latest active code
  const { data: codeRow, error: codeErr } = await admin
    .from("customer_auth_codes")
    .select("id, code_hash, attempts, expires_at, consumed_at")
    .eq("destination", cleanEmail)
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (codeErr || !codeRow) {
    return { success: false, message: "No active verification code found. Please request a new code." };
  }

  if (new Date(codeRow.expires_at).getTime() < Date.now()) {
    return { success: false, message: "This code has expired. Please request a fresh code." };
  }

  if (codeRow.attempts >= MAX_ATTEMPTS) {
    return { success: false, message: "Too many failed attempts. Please request a new code." };
  }

  const enteredHash = hashCode(cleanOtp);
  if (enteredHash !== codeRow.code_hash) {
    // Increment attempts
    await admin
      .from("customer_auth_codes")
      .update({ attempts: codeRow.attempts + 1 })
      .eq("id", codeRow.id);

    const remaining = MAX_ATTEMPTS - (codeRow.attempts + 1);
    return {
      success: false,
      message: `Invalid code. ${remaining > 0 ? `${remaining} attempts remaining.` : "Please request a new code."}`,
    };
  }

  // Mark code consumed
  await admin
    .from("customer_auth_codes")
    .update({ consumed_at: now })
    .eq("id", codeRow.id);

  // Check if customer already exists
  const { data: existingCustomer } = await admin
    .from("customers")
    .select("id, email, full_name, phone, created_at")
    .eq("email", cleanEmail)
    .maybeSingle();

  let customerRecord: CustomerProfile;

  if (existingCustomer) {
    // Update existing customer profile if updated name/phone supplied
    const updates: Record<string, unknown> = { updated_at: now };
    if (fullName && fullName.trim() && fullName !== "Trustit Customer") {
      updates.full_name = fullName.trim();
    }
    if (phone && phone.trim()) {
      updates.phone = phone.replace(/\D/g, "").slice(-10);
    }

    const { data: updated } = await admin
      .from("customers")
      .update(updates)
      .eq("id", existingCustomer.id)
      .select("id, email, full_name, phone, created_at")
      .single();

    customerRecord = {
      id: updated?.id || existingCustomer.id,
      email: updated?.email || existingCustomer.email,
      fullName: updated?.full_name || existingCustomer.full_name,
      phone: updated?.phone || existingCustomer.phone,
      createdAt: updated?.created_at || existingCustomer.created_at,
    };
  } else {
    // Create new customer
    const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : null;
    const nameToUse = fullName?.trim() || cleanEmail.split("@")[0] || "Trustit Customer";

    const { data: created, error: createErr } = await admin
      .from("customers")
      .insert({
        email: cleanEmail,
        full_name: nameToUse,
        phone: cleanPhone,
        is_verified: true,
      })
      .select("id, email, full_name, phone, created_at")
      .single();

    if (createErr || !created) {
      return { success: false, message: `Failed to create customer profile: ${createErr?.message}` };
    }

    customerRecord = {
      id: created.id,
      email: created.email,
      fullName: created.full_name,
      phone: created.phone,
      createdAt: created.created_at,
    };
  }

  // Fetch customer's saved addresses
  const { data: addresses } = await admin
    .from("customer_addresses")
    .select("id, customer_id, label, street, landmark, city, pincode, latitude, longitude, is_default")
    .eq("customer_id", customerRecord.id)
    .order("is_default", { ascending: false });

  const formattedAddresses: CustomerSavedAddress[] = (addresses || []).map((a) => ({
    id: a.id,
    customerId: a.customer_id,
    label: a.label,
    street: a.street,
    landmark: a.landmark,
    city: a.city,
    pincode: a.pincode,
    latitude: a.latitude,
    longitude: a.longitude,
    isDefault: a.is_default,
  }));

  return {
    success: true,
    message: "Verified successfully!",
    customer: customerRecord,
    addresses: formattedAddresses,
  };
}

/**
 * Adds or updates a saved address in the customer's address book.
 */
export async function saveCustomerAddress(
  customerId: string,
  address: {
    id?: string;
    label: string;
    street: string;
    landmark?: string;
    city?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    isDefault?: boolean;
  },
): Promise<{ success: boolean; address?: CustomerSavedAddress; error?: string }> {
  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

  if (!address.street?.trim()) {
    return { success: false, error: "Street address is required." };
  }

  // If this address is set to default, unset other defaults
  if (address.isDefault) {
    await admin
      .from("customer_addresses")
      .update({ is_default: false, updated_at: now })
      .eq("customer_id", customerId);
  }

  if (address.id) {
    // Update existing address
    const { data: updated, error } = await admin
      .from("customer_addresses")
      .update({
        label: address.label || "Home",
        street: address.street.trim(),
        landmark: address.landmark?.trim() || null,
        city: address.city || "Bahraich",
        pincode: address.pincode || null,
        latitude: address.latitude || null,
        longitude: address.longitude || null,
        is_default: Boolean(address.isDefault),
        updated_at: now,
      })
      .eq("id", address.id)
      .eq("customer_id", customerId)
      .select()
      .single();

    if (error) return { success: false, error: error.message };
    return {
      success: true,
      address: {
        id: updated.id,
        customerId: updated.customer_id,
        label: updated.label,
        street: updated.street,
        landmark: updated.landmark,
        city: updated.city,
        pincode: updated.pincode,
        latitude: updated.latitude,
        longitude: updated.longitude,
        isDefault: updated.is_default,
      },
    };
  }

  // Insert new address
  const { data: inserted, error } = await admin
    .from("customer_addresses")
    .insert({
      customer_id: customerId,
      label: address.label || "Home",
      street: address.street.trim(),
      landmark: address.landmark?.trim() || null,
      city: address.city || "Bahraich",
      pincode: address.pincode || null,
      latitude: address.latitude || null,
      longitude: address.longitude || null,
      is_default: Boolean(address.isDefault),
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };

  return {
    success: true,
    address: {
      id: inserted.id,
      customerId: inserted.customer_id,
      label: inserted.label,
      street: inserted.street,
      landmark: inserted.landmark,
      city: inserted.city,
      pincode: inserted.pincode,
      latitude: inserted.latitude,
      longitude: inserted.longitude,
      isDefault: inserted.is_default,
    },
  };
}

/**
 * Deletes a saved address from customer's address book.
 */
export async function deleteCustomerAddress(
  customerId: string,
  addressId: string,
): Promise<{ success: boolean; error?: string }> {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("customer_addresses")
    .delete()
    .eq("id", addressId)
    .eq("customer_id", customerId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
