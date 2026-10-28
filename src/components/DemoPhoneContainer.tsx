import type { ReactNode } from 'react';
import demoPhone from '../assets/phones/demo-phone.webp';

type Props = {
  alt: string;
  /**
   * PROTOTYPE_EMBED — pass the real interactive prototype (e.g. an <iframe>) here later.
   * It is placed exactly over the phone screen; the static screenshot stays as the frame.
   */
  embed?: ReactNode;
  className?: string;
};

/** iPhone frame for slide 04. Static today; the screen area is reserved for the live prototype. */
export function DemoPhoneContainer({ alt, embed, className = '' }: Props) {
  return (
    <div className={`demo-phone ${className}`}>
      <img src={demoPhone} alt={alt} width={312} height={637} loading="lazy" className="demo-phone__frame" />
      <div className="demo-phone__screen" data-slot="PROTOTYPE_EMBED" data-native-scroll={embed ? '' : undefined} data-keys-owned={embed ? '' : undefined}>
        {embed}
      </div>
    </div>
  );
}
