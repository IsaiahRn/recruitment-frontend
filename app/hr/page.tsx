"use client";

import { useEffect, useMemo, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import TopNav from "@/components/TopNav";
import PageTabs from "@/components/PageTabs";
import DashboardOverviewPanel from "@/components/DashboardOverview";
import { api, baseURL } from "@/lib/api";
import type { DashboardOverview, HrApplicantRow, HrApplicationDetail } from "@/lib/types";
import { formatDate, formatDateTime, formatStatus } from "@/lib/format";

type HrTab = "dashboard" | "review";

export default function HrPage() {
  const [tab, setTab] = useState<HrTab>("dashboard");
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [applications, setApplications] = useState<HrApplicantRow[]>([]);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);
  const [detail, setDetail] = useState<HrApplicationDetail | null>(null);
  const [search, setSearch] = useState("");
  const [reviewNote, setReviewNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadOverview() {
    const { data } = await api.get<DashboardOverview>("/v1/dashboard/overview");
    setOverview(data);
  }

  async function loadApplications() {
    const { data } = await api.get<HrApplicantRow[]>("/v1/hr/applications");
    setApplications(data);
    if (data.length > 0 && !selectedApplicationId) setSelectedApplicationId(data[0].applicationId);
  }

  async function loadDetail(applicationId: string) {
    const { data } = await api.get<HrApplicationDetail>(`/v1/hr/applications/${applicationId}`);
    setDetail(data);
    setReviewNote(data.decisionNote ?? "");
    setRejectionReason(data.rejectionReason ?? "");
  }

  async function loadAll() {
    setError("");
    try {
      await Promise.all([loadOverview(), loadApplications()]);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? "Failed to load HR workspace");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (selectedApplicationId) {
      loadDetail(selectedApplicationId).catch((requestError: any) => {
        setError(requestError?.response?.data?.message ?? "Failed to load application detail");
      });
    }
  }, [selectedApplicationId]);

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return applications;
    return applications.filter((item) => [item.applicationNumber, item.fullName, item.status].some((value) => value.toLowerCase().includes(query)));
  }, [applications, search]);

  const terminal = detail?.status === "APPROVED" || detail?.status === "REJECTED";

  async function runAction(action: "under-review" | "approve" | "reject") {
    if (!selectedApplicationId) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await api.put(`/v1/hr/applications/${selectedApplicationId}/${action}`, {
        note: reviewNote,
        reason: rejectionReason,
      });
      setMessage(`Application ${action.replace("-", " ")} saved.`);
      await Promise.all([loadOverview(), loadApplications(), loadDetail(selectedApplicationId)]);
    } catch (requestError: any) {
      setError(requestError?.response?.data?.message ?? "Action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ProtectedPage allowedRoles={["HR", "SUPER_ADMIN"]}>
      <main className="mx-auto min-h-screen max-w-[1600px] px-6 py-8">
        <TopNav />

        <div className="mt-8">
          <PageTabs
            items={[
              { key: "dashboard", label: "Dashboard", caption: "Analytics + activity" },
              { key: "review", label: "Applications", caption: "Applicants + decisioning" },
            ]}
            activeKey={tab}
            onChange={(value) => setTab(value as HrTab)}
          />
        </div>

        {message ? <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div> : null}
        {error ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {tab === "dashboard" ? (
          <div className="mt-6">{overview ? <DashboardOverviewPanel overview={overview} title="HR review dashboard" /> : null}</div>
        ) : (
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr,1.1fr]">
            <section className="app-card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">Applicants</h2>
                  <p className="mt-1 text-sm text-slate-500">Latest 10 applicants.</p>
                </div>
                <div className="flex w-full max-w-[420px] items-center gap-3">
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search applicants" className="app-input" />
                  <button type="button" className="app-button-secondary whitespace-nowrap">Search</button>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Application</th>
                      <th className="px-5 py-4 font-semibold">Full name</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Submitted at</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredApplications.map((item) => (
                      <tr
                        key={item.applicationId}
                        onClick={() => setSelectedApplicationId(item.applicationId)}
                        className={`cursor-pointer border-t border-slate-100 ${selectedApplicationId === item.applicationId ? "bg-[#f1f6ff]" : "hover:bg-slate-50"}`}
                      >
                        <td className="px-5 py-4 font-medium text-brand-700">{item.applicationNumber}</td>
                        <td className="px-5 py-4">{item.fullName}</td>
                        <td className="px-5 py-4">{formatStatus(item.status)}</td>
                        <td className="px-5 py-4">{formatDateTime(item.submittedAt)}</td>
                      </tr>
                    ))}
                    {filteredApplications.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-10 text-center text-slate-500">No applicants found.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="app-card p-6">
              <h2 className="text-2xl font-semibold text-slate-900">Application detail</h2>

              {!detail ? (
                <p className="mt-6 text-slate-500">Select an applicant to inspect the application.</p>
              ) : (
                <div className="mt-6 space-y-6">
                  <div className="rounded-3xl border border-slate-200 p-5">
                    <dl className="grid gap-x-6 gap-y-4 md:grid-cols-2 xl:grid-cols-3">
                      <div><dt className="text-sm text-slate-500">Applicant</dt><dd className="mt-1 font-medium text-slate-900">{detail.applicant.firstName} {detail.applicant.lastName}</dd></div>
                      <div><dt className="text-sm text-slate-500">Application no.</dt><dd className="mt-1 font-medium text-slate-900">{detail.applicationNumber}</dd></div>
                      <div><dt className="text-sm text-slate-500">NID</dt><dd className="mt-1">{detail.applicant.nationalIdNumber}</dd></div>
                      <div><dt className="text-sm text-slate-500">Date of birth</dt><dd className="mt-1">{formatDate(detail.applicant.dateOfBirth)}</dd></div>
                      <div><dt className="text-sm text-slate-500">Phone</dt><dd className="mt-1">{detail.applicant.phone ?? "-"}</dd></div>
                      <div><dt className="text-sm text-slate-500">School</dt><dd className="mt-1">{detail.applicant.schoolName ?? "-"}</dd></div>
                      <div><dt className="text-sm text-slate-500">Grade</dt><dd className="mt-1">{detail.applicant.grade ?? "-"}</dd></div>
                      <div><dt className="text-sm text-slate-500">Option</dt><dd className="mt-1">{detail.applicant.optionAttended ?? "-"}</dd></div>
                      <div><dt className="text-sm text-slate-500">Current status</dt><dd className="mt-1 font-semibold text-brand-700">{formatStatus(detail.status)}</dd></div>
                    </dl>
                  </div>

                  <div className="rounded-3xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-900">CV</h3>
                    <div className="mt-4 space-y-3">
                      {detail.documents.map((document) => (
                        <div key={document.documentId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 p-4">
                          <div>
                            <p className="font-medium text-slate-900">{document.originalFilename}</p>
                            <p className="mt-1 text-sm text-slate-500">{document.contentType} · {(document.fileSize / 1024).toFixed(1)} KB</p>
                          </div>
                          <button type="button" onClick={() => window.open(`${baseURL}${document.downloadPath}`, "_blank")} className="app-button-secondary">
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!terminal ? (
                    <div className="space-y-4 rounded-3xl border border-slate-200 p-5">
                      <textarea value={reviewNote} onChange={(e) => setReviewNote(e.target.value)} placeholder="Review note" className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 shadow-sm" />
                      <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Rejection reason" className="min-h-[120px] w-full rounded-2xl border border-slate-200 px-4 py-3 shadow-sm" />
                      <div className="flex flex-wrap gap-3">
                        <button type="button" onClick={() => runAction("under-review")} disabled={loading} className="app-button-secondary">Under review</button>
                        <button type="button" onClick={() => runAction("approve")} disabled={loading} className="app-button-primary">Approve</button>
                        <button type="button" onClick={() => runAction("reject")} disabled={loading} className="app-button-danger">Reject</button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      This application is already {formatStatus(detail.status).toLowerCase()}. Only application details are shown now.
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Approval History</h3>
                    <div className="mt-4 space-y-3">
                      {detail.history.map((item) => (
                        <div key={`${item.status}-${item.changedAt}`} className="rounded-2xl border border-slate-200 p-4">
                          <div className="flex items-start justify-between gap-4">
                            <p className="font-semibold text-slate-900">{formatStatus(item.status)}</p>
                            <p className="text-sm text-slate-500">{formatDateTime(item.changedAt)}</p>
                          </div>
                          {item.reason ? <p className="mt-2 text-sm text-slate-600">{item.reason}</p> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}
      </main>
    </ProtectedPage>
  );
}
