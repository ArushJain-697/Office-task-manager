import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import PolaroidCard from "../components/PolaroidCard";

const API = "https://api.sicari.works";

const generatePositions = (users, startIndex) => {
  const ww = typeof window !== "undefined" ? window.innerWidth : 1000;
  const cardWidth = 240;
  const spacingY = 480;
  const minBoundary = 56;
  const maxBoundary = Math.max(minBoundary, ww - cardWidth - 56);
  const usableWidth = Math.max(0, maxBoundary - minBoundary);

  return users.map((user, i) => {
    const id = startIndex + i;
    let zone = id % 3;
    let targetX;

    if (zone === 0) {
      targetX = minBoundary + Math.random() * Math.max(1, usableWidth * 0.35);
    } else if (zone === 1) {
      targetX =
        minBoundary +
        usableWidth * 0.6 +
        Math.random() * Math.max(1, usableWidth * 0.4);
    } else {
      targetX =
        minBoundary + usableWidth * 0.5 - cardWidth / 2 + (Math.random() - 0.5) * 220;
    }

    const x = Math.max(minBoundary, Math.min(targetX, maxBoundary));
    const y = id * spacingY + 150 + (Math.random() * 200 - 100);
    const rotation = (Math.random() - 0.5) * 16;

    return {
      ...user,
      position: { x, y },
      rotation,
      pinPos: { x: x + cardWidth / 2, y: y - 10 },
    };
  });
};

const RedThread = ({ prevPos, currPos, index, cardsInCenter }) => {
  const canDraw = index <= cardsInCenter;

  const dist = Math.sqrt(
    Math.pow(currPos.x - prevPos.x, 2) + Math.pow(currPos.y - prevPos.y, 2),
  );
  const sag = dist * 0.15;
  const midX = (prevPos.x + currPos.x) / 2;
  const midY = (prevPos.y + currPos.y) / 2 + sag;

  const pathData = `M ${prevPos.x} ${prevPos.y} Q ${midX} ${midY} ${currPos.x} ${currPos.y}`;

  return (
    <g>
      <defs>
        <filter
          id="threadShadow"
          x="-20%"
          y="-20%"
          width="140%"
          height="140%"
        >
          <feDropShadow
            dx="2"
            dy="5"
            stdDeviation="3"
            floodColor="#000000"
            floodOpacity="0.5"
          />
        </filter>
        <filter id="threadTexture" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
      <motion.path
        d={pathData}
        fill="transparent"
        stroke="#8A0815"
        strokeWidth="4"
        strokeLinecap="round"
        filter="url(#threadShadow)"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={canDraw ? "visible" : "hidden"}
        variants={{
          visible: { pathLength: 1, opacity: 0.8 },
          hidden: { pathLength: 0, opacity: 0 },
        }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      />
      <motion.path
        d={pathData}
        fill="transparent"
        stroke="#DC143C"
        strokeWidth="2.5"
        strokeLinecap="round"
        filter="url(#threadTexture)"
        style={{ originX: "50%", originY: "50%" }}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={canDraw ? "visible" : "hidden"}
        variants={{
          visible: {
            pathLength: 1,
            opacity: 1,
            rotate: [0, 0.5, -0.5, 0],
            transition: {
              pathLength: { duration: 0.5, ease: "easeInOut" },
              rotate: {
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut",
                delay: 0.5,
              },
            },
          },
          hidden: { pathLength: 0, opacity: 0 },
        }}
      />
    </g>
  );
};

function mapConnectionToCardItem(c) {
  let skills = c.skills;
  if (typeof skills === "string") {
    try {
      skills = JSON.parse(skills);
    } catch {
      skills = [];
    }
  }
  if (!Array.isArray(skills)) skills = [];
  const name =
    (c.name && String(c.name).trim()) || c.username || "Unknown";
  return {
    id: c.connection_id,
    connection_id: c.connection_id,
    user_id: c.user_id,
    username: c.username,
    name,
    image: c.photo_url || null,
    role: c.title || c.role || "",
    connectionReason: "Connected",
    skills,
  };
}

const MyConnections = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cardsInCenter, setCardsInCenter] = useState(1);

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`${API}/api/connections`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data.connections)
          ? data.connections
          : [];
        const mapped = list.map(mapConnectionToCardItem);
        const posData = generatePositions(mapped, 0);
        setItems(posData);
      })
      .catch(() => {
        if (!cancelled) setError("Could not load connections.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const handleCardCenterInView = useCallback((index) => {
    setCardsInCenter((prev) => Math.max(prev, index));
  }, []);

  const vh =
    typeof window !== "undefined" ? window.innerHeight : 800;
  const totalHeightPx =
    items.length > 0 ? items[items.length - 1].position.y + 800 : vh;
  const svgHeight = Math.max(totalHeightPx, vh * 2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      ref={scrollContainerRef}
      className="relative h-screen w-full overflow-y-auto overflow-x-hidden pt-10 border-[24px] border-[#3e2723] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{
        backgroundColor: "#111",
        backgroundImage: "radial-gradient(circle, #2a2a2a 0%, #000000 100%)",
        backgroundAttachment: "fixed",
        boxShadow: "inset 0 0 100px rgba(0,0,0,0.9)",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }}
    >
      <div className="relative w-full" style={{ height: totalHeightPx }}>
        <svg
          className="absolute top-0 left-0 w-full pointer-events-none z-20"
          style={{
            height: svgHeight,
            overflow: "visible",
          }}
        >
          {items.map((item, i) => {
            if (i === 0) return null;
            const prev = items[i - 1];
            return (
              <RedThread
                key={`thread-${item.id}-${i}`}
                index={i}
                prevPos={prev.pinPos}
                currPos={item.pinPos}
                cardsInCenter={cardsInCenter}
              />
            );
          })}
        </svg>

        <div className="absolute top-0 left-0 w-full z-10">
          {items.map((item, index) => (
            <PolaroidCard
              key={`card-${item.id}-${index}`}
              index={index}
              item={item}
              scrollRef={scrollContainerRef}
              onCenterInView={handleCardCenterInView}
            />
          ))}
        </div>
      </div>

      {loading && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 p-3 bg-white border-2 border-gray-300 transform -rotate-2 shadow-xl z-50">
          <p
            className="font-bold text-gray-800"
            style={{ fontFamily: "'Caveat', cursive", fontSize: "1.2rem" }}
          >
            Loading connections…
          </p>
        </div>
      )}

      {!loading && error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 max-w-md p-4 bg-red-950/90 text-red-100 border-2 border-red-700 z-50 text-center">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center z-30 pointer-events-none">
          <p
            className="text-stone-400 text-2xl px-6 text-center"
            style={{ fontFamily: "'Caveat', cursive" }}
          >
            No connections yet.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default MyConnections;
