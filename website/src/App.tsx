import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { Nav } from './components/Nav';
import { HeroSection } from './components/HeroSection';
import { StatsBar } from './components/StatsBar';
import { WhySection } from './components/WhySection';
import { LoopSection } from './components/LoopSection';
import { InteractiveDemo } from './components/InteractiveDemo';
import { PetShowcase } from './components/PetShowcase';
import { RewardsSection } from './components/RewardsSection';
import { FAQSection } from './components/FAQSection';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { StickyMobileCTA } from './components/StickyMobileCTA';
import { SectionDivider } from './components/SectionDivider';
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
  return (
    <div style={{ overflowX: 'hidden' }}>
      <Nav />
      <HeroSection />
      <StatsBar />
      <SectionDivider variant="grass" />
      <WhySection />
      <LoopSection />
      <SectionDivider variant="clouds" peekingPet="bunny" />
      <InteractiveDemo />
      <PetShowcase />
      <SectionDivider variant="dots" />
      <RewardsSection />
      <FAQSection />
      <FinalCTA />
      <Footer />
      <StickyMobileCTA />
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
        className="cta-primary"
        style={{ display: 'inline-flex', padding: '12px 28px', fontSize: 15, textDecoration: 'none' }}
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
