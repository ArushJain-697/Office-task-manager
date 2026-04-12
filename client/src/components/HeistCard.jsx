import React from "react";

const HeistCard = ({ heist }) => {
  if (!heist) return null;

  const {
    application_id,
    status,
    created_at,
    heading,
    subheading,
    payout,
    timeline,
    heist_status,
  } = heist;

  return (
    <div className="h-full w-full bg-[#0a0a0a] text-[#e5e5e5] border border-[#1f1f1f] p-6 flex flex-col justify-between relative overflow-hidden">

      {/* subtle red glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: "inset 0 0 60px rgba(185,28,28,0.18)" }}
      />

      {/* Header */}
      <div>
        <h2
          className="text-3xl mb-3 tracking-wide font-semibold"
          style={{
            fontFamily: "Inter, system-ui, sans-serif",
            color: "#ef4444",
          }}
        >
          {heading || "UNKNOWN JOB"}
        </h2>

        <p
          className="text-base opacity-70 mb-5"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          {subheading || "No intel available"}
        </p>

        {/* Info */}
        <div
          className="space-y-3 text-base leading-relaxed"
          style={{ fontFamily: "Inter, system-ui, sans-serif" }}
        >
          <p><strong>Payout:</strong> ₹{payout || "???"}</p>
          <p><strong>Timeline:</strong> {timeline || "N/A"}</p>
          <p><strong>Heist Status:</strong> {heist_status || "unknown"}</p>
          <p><strong>Application:</strong> {status || "pending"}</p>
        </div>
      </div>

      {/* Footer */}
      <div
        className="text-sm opacity-50 mt-5 border-t border-[#1f1f1f] pt-3"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        <p>ID: {application_id}</p>
        <p>
          {created_at
            ? new Date(created_at).toLocaleString()
            : "no timestamp"}
        </p>
      </div>

      {/* stamp */}
      <div className="absolute bottom-3 right-3 text-sm text-red-700 opacity-40 rotate-[-15deg] tracking-widest font-semibold"
        style={{ fontFamily: "Inter, system-ui, sans-serif" }}
      >
        CLASSIFIED
      </div>
    </div>
  );
};

export default HeistCard;