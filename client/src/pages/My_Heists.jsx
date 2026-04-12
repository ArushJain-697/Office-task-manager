import React, { useEffect, useState } from "react";
import HackNiteCard from "../components/HackNiteCard";

const APPLICATIONS_URL = "https://api.sicari.works/api/sicario/applications";

function applicationToCardProps(application) {
  return {
    title: application.operation_name ?? "Untitled",
    hashtagLines: [
      application.target
        ? `# ${application.target}`
        : "# —",

      application.heist_status
        ? `# ${
            typeof application.heist_status === "number"
              ? application.heist_status.toLocaleString()
              : String(application.heist_status)
          }`
        : "# —",

      application.status
        ? `# ${application.status}`
        : "# —",
    ],
  };
}

const MyHeists = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(APPLICATIONS_URL, { credentials: "include" })
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(String(res.status)))
      )
      .then((response) => {
        if (cancelled) return;

        const applicationsList = Array.isArray(response)
          ? response
          : response.applications ?? response.data ?? [];

        setApplications(Array.isArray(applicationsList) ? applicationsList : []);
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
        <p className="text-center text-neutral-400">
          No applications yet.
        </p>
      ) : (
        <div className="flex flex-wrap justify-center gap-x-12 gap-y-16">
          {applications.map((application) => {
            const id =
              application.application_id ??
              application.heist_id ??
              `${application.operation_name}-${application.created_at}`;

            const { title, hashtagLines } =
              applicationToCardProps(application);

            return (
              <div
                key={id}
                className="flex justify-center"
                style={{ width: 381 }}
              >
                <HackNiteCard
                  title={title}
                  hashtagLines={hashtagLines}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyHeists;