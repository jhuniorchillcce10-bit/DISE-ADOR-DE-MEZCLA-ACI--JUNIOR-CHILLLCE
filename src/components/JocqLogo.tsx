import React from "react";

interface JocqLogoProps {
  className?: string;
  showText?: boolean;
  showCel?: boolean;
  theme?: "light" | "dark";
}

export const JocqLogo: React.FC<JocqLogoProps> = ({
  className = "h-8 w-8",
  showText = true,
  showCel = true,
  theme = "dark",
}) => {
  const primaryBlue = "#0056b3";
  const lightBlue = "#00c0ff";
  const steelGray = "#2a2d34";
  const lightSilver = "#e2e8f0";
  const darkSilver = "#64748b";

  return (
    <svg
      id="jocq-brand-logo"
      viewBox="0 0 500 500"
      className={`${className} transition-all duration-300`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="blue3D" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="grey3D" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4b5563" />
          <stop offset="100%" stopColor="#1f2937" />
        </linearGradient>
        <linearGradient id="metalSilver" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0284c7" stopOpacity="0.03" />
        </linearGradient>
        
        {/* Shadow Drop */}
        <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.25" />
        </filter>
        <filter id="letterShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* 1. BACKGROUND CIRCLE FOR INNER GRAPHIC */}
      <circle cx="250" cy="220" r="185" fill="url(#gridGrad)" stroke="#1e293b" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="250" cy="220" r="182" fill="none" stroke="#2563eb" strokeWidth="1" strokeOpacity="0.1" />

      {/* 2. BLUEPRINT GRID & LABELS (LEFT SIDE) */}
      <g stroke="#38bdf8" strokeWidth="0.8" strokeDasharray="4 4" strokeOpacity="0.5">
        {/* Vertical alignment line 1 */}
        <line x1="140" y1="80" x2="140" y2="340" />
        {/* Vertical alignment line 2 */}
        <line x1="180" y1="80" x2="180" y2="340" />
        {/* Vertical alignment line 3 */}
        <line x1="225" y1="80" x2="225" y2="340" />

        {/* Horizontal alignment line A */}
        <line x1="80" y1="140" x2="420" y2="140" />
        {/* Horizontal alignment line B */}
        <line x1="80" y1="190" x2="420" y2="190" />
        {/* Horizontal alignment line C */}
        <line x1="80" y1="245" x2="420" y2="245" />
      </g>

      {/* Blueprint Node Bubbles (1, 2, 3) */}
      <g fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="bold" fill="#38bdf8" textAnchor="middle">
        <circle cx="140" cy="73" r="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
        <text x="140" y="76">1</text>

        <circle cx="180" cy="73" r="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
        <text x="180" y="76">2</text>

        <circle cx="225" cy="73" r="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
        <text x="225" y="76">3</text>
      </g>

      {/* Blueprint Node Bubbles (A, B, C) */}
      <g fontFamily="system-ui, sans-serif" fontSize="10" fontWeight="bold" fill="#38bdf8" textAnchor="middle">
        <circle cx="73" cy="140" r="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
        <text x="73" y="143">C</text>

        <circle cx="73" cy="190" r="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
        <text x="73" y="193">B</text>

        <circle cx="73" cy="245" r="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
        <text x="73" y="248">A</text>
      </g>

      {/* 3. ISOMETRIC 3D CONCRETE COLUMNS AND BEAMS (RIGHT SIDE) */}
      <g filter="url(#logoShadow)">
        {/* We build three columns in perspective with slabs connecting them */}
        {/* Back column left */}
        <path d="M250 160 L260 155 L260 300 L250 305 Z" fill="#475569" />
        <path d="M260 155 L270 160 L270 295 L260 300 Z" fill="#334155" />

        {/* Central beams (Level 1, 2, 3 Slabs) */}
        {/* Ground Slab */}
        <path d="M170 310 L330 280 L420 315 L260 330 Z" fill="#1e293b" stroke="#334155" strokeWidth="1" />

        {/* First Floor/Ceiling Beams */}
        <path d="M260 250 L340 235 L340 245 L260 260 Z" fill="#94a3b8" />
        <path d="M340 235 L400 250 L400 260 L340 245 Z" fill="#64748b" />
        {/* Concrete Beams Connecting column 2 & 3 */}
        <path d="M195 260 L260 250 L260 258 L195 268 Z" fill="#cbd5e1" />

        {/* Second Floor Beams */}
        <path d="M260 200 L340 185 L340 195 L260 210 Z" fill="#cbd5e1" />
        <path d="M340 185 L400 200 L400 210 L340 195 Z" fill="#94a3b8" />
        <path d="M195 210 L260 200 L260 208 L195 218 Z" fill="#cbd5e1" />

        {/* Column 1 (Front Left) */}
        <path d="M190 180 L205 177 L205 295 L190 298 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="0.5" />
        <path d="M205 177 L215 180 L215 292 L205 295 Z" fill="#64748b" stroke="#475569" strokeWidth="0.5" />

        {/* Column 2 (Center Front) */}
        <path d="M250 145 L265 140 L265 305 L250 310 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
        <path d="M265 140 L275 145 L275 300 L265 305 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="0.5" />

        {/* Column 3 (Right) */}
        <path d="M335 125 L350 120 L350 285 L335 290 Z" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="0.5" />
        <path d="M350 120 L360 125 L360 280 L350 285 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />

        {/* Column 4 (Far Right) */}
        <path d="M395 160 L405 156 L405 285 L395 289 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.5" />
        <path d="M405 156 L412 160 L412 281 L405 285 Z" fill="#94a3b8" stroke="#64748b" strokeWidth="0.5" />

        {/* Column Rebar (Steel rods extended upwards from top column cuts) */}
        <g stroke="#1e293b" strokeWidth="1.5">
          {/* Col 1 Rebars */}
          <line x1="194" y1="180" x2="194" y2="160" />
          <line x1="200" y1="178" x2="200" y2="158" />
          <line x1="210" y1="179" x2="210" y2="159" />

          {/* Col 2 Rebars */}
          <line x1="254" y1="145" x2="254" y2="120" />
          <line x1="260" y1="142" x2="260" y2="117" />
          <line x1="270" y1="144" x2="270" y2="119" />

          {/* Col 3 Rebars */}
          <line x1="339" y1="125" x2="339" y2="92" />
          <line x1="345" y1="122" x2="345" y2="89" />
          <line x1="355" y1="124" x2="355" y2="91" />

          {/* Col 4 Rebars */}
          <line x1="399" y1="160" x2="399" y2="135" />
          <line x1="403" y1="158" x2="403" y2="133" />
          <line x1="410" y1="159" x2="410" y2="134" />
        </g>
      </g>

      {/* Circular borders for high dynamic contrast */}
      <circle cx="250" cy="220" r="185" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeDasharray="300 200 100 250" />

      {/* 4. TYPOGRAPHY "JUNIOR CC" - PREMIUM 3D VECTOR TYPE */}
      {showText && (
        <g id="text-juniorcc" filter="url(#letterShadow)">
          <text
            x="250"
            y="388"
            fontFamily="'Montserrat', 'Arial Black', 'Impact', system-ui, -apple-system, sans-serif"
            fontSize="58"
            fontWeight="950"
            fontStyle="italic"
            textAnchor="middle"
            letterSpacing="-0.5"
            stroke="#000000"
            strokeWidth="1.5"
            paintOrder="stroke"
          >
            <tspan fill="url(#blue3D)">JUNIOR</tspan>
            <tspan fill="url(#grey3D)"> CC</tspan>
          </text>
        </g>
      )}

      {/* 5. SPLIT BLUE/NAVY RIBBON ACCENT UNDER JOCQ TITLE */}
      {showText && (
        <path
          d="M 60,425 L 250,450 L 440,425 L 390,415 L 250,432 L 110,415 Z"
          fill="url(#blue3D)"
          stroke="#1e3a8a"
          strokeWidth="1"
          opacity="0.9"
          filter="url(#logoShadow)"
        />
      )}

      {/* 6. CONTACT FOOTER "Cel. 910923800" */}
      {showCel && (
        <g id="contact-details">
          {/* Phone Circle Icon */}
          <circle cx="160" cy="475" r="11" fill="#1e293b" stroke="#2563eb" strokeWidth="1.5" />
          {/* Mini Phone representation */}
          <path
            d="M 157,471 C 156.5,471 156,471.5 156.2,472.3 C 156.5,473.8 157.5,476 159,477.5 C 160.5,479 162.7,480 164.2,480.3 C 165,480.5 165.5,480 165.5,479.5 L 164.5,477 L 163.2,477.2 C 162.7,477.3 162.2,477 161.8,476.5 C 161.2,475.9 160.6,475 160,474 C 159.5,473.2 159.7,472.7 160,472.4 L 160.2,472.2 L 157,471 Z"
            fill="#2563eb"
          />

          {/* Contact text line formatted */}
          <text
            x="290"
            y="480"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="26"
            fontWeight="900"
            fill={theme === "light" ? "#0f172a" : "#ffffff"}
            letterSpacing="1.2"
            textAnchor="middle"
          >
            Cel. 910923800
          </text>
          
          {/* Aesthetic fine lines wrapping phone details */}
          <line x1="60" y1="475" x2="135" y2="475" stroke="#1e293b" strokeWidth="1" />
          <line x1="410" y1="475" x2="445" y2="475" stroke="#1e293b" strokeWidth="1" />
        </g>
      )}
    </svg>
  );
};
