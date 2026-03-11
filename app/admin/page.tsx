"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import TopNav from "@/components/TopNav";
import PageTabs from "@/components/PageTabs";
import DashboardOverviewPanel from "@/components/DashboardOverview";
import PasswordField from "@/components/PasswordField";
import { api } from "@/lib/api";
import type { AdminUser, AuditLog, DashboardOverview, UserRole } from "@/lib/types";
import { formatDateTime } from "@/lib/format";

type AdminTab = "dashboard" | "users" | "audit";

type UserForm = {
  username: string;
  email: string;
  fullName: string;
  role: UserRole;
  password: string;
};

const emptyForm: UserForm = {
  username: "",
  email: "",
  fullName: "",
  role: "HR",
  password: "Password@123",
};

function asArray<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object") {
    const source = payload as Record<string, unknown>;
    if (Array.isArray(source.items)) return source.items as T[];
    if (Array.isArray(source.content)) return source.content as T[];
    if (Array.isArray(source.data)) return source.data as T[];
    if (Array.isArray(source.results)) return source.results as T[];
  }
  return [];
}

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | UserRole>("ALL");

  async function load() {
    setGlobalError("");

    const [overviewRes, usersRes, auditRes] = await Promise.allSettled([
      api.get<DashboardOverview>("/v1/dashboard/overview"),
      api.get("/v1/admin/users"),
      api.get("/v1/admin/audit-logs"),
    ]);

    if (overviewRes.status === "fulfilled") setOverview(overviewRes.value.data);
    if (usersRes.status === "fulfilled") setUsers(asArray<AdminUser>(usersRes.value.data));
    if (auditRes.status === "fulfilled") setAuditLogs(asArray<AuditLog>(auditRes.value.data));
  }

  useEffect(() => {
    load();
  }, []);

  function beginEdit(user: AdminUser) {
    setEditingUserId(user.id);
    setFieldErrors({});
    setGlobalError("");
    setForm({ username: user.username, email: user.email, fullName: user.fullName, role: user.role, password: "" });
    setTab("users");
  }

  function resetForm() {
    setEditingUserId(null);
    setFieldErrors({});
    setGlobalError("");
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setFieldErrors({});
    setGlobalError("");
    setMessage("");

    const payload: Record<string, unknown> = {
      username: form.username.trim(),
      email: form.email.trim(),
      fullName: form.fullName.trim(),
      role: form.role,
    };

    if (form.password.trim()) payload.password = form.password;

    try {
      if (editingUserId) {
        await api.put(`/v1/admin/users/${editingUserId}`, payload);
        setMessage("User updated.");
      } else {
        await api.post("/v1/admin/users", payload);
        setMessage("User created.");
      }
      resetForm();
      await load();
    } catch (requestError: any) {
      setGlobalError(requestError?.response?.data?.message ?? "Request failed");
      setFieldErrors(requestError?.response?.data?.details ?? {});
    }
  }

  async function toggleUser(user: AdminUser) {
    setGlobalError("");
    setMessage("");
    const action = user.status === "ACTIVE" ? "disable" : "enable";
    await api.put(`/v1/admin/users/${user.id}/${action}`);
    setMessage(`User ${action}d.`);
    await load();
  }

  const filteredUsers = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
      const matchesText = !normalized || [user.username, user.fullName, user.email, user.role, user.status].some((value) => value.toLowerCase().includes(normalized));
      return matchesRole && matchesText;
    });
  }, [users, search, roleFilter]);

  return (
    <ProtectedPage allowedRoles={["SUPER_ADMIN"]}>
      <main className="mx-auto min-h-screen max-w-[1600px] px-6 py-8">
        <TopNav />

        <div className="mt-8">
          <PageTabs
            items={[
              { key: "dashboard", label: "Admin analytics", caption: "Analytics + Activities" },
              { key: "users", label: "User management", caption: "Create, edit, enable, and disable users" },
              { key: "audit", label: "Audit trail", caption: "Latest platform actions and change events" },
            ]}
            activeKey={tab}
            onChange={(value) => setTab(value as AdminTab)}
          />
        </div>

        {message ? <div className="mt-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{message}</div> : null}
        {globalError ? <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{globalError}</div> : null}

        {tab === "dashboard" ? <div className="mt-6">{overview ? <DashboardOverviewPanel overview={overview} title="Administration dashboard" /> : null}</div> : null}

        {tab === "users" ? (
          <div className="mt-6 grid gap-6 xl:grid-cols-[430px,1fr]">
            <form onSubmit={handleSubmit} className="app-card p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{editingUserId ? "Edit user" : "Create user"}</h2>
                  <p className="mt-1 text-sm text-slate-500">Manage HR, applicant, and super admin accounts.</p>
                </div>
                {editingUserId ? <button type="button" onClick={resetForm} className="app-button-secondary">Cancel</button> : null}
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">Username</label>
                  <input value={form.username} onChange={(e) => setForm((state) => ({ ...state, username: e.target.value }))} className="app-input" placeholder="Username" />
                  {fieldErrors.username ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.username}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">Email</label>
                  <input value={form.email} onChange={(e) => setForm((state) => ({ ...state, email: e.target.value }))} className="app-input" placeholder="Email" />
                  {fieldErrors.email ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.email}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">Full name</label>
                  <input value={form.fullName} onChange={(e) => setForm((state) => ({ ...state, fullName: e.target.value }))} className="app-input" placeholder="Full name" />
                  {fieldErrors.fullName ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.fullName}</p> : null}
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-600">Role</label>
                  <select value={form.role} onChange={(e) => setForm((state) => ({ ...state, role: e.target.value as UserRole }))} className="app-input">
                    <option value="HR">HR</option>
                    <option value="APPLICANT">Applicant</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                  {fieldErrors.role ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.role}</p> : null}
                </div>
                <PasswordField
                  value={form.password}
                  onChange={(e) => setForm((state) => ({ ...state, password: e.target.value }))}
                  placeholder={editingUserId ? "Leave blank to keep existing password" : "Password (min 10 chars)"}
                  className="h-12"
                  error={fieldErrors.password}
                />
                <button className="app-button-primary h-12 w-full">{editingUserId ? "Save changes" : "Create user"}</button>
              </div>
            </form>

            <section className="app-card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">User directory</h2>
                  <p className="mt-1 text-sm text-slate-500">Search across all system accounts and control access status.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users" className="app-input" />
                  <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value as "ALL" | UserRole)} className="app-input">
                    <option value="ALL">All roles</option>
                    <option value="HR">HR</option>
                    <option value="APPLICANT">Applicant</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Username</th>
                      <th className="px-5 py-4 font-semibold">Full name</th>
                      <th className="px-5 py-4 font-semibold">Role</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">Last login</th>
                      <th className="px-5 py-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-t border-slate-100">
                        <td className="px-5 py-4 font-medium text-brand-700">{user.username}</td>
                        <td className="px-5 py-4"><div>{user.fullName}</div><div className="text-xs text-slate-500">{user.email}</div></td>
                        <td className="px-5 py-4">{user.role}</td>
                        <td className="px-5 py-4">{user.status}</td>
                        <td className="px-5 py-4">{formatDateTime(user.lastLoginAt)}</td>
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => beginEdit(user)} className="app-button-secondary px-4 py-2 text-xs">Edit</button>
                            <button type="button" onClick={() => toggleUser(user)} className={`rounded-2xl px-4 py-2 text-xs font-semibold shadow-sm ${user.status === "ACTIVE" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
                              {user.status === "ACTIVE" ? "Disable" : "Enable"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 ? <tr><td colSpan={6} className="px-5 py-10 text-center text-slate-500">No users matched the current filters.</td></tr> : null}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {tab === "audit" ? (
          <section className="mt-6 app-card p-6">
            <h2 className="text-xl font-semibold text-slate-900">Audit logs</h2>
            <p className="mt-1 text-sm text-slate-500">Recent platform actions across login, verification, review, and administration.</p>
            <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">When</th>
                    <th className="px-5 py-4 font-semibold">Action</th>
                    <th className="px-5 py-4 font-semibold">Entity</th>
                    <th className="px-5 py-4 font-semibold">Actor</th>
                    <th className="px-5 py-4 font-semibold">Metadata</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.slice(0, 50).map((item) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="px-5 py-4">{formatDateTime(item.createdAt)}</td>
                      <td className="px-5 py-4 font-medium text-brand-700">{item.action}</td>
                      <td className="px-5 py-4">{item.entityType}:{item.entityId}</td>
                      <td className="px-5 py-4">{item.actorUserId ?? "-"}</td>
                      <td className="max-w-[420px] px-5 py-4 text-xs text-slate-500">{item.metadataJson ?? "-"}</td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 ? <tr><td colSpan={5} className="px-5 py-10 text-center text-slate-500">No audit logs available yet.</td></tr> : null}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </main>
    </ProtectedPage>
  );
}
