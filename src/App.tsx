import { SlideEngine, useEngine } from './engine/SlideEngine';
import { Header } from './components/Header';
import { Hero } from './sections/Hero';
import { ProblemOpportunity } from './sections/ProblemOpportunity';
import { ProductEcosystem } from './sections/ProductEcosystem';
import { InteractiveDemo } from './sections/InteractiveDemo';
import { CompetitiveAdvantage } from './sections/CompetitiveAdvantage';
import { TargetMarkets } from './sections/TargetMarkets';
import { AudienceResearch } from './sections/AudienceResearch';
import { BusinessModel } from './sections/BusinessModel';
import { GoToMarket } from './sections/GoToMarket';
import { RevenueCalculatorSection } from './sections/RevenueCalculatorSection';
import { RoadmapInvestment } from './sections/RoadmapInvestment';
import { FounderContact } from './sections/FounderContact';
import { LegalPage, legalPageFor } from './sections/LegalPage';
import { useContent } from './content';

function Deck() {
  const { trackRef } = useEngine();
  const c = useContent();
  return (
    <>
      <a className="skip-link" href="#hero">
        {c.meta.skipToContent}
      </a>
      <Header />
      <main className="deck" id="main">
        <div className="deck__track" ref={trackRef}>
          <Hero />
          <ProblemOpportunity />
          <ProductEcosystem />
          <InteractiveDemo />
          <CompetitiveAdvantage />
          <TargetMarkets />
          <AudienceResearch />
          <BusinessModel />
          <GoToMarket />
          <RevenueCalculatorSection />
          <RoadmapInvestment />
          <FounderContact />
        </div>
      </main>
    </>
  );
}

export function App() {
  const legal = legalPageFor(window.location.pathname);
  if (legal) return <LegalPage page={legal} />;
  return (
    <SlideEngine>
      <Deck />
    </SlideEngine>
  );
}
