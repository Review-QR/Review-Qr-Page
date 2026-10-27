"use client";

import { useState } from "react";
import type {
  ProductCatalogueItem,
  ProductOrder,
  ProductVariant,
  ShippingAddress,
} from "@/lib/product-orders/types";
import {
  createProductOrderAction,
  verifyProductOrderStatusAction,
  submitProductComplaintAction,
} from "./actions";

let cashfreeSdkPromise: Promise<void> | null = null;
function loadCashfreeSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Cashfree) return Promise.resolve();
  if (cashfreeSdkPromise) return cashfreeSdkPromise;

  cashfreeSdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) resolve();
      else reject(new Error("Cashfree checkout could not be loaded."));
    };
    script.onerror = () => reject(new Error("Cashfree checkout could not be loaded."));
    document.head.appendChild(script);
  });

  return cashfreeSdkPromise;
}

interface Props {
  merchant: {
    businessId: string;
    businessName: string;
    businessType?: string | null;
    ownerName?: string | null;
    registeredMobile?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    pincode?: string | null;
    reviewLink?: string | null;
  };
  products: ProductCatalogueItem[];
  initialOrders: ProductOrder[];
}

export default function ProductsClient({ merchant, products, initialOrders }: Props) {
  const [activeTab, setActiveTab] = useState<"catalog" | "orders" | "help">("catalog");
  const [orders, setOrders] = useState<ProductOrder[]>(initialOrders);

  // Selected product for customization modal
  const [selectedProduct, setSelectedProduct] = useState<ProductCatalogueItem | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Cart state
  const [cart, setCart] = useState<Array<{
    product: ProductCatalogueItem;
    variant: ProductVariant;
    quantity: number;
    personalization: {
      business_name: string;
      category?: string;
      tagline?: string;
      qr_target_url: string;
      approved_at: string;
    };
  }>>([]);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  // Artwork Snapshot Viewer modal
  const [viewingArtwork, setViewingArtwork] = useState<string | null>(null);

  // Complaint modal
  const [complaintOrder, setComplaintOrder] = useState<ProductOrder | null>(null);
  const [complaintReason, setComplaintReason] = useState<"damaged_in_transit" | "defective_print" | "wrong_item_received" | "qr_scan_failure" | "delayed_delivery" | "other">("damaged_in_transit");
  const [complaintDescription, setComplaintDescription] = useState("");
  const [complaintSubmitted, setComplaintSubmitted] = useState(false);

  // Shipping Address Form (Prepopulated from merchant profile)
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: merchant.ownerName || merchant.businessName || "",
    phone: merchant.registeredMobile || "",
    addressLine1: merchant.address || "",
    addressLine2: "",
    city: merchant.city || "Bahraich",
    state: merchant.state || "Uttar Pradesh",
    pinCode: merchant.pincode || "271801",
    landmark: "",
  });

  // Calculate live financial summary for cart
  const cartSubtotal = cart.reduce((sum, item) => sum + item.variant.price * item.quantity, 0);
  const hasBanner = cart.some((item) => item.product.category === "marketing_kit");
  const hasStandee = cart.some((item) => item.product.category === "standee" || item.product.category === "display");
  const isFreeShipping = cartSubtotal >= 999;
  const shippingFee = cart.length === 0 ? 0 : isFreeShipping ? 0 : hasBanner ? 149 : hasStandee ? 79 : 49;
  const taxAmount = Math.round(cartSubtotal * 0.18 * 100) / 100;
  const cartTotal = Math.round((cartSubtotal + shippingFee + taxAmount) * 100) / 100;

  function openCustomizeModal(product: ProductCatalogueItem) {
    setSelectedProduct(product);
    setSelectedVariant(product.variants?.[0] || null);
    setQuantity(1);
  }

  function handleAddToCart() {
    if (!selectedProduct || !selectedVariant) return;

    const newItem = {
      product: selectedProduct,
      variant: selectedVariant,
      quantity,
      personalization: {
        business_name: merchant.businessName,
        category: merchant.businessType || undefined,
        tagline: "Scan here to share your review on Trustit & Google",
        qr_target_url: `https://trustitreview.com/r/${merchant.businessId}`,
        approved_at: new Date().toISOString(),
      },
    };

    setCart((prev) => [...prev, newItem]);
    setSelectedProduct(null);
    setIsCheckoutOpen(true);
  }

  function removeFromCart(index: number) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleProceedToPayment() {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setCheckoutError(null);

    try {
      const payload = {
        items: cart.map((c) => ({
          productId: c.product.id,
          variantId: c.variant.id,
          quantity: c.quantity,
          personalization: c.personalization,
        })),
        shippingAddress,
      };

      const result = await createProductOrderAction(payload);
      if (!result.success || !result.paymentSessionId || !result.orderId) {
        throw new Error(result.error || "Unable to initialize order payment.");
      }

      const orderId = result.orderId;
      await loadCashfreeSdk();

      if (window.Cashfree) {
        const cashfree = window.Cashfree({ mode: "sandbox" });
        await cashfree.checkout({
          paymentSessionId: result.paymentSessionId,
          redirectTarget: "_modal",
        });

        // Re-verify immediately upon modal close
        const verification = await verifyProductOrderStatusAction(orderId);
        if (verification.isPaid) {
          setOrderSuccessMessage(`Payment successful! Order ${orderId} has been placed.`);
        } else {
          setOrderSuccessMessage(`Order ${orderId} created. We are awaiting payment confirmation.`);
        }
      } else {
        setOrderSuccessMessage(`Order created with reference ${orderId}.`);
      }

      setCart([]);
      setIsCheckoutOpen(false);
      setActiveTab("orders");

      // Refresh orders
      const updated = await fetch(`/api/merchant/orders?businessId=${encodeURIComponent(merchant.businessId)}`).then((r) => r.json()).catch(() => null);
      if (updated?.orders) setOrders(updated.orders);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Payment checkout failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmitComplaint() {
    if (!complaintOrder || !complaintDescription.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await submitProductComplaintAction({
        orderId: complaintOrder.id,
        reason: complaintReason,
        description: complaintDescription,
      });
      if (res.success) {
        setComplaintSubmitted(true);
      }
    } catch {
      // Handle error gracefully
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 mb-1.5">
            <span>📦</span> Physical Marketing Store
          </div>
          <h1 className="text-xl font-bold text-slate-900">QR Standees & Marketing Kits</h1>
          <p className="text-xs text-slate-500 mt-0.5">Order custom-printed waterproof standees and stickers delivered to your counter.</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab("catalog")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "catalog"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Catalogue
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all relative ${
                activeTab === "orders"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              My Orders ({orders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("help")}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                activeTab === "help"
                  ? "bg-white text-slate-900 shadow-sm font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Support & Help
            </button>
          </div>

          {cart.length > 0 && (
            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow transition"
            >
              <span>🛒 Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</span>
              <span className="bg-indigo-800 px-1.5 py-0.5 rounded text-[11px]">₹{cartTotal}</span>
            </button>
          )}
        </div>
      </div>

      {orderSuccessMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{orderSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setOrderSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: PRODUCT CATALOGUE */}
      {activeTab === "catalog" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => {
              const lowestPrice = product.variants && product.variants.length > 0
                ? Math.min(...product.variants.map((v) => v.price))
                : product.base_price;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  {/* Visual Preview Header */}
                  <div className="h-48 bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 p-4 flex items-center justify-center relative border-b border-slate-100">
                    <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-white/90 border border-slate-200 text-slate-700 shadow-xs">
                      {product.category}
                    </span>
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 border border-emerald-200 text-emerald-700">
                      ⚡ Dispatches in {product.estimated_dispatch_days} days
                    </span>

                    {/* Realistic Standee Mockup Render */}
                    <div className="w-28 h-36 bg-white rounded-lg shadow-md border-2 border-slate-200 flex flex-col items-center justify-between p-2 transform group-hover:scale-105 transition-transform duration-300">
                      <div className="w-full text-center">
                        <span className="text-[7px] font-black tracking-tight text-indigo-700 block truncate">TRUSTIT</span>
                        <span className="text-[8px] font-bold text-slate-800 block truncate">{merchant.businessName}</span>
                      </div>
                      <div className="w-14 h-14 bg-slate-900 rounded p-1 flex items-center justify-center">
                        <div className="w-full h-full bg-white rounded-xs flex items-center justify-center font-mono text-[8px] font-black text-slate-900">
                          QR
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500 text-[8px]">
                        ★ ★ ★ ★ ★
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-medium">Starting from</span>
                        <span className="text-lg font-extrabold text-slate-900">₹{lowestPrice}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => openCustomizeModal(product)}
                        className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-xs transition"
                      >
                        Customize & Order
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: MY ORDERS & TRACKING */}
      {activeTab === "orders" && (
        <div className="space-y-4">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <span className="text-4xl block mb-3">📦</span>
              <h3 className="text-base font-bold text-slate-900">No physical orders placed yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Select a tabletop standee or waterproof counter sticker from the catalogue to start collecting reviews on your billing desk.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("catalog")}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow transition"
              >
                Browse Catalogue
              </button>
            </div>
          ) : (
            orders.map((order) => {
              const statusColors: Record<string, string> = {
                awaiting_payment: "bg-amber-50 text-amber-700 border-amber-200",
                paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
                confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
                in_production: "bg-blue-50 text-blue-700 border-blue-200",
                quality_check: "bg-indigo-50 text-indigo-700 border-indigo-200",
                ready_to_ship: "bg-purple-50 text-purple-700 border-purple-200",
                shipped: "bg-purple-100 text-purple-800 border-purple-300",
                delivered: "bg-green-100 text-green-800 border-green-300",
                cancelled: "bg-red-50 text-red-700 border-red-200",
              };

              const statusLabels: Record<string, string> = {
                awaiting_payment: "Payment Pending",
                paid: "Order Paid & Confirmed",
                confirmed: "Confirmed",
                in_production: "In Printing & Assembly",
                quality_check: "Quality Check In Progress",
                ready_to_ship: "Ready for Dispatch",
                shipped: "Shipped via Courier",
                delivered: "Delivered",
                cancelled: "Cancelled",
              };

              return (
                <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-slate-900">{order.id}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusColors[order.status] || "bg-slate-100 text-slate-700"}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Ordered on {new Date(order.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total Amount</span>
                      <span className="text-base font-extrabold text-slate-900">₹{order.total_amount}</span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items?.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{item.product_title}</span>
                          <span className="text-slate-500 block text-[11px] mt-0.5">Variant: {item.variant_title} (Qty: {item.quantity})</span>
                        </div>
                        <span className="font-semibold text-slate-700">₹{item.total_price}</span>
                      </div>
                    ))}
                  </div>

                  {/* Courier Tracking Section if Shipped */}
                  {order.shipment && (
                    <div className="p-4 bg-purple-50/60 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 block">Courier Tracking</span>
                        <p className="text-xs text-slate-800 mt-0.5">
                          Carrier: <strong className="font-bold">{order.shipment.carrier_name}</strong> · AWB: <strong className="font-mono">{order.shipment.tracking_number}</strong>
                        </p>
                      </div>

                      {order.shipment.tracking_url && (
                        <a
                          href={order.shipment.tracking_url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-lg shadow-xs transition inline-flex items-center gap-1.5 w-fit"
                        >
                          <span>Live Tracking</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setViewingArtwork(order.id)}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 underline"
                    >
                      View Approved Standee Artwork
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setComplaintOrder(order);
                        setComplaintSubmitted(false);
                      }}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800"
                    >
                      Report Issue / Damage
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: HELP & SUPPORT */}
      {activeTab === "help" && (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Physical Standees Helpdesk</h2>
            <p className="text-xs text-slate-500 mt-1">
              Have questions about printing timelines, materials, or custom bulk orders?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xl">🛡️</span>
              <h4 className="text-xs font-bold text-slate-900">100% Waterproof Guarantee</h4>
              <p className="text-[11px] text-slate-500">
                All stickers and acrylic inserts use heavy UV-resistant lamination resistant to alcohol, spray sanitizers, and water.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xl">🔍</span>
              <h4 className="text-xs font-bold text-slate-900">Pre-Dispatch Scan QC</h4>
              <p className="text-[11px] text-slate-500">
                Every single item undergoes a strict optical barcode test before packaging to ensure customers reach your direct review page.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xl">🔄</span>
              <h4 className="text-xs font-bold text-slate-900">Transit Damage Replacement</h4>
              <p className="text-[11px] text-slate-500">
                If your acrylic or standee cracks during courier transit, upload a photo and we dispatch an instant replacement free of cost.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOMIZATION MODAL */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">{selectedProduct.name}</h3>
                <p className="text-xs text-slate-500">Personalized with your business identity and Trustit QR</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Live Standee Render Preview */}
            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-400 mb-3 uppercase tracking-wider">Live Artwork Preview</span>
              <div className="w-56 h-72 bg-white rounded-xl shadow-lg border-4 border-slate-300 flex flex-col items-center justify-between p-4 relative overflow-hidden">
                <div className="w-full text-center border-b border-slate-100 pb-2">
                  <span className="text-xs font-black tracking-widest text-indigo-700 block">TRUSTIT REVIEW</span>
                  <span className="text-sm font-bold text-slate-900 block truncate mt-0.5">{merchant.businessName}</span>
                  <span className="text-[9px] text-slate-400 block">{merchant.businessType || "Verified Business"}</span>
                </div>

                <div className="w-32 h-32 bg-slate-900 rounded-lg p-2 flex flex-col items-center justify-center">
                  <div className="w-full h-full bg-white rounded flex items-center justify-center font-mono text-xs font-black text-slate-900">
                    [ QR CODE ]
                  </div>
                </div>

                <div className="w-full text-center pt-2">
                  <div className="flex items-center justify-center gap-1 text-amber-500 text-xs mb-1">
                    ★ ★ ★ ★ ★
                  </div>
                  <span className="text-[9px] font-semibold text-slate-600 block">Scan camera to leave your 5-star review</span>
                </div>
              </div>
            </div>

            {/* Variant Selector */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-900 block">Select Size & Finish Variant</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedProduct.variants?.map((variant) => (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      selectedVariant?.id === variant.id
                        ? "border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{variant.variant_name}</span>
                      <span className="font-extrabold text-sm text-indigo-700">₹{variant.price}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-1">Material: {variant.material}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-800">Quantity:</span>
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-200 font-bold"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 font-bold text-xs text-slate-900">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-3 py-1 text-slate-600 hover:bg-slate-200 font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block font-medium">Item Subtotal</span>
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{(selectedVariant?.price || selectedProduct.base_price) * quantity}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  Add to Cart & Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT DRAWER */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Cart & Checkout</h3>
                <p className="text-xs text-slate-500">Verify delivery address and pay securely via Cashfree</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Order Items</span>
              {cart.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{item.product.name}</span>
                    <span className="text-slate-500 block text-[11px] mt-0.5">
                      {item.variant.variant_name} · Qty: {item.quantity}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">₹{item.variant.price * item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => removeFromCart(idx)}
                      className="text-red-500 hover:text-red-700 font-bold text-xs"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Delivery Address Form */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-900 block">Shipping / Delivery Address</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Contact Full Name</label>
                  <input
                    type="text"
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, fullName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                    placeholder="Recipient Name"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">10-Digit Mobile Number</label>
                  <input
                    type="tel"
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                    placeholder="9876543210"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] text-slate-500 block mb-1">Shop / Building Address</label>
                  <input
                    type="text"
                    value={shippingAddress.addressLine1}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, addressLine1: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                    placeholder="Shop No., Market Name, Street"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">City</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, city: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">PIN Code (6 digits)</label>
                  <input
                    type="text"
                    value={shippingAddress.pinCode}
                    maxLength={6}
                    onChange={(e) => setShippingAddress((prev) => ({ ...prev, pinCode: e.target.value }))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:border-indigo-600"
                    placeholder="271801"
                  />
                </div>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Courier Delivery</span>
                <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (18%)</span>
                <span>₹{taxAmount}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>Total Payable</span>
                <span className="text-indigo-700">₹{cartTotal}</span>
              </div>
            </div>

            {checkoutError && (
              <p className="text-xs text-red-600 bg-red-50 p-3 rounded-xl border border-red-200 font-medium">
                {checkoutError}
              </p>
            )}

            <button
              type="button"
              disabled={isSubmitting || cart.length === 0}
              onClick={handleProceedToPayment}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Connecting to Cashfree..." : `Pay ₹${cartTotal} via Cashfree`}
            </button>
          </div>
        </div>
      )}

      {/* VIEW ARTWORK MODAL */}
      {viewingArtwork && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Approved Standee Snapshot</h3>
              <button
                type="button"
                onClick={() => setViewingArtwork(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-200">
              <div className="w-48 h-64 bg-white rounded-xl shadow-md border-2 border-slate-200 flex flex-col items-center justify-between p-4">
                <div className="w-full text-center">
                  <span className="text-[10px] font-black tracking-widest text-indigo-700 block">TRUSTIT</span>
                  <span className="text-xs font-bold text-slate-900 block truncate">{merchant.businessName}</span>
                </div>
                <div className="w-24 h-24 bg-slate-900 rounded p-1.5 flex items-center justify-center">
                  <div className="w-full h-full bg-white rounded-xs flex items-center justify-center font-mono text-[10px] font-bold text-slate-900">
                    QR
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-[10px]">
                  ★ ★ ★ ★ ★
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              This artwork snapshot is permanently locked and sent to printing press.
            </p>
          </div>
        </div>
      )}

      {/* REPORT COMPLAINT MODAL */}
      {complaintOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Report Problem ({complaintOrder.id})</h3>
              <button
                type="button"
                onClick={() => setComplaintOrder(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {complaintSubmitted ? (
              <div className="py-6 text-center space-y-2">
                <span className="text-3xl block">✓</span>
                <h4 className="text-sm font-bold text-emerald-800">Report Received</h4>
                <p className="text-xs text-slate-500">
                  Our quality team will review your report within 24 hours. If damaged, a free replacement will be dispatched.
                </p>
                <button
                  type="button"
                  onClick={() => setComplaintOrder(null)}
                  className="mt-3 px-4 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Issue Type</label>
                  <select
                    value={complaintReason}
                    onChange={(e) => setComplaintReason(e.target.value as typeof complaintReason)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  >
                    <option value="damaged_in_transit">Damaged during courier transit (cracked acrylic/base)</option>
                    <option value="defective_print">Defective printing / blurred ink</option>
                    <option value="qr_scan_failure">QR code does not scan</option>
                    <option value="wrong_item_received">Received wrong product or variant</option>
                    <option value="delayed_delivery">Courier delayed beyond expected date</option>
                    <option value="other">Other issue</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={complaintDescription}
                    onChange={(e) => setComplaintDescription(e.target.value)}
                    placeholder="Describe the issue with your standee package..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  />
                </div>

                <button
                  type="button"
                  disabled={isSubmitting || !complaintDescription.trim()}
                  onClick={handleSubmitComplaint}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl shadow transition"
                >
                  {isSubmitting ? "Submitting..." : "Submit Complaint"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
