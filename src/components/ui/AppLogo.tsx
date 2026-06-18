'use client';

import React, { memo, useMemo } from 'react';
import AppIcon from './AppIcon';
import AppImage from './AppImage';
import { CARSCHEK_LOGO_ALT, CARSCHEK_LOGO_PATH } from '@/lib/branding';

interface AppLogoProps {
  src?: string;
  iconName?: string;
  /** Display height in px; width scales with logo aspect ratio (~1.05:1). */
  size?: number;
  className?: string;
  onClick?: () => void;
}

const AppLogo = memo(function AppLogo({
  src = CARSCHEK_LOGO_PATH,
  iconName = 'SparklesIcon',
  size = 64,
  className = '',
  onClick,
}: AppLogoProps) {
  const containerClassName = useMemo(() => {
    const classes = ['inline-flex items-center'];
    if (onClick) classes.push('cursor-pointer hover:opacity-80 transition-opacity');
    if (className) classes.push(className);
    return classes.join(' ');
  }, [onClick, className]);

  const width = Math.round(size * 1.05);

  return (
    <div className={containerClassName} onClick={onClick} role={onClick ? 'button' : undefined}>
      {src ? (
        <AppImage
          src={src}
          alt={CARSCHEK_LOGO_ALT}
          width={width}
          height={size}
          className="flex-shrink-0 object-contain"
          style={{ height: size, width: 'auto', maxWidth: width }}
          priority
          unoptimized
        />
      ) : (
        <AppIcon name={iconName} size={size} className="flex-shrink-0" />
      )}
    </div>
  );
});

export default AppLogo;
