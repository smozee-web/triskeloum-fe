import { useEffect, useState } from 'react';
import './FlameCustomCursor.css';

const FlameCustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', updatePosition);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', updatePosition);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="flame-cursor-container"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <svg
        className="flame-cursor-svg"
        xmlns="http://www.w3.org/2000/svg"
        width="18"
        height="24"
        viewBox="0 0 18 24"
      >
        <defs>
          <radialGradient id="flameGlow" cx="50%" cy="60%" r="50%">
            <stop offset="0%" style={{ stopColor: '#FFFACD', stopOpacity: 0.8 }} />
            <stop offset="40%" style={{ stopColor: 'var(--color-primary-light)', stopOpacity: 0.6 }} />
            <stop offset="70%" style={{ stopColor: '#FF8C00', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#FF4500', stopOpacity: 0 }} />
          </radialGradient>
          <linearGradient id="flameBody" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FFFACD', stopOpacity: 1 }} />
            <stop offset="20%" style={{ stopColor: 'var(--color-primary-light)', stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: '#FFA500', stopOpacity: 0.95 }} />
            <stop offset="80%" style={{ stopColor: '#FF6347', stopOpacity: 0.85 }} />
            <stop offset="100%" style={{ stopColor: 'var(--color-primary)', stopOpacity: 0.6 }} />
          </linearGradient>
          <linearGradient id="innerFlame" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#FFFFFF', stopOpacity: 0.9 }} />
            <stop offset="40%" style={{ stopColor: '#FFFACD', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: 'var(--color-primary-light)', stopOpacity: 0.7 }} />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer glow halo */}
        <ellipse
          className="flame-glow"
          cx="9"
          cy="14"
          rx="7"
          ry="9"
          fill="url(#flameGlow)"
          opacity="0.5"
        />

        {/* Main flame body - morphing shape */}
        <path
          className="flame-body flame-morph-1"
          d="M 9 1 C 8.2 2, 7 3.5, 6.5 5 C 6 6.5, 5.5 8.5, 5.2 10.5 C 5 12.5, 5 14.5, 5.5 16 C 6 17.5, 7 19, 8 20 C 8.5 20.5, 9 21, 9 21 C 9 21, 9.5 20.5, 10 20 C 11 19, 12 17.5, 12.5 16 C 13 14.5, 13 12.5, 12.8 10.5 C 12.5 8.5, 12 6.5, 11.5 5 C 11 3.5, 9.8 2, 9 1 Z"
          fill="url(#flameBody)"
          filter="url(#glow)"
        />

        {/* Alternate flame shape for morphing */}
        <path
          className="flame-body flame-morph-2"
          d="M 9 1.5 C 8.5 2.5, 7.5 4, 7 5.5 C 6.5 7, 6 9, 5.8 11 C 5.6 13, 5.8 15, 6.5 16.5 C 7 18, 8 19.5, 8.5 20.5 C 9 21, 9 21, 9 21 C 9 21, 9 21, 9.5 20.5 C 10 19.5, 11 18, 11.5 16.5 C 12.2 15, 12.4 13, 12.2 11 C 12 9, 11.5 7, 11 5.5 C 10.5 4, 9.5 2.5, 9 1.5 Z"
          fill="url(#flameBody)"
          filter="url(#glow)"
          opacity="0"
        />

        {/* Left flame lick - smaller */}
        <path
          className="flame-lick-left"
          d="M 7 5 Q 5.5 7, 5.2 9 Q 5.5 10.5, 6.5 11 Q 7 9, 7 7 Z"
          fill="#FFA500"
          opacity="0.6"
        />

        {/* Right flame lick - smaller */}
        <path
          className="flame-lick-right"
          d="M 11 5 Q 12.5 7, 12.8 9 Q 12.5 10.5, 11.5 11 Q 11 9, 11 7 Z"
          fill="#FFA500"
          opacity="0.6"
        />

        {/* Inner bright core */}
        <path
          className="flame-core"
          d="M 9 5 C 8.5 6.5, 7.8 8.5, 7.5 10.5 C 7.3 12, 7.5 13.5, 8 15 C 8.5 16, 9 16.5, 9 16.5 C 9 16.5, 9.5 16, 10 15 C 10.5 13.5, 10.7 12, 10.5 10.5 C 10.2 8.5, 9.5 6.5, 9 5 Z"
          fill="url(#innerFlame)"
          opacity="0.85"
        />

        {/* White-hot center core - smaller */}
        <ellipse
          className="flame-hotspot"
          cx="9"
          cy="11"
          rx="1"
          ry="2"
          fill="#FFFFFF"
          opacity="0.8"
        />
      </svg>
    </div>
  );
};

export default FlameCustomCursor;
