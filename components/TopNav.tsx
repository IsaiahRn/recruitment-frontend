"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function TopNav() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);

  return (
    <div className="mb-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Recruitment Application</p>
        <p className="text-lg font-semibold text-brand-800">Welcome back, {user?.fullName}</p>
      </div>
      <button
        onClick={() => {
          clearSession();
          router.replace("/login");
        }}
        className="rounded-xl bg-brand-700 px-4 py-2 text-sm font-semibold text-white"
      >
        Sign out
      </button>
    </div>
  );
}
