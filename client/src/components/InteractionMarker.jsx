import React from "react";

export default function InteractionMarker({ onClick, className = "", style = {}, baseScale = 1, forceVisible = false, text = "OPEN" }) {
  // If forceVisible is provided, we just use local classes instead of group-hover
  const opacityClass = forceVisible ? "opacity-90" : "opacity-0 group-hover:opacity-90";
  // The user requested growing from small to large
  const scaleClass = forceVisible ? "scale-100" : "scale-50 group-hover:scale-100";
  const pointerClass = forceVisible ? "pointer-events-auto" : "pointer-events-none group-hover:pointer-events-auto";
  
  // Calculate font size to prevent overflow for longer text words, increased to improve visibility
  const adjustedFontSize = text.length > 5 ? 18 * baseScale : 28 * baseScale;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(e);
      }}
      className={`absolute flex justify-center items-center cursor-pointer origin-center z-[100] transition-all duration-[400ms] cubic-bezier(0.25, 0.46, 0.45, 0.94) ease-out ${pointerClass} ${opacityClass} ${scaleClass} ${className}`}
      style={{
        width: `${170 * baseScale}px`,
        height: `${170 * baseScale}px`,
        ...style,
      }}
    >
      <div className="relative flex justify-center items-center w-full h-full">
        {/* Glow & Box (Increased in size by ~20%) */}
        <div 
          className="bg-[#8a0303] shadow-[0_0_20px_5px_rgba(220,38,38,0.7)]" 
          style={{
            width: `${102 * baseScale}px`,
            height: `${102 * baseScale}px`,
            transform: "rotate(45deg)",
          }}
        />
        {/* Border overlay (Bigger than the box like in the image to create a gap) */}
        <div 
          className="absolute bg-transparent border-[5px] border-[#ff4e4e]/90"
          style={{
            width: `${128 * baseScale}px`,
            height: `${128 * baseScale}px`,
            transform: "rotate(45deg)",
          }}
        />

        {/* Dynamic Text */}
        <span 
          className="absolute inset-0 flex justify-center items-center tracking-[0.2em] font-mono font-bold text-[#e8dcc8] pointer-events-none text-center leading-none"
          style={{ fontSize: `${adjustedFontSize}px` }}
        >
          {text.toUpperCase()}
        </span>
      </div>
    </div>
  );
}
