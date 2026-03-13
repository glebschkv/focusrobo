import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const STATS = [
  { target: 41, label: 'Pet Species', suffix: '' },
  { target: 6, label: 'Island Themes', suffix: '' },
  { target: 5, label: 'Rarity Tiers', suffix: '' },
  { target: 180, label: 'Min Sessions', suffix: '+' },
];

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const duration = 1200;
    const steps = 30;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(interval);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(interval);
  }, [started, target]);

  return (
    <div ref={ref} className="stats-bar__number">
      {count}{suffix}
    </div>
  );
}

export function StatsBar() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="stats-bar"
    >
      {STATS.map((stat) => (
        <div key={stat.label} className="stats-bar__item">
          <AnimatedNumber target={stat.target} suffix={stat.suffix} />
          <div className="stats-bar__label">{stat.label}</div>
        </div>
      ))}
    </motion.div>
  );
}
