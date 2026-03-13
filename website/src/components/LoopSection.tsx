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
    title: 'Block Distractions',
    description: 'PhoNo blocks distracting apps so you can actually focus. Free, built-in, no setup needed.',
    icon: '🛡️',
    detail: 'Free app blocking',
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
    <section className="section-textured section-standard">
      <div className="max-w-4xl mx-auto">
        <AnimatedSection className="text-center mb-16">
          <AnimatedItem>
            <h2 className="section-heading display-font">
              Simple as putting your phone down
            </h2>
          </AnimatedItem>
        </AnimatedSection>

        <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-6 relative" stagger={0.15}>
          {/* Dotted connector line (desktop only) */}
          <div
            className="hidden md:block absolute top-1/2 left-[15%] right-[15%] h-0"
            style={{ borderTop: '2px dashed rgba(234, 179, 8, 0.2)', zIndex: 0 }}
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
                    <img src={step.petSprite} alt="Pet" className="pixel-art" style={{ width: 36, height: 36 }} />
                  ) : (
                    step.icon
                  )}
                </div>
                <div className="step-label" style={{ marginBottom: 6 }}>
                  STEP {step.number}
                </div>
                <h3 className="card-title display-font" style={{ marginBottom: 8 }}>
                  {step.title}
                </h3>
                <p className="card-desc">{step.description}</p>
                <div className="detail-pill">{step.detail}</div>
              </div>
            </AnimatedItem>
          ))}
        </AnimatedSection>
      </div>
    </section>
  );
}
