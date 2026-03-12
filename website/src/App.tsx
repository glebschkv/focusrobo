import { useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Nav } from './components/Nav';
import { HeroSection } from './components/HeroSection';
import { SocialProofBar } from './components/SocialProof';
import { LoopSection } from './components/LoopSection';
import { PetShowcase } from './components/PetShowcase';
import { IslandGrowth } from './components/IslandGrowth';
import { RewardsSection } from './components/RewardsSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { StickyMobileCTA } from './components/StickyMobileCTA';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { Support } from './components/Support';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const footerCtaRef = useRef<HTMLElement>(null);

  return (
    <div>
      <Nav />
      <HeroSection ref={heroRef} />
      <div className="section-transition-sky-to-cream" />
      <SocialProofBar />
      <LoopSection />
      <div className="divider-warm" />
      <PetShowcase />
      <IslandGrowth />
      <div className="divider-warm" />
      <RewardsSection />
      <FinalCTA ref={footerCtaRef} />
      <Footer />
      <StickyMobileCTA heroRef={heroRef} footerCtaRef={footerCtaRef}>
        <a href="#waitlist" className="warm-form-button" style={{ padding: '10px 24px', fontSize: 14, textDecoration: 'none', display: 'block', textAlign: 'center' }}>
          Join the Waitlist
        </a>
      </StickyMobileCTA>
    </div>
  );
}

function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-cream)',
        padding: 20,
        textAlign: 'center',
      }}
    >
      <img
        src="/pets/frog-baby.png"
        alt="Lost frog"
        className="pixel-art"
        style={{ width: 80, height: 80, marginBottom: 16, animation: 'pet-bounce 3.5s ease-in-out infinite' }}
      />
      <h1 className="display-font" style={{ fontSize: 48, fontWeight: 700, marginBottom: 8, color: 'var(--fg-deep)' }}>
        404
      </h1>
      <p style={{ fontSize: 16, color: 'var(--fg-muted)', marginBottom: 24 }}>
        This page wandered off the island.
      </p>
      <Link
        to="/"
        className="warm-form-button"
        style={{ display: 'inline-block', padding: '12px 28px', fontSize: 15, textDecoration: 'none' }}
      >
        Return Home
      </Link>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
