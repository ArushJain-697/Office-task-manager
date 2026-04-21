import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

function Button({ children, className = "", ...props }) {
  return (
    <button
      className={
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium " +
        "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, className = "", ...props }) {
  return (
    <button
      className={
        "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium " +
        "bg-white text-slate-900 ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-60 " +
        className
      }
      {...props}
    >
      {children}
    </button>
  );
}

function Modal({ open, title, children, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-xl bg-white shadow-lg ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="text-sm font-semibold text-slate-900">{title}</div>
          <button
            className="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-50"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [creating, setCreating] = useState(false);

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const [t, u] = await Promise.all([api.get("/tasks"), api.get("/users")]);
      setTasks(t.data.tasks || []);
      setUsers(u.data.users || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const userOptions = useMemo(
    () => users.filter((u) => u.role === "user"),
    [users]
  );

  async function createTask(e) {
    e.preventDefault();
    setCreating(true);
    setError("");
    try {
      const payload = {
        title,
        description,
        assigned_to: assignedTo ? Number(assignedTo) : null,
      };
      await api.post("/tasks", payload);
      setCreateOpen(false);
      setTitle("");
      setDescription("");
      setAssignedTo("");
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create task");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Admin</div>
            <div className="text-lg font-semibold text-slate-900">Office Task Manager</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">{user?.username}</div>
            <SecondaryButton onClick={logout}>Sign out</SecondaryButton>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Tasks</h2>
            <p className="text-sm text-slate-600">Create, assign, and track tasks across the organization.</p>
          </div>
          <div className="flex items-center gap-2">
            <SecondaryButton onClick={refresh} disabled={loading}>
              Refresh
            </SecondaryButton>
            <Button onClick={() => setCreateOpen(true)}>New task</Button>
          </div>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2 ring-1 ring-red-100">
            {error}
          </div>
        ) : null}

        <div className="mt-4 overflow-hidden rounded-xl bg-white ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="text-left font-medium px-4 py-3">Title</th>
                <th className="text-left font-medium px-4 py-3">Status</th>
                <th className="text-left font-medium px-4 py-3">Assigned to</th>
                <th className="text-left font-medium px-4 py-3">Created by</th>
                <th className="text-left font-medium px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={5}>
                    Loading...
                  </td>
                </tr>
              ) : tasks.length === 0 ? (
                <tr>
                  <td className="px-4 py-4 text-slate-600" colSpan={5}>
                    No tasks yet.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr key={t.id} className="border-t border-slate-100">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{t.title}</div>
                      {t.description ? (
                        <div className="text-slate-600 line-clamp-2">{t.description}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium " +
                          (t.status === "completed"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : "bg-slate-100 text-slate-700 ring-1 ring-slate-200")
                        }
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {t.assigned_to_username || "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{t.created_by_username}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={createOpen} title="Create task" onClose={() => setCreateOpen(false)}>
        <form onSubmit={createTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="mt-1 w-full min-h-24 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Assign to</label>
            <select
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
            >
              <option value="">Unassigned</option>
              {userOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <SecondaryButton type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </SecondaryButton>
            <Button disabled={creating} type="submit">
              {creating ? "Creating..." : "Create task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

