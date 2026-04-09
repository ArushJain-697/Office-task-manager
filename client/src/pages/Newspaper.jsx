import "../styles/Newspaper.css";
import React, { useEffect, useState, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import CinematicPage from "../components/CinematicPage";
import "../scripts/fittext.js";
// import EvidenceGun from "../components/EvidenceGun.jsx";

// 1. MOVED OUTSIDE: This prevents React from destroying the pages on every click!
const Page = React.forwardRef((props, ref) => {
  return props.front === false ? (
    <div className="demoPage bg-contain select-none z-3" ref={ref}>
      <SinglePage />
    </div>
  ) : (
    <div className="demoPage bg-contain select-none z-3" ref={ref}>
      <FrontPage />
    </div>
  );
});

export default function Newspaper() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth * 0.35,
    height: window.innerHeight * 0.85,
  });

  const [isOpened, setIsOpened] = useState(false);
  const bookRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width:
          window.innerWidth > 768
            ? window.innerWidth * 0.35
            : window.innerWidth * 0.8,
        height: window.innerHeight * 0.85,
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <CinematicPage>
      <div className=" bgTable bg-[url('/assets/table.png')] fixed inset-0 flex justify-center items-center bg-cover overflow-hidden">
        {/* 1. DARK OVERLAY */}
        <div
          onClick={() => setIsOpened(false)}
          className={` fixed inset-0 bg-black/70 transition-all duration-700 z-20 ${
            isOpened
              ? "opacity-100 backdrop-blur-md pointer-events-auto"
              : "opacity-0 pointer-events-none backdrop-blur-none"
          }`}
        />

        {/* 2. STATIC IMAGE (ON TABLE) */}
        <div
          onClick={() => setIsOpened(true)}
          className={`absolute transition-all duration-700 z-10 cursor-pointer shadow-2xl ${
            isOpened
              ? "opacity-0 scale-150 blur-xl pointer-events-none"
              : "opacity-100 scale-100 "
          }`}
          style={{
            // Replaced 200px with 15vw (15% of screen width)
            // Replaced -100px with -10vh (10% of screen height)
            transform: !isOpened
              ? "rotate(45deg) scale(0.5) translate(15vw, -10vh)"
              : "none",
            transformOrigin: "center center",
          }}
        >
          <img
            src="/assets/frontPageBG.png"
            className="hover:border-8 p-2 border-amber-300 max-w-[35vw]"
            alt="newspaper-folded"
          />
        </div>

        {/* 3. THE ACTUAL BOOK */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={`relative transition-all duration-700 z-30 ${
            isOpened
              ? "opacity-100 scale-100 blur-0"
              : "opacity-0 rotate-45 scale-75 blur-lg pointer-events-none"
          }`}
        >
          <HTMLFlipBook
            width={dimensions.width}
            height={dimensions.height}
            showCover={true}
            usePortrait={false}
            ref={bookRef}
            className="shadow-2xl"
            startZIndex={30}
            maxShadowOpacity={0.3}
            disableFlipByClick={!isOpened}
          >
            <Page front={true} />
            <Page front={false} />
            <Page front={false} />
            <Page front={false} />
            <Page front={false} />
            <Page front={false} />
            <Page front={false} />
            <Page front={false} />
            <Page front={false} />
            <Page front={false} />
            <Page front={false} />
            <Page front={false} />
            <Page front={false} />
            <Page front={false} />
          </HTMLFlipBook>
        </div>

        {/* DECORATION */}
        <img
          src="/assets/wanted.jpeg"
          alt="wanted image"
          draggable={false}
          className="absolute right-20 top-15 rotate-160 max-w-30 p-1 hover:border-2 border-amber-300 hover:scale-110s box-content "
        />
        {/* <EvidenceGun /> */}
      </div>
    </CinematicPage>
  );
}

function SinglePage() {
  return (
    <div className="page p-3 bg-[url('/assets/Newspaper.png')] grayscale bg-cover h-[85vh] w-[35vw]">
      <div className="newsHeader h-[5%] p-0 m-0 border"></div>
      <div className="newsContent flex gap-6 mt-2">
        <div className="col1">
          <h2 className="newsHeading text-2xl text-center">Falana 1</h2>
          <img
            src="/assets/test.png"
            className="newsImage max-w-[55%] float-left mr-4"
            alt="news"
          />
          <p className="newsContent text-justify">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus
            numquam quaerat ipsa commodi earum optio quia ut, quis distinctio
            pariatur cumque amet vitae dolore non nobis. Atque numquam nihil
            facere vitae quis aliquid incidunt quia, voluptas sequi.
          </p>
        </div>
        <div className="col2">
          <h2 className="newsHeading text-2xl text-center">Falana 2</h2>
          <img
            src={"/assets/test.png"}
            className="newsImage max-w-[55%] float-left mr-4"
            alt="news"
          />
          <p className="newsContent text-justify">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus
            numquam quaerat ipsa commodi earum optio quia ut, quis distinctio
            pariatur cumque amet vitae dolore non nobis. Atque numquam nihil
            facere vitae quis aliquid incidunt quia, voluptas sequi.
          </p>
        </div>
      </div>
    </div>
  );
}

function FrontPage() {
  return (
    <div className="page p-3 bg-[url('/assets/Newspaper.png')] grayscale bg-contain h-[85vh] w-[35vw] flex items-center flex-col">
      <img src="/assets/frontPageBG.png" alt="front page" className="w-[90%]" />
    </div>
  );
}
