import "../styles/Newspaper.css";
import React, { useEffect, useState, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import CinematicPage from "../components/CinematicPage";
import "../scripts/fittext.js";
import EvidenceGun from "../components/EvidenceGun.jsx";
import LoadingScreen from "../components/LoadingScreen.jsx";
import WantedPoster from "../components/WantedPoster.jsx";
import { useNavigate } from "react-router-dom";
import HackNiteNewspaperPoster from "../components/HackNiteNewspaperPoster";
import WantedProfileFrame from "../components/WantedProfileFrame";

// ==========================================
// CONFIGURATION: FLIPBOOK ASPECT RATIO
// Modify these exact values to change the dimensions of the newspaper pages natively.
// The aspect ratio will always strictly conform to these regardless of monitor size!
const PAGE_HEIGHT_VH = 90;
const PAGE_ASPECT_RATIO = 0.75; // Width is 65% of the Height
// ==========================================

// 1. MOVED OUTSIDE: This prevents React from destroying the pages on every click!
const Page = React.forwardRef((props, ref) => {
  return props.front === false ? (
    <div
      className="demoPage bg-contain select-none z-3 overflow-hidden"
      ref={ref}
    >
      <SinglePage posts={props.posts} pageNum={props.pageNum} />
    </div>
  ) : (
    <div
      className="demoPage bg-contain select-none z-3 overflow-hidden"
      ref={ref}
    >
      <FrontPage />
    </div>
  );
});

export default function Newspaper() {
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({
    width: window.innerHeight * (PAGE_HEIGHT_VH / 100) * PAGE_ASPECT_RATIO,
    height: window.innerHeight * (PAGE_HEIGHT_VH / 100),
  });

  const [isOpened, setIsOpened] = useState(false);
  const bookRef = useRef(null);

  const [postChunks, setPostChunks] = useState([]);
  const [role, setRole] = useState(null);
  const [wantedProfileData, setWantedProfileData] = useState(null);
  const [showWantedProfile, setShowWantedProfile] = useState(false);

  useEffect(() => {
    fetch("https://api.sicari.works/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const userRole = data?.user?.role || data?.role;
        setRole(userRole);
        if (userRole === "sicario" || userRole === "fixer") {
          const endpoint =
            userRole === "sicario"
              ? "api/sicario/profile"
              : "api/fixer/profile";
          fetch(`https://api.sicari.works/${endpoint}`, {
            credentials: "include",
          })
            .then((r) => r.json())
            .then((d) => {
              setWantedProfileData(d?.profile || d?.data || d);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleResize = () => {
      // Strict aspect ratio enforcement
      setDimensions({
        width: window.innerHeight * (PAGE_HEIGHT_VH / 100) * PAGE_ASPECT_RATIO,
        height: window.innerHeight * (PAGE_HEIGHT_VH / 100),
      });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch("https://api.sicari.works/api/posts", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const posts = Array.isArray(data)
          ? data
          : data.posts || data.data || [];
        const chunks = [];
        for (let i = 0; i < posts.length; i += 2) {
          chunks.push(posts.slice(i, i + 2));
        }
        setPostChunks(chunks);
      })
      .catch((err) => console.error("Error fetching posts:", err));
  }, []);

  const displayPages = postChunks.length > 0 ? postChunks : Array(6).fill([]);
  const isOddLength = displayPages.length % 2 !== 0;

  const pagesArray = [
    <Page key="front" front={true} />,
    ...displayPages.map((chunk, idx) => (
      <Page
        key={`flip-page-${idx}`}
        front={false}
        posts={chunk}
        pageNum={idx + 1}
      />
    )),
  ];

  if (isOddLength) {
    pagesArray.push(
      <Page
        key="odd-pad"
        front={false}
        posts={[]}
        pageNum={displayPages.length + 1}
      />,
    );
  }

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
            transform: !isOpened
              ? "rotate(45deg) scale(0.5) translate(15vw, 10vh)"
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
            key={`flipbook-${postChunks.length}`}
            width={dimensions.width}
            height={dimensions.height}
            showCover={false}
            usePortrait={false}
            ref={bookRef}
            className="shadow-2xl bg-white"
            startZIndex={30}
            maxShadowOpacity={0.3}
            disableFlipByClick={!isOpened}
          >
            {pagesArray}
          </HTMLFlipBook>
        </div>

        {showWantedProfile && (
          <div
            className="fixed inset-0 z-[60] cursor-pointer pointer-events-auto bg-black/80 backdrop-blur-md transition-opacity duration-700 ease-in-out"
            onClick={() => setShowWantedProfile(false)}
            aria-hidden
          />
        )}

        <div
          className={`absolute shadow-2xl origin-center will-change-transform ${
            showWantedProfile
              ? "z-[70] pointer-events-auto translate-x-0 translate-y-0 scale-[0.70] rotate-0 transition-transform duration-700 ease-in-out"
              : `z-20 cursor-pointer pointer-events-auto translate-x-[36vw] -translate-y-[24vh] scale-[0.30] rotate-[15deg] border-[4px] border-stone-800
         transition-transform duration-400 ease-in-out
         ${!showWantedProfile ? "hover:scale-[0.28] hover:border-12 p-4 hover:border-amber-400" : ""}
         ${isOpened ? "opacity-0 pointer-events-none blur-xl" : "opacity-100"}`
          }`}
          onClick={() => {
            if (!showWantedProfile) setShowWantedProfile(true);
          }}
        >
          <WantedProfileFrame
            profile={wantedProfileData}
            className="pointer-events-none"
          />

          {showWantedProfile && (
            <button
              className="pointer-events-auto absolute -bottom-24 left-[40%] -translate-x-1/2 bg-stone-900 bg-opacity-95 text-[#f0e8d0] px-8 py-3 font-bold tracking-[0.2em] text-3xl border-8 border-amber-300 hover:bg-stone-800 hover:scale-102 shadow-[0_10px_30px_black]"
              onClick={(e) => {
                e.stopPropagation();
                navigate("/edit_profile");
              }}
            >
              EDIT PROFILE
            </button>
          )}
        </div>

        <img
          src="/assets/MagnifyingGlass.png"
          alt="Search"
          onClick={() => navigate("/Heists")}
          draggable={false}
          className="magGlass absolute right-20 z-19 bottom-15 rotate-30 max-w-50 box-content cursor-pointer hover:scale-110 transition-transform duration-300"
        />

        <img
          src="/assets/bullets.png"
          alt="wanted image"
          draggable={false}
          className="bullets absolute left-20 z-19 bottom-15 rotate-160 max-w-50 p-1 box-content "
        />
        {role === "sicario" && (
          <img
            src="/assets/pen.png"
            alt="write post"
            onClick={() => navigate("/add_post")}
            draggable={false}
            className={`absolute left-[40vw] top-[10vh] cursor-pointer z-20 
    transition-transform duration-300 ease-in-out
    hover:transition-none hover:scale-[1.15] 
    hover:drop-shadow-[4px_0_0_rgba(251,191,36,1)]
    hover:drop-shadow-[-4px_0_0_rgba(251,191,36,1)]
    hover:drop-shadow-[0_4px_0_rgba(251,191,36,1)]
    hover:drop-shadow-[0_-4px_0_rgba(251,191,36,1)]
    w-50
    ${isOpened ? "opacity-0 pointer-events-none blur-xl" : "opacity-100"}`}
          />
        )}
        <EvidenceGun />
      </div>
    </CinematicPage>
  );
}

function SinglePage({ posts = [], pageNum = 1 }) {
  const topPost = posts[0] || {};
  const bottomPost = posts[1] || {};

  return (
    <div className="w-full h-full p-0 overflow-hidden flex justify-center items-center bg-[#f0e8d0]">
      <HackNiteNewspaperPoster
        volumeLabel="Vol1 , 13"
        pageLabel={`Page : ${pageNum}`}
        topPostId={topPost._id || topPost.id}
        topPostUserVote={topPost.userVote || topPost.vote}
        headlineTop={topPost.title || topPost.heading || "REDACTED"}
        bodyColumn={
          topPost.content ||
          topPost.body ||
          "No information available at this time."
        }
        usernameTop={topPost.author || topPost.username || "Anonymous"}
        topBountyScore={topPost.score}
        portraitSrc={
          topPost.image_url ||
          topPost.photoUrl ||
          topPost.photo ||
          topPost.image ||
          topPost.photo_url
        }
        bottomPostId={bottomPost._id || bottomPost.id}
        bottomPostUserVote={bottomPost.userVote || bottomPost.vote}
        headlineBottom={bottomPost.title || bottomPost.heading || "REDACTED"}
        bodyFullWidth={
          bottomPost.content ||
          bottomPost.body ||
          "No information available at this time."
        }
        usernameBottom={bottomPost.author || bottomPost.username || "Anonymous"}
        bountyLabel="Bounty reward"
        bottomBountyScore={bottomPost.score}
      />
    </div>
  );
}

function FrontPage() {
  return (
    <div className="page p-3 bg-[url('/assets/Newspaper.png')] bg-cover bg-center h-full w-full flex items-center flex-col overflow-hidden">
      <div className="page p-3 bg-[url('/assets/Newspaper.png')] bg-cover h-full w-full flex items-center flex-col">
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
                alt="test block"
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
                <img
                  src="/assets/advert.svg"
                  alt="advertisement for front page"
                  className=" m-0 w-[80%]"
                />
                hi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
