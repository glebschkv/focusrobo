interface SectionDividerProps {
  variant: 'grass' | 'clouds' | 'dots';
  peekingPet?: string; // e.g., 'bunny' — shows pet peeking from edge
}

export function SectionDivider({ variant, peekingPet }: SectionDividerProps) {
  return (
    <div className={`section-divider section-divider--${variant}`}>
      {variant === 'grass' && (
        <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="section-divider__svg">
          <path d="M0,40 L0,28 Q30,12 60,24 Q90,36 120,20 Q150,8 180,22 Q210,34 240,18 Q270,4 300,20 Q330,32 360,16 Q390,2 420,18 Q450,30 480,14 Q510,0 540,16 Q570,28 600,12 Q630,0 660,14 Q690,26 720,10 Q750,0 780,16 Q810,28 840,14 Q870,2 900,18 Q930,32 960,16 Q990,4 1020,20 Q1050,32 1080,18 Q1110,6 1140,22 Q1170,34 1200,20 L1200,40 Z" fill="var(--primary)" opacity="0.08" />
          <path d="M0,40 L0,32 Q40,20 80,30 Q120,38 160,26 Q200,16 240,28 Q280,36 320,24 Q360,14 400,26 Q440,36 480,24 Q520,14 560,26 Q600,36 640,24 Q680,14 720,26 Q760,36 800,24 Q840,14 880,26 Q920,36 960,24 Q1000,14 1040,26 Q1080,36 1120,26 Q1160,18 1200,30 L1200,40 Z" fill="var(--primary)" opacity="0.05" />
        </svg>
      )}
      {variant === 'clouds' && (
        <div className="section-divider__clouds">
          <div className="section-divider__cloud" style={{ left: '15%', animationDelay: '0s' }} />
          <div className="section-divider__cloud" style={{ left: '55%', animationDelay: '-4s', opacity: 0.5 }} />
          <div className="section-divider__cloud" style={{ left: '80%', animationDelay: '-8s', opacity: 0.3 }} />
        </div>
      )}
      {variant === 'dots' && (
        <div className="section-divider__dots">
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="section-divider__dot"
              style={{
                animationDelay: `${i * 0.15}s`,
                opacity: 0.15 + (i % 3) * 0.1,
              }}
            />
          ))}
        </div>
      )}
      {peekingPet && (
        <img
          src={`/pets/${peekingPet}-baby.png`}
          alt=""
          className="section-divider__peeking-pet"
          style={{ imageRendering: 'pixelated' }}
        />
      )}
    </div>
  );
}
