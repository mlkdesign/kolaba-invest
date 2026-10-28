import { LegalPage, legalPageFor } from './sections/LegalPage';
import { InvestorProposal } from './pages/InvestorProposal';
import { applyPageMeta, pageFor } from './pages/routes';

export function App() {
  const legal = legalPageFor(window.location.pathname);
  if (legal) return <LegalPage page={legal} />;
  // Unknown paths fall back to the Investor Proposal, as the site did before routing existed.
  const page = pageFor(window.location.pathname) ?? 'investors';
  applyPageMeta(page);
  return <InvestorProposal />;
}
