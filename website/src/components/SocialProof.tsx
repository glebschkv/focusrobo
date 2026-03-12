import { useEffect, useState } from 'react';
import { AnimatedSection, AnimatedItem } from './AnimatedSection';
import { CountUp } from './CountUp';

export function SocialProofBar() {
  const [waitlistCount, setWaitlistCount] = useState(0);

  useEffect(() => {
    const cached = localStorage.getItem('phono_waitlist_count');
    if (cached) setWaitlistCount(parseInt(cached, 10));
  }, []);

  // Only show real waitlist count if we have data; otherwise omit that stat
  const stats = [
    ...(waitlistCount > 0 ? [{ emoji: '🥚', value: waitlistCount, label: 'eggs reserved' }] : []),
    { emoji: '🐾', value: 41, label: 'species to discover' },
    { emoji: '🏝️', value: 6, label: 'island themes' },
    { emoji: '⏱️', value: 5, label: 'rarity tiers' },
  ];

  return (
    <section className="section-textured py-8">
      <AnimatedSection className="max-w-3xl mx-auto px-5">
        <AnimatedItem>
          <div className="glass-warm-solid py-4 px-6">
            <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-2 text-center">
                  <span style={{ fontSize: 20 }}>{stat.emoji}</span>
                  <span style={{ fontSize: 15, color: 'var(--fg-body)' }}>
                    <strong style={{ fontWeight: 700, color: 'var(--fg-deep)', fontVariantNumeric: 'tabular-nums' }}>
                      <CountUp target={stat.value} duration={1.5} />
                    </strong>
                    {' '}{stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimatedItem>
      </AnimatedSection>
    </section>
  );
}
