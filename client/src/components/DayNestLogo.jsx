import React from 'react';
import logoTransparent from '../assets/daynest-logo-transparent.png';
import iconOnly from '../assets/daynest-icon.png';

/**
 * Reusable DayNest Logo Component
 * @param {Object} props
 * @param {'small'|'medium'|'large'} [props.size='medium'] - Pre-configured size
 * @param {'full'|'icon'} [props.variant='full'] - Full logo (with text/tagline) or icon-only
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {Object} [props.style={}] - Additional inline styles
 * @param {string} [props.alt='DayNest'] - Alt text for accessibility
 */
export default function DayNestLogo({
  size = 'medium',
  variant = 'full',
  className = '',
  style = {},
  alt = 'DayNest',
  ...rest
}) {
  const imgSrc = variant === 'icon' ? iconOnly : logoTransparent;

  return (
    <div className={`daynest-logo-container daynest-logo-${size} daynest-logo-${variant} ${className}`.trim()} style={style} {...rest}>
      <img
        src={imgSrc}
        alt={alt}
        className="daynest-logo-img"
        loading="eager"
      />
    </div>
  );
}
