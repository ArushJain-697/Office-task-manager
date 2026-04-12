import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const PolaroidCard = forwardRef(({ item, index, scrollRef, onCenterInView }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8, y: 50, rotate: item.rotation }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: item.rotation }}
      transition={{ duration: 0.4, delay: (index % 5) * 0.1, type: 'spring', stiffness: 100 }}
      whileHover={{ scale: 1.05, zIndex: 50 }}
      onViewportEnter={() => onCenterInView && onCenterInView(index)}
      viewport={{ root: scrollRef, margin: "-20% 0px -20% 0px", once: true }}
      className="absolute bg-[#FAFAF8] p-3 shadow-[0_5px_15px_rgba(0,0,0,0.4)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.6)] cursor-pointer group flex flex-col z-10 border border-gray-200 transition-shadow duration-300"
      style={{
        left: item.position.x,
        top: item.position.y,
        width: '240px',
      }}
    >
      {/* Pushpin Graphic */}
      <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 z-20 drop-shadow-md">
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
          {/* needle */}
          <path d="M50 45 L50 85" stroke="#silver" strokeWidth="8" strokeLinecap="round" />
          {/* pin head */}
          <circle cx="50" cy="30" r="20" fill="#111" />
          <circle cx="50" cy="30" r="16" fill="#333" />
          {/* pin highlight */}
          <circle cx="45" cy="22" r="5" fill="white" opacity="0.4" />
        </svg>
      </div>

      {/* Photo Area */}
      <div className="relative w-full h-[220px] bg-gray-200 overflow-hidden shadow-inner">
         <img src={item.image} alt={item.name} className="w-full h-full object-cover sepia-[30%] contrast-[1.1] group-hover:sepia-0 transition-all duration-500" />
      </div>
      
      {/* Name Area */}
      <div className="mt-3 text-center h-[50px] flex items-center justify-center">
        <h3 className="text-2xl text-[#2C2C2C]" style={{ fontFamily: '"Permanent Marker", cursive', transform: 'rotate(-2deg)' }}>{item.name}</h3>
      </div>

      {/* Tooltip */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 bg-[#1a1a1a]/95 text-white p-4 rounded-md shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none w-56 z-50 border border-gray-700">
        <p className="text-sm font-bold text-gray-200 uppercase tracking-widest border-b border-gray-700 pb-2 mb-2">{item.role}</p>
        <p className="text-xs text-red-400 mb-3 italic font-serif">Connection: {item.connectionReason}</p>
        <div className="flex flex-wrap gap-1.5">
           {item.skills?.map(skill => (
              <span key={skill} className="text-[10px] uppercase font-mono bg-gray-800 text-gray-300 px-2 py-1 rounded-sm border border-gray-600">{skill}</span>
           ))}
        </div>
      </div>
    </motion.div>
  );
});

export default PolaroidCard;
