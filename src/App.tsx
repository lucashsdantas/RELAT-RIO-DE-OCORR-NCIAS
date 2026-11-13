/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShieldCheck, FileText, Download, Table2, FileCheck2 } from 'lucide-react';
import { ColumnDefinition, OccurrenceDataset, ReportConfig } from './types/occurrence';
import { parseOccurrenceInput, REQUIRED_STANDARD_COLUMNS } from './utils/htmlParser';
import {
  createPdfInstance,
  generatePdfBlobUrl,
  generatePdfFileName,
} from './utils/pdfGenerator';
import { loadFixedLogoBase64 } from './utils/sampleData';
import { classifyFilteredRows, buildOccurrenceSummary } from './utils/natureSummary';
import { exportStandaloneSingleFileHtml } from './utils/portableExporter';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
import { StatsCards } from './components/StatsCards';
import { ConfigPanel } from './components/ConfigPanel';
import { NatureClassificationPanel } from './components/NatureClassificationPanel';
import { DataTable } from './components/DataTable';
import { DocumentPreview } from './components/DocumentPreview';
import { PdfPreviewModal } from './components/PdfPreviewModal';

const STORAGE_CONFIG_KEY = 'relatorio_ocorrencias_config_v1';
const STORAGE_HIDDEN_COLS_KEY = 'relatorio_ocorrencias_hidden_cols_v1';

function getDefaultShiftRange(): { start: string; end: string } {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatDay = (d: Date, time: string) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${time}`;

  return {
    start: formatDay(yesterday, '07:00'),
    end: formatDay(now, '07:00'),
  };
}

function loadSavedConfig(defaultRange: { start: string; end: string }): ReportConfig {
  const baseConfig: ReportConfig = {
    title: 'RELATÓRIO OPERACIONAL DE ATENDIMENTOS E OCORRÊNCIAS',
    subtitle: '4º Batalhão de Bombeiros Militar — Controle Operacional',
    department: 'B-3 / Coordenação Operacional',
    serviceWing: 'A',
    startDateTime: defaultRange.start,
    endDateTime: defaultRange.end,
    orientation: 'landscape',
    logoBase64: null,
    showZebra: true,
    repeatHeader: true,
    compactMode: false,
    confidentialityText:
      'DOCUMENTO DE USO CORPORATIVO / RESERVADO • GERADO CLIENT-SIDE VIA SISTEMA DE RELATÓRIOS',
    filterStatus: 'all',
    searchQuery: '',
  };

  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (!raw) return baseConfig;
    const parsed = JSON.parse(raw);
    return {
      ...baseConfig,
      ...parsed,
      logoBase64: null, // Logo é carregada separadamente da URL fixa
      filterStatus: 'all',
      searchQuery: '',
    };
  } catch {
    return baseConfig;
  }
}

function loadHiddenColumnLabels(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_HIDDEN_COLS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHiddenColumnLabels(labels: string[]) {
  try {
    localStorage.setItem(STORAGE_HIDDEN_COLS_KEY, JSON.stringify(labels));
  } catch {
    // Ignora falha de quota ou modo privado
  }
}

export default function App() {
  const defaultRange = useMemo(() => getDefaultShiftRange(), []);

  const [dataset, setDataset] = useState<OccurrenceDataset | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [warningMessages, setWarningMessages] = useState<string[]>([]);
  const [previewTab, setPreviewTab] = useState<'document' | 'table'>('document');
  const [natureOverrides, setNatureOverrides] = useState<Record<number, string>>({});
  const [hiddenColumnLabels, setHiddenColumnLabels] = useState<string[]>(() =>
    loadHiddenColumnLabels()
  );

  const [config, setConfig] = useState<ReportConfig>(() => loadSavedConfig(defaultRange));

  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Carrega a logo institucional fixa em Base64 PNG para o pdfmake
  useEffect(() => {
    let active = true;
    loadFixedLogoBase64().then((base64) => {
      if (active && base64) {
        setConfig((prev) => ({ ...prev, logoBase64: base64 }));
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Salva automaticamente as configurações e parâmetros no localStorage sempre que alterados
  useEffect(() => {
    try {
      const toPersist = {
        title: config.title,
        subtitle: config.subtitle,
        department: config.department,
        serviceWing: config.serviceWing,
        startDateTime: config.startDateTime,
        endDateTime: config.endDateTime,
        orientation: config.orientation,
        showZebra: config.showZebra,
        repeatHeader: config.repeatHeader,
        compactMode: config.compactMode,
        confidentialityText: config.confidentialityText,
      };
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(toPersist));
    } catch {
      // Ignora erro caso armazenamento esteja indisponível
    }
  }, [
    config.title,
    config.subtitle,
    config.department,
    config.serviceWing,
    config.startDateTime,
    config.endDateTime,
    config.orientation,
    config.showZebra,
    config.repeatHeader,
    config.compactMode,
    config.confidentialityText,
  ]);

  const handleProcessInput = useCallback(
    (rawText: string, clipboardHtml?: string, sourceName?: string) => {
      setIsProcessing(true);
      setErrorMessage(null);
      setWarningMessages([]);

      setTimeout(() => {
        const result = parseOccurrenceInput(rawText, clipboardHtml, sourceName);
        if (result.success && result.dataset) {
          // Aplica as preferências salvas de colunas ocultas
          const savedHiddenSet = new Set(hiddenColumnLabels.map((l) => l.toUpperCase()));
          const headersWithSavedVisibility = result.dataset.headers.map((h) => ({
            ...h,
            visible: !savedHiddenSet.has(h.label.toUpperCase()),
          }));

          setDataset({
            ...result.dataset,
            headers: headersWithSavedVisibility,
          });
          setNatureOverrides({});
          if (result.warnings && result.warnings.length > 0) {
            setWarningMessages(result.warnings);
          }
        } else {
          setErrorMessage(result.errorMessage || 'Falha ao extrair tabela dos dados informados.');
        }
        setIsProcessing(false);
      }, 100);
    },
    [hiddenColumnLabels]
  );

  const handleClearData = useCallback(() => {
    setDataset(null);
    setNatureOverrides({});
    setErrorMessage(null);
    setWarningMessages([]);
    setConfig((prev) => ({ ...prev, filterStatus: 'all', searchQuery: '' }));
  }, []);

  const handleChangeConfig = useCallback((newConfig: Partial<ReportConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const syncHiddenColumnsFromHeaders = useCallback((headers: ColumnDefinition[]) => {
    const nextHidden = headers.filter((h) => !h.visible).map((h) => h.label);
    setHiddenColumnLabels(nextHidden);
    saveHiddenColumnLabels(nextHidden);
  }, []);

  const handleToggleColumn = useCallback(
    (key: string) => {
      if (dataset) {
        const nextHeaders = dataset.headers.map((h) =>
          h.key === key ? { ...h, visible: !h.visible } : h
        );
        setDataset({ ...dataset, headers: nextHeaders });
        syncHiddenColumnsFromHeaders(nextHeaders);
      } else {
        const label = key;
        const exists = hiddenColumnLabels.includes(label);
        const nextHidden = exists
          ? hiddenColumnLabels.filter((l) => l !== label)
          : [...hiddenColumnLabels, label];
        setHiddenColumnLabels(nextHidden);
        saveHiddenColumnLabels(nextHidden);
      }
    },
    [dataset, hiddenColumnLabels, syncHiddenColumnsFromHeaders]
  );

  const handleToggleAllColumns = useCallback(
    (visible: boolean) => {
      if (dataset) {
        const nextHeaders = dataset.headers.map((h) => ({ ...h, visible }));
        setDataset({ ...dataset, headers: nextHeaders });
        syncHiddenColumnsFromHeaders(nextHeaders);
      } else {
        const nextHidden = visible ? [] : [...REQUIRED_STANDARD_COLUMNS];
        setHiddenColumnLabels(nextHidden);
        saveHiddenColumnLabels(nextHidden);
      }
    },
    [dataset, syncHiddenColumnsFromHeaders]
  );

  const handleResetColumnsToStandard = useCallback(() => {
    if (dataset) {
      const nextHeaders = dataset.headers.map((h) => {
        const isStd = REQUIRED_STANDARD_COLUMNS.some((std) =>
          h.label.toUpperCase().includes(std.toUpperCase())
        );
        return { ...h, visible: isStd };
      });
      setDataset({ ...dataset, headers: nextHeaders });
      syncHiddenColumnsFromHeaders(nextHeaders);
    } else {
      setHiddenColumnLabels([]);
      saveHiddenColumnLabels([]);
    }
  }, [dataset, syncHiddenColumnsFromHeaders]);

  // Colunas exibidas no ConfigPanel (reais quando carregado, ou as 9 padrões antes de colar)
  const activePanelColumns: ColumnDefinition[] = useMemo(() => {
    if (dataset) return dataset.headers;
    const hiddenSet = new Set(hiddenColumnLabels.map((l) => l.toUpperCase()));
    return REQUIRED_STANDARD_COLUMNS.map((label) => ({
      key: label,
      label,
      visible: !hiddenSet.has(label.toUpperCase()),
      isStandard: true,
    }));
  }, [dataset, hiddenColumnLabels]);

  const filteredRows = useMemo(() => {
    if (!dataset) return [];

    return dataset.rows.filter((row) => {
      if (config.filterStatus !== 'all') {
        const statusCol = dataset.headers.find((h) => h.label.toUpperCase().includes('STATUS'));
        if (statusCol && row[statusCol.key]?.trim() !== config.filterStatus) {
          return false;
        }
      }

      if (config.searchQuery.trim()) {
        const q = config.searchQuery.toLowerCase();
        const matches = Object.values(row).some((val) => val.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  }, [dataset, config.filterStatus, config.searchQuery]);

  const classifications = useMemo(() => {
    if (!dataset) return [];
    return classifyFilteredRows(dataset.rows, filteredRows, dataset.headers, natureOverrides);
  }, [dataset, filteredRows, natureOverrides]);

  const summary = useMemo(() => {
    return buildOccurrenceSummary(classifications);
  }, [classifications]);

  const handleSelectPredominantNature = useCallback((rowIndex: number, catalogEntryId: string) => {
    setNatureOverrides((prev) => ({ ...prev, [rowIndex]: catalogEntryId }));
  }, []);

  const handleResetOverride = useCallback((rowIndex: number) => {
    setNatureOverrides((prev) => {
      const next = { ...prev };
      delete next[rowIndex];
      return next;
    });
  }, []);

  const handleResetAllOverrides = useCallback(() => {
    setNatureOverrides({});
  }, []);

  const handleOpenPdfPreview = async () => {
    if (!dataset) return;
    try {
      setIsGeneratingPdf(true);
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
      const blobUrl = await generatePdfBlobUrl(dataset, config, filteredRows, summary);
      setPdfBlobUrl(blobUrl);
      setIsPdfModalOpen(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage('Erro ao gerar prévia do PDF: ' + msg);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!dataset) return;
    try {
      setIsGeneratingPdf(true);
      const pdf = createPdfInstance(dataset, config, filteredRows, summary);
      const fileName = generatePdfFileName(config.title, config.serviceWing);
      pdf.download(fileName);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage('Erro ao baixar o PDF: ' + msg);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleOpenNewTab = () => {
    if (!dataset) return;
    try {
      const pdf = createPdfInstance(dataset, config, filteredRows, summary);
      pdf.open();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage('Erro ao abrir PDF: ' + msg);
    }
  };

  const handlePrintPdf = () => {
    if (!dataset) return;
    try {
      const pdf = createPdfInstance(dataset, config, filteredRows, summary);
      pdf.print();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage('Erro ao imprimir PDF: ' + msg);
    }
  };

  const handleExportPortableHtml = () => {
    exportStandaloneSingleFileHtml();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      <Header onExportPortableHtml={handleExportPortableHtml} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Inicial Direto */}
        <div className="bg-slate-900 text-white rounded-xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="font-mono font-semibold text-sky-400">4º BBM · Plantão Operacional</span>
              <span aria-hidden="true">·</span>
              <span>Configurações salvas automaticamente neste navegador</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Gerador de Relatório de Ocorrências em PDF
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl">
              Cole os dados copiados da página de ocorrências, ajuste a Ala de Serviço (A, B, C ou D) e o intervalo de data/hora, confirme a natureza predominante quando necessário e baixe o PDF com o Quadro Resumo.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {dataset && (
              <button
                type="button"
                onClick={handleOpenPdfPreview}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-900 bg-sky-400 hover:bg-sky-300 rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <FileText className="w-4 h-4" />
                <span>Visualizar PDF Oficial</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleExportPortableHtml}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="Exportar como arquivo único index.html para GitHub Pages"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Baixar HTML Portátil</span>
            </button>
          </div>
        </div>

        {/* 1. Colar Dados das Ocorrências */}
        <UploadSection
          onProcessInput={handleProcessInput}
          onClearData={handleClearData}
          isProcessing={isProcessing}
          errorMessage={errorMessage}
          warningMessages={warningMessages}
          hasData={Boolean(dataset)}
        />

        {/* 2. Parâmetros sempre disponíveis e persistidos no navegador */}
        <ConfigPanel
          config={config}
          columns={activePanelColumns}
          onChangeConfig={handleChangeConfig}
          onToggleColumn={handleToggleColumn}
          onToggleAllColumns={handleToggleAllColumns}
          onResetColumnsToStandard={handleResetColumnsToStandard}
          onOpenPdfPreview={handleOpenPdfPreview}
          onDownloadPdf={handleDownloadPdf}
          isGeneratingPdf={isGeneratingPdf}
          hasData={Boolean(dataset)}
        />

        {/* 3. Contadores Rápidos */}
        {dataset && <StatsCards dataset={dataset} filteredCount={filteredRows.length} />}

        {/* 4. Classificação & Natureza Predominante */}
        {dataset && (
          <NatureClassificationPanel
            allRows={dataset.rows}
            headers={dataset.headers}
            classifications={classifications}
            summary={summary}
            overrides={natureOverrides}
            onSelectPredominantNature={handleSelectPredominantNature}
            onResetOverride={handleResetOverride}
            onResetAllOverrides={handleResetAllOverrides}
          />
        )}

        {/* 5. Alternador de Pré-visualização antes de gerar o documento */}
        {dataset && (
          <div id="previa" className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="inline-flex items-center gap-1 p-1 bg-slate-200/80 rounded-lg self-start">
                <button
                  type="button"
                  onClick={() => setPreviewTab('document')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    previewTab === 'document'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Pré-visualização do Documento</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewTab('table')}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    previewTab === 'table'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Table2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Conferência e Filtros ({filteredRows.length})</span>
                </button>
              </div>

              <span className="text-xs text-slate-500 font-mono">
                Ala {config.serviceWing} · {filteredRows.length} ocorrência(s) · {summary.byGroup.length} grupo(s) no resumo
              </span>
            </div>

            {previewTab === 'document' ? (
              <DocumentPreview
                dataset={dataset}
                config={config}
                filteredRows={filteredRows}
                summary={summary}
                onOpenPdfPreview={handleOpenPdfPreview}
                onDownloadPdf={handleDownloadPdf}
                isGeneratingPdf={isGeneratingPdf}
              />
            ) : (
              <DataTable
                dataset={dataset}
                searchQuery={config.searchQuery}
                onSearchChange={(q) => handleChangeConfig({ searchQuery: q })}
                statusFilter={config.filterStatus}
                onStatusFilterChange={(s) => handleChangeConfig({ filterStatus: s })}
                onOpenPdfPreview={handleOpenPdfPreview}
                onDownloadPdf={handleDownloadPdf}
                isGeneratingPdf={isGeneratingPdf}
              />
            )}
          </div>
        )}

        {/* 6. Segurança Local */}
        <section id="seguranca" className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Sigilo Operacional e Hospedagem Estática (GitHub Pages)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Todo o processamento ocorre exclusivamente no navegador do operador (arquitetura 100% client-side, sem backend). Os dados das ocorrências nunca são enviados a servidores externos, e apenas as preferências de cabeçalho/colunas ficam armazenadas localmente no seu navegador.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Sistema de Relatórios Operacionais — 4º BBM</span>
          <div className="flex items-center gap-3">
            <span>Orientação: {config.orientation === 'landscape' ? 'Paisagem (A4)' : 'Retrato (A4)'}</span>
            <span>·</span>
            <span>Motor: pdfmake v0.2.10</span>
          </div>
        </div>
      </footer>

      <PdfPreviewModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        blobUrl={pdfBlobUrl}
        fileName={generatePdfFileName(config.title, config.serviceWing)}
        onDownload={handleDownloadPdf}
        onOpenNewTab={handleOpenNewTab}
        onPrint={handlePrintPdf}
        isLandscape={config.orientation === 'landscape'}
      />
    </div>
  );
}
