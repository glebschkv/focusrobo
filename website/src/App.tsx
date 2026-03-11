import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Nav } from './components/Nav';
import { HeroSection } from './components/HeroSection';
import { LoopSection } from './components/LoopSection';
import { PetShowcase } from './components/PetShowcase';
import { IslandGrowth } from './components/IslandGrowth';
import { RewardsSection } from './components/RewardsSection';
import { SocialProof } from './components/SocialProof';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
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

function GrassDivider() {
  return (
    <svg viewBox="0 0 1200 60" className="divider-grass" preserveAspectRatio="none">
      <path
        d="M0,60 C300,0 900,0 1200,60 L1200,60 L0,60 Z"
        fill="var(--bg-cream)"
      />
    </svg>
  );
}

function DiamondDivider() {
  return (
    <div className="divider-line">
      <div className="divider-diamond" />
    </div>
  );
}

function HomePage() {
  return (
    <div>
      <Nav />
      <HeroSection />
      <GrassDivider />
      <LoopSection />
      <DiamondDivider />
      <PetShowcase />
      <IslandGrowth />
      <DiamondDivider />
      <RewardsSection />
      <SocialProof />
      <FinalCTA />
      <Footer />
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
        style={{ width: 80, height: 80, marginBottom: 16, animation: 'pet-bob 3s ease-in-out infinite' }}
      />
      <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 8, color: 'var(--fg-deep)' }}>
        404
      </h1>
      <p style={{ fontSize: 16, color: 'var(--fg-muted)', marginBottom: 24 }}>
        This page wandered off the island.
      </p>
      <Link
        to="/"
        className="nav-cta"
        style={{ display: 'inline-block', padding: '12px 28px', fontSize: 15 }}
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
