import "../styles/Newspaper.css";
import React, { useEffect, useState, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import CinematicPage from "../components/CinematicPage";
import "../scripts/fittext.js";
import EvidenceGun from "../components/EvidenceGun.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import WantedPoster from "../components/WantedPoster.jsx";
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
      {/* <LoadingScreen /> */}

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
          className={`absolute transition-all duration-700 z-20 cursor-pointer shadow-2xl ${
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
            src="/assets/frontPageBG.jpeg"
            className="hover:border-8 p-2 border-amber-300 max-w-[35vw] z-20"
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

        <img
          src="/assets/wanted.jpeg"
          alt="wanted image"
          draggable={false}
          className="absolute right-20 z-19 top-15 rotate-20 max-w-50 p-1 hover:border-2 border-amber-300 hover:scale-110s box-content "
        />
        <img
          src="/assets/MagnifyingGlass.png"
          alt="Search"
          draggable={false}
          className="magGlass absolute right-20 z-19 bottom-15 rotate-130 max-w-50 box-content "
        />

        <img
          src="/assets/bullets.png"
          alt="wanted image"
          draggable={false}
          className="bullets absolute left-20 z-19 bottom-15 rotate-160 max-w-50 p-1 box-content "
        />
        <EvidenceGun />
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
            pariatur cumque ameterat ipsa commodi earum optio quia ut, quis
            distinctio pariatur cumque ameterat ipsa commodi earum optio quia
            ut, quis distinctio pariatur cumque ameterat ipsa commodi earum
            optio quia ut, quis distinctio pariatur cumque ameterat ipsa commodi
            earum optio quia ut, quis distinctio pariatur cumque amet vitae
            dolore non nobis. Atque numquam nihil facere vitae quis aliquid
            incidunt quia, voluptas sequi.
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
            pariatur cumque ameterat ipsa commodi earum optio quia ut, quis
            distinctio pariatur cumque ameterat ipsa commodi earum optio quia
            ut, quis distinctio pariatur cumque ameterat ipsa commodi earum
            optio quia ut, quis distinctio pariatur cumque ameterat ipsa commodi
            earum optio quia ut, quis distinctio pariatur cumque amet vitae
            dolore non nobis. Atque numquam nihil facere vitae quis aliquid
            incidunt quia, voluptas sequi.
          </p>
        </div>
      </div>
    </div>
  );
}

function FrontPage() {
  return (
    <div className="page p-3 bg-[url('/assets/Newspaper.png')] grayscale bg-contain h-[85vh] w-[35vw] flex items-center flex-col">
      <div className="page p-3 bg-[url('/assets/Newspaper.png')] grayscale bg-cover h-[85vh] w-[35vw] flex items-center flex-col">
        <div className="w-full h-[0.3em] m-1 font-black block bg-black"></div>
        <div className="w-full h-[0.05em] mb-1 font-black block bg-black"></div>
        <img src="/assets/newsPaperName.svg" alt="" className="w-[95%] " />
        <div className="w-full h-[0.3em] m-1 mb-0 font-black block bg-black"></div>
        <div className="font-[Arapey] text-[1.1em] flex justify-between pl-5 pr-5 w-full">
          <span>Vol1</span>
          <span className="italic">Sin City's Oly trusted Daily</span>
          <span>Price:$0.50</span>
        </div>
        <div className="w-full h-[0.05em] mt-0 font-black block bg-black"></div>
        <div className="w-full h-[0.3em] m-1 font-black block bg-black"></div>
        <div className="content flex flex-col items-center w-[95%] h-full">
          <img src="/assets/crime.svg" alt="" className="w-[95%] m-5" />
          <div className="w-full h-[0.3em] m-1 font-black block bg-black"></div>
          <div className="w-full h-[0.05em] mt-0 font-black block bg-black"></div>
          <div className="paragraphs h-full w-full flex gap-4 mt-3 flex-col ">
            <div className=" w-full h-full ">
              <img
                src="/assets/test.png"
                className="newsImage max-w-[45%] float-left mr-4 "
              />
              <p className="newsContent text-justify">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Minus
                numquam quaerat ipsa commodi earum optio quia ut, quis ectus
                quidem pariatur recusandae odio rem?numquam quaerat ipsa com
                Lorem ipsum dolor sit, amet consectetur adipisicing elit.
                Aliquam neque tempore cupiditate, asperiores doloribus
                consequatur ab inventore dolorem it. Tempore, nobis.modi earum
                optio quia ut, quis ectus quidem pariatur recusandae odio rem?
              </p>
              <div className="advertisement w-full border-2 p-0 mt-1 flex items-center justify-center">
                  <img src="/assets/advert.svg" alt="advertisement for front page" className=" m-0 w-[80%]" />hi
              </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
