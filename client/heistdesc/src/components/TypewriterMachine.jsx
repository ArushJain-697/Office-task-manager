import { motion } from 'motion/react'

export default function TypewriterMachine({ carriageOffset = 0 }) {
  return (
    <motion.div
      className="typewriter-machine-area"
      initial={{ y: 200, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
    >
      <svg
        viewBox="0 0 600 180"
        width="600"
        style={{ display: 'block', maxWidth: '90vw' }}
        aria-label="Typewriter machine"
      >
        {/* Main body */}
        <rect x="50" y="80" width="500" height="90" rx="8"
          fill="#2a2a2a"
          stroke="#1a1a1a"
          strokeWidth="2"
        />
        {/* Body top curve */}
        <rect x="70" y="70" width="460" height="20" rx="6"
          fill="#333"
        />
        {/* Paper feed slot */}
        <rect x="200" y="64" width="200" height="12" rx="3"
          fill="#0c0b09"
          stroke="#444"
          strokeWidth="1"
        />
        {/* Paper coming out of slot */}
        <rect x="220" y="10" width="160" height="58"
          fill="#e8dcc8"
          opacity="0.3"
          rx="1"
        />
        
        {/* Carriage rail */}
        <g transform={`translate(${(carriageOffset - 50) * 0.5}, 0)`}>
          <rect x="100" y="58" width="400" height="6" rx="3"
            fill="#555"
            stroke="#666"
            strokeWidth="0.5"
          />
          {/* Carriage pointer */}
          <polygon points="300,52 296,58 304,58"
            fill="#c9a84c"
          />
        </g>

        {/* Paper bail wire */}
        <line x1="180" y1="68" x2="420" y2="68"
          stroke="#888"
          strokeWidth="1"
          opacity="0.6"
        />

        {/* Left ribbon spool */}
        <circle cx="120" cy="95" r="16"
          fill="#1a1a1a"
          stroke="#444"
          strokeWidth="1.5"
        />
        <circle cx="120" cy="95" r="6"
          fill="#333"
          stroke="#555"
          strokeWidth="1"
        />

        {/* Right ribbon spool */}
        <circle cx="480" cy="95" r="16"
          fill="#1a1a1a"
          stroke="#444"
          strokeWidth="1.5"
        />
        <circle cx="480" cy="95" r="6"
          fill="#333"
          stroke="#555"
          strokeWidth="1"
        />

        {/* Ribbon between spools */}
        <line x1="136" y1="95" x2="464" y2="95"
          stroke="#1a1a1a"
          strokeWidth="4"
          opacity="0.4"
        />

        {/* Key row 1 (top) */}
        {[...Array(10)].map((_, i) => (
          <g key={`k1-${i}`}>
            <rect
              x={140 + i * 35}
              y="115"
              width="26"
              height="18"
              rx="4"
              fill="#3a3a3a"
              stroke="#4a4a4a"
              strokeWidth="0.5"
            />
            <rect
              x={143 + i * 35}
              y="117"
              width="20"
              height="12"
              rx="3"
              fill="#454545"
            />
          </g>
        ))}

        {/* Key row 2 (middle) */}
        {[...Array(9)].map((_, i) => (
          <g key={`k2-${i}`}>
            <rect
              x={155 + i * 35}
              y="138"
              width="26"
              height="18"
              rx="4"
              fill="#3a3a3a"
              stroke="#4a4a4a"
              strokeWidth="0.5"
            />
            <rect
              x={158 + i * 35}
              y="140"
              width="20"
              height="12"
              rx="3"
              fill="#454545"
            />
          </g>
        ))}

        {/* Key row 3 (bottom) */}
        {[...Array(7)].map((_, i) => (
          <g key={`k3-${i}`}>
            <rect
              x={175 + i * 35}
              y="160"
              width="26"
              height="14"
              rx="4"
              fill="#3a3a3a"
              stroke="#4a4a4a"
              strokeWidth="0.5"
            />
          </g>
        ))}

        {/* Spacebar */}
        <rect x="210" y="160" width="180" height="14" rx="4"
          fill="#3a3a3a"
          stroke="#4a4a4a"
          strokeWidth="0.5"
        />

        {/* Machine feet */}
        <rect x="90" y="170" width="40" height="8" rx="2" fill="#222" />
        <rect x="470" y="170" width="40" height="8" rx="2" fill="#222" />

        {/* Subtle shine line */}
        <line x1="100" y1="82" x2="500" y2="82"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="1"
        />
      </svg>
    </motion.div>
  )
}
