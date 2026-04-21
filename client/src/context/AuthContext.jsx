import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await api.get("/auth/me");
        if (!cancelled) setUser(res.data.user);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async register({ username, password }) {
        const res = await api.post("/auth/register", { username, password });
        setUser(res.data.user);
        return res.data.user;
      },
      async login({ username, password }) {
        const res = await api.post("/auth/login", { username, password });
        setUser(res.data.user);
        return res.data.user;
      },
      async logout() {
        await api.post("/auth/logout");
        setUser(null);
      },
      async refresh() {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
        return res.data.user;
      },
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

