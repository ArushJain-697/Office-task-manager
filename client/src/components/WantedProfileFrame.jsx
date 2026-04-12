/**
 * Figma: HackNite file, component "Frame 11" (node 205:623).
 * 736×952 — cream field, wanted header, portrait stack, subject profile grid, gun SVG, bio, skill list.
 */
const ASSET = {
  portraitBack: "/assets/wanted-profile-card/portrait-back-10775b.png",
  portraitFront: "/assets/wanted-profile-card/portrait-front-427bbf.png",
  decor: "/assets/wanted-profile-card/decor-vector.svg",
  barcode: "/assets/wanted-profile-card/barcode.svg",
  gun: "/assets/wanted-profile-card/gun-illustration.svg",
};

const PROFILE_RULES = [
  { y: 23.49, w: 381 },
  { y: 54, w: 381 },
  { y: 84, w: 381 },
  { y: 115, w: 382 },
  { y: 145, w: 382 },
  { y: 175.24, w: 381 },
  { y: 206, w: 381 },
  { y: 236.74, w: 381 },
  { y: 267, w: 382 },
];

export default function WantedProfileFrame({
  profile = null,
  className = "",
  portraitBackSrc = ASSET.portraitBack,
}) {
  const data = profile || {
    name: "Kokila Modi",
    title: "SASUMA",
    height: "170cm",
    weight: "78kg",
    languages: ["Hindi", "Gujarati"],
    blood_group: "O+",
    clearance_level: "DEADLY",
    about:
      "Lorem ipsum dolor sit amet. Proin ultrices bibendum maximus. In hac habitasse platea dictumst. Nam lacinia scelerisque eleifend.",
    skills: ["Cooking", "Shouting", "Poisonous Fart"],
    photo_url: ASSET.portraitFront,
    username: "kokila_modi",
    created_at: "2026-04-10T20:06:15.000Z",
    registration_number: "MODI-81273",
    connections_count: 100,
    charges_pending: 0,
    lockup_count: 4,
  };

  const formatDate = (ds) => {
    if (!ds) return "";
    try {
      const d = new Date(ds);
      if (isNaN(d.getTime())) return ds;
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
    } catch {
      return ds;
    }
  };

  const clearanceLevel = `CLEARANCE LEVEL : [${(data.clearance_level || "UNKNOWN").toUpperCase()}]`;
  const dateJoined = `DATE JOINED : ${formatDate(data.created_at)}`;
  const registrationNumber = `REGISTRATION NUMBER : ${data.registration_number || data._id || "CLASSIFIED"}`;
  const name = `NAME : ${(data.name || "UNKNOWN").toUpperCase()}`;
  const title = `TITLE : ${(data.title || "UNKNOWN").toUpperCase()}`;
  const height = `HEIGHT : ${(data.height || "UNKNOWN").toUpperCase()}`;
  const weight = `WEIGHT : ${(data.weight || "UNKNOWN").toUpperCase()}`;
  const languages = `LANGUAGES : ${(data.languages || []).join(", ").toUpperCase()}`;
  const connections = `NUMBER OF CONNECTION: ${data.connections_count ?? "CLASSIFIED"}`;
  const chargesPending = `PREVIOUS CHARGES PENDING: ${data.charges_pending ?? 0}`;
  const lockupCount = `LOCK-UP COUNT : ${data.lockup_count ?? 0}`;
  const restrictedLabel = "RESTRICTED ACCESS";
  const aboutHeading = `ABOUT ${data.username ? "@" + data.username.toUpperCase() : "ME"}: -`;
  const aboutBody = data.about || "";
  const skillSetTitle = "SKILL SET";
  const skillsList = data.skills || [];
  const portraitFrontSrc = data.photo_url || ASSET.portraitFront;

  return (
    <article
      className={`relative isolate box-border overflow-visible bg-[#fff4e0] ${className}`}
      style={{ width: 736, height: 952 }}
      aria-label="Wanted subject profile"
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.14] mix-blend-multiply z-0"
        style={{
          backgroundImage: "url('/assets/profileNoise.png')",
          backgroundSize: "cover",
        }}
      />

      {/* Rectangle 6 — top band */}
      <div
        className="absolute left-6 top-[18px] z-0 bg-black"
        style={{ width: 687, height: 115 }}
        aria-hidden
      />

      <h1
        className="absolute z-[1] m-0 whitespace-pre-wrap text-center font-['Playfair_Display_SC'] text-[125px] font-bold leading-[1.333] text-white"
        style={{ left: 15, top: -13, width: 705, height: 146 }}
      >
        WANTED
      </h1>

      {/* Group 11 — portrait */}
      <div
        className="absolute z-[2] border-4 border-black bg-[#eee4d1] overflow-hidden flex justify-center items-center"
        style={{ left: 410, top: 149, width: 301, height: 431 }}
      >
        <img
          src={portraitFrontSrc}
          alt=""
          className="pointer-events-none w-full h-full object-cover select-none"
          draggable={false}
        />
      </div>

      <p
        className="absolute z-[2] m-0 whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center font-['Signika'] text-[22px] font-medium leading-[1.232] text-black"
        style={{
          left: 10,
          top: 164,
          width: 380,
          height: 30,
          letterSpacing: "-0.03em",
        }}
      >
        {clearanceLevel}
      </p>
      <p
        className="absolute z-[2] m-0 whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center font-['Signika'] text-[22px] font-medium leading-[1.232] text-black"
        style={{
          left: 10,
          top: 196,
          width: 380,
          height: 30,
          letterSpacing: "-0.03em",
        }}
      >
        {dateJoined}
      </p>

      <div
        className="absolute left-6 top-[133px] z-[2] w-px bg-black"
        style={{ height: 299 }}
        aria-hidden
      />
      <div
        className="absolute top-[133px] z-[2] w-px bg-black"
        style={{ left: 710, height: 33 }}
        aria-hidden
      />

      {/* Group 12 — subject profile header */}
      <div
        className="absolute z-[2]"
        style={{ left: 24, top: 374, width: 498, height: 65 }}
      >
        <h2
          className="z-2 absolute m-0 font-['Arya'] text-[41px] font-bold leading-[1.809] text-white"
          style={{
            left: 10,
            top: 0,
            width: 488,
            height: 62,
            letterSpacing: "0.03em",
          }}
        >
          SUBJECT PROFILE
        </h2>
        <div
          className="absolute bg-black/93"
          style={{ left: 0, top: 11, width: 390, height: 54 }}
          aria-hidden
        />
      </div>

      <div
        className="absolute z-[2] w-px bg-black"
        style={{ left: 25, top: 439, height: 485 }}
        aria-hidden
      />

      <img
        src={ASSET.decor}
        alt=""
        className="pointer-events-none absolute z-[3] max-w-none select-none"
        style={{ left: -26, top: 235.1, width: 266.53, height: 147.2 }}
        draggable={false}
      />

      {/* Group 13 — rows + barcode */}
      <div
        className="absolute z-[4]"
        style={{ left: 24, top: 439, width: 382, height: 275 }}
      >
        {PROFILE_RULES.map((rule, i) => (
          <div
            key={i}
            className="absolute left-0 h-px bg-black"
            style={{ top: rule.y, width: rule.w }}
            aria-hidden
          />
        ))}
        <p
          className="absolute m-0 font-['Barlow_Semi_Condensed'] text-[19px] whitespace-nowrap overflow-hidden text-ellipsis font-bold leading-[1.2] text-black flex items-center"
          style={{
            left: 8,
            top: 0,
            width: 370,
            height: 24,
            letterSpacing: "0.03em",
          }}
        >
          {registrationNumber}
        </p>
        <p
          className="absolute m-0 font-['Barlow_Semi_Condensed'] text-[19px] whitespace-nowrap overflow-hidden text-ellipsis font-bold leading-[1.2] text-black flex items-center"
          style={{
            left: 8,
            top: 30,
            width: 370,
            height: 24,
            letterSpacing: "0.03em",
          }}
        >
          {name}
        </p>
        <p
          className="absolute m-0 font-['Barlow_Semi_Condensed'] text-[19px] whitespace-nowrap overflow-hidden text-ellipsis font-bold leading-[1.2] text-black flex items-center"
          style={{
            left: 8,
            top: 60,
            width: 370,
            height: 24,
            letterSpacing: "0.03em",
          }}
        >
          {title}
        </p>
        <p
          className="absolute m-0 font-['Barlow_Semi_Condensed'] text-[19px] whitespace-nowrap overflow-hidden text-ellipsis font-bold leading-[1.2] text-black flex items-center"
          style={{
            left: 8,
            top: 91,
            width: 370,
            height: 24,
            letterSpacing: "0.03em",
          }}
        >
          {height}
        </p>
        <p
          className="absolute m-0 font-['Barlow_Semi_Condensed'] text-[19px] whitespace-nowrap overflow-hidden text-ellipsis font-bold leading-[1.2] text-black flex items-center"
          style={{
            left: 8,
            top: 121,
            width: 370,
            height: 24,
            letterSpacing: "0.03em",
          }}
        >
          {weight}
        </p>
        <p
          className="absolute m-0 font-['Barlow_Semi_Condensed'] text-[19px] whitespace-nowrap overflow-hidden text-ellipsis font-bold leading-[1.2] text-black flex items-center"
          style={{
            left: 8,
            top: 152,
            width: 370,
            height: 24,
            letterSpacing: "0.03em",
          }}
        >
          {languages}
        </p>
        <p
          className="absolute m-0 font-['Barlow_Semi_Condensed'] text-[19px] whitespace-nowrap overflow-hidden text-ellipsis font-bold leading-[1.2] text-black flex items-center"
          style={{
            left: 8,
            top: 182,
            width: 370,
            height: 24,
            letterSpacing: "0.03em",
          }}
        >
          {connections}
        </p>
        <p
          className="absolute m-0 font-['Barlow_Semi_Condensed'] text-[19px] whitespace-nowrap overflow-hidden text-ellipsis font-bold leading-[1.2] text-black flex items-center"
          style={{
            left: 8,
            top: 213,
            width: 370,
            height: 24,
            letterSpacing: "0.03em",
          }}
        >
          {chargesPending}
        </p>
        <p
          className="absolute m-0 font-['Barlow_Semi_Condensed'] text-[19px] whitespace-nowrap overflow-hidden text-ellipsis font-bold leading-[1.2] text-black flex items-center"
          style={{
            left: 8,
            top: 243,
            width: 370,
            height: 24,
            letterSpacing: "0.03em",
          }}
        >
          {lockupCount}
        </p>
        <img
          src={ASSET.barcode}
          alt=""
          className="pointer-events-none absolute max-w-none select-none"
          style={{ left: 211, top: 5.5, width: 115, height: 13.5 }}
          draggable={false}
        />
      </div>

      {/* image 24 [Vectorized] — gun + overlay label */}
      <div
        className="absolute z-[5]"
        style={{ left: 182.78, top: 166.08, width: 329.45, height: 237.73 }}
      >
        <img
          src={ASSET.gun}
          alt=""
          className="pointer-events-none absolute inset-0 h-full w-full max-w-none select-none object-contain"
          draggable={false}
        />
      </div>

      <p
        className="absolute z-[6] m-0 font-['Barlow_Semi_Condensed'] text-[19px] font-bold leading-[1.2] text-black"
        style={{
          left: 27,
          top: 710,
          width: 110,
          height: 28,
          letterSpacing: "0.03em",
        }}
      >
        {aboutHeading}
      </p>
      <p
        className="absolute z-[6] m-0 whitespace-pre-line font-['Copse'] text-[19px] font-normal leading-[1.236] text-black"
        style={{
          left: 27,
          top: 750,
          width: 691,
          height: 229,
          letterSpacing: "0.03em",
        }}
      >
        {aboutBody}
      </p>

      {/* Skill set block */}
      <div
        className="absolute z-[6] bg-black/94"
        style={{ left: 413, top: 590, width: 298, height: 33 }}
        aria-hidden
      />
      <h3
        className="absolute z-[6] m-0 font-['Coda_Caption'] text-[19px] font-extrabold leading-[1.579] text-white"
        style={{
          left: 423,
          top: 591,
          width: 115,
          height: 30,
          letterSpacing: "0.03em",
        }}
      >
        {skillSetTitle}
      </h3>
      <div
        className="absolute z-[6] w-px bg-black"
        style={{ left: 413, top: 622, height: 111 }}
        aria-hidden
      />
      <div
        className="absolute z-[6] h-px bg-black"
        style={{ left: 414, top: 732, width: 296 }}
        aria-hidden
      />
      <div
        className="absolute z-[6] overflow-y-auto pr-2 scrollbar-modern"
        style={{
          left: 414,
          top: 633,
          width: 296,
          height: 95,
          maxHeight: 95, // important
          pointerEvents:"auto",
        }}
      >
        {skillsList.map((label, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <div className="w-[17px] h-[17px] bg-[#060000]" />
            <p className="font-['Enriqueta'] text-[17px] tracking-[0.03em]">
              {label.toUpperCase()}
            </p>
          </div>
        ))}
      </div>

      <div
        className="absolute z-[6] w-px bg-black"
        style={{ left: 711, top: 573, height: 351 }}
        aria-hidden
      />
      <div
        className="absolute z-[6] h-px bg-black"
        style={{ left: 25, top: 924.5, width: 686 }}
        aria-hidden
      />
    </article>
  );
}
