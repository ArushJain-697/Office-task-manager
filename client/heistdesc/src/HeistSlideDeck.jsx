import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import {
  Eye,
  Crosshair,
  Shield,
  Users,
  DollarSign,
  Lock,
  Fingerprint,
  Wifi,
  Globe,
  Layers,
  ChevronRight,
  ChevronLeft,
  Scan,
  AlertTriangle,
  Clock,
  Zap,
  CheckCircle2,
} from "lucide-react";

let applySoundCtx = null;
/** Mechanical latch + brief seal tone for the roster Apply control */
function playApplySound() {
  try {
    if (!applySoundCtx) {
      applySoundCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (applySoundCtx.state === "suspended") applySoundCtx.resume();
    const t = applySoundCtx.currentTime;
    const thud = applySoundCtx.createOscillator();
    const thudGain = applySoundCtx.createGain();
    thud.type = "triangle";
    thud.frequency.setValueAtTime(220, t);
    thud.frequency.exponentialRampToValueAtTime(55, t + 0.11);
    thudGain.gain.setValueAtTime(0.32, t);
    thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    thud.connect(thudGain);
    thudGain.connect(applySoundCtx.destination);
    thud.start(t);
    thud.stop(t + 0.2);
    const noiseLen = Math.floor(applySoundCtx.sampleRate * 0.06);
    const noiseBuf = applySoundCtx.createBuffer(1, noiseLen, applySoundCtx.sampleRate);
    const ch = noiseBuf.getChannelData(0);
    for (let i = 0; i < noiseLen; i++) ch[i] = (Math.random() * 2 - 1) * 0.35;
    const noise = applySoundCtx.createBufferSource();
    noise.buffer = noiseBuf;
    const nGain = applySoundCtx.createGain();
    nGain.gain.setValueAtTime(0.12, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
    noise.connect(nGain);
    nGain.connect(applySoundCtx.destination);
    noise.start(t);
    const seal = applySoundCtx.createOscillator();
    const sGain = applySoundCtx.createGain();
    seal.type = "sine";
    seal.frequency.setValueAtTime(660, t + 0.08);
    seal.frequency.exponentialRampToValueAtTime(990, t + 0.14);
    sGain.gain.setValueAtTime(0, t + 0.07);
    sGain.gain.linearRampToValueAtTime(0.22, t + 0.09);
    sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    seal.connect(sGain);
    sGain.connect(applySoundCtx.destination);
    seal.start(t + 0.07);
    seal.stop(t + 0.42);
  } catch {
    /* ignore */
  }
}

// ════════════════════════════════════════════════════════
// DESIGN TOKENS
// ════════════════════════════════════════════════════════
const FONT = {
  mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
  sans: "'Inter', system-ui, sans-serif",
  serif: "'Playfair Display', Georgia, serif",
};

// ════════════════════════════════════════════════════════
// GLOBAL SETUP — fonts, scrollbar, keyframes
// ════════════════════════════════════════════════════════
function useGlobalSetup() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900&family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = `
      html { scroll-behavior: smooth; }
      body { overflow: hidden; background: #09090b; margin: 0; }
      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-track { background: #09090b; }
      ::-webkit-scrollbar-thumb { background: rgba(239,68,68,0.3); border-radius: 99px; }
      ::selection { background: rgba(239,68,68,0.25); color: #fff; }

      @keyframes glitch-1 {
        0%, 100% { clip-path: inset(0 0 95% 0); transform: translate(0); }
        20% { clip-path: inset(30% 0 40% 0); transform: translate(-3px, 1px); }
        40% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
        60% { clip-path: inset(10% 0 70% 0); transform: translate(-2px, 1px); }
        80% { clip-path: inset(80% 0 5% 0); transform: translate(3px, -1px); }
      }
      @keyframes glitch-2 {
        0%, 100% { clip-path: inset(95% 0 0 0); transform: translate(0); }
        25% { clip-path: inset(20% 0 50% 0); transform: translate(2px, 1px); }
        50% { clip-path: inset(50% 0 20% 0); transform: translate(-2px, -1px); }
        75% { clip-path: inset(70% 0 15% 0); transform: translate(1px, 1px); }
      }
      @keyframes flicker {
        0%, 100% { opacity: 1; }
        92% { opacity: 1; }
        93% { opacity: 0.4; }
        94% { opacity: 1; }
        96% { opacity: 0.7; }
        97% { opacity: 1; }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);
}

// ════════════════════════════════════════════════════════
// DUMMY DATA
// ════════════════════════════════════════════════════════
const MISSION_DATA = {
  codename: "OPERATION NIGHTHAWK",
  location: "Zürich, Switzerland — 47.3769° N, 8.5417° E",
  target: "Veridian Group Quantum Ledger",
  classification: "ULTRA // EYES ONLY",
  date: "2026-04-10",
  briefing:
    "A precision extraction targeting the Veridian Group's encrypted quantum ledger — housing $4.7B in undisclosed digital assets. The vault sits 40 meters below Lake Zürich in a decommissioned NATO bunker. Three layers of biometric defense. One shot. No second chances.",
  quote: {
    text: "The best thieves don't break in. They're invited.",
    author: "— The Architect, Berlin, 2024",
  },
  recon: {
    title: "Reconnaissance",
    subtitle: "14 weeks of silent, patient observation",
    description:
      "Every access point mapped. Every guard rotation logged to the second. The target's digital perimeter — 847 endpoints — was passively reconstructed over 90 days of packet analysis. We identified 23 persons of interest and built social engineering profiles for each.",
    stats: [
      { label: "Endpoints Mapped", value: "847", icon: Scan },
      { label: "Guard Rotations", value: "14/day", icon: Eye },
      { label: "Surveillance Hours", value: "2,160", icon: Clock },
      { label: "Vulnerabilities Found", value: "3", icon: AlertTriangle },
    ],
    image: "/surveillance_01.png",
    imageCaption: "TGT-NORTH — 23:45:12 GMT",
  },
  execution: {
    title: "Execution",
    subtitle: "58 seconds. Zero margin for error.",
    description:
      "The operation was choreographed to the millisecond. A cascading supply-chain compromise planted six months prior gave us the beachhead. The 4.7-second authentication gap between biometric scan and network handshake was our window. Nobody patched it. We noticed.",
    timeline: [
      { time: "00:00", event: "Comms go live — encrypted mesh across 3 continents", critical: true },
      { time: "00:08", event: "Perimeter breach — primary firewall bypassed", critical: false },
      { time: "00:19", event: "Authentication override — biometric tokens spoofed", critical: true },
      { time: "00:34", event: "Data exfiltration — 2.4TB through 7 relay nodes", critical: false },
      { time: "00:47", event: "Countermeasures deployed — logs rewritten", critical: false },
      { time: "00:58", event: "Extraction complete — all connections severed", critical: true },
    ],
    image: "/surveillance_02.png",
    imageCaption: "CCTV-SR4 — 02:37:14 UTC",
  },
  extraction: {
    title: "Extraction",
    subtitle: "We don't escape. We evaporate.",
    description:
      "Within 72 hours, every digital identity was burned. Every physical trace sanitized. Assets split across 47 shell corporations spanning 12 jurisdictions. Fiat to crypto, mixed through decentralized protocols, reconverted through compliant exchanges. Clean capital re-enters through real estate, art, and venture investments.",
    terminalLines: [
      { cmd: "> initiating identity dissolution protocol...", status: null },
      { cmd: "> digital footprints:", status: "PURGED" },
      { cmd: "> biometric records:", status: "CORRUPTED" },
      { cmd: "> financial trails:", status: "SEVERED" },
      { cmd: "> surveillance archives:", status: "OVERWRITTEN" },
      { cmd: "> status:", status: "GHOST PROTOCOL COMPLETE" },
    ],
    image: "/surveillance_03.png",
    imageCaption: "SAT-RECON — 34.7210° N",
  },
  crew: [
    {
      name: "The Architect",
      role: "Systems Design & Exploitation",
      icon: "Layers",
      share: 30,
      threat: 5,
      bio: "Former infrastructure lead for three Fortune 100 companies. Sees every system as a puzzle already solved.",
    },
    {
      name: "The Phantom",
      role: "Network Infiltration",
      icon: "Wifi",
      share: 25,
      threat: 5,
      bio: "Zero digital footprint. Moves through networks like water through cracks. Never triggered an IDS alert.",
    },
    {
      name: "The Face",
      role: "Social Engineering",
      icon: "Globe",
      share: 20,
      threat: 4,
      bio: "Maintains 14 concurrent identities across 6 countries. The most dangerous weapon is trust.",
    },
    {
      name: "The Fixer",
      role: "Logistics & Extraction",
      icon: "Shield",
      share: 15,
      threat: 4,
      bio: "Ex-military logistics. Can move anything, anywhere, without a trace. Safe houses in 9 countries.",
    },
    {
      name: "The Banker",
      role: "Financial Obfuscation",
      icon: "DollarSign",
      share: 10,
      threat: 3,
      bio: "Makes money disappear and reappear clean. 47 shell corps across 12 jurisdictions. Zero paper trail.",
    },
  ],
  threatLevel: 4,
  maxThreat: 5,
};

const ICON_MAP = { Layers, Wifi, Globe, Shield, DollarSign };

// ════════════════════════════════════════════════════════
// STEP METADATA
// ════════════════════════════════════════════════════════
const STEPS = [
  { label: "BRIEFING", icon: Lock },
  { label: "RECON", icon: Eye },
  { label: "EXECUTION", icon: Crosshair },
  { label: "EXTRACTION", icon: Fingerprint },
  { label: "THE ROSTER", icon: Users },
];

// ════════════════════════════════════════════════════════
// ANIMATION VARIANTS — cinematic blur/slide, NOT bouncy
// ════════════════════════════════════════════════════════
const pageVariants = {
  enter: (dir) => ({
    opacity: 0,
    y: dir > 0 ? 50 : -50,
    filter: "blur(14px)",
    scale: 0.97,
  }),
  center: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    scale: 1,
  },
  exit: (dir) => ({
    opacity: 0,
    y: dir > 0 ? -35 : 35,
    filter: "blur(10px)",
    scale: 0.98,
  }),
};

const pageTrans = {
  duration: 0.65,
  ease: [0.25, 0.46, 0.45, 0.94],
};

// ════════════════════════════════════════════════════════
// UTILITY: Noise & Scanline
// ════════════════════════════════════════════════════════
function NoiseOverlay() {
  return (
    <div
      className="pointer-events-none fixed   inset-0 z-[9999]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        opacity: 0.25,
        mixBlendMode: "overlay",
      }}
    />
  );
}

function ScanlineOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9998]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
      }}
    />
  );
}

// ════════════════════════════════════════════════════════
// GLITCH TEXT
// ════════════════════════════════════════════════════════
function GlitchText({ children, className = "" }) {
  return (
    <span className={`relative inline-block ${className}`} style={{ animation: "flicker 5s infinite" }}>
      {children}
      <span
        className="absolute inset-0 text-red-500/20"
        style={{ animation: "glitch-1 3s infinite steps(1)" }}
        aria-hidden
      >
        {children}
      </span>
      <span
        className="absolute inset-0 text-cyan-500/10"
        style={{ animation: "glitch-2 2.8s infinite steps(1)" }}
        aria-hidden
      >
        {children}
      </span>
    </span>
  );
}

// ════════════════════════════════════════════════════════
// SURVEILLANCE PHOTO — digital scan / polaroid
// ════════════════════════════════════════════════════════
function SurveillancePhoto({ src, caption, className = "" }) {
  return (
    <motion.div
      className={`relative mx-auto ${className}`}
      initial={{ opacity: 0, scale: 0.93, rotate: -0.8 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="relative bg-zinc-950 border border-zinc-800/50 p-2.5 shadow-2xl shadow-black/60 max-w-xs mx-auto">
        {/* Corner markers */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-red-500/40" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-red-500/40" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-red-500/40" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-red-500/40" />
        <div className="relative overflow-hidden group">
          <img
            src={src}
            alt="Surveillance capture"
            className="w-full h-auto object-cover grayscale brightness-[0.7] contrast-125"
            style={{ maxHeight: "220px" }}
          />
          
          {/* Animated Bounding Boxes - "the boxes" user referred to */}
          <motion.div 
            className="absolute border border-red-500/40 z-10"
            style={{ top: '25%', left: '35%', width: '40px', height: '60px' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          >
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-red-500" />
            <div className="absolute top-[100%] left-0 text-[6px] text-red-500 font-bold bg-zinc-950/80 px-0.5 whitespace-nowrap">
              ID: SUBJECT_ALPHA
            </div>
          </motion.div>

          <motion.div 
            className="absolute border border-cyan-500/30 z-10"
            style={{ top: '60%', left: '70%', width: '30px', height: '30px' }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.4 }}
          >
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t border-l border-cyan-500" />
            <div className="absolute top-[100%] left-0 text-[6px] text-cyan-500 font-bold bg-zinc-950/80 px-0.5 whitespace-nowrap">
              PATH_CALC
            </div>
          </motion.div>

          <motion.div
            className="absolute left-0 right-0 h-[2px] bg-red-500/25 z-20"
            animate={{ top: ["0%", "100%", "0%"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(255,0,0,0.1) 1px, rgba(255,0,0,0.1) 2px)",
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-[9px] tracking-[0.25em] uppercase text-red-500/50" style={{ fontFamily: FONT.mono }}>
            {caption}
          </span>
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.15, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════
// STEP INDICATOR — top nav rail
// ════════════════════════════════════════════════════════
function StepIndicator({ current, total }) {
  return (
    <div className="flex items-center gap-0 w-full max-w-lg mx-auto">
      {Array.from({ length: total }).map((_, i) => {
        const Icon = STEPS[i].icon;
        const active = i === current;
        const done = i < current;
        return (
          <React.Fragment key={i}>
            <div className="flex flex-col items-center gap-1.5 relative z-10">
              <motion.div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                  active
                    ? "border-red-500 bg-red-500/10 shadow-lg shadow-red-500/20"
                    : done
                    ? "border-red-800/50 bg-red-950/30"
                    : "border-zinc-800 bg-zinc-900/30"
                }`}
              >
                <Icon
                  className={`w-3 h-3 transition-colors duration-500 ${
                    active ? "text-red-400" : done ? "text-red-700" : "text-zinc-600"
                  }`}
                />
              </motion.div>
              <span
                className={`text-[8px] tracking-[0.2em] uppercase transition-colors duration-500 hidden md:block whitespace-nowrap ${
                  active ? "text-red-400 font-bold" : done ? "text-red-800" : "text-zinc-700"
                }`}
                style={{ fontFamily: FONT.mono, fontSize: "15px", margin: "0 20px"}}
              >
                {STEPS[i].label}
              </span>
            </div>
            {i < total - 1 && (
              <div className="flex-1 h-px relative mx-1.5">
                <div className="absolute inset-0 bg-zinc-800/30" />
                <motion.div
                  className="absolute inset-y-0 left-0 bg-red-600/30"
                  initial={{ width: "0%" }}
                  animate={{ width: done ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  STEP 0 — BRIEFING
// ════════════════════════════════════════════════════════
function StepBriefing({ data }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 md:px-16 py-6">
      {/* Classification */}
      <motion.div
        className="flex items-center gap-5 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <div className="h-px w-14 bg-red-600/25" />
        <span className="text-[10px] tracking-[0.5em] uppercase text-red-500/60 font-semibold" style={{ fontFamily: FONT.mono }}>
          {data.classification}
        </span>
        <div className="h-px w-14 bg-red-600/25" />
      </motion.div>

      {/* Codename */}
      <motion.h1
        className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-5"
        style={{ fontFamily: "Playfair Display" }}
        initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.15, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <GlitchText>{data.codename}</GlitchText>
      </motion.h1>

      {/* Target & Location */}
      <motion.p
        className="text-xs md:text-sm tracking-[0.35em] uppercase text-zinc-500 mb-4"
        style={{ fontFamily: "ui-sans-serif", margin:"30px 0" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
      >
        {data.location}
      </motion.p>

      <motion.p
        className="text-xs tracking-[0.3em] uppercase text-red-500/40 mb-10"
        style={{ fontFamily: "JetBrains Mono", fontWeight: 700,fontSize:"17px"}}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.5 }}
      >
        TARGET: {data.target}
      </motion.p>

      {/* Separator */}
      <motion.div
        className="w-16 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent mb-10"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      />

      {/* Description */}
      <motion.p
        className="text-base md:text-lg lg:text-xl text-zinc-400 leading-relaxed max-w-2xl mb-12"
        style={{ fontFamily: FONT.sans ,margin:"10px 20px"}}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.7 }}
      >
        {data.briefing}
      </motion.p>

      {/* Quote (only when typewriter field "quotes" / legacy "quote" has text) */}
      {(data.quote.text || "").trim() ? (
        <motion.div
          className="relative max-w-xl w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.95, duration: 0.7 }}
        >
          <div className="border-l-2 border-red-500/30 pl-8 py-2 text-left">
            <blockquote
              className="text-xl md:text-2xl italic text-zinc-300/60 leading-relaxed"
              style={{ fontFamily: FONT.serif }}
            >
              "{data.quote.text}"
            </blockquote>
            {data.quote.author ? (
              <p className="text-[10px] tracking-[0.3em] uppercase text-red-500/35 mt-4" style={{ fontFamily: FONT.mono }}>
                {data.quote.author}
              </p>
            ) : null}
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  STEP 1 — RECONNAISSANCE
//  FIX: flex-col gap-10, mb-8 on description, p-6/p-8
// ════════════════════════════════════════════════════════
function StepRecon({ data }) {
  return (
    <div className="relative flex flex-col items-center text-center px-6 md:px-16 py-6">
      {/* Absolute photo on the right corner for large screens — aligned with heading */}
      <div className="hidden lg:block lg:absolute lg:right-[5px] lg:top-[180px] w-[280px] z-20">
        <SurveillancePhoto src={data.recon.image} caption={data.recon.imageCaption} />
      </div>

      {/* Phase badge */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Eye className="w-4 h-4 text-red-500/50" />
        <span className="text-[10px] tracking-[0.4em] uppercase text-red-500/50 font-semibold" style={{ fontFamily: FONT.mono, fontSize: "20px" }}>
          Phase 01 — Reconnaissance
        </span>
      </motion.div>

      {/* Title */}
      <motion.h2
        className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-2 relative"
        style={{ fontFamily: FONT.serif, fontSize: "130px", filter: "url(#noiseFilter)" }}
        initial={{ opacity: 0, y: 22, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.15, duration: 0.7 }}
      >
        <GlitchText>{data.recon.title}</GlitchText>
        <svg className="absolute inset-0 pointer-events-none opacity-20">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
          </filter>
        </svg>
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        className="text-xs md:text-sm text-zinc-500 tracking-wider uppercase mb-8"
        style={{ fontFamily: FONT.mono }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        {data.recon.subtitle}
      </motion.p>

      {/* ──── CONTENT: text centered ──── */}
      <div className="relative w-full flex flex-col items-center">
        {/* Mobile photo (order-2 ensures it comes after text on mobile) */}
        <div className="lg:hidden w-full order-2 mt-10 px-6">
          <SurveillancePhoto src={data.recon.image} caption={data.recon.imageCaption} />
        </div>

        {/* Centered Text Content */}
        <div className="flex flex-col items-center text-center w-full max-w-2xl z-10">
          <motion.p
            className="text-base md:text-lg text-zinc-400 leading-relaxed mb-12"
            style={{ fontFamily: FONT.sans, fontSize: "22px",margin:"10px 0" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            {data.recon.description}
          </motion.p>

          {/* Stats grid — subgrid so numbers are perfectly aligned */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full"
            style={{ gridTemplateRows: "auto" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            {data.recon.stats.map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={idx}
                  className="border border-zinc-800/40 bg-zinc-900/30 p-5 md:p-6 text-center relative flex flex-col items-center"
                  style={{ width: "100%" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/15 to-transparent" />
                  <StatIcon className="w-4 h-4 text-red-500/30 mx-auto mb-3 flex-shrink-0" />
                  <p className="text-[9px] tracking-[0.3em] uppercase text-zinc-600 flex-1" style={{ fontFamily: FONT.mono, fontSize: "10px", fontWeight: "600", margin: "8px 0" }}>
                    {stat.label}
                  </p>
                  <p className="text-2xl md:text-3xl font-black text-white flex-shrink-0" style={{ fontFamily: "Boldonse", fontWeight: "lighter", lineHeight: 1.2, marginTop: "8px" }}>
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  STEP 2 — EXECUTION
// ════════════════════════════════════════════════════════
function StepExecution({ data }) {
  return (
    <div className="relative flex flex-col items-center text-center px-6 md:px-16 py-6">
      {/* Absolute photo on the right corner for large screens — aligned with heading */}
      <div className="hidden lg:block lg:absolute lg:right-[5px] lg:top-[180px] w-[280px] z-20">
        <SurveillancePhoto src={data.execution.image} caption={data.execution.imageCaption} />
      </div>

      {/* Phase badge */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Crosshair className="w-4 h-4 text-red-500/50" />
        <span className="text-[10px] tracking-[0.4em] uppercase text-red-500/50 font-semibold" style={{ fontFamily: FONT.mono, fontSize: "20px" }}>
          Phase 02 — Execution
        </span>
      </motion.div>

      {/* Title */}
      <motion.h2
        className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-2 relative"
        style={{ fontFamily: FONT.serif, fontSize: "130px", filter: "url(#noiseFilter)" }}
        initial={{ opacity: 0, y: 22, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.15, duration: 0.7 }}
      >
        <GlitchText>{data.execution.title}</GlitchText>
        <svg className="absolute inset-0 pointer-events-none opacity-20">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
          </filter>
        </svg>
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        className="text-xs md:text-sm text-zinc-500 tracking-wider uppercase mb-8"
        style={{ fontFamily: FONT.mono }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        {data.execution.subtitle}
      </motion.p>

      {/* ──── CONTENT: floating photo extreme right, timeline centered ──── */}
      <div className="relative w-full flex flex-col items-center">
        {/* Mobile photo */}
        <div className="lg:hidden w-full order-2 mt-10 px-6">
          <SurveillancePhoto src={data.execution.image} caption={data.execution.imageCaption} />
        </div>

        {/* Centered Content (Timeline) */}
        <div className="flex flex-col items-center w-full max-w-2xl z-10">
          {/* Description */}
          <motion.p
            className="text-base md:text-lg text-zinc-400 leading-relaxed text-center mb-12"
            style={{ fontFamily: FONT.sans, fontSize: "22px", margin: "10px 0" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            {data.execution.description}
          </motion.p>

          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <div className="relative pl-6 space-y-5">
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-zinc-800/50" />
              {data.execution.timeline.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="flex items-start gap-5 relative text-left"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + idx * 0.08, duration: 0.4 }}
                >
                  <div className="relative flex-shrink-0 mt-2">
                    <div className={`w-2 h-2 rounded-full ${item.critical ? "bg-red-500" : "bg-zinc-600"}`} />
                    {item.critical && (
                      <div className="absolute -inset-1.5 rounded-full border border-red-500/30 animate-ping" />
                    )}
                  </div>
                  <div className="border border-zinc-800/30 bg-zinc-900/20 p-4 md:p-5 flex-1 block">
                    <span className="text-base md:text-lg font-bold text-white tracking-tight block mb-1" style={{ fontFamily: "Sekuya" }}>
                      {item.time}
                    </span>
                    <span className={`text-lg leading-relaxed ${item.critical ? "text-red-400/80" : "text-zinc-500"}`} style={{ fontFamily: FONT.sans, fontSize: "18px" }}>
                      {item.event}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  STEP 3 — EXTRACTION
// ════════════════════════════════════════════════════════
function StepExtraction({ data }) {
  return (
    <div className="relative flex flex-col items-center text-center px-6 md:px-16 py-6">
      {/* Absolute photo on the right corner for large screens — aligned with heading */}
      <div className="hidden lg:block lg:absolute lg:right-[5px] lg:top-[180px] w-[280px] z-20">
        <SurveillancePhoto src={data.extraction.image} caption={data.extraction.imageCaption} />
      </div>

      {/* Phase badge */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Fingerprint className="w-4 h-4 text-red-500/50" />
        <span className="text-[10px] tracking-[0.4em] uppercase text-red-500/50 font-semibold" style={{ fontFamily: FONT.mono, fontSize: "20px" }}>
          Phase 03 — Extraction
        </span>
      </motion.div>

      {/* Title */}
      <motion.h2
        className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-2 relative"
        style={{ fontFamily: FONT.serif, fontSize: "130px", filter: "url(#noiseFilter)" }}
        initial={{ opacity: 0, y: 22, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.15, duration: 0.7 }}
      >
        <GlitchText>{data.extraction.title}</GlitchText>
        <svg className="absolute inset-0 pointer-events-none opacity-20">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch" />
          </filter>
        </svg>
      </motion.h2>

      {/* Subtitle */}
      <motion.p
        className="text-xs md:text-sm text-zinc-500 tracking-wider uppercase mb-8"
        style={{ fontFamily: FONT.mono }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        {data.extraction.subtitle}
      </motion.p>

      {/* ──── CONTENT: floating photo extreme right, terminal centered ──── */}
      <div className="relative w-full flex flex-col items-center">
        {/* Absolute photo on the right corner for large screens */}
        <div className="lg:absolute lg:right-[5px] lg:top-0 w-full lg:w-[280px] order-2 lg:order-none mt-10 lg:mt-0 px-6 lg:px-0">
          <SurveillancePhoto src={data.extraction.image} caption={data.extraction.imageCaption} />
        </div>

        {/* Centered Content (Terminal) */}
        <div className="flex flex-col items-center w-full max-w-2xl z-10">
          {/* Description */}
          <motion.p
            className="text-base md:text-lg text-zinc-400 leading-relaxed text-center mb-12"
            style={{ fontFamily: FONT.sans, fontSize: "22px", margin: "10px 0" }}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.6 }}
          >
            {data.extraction.description}
          </motion.p>

          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            <div className="bg-zinc-950 border border-zinc-800/30 p-6 md:p-8 relative overflow-hidden text-left">
              {/* Header dots */}
              <div className="flex items-center gap-2 mb-5 pb-4 border-b border-zinc-800/25">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/25" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/25" />
                <span className="text-[9px] text-zinc-600 ml-3 tracking-widest uppercase" style={{ fontFamily: FONT.mono }}>
                  ghost-protocol.sh
                </span>
              </div>
              <div className="space-y-3">
                {data.extraction.terminalLines.map((line, idx) => (
                  <motion.div
                    key={idx}
                    className="flex items-center gap-2 flex-wrap"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 + idx * 0.1, duration: 0.35 }}
                  >
                    <span className="text-lg text-zinc-500" style={{ fontFamily: FONT.mono, fontSize: "18px" }}>
                      {line.cmd}
                    </span>
                    {line.status && (
                      <span
                        className={`text-lg font-bold ${line.status === "GHOST PROTOCOL COMPLETE" ? "text-white" : "text-red-500"}`}
                        style={{ fontFamily: FONT.mono, fontSize: "12px" }}
                      >
                        {line.status}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
              {/* Scanline */}
              <motion.div
                className="absolute left-0 right-0 h-8 pointer-events-none"
                style={{ background: "linear-gradient(to bottom, transparent, rgba(239,68,68,0.02), transparent)" }}
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  CREW CARD — animated hover with Framer Motion state
// ════════════════════════════════════════════════════════
function CrewCard({ member, idx }) {
  const [hovered, setHovered] = useState(false);
  const Icon = ICON_MAP[member.icon] || Layers;

  return (
    <motion.div
      className="relative border p-6 md:p-8 text-center overflow-hidden flex flex-col"
      style={{
        margin: "10px",
        background: "#09090b",
        borderColor: hovered ? "rgba(239,68,68,0.65)" : "rgba(39,39,42,0.5)",
        transition: "border-color 0.3s ease",
      }}
      initial={{ opacity: 0, y: 25, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      whileHover={{ y: -8, boxShadow: "0 20px 50px rgba(239,68,68,0.18), 0 0 0 1px rgba(239,68,68,0.4)", transition: { duration: 0.3 } }}
      transition={{ delay: 0.4 + idx * 0.08, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Top accent — sweeps in from left */}
      <motion.div
        className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-red-600 via-red-400 to-transparent"
        style={{ transformOrigin: "left", width: "100%" }}
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />
      {/* Bottom accent — sweeps in from right */}
      <motion.div
        className="absolute bottom-0 right-0 h-[1px] bg-gradient-to-l from-red-500/70 via-red-500/30 to-transparent"
        style={{ transformOrigin: "right", width: "70%" }}
        animate={{ scaleX: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: "easeOut" }}
      />
      {/* Background radial glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.10) 0%, transparent 70%)" }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
      />
      {/* Left edge glow bar */}
      <motion.div
        className="absolute left-0 top-0 bottom-0 w-[2px]"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(239,68,68,0.5), transparent)" }}
        animate={{ opacity: hovered ? 1 : 0, scaleY: hovered ? 1 : 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />

      {/* ── SECTION 1: Icon ── */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto relative"
        style={{
          margin: "10px auto",
          background: hovered ? "rgba(239,68,68,0.08)" : "rgba(239,68,68,0.03)",
          border: hovered ? "1px solid rgba(239,68,68,0.35)" : "1px solid rgba(127,29,29,0.15)",
          transition: "background 0.3s ease, border 0.3s ease",
        }}
      >
        <Icon className="w-5 h-5" style={{ color: hovered ? "rgba(239,68,68,0.9)" : "rgba(239,68,68,0.6)", transition: "color 0.3s ease" }} />
        {/* Ambient pulse ring */}
        <motion.div
          className="absolute inset-0 rounded-full border border-red-500/10"
          animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0, 0.2] }}
          transition={{ duration: 3, repeat: Infinity, delay: idx * 0.4 }}
        />
        {/* Burst ring on hover */}
        <motion.div
          className="absolute inset-0 rounded-full border border-red-500"
          animate={hovered ? { scale: [1, 1.6, 1.9], opacity: [0.7, 0.2, 0] } : { scale: 1, opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>

      {/* ── SECTION 2: Name & Role ── */}
      <h3 className="font-black text-white tracking-tight" style={{ fontFamily: FONT.serif, margin: "10px 10px 4px", fontSize: "35px", color: hovered ? "#ffffff" : "rgba(255,255,255,0.88)", transition: "color 0.25s ease" }}>
        {member.name}
      </h3>
      <p className="tracking-[0.3em] uppercase mb-4" style={{ fontFamily: FONT.sans, fontSize: "15px", letterSpacing: "1px", fontWeight: "bold", color: hovered ? "rgba(239,68,68,0.8)" : "rgba(239,68,68,0.4)", transition: "color 0.25s ease" }}>
        {member.role}
      </p>

      {/* Visual separator — expands on hover */}
      <motion.div
        className="mx-auto mb-4 h-px"
        animate={{ width: hovered ? "80px" : "40px", backgroundColor: hovered ? "rgba(239,68,68,0.45)" : "rgba(63,63,70,0.5)" }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      />

      {/* ── SECTION 3: Bio ── */}
      <p className="text-sm text-zinc-500 leading-relaxed mb-5 flex-1" style={{ fontFamily: FONT.sans }}>
        {member.bio}
      </p>

      {/* ── Visual separator ── */}
      <div className="w-full h-px bg-zinc-800/30 mb-5" />

      {/* ── SECTION 4: Share % + Threat ── */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-left">
          <p className="text-[8px] tracking-[0.25em] uppercase text-zinc-600 mb-1" style={{ fontFamily: "Anton", fontSize: "10px" }}>Money Share</p>
          <p className="text-2xl md:text-3xl font-black text-white leading-none" style={{ fontFamily: "Seks", margin: "0 10px" }}>{member.share}%</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] tracking-[0.25em] uppercase text-zinc-600 mb-1" style={{ fontFamily: "Anton", fontSize: "10px" }}>Threat</p>
          <div className="flex gap-1 justify-end">
            {Array.from({ length: 5 }).map((_, t) => (
              <motion.div
                key={t}
                className="h-1.5 rounded-sm"
                style={{ width: "12px" }}
                animate={{
                  backgroundColor: t < member.threat
                    ? (hovered ? "rgba(239,68,68,1)" : "rgba(239,68,68,0.7)")
                    : "rgba(39,39,42,0.3)",
                  boxShadow: t < member.threat && hovered ? "0 0 6px rgba(239,68,68,0.8)" : "none",
                }}
                transition={{ duration: 0.2, delay: t * 0.04 }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Share bar */}
      <div className="h-1 bg-zinc-900 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: hovered ? "linear-gradient(to right, #dc2626, #f87171, #dc2626)" : "linear-gradient(to right, #dc2626, #f87171)", transition: "background 0.4s ease" }}
          initial={{ width: "0%" }}
          animate={{ width: `${member.share}%` }}
          transition={{ delay: 0.7 + idx * 0.1, duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════
//  STEP 4 — THE ROSTER / CREW & THE CUT
// ════════════════════════════════════════════════════════
function StepRoster({ data }) {
  const applyBtnControls = useAnimation();
  const [shimmerKey, setShimmerKey] = useState(0);
  const [applyAcknowledged, setApplyAcknowledged] = useState(false);

  const handleApply = async () => {
    playApplySound();
    setApplyAcknowledged(true);
    setShimmerKey((k) => k + 1);
    await applyBtnControls.start({
      scale: [1, 1.08, 0.97, 1],
      boxShadow: [
        "0 8px 28px rgba(239, 68, 68, 0.35)",
        "0 0 56px rgba(52, 211, 153, 0.5), 0 10px 32px rgba(239, 68, 68, 0.2)",
        "0 8px 28px rgba(239, 68, 68, 0.35)",
      ],
      transition: { duration: 0.52, ease: [0.34, 1.25, 0.64, 1] },
    });
  };

  return (
    <div className="flex flex-col items-center text-center px-6 md:px-16 py-6">
      {/* Badge */}
      <motion.div
        className="flex items-center gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Users className="w-4 h-4 text-red-500/50" />
        <span className="text-[10px] tracking-[0.4em] uppercase text-red-500/50 font-semibold" style={{ fontFamily: FONT.mono, fontSize: "15px" }}>
          Operational Roster
        </span>
      </motion.div>

      {/* Title */}
      <motion.h2
        className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-3"
        style={{ fontFamily: "Playfair Display", fontSize: "100px" }}
        initial={{ opacity: 0, y: 22, filter: "blur(10px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ delay: 0.15, duration: 0.7 }}
      >
        &nbsp;&nbsp;&nbsp;&nbsp;The Crew <span className="italic text-red-500">&</span> The Cut
      </motion.h2>

      {/* Threat level */}
      <motion.div
        className="flex items-center gap-4 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
      >
        <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-600" style={{ fontFamily: FONT.mono, margin: "30px", fontWeight: "bold", fontSize: "15px" }}>
          Mission Threat
        </span>
        <div className="flex gap-1">
          {Array.from({ length: data.maxThreat }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-6 h-2 rounded-sm ${i < data.threatLevel ? "bg-red-500" : "bg-zinc-800/30"}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.4 + i * 0.08, duration: 0.3 }}
            />
          ))}
        </div>
        <span className="text-xs text-red-500 font-bold" style={{ fontFamily: FONT.mono, fontWeight: "bold", fontSize: "15px" }}>
          LEVEL {data.threatLevel}/{data.maxThreat}
        </span>
      </motion.div>

      {/* ─── Crew grid ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-5xl" style={{ width: "100%" }}>
        {data.crew.map((member, idx) => (
          <CrewCard key={idx} member={member} idx={idx} />
        ))}
      </div>

      {/* Total */}
      <motion.div
        className="mt-8 flex items-center gap-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
      >
        <div className="h-px w-14 bg-zinc-800/50" />
        <span className="text-xs text-zinc-500" style={{ fontFamily: FONT.mono }}>
          <span className="text-red-500 font-bold">{data.crew.reduce((a, m) => a + m.share, 0)}%</span>
        </span>
        <div className="h-px w-14 bg-zinc-800/50" />
      </motion.div>

      {/* Apply — final commit control */}
      <motion.div
        className="mt-12 w-full max-w-lg mx-auto flex flex-col items-center gap-5"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.35, duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <motion.button
          type="button"
          onClick={handleApply}
          animate={applyBtnControls}
          initial={{
            scale: 1,
            y: 0,
            boxShadow: "0 8px 28px rgba(239, 68, 68, 0.35)",
          }}
          whileHover={{
            y: -3,
            boxShadow: "0 14px 44px rgba(239, 68, 68, 0.42), 0 0 0 1px rgba(248, 113, 113, 0.25)",
            transition: { type: "spring", stiffness: 400, damping: 24 },
          }}
          whileTap={{ scale: 0.9, transition: { type: "spring", stiffness: 600, damping: 22 } }}
          className="relative overflow-hidden rounded-lg px-12 sm:px-16 py-4 text-xs sm:text-sm font-black tracking-[0.42em] uppercase text-white border border-red-500/50 bg-gradient-to-b from-red-600 via-red-700 to-red-950 cursor-pointer select-none"
          style={{ fontFamily: FONT.mono }}
        >
          {shimmerKey > 0 ? (
            <motion.span
              key={shimmerKey}
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "110%" }}
              animate={{ x: "-110%" }}
              transition={{ duration: 0.48, ease: "easeInOut" }}
            />
          ) : null}
          <span className="relative z-[1]">Apply</span>
        </motion.button>

        <AnimatePresence mode="wait">
          {applyAcknowledged ? (
            <motion.div
              key="ok"
              initial={{ opacity: 0, y: 6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ type: "spring", stiffness: 380, damping: 28 }}
              className="flex items-center gap-2.5 text-emerald-400/95 text-[10px] sm:text-xs tracking-[0.2em] uppercase"
              style={{ fontFamily: FONT.mono }}
            >
              <motion.span
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 0.5, delay: 0.05 }}
              >
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.25} />
              </motion.span>
              Dossier applied to active record
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════
import { useDossier } from "./context/DossierContext";
import {
  normalizeDossierData,
  crewMoneyPercent,
  crewThreatToLevel,
} from "./utils/normalizeDossierData";

export default function HeistSlideDeck() {
  useGlobalSetup();

  const { dossierData } = useDossier();
  const mappedData = useMemo(() => {
    if (!dossierData) return MISSION_DATA;
    const d = normalizeDossierData(dossierData);
    const quoteText = (d.quotes || "").toString().trim();
    return {
      codename: d.operationName || 'PLACEHOLDER',
      location: d.place || 'PLACEHOLDER',
      target: d.target || 'PLACEHOLDER',
      classification: "ULTRA // EYES ONLY",
      date: new Date().toISOString().split('T')[0],
      briefing: d.introduction || 'PLACEHOLDER',
      quote: {
        text: quoteText,
        author: quoteText ? "— CLASSIFIED BRIEFING" : "",
      },
      recon: {
        title: d.phase1Name || 'PLACEHOLDER',
        subtitle: "14 weeks of silent, patient observation",
        description: d.phase1Description || 'PLACEHOLDER',
        stats: [
          { label: "Endpoints Mapped", value: d.intelEndpoints || '...', icon: Scan },
          { label: "Guard Rotations", value: d.intelGuardRotations || '...', icon: Eye },
          { label: "Surveillance Hours", value: d.intelSurveillanceHours || '...', icon: Clock },
          { label: "Vulnerabilities Found", value: d.intelVulnerabilities || '...', icon: AlertTriangle },
        ],
        image: d.phase1Photo || "/surveillance_01.png",
        imageCaption: "RECON - INITIATED",
      },
      execution: {
        title: "Execution",
        subtitle: "58 seconds. Zero margin for error.",
        description: d.executionDescription || 'PLACEHOLDER',
        timeline: d.timeline && d.timeline.length > 0 ? d.timeline.map((t, i) => ({ time: t.time || '00:00', event: t.description || '...', critical: i % 2 === 0 })) : MISSION_DATA.execution.timeline,
        image: d.executionPhoto || "/surveillance_02.png",
        imageCaption: "EXECUTION - INGRESS",
      },
      extraction: {
        title: "Extraction",
        subtitle: "We don't escape. We evaporate.",
        description: d.extractionPlan || 'PLACEHOLDER',
        terminalLines: MISSION_DATA.extraction.terminalLines,
        image: d.extractionPhoto || "/surveillance_03.png",
        imageCaption: "EXTRACTION - EGRESS",
      },
      crew: d.crew && d.crew.length > 0 ? d.crew.map(c => ({
        name: c.title || 'PLACEHOLDER',
        role: c.job || 'PLACEHOLDER',
        icon: "Layers",
        share: crewMoneyPercent(c),
        threat: crewThreatToLevel(c),
        bio: c.requirements || 'PLACEHOLDER',
      })) : MISSION_DATA.crew,
      threatLevel: 4,
      maxThreat: 5,
    };
  }, [dossierData]);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const total = STEPS.length;

  const goNext = useCallback(() => {
    if (step < total - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step, total]);

  const goPrev = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  // Keyboard nav
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); goNext(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goPrev(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [goNext, goPrev]);

  // Scroll / wheel navigation with cooldown
  const scrollCooldown = useRef(false);
  useEffect(() => {
    const handleWheel = (e) => {
      // Don't hijack scroll if there's a scrollable inner area
      // (e.g. if content is taller than viewport on the Roster slide)
      const mainEl = document.querySelector("main");
      if (mainEl) {
        const isScrollable = mainEl.scrollHeight > mainEl.clientHeight + 10;
        const atTop = mainEl.scrollTop <= 5;
        const atBottom = mainEl.scrollTop + mainEl.clientHeight >= mainEl.scrollHeight - 5;
        // If content is scrollable and we're NOT at an edge, let normal scroll happen
        if (isScrollable && !atTop && !atBottom) return;
        // At top and scrolling up, or at bottom and scrolling down → navigate
        if (isScrollable && atTop && e.deltaY < 0) { /* allow nav */ }
        else if (isScrollable && atBottom && e.deltaY > 0) { /* allow nav */ }
        else if (isScrollable) return;
      }

      if (scrollCooldown.current) return;
      const threshold = 30; // ignore tiny trackpad deltas
      if (Math.abs(e.deltaY) < threshold) return;

      e.preventDefault();
      scrollCooldown.current = true;

      if (e.deltaY > 0) goNext();
      else goPrev();

      setTimeout(() => { scrollCooldown.current = false; }, 800);
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [goNext, goPrev]);

  const currentView = useMemo(() => {
    switch (step) {
      case 0: return <StepBriefing key="b" data={mappedData} />;
      case 1: return <StepRecon key="r" data={mappedData} />;
      case 2: return <StepExecution key="e" data={mappedData} />;
      case 3: return <StepExtraction key="x" data={mappedData} />;
      case 4: return <StepRoster key="c" data={mappedData} />;
      default: return null;
    }
  }, [step, mappedData]);

  return (
    <div className="relative h-screen text-white overflow-hidden flex flex-col" style={{ background: "#09090b", fontFamily: FONT.sans }}>
      <NoiseOverlay />
      <ScanlineOverlay />

      {/* BG effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(239,68,68,0.4) 1px, transparent 1px),
              linear-gradient(90deg, rgba(239,68,68,0.4) 1px, transparent 1px)`,
            backgroundSize: "80px 80px",
          }}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 50% 35%, rgba(239,68,68,0.035) 0%, transparent 55%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.65) 100%)" }} />
      </div>

      {/* ═══ TOP NAVBAR — ultra-bold, imposing ═══ */}
      <header className="relative z-20 flex items-center justify-between px-5 md:px-10 pt-6 pb-4 mt-3 border-b border-zinc-800/25 bg-zinc-950/30 backdrop-blur-sm flex-shrink-0">
        {/* Left: Branding */}
        <div className="flex items-center gap-3" style={{margin:"30px 0"}}>
          <motion.div
            className="w-2 h-2 rounded-full bg-red-500"
            animate={{ opacity: [1, 0.25, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span
            className="text-sm md:text-base font-black tracking-[0.35em] uppercase text-white/80"
            style={{ fontFamily: FONT.mono }}
          >
            CLASSIFIED
          </span>
          <span className="hidden sm:inline text-[10px] tracking-[0.2em] text-zinc-600 uppercase" style={{ fontFamily: FONT.mono }}>
            // DOSSiER 0047
          </span>
        </div>

        {/* Center: Step indicator */}
        <div className="hidden md:block flex-1 max-w-lg mx-8">
          <StepIndicator current={step} total={total} />
        </div>

        {/* Right: Date */}
        <div className="flex items-center gap-2.5">
          <Scan className="w-3.5 h-3.5 text-zinc-700" />
          <span className="text-[10px] text-zinc-600 hidden sm:inline" style={{ fontFamily: FONT.mono }}>
            {mappedData.date}
          </span>
          <Zap className="w-3 h-3 text-red-500/30" />
        </div>
      </header>

      {/* Mobile step indicator */}
      <div className="md:hidden px-4 py-2 border-b border-zinc-800/20 flex-shrink-0">
        <StepIndicator current={step} total={total} />
      </div>

      {/* ═══ SLIDE CONTENT — centered, scrollable ═══ */}
      <main className="flex-1 relative z-10 overflow-y-auto overflow-x-hidden">
        <div className="min-h-full flex flex-col justify-center">
          <div className="max-w-7xl mx-auto w-full py-4 md:py-8">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={pageTrans}
              >
                {currentView}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* ═══ BOTTOM NAV — Diamond buttons ═══ */}
      <footer className="relative z-20 flex items-center justify-center gap-8 px-5 md:px-10 py-4 border-t border-zinc-800/25 bg-zinc-950/30 backdrop-blur-sm flex-shrink-0">
        {/* Previous — diamond button */}
        <div className="flex items-center gap-4">
          <button
            onClick={goPrev}
            disabled={step === 0}
            title="Previous Phase"
            style={{ background: "none", border: "none", padding: 0, cursor: step === 0 ? "not-allowed" : "pointer" }}
          >
            <div
              style={{
                height: "80px",
                width: "80px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 0.6s ease-in-out",
                opacity: step === 0 ? 0.2 : 1,
              }}
              onMouseEnter={e => { if (step > 0) e.currentTarget.style.scale = "0.5"; }}
              onMouseLeave={e => { e.currentTarget.style.scale = "1"; }}
            >
              <div
                style={{
                  rotate: "45deg",
                  backgroundColor: step === 0 ? "#3f3f46" : "#ef4444",
                  height: "44px",
                  width: "44px",
                  boxShadow: step === 0 ? "none" : "0 0 18px 2px rgba(239,68,68,0.3)",
                }}
              />
            </div>
          </button>
          <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-600 hidden sm:inline" style={{ fontFamily: "Boldonse" , fontSize: "20px" }}>
            Previous
          </span>
        </div>

        {/* Step counter */}
        <div className="flex items-center gap-2.5">
          <span className="text-sm text-zinc-500 font-bold" style={{ fontFamily: FONT.mono }}>
            {String(step + 1).padStart(2, "0")}
          </span>
          <div className="w-8 h-px bg-zinc-800" />
          <span className="text-sm text-zinc-700" style={{ fontFamily: FONT.mono }}>
            {String(total).padStart(2, "0")}
          </span>
        </div>

        {/* Next — diamond button */}
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-600 hidden sm:inline" style={{ fontFamily: "Boldonse" , fontSize: "20px" }}>
            {step < total - 1 ? "Next Phase" : "Complete"}
          </span>
          <button
            onClick={goNext}
            disabled={step === total - 1}
            title="Next Phase"
            style={{ background: "none", border: "none", padding: 0, cursor: step === total - 1 ? "not-allowed" : "pointer" }}
          >
            <div
              style={{
                height: "80px",
                width: "80px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                transition: "all 0.6s ease-in-out",
                opacity: step === total - 1 ? 0.2 : 1,
              }}
              onMouseEnter={e => { if (step < total - 1) e.currentTarget.style.scale = "0.5"; }}
              onMouseLeave={e => { e.currentTarget.style.scale = "1"; }}
            >
              <div
                style={{
                  rotate: "45deg",
                  backgroundColor: step === total - 1 ? "#3f3f46" : "#ef4444",
                  height: "44px",
                  width: "44px",
                  boxShadow: step === total - 1 ? "none" : "0 0 18px 2px rgba(239,68,68,0.3)",
                }}
              />
            </div>
          </button>
        </div>
      </footer>
    </div>
  );
}
