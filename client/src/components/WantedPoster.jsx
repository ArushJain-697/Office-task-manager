import React from "react";

// ─── SAMPLE DATA (replace with your backend fetch) ───────────────────────────
const defaultData = {
  clearanceLevel: "DEADLY",
  dateJoined: "2024-02-14  14:32:01",
  registrationNumber: null, // null = redacted bar
  name: "KOKILA MODI",
  title: "SASUMA",
  height: "170 CM",
  weight: "78 KG",
  languages: "HINDI, GUJARATI",
  bloodGroup: "O+",
  chargesPending: 0,
  lockUpCount: 4,
  photoUrl: "",
  skills: ["Cooking", "Shouting", "Poisonous Fart"],
  about:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse efficitur eros dolor, at gravida sapien finibus nec. Nulla facilisi. Maecenas finibus nec ex in blandit. Interdum et malesuada fames ac ante ipsum primis in faucibus.\n\nProin ultrices bibendum maximus. In hac habitasse platea dictumst. Nam lacinia scelerisque eleifend. Sed malesuada sapien posuere, luctus nunc eget, pharetra massa."
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function FieldRow({ label, children }) {
  return (
    <div className="flex items-baseline border-b border-stone-400 py-[0.35em] last:border-b-0">
      <span className="font-mono font-bold text-[0.75rem] tracking-wide text-stone-900 whitespace-nowrap mr-[0.25em]">
        {label}
      </span>
      <span className="font-mono font-bold text-[0.75rem] tracking-wide text-stone-900">
        {children}
      </span>
    </div>
  );
}

function RedactedBar() {
  return (
    <span className="inline-block bg-stone-900 h-[0.875em] w-[7.5em] rounded-sm align-middle" />
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function WantedPoster({ data = defaultData }) {
  const {
    clearanceLevel,
    dateJoined,
    registrationNumber,
    name,
    title,
    height,
    weight,
    languages,
    bloodGroup,
    chargesPending,
    lockUpCount,
    photoUrl,
    skills,
    about,
  } = data;

  return (
    // Outer wrapper — remove `min-h-screen bg-stone-800` if embedding inside another layout
    <div className="min-h-screen bg-stone-800 flex items-center justify-center p-6">

      {/* ── POSTER SHELL ── */}
      <div
        className="relative w-130 bg-[#f0e8d0] border-[0.375rem] border-stone-900 overflow-hidden"
        style={{ boxShadow: "0.5rem 0.5rem 0 #111, 0 0 3.75rem rgba(0,0,0,.6)" }}
      >

        {/* ── ① WANTED HEADER ── */}
        <div className="bg-stone-900 text-center py-[0.5em] px-[1em]">
          <h1
            className="text-6xl font-['Playfair_Display_SC'] text-white font-bold leading-none tracking-[0.5em]"
          >
            WANTED
          </h1>
        </div>

        {/* ── ② META ROW ── */}
        <div className="px-3.5 pt-2.5 pb-1.5 flex flex-col gap-0.5">
          <p className="font-mono font-bold text-[0.8125rem] tracking-wide text-stone-900">
            CLEARANCE LEVEL : [<span id="clearance-level">{clearanceLevel}</span>]
          </p>
          <p className="font-mono font-bold text-[0.8125rem] tracking-wide text-stone-900">
            DATE JOINED : <span id="date-joined">{dateJoined}</span>
          </p>
        </div>

        {/* ── ③ BADGES ROW ── */}
        <div className="px-3.5 pb-3 flex items-center gap-4.5">

          {/* Logo circle */}
          <div className="w-18 h-[4.5rem] rounded-full border-[0.1875rem] border-stone-900 bg-[#f0e8d0] flex flex-col items-center justify-center shrink-0 gap-[0.125rem]">
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-[2.25rem] h-[2.25rem]"
            >
              <circle cx="32" cy="32" r="28" stroke="#111" strokeWidth="3" fill="none" />
              <ellipse cx="32" cy="32" rx="12" ry="28" stroke="#111" strokeWidth="2" fill="none" />
              <line x1="4" y1="32" x2="60" y2="32" stroke="#111" strokeWidth="2" />
              <line x1="10" y1="18" x2="54" y2="18" stroke="#111" strokeWidth="1.5" />
              <line x1="10" y1="46" x2="54" y2="46" stroke="#111" strokeWidth="1.5" />
              <path d="M32 16 C20 10, 8 14, 6 22 C14 18 24 20 32 28" fill="#111" opacity=".5" />
              <path d="M32 16 C44 10, 56 14, 58 22 C50 18 40 20 32 28" fill="#111" opacity=".5" />
            </svg>
            <span className="font-mono font-bold text-[0.4375rem] tracking-wider text-stone-900">
              sicari.works
            </span>
          </div>

          {/* Confidential stamp */}
          <div
            className="relative border-[0.1875rem] border-stone-700 px-[0.875rem] py-[0.375rem]"
            style={{ transform: "rotate(-4deg)" }}
          >
            <div
              className="text-[1.625rem] tracking-[0.2em] text-stone-800 leading-tight"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              CONFIDENTIAL
            </div>
            <div className="font-mono font-bold text-[0.5625rem] tracking-[0.2em] text-stone-600 text-center">
              RESTRICTED ACCESS
            </div>
            {/* hatch overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(45deg,transparent,transparent 0.25rem,#000 0.25rem,#000 0.3125rem)",
              }}
            />
          </div>
        </div>

        {/* ── ④ SUBJECT PROFILE HEADER ── */}
        <div
          className="bg-stone-900 text-[#f0e8d0] px-[0.875rem] py-[0.375rem] text-[1.625rem] tracking-[0.25em]"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          SUBJECT PROFILE
        </div>

        {/* ── ⑤ PROFILE BODY ── */}
        <div className="grid grid-cols-[1fr_12.5rem]">

          {/* Left: fields */}
          <div className="px-[0.875rem] py-[0.5rem] flex flex-col">

            <FieldRow label="REGISTRATION NUMBER :">
              <span id="registration-number">
                {registrationNumber ?? <RedactedBar />}
              </span>
            </FieldRow>

            <FieldRow label="NAME :">
              <span id="subject-name">{name}</span>
            </FieldRow>

            <FieldRow label="TITLE :">
              <span id="subject-title">{title}</span>
            </FieldRow>

            <FieldRow label="HEIGHT :">
              <span id="subject-height">{height}</span>
            </FieldRow>

            <FieldRow label="WEIGHT :">
              <span id="subject-weight">{weight}</span>
            </FieldRow>

            <FieldRow label="LANGUAGES :">
              <span id="subject-languages">{languages}</span>
            </FieldRow>

            <FieldRow label="BLOOD GROUP :">
              <span id="subject-blood-group">{bloodGroup}</span>
            </FieldRow>

            <FieldRow label="PREVIOUS CHARGES PENDING:">
              <span id="charges-pending">{chargesPending}</span>
            </FieldRow>

            <FieldRow label="LOCK-UP COUNT :">
              <span id="lockup-count">{lockUpCount}</span>
            </FieldRow>

          </div>

          {/* Right: photo + skill set */}
          <div className="flex flex-col border-l-[0.15625rem] border-stone-900">

            {/* Photo */}
            <div className="flex-1 min-h-[13.75rem] overflow-hidden border-b-[0.15625rem] border-stone-900">
              {photoUrl ? (
                <img
                  id="subject-photo"
                  src={photoUrl}
                  alt="Subject"
                  className="w-full h-full object-cover object-top grayscale contrast-110"
                />
              ) : (
                <div className="w-full h-full bg-stone-300 flex items-center justify-center text-[0.6875rem] font-mono text-stone-500">
                  PHOTO N/A
                </div>
              )}
            </div>

            {/* Skill Set */}
            <div className="bg-[#ebe0c4] px-[0.625rem] py-[0.5rem]">
              <div
                className="bg-stone-900 text-[#f0e8d0] text-[1.0625rem] tracking-[0.2em] px-[0.5rem] py-[0.25rem] mb-[0.5rem]"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                SKILL SET
              </div>
              <ul id="skill-list" className="flex flex-col gap-[0.375rem]">
                {skills.map((skill, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-[0.5rem] font-mono font-bold text-[0.75rem] text-stone-900"
                  >
                    <span className="inline-block w-[0.75rem] h-[0.75rem] bg-stone-900 shrink-0" />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>{/* /profile-body */}

        {/* ── ⑥ ABOUT ME ── */}
        <div className="px-[0.875rem] pt-[0.625rem] pb-[1.25rem] border-t-[0.15625rem] border-stone-900">
          <p className="font-mono font-bold text-[0.8125rem] text-stone-900 mb-[0.375rem]">
            ABOUT ME : -
          </p>
          <p
            id="about-text"
            className="text-[0.71875rem] text-stone-800 leading-relaxed whitespace-pre-line"
            style={{ fontFamily: "'Special Elite', cursive" }}
          >
            {about}
          </p>
        </div>

      </div>{/* /poster */}
    </div>
  );
}