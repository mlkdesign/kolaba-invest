import { useRef } from 'react';
import { Slide } from '../components/Slide';
import { useContent } from '../content';
import { useSection } from '../engine/SectionContext';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import { usePointerParallax } from '../hooks/usePointerParallax';
import phoneCreator from '../assets/phones/product-creator.webp';
import phoneBusiness from '../assets/phones/product-business.webp';
import './ProductEcosystem.css';

function Content() {
  const c = useContent().product;
  const { active } = useSection();
  const scene = useRef<HTMLDivElement>(null);

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.product__intro .eyebrow, .product__intro .display, .product__tagline'), 0);
    tl.from(q('.product__divider'), { scaleY: 0, duration: 0.9, ease: 'power2.inOut' }, 0.2);
    reveal(tl, q('.product__side--creator .product__text > *'), 0.3);
    tl.from(q('.product__side--creator .product__phone'), { autoAlpha: 0, y: 36, scale: 0.985, duration: 0.95 }, 0.4);
    reveal(tl, q('.product__side--business .product__text > *'), 0.55);
    tl.from(q('.product__side--business .product__phone'), { autoAlpha: 0, y: 36, scale: 0.985, duration: 0.95 }, 0.65);
  });

  usePointerParallax(scene, {
    enabled: active,
    x: 8,
    y: 6,
    rotate: 2,
    layers: [
      { selector: '.product__side--creator .product__px', depth: 0.85, lag: 1 },
      { selector: '.product__side--business .product__px', depth: 1.1, lag: 0.85 },
    ],
  });

  return (
    <>
      <div className="slide__rule" />
      <header className="product__intro">
        <div className="intro">
          <p className="eyebrow">{c.eyebrow}</p>
          <h2 className="display">
            {c.title.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h2>
        </div>
        <p className="product__tagline">{c.tagline}</p>
      </header>
      <div className="product__rule" />

      <div className="product__sides" ref={scene}>
        {(['creator', 'business'] as const).map((side) => {
          const s = c[side];
          return (
            <article key={side} className={`product__side product__side--${side}`}>
              <div className="product__text">
                <h3 className="product__title">{s.title}</h3>
                <p className="product__lines">
                  {s.lines.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </p>
                <p className="product__tag">{s.tagline}</p>
                {side === 'creator' && (
                  <p className="product__shared">
                    <i aria-hidden="true" />
                    {c.shared}
                  </p>
                )}
              </div>
              <div className="product__phone">
                <div className="product__px">
                  <img
                    src={side === 'creator' ? phoneCreator : phoneBusiness}
                    alt={s.phoneAlt}
                    width={200}
                    height={369}
                    loading="lazy"
                  />
                </div>
              </div>
            </article>
          );
        })}
        <div className="product__divider" aria-hidden="true" />
      </div>
    </>
  );
}

export function ProductEcosystem() {
  return (
    <Slide id="product">
      <Content />
    </Slide>
  );
}
