"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";

export default function HomePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role === "APPLICANT") router.replace("/applicant");
    else if (user.role === "HR") router.replace("/hr");
    else router.replace("/admin");
  }, [router, user]);

  return null;
}
