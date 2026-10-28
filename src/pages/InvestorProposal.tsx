import { SlideEngine, useEngine } from '../engine/SlideEngine';
import { Header } from '../components/Header';
import { Hero } from '../sections/Hero';
import { Opportunity } from '../sections/Opportunity';
import { MarketValidation } from '../sections/MarketValidation';
import { BusinessGrowth } from '../sections/BusinessGrowth';
import { FinancialProjections } from '../sections/FinancialProjections';
import { RoadmapInvestment } from '../sections/RoadmapInvestment';
import { FounderContact } from '../sections/FounderContact';
import { useContent } from '../content';

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
          <Opportunity />
          <MarketValidation />
          <BusinessGrowth />
          <FinancialProjections />
          <RoadmapInvestment />
          <FounderContact />
        </div>
      </main>
    </>
  );
}

/** Private Investor Proposal: seven full-screen sections (flow layout on mobile). */
export function InvestorProposal() {
  return (
    <SlideEngine>
      <Deck />
    </SlideEngine>
  );
}
