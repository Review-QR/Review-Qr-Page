"use server";

import { randomUUID } from "node:crypto";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { safeReviewLink } from "@/lib/safe-review-link";
import { isAvailableBusinessType } from "@/lib/business-category-admin.server";
import { appConfig, type PlanId } from "@/lib/config";
import {
  getTrustitUser,
  isTrustitPhoneOtpBypassEnabled,
  isValidTrustitPassword,
  normalizeTrustitPhone,
  safeActionError,
  trustitBypassMetadataKeys,
} from "@/lib/trustit-onboarding";
import { createMerchantActionClient, createMerchantServerClient } from "@/lib/supabase-merchant-server";
import { merchantAuthEmail } from "@/lib/merchant-identity";
import {
  configuredTrustitPaymentReturnUrl,
  createCashfreeMerchantCheckoutOrder,
  verifyCashfreeMerchantOrderBySignedContext,
} from "@/lib/cashfree";
import { logTrustitCheckoutStage } from "@/lib/trustit-checkout-diagnostics";

export type ActionResult = { success: true; value?: string } | { success: false; message: string; code?: "duplicate_mobile" };

type TrustitSignupStage =
  | "create_auth_user_start"
  | "create_auth_user_success"
  | "create_auth_user_failed"
  | "phone_validation_start"
  | "phone_validation_success"
  | "phone_validation_failed"
  | "phone_canonicalization_start"
  | "phone_canonicalization_success"
  | "phone_canonicalization_failed"
  | "password_signin_start"
  | "password_signin_success"
  | "password_signin_failed"
  | "session_validation_start"
  | "session_validation_success"
  | "session_validation_failed"
  | "complete_profile_start"
  | "complete_profile_success"
  | "complete_profile_failed"
  | "signup_success";

function logTrustitSignupStage(stage: TrustitSignupStage) {
  console.info(`TRUSTIT_SIGNUP_STAGE=${stage}`);
}

async function runTrustitSignupOperation<T>(
  startStage: TrustitSignupStage,
  failureStage: TrustitSignupStage,
  operation: () => Promise<T> | PromiseLike<T>,
): Promise<T> {
  logTrustitSignupStage(startStage);
  try {
    return await operation();
  } catch (error) {
    logTrustitSignupStage(failureStage);
    throw error;
  }
}

export async function hasBlockingTrustitMerchantSession(): Promise<boolean> {
  try {
    const client = await createMerchantServerClient();
    const { data: sessionData } = await client.auth.getSession();
    if (!sessionData.session) return false;

    const { data, error } = await client.auth.getUser();
    if (error || !data.user) return true;
    const user = data.user;
    const isPendingTrustitPasswordSetup = Boolean(user.phone_confirmed_at)
      && user.app_metadata?.[trustitBypassMetadataKeys.signup] === true
      && user.app_metadata?.[trustitBypassMetadataKeys.passwordComplete] !== true;
    return !isPendingTrustitPasswordSetup;
  } catch {
    return false;
  }
}

export async function logoutTrustitMerchantSession(): Promise<ActionResult> {
  try {
    const client = await createMerchantActionClient();
    const { error } = await client.auth.signOut();
    if (error) return { success: false, message: "Could not sign out. Please try again." };
    return { success: true };
  } catch {
    return safeActionError();
  }
}

async function currentUser() {
  const result = await getTrustitUser();
  return result?.user ?? null;
}

export async function completeTrustitProfile(fullName: string, businessName: string): Promise<ActionResult> {
  const context = await getTrustitUser();
  if (!context || typeof fullName !== "string" || fullName.trim().length < 1 || fullName.trim().length > 160
    || typeof businessName !== "string" || businessName.trim().length < 1 || businessName.trim().length > 160) {
    return { success: false, message: "Verify your mobile number to continue." };
  }
  try {
    const { error } = await createSupabaseAdminClient().rpc("complete_trustit_profile", {
      p_user_id: context.user.id,
      p_full_name: fullName.trim(),
    });
    if (error) {
      const duplicate = error.message === "Mobile is already registered" || error.message === "Merchant account already exists";
      return duplicate
        ? { success: false, code: "duplicate_mobile", message: "This mobile number is already registered." }
        : { success: false, message: "Your account could not be prepared. Please try again." };
    }
    return { success: true };
  } catch {
    return safeActionError();
  }
}

async function existingMerchantForUser(userId: string) {
  const { data, error } = await createSupabaseAdminClient()
    .from("merchant_accounts")
    .select("business_id")
    .eq("user_id", userId)
    .maybeSingle();
  return !error && Boolean(data);
}

async function completeTemporaryTrustitProfile(userId: string, fullName: string): Promise<ActionResult> {
  const { error } = await runTrustitSignupOperation(
    "complete_profile_start",
    "complete_profile_failed",
    () => createSupabaseAdminClient().rpc("complete_trustit_profile", {
      p_user_id: userId,
      p_full_name: fullName,
    }),
  );
  if (!error) {
    logTrustitSignupStage("complete_profile_success");
    return { success: true };
  }
  logTrustitSignupStage("complete_profile_failed");
  const duplicate = error.message === "Mobile is already registered" || error.message === "Merchant account already exists";
  return duplicate
    ? { success: false, code: "duplicate_mobile", message: "This mobile number is already registered." }
    : { success: false, message: "Your account could not be prepared. Please try again." };
}

async function discardIncompleteTrustitUser(
  admin: ReturnType<typeof createSupabaseAdminClient>,
  userId: string,
  merchantClient?: Awaited<ReturnType<typeof createMerchantActionClient>>,
) {
  if (merchantClient) {
    try { await merchantClient.auth.signOut(); } catch { /* Best-effort session cleanup. */ }
  }
  try { await admin.auth.admin.deleteUser(userId); } catch { /* Do not expose cleanup details. */ }
}

export async function createTrustitAccountWithoutOtp(input: {
  businessName: string;
  fullName: string;
  mobile: string;
  password: string;
}): Promise<ActionResult> {
  if (!isTrustitPhoneOtpBypassEnabled()) {
    return { success: false, message: "Please use the mobile verification steps to continue." };
  }

  const businessName = typeof input?.businessName === "string" ? input.businessName.trim() : "";
  const fullName = typeof input?.fullName === "string" ? input.fullName.trim() : "";
  const phone = normalizeTrustitPhone(input?.mobile);
  const password = typeof input?.password === "string" ? input.password : "";
  if (!businessName || businessName.length > 160 || !fullName || fullName.length > 160 || !phone) {
    return { success: false, message: "Enter a valid business name, owner name, and mobile number." };
  }
  if (!isValidTrustitPassword(password, password)) {
    return { success: false, message: "Password must be 6–16 characters and include a letter and a number." };
  }

  let admin: ReturnType<typeof createSupabaseAdminClient> | null = null;
  let merchantClient: Awaited<ReturnType<typeof createMerchantActionClient>> | undefined;
  let createdUserId: string | null = null;
  try {
    const signupMerchantClient = await createMerchantActionClient();
    merchantClient = signupMerchantClient;
    const { data: sessionData, error: sessionError } = await signupMerchantClient.auth.getSession();
    if (sessionError) return { success: false, message: "Please try again to continue." };
    if (sessionData.session) {
      // A stored session must be validated with Auth before it can be resumed.
      const { data: authData, error: authError } = await signupMerchantClient.auth.getUser();
      if (authError || !authData.user) return { success: false, message: "Please sign in again to continue." };
      const user = authData.user;
      const isPendingNewTrustitUser = user.app_metadata?.[trustitBypassMetadataKeys.signup] === true
        && user.app_metadata?.[trustitBypassMetadataKeys.passwordComplete] !== true
        && user.phone_confirmed_at
        && normalizeTrustitPhone(user.phone) === phone;
      if (!isPendingNewTrustitUser) {
        return { success: false, code: "duplicate_mobile", message: "This mobile number is already registered." };
      }
      if (await existingMerchantForUser(user.id)) {
        return { success: false, code: "duplicate_mobile", message: "This mobile number is already registered." };
      }
      return completeTemporaryTrustitProfile(user.id, fullName);
    }

    const signupAdmin = createSupabaseAdminClient();
    admin = signupAdmin;
    const email = merchantAuthEmail(phone);
    const { data: created, error: createError } = await runTrustitSignupOperation(
      "create_auth_user_start",
      "create_auth_user_failed",
      () => signupAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
        phone,
        phone_confirm: true,
        password,
        app_metadata: {
          [trustitBypassMetadataKeys.signup]: true,
          [trustitBypassMetadataKeys.passwordComplete]: true,
        },
        user_metadata: { full_name: fullName },
      }),
    );

    let userId = created.user?.id;
    if (createError) {
      logTrustitSignupStage("create_auth_user_failed");
      return createError.code === "phone_exists" || createError.code === "email_exists"
        ? { success: false, code: "duplicate_mobile", message: "This mobile number is already registered." }
        : { success: false, message: "Your account could not be created. Please try again." };
    }

    if (!userId) {
      logTrustitSignupStage("create_auth_user_failed");
      return { success: false, message: "Your account could not be created. Please try again." };
    }
    logTrustitSignupStage("create_auth_user_success");
    createdUserId = userId;
    const { data: authRecord, error: authRecordError } = await runTrustitSignupOperation(
      "phone_validation_start",
      "phone_validation_failed",
      () => signupAdmin.auth.admin.getUserById(userId),
    );
    const authUser = authRecord.user;
    const authPhone = normalizeTrustitPhone(authUser?.phone);
    if (authRecordError || authUser?.id !== userId || !authPhone || authPhone !== phone || !authUser.phone_confirmed_at) {
      logTrustitSignupStage("phone_validation_failed");
      await discardIncompleteTrustitUser(signupAdmin, userId, signupMerchantClient);
      createdUserId = null;
      return { success: false, message: "Your account was created but could not be signed in. Please contact support." };
    }
    logTrustitSignupStage("phone_validation_success");

    if (authUser.phone !== phone) {
      const canonicalizationSucceeded = await runTrustitSignupOperation(
        "phone_canonicalization_start",
        "phone_canonicalization_failed",
        async () => {
          const { error: canonicalPhoneError } = await signupAdmin.auth.admin.updateUserById(userId, {
            phone,
            phone_confirm: true,
          });
          if (canonicalPhoneError) return false;

          const { data: canonicalRecord, error: canonicalRecordError } = await signupAdmin.auth.admin.getUserById(userId);
          const canonicalUser = canonicalRecord.user;
          const canonicalPhone = normalizeTrustitPhone(canonicalUser?.phone);
          return !canonicalRecordError && canonicalUser?.id === userId && Boolean(canonicalPhone)
            && canonicalPhone === phone && Boolean(canonicalUser.phone_confirmed_at);
        },
      );
      if (!canonicalizationSucceeded) {
        logTrustitSignupStage("phone_canonicalization_failed");
        await discardIncompleteTrustitUser(signupAdmin, userId, signupMerchantClient);
        createdUserId = null;
        return { success: false, message: "Your account was created but could not be signed in. Please contact support." };
      }
      logTrustitSignupStage("phone_canonicalization_success");
    }

    const { data: signedIn, error: signInError } = await runTrustitSignupOperation(
      "password_signin_start",
      "password_signin_failed",
      () => signupMerchantClient.auth.signInWithPassword({ email, password }),
    );
    if (signInError) {
      logTrustitSignupStage("password_signin_failed");
      await discardIncompleteTrustitUser(signupAdmin, userId, signupMerchantClient);
      createdUserId = null;
      return { success: false, message: "Your account was created but could not be signed in. Please contact support." };
    }
    logTrustitSignupStage("password_signin_success");

    logTrustitSignupStage("session_validation_start");
    if (!signedIn.session || signedIn.user?.id !== userId || signedIn.session.user.id !== userId) {
      logTrustitSignupStage("session_validation_failed");
      await discardIncompleteTrustitUser(signupAdmin, userId, signupMerchantClient);
      createdUserId = null;
      return { success: false, message: "Your account was created but could not be signed in. Please contact support." };
    }
    logTrustitSignupStage("session_validation_success");

    const profile = await completeTemporaryTrustitProfile(userId, fullName);
    if (!profile.success) {
      await discardIncompleteTrustitUser(admin, userId, merchantClient);
      createdUserId = null;
      return profile;
    }
    logTrustitSignupStage("signup_success");
    return profile;
  } catch {
    if (admin && createdUserId) await discardIncompleteTrustitUser(admin, createdUserId, merchantClient);
    return safeActionError();
  }
}

export async function completeTrustitBypassPassword(input: {
  password: string;
  confirmation: string;
}): Promise<ActionResult> {
  const password = typeof input?.password === "string" ? input.password : "";
  const confirmation = typeof input?.confirmation === "string" ? input.confirmation : "";
  if (!isValidTrustitPassword(password, confirmation)) {
    return { success: false, message: "Check your password and try again." };
  }

  try {
    const client = await createMerchantActionClient();
    const { data, error } = await client.auth.getUser();
    const user = data.user;
    if (error || !user?.phone_confirmed_at
      || user.app_metadata?.[trustitBypassMetadataKeys.signup] !== true
      || user.app_metadata?.[trustitBypassMetadataKeys.passwordComplete] === true) {
      return { success: false, message: "This account cannot complete password setup. Please start again or contact support." };
    }

    const { error: passwordError } = await client.auth.updateUser({ password });
    if (passwordError) return { success: false, message: "Password could not be saved. Please try again." };

    const admin = createSupabaseAdminClient();
    const { error: metadataError } = await admin.auth.admin.updateUserById(user.id, {
      app_metadata: {
        ...user.app_metadata,
        [trustitBypassMetadataKeys.signup]: true,
        [trustitBypassMetadataKeys.passwordComplete]: true,
      },
    });
    if (metadataError) return { success: false, message: "Password could not be confirmed. Please try again." };
    return { success: true };
  } catch {
    return safeActionError();
  }
}

export async function completeTrustitOtpPassword(password: string): Promise<ActionResult> {
  if (typeof password !== "string" || !isValidTrustitPassword(password, password)) {
    return { success: false, message: "Use a password of 6–16 characters with a letter and a number." };
  }

  try {
    const client = await createMerchantActionClient();
    const { data, error } = await client.auth.getUser();
    const user = data.user;
    if (error || !user?.phone_confirmed_at
      || user.app_metadata?.[trustitBypassMetadataKeys.signup] === true) {
      return { success: false, message: "Verify your mobile number to continue." };
    }

    const { error: passwordError } = await client.auth.updateUser({ password });
    if (passwordError) return { success: false, message: "Password could not be saved. Please try again." };
    return { success: true };
  } catch {
    return safeActionError();
  }
}

export async function saveTrustitBusiness(input: {
  name: string; type: string; address: string; reviewLink: string;
}): Promise<ActionResult> {
  const user = await currentUser();
  const name = input?.name?.trim();
  const address = input?.address?.trim();
  const reviewLink = input?.reviewLink?.trim() ? safeReviewLink(input.reviewLink) : null;
  if (!user || !name || name.length > 160 || typeof input?.type !== "string" || !address || address.length > 1000 || (input?.reviewLink?.trim() && !reviewLink) || !(await isAvailableBusinessType(input.type))) {
    return { success: false, message: "Please check the business details and Google Review link if provided." };
  }
  try {
    const { data, error } = await createSupabaseAdminClient().rpc("create_trustit_business_for_onboarding", {
      p_user_id: user.id, p_name: name, p_type: input.type, p_address: address, p_review_link: reviewLink,
    });
    if (error || typeof data !== "string") return { success: false, message: "Your registration session may have expired. Please start again." };
    return { success: true, value: data };
  } catch { return safeActionError(); }
}

export async function selectTrustitPlan(planId: string): Promise<ActionResult> {
  const user = await currentUser();
  if (!user || !Object.hasOwn(appConfig.plans, planId)) return { success: false, message: "Select an available plan." };
  try {
    const { error } = await createSupabaseAdminClient().rpc("select_trustit_plan", { p_user_id: user.id, p_plan: appConfig.plans[planId as PlanId].name });
    return error ? { success: false, message: "Your registration session may have expired. Please start again." } : { success: true };
  } catch { return safeActionError(); }
}

export async function createTrustitOneTimeCheckout(): Promise<ActionResult & { orderId?: string; paymentSessionId?: string; checkoutMode?: "sandbox" | "production" }> {
  const context = await getTrustitUser();
  if (!context) return { success: false, message: "Please sign in to continue." };
  try {
    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc("prepare_trustit_payment", { p_user_id: context.user.id, p_payment_mode: "one_time" });
    const prepared = Array.isArray(data) ? data[0] as { business_id?: unknown; plan?: unknown; mobile?: unknown; full_name?: unknown; payment_reference?: unknown } | undefined : undefined;
    if (error || !prepared || typeof prepared.business_id !== "string" || typeof prepared.plan !== "string" || typeof prepared.mobile !== "string") return { success: false, message: "Your registration session may have expired. Please start again." };
    const planId = (Object.keys(appConfig.plans) as PlanId[]).find((id) => appConfig.plans[id].name === prepared.plan);
    if (!planId) return safeActionError();
    logTrustitCheckoutStage("return_url_validation_start");
    const returnUrl = configuredTrustitPaymentReturnUrl();
    if (!returnUrl) {
      logTrustitCheckoutStage("return_url_validation_failed");
      return { success: false, message: "Payment service is temporarily unavailable. Please try again." };
    }
    logTrustitCheckoutStage("return_url_validation_success");
    const proposedOrderId = `rqr_${randomUUID().replaceAll("-", "")}`;
    logTrustitCheckoutStage("order_reservation_start");
    let reserved: Awaited<ReturnType<typeof admin.rpc>>;
    try {
      reserved = await admin.rpc("reserve_trustit_one_time_order", { p_user_id: context.user.id, p_order_id: proposedOrderId });
    } catch (error) {
      logTrustitCheckoutStage("order_reservation_failed");
      throw error;
    }
    const reservation = Array.isArray(reserved.data) ? reserved.data[0] as { payment_reference?: unknown; is_new?: unknown } | undefined : undefined;
    if (reserved.error || typeof reservation?.payment_reference !== "string") {
      logTrustitCheckoutStage("order_reservation_failed");
      return safeActionError();
    }
    logTrustitCheckoutStage("order_reservation_success");
    const order = await createCashfreeMerchantCheckoutOrder({ planId, businessId: prepared.business_id, orderId: reservation.payment_reference, customerName: typeof prepared.full_name === "string" ? prepared.full_name : undefined, customerPhone: prepared.mobile.replace(/^\+/, ""), returnUrl, diagnosticScope: "trustit_registration" });
    if (!order.success) return { success: false, message: order.error };
    logTrustitCheckoutStage("payment_session_recording_start");
    let recorded: Awaited<ReturnType<typeof admin.rpc>>;
    try {
      recorded = await admin.rpc("record_trustit_payment_session", { p_user_id: context.user.id, p_payment_reference: order.orderId, p_payment_session_id: order.paymentSessionId });
    } catch (error) {
      logTrustitCheckoutStage("payment_session_recording_failed");
      throw error;
    }
    if (recorded.error) {
      logTrustitCheckoutStage("payment_session_recording_failed");
      return { success: false, message: "Payment setup could not be saved. Please try again." };
    }
    logTrustitCheckoutStage("payment_session_recording_success");
    return { success: true, orderId: order.orderId, paymentSessionId: order.paymentSessionId, checkoutMode: order.environment };
  } catch { return safeActionError(); }
}

export type TrustitPaymentVerificationResult =
  | { success: true; value?: string }
  | { success: false; message: string; status: "pending" | "failed" | "error" };

export async function verifyTrustitOneTimePayment(orderId: string): Promise<TrustitPaymentVerificationResult> {
  const context = await getTrustitUser();
  if (!context || typeof orderId !== "string" || !/^rqr_[a-f0-9]{32}$/.test(orderId)) return { success: false, status: "error", message: "We could not verify this payment. Please return to your registration and try again." };
  try {
    // Registration orders are bound to a pending business rather than an active merchant.
    // Resolve the server-owned onboarding link before applying the verified payment.
    const admin = createSupabaseAdminClient();
    const { data: session, error: lookupError } = await admin.from("onboarding_sessions").select("business_id, selected_plan, user_id").eq("payment_reference", orderId).eq("user_id", context.user.id).maybeSingle();
    if (lookupError || !session?.business_id || !session.selected_plan || session.user_id !== context.user.id) return { success: false, status: "error", message: "We could not verify this payment. Please return to your registration and try again." };
    const verifiedOwned = await verifyCashfreeMerchantOrderBySignedContext({ orderId, authenticatedBusinessId: session.business_id });
    if (verifiedOwned.status === "NOT_SUCCESS") {
      return verifiedOwned.terminalFailure
        ? { success: false, status: "failed", message: "Payment was not completed. You can try again." }
        : { success: false, status: "pending", message: "Payment confirmation is still pending." };
    }
    if (verifiedOwned.status !== "VERIFIED_SUCCESS" || appConfig.plans[verifiedOwned.planId].name !== session.selected_plan) return { success: false, status: "error", message: "We could not verify this payment. Please return to your registration and try again." };
    const { data, error } = await admin.rpc("finalize_trustit_one_time_payment", {
      p_business_id: session.business_id, p_cashfree_order_id: orderId,
      p_plan: session.selected_plan, p_amount: verifiedOwned.amount,
      p_currency: verifiedOwned.currency, p_paid_at: verifiedOwned.paidAt,
    });
    if (error || !Array.isArray(data) || !data[0]) return { success: false, status: "pending", message: "Payment confirmation is still pending." };
    return { success: true, value: String((data[0] as { result?: unknown }).result ?? "applied") };
  } catch { return { success: false, status: "pending", message: "Payment confirmation is still pending." }; }
}

export async function getTrustitResumeState() {
  const user = await currentUser();
  if (!user) return null;
  try {
    const { data } = await createSupabaseAdminClient().from("onboarding_sessions").select("current_step, business_id, selected_plan, payment_mode, payment_reference, status").eq("user_id", user.id).in("status", ["in_progress", "payment_pending", "completed"]).order("created_at", { ascending: false }).limit(1).maybeSingle();
    return data;
  } catch { return null; }
}
