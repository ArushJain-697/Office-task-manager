import React, { useEffect, useState } from "react";
import HackNiteCard from "../components/HackNiteCard";

const APPLICATIONS_URL = "https://api.sicari.works/api/sicario/applications";

function applicationToCardProps(app) {
  const subheading = app.subheading ?? "";
  const payout = app.payout;
  const payoutLine =
    payout != null && payout !== ""
      ? `# ${typeof payout === "number" ? payout.toLocaleString() : String(payout)}`
      : "# —";
  const status = app.status ?? "";

  return {
    title: app.heading ?? "Untitled",
    hashtagLines: [
      subheading ? `# ${subheading}` : "# —",
      payoutLine,
      status ? `# ${status}` : "# —",
    ],
  };
}

const MyHeists = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(APPLICATIONS_URL, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data)
          ? data
          : data.applications ?? data.data ?? [];
        setApplications(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (!cancelled) setApplications([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] px-6 py-12">
      <h1
        className="text-5xl text-center mb-16 tracking-[0.25em]"
        style={{
          fontFamily: "Georgia, serif",
          color: "#b91c1c",
          textShadow: "0 0 18px rgba(185,28,28,0.6)",
        }}
      >
        MY HEISTS
      </h1>

      {loading ? (
        <p className="text-center text-neutral-400">Loading…</p>
      ) : applications.length === 0 ? (
        <p className="text-center text-neutral-400">No applications yet.</p>
      ) : (
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-16">
          {applications.map((app) => {
            const id =
              app.application_id ??
              app["heist id"] ??
              app.heist_id ??
              `${app.heading}-${app.created_at}`;
            const { title, hashtagLines } = applicationToCardProps(app);
            return (
              <div
                key={id}
                className="flex justify-center"
                style={{ width: 381 }}
              >
                <HackNiteCard title={title} hashtagLines={hashtagLines} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyHeists;
