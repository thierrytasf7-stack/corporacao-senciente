/**
 * Diana Corporação Senciente - Tailwind Config Shared
 * @description Configuração compartilhada de cores da paleta Diana para Tailwind CSS
 * @version 1.0.0
 * @reference assets/branding/palette.css
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        diana: {
          // Cores Primárias
          primary: {
            DEFAULT: '#C0C0C0',
            light: '#E0E0E0',
            dark: '#A0A0A0',
          },
          secondary: {
            DEFAULT: '#1E90FF',
            light: '#4DA6FF',
            dark: '#1873CC',
          },
          accent: {
            DEFAULT: '#FFD700',
            light: '#FFED4E',
            dark: '#CCAC00',
          },

          // Neutras
          neutral: {
            dark: '#1A1A1A',
            light: '#F5F5F5',
          },

          // Escala de Cinzas
          gray: {
            900: '#1A1A1A',
            800: '#2D2D2D',
            700: '#404040',
            600: '#666666',
            500: '#808080',
            400: '#A0A0A0',
            300: '#C0C0C0',
            200: '#E0E0E0',
            100: '#F5F5F5',
          },

          // Semânticas
          success: {
            DEFAULT: '#10B981',
            light: '#34D399',
            dark: '#059669',
          },
          warning: {
            DEFAULT: '#F59E0B',
            light: '#FBBF24',
            dark: '#D97706',
          },
          error: {
            DEFAULT: '#EF4444',
            light: '#F87171',
            dark: '#DC2626',
          },
          info: {
            DEFAULT: '#3B82F6',
            light: '#60A5FA',
            dark: '#2563EB',
          },
        },
      },

      // Gradientes (via backgroundImage)
      backgroundImage: {
        'gradient-diana-primary': 'linear-gradient(135deg, #C0C0C0 0%, #1E90FF 100%)',
        'gradient-diana-accent': 'linear-gradient(135deg, #1E90FF 0%, #FFD700 100%)',
        'gradient-diana-neutral': 'linear-gradient(180deg, #1A1A1A 0%, #404040 100%)',
      },

      // Text Colors com safe combinations
      textColor: {
        'diana-on-dark': '#F5F5F5',
        'diana-on-light': '#1A1A1A',
        'diana-accent-on-dark': '#FFD700',
        'diana-primary-on-dark': '#C0C0C0',
        'diana-secondary-on-light': '#1873CC', // Dark variant for light backgrounds
      },

      // Background Colors com safe combinations
      backgroundColor: {
        'diana-dark': '#1A1A1A',
        'diana-light': '#F5F5F5',
        'diana-card-dark': '#2D2D2D',
        'diana-card-light': '#FFFFFF',
      },
    },
  },
  plugins: [],
};
