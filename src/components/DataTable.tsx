import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { OccurrenceDataset } from '../types/occurrence';
import { isDateTimeColumn, splitDateAndTime } from '../utils/pdfGenerator';

interface DataTableProps {
  dataset: OccurrenceDataset;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  onOpenPdfPreview: () => void;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
}

export const DataTable: React.FC<DataTableProps> = ({
  dataset,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
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

  // Extrai lista única de status para o filtro dropdown
  const statusOptions = useMemo(() => {
    const statusCol = dataset.headers.find((h) => h.label.toUpperCase().includes('STATUS'));
    if (!statusCol) return [];

    const set = new Set<string>();
    dataset.rows.forEach((r) => {
      const val = r[statusCol.key];
      if (val && val.trim()) set.add(val.trim());
    });
    return Array.from(set).sort();
  }, [dataset]);

  // Filtra as linhas com base no status e na busca textual
  const filteredRows = useMemo(() => {
    return dataset.rows.filter((row) => {
      // Filtro de status
      if (statusFilter !== 'all') {
        const statusCol = dataset.headers.find((h) => h.label.toUpperCase().includes('STATUS'));
        if (statusCol && row[statusCol.key]?.trim() !== statusFilter) {
          return false;
        }
      }

      // Filtro de busca textual em todas as colunas
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matches = Object.values(row).some((val) =>
          val.toLowerCase().includes(query)
        );
        if (!matches) return false;
      }

      return true;
    });
  }, [dataset, statusFilter, searchQuery]);

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

  const renderStatusBadge = (val: string) => {
    const norm = val.toLowerCase();
    let colorClasses = 'bg-slate-100 text-slate-800 border-slate-200';

    if (norm.includes('conclu')) {
      colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold';
    } else if (norm.includes('andamento')) {
      colorClasses = 'bg-amber-50 text-amber-900 border-amber-200 font-semibold';
    } else if (norm.includes('pendente')) {
      colorClasses = 'bg-rose-50 text-rose-800 border-rose-200 font-semibold';
    }

    return (
      <span className={`inline-block px-2 py-0.5 text-[11px] rounded border ${colorClasses}`}>
        {val}
      </span>
    );
  };

  return (
    <section id="previa" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
      {/* Barra Superior da Tabela */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">
              Prévia das Ocorrências Identificadas
            </h2>
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded">
              {filteredRows.length} de {dataset.totalRows} registros
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Confira os dados antes de gerar o PDF. Clique no cabeçalho para ordenar.
          </p>
        </div>

        {/* Controles de Busca e Filtro */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Pesquisar número, bairro, fato..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white text-slate-800"
            />
          </div>

          {statusOptions.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  onStatusFilterChange(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs text-slate-700 font-medium focus:outline-none cursor-pointer"
              >
                <option value="all">Todos os Status</option>
                {statusOptions.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            onClick={onOpenPdfPreview}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Visualizar</span> PDF
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Baixar PDF</span>
          </button>
        </div>
      </div>

      {/* Tabela Interativa com Rolagem */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900 text-white sticky top-0 z-10 select-none">
              <tr>
                <th className="py-2.5 px-3 font-mono text-[11px] text-slate-400 text-center w-12 border-b border-slate-800">
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
                      key={idx}
                      className={`hover:bg-slate-100/70 transition-colors ${
                        isEven ? 'bg-white' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="py-2 px-3 text-center font-mono text-slate-400 text-[11px]">
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
          <div>
            Mostrando registros {(currentPage - 1) * rowsPerPage + 1} até{' '}
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
            <span className="font-mono px-2">
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
