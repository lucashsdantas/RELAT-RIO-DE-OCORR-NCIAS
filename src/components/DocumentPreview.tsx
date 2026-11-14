import React, { useState, useEffect } from 'react';
import { Eye, Download, FileCheck2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { OccurrenceDataset, ReportConfig } from '../types/occurrence';
import { OccurrenceSummaryReport } from '../utils/natureCatalog';
import { FIXED_LOGO_URL } from '../utils/sampleData';
import {
  formatBrazilianDateTime,
  formatCurrentDateTime,
  isDateTimeColumn,
  splitDateAndTime,
} from '../utils/pdfGenerator';

interface DocumentPreviewProps {
  dataset: OccurrenceDataset;
  config: ReportConfig;
  filteredRows: Record<string, string>[];
  summary: OccurrenceSummaryReport;
  onOpenPdfPreview: () => void;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  dataset,
  config,
  filteredRows,
  summary,
  onOpenPdfPreview,
  onDownloadPdf,
  isGeneratingPdf,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);

  const visibleColumns = dataset.headers.filter((h) => h.visible);
  const startFormatted = formatBrazilianDateTime(config.startDateTime);
  const endFormatted = formatBrazilianDateTime(config.endDateTime);
  const generatedAt = formatCurrentDateTime(new Date());
  const isLandscape = config.orientation === 'landscape';

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRows.length, rowsPerPage]);

  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * rowsPerPage;
  const previewRows = filteredRows.slice(startIndex, startIndex + rowsPerPage);

  const formatPct = (val: number) => `${val.toFixed(1).replace('.', ',')}%`;

  const pageNumbersToShow = (() => {
    const pages: number[] = [];
    const maxButtons = 5;
    let startP = Math.max(1, safePage - Math.floor(maxButtons / 2));
    const endP = Math.min(totalPages, startP + maxButtons - 1);
    if (endP - startP + 1 < maxButtons) {
      startP = Math.max(1, endP - maxButtons + 1);
    }
    for (let p = startP; p <= endP; p++) {
      pages.push(p);
    }
    return pages;
  })();

  const renderPaginationBar = (position: 'top' | 'bottom') => (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs ${
        position === 'top' ? '' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-3 text-slate-600">
        <span className="font-mono tabular-nums">
          {filteredRows.length === 0
            ? '0 ocorrências'
            : `Exibindo ${startIndex + 1}–${Math.min(startIndex + rowsPerPage, filteredRows.length)} de ${filteredRows.length} ocorrências`}
        </span>
        <span className="text-slate-300">·</span>
        <label className="inline-flex items-center gap-1.5 text-slate-600">
          <span>Por página:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
            className="bg-slate-50 border border-slate-300 rounded px-1.5 py-0.5 text-xs font-mono text-slate-800 cursor-pointer"
          >
            <option value={15}>15</option>
            <option value={20}>20</option>
            <option value={30}>30</option>
            <option value={50}>50</option>
          </select>
        </label>
      </div>

      <div className="flex items-center gap-1 self-end sm:self-auto">
        <button
          type="button"
          onClick={() => setCurrentPage(1)}
          disabled={safePage === 1}
          title="Primeira página"
          className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700"
        >
          <ChevronsLeft className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={safePage === 1}
          title="Página anterior"
          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700 font-medium whitespace-nowrap"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {pageNumbersToShow.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setCurrentPage(p)}
            className={`min-w-[28px] px-2 py-1 rounded border font-mono text-xs cursor-pointer transition-colors ${
              p === safePage
                ? 'bg-slate-900 text-white border-slate-900 font-bold'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            {p}
          </button>
        ))}

        <button
          type="button"
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={safePage === totalPages}
          title="Próxima página"
          className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700 font-medium whitespace-nowrap"
        >
          <span className="hidden sm:inline">Próxima</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentPage(totalPages)}
          disabled={safePage === totalPages}
          title="Última página"
          className="p-1.5 rounded border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer text-slate-700"
        >
          <ChevronsRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  return (
    <section className="bg-slate-200/70 border border-slate-300 rounded-xl p-4 sm:p-6 space-y-4">
      {/* Barra superior da pré-visualização */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-slate-700" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Pré-visualização do Documento PDF ({isLandscape ? 'Paisagem A4' : 'Retrato A4'})
            </h3>
            <p className="text-[11px] text-slate-600">
              Navegue diretamente pelas páginas abaixo e confira o Quadro Resumo analítico (incluindo Produtividade) antes de baixar o PDF.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onOpenPdfPreview}
            disabled={isGeneratingPdf || visibleColumns.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
          >
            <Eye className="w-3.5 h-3.5 text-slate-600" />
            <span>Prévia PDF Real (Leitor)</span>
          </button>

          <button
            type="button"
            onClick={onDownloadPdf}
            disabled={isGeneratingPdf || visibleColumns.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            <span>Baixar PDF</span>
          </button>
        </div>
      </div>

      {/* Paginação Superior na Página Principal */}
      {renderPaginationBar('top')}

      {/* Folha A4 Simulada */}
      <div className="overflow-x-auto pb-2">
        <div
          className={`bg-white mx-auto shadow-lg border border-slate-300 rounded-sm p-6 sm:p-8 flex flex-col justify-between min-h-[540px] ${
            isLandscape ? 'w-full min-w-[880px] max-w-[1120px]' : 'w-full min-w-[620px] max-w-[780px]'
          }`}
        >
          <div>
            {/* Cabeçalho da Folha */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b-2 border-slate-900">
              <div className="flex items-start gap-3.5">
                <img
                  src={config.logoBase64 || FIXED_LOGO_URL}
                  alt="Brasão Institucional"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-contain shrink-0"
                />
                <div className="space-y-0.5">
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight leading-snug">
                    {config.title || 'RELATÓRIO OPERACIONAL DE ATENDIMENTOS E OCORRÊNCIAS'}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    {config.subtitle || '4º Batalhão de Bombeiros Militar'}
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-700">
                    <span className="font-bold text-slate-900">
                      Ala de Serviço: Ala {config.serviceWing}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      Período: {startFormatted} a {endFormatted}
                    </span>
                    {config.department && (
                      <>
                        <span className="text-slate-300">|</span>
                        <span className="text-slate-600">{config.department}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0 space-y-0.5">
                <div className="text-xs font-extrabold text-slate-900 tracking-wide">
                  ALA {config.serviceWing}
                </div>
                <div className="text-[10px] font-mono text-slate-500">
                  Gerado em: {generatedAt}
                </div>
                <div className="text-[11px] font-bold text-sky-700 font-mono tabular-nums">
                  Atendimentos (RAIs): {filteredRows.length} · Naturezas Atendidas: {summary.totalConcurrentNatures}
                </div>
              </div>
            </div>

            {/* Tabela Principal Simulada */}
            <div className="mt-4 overflow-hidden border border-slate-300">
              {visibleColumns.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Nenhuma coluna selecionada para exibição no relatório.
                </div>
              ) : filteredRows.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Nenhuma ocorrência corresponde aos filtros aplicados na aba Conferência e Filtros.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-[10px] leading-snug">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      <th className="py-2 px-2 font-bold border-r border-slate-700 text-center w-8 uppercase tracking-tight">
                        #
                      </th>
                      {visibleColumns.map((col) => {
                        const upper = col.label.toUpperCase();
                        const centerHeader =
                          upper.includes('NÚMERO') ||
                          upper.includes('NUMERO') ||
                          upper.includes('STATUS') ||
                          isDateTimeColumn(col.label);
                        return (
                          <th
                            key={col.key}
                            className={`py-2 px-2 font-bold border-r border-slate-700 last:border-r-0 uppercase tracking-tight ${
                              centerHeader ? 'text-center' : 'text-left'
                            }`}
                          >
                            {col.label}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rIdx) => {
                      const globalOrder = startIndex + rIdx + 1;
                      const isEven = rIdx % 2 === 0;
                      const bgClass = config.showZebra
                        ? isEven
                          ? 'bg-white'
                          : 'bg-slate-50'
                        : 'bg-white';
                      return (
                        <tr key={globalOrder} className={`${bgClass} border-t border-slate-200`}>
                          <td
                            className={`${config.compactMode ? 'py-1 px-1.5' : 'py-1.5 px-2'} border-r border-slate-200 text-center font-mono font-bold text-slate-600 tabular-nums`}
                          >
                            {globalOrder}
                          </td>
                          {visibleColumns.map((col) => {
                            const val = row[col.key] || '—';
                            const upper = col.label.toUpperCase();
                            const isNum = upper.includes('NÚMERO') || upper.includes('NUMERO');
                            const isStatus = upper.includes('STATUS');
                            const isDateCol = isDateTimeColumn(col.label);
                            const dateParts = isDateCol ? splitDateAndTime(val) : null;

                            let textColor = 'text-slate-800';
                            if (isStatus) {
                              const norm = val.toLowerCase();
                              if (norm.includes('conclu') || norm.includes('encerrad')) {
                                textColor = 'text-emerald-700 font-bold';
                              } else if (norm.includes('andamento')) {
                                textColor = 'text-amber-700 font-bold';
                              } else if (norm.includes('pendente')) {
                                textColor = 'text-rose-700 font-bold';
                              }
                            }

                            return (
                              <td
                                key={col.key}
                                className={`${config.compactMode ? 'py-1 px-1.5' : 'py-1.5 px-2'} border-r border-slate-200 last:border-r-0 ${
                                  isNum ? 'font-mono font-bold text-slate-900 whitespace-nowrap text-center' : ''
                                } ${isStatus || isDateCol ? 'text-center' : ''} ${textColor}`}
                              >
                                {dateParts ? (
                                  <div className="flex flex-col items-center justify-center leading-tight font-mono whitespace-nowrap">
                                    <span className="text-slate-900">{dateParts.date}</span>
                                    <span className="text-[9px] text-slate-500">{dateParts.time}</span>
                                  </div>
                                ) : (
                                  val
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Quadro Resumo Logo Abaixo do Relatório */}
            {summary.totalOccurrences > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-300 space-y-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
                      Quadro Resumo Analítico — Quantitativo de Naturezas Atendidas
                    </h5>
                    <div className="flex flex-wrap items-center gap-3 text-[10.5px] font-mono">
                      <span className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-900 font-bold">
                        RAIs Registrados: {summary.totalOccurrences}
                      </span>
                      <span className="px-2 py-0.5 bg-sky-50 border border-sky-300 rounded text-sky-900 font-bold">
                        Naturezas Atendidas: {summary.totalConcurrentNatures}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 border border-slate-300 rounded px-3 py-2 text-[10.5px] text-slate-800 leading-relaxed">
                    <strong>Número de atendimentos foi {summary.totalOccurrences}</strong>, dado pelo número de{' '}
                    <strong>RAIs</strong> registrados, enquanto houveram{' '}
                    <strong className="text-sky-800">{summary.totalConcurrentNatures} naturezas atendidas</strong>
                    {' '}(incluindo ocorrências de Produtividade).
                    {summary.multiNatureOccurrencesCount > 0 && (
                      <span className="text-slate-600">
                        {' '}
                        ({summary.multiNatureOccurrencesCount} ocorrência(s) possuíam mais de uma natureza e todas foram mencionadas e contabilizadas nas tabelas abaixo.)
                      </span>
                    )}
                  </div>
                </div>

                {/* Tabela 1: Resumo por Grupo */}
                <div className="max-w-lg border border-slate-300 overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700">GRUPO</th>
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700 text-center w-36">
                          NATUREZAS ATENDIDAS
                        </th>
                        <th className="py-1.5 px-2 font-bold text-center w-16">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.byGroup.map((g, idx) => (
                        <tr
                          key={g.group}
                          className={`border-t border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                        >
                          <td className="py-1 px-2 border-r border-slate-200 font-semibold text-slate-900">
                            {g.group}
                          </td>
                          <td className="py-1 px-2 border-r border-slate-200 text-center font-mono font-bold text-slate-900 tabular-nums">
                            {g.concurrentCount}
                          </td>
                          <td className="py-1 px-2 text-center font-mono text-slate-600 tabular-nums">
                            {formatPct(g.concurrentPercentage)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-slate-900 bg-slate-200 font-bold text-slate-900">
                        <td className="py-1.5 px-2 border-r border-slate-300">
                          TOTAL DE NATUREZAS ATENDIDAS POR GRUPO
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono tabular-nums">
                          {summary.totalConcurrentNatures}
                        </td>
                        <td className="py-1.5 px-2 text-center font-mono tabular-nums">100,0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Tabela 2: Resumo por Sub-grupo e Natureza com Subtotais */}
                <div className="border border-slate-300 overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700">GRUPO</th>
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700 text-center w-20">CÓDIGO</th>
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700">SUB-GRUPO</th>
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700">NATUREZA</th>
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700 text-center w-32">
                          NATUREZAS ATENDIDAS
                        </th>
                        <th className="py-1.5 px-2 font-bold text-center w-14">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {summary.bySubGroup.map((block) => (
                        <React.Fragment key={`${block.group}__${block.subGroup}`}>
                          {block.items.map((n, idx) => (
                            <tr
                              key={n.id}
                              className={`border-t border-slate-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}`}
                            >
                              <td className="py-1 px-2 border-r border-slate-200 font-semibold text-slate-700">
                                {n.group}
                              </td>
                              <td className="py-1 px-2 border-r border-slate-200 text-center font-mono font-bold text-slate-900">
                                {n.code}
                              </td>
                              <td className="py-1 px-2 border-r border-slate-200 text-slate-700 font-medium">
                                {n.subGroup}
                              </td>
                              <td className="py-1 px-2 border-r border-slate-200 text-slate-900">
                                {n.nature}
                              </td>
                              <td className="py-1 px-2 border-r border-slate-200 text-center font-mono font-bold text-slate-900 tabular-nums">
                                {n.concurrentCount}
                              </td>
                              <td className="py-1 px-2 text-center font-mono text-slate-600 tabular-nums">
                                {formatPct(n.concurrentPercentage)}
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t border-slate-300 bg-slate-100 font-bold text-slate-900">
                            <td colSpan={4} className="py-1 px-2 border-r border-slate-200 text-right text-[9.5px] uppercase tracking-tight">
                              Subtotal — {block.group} / {block.subGroup}
                            </td>
                            <td className="py-1 px-2 border-r border-slate-200 text-center font-mono tabular-nums">
                              {block.subtotalConcurrentCount}
                            </td>
                            <td className="py-1 px-2 text-center font-mono tabular-nums">
                              {formatPct(block.subtotalConcurrentPercentage)}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                      <tr className="border-t-2 border-slate-900 bg-slate-200 font-bold text-slate-900">
                        <td colSpan={4} className="py-1.5 px-2 border-r border-slate-300">
                          TOTAL GERAL DE NATUREZAS ATENDIDAS (RAIs registrados: {summary.totalOccurrences})
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono tabular-nums">
                          {summary.totalConcurrentNatures}
                        </td>
                        <td className="py-1.5 px-2 text-center font-mono tabular-nums">100,0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>

          {/* Rodapé da Folha */}
          <div className="mt-8 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500">
            <span className="truncate pr-4">
              {config.confidentialityText ||
                'RELATÓRIO OBTIDO ATRAVÉS DE DADOS EXTRAÍDOS DO SISTEMA DE REGISTRO DE ATENDIMENTO INTEGRADO - RAI'}
            </span>
            <span className="font-mono shrink-0">
              Página <strong className="text-slate-900">{safePage}</strong> de{' '}
              <strong className="text-slate-900">{totalPages}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Paginação Inferior */}
      {totalPages > 1 && renderPaginationBar('bottom')}
    </section>
  );
};
