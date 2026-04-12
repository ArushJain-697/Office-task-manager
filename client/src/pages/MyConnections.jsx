import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useScroll } from 'framer-motion';
import PolaroidCard from '../components/PolaroidCard';

const MOCK_FALLBACK_USERS = [
  { id: 1, name: "Viper", role: "Infiltration Specialist", connectionReason: "Shared skill: Stealth", image: "https://picsum.photos/seed/viper/240/220", skills: ["Stealth", "Lockpicking"] },
  { id: 2, name: "Ghost", role: "Cyber Warfare", connectionReason: "Shared skill: Hacking", image: "https://picsum.photos/seed/ghost/240/220", skills: ["Hacking", "Cryptography"] },
  { id: 3, name: "Razor", role: "Extraction Driver", connectionReason: "Shared team member", image: "https://picsum.photos/seed/razor/240/220", skills: ["Driving", "Mechanics"] },
  { id: 4, name: "Cipher", role: "Information Broker", connectionReason: "Shared skill: Cryptography", image: "https://picsum.photos/seed/cipher/240/220", skills: ["Cryptography", "Social Engineering"] },
  { id: 5, name: "Spectre", role: "Assassination", connectionReason: "Past Operation", image: "https://picsum.photos/seed/spectre/240/220", skills: ["Stealth", "Weapons"] },
  { id: 6, name: "Neo", role: "Software Engineer", connectionReason: "Shared skill: Hacking", image: "https://picsum.photos/seed/neo/240/220", skills: ["Hacking", "Systems Analysis"] },
];

const generatePositions = (users, startIndex) => {
    const ww = typeof window !== 'undefined' ? window.innerWidth : 1000;
    const cardWidth = 240;
    // Increase spacing to prevent overlap
    const spacingY = 480; 
    const maxBoundary = ww - cardWidth - 40;

    return users.map((user, i) => {
        const id = startIndex + i;
        // Guarantee spread by cycling through 3 random zones (Left, Right, Center)
        let zone = id % 3;
        let targetX;
        
        if (zone === 0) {
            // Left region
            targetX = 40 + Math.random() * (ww / 3);
        } else if (zone === 1) {
            // Right region
            targetX = (ww * 0.6) + Math.random() * ((ww * 0.4) - cardWidth - 40);
        } else {
            // Center region
            targetX = (ww / 2) - (cardWidth / 2) + ((Math.random() - 0.5) * 300);
        }
        
        const x = Math.max(40, Math.min(targetX, maxBoundary));
        
        const y = id * spacingY + 150 + (Math.random() * 200 - 100);
        const rotation = (Math.random() - 0.5) * 16; // -8 to +8 degrees

        return {
            ...user,
            position: { x, y },
            rotation,
            // pin is roughly center top of the card (left + 120, top - 10)
            pinPos: { x: x + 120, y: y - 10 }
        };
    });
};

const RedThread = ({ prevPos, currPos, index, drawSequenceLimit, cardsInCenter, onFullyDrawn }) => {
    const canDraw = index <= cardsInCenter;
    const [hasDrawn, setHasDrawn] = useState(false);

    // Calculate bezier curve path to make it look like a natural string hanging
    const dist = Math.sqrt(Math.pow(currPos.x - prevPos.x, 2) + Math.pow(currPos.y - prevPos.y, 2));
    const sag = dist * 0.15; // The string sags based on distance
    const midX = (prevPos.x + currPos.x) / 2;
    const midY = (prevPos.y + currPos.y) / 2 + sag;

    const pathData = `M ${prevPos.x} ${prevPos.y} Q ${midX} ${midY} ${currPos.x} ${currPos.y}`;

    const onComplete = () => {
        if (!hasDrawn && canDraw) {
            setHasDrawn(true);
            onFullyDrawn(index + 1);
        }
    };

    return (
        <g>
            <defs>
                <filter id="threadShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="2" dy="5" stdDeviation="3" floodColor="#000000" floodOpacity="0.5" />
                </filter>
                <filter id="threadTexture" x="0%" y="0%" width="100%" height="100%">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" xChannelSelector="R" yChannelSelector="G" />
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
                    hidden: { pathLength: 0, opacity: 0 }
                }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
            />
            {/* The actual red thread */}
            <motion.path
                d={pathData}
                fill="transparent"
                stroke="#DC143C"
                strokeWidth="2.5"
                strokeLinecap="round"
                filter="url(#threadTexture)"
                style={{ originX: '50%', originY: '50%' }}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={canDraw ? "visible" : "hidden"}
                variants={{
                    visible: { 
                        pathLength: 1, 
                        opacity: 1,
                        // subtle sway
                        rotate: [0, 0.5, -0.5, 0],
                        transition: {
                            pathLength: { duration: 0.5, ease: "easeInOut" },
                            rotate: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.5 }
                        }
                    },
                    hidden: { pathLength: 0, opacity: 0 }
                }}
            />
        </g>
    );
};

const MyConnections = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [drawSequenceLimit, setDrawSequenceLimit] = useState(1);
    const [cardsInCenter, setCardsInCenter] = useState(1);

    const observerRef = useRef();
    const scrollContainerRef = useRef(null);
    const { scrollY } = useScroll({ container: scrollContainerRef });

    // Fetch initial data
    useEffect(() => {
        fetchData(0);
    }, []);

    const fetchData = async (startIndex) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token') || '';
            const res = await fetch('https://api.sicari.works/api/connectios', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) throw new Error("Fetch failed");
            const data = await res.json();
            // Ensure data is array
            if (Array.isArray(data) && data.length > 0) {
               const posData = generatePositions(data, startIndex);
               setItems(prev => startIndex === 0 ? posData : [...prev, ...posData]);
            } else {
               throw new Error("Invalid format");
            }
        } catch (e) {
            console.log("Mock fallback triggered due to:", e.message);
            // Fallback to mock data if API fails
            setTimeout(() => {
                const posData = generatePositions(MOCK_FALLBACK_USERS, startIndex);
                setItems(prev => startIndex === 0 ? posData : [...prev, ...posData]);
                setLoading(false);
            }, 600);
            return;
        }
        setLoading(false);
    };

    const lastItemRef = useCallback(node => {
        if (loading) return;
        if (observerRef.current) observerRef.current.disconnect();
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                fetchData(items.length);
            }
        });
        if (node) observerRef.current.observe(node);
    }, [loading, items.length]);

    const handleFullyDrawn = useCallback((nextIndex) => {
        setDrawSequenceLimit(prev => Math.max(prev, nextIndex));
    }, []);

    const handleCardCenterInView = useCallback((index) => {
        setCardsInCenter(prev => Math.max(prev, index));
    }, []);

    const totalHeight = items.length > 0 ? items[items.length - 1].position.y + 800 : '100vh';

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            ref={scrollContainerRef}
            className="relative h-screen w-full overflow-y-auto overflow-x-hidden pt-10 border-[24px] border-[#3e2723]"
            style={{
                // Dark and vignette feel
                backgroundColor: '#111',
                backgroundImage: 'radial-gradient(circle, #2a2a2a 0%, #000000 100%)',
                backgroundAttachment: 'fixed',
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.9)'
            }}
        >
            <div className="relative w-full" style={{ height: totalHeight }}>
                {/* SVG Overlay for Connections */}
                <svg className="absolute top-0 left-0 w-full h-[150%] pointer-events-none z-20" style={{ height: Math.max(totalHeight, window.innerHeight * 2), overflow: 'visible' }}>
                    {items.map((item, i) => {
                        if (i === 0) return null;
                        
                        // Strict single string connection: item i connects to item i-1
                        const prev = items[i - 1];
                        
                        return (
                            <RedThread 
                                key={`thread-${item.id}-${i}`} 
                                index={i}
                                prevPos={prev.pinPos} 
                                currPos={item.pinPos} 
                                drawSequenceLimit={drawSequenceLimit}
                                cardsInCenter={cardsInCenter}
                                onFullyDrawn={handleFullyDrawn} 
                            />
                        );
                    })}
                </svg>

                {/* Polaroid Cards Layers */}
                <div className="absolute top-0 left-0 w-full z-10">
                    {items.map((item, index) => {
                        const isLast = items.length === index + 1;
                        return (
                            <PolaroidCard 
                                ref={isLast ? lastItemRef : null} 
                                key={`card-${item.id}-${index}`} 
                                index={index}
                                item={item} 
                                scrollRef={scrollContainerRef}
                                onCenterInView={handleCardCenterInView}
                            />
                        );
                    })}
                </div>
            </div>
            
            {loading && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 p-3 bg-white border-2 border-gray-300 transform -rotate-2 shadow-xl z-50">
                   <p className="font-bold text-gray-800" style={{ fontFamily: '"Caveat", cursive', fontSize: '1.2rem' }}>Loading suspects...</p>
                </div>
            )}
        </motion.div>
    );
};

export default MyConnections;
