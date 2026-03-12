import { useEffect, useRef, useState } from 'react';
import { useInView, useSpring, useTransform } from 'framer-motion';

interface CountUpProps {
  target: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({
  target,
  duration = 1.8,
  prefix = '',
  suffix = '',
  className = '',
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [display, setDisplay] = useState('0');

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const rounded = useTransform(spring, (v) =>
    Math.round(v).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      spring.set(target);
    }
  }, [isInView, target, spring]);

  useEffect(() => {
    const unsubscribe = rounded.on('change', (v) => {
      setDisplay(v);
    });
    return unsubscribe;
  }, [rounded]);

  return (
    <span ref={ref} className={className}>
      {prefix}{display}{suffix}
    </span>
  );
}
