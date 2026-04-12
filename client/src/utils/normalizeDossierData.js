/**
 * Merges dossier field names with legacy aliases so views read canonical keys.
 */
function firstNonEmpty(...candidates) {
  for (const v of candidates) {
    if (v === undefined || v === null) continue;
    if (typeof v === "string" && v.trim() === "") continue;
    return v;
  }
  return "";
}

function normalizeCrewMember(c) {
  if (!c || typeof c !== "object") return c;
  const moneyShare = firstNonEmpty(c.moneyShare, c.share);
  const threatLevel = firstNonEmpty(c.threatLevel, c.threat);
  return {
    ...c,
    moneyShare,
    share: firstNonEmpty(c.share, c.moneyShare),
    threatLevel,
    threat: firstNonEmpty(c.threat, c.threatLevel),
  };
}

export function normalizeDossierData(raw) {
  if (!raw || typeof raw !== "object") return raw;

  const quotes = firstNonEmpty(raw.quotes, raw.quote);
  const extractionPlan = firstNonEmpty(raw.extractionPlan, raw.extraction);

  return {
    ...raw,
    quotes,
    quote: firstNonEmpty(raw.quote, raw.quotes),
    extractionPlan,
    extraction: firstNonEmpty(raw.extraction, raw.extractionPlan),
    intelGuardRotations: firstNonEmpty(
      raw.intelGuardRotations,
      raw.intelGuards
    ),
    intelGuards: firstNonEmpty(raw.intelGuards, raw.intelGuardRotations),
    intelSurveillanceHours: firstNonEmpty(
      raw.intelSurveillanceHours,
      raw.intelSurveillance
    ),
    intelSurveillance: firstNonEmpty(
      raw.intelSurveillance,
      raw.intelSurveillanceHours
    ),
    crew: Array.isArray(raw.crew)
      ? raw.crew.map(normalizeCrewMember)
      : raw.crew,
  };
}
