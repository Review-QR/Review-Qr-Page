/**
 * Trustit Hyperlocal Merchant Platform
 * ESC/POS & Web Thermal Printer Integration (58mm & 80mm)
 * Compatible with Epson, Everycom, TVS, Posiflex, NGX Bluetooth/USB thermal printers.
 */

export interface PrintableOrderItem {
  name: string;
  quantity: number;
  price: number;
  notes?: string | null;
}

export interface PrintableReceiptData {
  businessName: string;
  orderNumber: string;
  displayCode: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  orderType: "delivery" | "dine_in" | "takeaway";
  tableNumber?: string | null;
  items: PrintableOrderItem[];
  subtotal: number;
  tax?: number;
  deliveryFee?: number;
  total: number;
  paymentMode: "online" | "cod";
  paymentStatus: "paid" | "pending";
  dateFormatted?: string;
}

/**
 * Generates clean, printer-optimized HTML for 58mm (2-inch) or 80mm (3-inch) receipt rolls
 */
export function generateThermalReceiptHtml(
  data: PrintableReceiptData,
  paperWidth: "58mm" | "80mm" = "80mm"
): string {
  const is58 = paperWidth === "58mm";
  const rollWidth = is58 ? "48mm" : "72mm";
  const pageMargin = is58 ? "2mm" : "4mm";

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>KOT Receipt - ${data.displayCode}</title>
  <style>
    @page {
      size: ${is58 ? "58mm auto" : "80mm auto"};
      margin: 0;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Courier New', Courier, monospace, -apple-system;
      color: #000000;
      background: #ffffff;
      width: ${rollWidth};
      margin: 0 auto;
      padding: ${pageMargin};
      font-size: ${is58 ? "11px" : "13px"};
      line-height: 1.25;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .uppercase { text-transform: uppercase; }
    .divider {
      border-top: 1px dashed #000;
      margin: 5px 0;
    }
    .double-divider {
      border-top: 2px solid #000;
      margin: 6px 0;
    }
    .header-title {
      font-size: ${is58 ? "15px" : "18px"};
      font-weight: 900;
      letter-spacing: -0.5px;
    }
    .order-badge {
      display: inline-block;
      padding: 2px 6px;
      font-size: ${is58 ? "12px" : "14px"};
      font-weight: 900;
      border: 1px solid #000;
      margin: 3px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 4px 0;
    }
    th {
      border-bottom: 1px solid #000;
      padding: 3px 0;
      text-align: left;
      font-size: ${is58 ? "10px" : "12px"};
    }
    td {
      padding: 3px 0;
      vertical-align: top;
    }
    .total-row {
      font-size: ${is58 ? "13px" : "16px"};
      font-weight: 900;
    }
    .footer-note {
      font-size: ${is58 ? "9px" : "11px"};
      margin-top: 6px;
    }
  </style>
</head>
<body>
  <div class="text-center">
    <div class="header-title">${data.businessName}</div>
    <div style="font-size: 10px; margin-top: 2px;">TRUSTIT MERCHANT NETWORK</div>
    <div class="order-badge">#${data.displayCode}</div>
    <div>${data.orderType === "dine_in" ? `TABLE: ${data.tableNumber || "Main Dining"}` : data.orderType === "delivery" ? "DOORSTEP DELIVERY" : "TAKEAWAY PARCEL"}</div>
    <div style="font-size: 10px;">${data.dateFormatted || new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>
  </div>

  <div class="divider"></div>

  ${data.customerName ? `<div><strong>Customer:</strong> ${data.customerName}</div>` : ""}
  ${data.customerPhone ? `<div><strong>Phone:</strong> ${data.customerPhone}</div>` : ""}
  ${data.deliveryAddress ? `<div style="font-size: 10px;"><strong>Address:</strong> ${data.deliveryAddress}</div>` : ""}

  <div class="divider"></div>

  <table>
    <thead>
      <tr>
        <th style="width: 15%;">QTY</th>
        <th style="width: 55%;">ITEM</th>
        <th style="width: 30%;" class="text-right">AMT</th>
      </tr>
    </thead>
    <tbody>
      ${data.items
        .map(
          (item) => `<tr>
            <td class="font-bold">${item.quantity}x</td>
            <td>
              <div>${item.name}</div>
              ${item.notes ? `<div style="font-size: 9px; font-style: italic;">Note: ${item.notes}</div>` : ""}
            </td>
            <td class="text-right">₹${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`
        )
        .join("")}
    </tbody>
  </table>

  <div class="divider"></div>

  <table>
    <tr>
      <td>Subtotal:</td>
      <td class="text-right">₹${data.subtotal.toFixed(2)}</td>
    </tr>
    ${data.tax ? `<tr><td>Taxes & GST:</td><td class="text-right">₹${data.tax.toFixed(2)}</td></tr>` : ""}
    ${data.deliveryFee ? `<tr><td>Delivery Fee:</td><td class="text-right">₹${data.deliveryFee.toFixed(2)}</td></tr>` : ""}
  </table>

  <div class="double-divider"></div>

  <table class="total-row">
    <tr>
      <td>TOTAL:</td>
      <td class="text-right">₹${data.total.toFixed(2)}</td>
    </tr>
  </table>

  <div class="double-divider"></div>

  <div class="text-center font-bold" style="margin: 4px 0;">
    [ ${data.paymentStatus === "paid" ? `PAID ONLINE (CASHFREE UPI)` : `COLLECT CASH ON DELIVERY (₹${data.total})`} ]
  </div>

  <div class="divider"></div>

  <div class="text-center footer-note">
    <div>Scan standee QR on counter to leave review!</div>
    <div style="font-weight: bold; margin-top: 2px;">Powered by Trustit Hyperlocal</div>
  </div>
</body>
</html>`;
}

/**
 * Triggers direct browser thermal printing for Bluetooth or USB printer
 */
export function triggerThermalPrint(
  data: PrintableReceiptData,
  paperWidth: "58mm" | "80mm" = "80mm"
): boolean {
  try {
    const html = generateThermalReceiptHtml(data, paperWidth);
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return false;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        try {
          printWindow.close();
        } catch {}
      }, 1000);
    }, 400);

    return true;
  } catch (err) {
    console.error("Thermal printer trigger error:", err);
    return false;
  }
}
