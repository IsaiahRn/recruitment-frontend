"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import TopNav from "@/components/TopNav";
import PageTabs from "@/components/PageTabs";
import { api } from "@/lib/api";
import type { ApplicantProfile, ApplicationStatus } from "@/lib/types";
import { formatDate, formatDateTime, formatStatus } from "@/lib/format";

type ApplicantStep = "identity" | "review";

export default function ApplicantPage() {
  const [step, setStep] = useState<ApplicantStep>("identity");
  const [nationalIdNumber, setNationalIdNumber] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [profile, setProfile] = useState<ApplicantProfile | null>(null);
  const [status, setStatus] = useState<ApplicationStatus | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    try {
      const [profileRes, statusRes] = await Promise.all([
        api.get<ApplicantProfile | null>("/v1/applicant/profile"),
        api.get<ApplicationStatus>("/v1/applicant/status"),
      ]);

      setProfile(profileRes.data);
      if (profileRes.data?.nationalIdNumber) setNationalIdNumber(profileRes.data.nationalIdNumber);
      setStatus(statusRes.data);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? "Failed to load applicant workspace");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function verifyNid() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post<ApplicantProfile>("/v1/applicant/verify/nid", { nationalIdNumber });
      setProfile(data);
      setMessage("Identity information loaded successfully.");
      await load();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? "ID verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function verifyNesa() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post<ApplicantProfile>("/v1/applicant/verify/nesa", { nationalIdNumber });
      setProfile(data);
      setMessage("Academic records loaded successfully.");
      await load();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? "Academic record verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function uploadCv() {
    if (!file) {
      setError("Choose a CV file first");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      await api.post("/v1/applicant/cv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("CV uploaded successfully.");
      await load();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? "CV upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function submitApplication() {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { data } = await api.post<ApplicationStatus>("/v1/applicant/submit");
      setStatus(data);
      setStep("review");
      setMessage("Application submitted successfully.");
      await load();
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  const history = status?.history ?? [];
  const readyToSubmit = !!profile?.nidaVerified && !!profile?.nesaVerified;
  const terminal = ["SUBMITTED", "UNDER_REVIEW", "APPROVED"].includes(status?.status ?? "");

  const steps = useMemo(
    () => [
      { key: "identity", label: "Verify Identity", caption: "National ID + academic data" },
      { key: "review", label: "Review & Confirm", caption: "Profile snapshot + status" },
    ],
    []
  );

  return (
    <ProtectedPage allowedRoles={["APPLICANT"]}>
      <main className="mx-auto min-h-screen max-w-[1600px] px-6 py-8">
        <TopNav />

        <div className="mt-8">
          <PageTabs items={steps} activeKey={step} onChange={(value) => setStep(value as ApplicantStep)} />
        </div>

        {message ? <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div> : null}
        {error ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {step === "identity" ? (
          <section className="mt-6 app-card p-8">
            <div className="max-w-4xl">
              <h2 className="text-3xl font-semibold text-slate-900">Application details</h2>
              <p className="mt-2 text-sm text-slate-500">
                Enter a National ID to get profile & academic information from the simulated NID and NESA services.
              </p>
            </div>

            <div className="mt-8 grid gap-8 xl:grid-cols-[1.16fr,0.84fr]">
              <div>
                <div className="overflow-hidden rounded-[28px] border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-6 py-5">
                    <div className="flex items-center gap-4">
                      <span className="text-base font-semibold text-slate-900">Verification</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button type="button" onClick={verifyNid} disabled={loading || !nationalIdNumber} className="app-button-primary">
                        Verify ID
                      </button>
                      <button type="button" onClick={verifyNesa} disabled={loading || !nationalIdNumber} className="app-button-primary">
                        Verify Academic Records
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-x-4 gap-y-6 px-6 py-6 md:grid-cols-2 xl:grid-cols-[1.15fr,1fr,1fr,1fr]">
                    <div className="xl:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-600">National ID (min.16 characters)</label>
                      <input
                        value={nationalIdNumber}
                        onChange={(e) => setNationalIdNumber(e.target.value)}
                        className="app-input"
                        placeholder="Enter 16-digit National ID"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">First name</label>
                      <input disabled value={profile?.firstName ?? ""} className="app-input-disabled" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">Last name</label>
                      <input disabled value={profile?.lastName ?? ""} className="app-input-disabled" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">Date of birth</label>
                      <input disabled value={formatDate(profile?.dateOfBirth)} className="app-input-disabled" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">Gender</label>
                      <input disabled value={profile?.gender ?? ""} className="app-input-disabled" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">Phone</label>
                      <input disabled value={profile?.phone ?? ""} className="app-input-disabled" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">Province</label>
                      <input disabled value={profile?.province ?? ""} className="app-input-disabled" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">District</label>
                      <input disabled value={profile?.district ?? ""} className="app-input-disabled" />
                    </div>
                    <div className="md:col-span-2 xl:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-600">Address</label>
                      <input disabled value={profile?.addressLine ?? ""} className="app-input-disabled" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">School</label>
                      <input disabled value={profile?.schoolName ?? ""} className="app-input-disabled" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">Grade</label>
                      <input disabled value={profile?.grade ?? ""} className="app-input-disabled" />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-600">Option attended</label>
                      <input disabled value={profile?.optionAttended ?? ""} className="app-input-disabled" />
                    </div>
                  </div>
                </div>
              </div>

              <aside className="app-card p-6">
                <h3 className="text-xl font-semibold text-slate-900">Submission</h3>
                <p className="mt-2 text-sm text-slate-500">Finish verification, upload a CV, then submit the application.</p>

                <div className="mt-6 space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-600">Upload CV</label>
                    <input type="file" accept=".pdf,.doc,.docx" onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] ?? null)} className="block w-full text-sm text-slate-600" />
                  </div>
                  <button type="button" onClick={uploadCv} disabled={loading || !file} className="app-button-primary w-full">
                    Upload CV
                  </button>
                  <button type="button" onClick={submitApplication} disabled={loading || !readyToSubmit || terminal} className="app-button-primary w-full">
                    Submit application
                  </button>
                </div>

                <div className="mt-8 space-y-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm">
                  <p className="flex items-center justify-between gap-4"><span className="text-slate-500">ID verification</span><span className={profile?.nidaVerified ? "font-semibold text-green-700" : "font-semibold text-amber-700"}>{profile?.nidaVerified ? "Complete" : "Pending"}</span></p>
                  <p className="flex items-center justify-between gap-4"><span className="text-slate-500">Academic records</span><span className={profile?.nesaVerified ? "font-semibold text-green-700" : "font-semibold text-amber-700"}>{profile?.nesaVerified ? "Complete" : "Pending"}</span></p>
                  <p className="flex items-center justify-between gap-4"><span className="text-slate-500">Current state</span><span className="font-semibold text-brand-700">{formatStatus(status?.status ?? "NOT_STARTED")}</span></p>
                </div>
              </aside>
            </div>
          </section>
        ) : (
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr,1.05fr]">
            <section className="app-card p-8">
              <h2 className="text-2xl font-semibold text-slate-900">Profile Information</h2>
              {profile ? (
                <div className="mt-6 grid gap-x-6 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
                  {[ 
                    ["Name", `${profile.firstName} ${profile.lastName}`],
                    ["NID", profile.nationalIdNumber],
                    ["Date of birth", formatDate(profile.dateOfBirth)],
                    ["Gender", profile.gender ?? "-"],
                    ["Phone", profile.phone ?? "-"],
                    ["Address", profile.addressLine ?? "-"],
                    ["Province", profile.province ?? "-"],
                    ["District", profile.district ?? "-"],
                    ["NID status", profile.nidaVerified ? "Verified" : "Pending"],
                    ["NESA status", profile.nesaVerified ? "Verified" : "Pending"],
                    ["School", profile.schoolName ?? "-"],
                    ["Grade", profile.grade ?? "-"],
                    ["Option", profile.optionAttended ?? "-"],
                    ["Completion year", profile.completionYear?.toString() ?? "-"],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <dt className="text-sm text-slate-500">{label}</dt>
                      <dd className="mt-1 font-medium text-slate-900">{value}</dd>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-slate-500">No verified profile yet.</p>
              )}
            </section>

            <section className="app-card p-8">
              <h2 className="text-2xl font-semibold text-slate-900">Application progress</h2>
              <p className="mt-3 text-5xl font-semibold text-brand-700">{formatStatus(status?.status ?? "NOT_STARTED")}</p>
              {status?.applicationNumber ? <p className="mt-2 text-sm text-slate-500">Application number: {status.applicationNumber}</p> : null}

              <div className="mt-8 space-y-4">
                {history.length === 0 ? (
                  <p className="text-slate-500">No progress history yet.</p>
                ) : (
                  history.map((item) => (
                    <div key={`${item.status}-${item.changedAt}`} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <p className="font-semibold text-slate-900">{formatStatus(item.status)}</p>
                        <p className="text-sm text-slate-500">{formatDateTime(item.changedAt)}</p>
                      </div>
                      {item.reason ? <p className="mt-2 text-sm text-slate-600">{item.reason}</p> : null}
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </ProtectedPage>
  );
}
