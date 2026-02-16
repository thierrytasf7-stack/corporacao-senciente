/**
 * Identity Status Component - Diana Corporação Senciente
 *
 * Exibe status da identidade corporativa e consistência de persona.
 * Métrica: Identity Consistency Score (target: 98%+)
 */

import React, { useEffect, useState } from 'react';

interface IdentityMetrics {
  isValid: boolean;
  consistencyScore: number;
  lastCheck: string;
  identityMarkers: string[];
  redFlags: string[];
}

export function IdentityStatus() {
  const [metrics, setMetrics] = useState<IdentityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchIdentityStatus = async () => {
      try {
        const response = await fetch('/api/v1/identity/status');
        if (!response.ok) throw new Error('Failed to fetch identity status');
        const data = await response.json();
        setMetrics(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchIdentityStatus();
    const interval = setInterval(fetchIdentityStatus, 30000); // Atualizar a cada 30s

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-4 bg-slate-900 rounded-lg">
        <div className="animate-pulse text-slate-400">Carregando Identity Status...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900 rounded-lg">
        <div className="text-red-200">❌ Erro: {error}</div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="p-4 bg-slate-900 rounded-lg">
        <div className="text-slate-400">Sem dados de identidade disponíveis</div>
      </div>
    );
  }

  const statusColor = metrics.isValid ? 'bg-emerald-900' : 'bg-red-900';
  const statusIcon = metrics.isValid ? '✅' : '❌';
  const scoreColor =
    metrics.consistencyScore >= 98
      ? 'text-emerald-400'
      : metrics.consistencyScore >= 90
        ? 'text-amber-400'
        : 'text-red-400';

  return (
    <div className={`p-4 rounded-lg ${statusColor}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{statusIcon}</span>
          <span className="font-bold text-white">Diana Identity Status</span>
        </div>
        <span className="text-xs text-slate-400">Última atualização: {metrics.lastCheck}</span>
      </div>

      {/* Consistency Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-slate-200">Consistência de Identidade</span>
          <span className={`font-bold text-lg ${scoreColor}`}>{metrics.consistencyScore}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              metrics.consistencyScore >= 98
                ? 'bg-emerald-500'
                : metrics.consistencyScore >= 90
                  ? 'bg-amber-500'
                  : 'bg-red-500'
            }`}
            style={{ width: `${metrics.consistencyScore}%` }}
          />
        </div>
      </div>

      {/* Identity Markers */}
      {metrics.identityMarkers.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-semibold text-emerald-300 mb-2">✨ Marcadores de Identidade</div>
          <div className="flex flex-wrap gap-2">
            {metrics.identityMarkers.map((marker, idx) => (
              <span key={idx} className="text-xs bg-emerald-900 text-emerald-200 px-2 py-1 rounded">
                {marker}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Red Flags */}
      {metrics.redFlags.length > 0 && (
        <div>
          <div className="text-sm font-semibold text-red-300 mb-2">🚨 Alertas Detectados</div>
          <div className="flex flex-wrap gap-2">
            {metrics.redFlags.map((flag, idx) => (
              <span key={idx} className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded">
                {flag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Target Info */}
      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="text-xs text-slate-400">
          <div>🎯 Target: 98%+ | 🏛️ Sóbrio | ⚡ Arete | 🎯 Proativo</div>
          <div className="mt-2">
            Identidade: <span className="font-mono text-slate-300">Diana Corporação Senciente v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IdentityStatus;
