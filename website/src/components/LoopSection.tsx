import { AnimatedSection, AnimatedItem } from './AnimatedSection';

const STEPS = [
  {
    number: '01',
    title: 'Set a Timer',
    description: 'Pick your focus length. Even 25 minutes counts.',
    icon: '⏱️',
    detail: '25–180 min sessions',
  },
  {
    number: '02',
    title: 'Actually Focus',
    description: 'Put your phone down. Breathe. Do your thing.',
    icon: '🧘',
    detail: 'Deep focus mode',
  },
  {
    number: '03',
    title: 'Meet Your New Pet',
    description: 'Longer sessions hatch rarer, bigger creatures.',
    petSprite: '/pets/fox-baby.png',
    detail: '41 species, 5 rarities',
  },
];

export function LoopSection() {
  return (
    <section className="section-textured py-20 px-5">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection className="text-center mb-14">
          <AnimatedItem>
            <h2
              className="display-font"
              style={{
                fontSize: 'clamp(26px, 6vw, 40px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                color: 'var(--fg-deep)',
              }}
            >
              Simple as putting your phone down
            </h2>
          </AnimatedItem>
        </AnimatedSection>

        <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-6 relative" stagger={0.15}>
          {/* Dotted connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0"
            style={{
              borderTop: '2px dashed rgba(234, 179, 8, 0.2)',
              zIndex: 0,
            }}
          />

          {STEPS.map((step) => (
            <AnimatedItem key={step.number}>
              <div className="glass-warm text-center relative z-10 p-6">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                  style={{
                    background: 'rgba(234, 179, 8, 0.1)',
                    fontSize: step.petSprite ? 0 : 28,
                  }}
                >
                  {step.petSprite ? (
                    <img
                      src={step.petSprite}
                      alt="Pet"
                      className="pixel-art"
                      style={{ width: 36, height: 36 }}
                    />
                  ) : (
                    step.icon
                  )}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'var(--accent-warm)',
                    marginBottom: 4,
                  }}
                >
                  STEP {step.number}
                </div>
                <h3
                  className="display-font"
                  style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: 'var(--fg-deep)' }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
                  {step.description}
                </p>
                <div
                  className="mt-3 inline-block"
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--accent-warm)',
                    background: 'rgba(234, 179, 8, 0.08)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-pill)',
                  }}
                >
                  {step.detail}
                </div>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
