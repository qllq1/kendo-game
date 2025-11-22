import React, { useEffect, useState } from 'react';
import { Stance, MoveType, Target } from '../types';

interface KendoSpriteProps {
  color: 'red' | 'white'; // Red usually P1, White CPU
  stance: Stance | null;
  action: string | null; // Move ID or name
  isHit: boolean;
  isWinner: boolean;
}

// A simplified pixel art representation using SVG rectangles
const KendoSprite: React.FC<KendoSpriteProps> = ({ color, stance, action, isHit, isWinner }) => {
  const mainColor = color === 'red' ? '#ef4444' : '#f3f4f6';
  const secondaryColor = '#1f2937'; // Dark Grey (Bogu)
  const skinColor = '#fbbf24';

  // Animation classes
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    if (isHit) {
      setAnimClass('animate-shake opacity-70');
    } else if (isWinner) {
      setAnimClass('animate-bounce');
    } else if (action) {
      setAnimClass('translate-x-10'); // Simple lunge simulation
    } else {
      setAnimClass('animate-pulse-slow'); // Breathing
    }
  }, [action, isHit, isWinner]);

  // Transformations for Stance
  const armsY = stance === Stance.JODAN ? -10 : 0;
  const swordAngle = stance === Stance.JODAN ? -45 : -15;

  const isFacingLeft = color === 'white';
  const transform = isFacingLeft ? 'scaleX(-1)' : '';

  return (
    <div className={`relative w-48 h-64 transition-all duration-300 ${animClass}`} style={{ transform }}>
       <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          
          {/* Legs (Hakama) */}
          <rect x="35" y="60" width="12" height="35" fill="#111827" />
          <rect x="53" y="60" width="12" height="35" fill="#111827" />
          {/* Hakama folds */}
          <rect x="30" y="55" width="40" height="25" fill="#1e1e1e" rx="2" />

          {/* Body (Do) */}
          <rect x="32" y="30" width="36" height="30" fill={secondaryColor} rx="2" stroke="#000" strokeWidth="1"/>
          <rect x="35" y="32" width="30" height="20" fill="#000" opacity="0.3"/>

          {/* Head (Men) */}
          <rect x="35" y="5" width="30" height="28" fill={secondaryColor} rx="4" />
          {/* Men Grille (Mengane) */}
          <line x1="40" y1="15" x2="60" y2="15" stroke="#9ca3af" strokeWidth="2" />
          <line x1="40" y1="20" x2="60" y2="20" stroke="#9ca3af" strokeWidth="2" />
          <rect x="48" y="5" width="4" height="28" fill={mainColor} /> {/* Tasuki/String color indicator */}

          {/* Arms & Kote */}
          <g transform={`translate(0, ${armsY})`}>
             {/* Left Arm */}
             <rect x="55" y="35" width="25" height="8" fill="#1e293b" transform="rotate(20 55 35)" />
             <circle cx="78" cy="43" r="5" fill={secondaryColor} /> {/* Kote */}

             {/* Right Arm */}
             <rect x="20" y="35" width="25" height="8" fill="#1e293b" transform="rotate(-20 45 35)" />
             <circle cx="22" cy="43" r="5" fill={secondaryColor} /> {/* Kote */}
             
             {/* Sword (Shinai) */}
             {/* Pivot point at hands */}
             <g transform={`rotate(${swordAngle} 50 45)`}>
                <rect x="30" y="35" width="80" height="3" fill="#fcd34d" /> {/* Bamboo */}
                <rect x="30" y="35" width="20" height="3" fill="#fff" /> {/* Handle (Tsuka) */}
                <rect x="108" y="34" width="2" height="5" fill="#fff" /> {/* Tip (Sakigawa) */}
                <rect x="75" y="34" width="2" height="5" fill="#fff" /> {/* Tie (Nakayui) */}
             </g>
          </g>
       </svg>
       {/* Visual Ribbon/Tasuki */}
       <div className={`absolute top-10 left-1/2 -translate-x-1/2 w-full text-center pointer-events-none`}>
          {isWinner && <span className="text-yellow-400 font-bold text-xl drop-shadow-md animate-ping">IPPON!</span>}
          {isHit && <span className="text-red-500 font-bold text-lg drop-shadow-md">HIT!</span>}
       </div>
    </div>
  );
};

export default KendoSprite;
