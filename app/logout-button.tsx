"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogout() {
    try {
      setLoading(true);
      setMessage("");

      const { error } = await supabase.auth.signOut();
      if (error) {
        setMessage("Unable to sign out. Please try again.");
        setLoading(false);
        return;
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setMessage("Unable to sign out. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        style={{
          border: "1px solid #fecaca",
          borderRadius: "8px",
          padding: "10px 14px",
          background: "#ffffff",
          color: "#b91c1c",
          fontWeight: 600,
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Signing out..." : "Sign Out"}
      </button>
      {message && <p role="status" className="mt-2 text-xs text-rose-700">{message}</p>}
    </div>
  );
}
