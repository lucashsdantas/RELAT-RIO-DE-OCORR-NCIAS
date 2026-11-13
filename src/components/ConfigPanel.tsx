import React from 'react';
import {
  Sliders,
  CheckSquare,
  Square,
  Eye,
  Download,
  ShieldCheck,
  CalendarClock,
} from 'lucide-react';
import { ColumnDefinition, ReportConfig, ServiceWing } from '../types/occurrence';
import { FIXED_LOGO_URL } from '../utils/sampleData';

interface ConfigPanelProps {
  config: ReportConfig;
  columns: ColumnDefinition[];
  onChangeConfig: (newConfig: Partial<ReportConfig>) => void;
  onToggleColumn: (key: string) => void;
  onToggleAllColumns: (visible: boolean) => void;
  onResetColumnsToStandard: () => void;
  onOpenPdfPreview: () => void;
  onDownloadPdf: () => void;
  isGeneratingPdf: boolean;
  hasData: boolean;
}

const SERVICE_WINGS: ServiceWing[] = ['A', 'B', 'C', 'D'];

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  config,
  columns,
  onChangeConfig,
  onToggleColumn,
  onToggleAllColumns,
  onResetColumnsToStandard,
  onOpenPdfPreview,
  onDownloadPdf,
  isGeneratingPdf,
  hasData,
}) => {
  const visibleColumnsCount = columns.filter((c) => c.visible).length;
  const isPdfDisabled = !hasData || isGeneratingPdf || visibleColumnsCount === 0;

  return (
    <div id="configuracao" className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0">
            <Sliders className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              2. Parâmetros e Personalização do Relatório
            </h3>
            <p className="text-xs text-slate-500">
              Informe a Ala de Serviço, o intervalo de data/hora e ajuste os campos do cabeçalho
            </p>
          </div>
        </div>

        {/* Botões Principais de Ação */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 shrink-0">
          {!hasData && (
            <span className="text-[11px] text-amber-700 font-medium sm:mr-1">
              Cole os dados acima para gerar o PDF
            </span>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenPdfPreview}
              disabled={isPdfDisabled}
              title={!hasData ? 'Cole e processe os dados das ocorrências primeiro' : undefined}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5 text-slate-600" />
              <span>Abrir PDF</span>
            </button>

            <button
              type="button"
              onClick={onDownloadPdf}
              disabled={isPdfDisabled}
              title={!hasData ? 'Cole e processe os dados das ocorrências primeiro' : undefined}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
            >
              {isGeneratingPdf ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Gerando...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-sky-300" />
                  <span>Baixar PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Campos Operacionais Obrigatórios: Ala de Serviço & Intervalo */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Coluna Esquerda (4 cols): Logo Institucional Fixa + Ala de Serviço + Orientação */}
        <div className="lg:col-span-5 bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-4">
          {/* Logotipo Institucional Fixo */}
          <div className="flex items-center gap-3.5 pb-3.5 border-b border-slate-200">
            <div className="w-14 h-14 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
              <img
                src={config.logoBase64 || FIXED_LOGO_URL}
                alt="Brasão Institucional Oficial"
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold text-slate-900 truncate">
                  Brasão Institucional Oficial
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                Logotipo padrão aplicado automaticamente no cabeçalho de todas as páginas do relatório.
              </p>
            </div>
          </div>

          {/* Seletor Ala de Serviço (A, B, C ou D) */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Ala de Serviço
            </label>
            <div className="grid grid-cols-4 gap-2">
              {SERVICE_WINGS.map((wing) => {
                const isSelected = config.serviceWing === wing;
                return (
                  <button
                    key={wing}
                    type="button"
                    onClick={() => onChangeConfig({ serviceWing: wing })}
                    className={`py-2 px-2 text-xs rounded-lg border transition-all cursor-pointer font-semibold whitespace-nowrap ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    Ala {wing}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Orientação da Página */}
          <div>
            <label className="text-xs font-bold text-slate-800 block mb-1.5">
              Orientação da Página PDF
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onChangeConfig({ orientation: 'landscape' })}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer whitespace-nowrap ${
                  config.orientation === 'landscape'
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Paisagem (A4)
              </button>
              <button
                type="button"
                onClick={() => onChangeConfig({ orientation: 'portrait' })}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer whitespace-nowrap ${
                  config.orientation === 'portrait'
                    ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                Retrato (A4)
              </button>
            </div>
          </div>
        </div>

        {/* Coluna Direita (7 cols): Intervalo de Datas + Títulos e Rodapé */}
        <div className="lg:col-span-7 space-y-4">
          {/* Intervalo do Relatório: Data/Hora Inicial e Final */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center gap-1.5 mb-2.5">
              <CalendarClock className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold text-slate-800">
                Intervalo do Relatório (Data e Hora)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="start-datetime" className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Data e Hora Inicial
                </label>
                <input
                  id="start-datetime"
                  type="datetime-local"
                  value={config.startDateTime}
                  onChange={(e) => onChangeConfig({ startDateTime: e.target.value })}
                  className="w-full text-xs font-mono p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                />
              </div>

              <div>
                <label htmlFor="end-datetime" className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Data e Hora Final
                </label>
                <input
                  id="end-datetime"
                  type="datetime-local"
                  value={config.endDateTime}
                  onChange={(e) => onChangeConfig({ endDateTime: e.target.value })}
                  className="w-full text-xs font-mono p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Título e Subtítulos */}
          <div>
            <label htmlFor="report-title" className="text-xs font-bold text-slate-800 block mb-1">
              Título Principal do Relatório
            </label>
            <input
              id="report-title"
              type="text"
              value={config.title}
              onChange={(e) => onChangeConfig({ title: e.target.value })}
              placeholder="Ex: RELATÓRIO OPERACIONAL DE ATENDIMENTOS E OCORRÊNCIAS"
              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="report-subtitle" className="text-xs font-semibold text-slate-700 block mb-1">
                Subtítulo / Unidade
              </label>
              <input
                id="report-subtitle"
                type="text"
                value={config.subtitle}
                onChange={(e) => onChangeConfig({ subtitle: e.target.value })}
                placeholder="Ex: 4º Batalhão de Bombeiros Militar"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white text-slate-800"
              />
            </div>

            <div>
              <label htmlFor="report-dept" className="text-xs font-semibold text-slate-700 block mb-1">
                Seção / Observação do Cabeçalho
              </label>
              <input
                id="report-dept"
                type="text"
                value={config.department}
                onChange={(e) => onChangeConfig({ department: e.target.value })}
                placeholder="Ex: B-3 / Coordenação Operacional"
                className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white text-slate-800"
              />
            </div>
          </div>

          <div>
            <label htmlFor="report-confidentiality" className="text-xs font-semibold text-slate-700 block mb-1">
              Texto de Rodapé (Confidencialidade)
            </label>
            <input
              id="report-confidentiality"
              type="text"
              value={config.confidentialityText}
              onChange={(e) => onChangeConfig({ confidentialityText: e.target.value })}
              className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-800 focus:bg-white text-slate-800"
            />
          </div>

          {/* Opções visuais da tabela */}
          <div className="pt-1 flex flex-wrap items-center gap-4 text-xs text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.repeatHeader}
                onChange={(e) => onChangeConfig({ repeatHeader: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-800 w-4 h-4 cursor-pointer"
              />
              <span>Repetir cabeçalho em todas as páginas</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.showZebra}
                onChange={(e) => onChangeConfig({ showZebra: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-800 w-4 h-4 cursor-pointer"
              />
              <span>Linhas zebradas</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={config.compactMode}
                onChange={(e) => onChangeConfig({ compactMode: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-800 w-4 h-4 cursor-pointer"
              />
              <span>Modo compacto</span>
            </label>
          </div>
        </div>
      </div>

      {/* Seleção de Colunas Visíveis */}
      <div className="pt-4 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <span className="text-xs font-bold text-slate-900">
              Colunas do Relatório ({visibleColumnsCount} de {columns.length} ativas)
            </span>
            <p className="text-[11px] text-slate-500">
              {hasData
                ? 'Selecione exatamente quais colunas devem compor o documento PDF (salvo automaticamente).'
                : 'Preferência de colunas padrão salva automaticamente para a próxima tabela colada.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggleAllColumns(true)}
              className="text-[11px] text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
            >
              Marcar Todas
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => onToggleAllColumns(false)}
              className="text-[11px] text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
            >
              Desmarcar Todas
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={onResetColumnsToStandard}
              className="text-[11px] text-sky-700 hover:text-sky-900 font-medium cursor-pointer"
            >
              Apenas 9 Padrões
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {columns.map((col) => (
            <button
              key={col.key}
              type="button"
              onClick={() => onToggleColumn(col.key)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                col.visible
                  ? 'bg-slate-900 text-white border-slate-900 font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-500 border-slate-200 line-through opacity-75'
              }`}
            >
              {col.visible ? (
                <CheckSquare className="w-3.5 h-3.5 text-sky-400" />
              ) : (
                <Square className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>{col.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
