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

      {/* Clouds */}
      <div className="sky-cloud sky-cloud--1" />
      <div className="sky-cloud sky-cloud--2" />
      <div className="sky-cloud sky-cloud--3" />
      <div className="sky-cloud sky-cloud--4" />
      <div className="sky-cloud sky-cloud--5" />

      {children}
    </div>
  );
}
