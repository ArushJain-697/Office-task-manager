import React, { useState, useRef, useLayoutEffect } from "react";

/** Shared height for portrait + article column (top & bottom stories). */
const STORY_MEDIA_HEIGHT = "27.5%";
const STORY_BODY_HEIGHT = "27.5%";
/** Bottom row (bounty / score / votes / username) — below both story columns */
const BOTTOM_CONTROLS_TOP = "95.1%";

/**
 * Single-line username: shrink font (px) until text fits parent width.
 */
function UsernameFit({ text }) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el?.parentElement) return;
    const fit = () => {
      const pw = el.clientWidth || el.parentElement?.clientWidth || 0;
      if (pw < 4) return;
      const maxPx = Math.min(26, Math.max(7, pw * 0.14));
      let lo = 7;
      let hi = maxPx;
      let best = maxPx;
      el.style.whiteSpace = "nowrap";
      while (hi - lo > 0.35) {
        const mid = (lo + hi) / 2;
        el.style.fontSize = `${mid}px`;
        if (el.scrollWidth <= pw - 1) {
          best = mid;
          lo = mid;
        } else {
          hi = mid;
        }
      }
      el.style.fontSize = `${best}px`;
    };
    fit();
    const id = requestAnimationFrame(fit);
    return () => cancelAnimationFrame(id);
  }, [text]);

  return (
    <p
      ref={ref}
      className="absolute m-0 max-w-full overflow-hidden text-ellipsis p-0 font-['Hermeneus_One'] font-normal leading-none"
      style={{
        left: "21.4%",
        top: "0",
        width: "78%",
        fontSize: "5.6cqi",
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </p>
  );
}

function Upvote({ className, onClick }) {
  return (
    <img 
      src="/assets/upvote.svg" 
      onClick={onClick}
      className={`cursor-pointer hover:scale-125 transition-transform ${className || ""}`} 
      style={{ width: "100%", height: "auto" }}
      alt="Upvote" 
    />
  );
}

function Downvote({ className, onClick }) {
  return (
    <img 
      src="/assets/upvote.svg" 
      onClick={onClick}
      className={`cursor-pointer hover:scale-125 transition-transform rotate-180 ${className || ""}`} 
      style={{ width: "100%", height: "auto" }}
      alt="Downvote" 
    />
  );
}

function VoteGroup({ postId, initialVote = 0, onScoreChange }) {
  const [vote, setVote] = useState(Number(initialVote) || 0);

  const handleVote = async (value) => {
    if (!postId) return;
    
    let newVote;
    let scoreDelta = 0;
    
    if (vote === value) {
      newVote = 0;
      scoreDelta = -value;
    } else {
      newVote = value;
      scoreDelta = vote === 0 ? value : value * 2;
    }
    
    setVote(newVote);
    if (onScoreChange) onScoreChange(scoreDelta);

    try {
      await fetch(`https://api.sicari.works/api/posts/${postId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ vote: value }),
      });
    } catch (err) {
      console.error("Failed to submit vote:", err);
    }
  };

  return (
    <div
      className="flex items-center gap-[0.5cqi] pt-[0.65cqi]"
      onClick={(e) => e.stopPropagation()}
    >
      <div style={{ width: "3.3cqi" }}>
        <Upvote 
          onClick={() => handleVote(1)}
          className={vote === 1 ? "scale-110 drop-shadow-[0_0_8px_green]" : "opacity-70 grayscale"} 
        />
      </div>
      <div style={{ width: "3.3cqi" }}>
        <Downvote 
          onClick={() => handleVote(-1)}
          className={vote === -1 ? "scale-110 drop-shadow-[0_0_8px_red]" : "opacity-70 grayscale"} 
        />
      </div>
    </div>
  );
}

export default function HackNiteNewspaperPoster({
  className = "",
  paperImageSrc,
  portraitSrc,
  volumeLabel = "Vol1 , 13",
  pageLabel = "Page : 1",
  headlineTop = "Recently attended a criminal con event",
  headlineBottom = "I recently killed a famous politician",
  bodyColumn = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque varius augue eu dolor egestas, nec hendrerit augue varius. Duis ultrices iaculis nunc nec tempor. Nunc mollis ex non enim gravida lobortis. Praesent ligula justo, egestas tempor leo nec, sodales pellentesque elit. Suspendisse hendrerit enim quis orci euismod, sed aliquet nibh euismod. Suspendisse interdum risus ac aliquam scelerisque. In sit amet quam a eros pretium ultrices.`,
  bodyFullWidth = `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque varius augue eu dolor egestas, nec hendrerit augue varius. Duis ultrices iaculis nunc nec tempor. Nunc mollis ex non enim gravida lobortis. Praesent ligula justo, egestas tempor leo nec, sodales pellentesque elit. Suspendisse hendrerit enim quis orci euismod, sed aliquet nibh euismod. Suspendisse interdum risus ac aliquam scelerisque. In sit amet quam a eros pretium ultrices.`,
  usernameTop = "Username",
  usernameBottom = "Username",
  bountyLabel = "Bounty reward",
  topBountyScore,
  bottomBountyScore,
  topPostId,
  topPostUserVote,
  bottomPostId,
  bottomPostUserVote,
  bottomPortraitSrc,
}) {
  const [topScore, setTopScore] = useState(Number(topBountyScore) || 0);
  const [bottomScore, setBottomScore] = useState(Number(bottomBountyScore) || 0);

  return (
    <article
      className={`relative isolate box-border w-full h-full shrink-0 overflow-hidden bg-[#f0e8d0] text-black ${className}`}
      aria-label="Newspaper poster"
      style={{ containerType: "inline-size" }}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[url('/assets/Newspaper.png')] bg-cover"
        aria-hidden
      />

      {/* Frame 9 instance — top rules */}
      <div
        className="pointer-events-none absolute bg-black"
        style={{ left: "2.66%", top: "1.52%", height: "0.5%", width: "95.5%" }}
      />
      <div
        className="pointer-events-none absolute bg-black"
        style={{ left: "2.66%", top: "2.34%", height: "0.1%", width: "95.5%" }}
      />

      {/* Group 22 — editorial overlay */}
      <div className="absolute" style={{ left: "2.66%", top: "3.56%", height: "88.6%", width: "97%" }}>
        <div className="absolute bg-black" style={{ left: "0", top: "3.1%", height: "0.57%", width: "98.3%" }} />
        <div className="absolute bg-black" style={{ left: "0", top: "4.0%", height: "0.11%", width: "98.3%" }} />

        <p
          className="absolute m-0 p-0 font-['Arapey'] text-black"
          style={{ left: "1.37%", top: "0", width: "13.2%", fontSize: "3.2cqi", lineHeight: "1.1" }}
        >
          {volumeLabel}
        </p>
        <p
          className="absolute m-0 p-0 font-['Arapey'] text-black"
          style={{ left: "85.7%", top: "0", width: "13.2%", fontSize: "3.2cqi", lineHeight: "1.1" }}
        >
          {pageLabel}
        </p>

        <h2
          className="absolute m-0 max-w-none p-0 font-['IM_Fell_Double_Pica_SC'] font-normal text-black"
          style={{ left: "0.27%", top: "5.97%", width: "98.7%", fontSize: "5.33cqi", lineHeight: "1.25" }}
        >
          {headlineTop}
        </h2>

        {/* Lines */}
        <div className="absolute bg-[#040404]" style={{ left: "0", top: "11.78%", height: "46.5%", width: "0.13%" }} />
        <div className="absolute bg-[#040404]" style={{ left: "0", top: "11.03%", height: "0.43%", width: "98.4%" }} />
        <div className="absolute bg-[#040404]" style={{ left: "43%", top: "11.26%", height: "30.2%", width: "0.13%" }} />

        {/* Portrait */}
        {portraitSrc ? (
          <img
            src={portraitSrc}
            alt=""
            className="absolute box-border border-[0.15cqi] border-black object-cover select-none"
            style={{ left: "1.37%", top: "13.1%", width: "40.5%", height: STORY_MEDIA_HEIGHT }}
            draggable={false}
          />
        ) : (
          <div
            className="absolute box-border flex items-center justify-center border-[0.1cqi] border-black bg-neutral-200/80 text-neutral-600"
            style={{ left: "1.37%", top: "13.1%", width: "40.5%", height: STORY_MEDIA_HEIGHT, fontSize: "1.8cqi" }}
            aria-hidden
          >
            Portrait
          </div>
        )}

        <p
          className="absolute m-0 max-w-none overflow-hidden whitespace-pre-wrap p-0 font-['Fahkwang'] font-normal text-black"
          style={{ left: "44%", top: "13.1%", width: "51.6%", height: STORY_BODY_HEIGHT, fontSize: "2.6cqi", lineHeight: "1.35" }}
        >
          {bodyColumn}
        </p>

        <div className="absolute bg-black" style={{ left: "0", top: "50%", height: "0.11%", width: "43%" }} />

        {/* Username + rule */}
        <div className="absolute text-[#010202]" style={{ left: "63.6%", top: "52.8%", width: "35%", height: "4.2%" }}>
          <div className="absolute bg-[#130802]" style={{ left: "0", top: "74%", height: "14%", width: "15%" }} />
          <UsernameFit text={usernameTop} />
        </div>

        <p
          className="absolute m-0 p-0 font-['Koulen'] font-normal text-[#050200]"
          style={{ left: "1.5%", top: "53.8%", width: "20.4%", fontSize: "3.3cqi", lineHeight: "1.08" }}
        >
          {bountyLabel}
        </p>

        <div
          className="absolute box-border border-[0.25cqi] border-black bg-transparent flex items-center justify-center"
          style={{ left: "22.5%", top: "53.1%", width: "17%", height: "4.2%" }}
        >
          <p
            className="m-0 p-0 font-['Fredericka_the_Great'] font-normal text-black"
            style={{ fontSize: "3.3cqi", lineHeight: "1.08" }}
          >
            {topBountyScore !== undefined ? `$${topScore}` : "Classified"}
          </p>
        </div>

        <div className="absolute" style={{ left: "41.2%", top: "52.55%" }}>
          <VoteGroup
            postId={topPostId}
            initialVote={topPostUserVote}
            onScoreChange={(delta) => setTopScore((prev) => prev + delta)}
          />
        </div>

        {/* Lower masthead */}
        <div className="absolute bg-[#040404]" style={{ left: "0", top: "58.2%", height: "0.11%", width: "97.8%" }} />

        <h2
          className="absolute m-0 max-w-none p-0 font-['IM_Fell_Double_Pica_SC'] font-normal text-black"
          style={{ left: "0.27%", top: "58.8%", width: "98.7%", fontSize: "5.33cqi", lineHeight: "1.25" }}
        >
          {headlineBottom}
        </h2>

        <div className="absolute bg-[#040404]" style={{ left: "0.4%", top: "64.4%", height: "0.11%", width: "97.4%" }} />
        <div className="absolute bg-[#040404]" style={{ left: "0.2%", top: "58.6%", height: "36.8%", width: "0.13%" }} />

        {/* Bottom Portrait — same media height as top */}
        {bottomPortraitSrc ? (
          <img
            src={bottomPortraitSrc}
            alt=""
            className="absolute box-border border-[0.15cqi] border-black object-cover select-none"
            style={{ left: "1.37%", top: "66.7%", width: "40.5%", height: STORY_MEDIA_HEIGHT }}
            draggable={false}
          />
        ) : null}

        {/* Bottom divider line — only shown when image is present, mirrors top */}
        {bottomPortraitSrc && (
          <div className="absolute bg-[#040404]" style={{ left: "43%", top: "64.7%", height: "30.2%", width: "0.13%" }} />
        )}

        <p
          className="absolute m-0 max-w-none overflow-hidden whitespace-pre-wrap p-0 font-['Fahkwang'] font-normal text-black"
          style={{
            left: bottomPortraitSrc ? "44%" : "1.7%",
            top: "66.7%",
            width: bottomPortraitSrc ? "51.6%" : "96.3%",
            height: STORY_BODY_HEIGHT,
            fontSize: "2.6cqi",
            lineHeight: "1.35",
          }}
        >
          {bodyFullWidth}
        </p>

        {/* Lower story — bounty / score / vote / username (one band below body; gap above) */}
        <div className="absolute text-[#010202]" style={{ left: "63.6%", top: BOTTOM_CONTROLS_TOP, width: "35%", height: "4%" }}>
          <div className="absolute bg-[#130802]" style={{ left: "0", top: "74%", height: "14%", width: "15%" }} />
          <UsernameFit text={usernameBottom} />
        </div>

        <p
          className="absolute m-0 p-0 font-['Koulen'] font-normal text-[#050200]"
          style={{ left: "1.5%", top: BOTTOM_CONTROLS_TOP, width: "20.4%", fontSize: "3.3cqi", lineHeight: "1.08" }}
        >
          {bountyLabel}
        </p>

        <div
          className="absolute box-border border-[0.25cqi] border-black bg-transparent flex items-center justify-center"
          style={{ left: "22.5%", top: BOTTOM_CONTROLS_TOP, width: "17%", height: "3.8%" }}
        >
          <p
            className="m-0 p-0 font-['Fredericka_the_Great'] font-normal text-black"
            style={{ fontSize: "3.3cqi", lineHeight: "1.08" }}
          >
            {bottomBountyScore !== undefined ? `$${bottomScore}` : "Classified"}
          </p>
        </div>

        <div className="absolute" style={{ left: "41.2%", top: BOTTOM_CONTROLS_TOP }}>
          <VoteGroup
            postId={bottomPostId}
            initialVote={bottomPostUserVote}
            onScoreChange={(delta) => setBottomScore((prev) => prev + delta)}
          />
        </div>

        <div className="absolute bg-[#040404]" style={{ left: "0.4%", top: "99.3%", height: "0.11%", width: "97.6%" }} />
      </div>
    </article>
  );
}