import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Typewriter.css";
import CinematicPage from "../components/CinematicPage";

let audioCtx = null;

const playSound = (type) => {
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn("AudioContext creation failed", e);
      return;
    }
  }
  if (audioCtx.state === "suspended") audioCtx.resume();
  const t = audioCtx.currentTime;

  if (type === "key") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(150 + Math.random() * 100, t);
    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.06);

    const bufSize = audioCtx.sampleRate * 0.05;
    const buf = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = audioCtx.createBufferSource();
    noise.buffer = buf;
    const noiseGain = audioCtx.createGain();
    noiseGain.gain.setValueAtTime(0.1, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
    noise.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noise.start(t);
  } else if (type === "space") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(80 + Math.random() * 40, t);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  } else if (type === "ding") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(2200, t);
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.2);
  } else if (type === "return") {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(1900, t);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.25);
  }
};

const CARRIAGE_STEP_PX = 5.2;
const MAX_CARRIAGE_PX = 400;

const MULTILINE_IDS = new Set([
  "sa_introduction",
  "sb_phase1_description",
  "sc_execution_description",
  "sd_extraction_plan",
]);

const crewBlock = (slot) => [
  { id: `se_c${slot}_job`, label: "JOB:" },
  { id: `se_c${slot}_title`, label: "CODENAME / TITLE:" },
  { id: `se_c${slot}_money_share`, label: "MONEY SHARE (e.g. 30%):" },
  { id: `se_c${slot}_requirements`, label: "REQUIREMENTS:" },
  { id: `se_c${slot}_threat_level`, label: "THREAT LEVEL:" },
];

const SECTION_A_FIELDS = [
  { id: "sa_operation_name", label: "OPERATION NAME:" },
  { id: "sa_place", label: "PLACE:" },
  { id: "sa_target", label: "TARGET:" },
  { id: "sa_introduction", label: "INTRODUCTION:" },
  { id: "sa_quote", label: "QUOTE:" },
];

const SECTION_B_FIELDS = [
  { id: "sb_phase1_name", label: "PHASE 1 NAME:" },
  { id: "sb_phase1_description", label: "PHASE 1 DESCRIPTION:" },
  { id: "sb_intel_end_points_mapped", label: "INTEL — END POINTS MAPPED:" },
  { id: "sb_intel_guard_rotations", label: "INTEL — GUARD ROTATIONS:" },
  { id: "sb_intel_surveillance_hours", label: "INTEL — SURVEILLANCE:" },
  { id: "sb_intel_vulnerabilities_found", label: "INTEL — VULNERABILITIES:" },
];

const SECTION_D_FIELDS = [
  { id: "sd_extraction_plan", label: "EXTRACTION PLAN:" },
];

/** How many timeline rows to show after the user sets prep_execution_steps (1–6). */
function getExecutionStepCount(data) {
  const raw = String(data.prep_execution_steps ?? "").trim();
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return Math.min(6, n);
}

/** How many crew slot sections to show after prep_crew_slots (1–3). */
function getCrewSlotCount(data) {
  const raw = String(data.prep_crew_slots ?? "").trim();
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n < 1) return 1;
  return Math.min(3, n);
}

function buildTimelineFieldDefs(stepCount) {
  const out = [];
  for (let i = 1; i <= stepCount; i++) {
    out.push(
      { id: `sc_tl_${i}_time`, label: `STEP ${i} — TIME (e.g. 20:00):` },
      { id: `sc_tl_${i}_desc`, label: `STEP ${i} — DESCRIPTION:` },
    );
  }
  return out;
}

function buildSections(data) {
  const execSteps = getExecutionStepCount(data);
  const crewSlots = getCrewSlotCount(data);
  const timelineFields = buildTimelineFieldDefs(execSteps);

  const sections = [
    {
      title: "SECTION A — BRIEFING",
      fields: SECTION_A_FIELDS,
      photoSlot: null,
    },
    {
      title: "SECTION B — PHASE 1 & INTEL",
      fields: SECTION_B_FIELDS,
      photoSlot: "phase1",
    },
    {
      title: "SECTION C — EXECUTION & TIMELINE",
      fields: [
        {
          id: "prep_execution_steps",
          label: "NUMBER OF EXECUTION STEPS (1-6):",
        },
        { id: "sc_execution_description", label: "EXECUTION DESCRIPTION:" },
        ...timelineFields,
      ],
      photoSlot: "execution",
    },
    {
      title: "SECTION D — EXTRACTION",
      fields: SECTION_D_FIELDS,
      photoSlot: "extraction",
    },
    {
      title: "CREW MANIFEST — SETUP",
      fields: [
        {
          id: "prep_crew_slots",
          label: "NUMBER OF CREW SLOTS NEEDED (1-3):",
        },
      ],
      photoSlot: null,
    },
  ];

  for (let s = 1; s <= crewSlots; s++) {
    sections.push({
      title: `SECTION E — CREW (SLOT ${s})`,
      fields: crewBlock(s),
      photoSlot: null,
    });
  }

  return sections;
}

const getOrderedFieldList = (data) =>
  buildSections(data).flatMap((s) => s.fields.map((f) => f.id));

const allTypewriterFieldIds = () => {
  const base = new Set([
    ...SECTION_A_FIELDS.map((f) => f.id),
    ...SECTION_B_FIELDS.map((f) => f.id),
    "prep_execution_steps",
    "sc_execution_description",
    "prep_crew_slots",
    "sd_extraction_plan",
  ]);
  for (let i = 1; i <= 6; i++) {
    base.add(`sc_tl_${i}_time`);
    base.add(`sc_tl_${i}_desc`);
  }
  for (let s = 1; s <= 3; s++) {
    crewBlock(s).forEach((f) => base.add(f.id));
  }
  return base;
};

const emptyDossier = () => {
  const o = {};
  allTypewriterFieldIds().forEach((id) => {
    o[id] = "";
  });
  o.prep_execution_steps = "3";
  o.prep_crew_slots = "2";
  return o;
};

function buildTimelinePayload(data) {
  const n = getExecutionStepCount(data);
  return Array.from({ length: n }, (_, i) => {
    const step = i + 1;
    return {
      step,
      time: (data[`sc_tl_${step}_time`] || "").trim(),
      desc: (data[`sc_tl_${step}_desc`] || "").trim(),
    };
  });
}

function buildCrewPayload(data) {
  const slots = getCrewSlotCount(data);
  return Array.from({ length: slots }, (_, i) => {
    const slot = i + 1;
    return {
      job: (data[`se_c${slot}_job`] || "").trim(),
      title: (data[`se_c${slot}_title`] || "").trim(),
      money_share: (data[`se_c${slot}_money_share`] || "").trim(),
      requirements: (data[`se_c${slot}_requirements`] || "").trim(),
      threat_level: (data[`se_c${slot}_threat_level`] || "").trim(),
    };
  });
}

/** Server expects flat multipart fields (see server/src/middleware/validate.js + heistController). */
function appendHeistFormData(data, heistPhotos) {
  const fd = new FormData();
  const timeline = buildTimelinePayload(data);
  const crew_members = buildCrewPayload(data);

  fd.append("operation_name", (data.sa_operation_name || "").trim());
  fd.append("place", (data.sa_place || "").trim());
  fd.append("target", (data.sa_target || "").trim());
  fd.append("introduction", (data.sa_introduction || "").trim());
  fd.append("quote", (data.sa_quote || "").trim());

  fd.append("phase1_name", (data.sb_phase1_name || "").trim());
  fd.append("phase1_description", (data.sb_phase1_description || "").trim());
  fd.append(
    "intel_end_points_mapped",
    (data.sb_intel_end_points_mapped || "").trim(),
  );
  fd.append(
    "intel_guard_rotations",
    (data.sb_intel_guard_rotations || "").trim(),
  );
  fd.append(
    "intel_surveillance_hours",
    (data.sb_intel_surveillance_hours || "").trim(),
  );
  fd.append(
    "intel_vulnerabilities_found",
    (data.sb_intel_vulnerabilities_found || "").trim(),
  );

  fd.append(
    "execution_description",
    (data.sc_execution_description || "").trim(),
  );
  fd.append("extraction_plan", (data.sd_extraction_plan || "").trim());

  fd.append("timeline", JSON.stringify(timeline));
  fd.append("crew_members", JSON.stringify(crew_members));

  if (heistPhotos.phase1?.file) {
    fd.append("phase1_photo", heistPhotos.phase1.file);
  }
  if (heistPhotos.execution?.file) {
    fd.append("execution_photo", heistPhotos.execution.file);
  }
  if (heistPhotos.extraction?.file) {
    fd.append("extraction_photo", heistPhotos.extraction.file);
  }

  return fd;
}

function validateBeforeSubmit(data) {
  const op = (data.sa_operation_name || "").trim();
  if (op.length < 3) {
    return "Operation name must be at least 3 characters.";
  }
  const intro = (data.sa_introduction || "").trim();
  if (intro.length < 10) {
    return "Introduction must be at least 10 characters (server rule).";
  }
  const execN = parseInt(String(data.prep_execution_steps || "").trim(), 10);
  if (Number.isNaN(execN) || execN < 1 || execN > 6) {
    return "Number of execution steps must be between 1 and 6.";
  }
  const crewN = parseInt(String(data.prep_crew_slots || "").trim(), 10);
  if (Number.isNaN(crewN) || crewN < 1 || crewN > 3) {
    return "Number of crew slots must be between 1 and 3.";
  }
  const timeline = buildTimelinePayload(data);
  for (let i = 0; i < timeline.length; i++) {
    if (!timeline[i].time || !timeline[i].desc) {
      return `Each execution step needs a time and description (step ${i + 1}).`;
    }
  }
  const crew = buildCrewPayload(data);
  for (let i = 0; i < crew.length; i++) {
    const c = crew[i];
    if (
      !c.job ||
      !c.title ||
      !c.money_share ||
      !c.requirements ||
      !c.threat_level
    ) {
      return `Fill all fields for crew slot ${i + 1}.`;
    }
  }
  return null;
}

const LoadingTerminal = () => {
  const [dots, setDots] = useState(".");
  useEffect(() => {
    const id = setInterval(
      () => setDots((d) => (d.length >= 3 ? "." : d + ".")),
      400,
    );
    return () => clearInterval(id);
  }, []);
  return (
    <div className="td-loading-term">FILING HEIST DOSSIER{dots}</div>
  );
};

const PHOTO_LABELS = {
  phase1: "ATTACH PHASE 1 PHOTO (OPTIONAL)",
  execution: "ATTACH EXECUTION PHOTO (OPTIONAL)",
  extraction: "ATTACH EXTRACTION PHOTO (OPTIONAL)",
};

export default function AddHeist() {
  const navigate = useNavigate();
  const [dossierData, setDossierData] = useState(emptyDossier);
  const [heistPhotos, setHeistPhotos] = useState({
    phase1: { file: null, url: null },
    execution: { file: null, url: null },
    extraction: { file: null, url: null },
  });
  const [currentFieldId, setCurrentFieldId] = useState(
    () => getOrderedFieldList(emptyDossier())[0],
  );
  const [lockState, setLockState] = useState("idle");
  const [carriageOffsetPx, setCarriageOffsetPx] = useState(0);
  const [roleOk, setRoleOk] = useState(null);

  const hiddenInputRef = useRef(null);
  const viewportRef = useRef(null);
  const paperRef = useRef(null);
  const fieldRefs = useRef({});
  const imperfections = useRef({});
  const lastCursorYRef = useRef(0);
  const lastKeyEnterRef = useRef(false);

  useEffect(() => {
    fetch("https://api.sicari.works/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((authData) => {
        const r = authData?.user?.role;
        if (r !== "fixer") {
          navigate("/Heists", { replace: true });
          return;
        }
        setRoleOk(true);
      })
      .catch(() => navigate("/Heists", { replace: true }));
  }, [navigate]);

  useEffect(() => {
    const list = getOrderedFieldList(dossierData);
    if (!list.includes(currentFieldId)) {
      const last = list[list.length - 1];
      if (last) setCurrentFieldId(last);
    }
  }, [dossierData, currentFieldId]);

  const isMultiline = (id) => MULTILINE_IDS.has(id);

  const getFieldValue = (id) => String(dossierData[id] || "");

  const updateData = (field, value) => {
    setDossierData((prev) => ({ ...prev, [field]: value }));
  };

  const setPhotoSlot = (slot, file) => {
    setHeistPhotos((prev) => {
      const prevUrl = prev[slot]?.url;
      if (prevUrl?.startsWith("blob:")) URL.revokeObjectURL(prevUrl);
      if (!file) {
        return { ...prev, [slot]: { file: null, url: null } };
      }
      return {
        ...prev,
        [slot]: { file, url: URL.createObjectURL(file) },
      };
    });
  };

  const getImp = (fieldId, index) => {
    if (!imperfections.current[fieldId]) imperfections.current[fieldId] = [];
    while (imperfections.current[fieldId].length <= index) {
      imperfections.current[fieldId].push({
        dy: Math.random() - 0.5,
        dx: Math.random() * 0.6 - 0.3,
        rot: Math.random() * 0.6 - 0.3,
        op: 0.85 + Math.random() * 0.15,
        hue: Math.random() * 5 - 2.5,
        blur: Math.random() * 0.3,
      });
    }
    return imperfections.current[fieldId][index];
  };

  useEffect(() => {
    if (lockState === "idle") hiddenInputRef.current?.focus();
  }, [currentFieldId, lockState]);

  useEffect(() => {
    setCarriageOffsetPx(0);
  }, [currentFieldId]);

  useLayoutEffect(() => {
    if (!paperRef.current || lockState !== "idle") return;
    paperRef.current.style.transition =
      "transform 0.22s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    paperRef.current.style.transform = `translateX(${-carriageOffsetPx}px)`;
  }, [carriageOffsetPx, lockState]);

  useLayoutEffect(() => {
    if (lockState !== "idle" || !paperRef.current || !viewportRef.current)
      return;
    let scrollAnimId;
    const smoothScrollTo = (target, duration) => {
      const start = viewportRef.current.scrollTop;
      const dist = target - start;
      if (Math.abs(dist) < 1) return;
      const startTime = performance.now();
      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);
        if (viewportRef.current) {
          viewportRef.current.scrollTop = start + dist * ease;
        }
        if (progress < 1) scrollAnimId = requestAnimationFrame(step);
      };
      cancelAnimationFrame(scrollAnimId);
      scrollAnimId = requestAnimationFrame(step);
    };

    requestAnimationFrame(() => {
      const fieldEl = fieldRefs.current[currentFieldId];
      if (!fieldEl) return;
      const cursorEl = fieldEl.querySelector(".type-cursor");
      let cursorY = fieldEl.offsetTop;

      if (cursorEl) {
        let y = 0;
        let node = cursorEl;
        while (node && node !== paperRef.current) {
          y += node.offsetTop;
          node = node.offsetParent;
        }
        cursorY = y;
      }

      if (lastCursorYRef.current !== 0) {
        const dy = cursorY - lastCursorYRef.current;
        if (dy > 10 && dy < 100)
          smoothScrollTo(cursorY, lastKeyEnterRef.current ? 300 : 150);
        else if (Math.abs(dy) > 100) smoothScrollTo(cursorY, 400);
        else viewportRef.current.scrollTop = cursorY;
      } else viewportRef.current.scrollTop = cursorY;

      lastCursorYRef.current = cursorY;
      lastKeyEnterRef.current = false;
    });
  }, [currentFieldId, lockState]);

  const handleKeyDown = (e) => {
    const list = getOrderedFieldList(dossierData);
    const val = getFieldValue(currentFieldId);
    if (e.key === "Tab") {
      e.preventDefault();
      playSound("return");
      setCarriageOffsetPx(0);
      let nextIndex =
        list.indexOf(currentFieldId) + (e.shiftKey ? -1 : 1);
      nextIndex = Math.max(0, Math.min(nextIndex, list.length - 1));
      setCurrentFieldId(list[nextIndex]);
    } else if (e.key === "Enter") {
      e.preventDefault();
      playSound("return");
      setCarriageOffsetPx(0);
      if (isMultiline(currentFieldId)) {
        lastKeyEnterRef.current = true;
        updateData(currentFieldId, val + "\n");
      } else {
        const nextIndex = Math.min(
          list.indexOf(currentFieldId) + 1,
          list.length - 1,
        );
        setCurrentFieldId(list[nextIndex]);
      }
    } else if (e.key === "Backspace") {
      playSound("key");
    } else if (e.key === " ") {
      playSound("space");
      if (val.length % 55 === 0 && val.length > 5) playSound("ding");
    } else if (e.key.length === 1) {
      playSound("key");
      if (val.length % 55 === 0 && val.length > 5) playSound("ding");
    } else {
      lastKeyEnterRef.current = false;
    }
  };

  const handleSubmit = async () => {
    const err = validateBeforeSubmit(dossierData);
    if (err) {
      alert(err);
      return;
    }

    setLockState("exiting");

    if (paperRef.current) {
      paperRef.current.style.transition = "transform 1.5s ease-in";
      paperRef.current.style.transform = `translateX(${-carriageOffsetPx}px) translateY(-250vh)`;
    }

    await new Promise((r) => setTimeout(r, 1500));
    setLockState("slamming");
    await new Promise((r) => setTimeout(r, 300));
    setLockState("loading");

    const formData = appendHeistFormData(dossierData, heistPhotos);

    try {
      const response = await fetch(
        "https://api.sicari.works/api/fixer/heist/add",
        {
          method: "POST",
          credentials: "include",
          body: formData,
        },
      );

      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(errText || "Failed to add heist");
      }

      navigate("/my_heists");
    } catch (e) {
      console.error(e);
      alert("Error filing heist. Please try again.");
      setLockState("idle");
    }
  };

  const renderText = (fieldId) => {
    const text = getFieldValue(fieldId);
    let charIndex = 0;
    const chunks = text.split(/([\s\n]+)/);

    return chunks.map((chunk, cIdx) => {
      const elements = chunk.split("").map((char) => {
        const cID = charIndex++;
        const imp = getImp(fieldId, cID);
        if (char === "\n") return <br key={cID} />;
        if (char === " ")
          return <span key={cID} className="type-char">&nbsp;</span>;

        return (
          <span
            key={cID}
            className="type-char"
            style={{
              "--char-opacity": imp.op,
              transform: `translate(${imp.dx}px, ${imp.dy}px) rotate(${imp.rot}deg)`,
              filter: `hue-rotate(${imp.hue}deg) blur(${imp.blur}px)`,
              textShadow:
                "0.5px 0.5px 0px rgba(0,0,0,0.1), -0.5px -0.5px 0px rgba(0,0,0,0.05)",
              animation:
                "typeStrike 80ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
            }}
          >
            {char}
          </span>
        );
      });
      return (
        <span key={cIdx} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
          {elements}
        </span>
      );
    });
  };

  const Field = ({ id, label, block = false }) => {
    const isActive = currentFieldId === id;
    const isMulti = isMultiline(id);
    return (
      <div
        className="td-field"
        style={{
          display: block || isMulti ? "block" : "inline-block",
          marginRight: "20px",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setCurrentFieldId(id);
        }}
        ref={(el) => {
          fieldRefs.current[id] = el;
        }}
      >
        <span className="td-field-label">{label}</span>
        {isMulti && <br />}
        <span className="td-value">
          <span className="td-placeholder">
            {getFieldValue(id) ? "" : "___________"}
          </span>
          {renderText(id)}
          {isActive && <span className="type-cursor" />}
        </span>
      </div>
    );
  };

  const sections = buildSections(dossierData);

  if (roleOk !== true) {
    return (
      <CinematicPage>
        <div
          className="td-wrapper fixed inset-0 w-screen h-screen flex items-center justify-center bg-[#2b2b2b] text-[#f4f1e8]"
          style={{ fontFamily: "'Special Elite', 'Courier New', monospace" }}
        >
          Verifying clearance…
        </div>
      </CinematicPage>
    );
  }

  return (
    <CinematicPage>
      <div className="td-wrapper fixed inset-0 w-screen h-screen flex flex-col">
        <div
          ref={viewportRef}
          className={`td-viewport flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide ${lockState === "slamming" ? "td-shaking" : ""}`}
          onClick={() => hiddenInputRef.current?.focus()}
        >
          <img
            src="/assets/platten.png"
            alt=""
            className="td-platten-image pointer-events-none"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />

          <div className="td-paper-container">
            <div className="td-paper" ref={paperRef}>
              <div className="td-feed-holes" />
              <div className="td-margin-left" />
              <div className="td-margin-right" />
              <div className="td-feed-holes-right" />

              <div className="td-header">NEW HEIST DOSSIER — FIXER ONLY</div>
              <div className="td-divider">━━━━━━━━━━━━━━━━━━━━━━━━━━</div>

              <div className="td-section">
                <br />
                {sections.map((section) => (
                  <React.Fragment key={section.title}>
                    <div
                      className="td-field-label"
                      style={{
                        display: "block",
                        marginTop: "1.25rem",
                        marginBottom: "0.35rem",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {section.title}
                    </div>
                    <div className="td-divider" style={{ marginBottom: "0.75rem" }}>
                      ━━━━━━━━━━━━━━
                    </div>
                    {section.fields.map((f) => (
                      <Field
                        key={f.id}
                        id={f.id}
                        label={f.label}
                        block
                      />
                    ))}
                    {section.photoSlot && (
                      <div
                        className="td-photo mt-[30px] inline-block"
                        onClick={(e) => {
                          e.stopPropagation();
                          document
                            .getElementById(`heist-photo-${section.photoSlot}`)
                            ?.click();
                        }}
                      >
                        <input
                          id={`heist-photo-${section.photoSlot}`}
                          type="file"
                          style={{ display: "none" }}
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setPhotoSlot(section.photoSlot, file);
                            }
                            e.target.value = "";
                          }}
                        />
                        {heistPhotos[section.photoSlot]?.url ? (
                          <img
                            src={heistPhotos[section.photoSlot].url}
                            alt=""
                            className="max-w-[400px] border-[1px] border-black p-2 bg-[#eee4d1]"
                          />
                        ) : (
                          <span>
                            📎 {PHOTO_LABELS[section.photoSlot]}
                          </span>
                        )}
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          {lockState === "slamming" && (
            <div className="td-slam-stamp">FILED</div>
          )}
          {lockState === "loading" && <LoadingTerminal />}
        </div>

        <div className="td-button-container flex justify-center items-center w-full py-4 z-[100] bg-transparent pointer-events-auto shrink-0">
          <button
            type="button"
            className="td-stamp-btn pointer-events-auto shadow-xl"
            disabled={lockState !== "idle"}
            onClick={handleSubmit}
          >
            SUBMIT HEIST TO NETWORK
          </button>
        </div>

        <textarea
          ref={hiddenInputRef}
          value={getFieldValue(currentFieldId)}
          onChange={(e) => {
            const newVal = e.target.value;
            updateData(currentFieldId, newVal);
            const lines = newVal.split("\n");
            const lastLineLength = lines[lines.length - 1].length;
            setCarriageOffsetPx(
              Math.min(lastLineLength * CARRIAGE_STEP_PX, MAX_CARRIAGE_PX),
            );
          }}
          onKeyDown={handleKeyDown}
          style={{
            position: "fixed",
            top: "-9999px",
            opacity: 0,
            width: 0,
            height: 0,
          }}
          autoFocus
        />
      </div>
    </CinematicPage>
  );
}
