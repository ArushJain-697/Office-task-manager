/**
 * Merges Typewriter / Gemini output field names with legacy aliases so
 * slides and print views always read the same canonical keys.
 */
function firstNonEmpty(...candidates) {
  for (const v of candidates) {
    if (v === undefined || v === null) continue
    if (typeof v === 'string' && v.trim() === '') continue
    return v
  }
  return ''
}

function normalizeCrewMember(c) {
  if (!c || typeof c !== 'object') return c
  const moneyShare = firstNonEmpty(c.moneyShare, c.share)
  const threatLevel = firstNonEmpty(c.threatLevel, c.threat)
  return {
    ...c,
    moneyShare,
    share: firstNonEmpty(c.share, c.moneyShare),
    threatLevel,
    threat: firstNonEmpty(c.threat, c.threatLevel),
  }
}

export function normalizeDossierData(raw) {
  if (!raw || typeof raw !== 'object') return raw

  const quotes = firstNonEmpty(raw.quotes, raw.quote)
  const extractionPlan = firstNonEmpty(raw.extractionPlan, raw.extraction)

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
    crew: Array.isArray(raw.crew) ? raw.crew.map(normalizeCrewMember) : raw.crew,
  }
}

/** Parse crew money share for charts (HeistSlideDeck). */
export function crewMoneyPercent(member) {
  if (!member || typeof member !== 'object') return 0
  const n = Number(
    firstNonEmpty(member.moneyShare, member.share, member.money_share)
  )
  return Number.isFinite(n) ? n : 0
}

/** Map dossier threat label to numeric level for UI. */
export function crewThreatToLevel(member) {
  if (!member || typeof member !== 'object') return 4
  const t = String(
    firstNonEmpty(member.threatLevel, member.threat, '')
  ).toUpperCase()
  if (t.includes('EXTREME')) return 5
  if (t.includes('HIGH')) return 4
  if (t.includes('MEDIUM')) return 3
  if (t.includes('LOW')) return 1
  const n = parseInt(t, 10)
  if (Number.isFinite(n) && n >= 1 && n <= 5) return n
  return 4
}
