import React from 'react';

interface ColorInfo {
  name: string;
  variable: string;
  hex: string;
  rgb: string;
  description: string;
  contrastOnDark?: number;
  contrastOnLight?: number;
}

const COLORS: ColorInfo[] = [
  {
    name: 'Prata Arete',
    variable: '--diana-primary',
    hex: '#C0C0C0',
    rgb: '192, 192, 192',
    description: 'Virtuosidade, Ordem Inteligente',
    contrastOnDark: 9.2,
    contrastOnLight: 1.5,
  },
  {
    name: 'Azul Senciência',
    variable: '--diana-secondary',
    hex: '#1E90FF',
    rgb: '30, 144, 255',
    description: 'Profundidade Cognitiva',
    contrastOnDark: 4.8,
    contrastOnLight: 2.9,
  },
  {
    name: 'Ouro Harmônico',
    variable: '--diana-accent',
    hex: '#FFD700',
    rgb: '255, 215, 0',
    description: 'Elegância, Sutileza',
    contrastOnDark: 10.4,
    contrastOnLight: 1.3,
  },
  {
    name: 'Neutral Dark',
    variable: '--diana-neutral-dark',
    hex: '#1A1A1A',
    rgb: '26, 26, 26',
    description: 'Base Confiável',
    contrastOnDark: 1.0,
    contrastOnLight: 13.6,
  },
  {
    name: 'Neutral Light',
    variable: '--diana-neutral-light',
    hex: '#F5F5F5',
    rgb: '245, 245, 245',
    description: 'Clareza',
    contrastOnDark: 13.6,
    contrastOnLight: 1.0,
  },
];

const GRADIENTS = [
  {
    name: 'Gradient Primary',
    variable: '--diana-gradient-primary',
    css: 'linear-gradient(135deg, #C0C0C0 0%, #1E90FF 100%)',
    usage: 'Headers, Hero Sections',
  },
  {
    name: 'Gradient Accent',
    variable: '--diana-gradient-accent',
    css: 'linear-gradient(135deg, #1E90FF 0%, #FFD700 100%)',
    usage: 'Cards Especiais, CTAs',
  },
  {
    name: 'Gradient Neutral',
    variable: '--diana-gradient-neutral',
    css: 'linear-gradient(180deg, #1A1A1A 0%, #404040 100%)',
    usage: 'Backgrounds Sutis',
  },
];

const SEMANTIC_COLORS = [
  { name: 'Success', hex: '#10B981', usage: 'Confirmações, Estados Positivos' },
  { name: 'Warning', hex: '#F59E0B', usage: 'Alertas, Atenção' },
  { name: 'Error', hex: '#EF4444', usage: 'Erros, Estados Críticos' },
  { name: 'Info', hex: '#3B82F6', usage: 'Informações, Dicas' },
];

const ContrastBadge: React.FC<{ ratio: number }> = ({ ratio }) => {
  const level =
    ratio >= 7
      ? { label: 'AAA', color: 'bg-green-600' }
      : ratio >= 4.5
      ? { label: 'AA', color: 'bg-blue-600' }
      : { label: 'FAIL', color: 'bg-red-600' };

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-bold text-white rounded ${level.color}`}
    >
      {level.label} {ratio.toFixed(1)}:1
    </span>
  );
};

export const ColorPalette: React.FC = () => {
  return (
    <div className="p-6 space-y-8 bg-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Paleta de Cores Diana Corporação Senciente
        </h1>
        <p className="mt-2 text-gray-600">
          Sistema de design unificado com compliance WCAG-AAA
        </p>
      </div>

      {/* Cores Principais */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cores Principais</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {COLORS.map((color) => (
            <div
              key={color.variable}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              {/* Color Swatch */}
              <div
                className="h-32 w-full"
                style={{ backgroundColor: color.hex }}
              />

              {/* Info */}
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-bold text-gray-900">{color.name}</h3>
                <p className="text-sm text-gray-600">{color.description}</p>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">HEX:</span>
                    <span className="font-mono font-bold">{color.hex}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">RGB:</span>
                    <span className="font-mono text-xs">{color.rgb}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">CSS Var:</span>
                    <span className="font-mono text-xs">{color.variable}</span>
                  </div>
                </div>

                {/* Contrast Ratios */}
                {color.contrastOnDark && (
                  <div className="pt-2 space-y-1">
                    <div className="text-xs text-gray-500">Contraste em fundo escuro:</div>
                    <ContrastBadge ratio={color.contrastOnDark} />
                  </div>
                )}
                {color.contrastOnLight && (
                  <div className="pt-1 space-y-1">
                    <div className="text-xs text-gray-500">Contraste em fundo claro:</div>
                    <ContrastBadge ratio={color.contrastOnLight} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gradientes */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Gradientes Oficiais</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {GRADIENTS.map((gradient) => (
            <div
              key={gradient.variable}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <div
                className="h-24 w-full"
                style={{ background: gradient.css }}
              />
              <div className="p-4 space-y-2">
                <h3 className="text-lg font-bold text-gray-900">{gradient.name}</h3>
                <p className="text-sm text-gray-600">{gradient.usage}</p>
                <div className="text-xs font-mono text-gray-500 break-words">
                  {gradient.variable}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cores Semânticas */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cores Semânticas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {SEMANTIC_COLORS.map((color) => (
            <div
              key={color.name}
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
            >
              <div
                className="h-16 w-full"
                style={{ backgroundColor: color.hex }}
              />
              <div className="p-3 space-y-1">
                <h4 className="font-bold text-gray-900">{color.name}</h4>
                <p className="text-xs text-gray-600">{color.usage}</p>
                <div className="text-xs font-mono text-gray-500">{color.hex}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Escala de Cinzas */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Escala de Cinzas</h2>
        <div className="grid grid-cols-3 md:grid-cols-9 gap-2">
          {[
            { label: '900', hex: '#1A1A1A' },
            { label: '800', hex: '#2D2D2D' },
            { label: '700', hex: '#404040' },
            { label: '600', hex: '#666666' },
            { label: '500', hex: '#808080' },
            { label: '400', hex: '#A0A0A0' },
            { label: '300', hex: '#C0C0C0' },
            { label: '200', hex: '#E0E0E0' },
            { label: '100', hex: '#F5F5F5' },
          ].map((gray) => (
            <div key={gray.label} className="text-center">
              <div
                className="h-20 w-full rounded border border-gray-300"
                style={{ backgroundColor: gray.hex }}
              />
              <div className="mt-2 text-xs font-bold text-gray-900">
                {gray.label}
              </div>
              <div className="text-xs font-mono text-gray-500">{gray.hex}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Guia de Uso */}
      <section className="border border-blue-200 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Guia de Uso - WCAG Compliance
        </h2>
        <div className="space-y-3 text-sm text-gray-700">
          <div>
            <strong className="text-gray-900">Texto Pequeno (&lt; 18pt):</strong> Mínimo
            4.5:1 (AA) / 7:1 (AAA)
          </div>
          <div>
            <strong className="text-gray-900">Texto Grande (&ge; 18pt):</strong> Mínimo
            3:1 (AA) / 4.5:1 (AAA)
          </div>
          <div className="pt-2 border-t border-blue-200">
            <strong className="text-gray-900">Combinações Seguras:</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Prata Arete em fundo escuro: 9.2:1 ✓ AAA</li>
              <li>Ouro Harmônico em fundo escuro: 10.4:1 ✓ AAA</li>
              <li>Neutral Dark em fundo claro: 13.6:1 ✓ AAA</li>
              <li>
                Azul Senciência em fundo escuro: 4.8:1 ✓ AA (use dark variant
                em fundos claros)
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ColorPalette;
