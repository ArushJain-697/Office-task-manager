function threatFromCrewDetails(crew_details) {
  if (!crew_details || typeof crew_details !== "object") return "MEDIUM";
  const t =
    crew_details["threat level"] ??
    crew_details.threat_level ??
    crew_details.threatLevel;
  if (!t) return "MEDIUM";
  const s = String(t).toUpperCase().trim();
  if (s.includes("EXTREME")) return "EXTREME";
  if (s.includes("HIGH")) return "HIGH";
  if (s.includes("LOW")) return "LOW";
  if (s.includes("MEDIUM")) return "MEDIUM";
  return "HIGH";
}

function parseTimeline(timeline) {
  if (timeline == null || timeline === "") return [];
  if (Array.isArray(timeline)) {
    return timeline
      .map((t) => {
        if (t && typeof t === "object") {
          return {
            time: String(t.time ?? ""),
            description: String(t.description ?? t.event ?? ""),
          };
        }
        return { time: "", description: String(t) };
      })
      .filter((x) => x.time.trim() || x.description.trim());
  }
  return [{ time: "WINDOW", description: String(timeline) }];
}

function photoUrls(photos) {
  if (!Array.isArray(photos)) return [];
  return photos
    .map((p) => (typeof p === "string" ? p : p?.url))
    .filter(Boolean);
}

/**
 * Maps a heist object from `GET .../api/sicario/heists` into the shape expected by DossierView.
 */
export function heistApiToDossierForm(heist) {
  if (!heist || typeof heist !== "object") return null;

  const urls = photoUrls(heist.photos);
  const threat = threatFromCrewDetails(heist.crew_details);
  const skills = Array.isArray(heist.required_skills) ? heist.required_skills : [];
  const crew = skills
    .filter((s) => s && typeof s === "object")
    .map((s) => ({
      title: String(s.role || "OPERATIVE").toUpperCase(),
      job: "Required crew role",
      moneyShare: s.moneyshare ?? s.money_share ?? s.share ?? "",
      threatLevel: threat,
      requirements: "",
    }));

  const payout = heist.payout;
  const payoutStr =
    payout != null
      ? `Payout: ${typeof payout === "number" ? `$${payout.toLocaleString()}` : payout}`
      : "Payout: classified";
  const status = heist.status || "unknown";

  return {
    operationName: heist.heading || heist.title || "CLASSIFIED",
    place: heist.subheading || "—",
    target: heist.quote ? String(heist.quote) : "Target withheld",
    introduction:
      heist.short_description ||
      heist.quote ||
      "No briefing available for this operation.",
    quote: heist.quote || "",
    phase1Name: "Reconnaissance",
    phase1Description:
      heist.short_description ||
      "Operational details are distributed on a need-to-know basis.",
    phase1Photo: urls[0],
    executionPhoto: urls[1],
    extractionPhoto: urls[2],
    intelEndpoints: String(skills.length || "—"),
    intelGuardRotations: payoutStr,
    intelSurveillanceHours:
      typeof heist.timeline === "string" && heist.timeline.trim()
        ? heist.timeline
        : Array.isArray(heist.timeline) && heist.timeline.length
          ? "See operation timeline"
          : "—",
    intelVulnerabilities: `Status: ${status}`,
    executionDescription:
      [heist.subheading, heist.quote].filter(Boolean).join(" — ") ||
      "Operational particulars are restricted.",
    timeline: parseTimeline(heist.timeline),
    extractionPlan: `${payoutStr}. Mission status: ${status}.`,
    crew: crew.length ? crew : undefined,
  };
}
