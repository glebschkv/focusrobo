import { Nav } from './components/Nav';
import { HeroSection } from './components/HeroSection';
import { LoopSection } from './components/LoopSection';
import { PetShowcase } from './components/PetShowcase';
import { IslandGrowth } from './components/IslandGrowth';
import { RewardsSection } from './components/RewardsSection';
import { SocialProof } from './components/SocialProof';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

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

export default function App() {
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
