const DASHBOARD_URL = "https://trustitreview.com/merchant/dashboard";
const QR_URL = "https://trustitreview.com/merchant/dashboard/qr";

document.addEventListener("DOMContentLoaded", () => {
  const btnDashboard = document.getElementById("btn-open-dashboard");
  const btnQr = document.getElementById("btn-open-qr");
  const btnCopy = document.getElementById("btn-copy-link");
  const copyBtnText = document.getElementById("copy-btn-text");

  // Open Full Dashboard
  btnDashboard?.addEventListener("click", () => {
    chrome.tabs.create({ url: DASHBOARD_URL });
  });

  // Open QR Standees
  btnQr?.addEventListener("click", () => {
    chrome.tabs.create({ url: QR_URL });
  });

  // Copy Review Link
  btnCopy?.addEventListener("click", async () => {
    const link = "https://trustitreview.com";
    try {
      await navigator.clipboard.writeText(link);
      if (copyBtnText) {
        const orig = copyBtnText.textContent;
        copyBtnText.textContent = "✓ Link Copied!";
        setTimeout(() => {
          copyBtnText.textContent = orig;
        }, 2000);
      }
    } catch {
      chrome.tabs.create({ url: DASHBOARD_URL });
    }
  });
});
