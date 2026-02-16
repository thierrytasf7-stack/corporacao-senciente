/**
 * Diana Logo Component
 * @description Componente React para renderizar o logótipo da Diana Corporação Senciente
 * @version 1.0.0
 * @squad Aisth
 */

import React from 'react';

export type LogoVariant = 'icon' | 'horizontal' | 'vertical';
export type LogoTheme = 'light' | 'dark' | 'monochrome' | 'monochrome-white';

export interface DianaLogoProps {
  /** Variante do logo (icon, horizontal, vertical) */
  variant?: LogoVariant;
  /** Tema de cores (light, dark, monochrome, monochrome-white) */
  theme?: LogoTheme;
  /** Largura do logo (altura ajusta automaticamente) */
  width?: number | string;
  /** Altura do logo (largura ajusta automaticamente se width não especificado) */
  height?: number | string;
  /** Classes CSS adicionais */
  className?: string;
  /** Título acessível para screen readers */
  title?: string;
}

/**
 * DianaLogo Component
 *
 * @example
 * ```tsx
 * // Icon padrão (light theme)
 * <DianaLogo variant="icon" width={64} />
 *
 * // Horizontal para header (dark theme)
 * <DianaLogo variant="horizontal" theme="dark" width={600} />
 *
 * // Vertical para splash screen
 * <DianaLogo variant="vertical" height={420} />
 *
 * // Monochrome para impressão
 * <DianaLogo variant="icon" theme="monochrome" width={64} />
 * ```
 */
export const DianaLogo: React.FC<DianaLogoProps> = ({
  variant = 'icon',
  theme = 'light',
  width,
  height,
  className = '',
  title = 'Diana Corporação Senciente'
}) => {
  // Map variant + theme to SVG file path
  const getLogoPath = (): string => {
    const basePath = '/assets/branding/logo';

    if (theme === 'monochrome') {
      return `${basePath}/monochrome/diana-logo-monochrome.svg`;
    }

    if (theme === 'monochrome-white') {
      return `${basePath}/monochrome/diana-logo-monochrome-white.svg`;
    }

    const themeSuffix = theme === 'dark' ? '-dark' : '';

    switch (variant) {
      case 'icon':
        return `${basePath}/icon/diana-icon${themeSuffix}.svg`;
      case 'horizontal':
        return `${basePath}/horizontal/diana-logo-horizontal${themeSuffix}.svg`;
      case 'vertical':
        return `${basePath}/vertical/diana-logo-vertical${themeSuffix}.svg`;
      default:
        return `${basePath}/icon/diana-icon${themeSuffix}.svg`;
    }
  };

  // Default dimensions based on variant
  const getDefaultDimensions = (): { width: number; height: number } => {
    switch (variant) {
      case 'icon':
        return { width: 64, height: 64 };
      case 'horizontal':
        return { width: 600, height: 160 };
      case 'vertical':
        return { width: 320, height: 420 };
      default:
        return { width: 64, height: 64 };
    }
  };

  const defaults = getDefaultDimensions();
  const logoPath = getLogoPath();

  // Calculate dimensions
  const computedWidth = width ?? defaults.width;
  const computedHeight = height ?? defaults.height;

  return (
    <img
      src={logoPath}
      alt={title}
      title={title}
      width={computedWidth}
      height={computedHeight}
      className={`diana-logo diana-logo--${variant} diana-logo--${theme} ${className}`}
      style={{
        maxWidth: '100%',
        height: 'auto'
      }}
    />
  );
};

/**
 * DianaLogoInline Component
 * Renders SVG inline instead of using <img> tag for better control
 */
export const DianaLogoInline: React.FC<DianaLogoProps> = ({
  variant = 'icon',
  theme = 'light',
  width,
  height,
  className = '',
  title = 'Diana Corporação Senciente'
}) => {
  // For inline rendering, we'll provide the icon SVG directly
  // This is the most commonly used variant

  const defaults = { width: 64, height: 64 };
  const computedWidth = width ?? defaults.width;
  const computedHeight = height ?? defaults.height;

  // Colors based on theme
  const colors = {
    light: {
      gradient1: '#C0C0C0',
      gradient2: '#1E90FF',
      nodes: '#C0C0C0',
      lines: '#1E90FF',
      core1: '#FFD700',
      core2: '#1E90FF',
      center: '#1A1A1A'
    },
    dark: {
      gradient1: '#E0E0E0',
      gradient2: '#4DA6FF',
      nodes: '#E0E0E0',
      lines: '#4DA6FF',
      core1: '#FFD700',
      core2: '#4DA6FF',
      center: '#F5F5F5'
    },
    monochrome: {
      gradient1: '#1A1A1A',
      gradient2: '#1A1A1A',
      nodes: '#1A1A1A',
      lines: '#1A1A1A',
      core1: '#1A1A1A',
      core2: '#1A1A1A',
      center: '#F5F5F5'
    },
    'monochrome-white': {
      gradient1: '#F5F5F5',
      gradient2: '#F5F5F5',
      nodes: '#F5F5F5',
      lines: '#F5F5F5',
      core1: '#F5F5F5',
      core2: '#F5F5F5',
      center: '#1A1A1A'
    }
  };

  const c = colors[theme];

  if (variant !== 'icon') {
    // For non-icon variants, fall back to image component
    return <DianaLogo {...{ variant, theme, width, height, className, title }} />;
  }

  return (
    <svg
      width={computedWidth}
      height={computedHeight}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      className={`diana-logo diana-logo--${variant} diana-logo--${theme} ${className}`}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      <defs>
        <linearGradient id={`icon-gradient-${theme}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: c.gradient1, stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: c.gradient2, stopOpacity: 1 }} />
        </linearGradient>

        <radialGradient id={`icon-glow-${theme}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" style={{ stopColor: c.core1, stopOpacity: theme === 'dark' ? 1 : 0.9 }} />
          <stop offset="100%" style={{ stopColor: c.core2, stopOpacity: theme === 'dark' ? 0.4 : 0.3 }} />
        </radialGradient>
      </defs>

      {/* Outer Ring */}
      <circle
        cx="32"
        cy="32"
        r="28"
        fill="none"
        stroke={`url(#icon-gradient-${theme})`}
        strokeWidth="2"
      />

      {/* Neural Nodes */}
      <circle cx="32" cy="8" r="3" fill={c.nodes} />
      <circle cx="56" cy="32" r="3" fill={c.nodes} />
      <circle cx="32" cy="56" r="3" fill={c.nodes} />
      <circle cx="8" cy="32" r="3" fill={c.nodes} />

      {/* Connection Lines */}
      <line x1="32" y1="8" x2="32" y2="32" stroke={c.lines} strokeWidth="1.5" opacity={theme === 'dark' ? 0.8 : 0.6} />
      <line x1="56" y1="32" x2="32" y2="32" stroke={c.lines} strokeWidth="1.5" opacity={theme === 'dark' ? 0.8 : 0.6} />
      <line x1="32" y1="56" x2="32" y2="32" stroke={c.lines} strokeWidth="1.5" opacity={theme === 'dark' ? 0.8 : 0.6} />
      <line x1="8" y1="32" x2="32" y2="32" stroke={c.lines} strokeWidth="1.5" opacity={theme === 'dark' ? 0.8 : 0.6} />

      {/* Central Core */}
      <circle cx="32" cy="32" r="10" fill={`url(#icon-glow-${theme})`} />
      <circle cx="32" cy="32" r="6" fill={c.core1} opacity={theme === 'dark' ? 1 : 0.95} />
      <circle cx="32" cy="32" r="3" fill={c.center} />
    </svg>
  );
};

export default DianaLogo;
