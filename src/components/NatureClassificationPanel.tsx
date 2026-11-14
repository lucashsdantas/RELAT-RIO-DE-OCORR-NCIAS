import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ListChecks,
  RotateCcw,
  Search,
} from 'lucide-react';
import { ColumnDefinition, OccurrenceRow } from '../types/occurrence';
import {
  NATURE_CATALOG,
  NATURE_GROUPS,
  NatureCatalogEntry,
  OccurrenceClassification,
  OccurrenceSummaryReport,
  normalizeNatureText,
} from '../utils/natureCatalog';
import { findColumnKeyByKeyword } from '../utils/natureSummary';

interface NatureClassificationPanelProps {
  allRows: OccurrenceRow[];
  headers: ColumnDefinition[];
  classifications: OccurrenceClassification[];
  summary: OccurrenceSummaryReport;
  overrides: Record<number, string>;
  onSelectPredominantNature: (rowIndex: number, catalogEntryId: string) => void;
  onResetOverride: (rowIndex: number) => void;
  onResetAllOverrides: () => void;
}

export const NatureClassificationPanel: React.FC<NatureClassificationPanelProps> = ({
  allRows,
  headers,
  classifications,
  summary,
  overrides,
  onSelectPredominantNature,
  onResetOverride,
  onResetAllOverrides,
}) => {
  const [showAllRows, setShowAllRows] = useState<boolean>(false);
  const [catalogSearch, setCatalogSearch] = useState<string>('');
  const [activeCatalogRow, setActiveCatalogRow] = useState<number | null>(null);

  const numberColKey = useMemo(
    () => findColumnKeyByKeyword(headers, ['NÚMERO', 'NUMERO', 'NUM']),
    [headers]
  );

  const attentionRows = useMemo(
    () =>
      classifications.filter(
        (c) => c.hasMultipleCandidates || c.isUnclassified || c.isManuallyOverridden
      ),
    [classifications]
  );

  const displayedRows = showAllRows ? classifications : attentionRows;

  const filteredCatalog = useMemo(() => {
    const q = normalizeNatureText(catalogSearch);
    if (!q) return NATURE_CATALOG.slice(0, 80);
    return NATURE_CATALOG.filter(
      (e) =>
        normalizeNatureText(e.code).includes(q) ||
        normalizeNatureText(e.nature).includes(q) ||
        normalizeNatureText(e.group).includes(q) ||
        normalizeNatureText(e.subGroup).includes(q)
    ).slice(0, 100);
  }, [catalogSearch]);

  const needsActionCount = summary.unclassifiedCount;
  const hasAnyOverride = Object.keys(overrides).length > 0;

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
      {/* Cabeçalho do Painel de Classificação */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
              needsActionCount > 0
                ? 'bg-amber-100 text-amber-800'
                : 'bg-emerald-100 text-emerald-800'
            }`}
          >
            {needsActionCount > 0 ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ListChecks className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                3. Conferência das Naturezas Detectadas &amp; Produtividade
              </h3>
              <span className="text-xs font-mono text-slate-500">
                {summary.totalOccurrences} RAIs · {summary.totalConcurrentNatures} naturezas atendidas
                {summary.productivityTotalCount > 0 ? ` (${summary.productivityTotalCount} de Produtividade incluídas no quadro)` : ''}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {needsActionCount > 0 ? (
                <>
                  Existem <strong className="text-amber-800">{needsActionCount} ocorrência(s)</strong> sem classificação automática no catálogo. Selecione a natureza correspondente abaixo. Todas as naturezas (incluindo Produtividade) são contabilizadas no Quadro Resumo analítico.
                </>
              ) : (
                `Número de atendimentos foi ${summary.totalOccurrences} (RAIs registrados), enquanto houveram ${summary.totalConcurrentNatures} naturezas atendidas. Todas as naturezas identificadas (incluindo Produtividade) são somadas diretamente no Quadro Resumo analítico.`
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {hasAnyOverride && (
            <button
              type="button"
              onClick={onResetAllOverrides}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restaurar Automático</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAllRows(!showAllRows)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            {showAllRows ? (
              <>
                <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                <span>Mostrar Apenas Multi-natureza / Pendências ({attentionRows.length})</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                <span>Revisar Todas as Ocorrências ({classifications.length})</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Lista de Ocorrências para Conferência/Ajuste */}
      {displayedRows.length > 0 ? (
        <div className="divide-y divide-slate-200 border border-slate-200 rounded-xl overflow-hidden">
          {displayedRows.map((item) => {
            const row = allRows[item.rowIndex];
            const occNumber = numberColKey && row ? row[numberColKey] : `#${item.rowIndex + 1}`;
            const isPickingCatalog = activeCatalogRow === item.rowIndex;

            return (
              <div
                key={item.rowIndex}
                className={`p-4 space-y-2.5 ${
                  item.isUnclassified
                    ? 'bg-rose-50/40'
                    : item.hasMultipleCandidates
                    ? 'bg-sky-50/40'
                    : 'bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-mono font-bold text-slate-900">
                        RAI / Ocorrência {occNumber}
                      </span>
                      <span className="text-slate-300">·</span>
                      {item.isUnclassified ? (
                        <span className="font-semibold text-rose-700">
                          Não localizada automaticamente — selecione no catálogo
                        </span>
                      ) : item.hasMultipleCandidates ? (
                        <span className="font-semibold text-sky-800">
                          {item.candidates.length} naturezas identificadas — todas somadas no Quadro Resumo
                        </span>
                      ) : item.isExclusiveProductivity ? (
                        <span className="font-semibold text-sky-800">
                          Produtividade — contabilizada no Quadro Resumo analítico
                        </span>
                      ) : item.isManuallyOverridden ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Classificação ajustada manualmente
                        </span>
                      ) : (
                        <span className="text-slate-600">Classificação automática</span>
                      )}
                      {item.productivityEntries.length > 0 && !item.isExclusiveProductivity && (
                        <>
                          <span className="text-slate-300">·</span>
                          <span className="text-sky-700 font-medium">
                            + {item.productivityEntries.length} natureza(s) de Produtividade no quadro analítico
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-xs font-mono text-slate-700 mt-1 break-words">
                      Texto original: <strong className="text-slate-900">{item.rawText || '—'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.isManuallyOverridden && (
                      <button
                        type="button"
                        onClick={() => onResetOverride(item.rowIndex)}
                        className="text-[11px] text-slate-500 hover:text-slate-900 underline cursor-pointer"
                      >
                        Desfazer ajuste
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCatalogRow(isPickingCatalog ? null : item.rowIndex);
                        setCatalogSearch('');
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {isPickingCatalog ? 'Fechar Catálogo' : 'Buscar no Catálogo'}
                    </button>
                  </div>
                </div>

                {/* Opções rápidas quando há candidatas detectadas */}
                {item.candidates.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {item.candidates.map((cand: NatureCatalogEntry) => {
                      const isSelected = item.selectedEntry?.id === cand.id;
                      return (
                        <button
                          key={cand.id}
                          type="button"
                          onClick={() => onSelectPredominantNature(item.rowIndex, cand.id)}
                          className={`text-left px-3 py-1.5 rounded-lg border text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          <span className="font-mono">{cand.code}</span> — {cand.nature}{' '}
                          <span className={isSelected ? 'text-sky-300' : 'text-slate-500'}>
                            ({cand.group})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Natureza atualmente selecionada se veio de fora das candidatas */}
                {item.selectedEntry &&
                  !item.candidates.some((c) => c.id === item.selectedEntry?.id) && (
                    <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      Selecionada: <strong className="font-mono">{item.selectedEntry.code}</strong> —{' '}
                      <strong>{item.selectedEntry.nature}</strong> ({item.selectedEntry.group} /{' '}
                      {item.selectedEntry.subGroup})
                    </div>
                  )}

                {/* Seletor pesquisável do catálogo completo (452 naturezas) */}
                {(isPickingCatalog || item.isUnclassified) && (
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2 mt-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder={`Pesquisar por código, grupo (${NATURE_GROUPS.slice(0, 3).join(', ')}...) ou descrição...`}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div className="max-h-44 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-md bg-white">
                      {filteredCatalog.length === 0 ? (
                        <div className="p-3 text-xs text-slate-500 text-center">
                          Nenhuma natureza encontrada para "{catalogSearch}".
                        </div>
                      ) : (
                        filteredCatalog.map((entry) => {
                          const isSelected = item.selectedEntry?.id === entry.id;
                          return (
                            <button
                              key={entry.id}
                              type="button"
                              onClick={() => {
                                onSelectPredominantNature(item.rowIndex, entry.id);
                                setActiveCatalogRow(null);
                              }}
                              className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-100 transition-colors cursor-pointer flex items-center justify-between gap-2 ${
                                isSelected ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-800'
                              }`}
                            >
                              <span className="truncate">
                                <strong className="font-mono">{entry.code}</strong> — {entry.nature}
                              </span>
                              <span
                                className={`text-[10px] shrink-0 ${
                                  isSelected ? 'text-sky-300' : 'text-slate-500'
                                }`}
                              >
                                {entry.group} · {entry.subGroup}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs text-slate-700">
          <span>
            Nenhuma pendência detectada. Todas as {summary.totalOccurrences} ocorrências foram associadas automaticamente ao catálogo oficial.
          </span>
          <span className="font-mono font-bold text-emerald-700">
            {summary.totalOccurrences} = {summary.totalOccurrences}
          </span>
        </div>
      )}
    </section>
  );
};
