"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  LineChart,
  Line,
  Legend,
} from "recharts";
import StatCard from "@/components/StatCard";
import type { DashboardOverview } from "@/lib/types";
import { formatDate, formatDateTime, formatStatus } from "@/lib/format";

export default function DashboardOverviewPanel({
  overview,
  title,
}: {
  overview: DashboardOverview;
  title: string;
}) {
  const dailySubmissions = overview.dailySubmissions.map((item) => ({ ...item, day: formatDate(item.day) }));
  const decisionTrend = overview.decisionTrend.map((item) => ({ ...item, day: formatDate(item.day) }));

  return (
    <section className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">Recent activities.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
        <StatCard label="Applicants" value={overview.summary.totalApplicants} accent />
        <StatCard label="Submitted" value={overview.summary.submitted} />
        <StatCard label="Under review" value={overview.summary.underReview} />
        <StatCard label="Approved" value={overview.summary.approved} />
        <StatCard label="Rejected" value={overview.summary.rejected} />
        <StatCard label="Pending verification" value={overview.summary.pendingVerification} />
        <StatCard label="Users" value={overview.summary.totalUsers} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Submission trend</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailySubmissions}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Status distribution</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={overview.statusBreakdown}
                  dataKey="count"
                  nameKey="status"
                  outerRadius={102}
                  label={({ status }) => formatStatus(String(status))}
                />
                <Tooltip formatter={(value, name) => [value, formatStatus(String(name))]} />
                <Legend formatter={(value) => formatStatus(String(value))} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.08fr,0.92fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Decision trend</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={decisionTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="approved" name="Approved" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="rejected" name="Rejected" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Users by role</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.userRoleBreakdown}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="role" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.18fr,0.82fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Recent submissions</h3>
          <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Application</th>
                  <th className="px-5 py-4 font-semibold">Applicant</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {overview.recentSubmissions.map((item) => (
                  <tr key={item.applicationId} className="border-t border-slate-100">
                    <td className="px-5 py-4 font-medium text-brand-700">{item.applicationNumber}</td>
                    <td className="px-5 py-4">{item.fullName}</td>
                    <td className="px-5 py-4">{formatStatus(item.status)}</td>
                    <td className="px-5 py-4">{formatDateTime(item.submittedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Reviewer workload</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={overview.reviewerWorkload} layout="vertical" margin={{ left: 12 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="reviewerName" tickLine={false} axisLine={false} width={110} />
                <Tooltip />
                <Bar dataKey="reviewedCount" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
