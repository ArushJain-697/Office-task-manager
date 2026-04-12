/**
 * Pixel-matched to Figma node 182:1653 ("image 30 [Vectorized]"), 381×507.
 * Backgrounds and shapes use exported SVGs from Framelink.
 *
 * The Figma file’s hashtag layers used hateful wording; defaults here are neutral
 * placeholders with the same typography. Pass `hashtagLines={[a,b,c]}` for your copy.
 */
const ASSET = {
  back1: "/assets/vector-back-1.svg",
  back2: "/assets/vector-back-2.svg",
  arrowTl: "/assets/vector-arrow-tl.svg",
  arrowBr: "/assets/vector-arrow-br.svg",
  center: "/assets/vector-center.svg",
};

export default function HackNiteCard({
  title = "The Op Name",
  hashtagLines = ["# Track one", "# Track two", "# Track three"],
}) {
  return (
    <article
      className="relative isolate box-border overflow-hidden bg-transparent"
      style={{ width: 381, height: 507 }}
      aria-label={title}
    >
      {/* z-0 — diamond gradient base (359×486 @ y+4) */}
      <img
        src={ASSET.back1}
        alt=""
        className="pointer-events-none absolute left-0 top-1 z-0 h-[486px] w-[359px] max-w-none select-none"
        width={359}
        height={486}
        draggable={false}
      />
      {/* z-1 — cyan plate + illustration (opacity 0.67 in export) */}
      <img
        src={ASSET.back2}
        alt=""
        className="pointer-events-none absolute left-0 top-1 z-[1] h-[486px] w-[359px] max-w-none select-none"
        width={359}
        height={486}
        draggable={false}
      />

      {/* z-2 — Line 47 horizontal */}
      <div
        className="absolute z-[2] bg-black"
        style={{ left: 66, top: 34.96, width: 259, height: 1.04 }}
        aria-hidden
      />
      {/* z-2 — Line 49 bottom horizontal */}
      <div
        className="absolute z-[2] h-px bg-black"
        style={{ left: 36, top: 458, width: 270 }}
        aria-hidden
      />
      {/* z-2 — Line 48 left vertical */}
      <div
        className="absolute z-[2] bg-black"
        style={{ left: 35.48, top: 97.99, width: 0.52, height: 360.01 }}
        aria-hidden
      />

      {/* z-[3] — Group 23: "A" + arrow (18,4) */}
      <div
        className="absolute z-[3]"
        style={{ left: 18, top: 4, width: 73, height: 79 }}
      >
        <p
          className="absolute left-0 top-0 m-0 p-0 font-['Bigshot_One'] font-normal text-black"
          style={{
            width: 73,
            height: 46,
            fontSize: 63,
            lineHeight: "1.048em",
          }}
        >
          A
        </p>
        <img
          src={ASSET.arrowTl}
          alt=""
          className="absolute max-w-none select-none"
          style={{ left: 10, top: 57, width: 12.55, height: 22 }}
          width={21}
          height={30}
          draggable={false}
        />
      </div>

      {/* z-[3] — Group 24: arrow + "A" (308,382) */}
      <div
        className="absolute z-[3]"
        style={{ left: 308, top: 382, width: 40, height: 90 }}
      >
        <img
          src={ASSET.arrowBr}
          alt=""
          className="absolute max-w-none select-none"
          style={{ left: 11, top: 0, width: 12.55, height: 22 }}
          width={21}
          height={30}
          draggable={false}
        />
        <p
          className="absolute left-0 m-0 p-0 font-['Bigshot_One'] font-normal text-black"
          style={{
            top: 24,
            width: 40,
            height: 66,
            fontSize: 63,
            lineHeight: "1.048em",
          }}
        >
          A
        </p>
      </div>

      {/* z-[4] — Line 50 vertical #010202 */}
      <div
        className="absolute z-[4] bg-[#010202]"
        style={{ left: 325, top: 35, width: 1, height: 343 }}
        aria-hidden
      />

      {/* z-[5] — title */}
      <h1
        className="absolute z-[5] m-0 p-0 font-['Girassol'] font-normal text-[#010202]"
        style={{
          left: 55,
          top: 90,
          width: 276,
          height: 78,
          fontSize: 51,
          lineHeight: "1.194em",
        }}
      >
        {title}
      </h1>

      {/* z-[6] — Vector 7 (130×223, fill #FF0000, opacity 0.35, multiply in SVG) */}
      <img
        src={ASSET.center}
        alt=""
        className="pointer-events-none absolute z-[6] max-w-none select-none"
        style={{ left: 106, top: 144, width: 130, height: 223 }}
        width={130}
        height={223}
        draggable={false}
      />

      {/* z-[7] — dynamic hashtag rows (Bungee 30 / #000) */}
      <div
        className="absolute z-[7] flex flex-col items-start"
        style={{ left: 61, top: 203, width: 264, gap: "10px" }}
      >
        {hashtagLines.map((line, idx) => (
          <p
            key={idx}
            className="m-0 w-fit text-left p-0 font-['Bungee'] font-normal leading-[1.2em] text-black"
            style={{ fontSize: 24 }}
          >
            {line}
          </p>
        ))}
      </div>
    </article>
  );
}
