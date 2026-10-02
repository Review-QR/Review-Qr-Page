"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

const dismissedKey = "trustit-install-dismissed-at";
const reminderDays = 30;

export default function InstallTrustitPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if ("serviceWorker" in navigator) void navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches
      || ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const dismissedAt = Number(window.localStorage.getItem(dismissedKey) || 0);
    const canRemind = Date.now() - dismissedAt > reminderDays * 24 * 60 * 60 * 1000;
    if (isStandalone || !canRemind) return;

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallPromptEvent);
      setVisible(true);
    };
    const onInstalled = () => { setVisible(false); setInstallEvent(null); };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    if (isIos) {
      setIosHelp(true);
      const timer = window.setTimeout(() => setVisible(true), 1200);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", onBeforeInstall);
        window.removeEventListener("appinstalled", onInstalled);
      };
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem(dismissedKey, String(Date.now()));
    setVisible(false);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const choice = await installEvent.userChoice;
    setInstallEvent(null);
    if (choice.outcome === "accepted") setVisible(false);
    else dismiss();
  }

  if (!visible) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/40 p-3 backdrop-blur-[2px] sm:items-center sm:p-6" role="presentation">
      <section role="dialog" aria-modal="true" aria-labelledby="trustit-install-title" className="w-full max-w-md animate-[trustit-pop-in_220ms_ease-out] rounded-3xl border border-amber-100 bg-[#fffdf8] p-6 text-[#172b3b] shadow-2xl sm:p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#173b48] text-xl font-bold text-amber-200" aria-hidden="true">T</div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Welcome to Trustit</p>
        <h2 id="trustit-install-title" className="mt-2 text-2xl font-bold tracking-tight">Your business is ready to go.</h2>
        <h3 className="mt-4 text-lg font-semibold">Add Trustit to your Home Screen</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Get quick access to your dashboard, QR codes and customer insights.</p>
        {iosHelp && <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm leading-5 text-slate-700">Open the Share menu → Add to Home Screen</p>}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {installEvent && <button type="button" onClick={install} className="min-h-11 rounded-xl bg-[#173b48] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#214e5d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">Add Trustit</button>}
          <button type="button" onClick={dismiss} className="min-h-11 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2">Maybe Later</button>
        </div>
      </section>
    </div>
  );
}
