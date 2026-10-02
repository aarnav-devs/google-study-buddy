import React from 'react';

interface MascotProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  mood?: 'happy' | 'thinking' | 'celebrating' | 'speaking';
  className?: string;
}

export const Mascot: React.FC<MascotProps> = ({ size = 'md', mood = 'happy', className = '' }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-28 h-28',
  };

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${sizeMap[size]} ${className}`}>
      {/* Friendly Google-styled Mascot SVG */}
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-sm transition-transform duration-300 hover:scale-105"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft background glow */}
        <circle cx="50" cy="50" r="46" fill="#F0F4F9" stroke="#E2E8F0" strokeWidth="2" />

        {/* Outer playful ring with Google colors */}
        <circle cx="50" cy="50" r="42" stroke="url(#googleRingGrad)" strokeWidth="3" strokeDasharray="6 4" />

        {/* Head / Body Pill */}
        <rect
          x="22"
          y="26"
          width="56"
          height="52"
          rx="24"
          fill="url(#buddyBodyGrad)"
          className="transition-all duration-300"
        />

        {/* Cheerful Headphone or Spark / Cap */}
        {mood === 'celebrating' ? (
          <path
            d="M 50 12 L 54 22 L 64 24 L 56 31 L 58 41 L 50 35 L 42 41 L 44 31 L 36 24 L 46 22 Z"
            fill="#FBBC04"
            stroke="#EA8600"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        ) : (
          <g>
            <path
              d="M 28 32 C 28 16, 72 16, 72 32"
              stroke="#4285F4"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            <rect x="23" y="32" width="8" height="14" rx="4" fill="#34A853" />
            <rect x="69" y="32" width="8" height="14" rx="4" fill="#EA4335" />
          </g>
        )}

        {/* Cheeks */}
        <circle cx="34" cy="56" r="4" fill="#FFA5A5" opacity="0.6" />
        <circle cx="66" cy="56" r="4" fill="#FFA5A5" opacity="0.6" />

        {/* Eyes based on mood */}
        {mood === 'thinking' ? (
          <g>
            <circle cx="38" cy="46" r="4" fill="#1E293B" />
            <circle cx="40" cy="44" r="1.5" fill="#FFFFFF" />
            <path d="M 58 48 Q 63 43 68 48" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        ) : mood === 'celebrating' ? (
          <g>
            <path d="M 34 46 Q 38 40 42 46" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 58 46 Q 62 40 66 46" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <g>
            <circle cx="38" cy="46" r="4.5" fill="#1E293B" />
            <circle cx="39.5" cy="44.5" r="1.5" fill="#FFFFFF" />
            <circle cx="62" cy="46" r="4.5" fill="#1E293B" />
            <circle cx="63.5" cy="44.5" r="1.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Mouth */}
        {mood === 'speaking' ? (
          <ellipse cx="50" cy="58" rx="5" ry="4" fill="#EA4335" />
        ) : mood === 'thinking' ? (
          <path d="M 46 58 Q 50 56 54 58" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
        ) : mood === 'celebrating' ? (
          <path d="M 43 55 Q 50 64 57 55 Z" fill="#EA4335" />
        ) : (
          <path d="M 44 55 Q 50 62 56 55" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Little antenna sparkle */}
        <circle cx="50" cy="18" r="3" fill="#FBBC04" />

        {/* Gradients */}
        <defs>
          <linearGradient id="buddyBodyGrad" x1="22" y1="26" x2="78" y2="78" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#EEF4FF" />
          </linearGradient>
          <linearGradient id="googleRingGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop stopColor="#4285F4" />
            <stop offset="0.33" stopColor="#34A853" />
            <stop offset="0.66" stopColor="#FBBC05" />
            <stop offset="1" stopColor="#EA4335" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
