"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import PasswordField from "@/components/PasswordField";
import type { ApplicantRegistrationResponse } from "@/lib/types";

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
    confirmPassword: "",
  });

  const [success, setSuccess] = useState<ApplicantRegistrationResponse | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);

    try {
      const { data } = await api.post<ApplicantRegistrationResponse>("/v1/auth/register/applicant", {
        username: form.username.trim(),
        email: form.email.trim(),
        fullName: form.fullName.trim(),
        password: form.password,
      });

      setSuccess(data);
      setForm({
        username: "",
        email: "",
        fullName: "",
        password: "",
        confirmPassword: "",
      });
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? "Registration failed");
      setFieldErrors(requestError?.response?.data?.details ?? {});
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
                  Create your account to start identity verification, academic verification,
                  CV upload, and application submission.
                </p>
              </div>

              {/* <div className="mt-12 grid max-w-[560px] gap-4 md:grid-cols-3">
                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-base font-semibold text-slate-900">Profile</p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    Create your applicant account and continue into onboarding.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-base font-semibold text-slate-900">Verification</p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    National ID and academic records are verified after sign in.
                  </p>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
                  <p className="text-base font-semibold text-slate-900">Submission</p>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    Upload your CV and track your application progress end to end.
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
          <div className="w-full max-w-[560px] rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] sm:p-10">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">
                  Applicant registration
                </p>
                <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] text-slate-950">
                  Create your profile
                </h2>
                <p className="mt-3 text-base leading-7 text-slate-500">
                  Set up your account and continue to the applicant workflow after sign in.
                </p>
              </div>

              <Link
  href="/login"
  className="shrink-0 whitespace-nowrap rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
>
  Back to login
</Link>
            </div>

            {success ? (
              <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700">
                <p className="font-semibold">Account created</p>
                <p className="mt-1">{success.message}</p>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-10 space-y-5">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Full name
                  </label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
                    className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg text-slate-800 outline-none transition focus:border-brand-700"
                    placeholder="Full name"
                  />
                  {fieldErrors.fullName ? (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.fullName}</p>
                  ) : null}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">
                    Username
                  </label>
                  <input
                    value={form.username}
                    onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
                    className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg text-slate-800 outline-none transition focus:border-brand-700"
                    placeholder="Username"
                  />
                  {fieldErrors.username ? (
                    <p className="mt-1 text-sm text-red-600">{fieldErrors.username}</p>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-600">
                  Email
                </label>
                <input
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  className="h-14 w-full rounded-2xl border border-slate-300 bg-white px-4 text-lg text-slate-800 outline-none transition focus:border-brand-700"
                  placeholder="Email"
                />
                {fieldErrors.email ? (
                  <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
                ) : null}
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <PasswordField
                  label="Password"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  placeholder="Password (min 10 chars)"
                  className="h-14 rounded-2xl text-lg"
                  error={fieldErrors.password}
                />

                <PasswordField
                  label="Confirm password"
                  value={form.confirmPassword}
                  onChange={(e) => setForm((s) => ({ ...s, confirmPassword: e.target.value }))}
                  placeholder="Confirm password"
                  className="h-14 rounded-2xl text-lg"
                  error={fieldErrors.confirmPassword}
                />
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              <button
                disabled={loading}
                className="h-14 w-full rounded-2xl bg-brand-700 text-lg font-semibold text-white transition hover:opacity-95 disabled:opacity-70"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 text-sm">
              <p className="text-slate-500">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-brand-700">
                  Sign in
                </Link>
              </p>

              {/* <p className="text-slate-400">
                Immediate registration for testing
              </p> */}
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:hidden">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Profile</p>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  Create your applicant account
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Verification</p>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  ID and academic records after sign in
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Submission</p>
                <p className="mt-2 text-xs leading-6 text-slate-500">
                  CV upload and progress tracking
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
