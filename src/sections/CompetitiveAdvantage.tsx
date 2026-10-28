import { Slide } from '../components/Slide';
import { SlideEyebrow } from '../components/SlideEyebrow';
import { useContent } from '../content';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import './CompetitiveAdvantage.css';

const pad = (n: number) => String(n).padStart(2, '0');

function Content() {
  const c = useContent().advantage;

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.advantage__intro > *'), 0);
    reveal(tl, q('.advantage__lead'), 0.2);
    tl.from(q('.advantage__rule'), { scaleX: 0, duration: 0.8, ease: 'power2.inOut', stagger: 0.1 }, 0.3);
    reveal(tl, q('.advantage__item > :not(.advantage__rule)'), 0.4, { stagger: 0.05 });
    tl.from(q('.positioning__row'), { autoAlpha: 0, x: -16, duration: 0.95, stagger: 0.08 }, 0.8);
    tl.from(q('.positioning__row.is-highlight'), { backgroundColor: 'rgba(255,255,255,0)', duration: 0.8 }, 1.2);
    reveal(tl, q('.advantage__note'), 1.1);
  });

  return (
    <>
      <div className="slide__rule" />
      <div className="advantage__head">
        <header className="intro advantage__intro">
          <SlideEyebrow />
          <h2 className="display">
            {c.title.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h2>
        </header>
        <p className="advantage__lead">{c.lead}</p>
      </div>

      <ol className="advantage__grid">
        {c.items.map((item, i) => (
          <li className="advantage__item" key={item.title}>
            <span className="advantage__rule" aria-hidden="true" />
            <span className="advantage__num">{pad(i + 1)}</span>
            <h3 className="advantage__title">{item.title}</h3>
            <p className="advantage__text">{item.text}</p>
          </li>
        ))}
      </ol>

      <table className="positioning">
        <tbody>
          {c.positioning.map((row) => (
            <tr key={row.name} className={`positioning__row ${'highlight' in row && row.highlight ? 'is-highlight' : ''}`}>
              <th scope="row">{row.name}</th>
              <td>{row.focus}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="advantage__note">{c.note}</p>
    </>
  );
}

export function CompetitiveAdvantage() {
  return (
    <Slide id="advantage">
      <Content />
    </Slide>
  );
}
