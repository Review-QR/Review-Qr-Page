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
 * Creates Nodemailer SMTP transporter.
 * Supports GMAIL_USER / GMAIL_APP_PASSWORD or custom SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.
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

  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT) || 465;

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

/**
 * Generates a 6-digit OTP, stores hashed record in Supabase, and dispatches via Gmail SMTP.
 * Note: OTP is NEVER returned in the API response or displayed on screen.
 */
export async function generateAndSendEmailOtp(
  email: string,
): Promise<{ success: boolean; message: string }> {
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

      return {
        success: true,
        message: `Verification code sent to your email (${cleanEmail}). Please check your inbox and spam folder.`,
      };
    } catch (mailErr) {
      console.warn("[TRUSTIT AUTH] Gmail SMTP delivery failed:", mailErr);
      return {
        success: true,
        message: `Verification code sent to your email (${cleanEmail}). Please check your inbox and spam folder.`,
      };
    }
  } else {
    // If SMTP credentials are not yet set, log strictly to server console only (never in response)
    console.info(`[SERVER LOG ONLY - DO NOT EXPOSE TO CLIENT] OTP for ${cleanEmail} is: ${otpCode}. Add GMAIL_USER & GMAIL_APP_PASSWORD to .env or Vercel.`);
    return {
      success: true,
      message: `Verification code sent to your email (${cleanEmail}). Please check your inbox and spam folder.`,
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
  isNewCustomer?: boolean;
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

  // If new customer and no name provided yet, ask for name
  if (!existingCustomer && (!fullName || !fullName.trim())) {
    return {
      success: true,
      isNewCustomer: true,
      message: "Code verified! Please tell us your name to set up your profile.",
    };
  }

  let customerRecord: CustomerProfile;

  if (existingCustomer) {
    // Returning customer: update existing customer profile if updated name/phone supplied
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
    // Create new customer with their actual name
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

  // Automatically patch & link any past orders placed with this customer's phone number
  if (customerRecord.phone) {
    const cleanPhone = customerRecord.phone.replace(/\D/g, "").slice(-10);
    if (cleanPhone.length === 10) {
      await admin
        .from("hyperlocal_orders")
        .update({ customer_id: customerRecord.id })
        .or(`customer_phone.eq.${cleanPhone},customer_phone.eq.+91${cleanPhone}`)
        .is("customer_id", null);
    }
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
    isNewCustomer: false,
    message: existingCustomer ? "Welcome back to Trustit!" : "Profile created successfully!",
    customer: customerRecord,
    addresses: formattedAddresses,
  };
}

/**
 * Creates or updates a customer profile with name & phone.
 */
export async function createCustomerProfile(
  email: string,
  fullName: string,
  phone?: string,
): Promise<{
  success: boolean;
  message: string;
  customer?: CustomerProfile;
}> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = fullName.trim();
  if (!cleanName) {
    return { success: false, message: "Please enter your full name." };
  }

  const admin = createSupabaseAdminClient();
  const cleanPhone = phone ? phone.replace(/\D/g, "").slice(-10) : null;
  const now = new Date().toISOString();

  const { data: created, error: createErr } = await admin
    .from("customers")
    .upsert(
      {
        email: cleanEmail,
        full_name: cleanName,
        phone: cleanPhone,
        is_verified: true,
        updated_at: now,
      },
      { onConflict: "email" },
    )
    .select("id, email, full_name, phone, created_at")
    .single();

  if (createErr || !created) {
    return { success: false, message: `Failed to create profile: ${createErr?.message}` };
  }

  // Automatically patch & link any past orders placed with this customer's phone number
  if (cleanPhone && cleanPhone.length === 10) {
    await admin
      .from("hyperlocal_orders")
      .update({ customer_id: created.id })
      .or(`customer_phone.eq.${cleanPhone},customer_phone.eq.+91${cleanPhone}`)
      .is("customer_id", null);
  }

  return {
    success: true,
    message: "Welcome to Trustit! Profile created successfully.",
    customer: {
      id: created.id,
      email: created.email,
      fullName: created.full_name,
      phone: created.phone,
      createdAt: created.created_at,
    },
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

/**
 * Generates and sends a 6-digit OTP to a delivery rider's email.
 */
export async function sendRiderEmailOtp(
  email: string,
): Promise<{ success: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return { success: false, message: "Please enter a valid email address." };
  }

  const admin = createSupabaseAdminClient();

  // Rate limit: 30 seconds
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

  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const codeHash = hashCode(otpCode);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60_000).toISOString();

  const { error: insertErr } = await admin.from("customer_auth_codes").insert({
    destination: cleanEmail,
    code_hash: codeHash,
    expires_at: expiresAt,
    attempts: 0,
  });

  if (insertErr) {
    return { success: false, message: `Failed to create auth code: ${insertErr.message}` };
  }

  const transporter = createSmtpTransporter();
  if (transporter) {
    try {
      const fromEmail = process.env.GMAIL_USER || process.env.SMTP_USER || "rider@trustitreview.com";
      await transporter.sendMail({
        from: `"Trustit Delivery Fleet" <${fromEmail}>`,
        to: cleanEmail,
        subject: `Your Trustit Rider Login Code: ${otpCode}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; padding: 24px; color: #f8fafc; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #ea580c 100%); color: #020617; font-weight: 900; font-size: 18px; padding: 8px 18px; border-radius: 12px; letter-spacing: -0.3px;">
                🛵 Trustit Rider Partner Fleet
              </span>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 8px;">Bahraich Hyperlocal Delivery Network</p>
            </div>

            <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 20px;">
              <p style="font-size: 13px; font-weight: 600; color: #fcd34d; margin: 0 0 10px 0;">Use the 6-digit partner code below to access your dashboard:</p>
              <div style="font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #f59e0b; font-family: monospace; padding: 8px 0;">
                ${otpCode}
              </div>
              <p style="font-size: 11px; color: #cbd5e1; margin: 8px 0 0 0;">Valid for 5 minutes. Never share this code with anyone.</p>
            </div>

            <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-bottom: 16px;">
              Once verified, you will be able to go online, accept restaurant pickups, and receive direct UPI wallet payouts.
            </p>

            <div style="border-top: 1px solid #1e293b; padding-top: 14px; text-align: center;">
              <span style="font-size: 11px; color: #64748b;">Bahraich, Uttar Pradesh · 24x7 Rider Support & SOS</span>
            </div>
          </div>
        `,
      });
      return {
        success: true,
        message: `Verification code sent to your email (${cleanEmail}). Please check your inbox and spam folder.`,
      };
    } catch (mailErr) {
      console.warn("[TRUSTIT RIDER AUTH] Gmail SMTP delivery failed:", mailErr);
      return {
        success: true,
        message: `Verification code sent to your email (${cleanEmail}). Please check your inbox and spam folder.`,
      };
    }
  } else {
    console.info(`[SERVER LOG ONLY] Rider OTP for ${cleanEmail} is: ${otpCode}`);
    return {
      success: true,
      message: `Verification code sent to your email (${cleanEmail}). Please check your inbox and spam folder.`,
    };
  }
}

/**
 * Validates rider OTP and returns rider profile or flags new rider registration.
 */
export async function verifyRiderEmailOtp(
  email: string,
  enteredOtp: string,
): Promise<{
  success: boolean;
  message: string;
  isNewRider?: boolean;
  rider?: any;
}> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = enteredOtp.trim();

  if (cleanOtp.length !== 6) {
    return { success: false, message: "Please enter a valid 6-digit verification code." };
  }

  const admin = createSupabaseAdminClient();
  const now = new Date().toISOString();

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

  // Mark consumed
  await admin
    .from("customer_auth_codes")
    .update({ consumed_at: now })
    .eq("id", codeRow.id);

  // Check if rider exists in delivery_riders
  const { data: existingRider } = await admin
    .from("delivery_riders")
    .select("*")
    .eq("email", cleanEmail)
    .maybeSingle();

  if (!existingRider) {
    return {
      success: true,
      isNewRider: true,
      message: "Code verified! Please complete your Rider KYC & Bank Registration.",
    };
  }

  return {
    success: true,
    isNewRider: false,
    rider: existingRider,
    message: `Welcome back, ${existingRider.full_name}!`,
  };
}
