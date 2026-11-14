import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  RotateCcw,
} from 'lucide-react';
import { OccurrenceDataset, OccurrenceRow, ReportConfig } from '../types/occurrence';
import { isDateTimeColumn, splitDateAndTime } from '../utils/pdfGenerator';
import { findColumnKeyByKeyword } from '../utils/natureSummary';

interface DataTableProps {
  dataset: OccurrenceDataset;
  filteredRows: OccurrenceRow[];
  config: ReportConfig;
  onChangeConfig: (newConfig: Partial<ReportConfig>) => void;
  onClearFilters: () => void;
  onOpenPdfPreview: () => void;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  dataset,
  filteredRows,
  config,
  onChangeConfig,
  onClearFilters,
  onOpenPdfPreview,
  onDownloadPdf,
  isGeneratingPdf,
}) => {
  const [sortColumnKey, setSortColumnKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 15;

  const visibleColumns = useMemo(
    () => dataset.headers.filter((h) => h.visible),
    [dataset.headers]
  );

  const statusColKey = useMemo(
    () => findColumnKeyByKeyword(dataset.headers, ['STATUS', 'SITUACAO']),
    [dataset.headers]
  );
  const municipalityColKey = useMemo(
    () => findColumnKeyByKeyword(dataset.headers, ['MUNICÍPIO', 'MUNICIPIO', 'CIDADE']),
    [dataset.headers]
  );
  const natureColKey = useMemo(
    () => findColumnKeyByKeyword(dataset.headers, ['NATUREZA']),
    [dataset.headers]
  );

  const statusOptions = useMemo(() => {
    if (!statusColKey) return [];
    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const val = r[statusColKey]?.trim();
      if (val) set.add(val);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [dataset.rows, statusColKey]);

  const municipalityOptions = useMemo(() => {
    if (!municipalityColKey) return [];
    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const val = r[municipalityColKey]?.trim();
      if (val) set.add(val);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [dataset.rows, municipalityColKey]);

  const natureOptions = useMemo(() => {
    if (!natureColKey) return [];
    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const raw = r[natureColKey]?.trim();
      if (!raw) return;
      raw.split(/[;|\n]+/).forEach((part) => {
        const clean = part.trim();
        if (clean) set.add(clean);
      });
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [dataset.rows, natureColKey]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRows.length]);

  // Ordenação
  const sortedRows = useMemo(() => {
    if (!sortColumnKey) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const valA = (a[sortColumnKey] || '').toLowerCase();
      const valB = (b[sortColumnKey] || '').toLowerCase();

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredRows, sortColumnKey, sortDirection]);

  // Paginação
  const totalPages = Math.ceil(sortedRows.length / rowsPerPage) || 1;
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedRows.slice(start, start + rowsPerPage);
  }, [sortedRows, currentPage, rowsPerPage]);

  const handleSort = (key: string) => {
    if (sortColumnKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumnKey(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumnKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    config.filterStatus !== 'all' ||
      config.filterMunicipality !== 'all' ||
      config.filterOccurrence.trim() ||
      config.filterNature.trim() ||
      config.filterStartDateTime ||
      config.filterEndDateTime ||
      config.searchQuery.trim()
  );

  const renderStatusBadge = (val: string) => {
    const norm = val.toLowerCase();
    let colorClasses = 'text-slate-800';

    if (norm.includes('conclu') || norm.includes('encerrad')) {
      colorClasses = 'text-emerald-700 font-semibold';
    } else if (norm.includes('andamento')) {
      colorClasses = 'text-amber-700 font-semibold';
    } else if (norm.includes('pendente')) {
      colorClasses = 'text-rose-700 font-semibold';
    }

    return <span className={`text-xs ${colorClasses}`}>{val}</span>;
  };

  return (
    <section id="filtros" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Barra Superior */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Conferência e Filtros das Ocorrências
            </h2>
            <span className="text-xs font-mono tabular-nums text-slate-500">
              {filteredRows.length} de {dataset.totalRows} registros ativos no relatório
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Os filtros aplicados aqui atualizam imediatamente a prévia do documento, os quadros resumo e o PDF exportado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPdfPreview}
            disabled={isGeneratingPdf || filteredRows.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span>Visualizar PDF</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf || filteredRows.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Baixar PDF</span>
          </button>
        </div>
      </div>

      {/* Painel de Filtros Completos */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Filtro por Ocorrência (Número) */}
          <div>
            <label htmlFor="flt-occurrence" className="text-[11px] font-bold text-slate-700 block mb-1">
              Ocorrência (Número)
            </label>
            <input
              id="flt-occurrence"
              type="text"
              value={config.filterOccurrence}
              onChange={(e) => onChangeConfig({ filterOccurrence: e.target.value })}
              placeholder="Ex: 2026-08912"
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
            />
          </div>

          {/* Filtro por Natureza */}
          <div>
            <label htmlFor="flt-nature" className="text-[11px] font-bold text-slate-700 block mb-1">
              Natureza (Código ou Texto)
            </label>
            <input
              id="flt-nature"
              type="text"
              list="datatable-nature-options"
              value={config.filterNature}
              onChange={(e) => onChangeConfig({ filterNature: e.target.value })}
              placeholder="Digite ou escolha uma natureza..."
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
            />
            <datalist id="datatable-nature-options">
              {natureOptions.map((nat) => (
                <option key={nat} value={nat} />
              ))}
            </datalist>
          </div>

          {/* Filtro por Município */}
          <div>
            <label htmlFor="flt-municipality" className="text-[11px] font-bold text-slate-700 block mb-1">
              Município
            </label>
            <select
              id="flt-municipality"
              value={config.filterMunicipality}
              onChange={(e) => onChangeConfig({ filterMunicipality: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 cursor-pointer"
            >
              <option value="all">Todos os Municípios ({municipalityOptions.length})</option>
              {municipalityOptions.map((mun) => (
                <option key={mun} value={mun}>
                  {mun}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Status */}
          <div>
            <label htmlFor="flt-status" className="text-[11px] font-bold text-slate-700 block mb-1">
              Status
            </label>
            <select
              id="flt-status"
              value={config.filterStatus}
              onChange={(e) => onChangeConfig({ filterStatus: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 cursor-pointer"
            >
              <option value="all">Todos os Status ({statusOptions.length})</option>
              {statusOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Linha 2: Intervalo de Datas/Horários + Busca Livre */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 border-t border-slate-200/80">
          <div>
            <label htmlFor="flt-date-field" className="text-[11px] font-bold text-slate-700 block mb-1">
              Campo de Data/Hora
            </label>
            <select
              id="flt-date-field"
              value={config.filterDateField}
              onChange={(e) =>
                onChangeConfig({ filterDateField: e.target.value as 'any' | 'fact' | 'register' })
              }
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800 cursor-pointer"
            >
              <option value="any">Data Fato ou Registro</option>
              <option value="fact">Somente Data Fato</option>
              <option value="register">Somente Data Registro</option>
            </select>
          </div>

          <div>
            <label htmlFor="flt-start-dt" className="text-[11px] font-bold text-slate-700 block mb-1">
              Data e Hora Inicial
            </label>
            <input
              id="flt-start-dt"
              type="datetime-local"
              value={config.filterStartDateTime}
              onChange={(e) => onChangeConfig({ filterStartDateTime: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
            />
          </div>

          <div>
            <label htmlFor="flt-end-dt" className="text-[11px] font-bold text-slate-700 block mb-1">
              Data e Hora Final
            </label>
            <input
              id="flt-end-dt"
              type="datetime-local"
              value={config.filterEndDateTime}
              onChange={(e) => onChangeConfig({ filterEndDateTime: e.target.value })}
              className="w-full px-2.5 py-1.5 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
            />
          </div>

          <div>
            <label htmlFor="flt-global" className="text-[11px] font-bold text-slate-700 block mb-1">
              Busca Livre (Bairro, Rua, Viatura...)
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                id="flt-global"
                type="text"
                value={config.searchQuery}
                onChange={(e) => onChangeConfig({ searchQuery: e.target.value })}
                placeholder="Pesquisar em qualquer campo..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela Interativa com Rolagem */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900 text-white sticky top-0 z-10 select-none">
              <tr>
                <th className="py-2.5 px-3 font-mono text-[11px] text-slate-300 text-center w-12 border-b border-slate-800">
                  #
                </th>
                {visibleColumns.map((col) => {
                  const isSorted = sortColumnKey === col.key;
                  const isDateCol = isDateTimeColumn(col.label);
                  return (
                    <th
                      key={col.key}
                      onClick={() => handleSort(col.key)}
                      className={`py-2.5 px-3 font-semibold text-slate-100 border-b border-slate-800 cursor-pointer hover:bg-slate-800 transition-colors whitespace-nowrap ${
                        isDateCol ? 'text-center' : ''
                      }`}
                    >
                      <div className={`flex items-center gap-1.5 ${isDateCol ? 'justify-center' : ''}`}>
                        <span>{col.label}</span>
                        {isSorted ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-sky-400" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-sky-400" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-500 opacity-60" />
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={visibleColumns.length + 1}
                    className="py-8 text-center text-slate-500 text-xs"
                  >
                    Nenhum registro encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, idx) => {
                  const rowNumber = (currentPage - 1) * rowsPerPage + idx + 1;
                  const isEven = idx % 2 === 0;
                  return (
                    <tr
                      key={rowNumber}
                      className={`hover:bg-slate-100/70 transition-colors ${
                        isEven ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="py-2 px-3 text-center font-mono text-slate-500 font-semibold text-[11px] tabular-nums">
                        {rowNumber}
                      </td>
                      {visibleColumns.map((col) => {
                        const val = row[col.key] || '—';
                        const labelUpper = col.label.toUpperCase();
                        const isStatus = labelUpper.includes('STATUS');
                        const isNum = labelUpper.includes('NÚMERO') || labelUpper.includes('NUMERO');
                        const isDateCol = isDateTimeColumn(col.label);
                        const dateParts = isDateCol ? splitDateAndTime(val) : null;

                        return (
                          <td
                            key={col.key}
                            className={`py-2 px-3 text-slate-800 ${
                              isNum ? 'font-mono font-semibold text-slate-900 whitespace-nowrap' : ''
                            } ${isDateCol ? 'text-center' : ''}`}
                          >
                            {isStatus ? (
                              renderStatusBadge(val)
                            ) : dateParts ? (
                              <div className="flex flex-col items-center justify-center leading-tight font-mono whitespace-nowrap">
                                <span className="text-slate-900">{dateParts.date}</span>
                                <span className="text-[11px] text-slate-500">{dateParts.time}</span>
                              </div>
                            ) : (
                              val
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-slate-600">
          <div className="font-mono tabular-nums">
            Mostrando {(currentPage - 1) * rowsPerPage + 1}–
            {Math.min(currentPage * rowsPerPage, sortedRows.length)} de {sortedRows.length}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Anterior
            </button>
            <span className="font-mono px-2 tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-2.5 py-1 text-xs border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
