import { Slide } from '../components/Slide';
import { Glow } from '../components/Glow';
import { DemoPhoneContainer } from '../components/DemoPhoneContainer';
import { DemoExplanationSlider } from '../components/DemoExplanationSlider';
import { useContent } from '../content';
import { reveal, useSectionTimeline } from '../hooks/useSectionTimeline';
import './InteractiveDemo.css';

function Content() {
  const c = useContent().demo;

  useSectionTimeline((tl, q) => {
    reveal(tl, q('.demo__intro > *'), 0);
    tl.from(q('.demo-phone'), { autoAlpha: 0, y: 40, scale: 0.985, duration: 1 }, 0.2);
    reveal(tl, q('.demo-slider__body > *, .demo-slider__progress, .demo-slider__controls'), 0.45, { stagger: 0.08 });
    reveal(tl, q('.demo__description, .demo__disclaimer'), 0.7);
  });

  return (
    <>
      <div className="slide__rule" />
      <div className="demo">
        <div className="demo__left">
          <header className="intro demo__intro">
            <p className="eyebrow">{c.eyebrow}</p>
            <h2 className="display">
              {c.title.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h2>
          </header>
          <p className="demo__description">{c.description}</p>
        </div>
        <div className="demo__phone">
          <DemoPhoneContainer alt={c.phoneAlt} />
        </div>
        <div className="demo__right">
          <DemoExplanationSlider steps={c.steps} labels={{ prev: c.prev, next: c.next, group: c.stepsLabel }} />
          <p className="demo__disclaimer">{c.disclaimer}</p>
        </div>
      </div>
    </>
  );
}

export function InteractiveDemo() {
  return (
    <Slide id="demo" background={<Glow position="bottom" />}>
      <Content />
    </Slide>
  );
}
