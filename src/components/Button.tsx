import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import arrowWhite from '../assets/icons/arrow-white.svg';
import arrowDark from '../assets/icons/arrow-dark.svg';

type Variant = 'primary' | 'outline';
type Size = 'lg' | 'sm';

type Common = {
  variant?: Variant;
  size?: Size;
  /** Arrow icon color follows the theme of the surface. */
  tone?: 'light' | 'dark';
  icon?: 'arrow' | 'arrow-left' | 'none' | ReactNode;
  children: ReactNode;
};

function Icon({ icon, tone }: { icon: Common['icon']; tone: 'light' | 'dark' }) {
  if (icon === 'none') return null;
  if (icon === 'arrow' || icon === 'arrow-left') {
    return (
      <img
        src={tone === 'dark' ? arrowDark : arrowWhite}
        alt=""
        width={16}
        height={16}
        className={`btn__icon ${icon === 'arrow-left' ? 'btn__icon--flip' : ''}`}
      />
    );
  }
  return <>{icon}</>;
}

export function Button({
  variant = 'primary',
  size = 'lg',
  tone = 'light',
  icon = 'arrow',
  children,
  className = '',
  ...rest
}: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  const left = icon === 'arrow-left';
  return (
    <button type="button" className={`btn btn--${variant} btn--${size} btn--tone-${tone} ${className}`} {...rest}>
      {left && <Icon icon={icon} tone={tone} />}
      <span className="btn__label">{children}</span>
      {!left && <Icon icon={icon} tone={tone} />}
    </button>
  );
}

export function ExternalLink({ children, className = '', ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a target="_blank" rel="noopener noreferrer" className={className} {...rest}>
      {children}
    </a>
  );
}
