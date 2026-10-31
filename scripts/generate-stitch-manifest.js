const fs = require('fs');
const path = require('path');

const basePath = path.join('public', 'stitch', 'merchant');
const folders = fs.readdirSync(basePath).filter(f => {
  return fs.statSync(path.join(basePath, f)).isDirectory() && f !== 'hyperlocal_commerce_merchant_design_system';
});

// Canonical order matching the 10 operational modules
const canonicalOrder = [
  // MOD-01: Onboarding (1-12)
  'merchant_registration_welcome',
  'step_1_basic_business_details_mobile_verification',
  'step_2_business_type_category',
  'step_3_pan_gst_regulatory_licenses',
  'step_4_bank_details_settlement_policy',
  'step_5_store_setup_geofence',
  'step_6_qr_kit_final_review',
  'application_successfully_submitted',
  'verification_pending_dashboard',
  'admin_requests_additional_documents',
  'application_approved_onboarding_completed',
  'application_rejected_with_reason',

  // MOD-02: Dashboard & Analytics (13-17)
  'merchant_dashboard_overview',
  'merchant_business_overview_revenue_analytics',
  'product_category_performance_analytics',
  'customer_retention_cohort_analytics',
  'delivery_operations_fleet_sla_analytics',

  // MOD-03: Catalogue & Inventory (18-21)
  'store_management_operations_profile',
  'product_catalogue_management',
  'add_edit_product_workflow_with_live_preview',
  'inventory_management_stock_ledger',

  // MOD-04: Fulfilment & Kitchen SLA (22-25)
  'live_orders_command_multi_category_pipeline',
  'order_details_restaurant_kitchen_sla_execution',
  'specialized_category_fulfilment_desk_pharmacy_rx_grocery_picking',
  'order_history_cancellation_audit_dispute_ledger',

  // MOD-05: Dispatch & Fleet (26-31)
  'delivery_management_dispatch_operations',
  'trustit_fleet_rider_assignment_broadcast_desk',
  'live_delivery_tracking_handover_verification',
  'specialized_category_dispatch_service_appointments',
  'delivery_exception_management_reassignment_desk',
  'merchant_owned_rider_management_roster',

  // MOD-06: Payments & Settlements (32-35)
  'financial_overview_settlement_command_desk',
  'order_payment_transactions_net_payable_ledger',
  'settlement_history_bank_disbursal_ledger',
  'subscriptions_store_merchandise_billing_hub',

  // MOD-07: QR & Reviews (36-39)
  'store_qr_code_management_scan_analytics_hub',
  'verified_customer_reviews_multi_channel_feedback_command_desk',
  'merchant_reputation_analytics_campaigns_google_integration',
  'customer_visit_verification_review_dispute_moderation_desk',

  // MOD-08: Notifications (40-42)
  'notification_center_overview_priority_alert_feed',
  'announcements_platform_updates_delivery_audit_history',
  'communication_preferences_multi_channel_notification_matrix',

  // MOD-09: Help Desk & Support (43-56)
  'help_support_dashboard_knowledge_base',
  'faq_knowledge_base_hub',
  'my_support_tickets_complete_ticket_history_audit_ledger',
  'ticket_details_live_chat_conversation_desk',
  'create_new_support_ticket_complaint_studio',
  'ticket_resolution_confirmation_merchant_feedback',
  'escalation_grievance_management_desk',
  'order_related_complaint_management_kitchen_sla_desk',
  'delivery_partner_3pl_fleet_complaint_center',
  'payment_settlement_dispute_center',
  'qr_code_physical_merchandise_support_desk',
  'subscription_billing_assistance',
  'kyc_merchant_verification_support',
  'refund_cancellation_assistance',

  // MOD-10: Settings & Security (57-70)
  'merchant_account_settings_business_profile',
  'personal_profile_authorized_users',
  'role_based_access_control_permissions',
  'login_security_multi_factor_authentication',
  'password_management_active_sessions',
  'bank_details_change_request',
  'bank_change_request_pending_admin_approval',
  'bank_account_details_change_request_management',
  'settlement_account_verification_audit_trail',
  'notification_preferences_communication_settings',
  'privacy_data_protection_consent_management',
  'api_keys_webhooks_developer_integrations',
  'connected_applications_third_party_integrations',
  'account_activity_security_logs_device_history'
];

console.log('Canonical order length:', canonicalOrder.length);
const unlisted = folders.filter(f => !canonicalOrder.includes(f));
console.log('Unlisted folders:', unlisted);

const modules = [
  { id: 'MOD-01', name: 'Registration & Onboarding', range: [0, 11] },
  { id: 'MOD-02', name: 'Dashboard & Core Analytics', range: [12, 16] },
  { id: 'MOD-03', name: 'Store, Catalogue & Inventory', range: [17, 20] },
  { id: 'MOD-04', name: 'Order Fulfilment & Kitchen SLA', range: [21, 24] },
  { id: 'MOD-05', name: 'Hyperlocal Dispatch & Fleet', range: [25, 30] },
  { id: 'MOD-06', name: 'Payments & Settlement Ledgers', range: [31, 34] },
  { id: 'MOD-07', name: 'Store QR & Verified Reviews', range: [35, 38] },
  { id: 'MOD-08', name: 'Notifications & Broadcasts', range: [39, 41] },
  { id: 'MOD-09', name: 'Help Desk & Support Disputes', range: [42, 55] },
  { id: 'MOD-10', name: 'Settings, RBAC & Security', range: [56, 69] }
];

function titleFromSlug(slug) {
  return slug
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace('Kyc', 'KYC')
    .replace('Gst', 'GST')
    .replace('Pan', 'PAN')
    .replace('Qr', 'QR')
    .replace('Sla', 'SLA')
    .replace('Upi', 'UPI')
    .replace('Rbac', 'RBAC')
    .replace('3pl', '3PL')
    .replace('Gmv', 'GMV');
}

const screenData = canonicalOrder.map((slug, index) => {
  const mod = modules.find(m => index >= m.range[0] && index <= m.range[1]);
  return {
    index: index + 1,
    slug,
    title: titleFromSlug(slug),
    moduleId: mod.id,
    moduleName: mod.name,
    prevSlug: index > 0 ? canonicalOrder[index - 1] : null,
    nextSlug: index < canonicalOrder.length - 1 ? canonicalOrder[index + 1] : null,
    htmlPath: '/stitch/merchant/' + slug + '/code.html',
    pngPath: '/stitch/merchant/' + slug + '/screen.png'
  };
});

fs.writeFileSync(path.join('public', 'stitch', 'merchant-screens-manifest.json'), JSON.stringify(screenData, null, 2));
console.log('Wrote merchant-screens-manifest.json with', screenData.length, 'screens.');
