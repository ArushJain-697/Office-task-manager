import { motion } from "framer-motion";
import { normalizeDossierData } from "../utils/normalizeDossierData";

const threatBadgeClass = {
  LOW: "badge-low",
  MEDIUM: "badge-medium",
  HIGH: "badge-high",
  EXTREME: "badge-extreme",
};

export default function DossierView({ formData, onReset, resetLabel = "↩ New Operation" }) {
  const d = formData ? normalizeDossierData(formData) : {};
  const timeline = Array.isArray(d.timeline) ? d.timeline : [];
  const crewList = Array.isArray(d.crew) ? d.crew : [];

  const photos = [
    d.phase1Photo && { src: d.phase1Photo, label: "RECON" },
    d.executionPhoto && { src: d.executionPhoto, label: "EXECUTION" },
    d.extractionPhoto && { src: d.extractionPhoto, label: "EXTRACTION" },
  ].filter(Boolean);

  const filledTimeline = timeline.filter(
    (t) => t.time.trim() || t.description.trim()
  );

  const quoteDisplay = (d.quotes || d.quote || "").toString().trim();

  return (
    <motion.div
      className="dossier-view"
      initial={{ clipPath: "inset(100% 0 0 0)" }}
      animate={{ clipPath: "inset(0% 0 0 0)" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="dossier-inner">
        <motion.div
          className="dossier-banner"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h1>TOP SECRET</h1>
          <div className="op-name">{d.operationName}</div>
          <div
            style={{
              fontFamily: "'Special Elite', monospace",
              fontSize: "0.75rem",
              color: "var(--ink-faded)",
              marginTop: "8px",
              letterSpacing: "3px",
            }}
          >
            {d.place} &middot; TARGET: {d.target}
          </div>
        </motion.div>

        <motion.div
          className="dossier-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <div className="dossier-section-label">Briefing</div>
          <p className="dossier-text">{d.introduction}</p>
        </motion.div>

        {quoteDisplay ? (
          <motion.div
            className="dossier-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <div className="dossier-quote">{quoteDisplay}</div>
          </motion.div>
        ) : null}

        <motion.div
          className="dossier-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <div className="dossier-section-label">
            Phase 1 — {d.phase1Name || "Reconnaissance"}
          </div>
          <p className="dossier-text">{d.phase1Description}</p>
        </motion.div>

        {photos.length > 0 && (
          <motion.div
            className="dossier-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
          >
            <div className="dossier-section-label">Photographic Evidence</div>
            <div className="dossier-photo-row">
              {photos.map((photo, i) => (
                <div
                  key={i}
                  className="polaroid"
                  style={{ transform: `rotate(${(i - 1) * 3}deg)` }}
                >
                  <div className="polaroid-tape" />
                  <img src={photo.src} alt={photo.label} />
                  <span className="polaroid-label">{photo.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          className="dossier-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
        >
          <div className="dossier-section-label">Intel Gathered</div>
          <div className="dossier-intel-grid">
            <div className="dossier-intel-cell">
              <strong>End Points Mapped</strong>
              {d.intelEndpoints}
            </div>
            <div className="dossier-intel-cell">
              <strong>Guard Rotations</strong>
              {d.intelGuardRotations}
            </div>
            <div className="dossier-intel-cell">
              <strong>Surveillance Hours</strong>
              {d.intelSurveillanceHours}
            </div>
            <div className="dossier-intel-cell">
              <strong>Vulnerabilities Found</strong>
              {d.intelVulnerabilities}
            </div>
          </div>
        </motion.div>

        <motion.div
          className="dossier-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
        >
          <div className="dossier-section-label">Execution</div>
          <p className="dossier-text">{d.executionDescription}</p>
        </motion.div>

        {filledTimeline.length > 0 && (
          <motion.div
            className="dossier-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3 }}
          >
            <div className="dossier-section-label">Operation Timeline</div>
            <div className="dossier-timeline">
              {filledTimeline.map((step, i) => (
                <div key={i} className="dossier-timeline-node">
                  <div className="dossier-timeline-time">{step.time}</div>
                  <div className="dossier-timeline-desc">{step.description}</div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          className="dossier-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
        >
          <div className="dossier-section-label">Extraction</div>
          <div className="extraction-section">
            <p className="dossier-text">{d.extractionPlan}</p>
          </div>
        </motion.div>

        {crewList.length > 0 && (
          <motion.div
            className="dossier-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <div className="dossier-section-label">Assembled Crew</div>
            <div className="dossier-crew-grid">
              {crewList.map((member, i) => (
                <motion.div
                  key={i}
                  className="dossier-crew-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.6 + i * 0.1 }}
                >
                  {member.threatLevel && (
                    <span
                      className={`threat-badge ${threatBadgeClass[member.threatLevel] || ""}`}
                    >
                      {member.threatLevel}
                    </span>
                  )}
                  <div className="crew-title">{member.title || "Unknown"}</div>
                  <div className="crew-job">{member.job}</div>
                  {member.moneyShare && (
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--accent-gold)",
                        fontWeight: "700",
                        margin: "4px 0",
                      }}
                    >
                      💰 {member.moneyShare}
                    </div>
                  )}
                  {member.requirements && (
                    <div className="crew-req">Requires: {member.requirements}</div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="dossier-actions no-print">
          <button className="dossier-action-btn" type="button" onClick={() => window.print()}>
            🖨 Print Dossier
          </button>
          <button className="dossier-action-btn" type="button" onClick={onReset}>
            {resetLabel}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
