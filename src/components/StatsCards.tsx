import React from 'react';
import { Layers, CalendarCheck, Shield, MapPin, Building2, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { OccurrenceDataset } from '../types/occurrence';

interface StatsCardsProps {
  dataset: OccurrenceDataset;
  filteredCount: number;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ dataset, filteredCount }) => {
  // Calcula estatísticas
  const statusCounts: Record<string, number> = {};
  const municipalitySet = new Set<string>();
  const unitSet = new Set<string>();

  dataset.rows.forEach((row) => {
    // Procura chave de status
    const statusKey = Object.keys(row).find((k) => {
      const header = dataset.headers.find((h) => h.key === k);
      return header && header.label.toUpperCase().includes('STATUS');
    });

    if (statusKey && row[statusKey]) {
      const st = row[statusKey].trim();
      statusCounts[st] = (statusCounts[st] || 0) + 1;
    }

    // Procura chave de município
    const munKey = Object.keys(row).find((k) => {
      const header = dataset.headers.find((h) => h.key === k);
      return header && (header.label.toUpperCase().includes('MUNICÍPIO') || header.label.toUpperCase().includes('MUNICIPIO'));
    });
    if (munKey && row[munKey]) {
      municipalitySet.add(row[munKey].trim());
    }

    // Procura chave de unidade
    const unitKey = Object.keys(row).find((k) => {
      const header = dataset.headers.find((h) => h.key === k);
      return header && header.label.toUpperCase().includes('UNIDADE');
    });
    if (unitKey && row[unitKey]) {
      unitSet.add(row[unitKey].trim());
    }
  });

  const formattedExtractionTime = dataset.extractedAt.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const formattedExtractionDate = dataset.extractedAt.toLocaleDateString('pt-BR');

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
      {/* Total Registros */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Total Ocorrências
          </span>
          <Layers className="w-4 h-4 text-slate-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
            {dataset.totalRows}
          </span>
          {filteredCount !== dataset.totalRows && (
            <span className="text-[11px] text-slate-500">
              ({filteredCount} visíveis)
            </span>
          )}
        </div>
        <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
          {dataset.sourceName || 'Página HTML'}
        </span>
      </div>

      {/* Data e Hora */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Processamento
          </span>
          <CalendarCheck className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-base font-bold font-mono tabular-nums text-slate-900 leading-tight">
          {formattedExtractionDate}
        </div>
        <span className="text-[11px] font-mono text-slate-500 block mt-0.5">
          às {formattedExtractionTime}
        </span>
      </div>

      {/* Status Concluídos */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Concluídas
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
        <div className="text-2xl font-bold font-mono tabular-nums text-emerald-700">
          {Object.entries(statusCounts).find(([k]) => k.toLowerCase().includes('conclu'))?.[1] || 0}
        </div>
        <span className="text-[11px] text-slate-500 block mt-0.5">
          Atendimentos finalizados
        </span>
      </div>

      {/* Em Andamento / Pendente */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Em Andamento / Pendentes
          </span>
          <Clock className="w-4 h-4 text-amber-600" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono tabular-nums text-amber-700">
            {(Object.entries(statusCounts).find(([k]) => k.toLowerCase().includes('andamento'))?.[1] || 0) +
             (Object.entries(statusCounts).find(([k]) => k.toLowerCase().includes('pendente'))?.[1] || 0)}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 block mt-0.5">
          Requerem acompanhamento
        </span>
      </div>

      {/* Abrangência Geográfica e Unidades */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-slate-500 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            Abrangência
          </span>
          <MapPin className="w-4 h-4 text-slate-400" />
        </div>
        <div className="text-sm font-semibold text-slate-900 mt-1">
          {municipalitySet.size > 0 ? `${municipalitySet.size} Município(s)` : 'Geral'}
        </div>
        <span className="text-[11px] text-slate-500 block mt-0.5 truncate">
          {unitSet.size > 0 ? `${unitSet.size} Unidade(s) alocadas` : 'Sem divisão de unidade'}
        </span>
      </div>
    </div>
  );
};
