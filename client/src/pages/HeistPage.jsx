import React, { useRef, useState, useEffect, useCallback } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import "../styles/HeistPage.css";

// ─────────────────────────────────────────────
// Typewriter Hook
// ─────────────────────────────────────────────
function useTypewriter(text, speed = 40, startDelay = 0, trigger = true) {
  const [displayed, setDisplayed] = useState("");
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    if (!trigger) {
      setDisplayed("");
      setIsDone(false);
      return;
    }
    setDisplayed("");
    setIsDone(false);
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          setIsDone(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay, trigger]);

  return { displayed, isDone };
}

// ─────────────────────────────────────────────
// Scroll-triggered section wrapper
// ─────────────────────────────────────────────
function ScrollSection({ children, className = "", id }) {
  return (
    <motion.section
      id={id}
      className={`heist-section ${className}`}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: false, amount: 0.3 }}
      transition={{ duration: 0.8 }}
    >
      {children}
    </motion.section>
  );
}

// ─────────────────────────────────────────────
// Animated text block
// ─────────────────────────────────────────────
function RevealBlock({ children, delay = 0, direction = "up" }) {
  const yOffset = direction === "up" ? 50 : direction === "down" ? -50 : 0;
  const xOffset = direction === "left" ? 50 : direction === "right" ? -50 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: yOffset, x: xOffset }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: false, amount: 0.5 }}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Typewriter component
// ─────────────────────────────────────────────
function TypewriterText({ text, speed = 30, className = "" }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const { displayed, isDone } = useTypewriter(text, speed, 200, inView);

  return (
    <span ref={ref} className={className}>
      {displayed}
      {!isDone && inView && <span className="typewriter-cursor" />}
    </span>
  );
}

// ─────────────────────────────────────────────
// Redacted text span
// ─────────────────────────────────────────────
function RedactedSpan({ children }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <span
      className="redact"
      style={revealed ? { background: "rgba(192,57,43,0.15)", color: "var(--heist-accent-red)" } : {}}
      onClick={() => setRevealed(!revealed)}
      title="Click to reveal"
    >
      {children}
    </span>
  );
}

// ─────────────────────────────────────────────
// Heat level bar
// ─────────────────────────────────────────────
function HeatBar({ level, label }) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="heat-level" ref={ref}>
      <div className="heat-label">
        <span>{label}</span>
        <span className="heat-value">{level}%</span>
      </div>
      <div className="heat-bar-track">
        <motion.div
          className="heat-bar-fill"
          initial={{ width: 0 }}
          animate={inView ? { width: `${level}%` } : { width: 0 }}
          transition={{ duration: 1.8, ease: [0.25, 0.46, 0.45, 0.94], delay: 0.3 }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const HeistPage = () => {
  const containerRef = useRef(null);
  const [activePhase, setActivePhase] = useState(0);

  // Scroll progress
  const { scrollYProgress } = useScroll({ container: containerRef });
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Background parallax transforms
  const bgY1 = useTransform(scrollYProgress, [0, 0.33], ["0%", "-8%"]);
  const bgY2 = useTransform(scrollYProgress, [0.33, 0.66], ["0%", "-8%"]);
  const bgY3 = useTransform(scrollYProgress, [0.66, 1], ["0%", "-8%"]);

  // Background transitions
  const bg1Opacity = useTransform(scrollYProgress, [0, 0.28, 0.35], [1, 1, 0]);
  const bg2Opacity = useTransform(scrollYProgress, [0.28, 0.35, 0.62, 0.68], [0, 1, 1, 0]);
  const bg3Opacity = useTransform(scrollYProgress, [0.62, 0.68, 1], [0, 1, 1]);

  // Background filter effects
  const bg1Blur = useTransform(scrollYProgress, [0, 0.15, 0.3], [0, 2, 6]);
  const bg2Blur = useTransform(scrollYProgress, [0.35, 0.5, 0.65], [0, 2, 5]);
  const bg3Blur = useTransform(scrollYProgress, [0.68, 0.85, 1], [0, 1, 3]);

  // Track active phase
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => {
      if (v < 0.33) setActivePhase(0);
      else if (v < 0.66) setActivePhase(1);
      else setActivePhase(2);
    });
    return unsubscribe;
  }, [scrollYProgress]);

  const backgrounds = [
    "/assets/heist/phase1_recon.png",
    "/assets/heist/phase2_execution.png",
    "/assets/heist/phase3_extraction.png",
  ];

  return (
    <div className="heist-page" ref={containerRef}>
      {/* ── Progress Bar ── */}
      <div className="heist-progress">
        <motion.div className="heist-progress-bar" style={{ scaleX }} />
      </div>

      {/* ── Scanline Overlay ── */}
      <div className="scanlines" />

      {/* ── Fixed Background Layers ── */}
      <motion.div
        className="heist-bg-layer"
        style={{
          opacity: bg1Opacity,
          filter: useTransform(bg1Blur, (v) => `blur(${v}px) grayscale(0.2)`),
          y: bgY1,
        }}
      >
        <img src={backgrounds[0]} alt="" loading="eager" />
      </motion.div>

      <motion.div
        className="heist-bg-layer"
        style={{
          opacity: bg2Opacity,
          filter: useTransform(bg2Blur, (v) => `blur(${v}px) saturate(1.3)`),
          y: bgY2,
        }}
      >
        <img src={backgrounds[1]} alt="" loading="eager" />
      </motion.div>

      <motion.div
        className="heist-bg-layer"
        style={{
          opacity: bg3Opacity,
          filter: useTransform(bg3Blur, (v) => `blur(${v}px) grayscale(0.4)`),
          y: bgY3,
        }}
      >
        <img src={backgrounds[2]} alt="" loading="eager" />
      </motion.div>

      {/* ── Dark Gradient Overlay ── */}
      <div className="heist-bg-overlay" />

      {/* ── Scroll Content ── */}
      <div className="heist-scroll-content">

        {/* ═══════════════════════════════════
            HERO / COVER
        ═══════════════════════════════════ */}
        <section className="heist-hero" id="heist-hero">
          <motion.div
            className="heist-hero-inner"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              className="heist-classification"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              TS//SCI — EYES ONLY
            </motion.div>

            <h1 className="heist-hero-title">
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                Operation
              </motion.span>
              <motion.span
                className="accent-gold"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                Midnight
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              >
                Meridian
              </motion.span>
            </h1>

            <motion.p
              className="heist-hero-subtitle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
            >
              A three-phase extraction targeting the Orion Continental Vault.
              Estimated yield: $47.2M in bearer bonds and crypto cold storage.
              Zero casualties. Zero traces. Complete deniability.
            </motion.p>

            <motion.div
              className="heist-hero-meta"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.8, duration: 0.8 }}
            >
              <span>Case File: OM-7734</span>
              <span className="dot" />
              <span>Threat Level: APEX</span>
              <span className="dot" />
              <span>Declassified: 2026.04.03</span>
            </motion.div>
          </motion.div>

          <motion.div
            className="scroll-indicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.8 }}
          >
            <span>Scroll to Declassify</span>
            <div className="scroll-line" />
          </motion.div>
        </section>

        {/* ═══════════════════════════════════
            MISSION OBJECTIVE TYPEWRITER
        ═══════════════════════════════════ */}
        <ScrollSection id="mission-objective">
          <div className="heist-section-content">
            <RevealBlock>
              <div className="mission-objective">
                <div className="obj-label">Priority Alpha — Mission Objective</div>
                <div className="obj-text">
                  <TypewriterText
                    text="INTERCEPT AND EXTRACT ALL ASSETS FROM ORION CONTINENTAL VAULT, SUBLEVEL B-7. NEUTRALIZE DIGITAL SURVEILLANCE. ESTABLISH PARALLEL FINANCIAL PIPELINE THROUGH OFFSHORE GRID. ALL OPERATIVES MUST ACHIEVE ZERO-TRACE EXFIL WITHIN 47 MINUTES OF INITIAL BREACH."
                    speed={25}
                  />
                </div>
              </div>
            </RevealBlock>
          </div>
        </ScrollSection>

        {/* Divider */}
        <div className="section-divider">
          <div className="divider-line" />
          <div className="divider-icon">Phase I</div>
          <div className="divider-line" />
        </div>

        {/* ═══════════════════════════════════
            PHASE 1: INTEL & RECONNAISSANCE
        ═══════════════════════════════════ */}
        <ScrollSection id="phase-1-header">
          <div className="heist-section-content">
            <RevealBlock>
              <div className="phase-header">
                <div className="phase-number">Phase 01 — Intel &amp; Reconnaissance</div>
                <h2 className="phase-title amber">
                  Know Thy <br />Enemy
                </h2>
              </div>
            </RevealBlock>
            <RevealBlock delay={0.15}>
              <p className="narrative-text">
                Three months before the breach window opened, <em>Ghost</em> embedded a fiber-optic relay
                within the facility's telecommunications backbone. Every security rotation, every camera angle,
                every biometric handshake was catalogued into an encrypted <strong>dead-drop server</strong> in
                the Cayman Islands.
              </p>
            </RevealBlock>
            <RevealBlock delay={0.25}>
              <p className="narrative-text">
                The target — <em>Orion Continental</em> — is a military-grade private vault operated by a consortium
                of anonymous wealth managers. Its existence doesn't appear in any public record. Its blueprints
                were classified as restricted under three separate national security frameworks.
              </p>
            </RevealBlock>
          </div>
        </ScrollSection>

        <ScrollSection id="phase-1-redacted">
          <div className="heist-section-content">
            <RevealBlock>
              <div className="redacted-doc">
                <div className="doc-header">
                  <span>Document ID: OM-RECON-0042</span>
                  <span className="stamp">CLASSIFIED</span>
                </div>
                <div className="redacted-text">
                  TARGET FACILITY: Orion Continental Vault, <RedactedSpan>Geneva, Sub-District 9</RedactedSpan><br />
                  SECURITY TIER: <RedactedSpan>Tier-7 Omega Protocol</RedactedSpan><br />
                  GUARD ROTATION: 4-hour shifts, <RedactedSpan>12 armed personnel</RedactedSpan> per cycle<br />
                  VAULT ACCESS: Triple biometric + <RedactedSpan>quantum-encrypted key card</RedactedSpan><br />
                  SURVEILLANCE: 847 cameras, <RedactedSpan>AI-driven anomaly detection</RedactedSpan><br />
                  WEAK POINT: Service tunnel B-7 — <RedactedSpan>ventilation access at 03:47 UTC</RedactedSpan><br />
                  WINDOW: <RedactedSpan>47 minutes during shift rotation overlap</RedactedSpan>
                </div>
              </div>
            </RevealBlock>
          </div>
        </ScrollSection>

        <ScrollSection id="phase-1-intel">
          <div className="heist-section-content">
            <RevealBlock>
              <div className="intel-grid">
                <motion.div
                  className="intel-card"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="label">Target Value</div>
                  <div className="value">$47.2M</div>
                  <div className="detail">Bearer bonds + Crypto</div>
                </motion.div>
                <motion.div
                  className="intel-card"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="label">Security Systems</div>
                  <div className="value">847</div>
                  <div className="detail">Active camera feeds</div>
                </motion.div>
                <motion.div
                  className="intel-card"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="label">Breach Window</div>
                  <div className="value">47 min</div>
                  <div className="detail">Shift rotation overlap</div>
                </motion.div>
                <motion.div
                  className="intel-card"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="label">Personnel</div>
                  <div className="value">6</div>
                  <div className="detail">Active operatives</div>
                </motion.div>
              </div>
            </RevealBlock>

            <RevealBlock delay={0.2}>
              <div className="pull-quote">
                <p>"The vault doesn't exist on any map. That's exactly how they want it. And that's exactly how we'll take it."</p>
                <cite>— Ghost, Lead Intelligence Officer</cite>
              </div>
            </RevealBlock>
          </div>
        </ScrollSection>

        {/* Divider */}
        <div className="section-divider">
          <div className="divider-line" />
          <div className="divider-icon">Phase II</div>
          <div className="divider-line" />
        </div>

        {/* ═══════════════════════════════════
            PHASE 2: THE EXECUTION
        ═══════════════════════════════════ */}
        <ScrollSection id="phase-2-header">
          <div className="heist-section-content">
            <RevealBlock>
              <div className="phase-header">
                <div className="phase-number">Phase 02 — The Execution</div>
                <h2 className="phase-title red">
                  The Clock <br />Starts Now
                </h2>
              </div>
            </RevealBlock>
            <RevealBlock delay={0.15}>
              <p className="narrative-text">
                At precisely <strong>03:47 UTC</strong>, the ventilation failsafe on Sublevel B-7 cycles to
                maintenance mode for exactly <em>14 seconds</em>. That's the insertion window. After that,
                every second is accounted for — every movement choreographed to the millisecond.
              </p>
            </RevealBlock>
            <RevealBlock delay={0.25}>
              <p className="narrative-text">
                <em>Specter</em> deploys a custom EMP pulse from the adjacent utility corridor, creating a
                <strong> 90-second blackout</strong> in the central monitoring hub. In that window, <em>Wraith</em> bypasses
                the biometric locks using a cloned retinal pattern harvested from a compromised executive.
              </p>
            </RevealBlock>
          </div>
        </ScrollSection>

        <ScrollSection id="phase-2-timeline">
          <div className="heist-section-content">
            <RevealBlock>
              <div className="heist-timeline">
                <motion.div
                  className="timeline-entry active"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0 }}
                >
                  <div className="timeline-time">T-00:00 — Breach</div>
                  <div className="timeline-event">Ventilation Failsafe Activation</div>
                  <div className="timeline-desc">
                    Wraith enters through service tunnel B-7 during planned 14-second maintenance window.
                  </div>
                </motion.div>

                <motion.div
                  className="timeline-entry"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="timeline-time">T+02:14 — EMP Deployed</div>
                  <div className="timeline-event">Central Monitoring Blackout</div>
                  <div className="timeline-desc">
                    Specter's custom EMP package disables 847 cameras for 90 seconds. AI anomaly detection enters reboot cycle.
                  </div>
                </motion.div>

                <motion.div
                  className="timeline-entry"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="timeline-time">T+04:30 — Biometric Override</div>
                  <div className="timeline-event">Vault Door Alpha Breached</div>
                  <div className="timeline-desc">
                    Cloned executive retinal pattern deployed. Triple biometric lock bypassed in under 8 seconds.
                  </div>
                </motion.div>

                <motion.div
                  className="timeline-entry active"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="timeline-time">T+12:00 — Asset Transfer</div>
                  <div className="timeline-event">Bearer Bonds & Crypto Keys Secured</div>
                  <div className="timeline-desc">
                    Phantom accesses cold storage. 14 hardware wallets extracted. $47.2M in bearer bonds sealed in EMP-shielded cases.
                  </div>
                </motion.div>

                <motion.div
                  className="timeline-entry"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="timeline-time">T+38:00 — Clean Sweep</div>
                  <div className="timeline-event">Digital Forensics Erasure</div>
                  <div className="timeline-desc">
                    Ghost deploys recursive data wipe across vault's internal logging. Backup tapes magnetically scrambled.
                  </div>
                </motion.div>

                <motion.div
                  className="timeline-entry active"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: false, amount: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  <div className="timeline-time">T+44:22 — Exfiltration</div>
                  <div className="timeline-event">All Operatives Clear</div>
                  <div className="timeline-desc">
                    Team exits via three separate routes. Extraction vehicles staged at Points Alpha, Bravo, Delta.
                  </div>
                </motion.div>
              </div>
            </RevealBlock>
          </div>
        </ScrollSection>

        <ScrollSection id="phase-2-heat">
          <div className="heist-section-content">
            <RevealBlock>
              <HeatBar level={92} label="Threat Level — Active" />
            </RevealBlock>
            <RevealBlock delay={0.1}>
              <HeatBar level={78} label="Detection Probability" />
            </RevealBlock>
            <RevealBlock delay={0.2}>
              <HeatBar level={15} label="Margin for Error" />
            </RevealBlock>

            <RevealBlock delay={0.35}>
              <div className="personnel-grid">
                {[
                  { role: "Team Lead", codename: "Spectre", specialty: "Tactical command, explosives, comms override. 14 years field ops.", status: true },
                  { role: "Intelligence", codename: "Ghost", specialty: "SIGINT, counter-surveillance, digital forensics. Former NSA.", status: true },
                  { role: "Infiltration", codename: "Wraith", specialty: "Biometric bypass, lock manipulation, close-quarters entry.", status: true },
                  { role: "Extraction", codename: "Phantom", specialty: "Asset transfer, crypto security, financial routing.", status: true },
                  { role: "Overwatch", codename: "Shade", specialty: "Perimeter defense, drone counter-measures, exit coordination.", status: true },
                  { role: "Wheelman", codename: "Drift", specialty: "Tactical driving, route optimization, vehicle modification.", status: true },
                ].map((p, i) => (
                  <motion.div
                    key={p.codename}
                    className="personnel-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.5, delay: i * 0.08 }}
                    whileHover={{ y: -4 }}
                  >
                    <div className="status-dot" />
                    <div className="role-tag">{p.role}</div>
                    <div className="codename">{p.codename}</div>
                    <div className="specialty">{p.specialty}</div>
                  </motion.div>
                ))}
              </div>
            </RevealBlock>
          </div>
        </ScrollSection>

        {/* Divider */}
        <div className="section-divider">
          <div className="divider-line" />
          <div className="divider-icon">Phase III</div>
          <div className="divider-line" />
        </div>

        {/* ═══════════════════════════════════
            PHASE 3: EXTRACTION & LAUNDERING
        ═══════════════════════════════════ */}
        <ScrollSection id="phase-3-header">
          <div className="heist-section-content">
            <RevealBlock>
              <div className="phase-header">
                <div className="phase-number">Phase 03 — Extraction &amp; Laundering</div>
                <h2 className="phase-title green">
                  Vanishing <br />Act
                </h2>
              </div>
            </RevealBlock>
            <RevealBlock delay={0.15}>
              <p className="narrative-text">
                The assets leave Geneva in three separate streams — none traceable to the same origin.
                <em> Phantom</em> designed a <strong>seven-layer obfuscation pipeline</strong> that routes
                each tranche through shell companies in jurisdictions that don't cooperate with
                international law enforcement.
              </p>
            </RevealBlock>
            <RevealBlock delay={0.25}>
              <p className="narrative-text">
                By the time Orion's security team discovers the breach during the 08:00 shift change,
                the assets will have already been <strong>fragmented, converted, and distributed</strong> across
                140+ wallets spanning 22 blockchain networks. The physical bearer bonds will be in a diplomatic
                pouch bound for a non-extradition sovereign territory.
              </p>
            </RevealBlock>
          </div>
        </ScrollSection>

        <ScrollSection id="phase-3-flow">
          <div className="heist-section-content">
            <RevealBlock>
              <div className="money-flow">
                {[
                  {
                    num: "01",
                    title: "Initial Fragmentation",
                    desc: "Assets split into 7 tranches across 3 continents. Each tranche assigned a unique cryptographic signature.",
                  },
                  {
                    num: "02",
                    title: "Shell Company Pipeline",
                    desc: "Route through Cayman SPV → Liechtenstein foundation → Singapore trust. Triple-blind incorporation.",
                  },
                  {
                    num: "03",
                    title: "Blockchain Dispersion",
                    desc: "Crypto assets fragmented across 140+ wallets on 22 networks. Tornado-style mixing with custom zero-knowledge bridges.",
                  },
                  {
                    num: "04",
                    title: "Bearer Bond Transit",
                    desc: "Physical instruments sealed in diplomatic pouches. Three couriers via three non-extradition jurisdictions.",
                  },
                  {
                    num: "05",
                    title: "Final Settlement",
                    desc: "Consolidated into clean instruments 72 hours post-breach. Untraceable. Unrecoverable. Invisible.",
                  },
                ].map((step, i) => (
                  <motion.div
                    key={step.num}
                    className="flow-step"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.5 }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  >
                    <div className="flow-step-number">{step.num}</div>
                    <div className="flow-step-content">
                      <div className="flow-title">{step.title}</div>
                      <div className="flow-desc">{step.desc}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </RevealBlock>
          </div>
        </ScrollSection>

        <ScrollSection id="phase-3-endgame">
          <div className="heist-section-content">
            <RevealBlock>
              <div className="redacted-doc">
                <div className="doc-header">
                  <span>Financial Exit Report — FINAL</span>
                  <span className="stamp">BURN AFTER READING</span>
                </div>
                <div className="redacted-text">
                  TOTAL EXTRACTED: <RedactedSpan>$47,218,400 USD equivalent</RedactedSpan><br />
                  CRYPTO ALLOCATION: <RedactedSpan>$31.4M across 22 networks</RedactedSpan><br />
                  BEARER INSTRUMENTS: <RedactedSpan>$15.8M in physical bonds</RedactedSpan><br />
                  LAUNDERING FEE: <RedactedSpan>8.5% — distributed to intermediaries</RedactedSpan><br />
                  NET TO PRINCIPALS: <RedactedSpan>$43.2M — settlement in 72 hours</RedactedSpan><br />
                  TRACE PROBABILITY: <RedactedSpan>0.003% per Phantom's models</RedactedSpan><br />
                  STATUS: <RedactedSpan>OPERATION COMPLETE — ALL CLEAR</RedactedSpan>
                </div>
              </div>
            </RevealBlock>

            <RevealBlock delay={0.2}>
              <div className="pull-quote">
                <p>"We were never here. This never happened. And the $47 million? It never existed."</p>
                <cite>— Spectre, final comms transmission</cite>
              </div>
            </RevealBlock>
          </div>
        </ScrollSection>

        {/* ═══════════════════════════════════
            FINAL — CLASSIFIED STAMP
        ═══════════════════════════════════ */}
        <ScrollSection id="heist-end">
          <div className="heist-section-content" style={{ textAlign: "center" }}>
            <RevealBlock>
              <motion.div
                initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                viewport={{ once: false, amount: 0.5 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                style={{
                  display: "inline-block",
                  border: "3px solid var(--heist-accent-red)",
                  padding: "1.5rem 3rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: "var(--heist-accent-red)",
                  transform: "rotate(-5deg)",
                  opacity: 0.7,
                }}
              >
                FILE CLOSED
              </motion.div>
            </RevealBlock>
          </div>
        </ScrollSection>

        {/* Footer */}
        <div className="dossier-footer">
          <div className="end-stamp">
            End of Classified Dossier — Operation Midnight Meridian — All Rights Denied
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeistPage;
