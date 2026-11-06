import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status") || "all";
    const admin = createSupabaseAdminClient();

    let query = admin
      .from("delivery_riders")
      .select("*")
      .order("created_at", { ascending: false });

    if (statusFilter === "pending") {
      query = query.eq("kyc_status", "pending");
    } else if (statusFilter === "approved") {
      query = query.eq("kyc_status", "approved");
    } else if (statusFilter === "rejected") {
      query = query.eq("kyc_status", "rejected");
    }

    const { data: riders, error } = await query.limit(100);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Process riders to normalize virtual status (action_required if pending with correction note)
    const enrichedRiders = (riders || []).map((r) => {
      const isActionRequired =
        r.kyc_status === "pending" &&
        Boolean(r.rejection_reason || (r.admin_notes && r.admin_notes.includes("CORRECTION_REQUESTED")));

      return {
        ...r,
        display_status: isActionRequired ? "action_required" : r.kyc_status || "pending",
      };
    });

    const pendingCount = enrichedRiders.filter((r) => r.display_status === "pending").length;
    const actionRequiredCount = enrichedRiders.filter((r) => r.display_status === "action_required").length;
    const approvedCount = enrichedRiders.filter((r) => r.kyc_status === "approved").length;
    const rejectedCount = enrichedRiders.filter((r) => r.kyc_status === "rejected").length;

    return NextResponse.json({
      success: true,
      stats: {
        total: enrichedRiders.length,
        pending: pendingCount,
        actionRequired: actionRequiredCount,
        approved: approvedCount,
        rejected: rejectedCount,
      },
      riders: enrichedRiders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, riderId } = body;

    if (!riderId) {
      return NextResponse.json({ success: false, error: "riderId is required" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();

    // ── 1. APPROVE RIDER ──
    if (action === "approve_rider") {
      const { error } = await admin
        .from("delivery_riders")
        .update({
          kyc_status: "approved",
          is_verified: true,
          rejection_reason: null,
          admin_notes: "Approved by Admin verification team",
          updated_at: new Date().toISOString(),
        })
        .eq("id", riderId);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Rider approved successfully. Training & Shift unlocked.",
      });
    }

    // ── 2. REQUEST CORRECTION (Send back to rider) ──
    if (action === "request_correction") {
      const { reason, note, fields } = body;
      const cleanReason = String(reason || "विवरण में सुधार आवश्यक").trim();
      const cleanNote = String(note || cleanReason).trim();

      const { error } = await admin
        .from("delivery_riders")
        .update({
          kyc_status: "pending",
          rejection_reason: cleanReason,
          admin_notes: `CORRECTION_REQUESTED: ${cleanNote} | Fields: ${(fields || []).join(",")}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", riderId);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Correction request sent to rider app.",
      });
    }

    // ── 3. DIRECT EDIT BY ADMIN ──
    if (action === "edit_rider") {
      const {
        fullName,
        phone,
        residentialAddress,
        pincode,
        vehicleType,
        vehicleNumber,
        drivingLicenseNumber,
        upiId,
        autoApprove,
      } = body;

      const updateData: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (fullName) updateData.full_name = String(fullName).trim();
      if (phone) updateData.phone = String(phone).trim();
      if (residentialAddress) updateData.residential_address = String(residentialAddress).trim();
      if (pincode) updateData.pincode = String(pincode).trim();
      if (vehicleType) updateData.vehicle_type = String(vehicleType).trim();
      if (vehicleNumber) updateData.vehicle_number = String(vehicleNumber).toUpperCase().trim();
      if (drivingLicenseNumber) updateData.driving_license_number = String(drivingLicenseNumber).toUpperCase().trim();
      if (upiId) updateData.upi_id = String(upiId).trim();

      if (autoApprove) {
        updateData.kyc_status = "approved";
        updateData.is_verified = true;
        updateData.rejection_reason = null;
        updateData.admin_notes = "Edited and approved directly by Admin";
      } else {
        updateData.admin_notes = "Updated by Admin";
      }

      const { error } = await admin
        .from("delivery_riders")
        .update(updateData)
        .eq("id", riderId);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: autoApprove
          ? "Rider details updated & approved successfully."
          : "Rider details updated successfully.",
      });
    }

    // ── 4. REJECT RIDER ──
    if (action === "reject_rider") {
      const { reason } = body;
      const cleanReason = String(reason || "Application rejected due to document mismatch").trim();

      const { error } = await admin
        .from("delivery_riders")
        .update({
          kyc_status: "rejected",
          is_verified: false,
          rejection_reason: cleanReason,
          admin_notes: `Rejected by Admin: ${cleanReason}`,
          updated_at: new Date().toISOString(),
        })
        .eq("id", riderId);

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: "Rider application rejected.",
      });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
