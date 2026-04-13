import React, { useEffect, useState, useCallback } from "react";
import HackNiteCard from "../components/HackNiteCard";
import ApprovalInterface from "../components/ApprovalInterface";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://api.sicari.works";

function applicationToCardProps(application) {
  const sicarioHeading = application.heading;
  const sicarioSubheading = application.subheading;
  const sicarioPayout = application.payout;
  const sicarioTimeline = application.timeline;

  const operationName =
    sicarioHeading ??
    application.operation_name ??
    application.section_a?.operation_name;
  const target =
    sicarioSubheading ??
    application.target ??
    application.section_a?.target;
  const status =
    application.status ?? application.heist_status ?? application.stage;
  const payoutLine =
    sicarioPayout != null
      ? `# payout ${Number(sicarioPayout).toLocaleString()}`
      : application.heist_status
        ? `# ${
            typeof application.heist_status === "number"
              ? application.heist_status.toLocaleString()
              : String(application.heist_status)
          }`
        : "# —";
  const timelineLine =
    sicarioTimeline && status
      ? `# ${sicarioTimeline} | ${status}`
      : sicarioTimeline
        ? `# ${sicarioTimeline}`
        : status
          ? `# ${status}`
          : "# —";

  return {
    title: operationName ?? "Untitled",
    hashtagLines: [
      target
        ? `# ${target}`
        : "# —",
      payoutLine,
      timelineLine,
    ],
  };
}

const MyHeists = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("sicario");
  const [selectedHeist, setSelectedHeist] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);
  const [applicantsError, setApplicantsError] = useState(null);
  const [showApprovalInterface, setShowApprovalInterface] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error("Auth failed"))
      )
      .then((auth) => {
        const role = String(auth?.user?.role || "sicario").toLowerCase();
        setRole(role);
        const endpoint =
          role === "fixer"
            ? `${API_BASE}/api/fixer/heists`
            : `${API_BASE}/api/sicario/applications`;
        return fetch(endpoint, { credentials: "include" });
      })
      .then((res) =>
        res.ok ? res.json() : Promise.reject(new Error(String(res.status)))
      )
      .then((response) => {
        if (cancelled) return;

        const applicationsList = Array.isArray(response)
          ? response
          : response.heists ?? response.applications ?? response.data ?? [];

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

  const openHeist = useCallback(
    async (heist) => {
      if (!heist) return;

      if (role !== "fixer") {
        const targetId =
          heist.id ?? heist.heist_id ?? heist["heist id"] ?? null;
        if (targetId != null) {
          navigate(`/heist/${targetId}`, { state: { heist } });
        }
        return;
      }

      setSelectedHeist(heist);
      setApplicants([]);
      setApplicantsError(null);
      setApplicantsLoading(true);
      setShowApprovalInterface(true);

      try {
        const hid = heist.id ?? heist.heist_id;
        if (hid == null) throw new Error("Invalid heist id.");
        const res = await fetch(
          `${API_BASE}/api/fixer/heist/${hid}/applicants`,
          { credentials: "include" },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data?.message || "Could not load applicants.");
        }
        const list = Array.isArray(data.applicants) ? data.applicants : [];
        const mapped = list.map((a) => ({
          ...a,
          id: a.application_id,
          role: a.title || "Sicario",
          skill: a.fit_score ?? "N/A",
          successRate: a.fit_score ?? 0,
          wantedBy: Array.isArray(a.skills) ? a.skills : [],
          bio: a.bio || "",
        }));
        setApplicants(mapped);
      } catch (e) {
        setApplicantsError(e.message || "Could not load applicants.");
      } finally {
        setApplicantsLoading(false);
      }
    },
    [navigate, role],
  );

  const handleApplicantDecision = useCallback(async (applicationId, status) => {
    const res = await fetch(
      `${API_BASE}/api/fixer/application/${applicationId}`,
      {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      },
    );
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data?.message || "Failed to update application.");
    }
  }, []);

  return (
    <div className="h-screen overflow-y-auto bg-[#050505] text-[#e5e5e5] px-6 py-12">
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
              application.id ??
              application.application_id ??
              application.heist_id ??
              application["heist id"] ??
              `${application.operation_name}-${application.created_at}`;

            const { title, hashtagLines } =
              applicationToCardProps(application);

            return (
              <div
                key={id}
                className="flex cursor-pointer justify-center"
                style={{ width: 381 }}
                onClick={() => openHeist(application)}
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

      {showApprovalInterface && role === "fixer" && (
        <div className="fixed inset-0 z-[200] bg-black/85 p-4 overflow-y-auto">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4">
            <div className="flex w-full max-w-4xl items-center justify-between rounded bg-[#1d1a16] px-4 py-3 border border-stone-700">
              <div>
                <p className="text-lg font-semibold">
                  {selectedHeist?.section_a?.operation_name ||
                    selectedHeist?.operation_name ||
                    "Heist applicants"}
                </p>
                <p className="text-sm text-stone-400">
                  Review and accept or reject applicants
                </p>
              </div>
              <button
                type="button"
                className="bg-stone-900 px-4 py-2 border border-stone-500 hover:bg-stone-800"
                onClick={() => setShowApprovalInterface(false)}
              >
                Close
              </button>
            </div>

            {applicantsLoading && (
              <div className="text-stone-300">Loading applicants...</div>
            )}
            {applicantsError && (
              <div className="text-red-300">{applicantsError}</div>
            )}
            {!applicantsLoading && !applicantsError && applicants.length === 0 && (
              <div className="text-stone-400">No applicants yet.</div>
            )}
            {!applicantsLoading && !applicantsError && applicants.length > 0 && (
              <ApprovalInterface
                initialProfiles={applicants}
                onDecision={handleApplicantDecision}
                onClose={() => setShowApprovalInterface(false)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyHeists;