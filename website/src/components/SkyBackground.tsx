import type { ReactNode } from 'react';

interface SkyBackgroundProps {
  children: ReactNode;
  className?: string;
}

export function SkyBackground({ children, className = '' }: SkyBackgroundProps) {
  return (
    <div className={`sky-bg ${className}`}>
      {/* Sun */}
      <div className="sky-sun" />

      {/* God Rays */}
      <div className="sky-rays">
        <div className="sky-ray sky-ray--1" />
        <div className="sky-ray sky-ray--2" />
        <div className="sky-ray sky-ray--3" />
        <div className="sky-ray sky-ray--4" />
        <div className="sky-ray sky-ray--5" />
      </div>

      {/* Clouds — reduced to 3 */}
      <div className="sky-cloud sky-cloud--1" />
      <div className="sky-cloud sky-cloud--2" />
      <div className="sky-cloud sky-cloud--3" />

      {/* Sparkles */}
      <div className="sky-sparkle" style={{ top: '20%', left: '25%', animationDelay: '0s' }} />
      <div className="sky-sparkle" style={{ top: '35%', left: '65%', animationDelay: '-1.5s' }} />
      <div className="sky-sparkle" style={{ top: '15%', left: '80%', animationDelay: '-3s' }} />
      <div className="sky-sparkle" style={{ top: '45%', left: '15%', animationDelay: '-2s' }} />

      {children}
    </div>
  );
}
