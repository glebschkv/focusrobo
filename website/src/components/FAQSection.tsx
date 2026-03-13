import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FAQS = [
  {
    q: 'When does PhoNo launch?',
    a: 'We\'re aiming for an iOS launch in 2026. Join the waitlist to get notified the moment it\'s live — plus you\'ll get a free Legendary Egg to hatch on day one.',
  },
  {
    q: 'Is PhoNo free?',
    a: 'Yes! The core experience — focus timer, pet collection, and island building — is completely free. There\'s an optional premium tier that adds extras like 2x XP, extra streak freezes, and more sound mixing slots.',
  },
  {
    q: 'What about Android?',
    a: 'iOS is our priority for launch. Android is on the roadmap, but we don\'t have a timeline yet. Sign up for the waitlist and we\'ll let you know when Android is ready.',
  },
  {
    q: 'What\'s a Legendary Egg?',
    a: 'Eggs hatch into pets. A Legendary Egg has a 40% chance of hatching a Legendary-rarity pet — the rarest in the game. Normally they cost 4,500 coins. Waitlist members get one free.',
  },
  {
    q: 'How does the referral system work?',
    a: 'After signing up, you get a unique referral link. Share it with friends — when they join, you both earn rewards. Hit 3 referrals for a Rare Egg, 10 for a Founder Fox pet, and 25 for an exclusive Pioneer Island.',
  },
  {
    q: 'Do I need to keep my screen on during focus sessions?',
    a: 'Nope. Start a session, lock your phone, and go do your thing. PhoNo tracks time in the background. Your pet is waiting when you come back.',
  },
];

function FAQItem({ faq, isOpen, onToggle }: { faq: typeof FAQS[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className={`faq-item ${isOpen ? 'faq-item--open' : ''}`}>
      <button className="faq-item__question" onClick={onToggle} aria-expanded={isOpen}>
        <span>{faq.q}</span>
        <svg
          className="faq-item__chevron"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M6 8l4 4 4-4" />
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="faq-item__answer">{faq.a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="section-cream py-24 px-5">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="section-label">QUESTIONS</div>
          <h2 className="section-title">Frequently Asked</h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {FAQS.map((faq, i) => (
            <FAQItem
              key={i}
              faq={faq}
              isOpen={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
