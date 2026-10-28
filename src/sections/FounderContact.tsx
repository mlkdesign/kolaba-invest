import { Slide } from '../components/Slide';
import { Glow } from '../components/Glow';
import { ContactForm } from '../components/ContactForm';
import { ExternalLink } from '../components/Button';
import { useContent } from '../content';
import { FOUNDER_LINKS, LEGAL_ROUTES } from '../data/contacts';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import founderPhoto from '../assets/images/founder.webp';
import globeIcon from '../assets/icons/globe.svg';
import instagramIcon from '../assets/icons/instagram.svg';
import './FounderContact.css';

function Content() {
  const c = useContent();
  const f = c.founder;

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.founder__intro > *'), 0);
    tl.from(q('.founder__photo'), { autoAlpha: 0, y: 30, scale: 0.985, duration: 0.9 }, 0.2);
    reveal(tl, q('.founder__bio > *'), 0.35, { stagger: 0.07 });
    reveal(tl, q('.contact__title, .contact__lead, .contact-form > *'), 0.25, { stagger: 0.06 });
    reveal(tl, q('.site-footer > *, .site-footer__links > *'), 0.8, { stagger: 0.05, y: 14 });
  });

  return (
    <>
      <div className="founder">
        <div className="founder__left">
          <header className="intro founder__intro">
            <p className="eyebrow">{f.eyebrow}</p>
            <h2 className="display">
              {f.title.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h2>
          </header>
          <div className="founder__profile">
            <div className="founder__photo" data-slot="FOUNDER_PHOTO">
              <img src={founderPhoto} alt={f.photoAlt} width={239} height={306} loading="lazy" />
            </div>
            <div className="founder__bio">
              <h3 className="founder__name">{f.name}</h3>
              <p className="founder__role">{f.role}</p>
              {f.bio.map((p) => (
                <p className="founder__p" key={p.slice(0, 16)}>
                  {p}
                </p>
              ))}
              <p className="founder__tags">{f.tags}</p>
            </div>
          </div>
        </div>

        <section className="contact" aria-labelledby="contact-title">
          <h2 className="contact__title" id="contact-title">
            {c.contact.title}
          </h2>
          <p className="contact__lead">{c.contact.lead}</p>
          <ContactForm />
        </section>
      </div>

      <footer className="site-footer">
        <nav className="site-footer__links" aria-label="Founder links">
          <ExternalLink href={FOUNDER_LINKS.portfolio} className="pill-link">
            <img src={globeIcon} alt="" width={24} height={24} />
            <span>{f.links.website}</span>
            <span className="sr-only"> {f.newTab}</span>
          </ExternalLink>
          <ExternalLink href={FOUNDER_LINKS.instagram} className="pill-link">
            <img src={instagramIcon} alt="" width={24} height={24} />
            <span>{f.links.instagram}</span>
            <span className="sr-only"> {f.newTab}</span>
          </ExternalLink>
          {(['behance', 'freelancehunt', 'linkedin', 'telegram'] as const).map((k) => (
            <ExternalLink key={k} href={FOUNDER_LINKS[k]} className="text-link">
              {f.links[k]}
              {'  '}
              <span aria-hidden="true">↗</span>
              <span className="sr-only"> {f.newTab}</span>
            </ExternalLink>
          ))}
        </nav>
        <p className="site-footer__legal">
          <a href={LEGAL_ROUTES.privacy}>{f.legal.privacy}</a>
          <span aria-hidden="true"> · </span>
          <a href={LEGAL_ROUTES.confidentiality}>{f.legal.confidentiality}</a>
          <span aria-hidden="true"> · </span>
          <span>© {new Date().getFullYear()} KOLABA</span>
        </p>
      </footer>
    </>
  );
}

export function FounderContact() {
  return (
    <Slide id="founder" showProgress={false} background={<Glow position="bottom" sink={122} />}>
      <Content />
    </Slide>
  );
}
