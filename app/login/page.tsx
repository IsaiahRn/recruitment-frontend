"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import PasswordField from "@/components/PasswordField";
import { useAuthStore } from "@/store/auth-store";
import type { TokenResponse } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((state) => state.setSession);

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Password@123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function completeSession(data: TokenResponse) {
    setSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: data.user,
    });

    if (data.user.role === "APPLICANT") {
      router.push("/applicant");
    } else if (data.user.role === "HR") {
      router.push("/hr");
    } else {
      router.push("/admin");
    }
  }

  async function handlePasswordLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    useAuthStore.getState().clearSession();

    try {
      const { data } = await api.post<TokenResponse>("/v1/auth/login/password", {
        username,
        password,
      });
      completeSession(data);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb]">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-white lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.04),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(15,23,42,0.03),_transparent_28%)]" />

          <div className="relative z-10 flex w-full flex-col justify-between px-16 py-14 xl:px-24">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Recruitment Application
              </p>

              <br/><br/><br/><br/><br/><br/><br/><br/>

              <div className="mt-10 max-w-[520px]">
                <h1 className="text-6xl font-semibold leading-[1.05] tracking-[-0.04em] text-slate-950">
                  Automated hiring and Applicant tracking.
                </h1>

                <p className="mt-8 max-w-[470px] text-xl leading-9 text-slate-500">
                  Sign in to start identity verification, academic verification,
                  CV upload, and application submission.
                </p>
              </div>

              {/* <div className="mt-12 grid max-w-[560px] gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-base font-semibold text-slate-900">Admin</p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    System users, dashboards, and audit logs.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-base font-semibold text-slate-900">HR</p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    Application review, approvals, and decisions.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-base font-semibold text-slate-900">Applicant</p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    Identity verification, academic records, and submission.
                  </p>
                </div>
              </div> */}
            </div>

            {/* <div className="flex items-center gap-3 text-sm text-slate-400">
              <div className="h-2.5 w-2.5 rounded-full bg-brand-700" />
              Secure internal access
            </div> */}
          </div>
        </section>

        <section className="relative flex items-center justify-center bg-[#f6f8fb] px-6 py-10 sm:px-10 lg:bg-white">
          <div className="w-full max-w-[520px] rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                Sign in
              </p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-slate-950">
                Welcome back
              </h2>
              <p className="mt-3 text-base leading-7 text-slate-500">
                Use your username and password to access the platform.
              </p>
            </div>

            <form onSubmit={handlePasswordLogin} className="mt-10 space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">
                  Username
                </label>
                <input
                  // value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg text-slate-800 outline-none transition focus:border-brand-700"
                  placeholder="Username"
                />
              </div>

              <PasswordField
                label="Password"
                // value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="h-14 rounded-2xl text-lg"
              />

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              <button
                disabled={loading}
                className="h-14 w-full rounded-2xl bg-brand-700 text-lg font-semibold text-white transition hover:opacity-95 disabled:opacity-70"
              >
                {loading ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-slate-500">
                New applicant?{" "}
                <Link href="/register" className="font-semibold text-brand-700">
                  Create your account
                </Link>
              </p>

              <button
                type="button"
                className="font-medium text-slate-400"
                onClick={() => {}}
              >
                Forgot password
              </button>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:hidden">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Admin</p>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  System users and audit logs
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">HR</p>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Review and approvals
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Applicant</p>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Verification and submission
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
