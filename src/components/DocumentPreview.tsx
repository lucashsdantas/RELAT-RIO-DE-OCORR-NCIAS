import React from 'react';
import { Eye, Download, FileCheck2 } from 'lucide-react';
import { OccurrenceDataset, ReportConfig } from '../types/occurrence';
import { OccurrenceSummaryReport } from '../utils/natureCatalog';
import { FIXED_LOGO_URL } from '../utils/sampleData';
import { formatBrazilianDateTime, formatCurrentDateTime } from '../utils/pdfGenerator';

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
  const visibleColumns = dataset.headers.filter((h) => h.visible);
  const startFormatted = formatBrazilianDateTime(config.startDateTime);
  const endFormatted = formatBrazilianDateTime(config.endDateTime);
  const generatedAt = formatCurrentDateTime(new Date());
  const isLandscape = config.orientation === 'landscape';

  const previewRows = filteredRows.slice(0, 25);
  const hasMoreRows = filteredRows.length > previewRows.length;

  const formatPct = (val: number) => `${val.toFixed(1).replace('.', ',')}%`;

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
              Confira o cabeçalho institucional, a tabela de ocorrências e o Quadro Resumo por Grupo e Natureza antes de gerar o arquivo final.
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
                  alt="Brasão 4º BBM"
                  referrerPolicy="no-referrer"
                  className="w-14 h-14 object-contain shrink-0"
                />
                <div className="space-y-0.5">
                  <h4 className="text-sm font-extrabold text-slate-900 uppercase tracking-tight leading-snug">
                    {config.title || 'RELATÓRIO OPERACIONAL DE ATENDIMENTOS E OCORRÊNCIAS'}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    {config.subtitle || '4º Batalhão de Bombeiros Militar — Controle Operacional'}
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
                <div className="text-[11px] font-bold text-sky-700 font-mono">
                  Total de Ocorrências: {filteredRows.length}
                </div>
              </div>
            </div>

            {/* Tabela Principal Simulada */}
            <div className="mt-4 overflow-hidden border border-slate-300">
              {visibleColumns.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  Nenhuma coluna selecionada para exibição no relatório.
                </div>
              ) : (
                <table className="w-full text-left border-collapse text-[10px] leading-snug">
                  <thead>
                    <tr className="bg-slate-900 text-white">
                      {visibleColumns.map((col) => (
                        <th
                          key={col.key}
                          className="py-2 px-2 font-bold border-r border-slate-700 last:border-r-0 uppercase tracking-tight"
                        >
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row, rIdx) => {
                      const isEven = rIdx % 2 === 0;
                      const bgClass = config.showZebra
                        ? isEven
                          ? 'bg-white'
                          : 'bg-slate-50'
                        : 'bg-white';
                      return (
                        <tr key={rIdx} className={`${bgClass} border-t border-slate-200`}>
                          {visibleColumns.map((col) => {
                            const val = row[col.key] || '—';
                            const upper = col.label.toUpperCase();
                            const isNum = upper.includes('NÚMERO') || upper.includes('NUMERO');
                            const isStatus = upper.includes('STATUS');

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
                                  isNum ? 'font-mono font-bold text-slate-900 whitespace-nowrap' : ''
                                } ${textColor}`}
                              >
                                {val}
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

            {hasMoreRows && (
              <p className="mt-2 text-center text-[11px] text-slate-500 italic">
                Exibindo os primeiros {previewRows.length} registros na prévia visual. Todas as{' '}
                {filteredRows.length} ocorrências serão paginadas automaticamente no PDF final.
              </p>
            )}

            {/* Quadro Resumo Logo Abaixo do Relatório */}
            {summary.totalOccurrences > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-300 space-y-4">
                <div>
                  <h5 className="text-xs font-extrabold text-slate-900 uppercase tracking-tight">
                    Quadro Resumo — Quantitativo de Ocorrências Atendidas
                  </h5>
                  <p className="text-[10px] text-slate-600">
                    Consolidado por Grupo e por Natureza Predominante (Total de Ocorrências:{' '}
                    <strong className="font-mono text-slate-900">{summary.totalOccurrences}</strong> | Total de Naturezas:{' '}
                    <strong className="font-mono text-slate-900">{summary.totalOccurrences}</strong>)
                  </p>
                </div>

                {/* Tabela 1: Resumo por Grupo */}
                <div className="max-w-lg border border-slate-300 overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700">GRUPO</th>
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700 text-center w-24">OCORRÊNCIAS</th>
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
                          <td className="py-1 px-2 border-r border-slate-200 text-center font-mono font-bold text-slate-900">
                            {g.count}
                          </td>
                          <td className="py-1 px-2 text-center font-mono text-slate-600">
                            {formatPct(g.percentage)}
                          </td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-slate-900 bg-slate-200 font-bold text-slate-900">
                        <td className="py-1.5 px-2 border-r border-slate-300">TOTAL GERAL POR GRUPO</td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono">
                          {summary.totalOccurrences}
                        </td>
                        <td className="py-1.5 px-2 text-center font-mono">100,0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Tabela 2: Resumo por Natureza */}
                <div className="border border-slate-300 overflow-hidden">
                  <table className="w-full text-left border-collapse text-[10px]">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700">GRUPO</th>
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700 text-center w-20">CÓDIGO</th>
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700">SUB-GRUPO</th>
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700">NATUREZA</th>
                        <th className="py-1.5 px-2 font-bold border-r border-slate-700 text-center w-14">QTD.</th>
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
                              <td className="py-1 px-2 border-r border-slate-200 text-center font-mono font-bold text-slate-900">
                                {n.count}
                              </td>
                              <td className="py-1 px-2 text-center font-mono text-slate-600">
                                {formatPct(n.percentage)}
                              </td>
                            </tr>
                          ))}
                          <tr className="border-t border-slate-300 bg-slate-100 font-bold text-slate-900">
                            <td colSpan={4} className="py-1 px-2 border-r border-slate-200 text-right text-[9.5px] uppercase tracking-tight">
                              Subtotal — {block.group} / {block.subGroup}
                            </td>
                            <td className="py-1 px-2 border-r border-slate-200 text-center font-mono">
                              {block.subtotalCount}
                            </td>
                            <td className="py-1 px-2 text-center font-mono">
                              {formatPct(block.subtotalPercentage)}
                            </td>
                          </tr>
                        </React.Fragment>
                      ))}
                      <tr className="border-t-2 border-slate-900 bg-slate-200 font-bold text-slate-900">
                        <td colSpan={4} className="py-1.5 px-2 border-r border-slate-300">
                          TOTAL GERAL DE NATUREZAS ATENDIDAS
                        </td>
                        <td className="py-1.5 px-2 border-r border-slate-300 text-center font-mono">
                          {summary.totalOccurrences}
                        </td>
                        <td className="py-1.5 px-2 text-center font-mono">100,0%</td>
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
              {config.confidentialityText || 'DOCUMENTO DE USO CORPORATIVO / RESERVADO'}
            </span>
            <span className="font-mono shrink-0">
              Página <strong className="text-slate-900">1</strong> de{' '}
              <strong className="text-slate-900">{Math.max(1, Math.ceil(filteredRows.length / 18))}</strong>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
