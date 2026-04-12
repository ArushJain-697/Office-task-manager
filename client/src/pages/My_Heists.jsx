import React, { useEffect, useState } from "react";
import HeistCard from "../components/HeistCard";

const MyHeists = () => {
  const [heists, setHeists] = useState([]);

  useEffect(() => {
    const sampleData = [
      {
        application_id: 1,
        status: "accepted",
        created_at: "2026-04-11T10:00:00.000Z",
        heading: "Casino Royale",
        subheading: "High stakes job",
        payout: 50000,
        timeline: "3 din",
        heist_status: "open",
      },
    ];

    fetch("https://api.sicari.works/api/my_applications", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        const backendData = Array.isArray(data)
          ? data
          : data.applications || data.data || [];

        setHeists([...backendData, ...sampleData]);
      })
      .catch(() => setHeists(sampleData));
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#e5e5e5] px-6 py-12">
      
      {/* 🔴 Bigger Title */}
      <h1
        className="text-5xl text-center mb-16 tracking-[0.25em]"
        style={{
          fontFamily: "Georgia, serif",
          color: "#b91c1c",
          textShadow: "0 0 18px rgba(185,28,28,0.6)",
        }}
      >
        MY HEISTS
      </h1>

      {/* 🩸 Grid with proper row spacing */}
      <div className="flex flex-wrap justify-center gap-x-12 gap-y-16">
        {heists.map((heist, index) => (
          <div
            key={index}
            className="w-[300px] aspect-[3/4] flex justify-center"
          >
            <HeistCard heist={heist} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyHeists;