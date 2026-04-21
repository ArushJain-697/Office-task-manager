import React, { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

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

export default function UserDashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [workingId, setWorkingId] = useState(null);

  async function refresh() {
    setError("");
    setLoading(true);
    try {
      const res = await api.get("/tasks/my-tasks");
      setTasks(res.data.tasks || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const pending = useMemo(() => tasks.filter((t) => t.status !== "completed"), [tasks]);
  const completed = useMemo(() => tasks.filter((t) => t.status === "completed"), [tasks]);

  async function complete(id) {
    setWorkingId(id);
    setError("");
    try {
      await api.patch(`/tasks/${id}/status`);
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update task");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">Dashboard</div>
            <div className="text-lg font-semibold text-slate-900">My tasks</div>
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
            <h2 className="text-xl font-semibold text-slate-900">Assigned tasks</h2>
            <p className="text-sm text-slate-600">Complete tasks to keep work moving.</p>
          </div>
          <SecondaryButton onClick={refresh} disabled={loading}>
            Refresh
          </SecondaryButton>
        </div>

        {error ? (
          <div className="mt-4 rounded-lg bg-red-50 text-red-700 text-sm px-3 py-2 ring-1 ring-red-100">
            {error}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl bg-white ring-1 ring-slate-200">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="text-sm font-semibold text-slate-900">Pending</div>
            </div>
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="text-sm text-slate-600">Loading...</div>
              ) : pending.length === 0 ? (
                <div className="text-sm text-slate-600">No pending tasks.</div>
              ) : (
                pending.map((t) => (
                  <div key={t.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-slate-900">{t.title}</div>
                        {t.description ? (
                          <div className="mt-1 text-sm text-slate-600">{t.description}</div>
                        ) : null}
                      </div>
                      <Button
                        onClick={() => complete(t.id)}
                        disabled={workingId === t.id}
                        className="shrink-0"
                      >
                        {workingId === t.id ? "Updating..." : "Mark complete"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-xl bg-white ring-1 ring-slate-200">
            <div className="px-4 py-3 border-b border-slate-100">
              <div className="text-sm font-semibold text-slate-900">Completed</div>
            </div>
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="text-sm text-slate-600">Loading...</div>
              ) : completed.length === 0 ? (
                <div className="text-sm text-slate-600">No completed tasks yet.</div>
              ) : (
                completed.map((t) => (
                  <div key={t.id} className="rounded-lg border border-slate-200 p-3">
                    <div className="font-medium text-slate-900">{t.title}</div>
                    {t.description ? (
                      <div className="mt-1 text-sm text-slate-600">{t.description}</div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

