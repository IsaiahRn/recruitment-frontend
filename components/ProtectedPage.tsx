"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/lib/types";

type ProtectedPageProps = {
  children: ReactNode;
  allowedRoles: UserRole[];
};

export default function ProtectedPage({ children, allowedRoles }: ProtectedPageProps) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;

    if (!accessToken || !user) {
      router.replace("/login");
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      if (user.role === "APPLICANT") router.replace("/applicant");
      else if (user.role === "HR") router.replace("/hr");
      else if (user.role === "SUPER_ADMIN") router.replace("/admin");
      else router.replace("/login");
    }
  }, [hasHydrated, accessToken, user, allowedRoles, router]);

  if (!hasHydrated) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f8fb]">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-500 shadow-sm">
          Loading session...
        </div>
      </main>
    );
  }

  if (!accessToken || !user) return null;
  if (!allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
