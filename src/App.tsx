/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShieldCheck, FileText, Download, Table2, FileCheck2 } from 'lucide-react';
import {
  ColumnDefinition,
  LogoOption,
  OccurrenceDataset,
  ReportConfig,
} from './types/occurrence';
import {
  MultiPageInputChunk,
  parseMultiPageOccurrenceInputs,
  parseOccurrenceDateToMs,
  parseOccurrenceInput,
  REQUIRED_STANDARD_COLUMNS,
} from './utils/htmlParser';
import {
  createPdfInstance,
  generatePdfBlobUrl,
  generatePdfFileName,
} from './utils/pdfGenerator';
import {
  convertLogoFileToBase64,
  DEFAULT_LOGO_ID,
  FIXED_LOGO_URL,
  loadFixedLogoBase64,
  loadSavedCustomLogos,
  saveCustomLogos,
} from './utils/sampleData';
import {
  buildOccurrenceSummary,
  classifyFilteredRows,
  findColumnKeyByKeyword,
} from './utils/natureSummary';
import { exportStandaloneSingleFileHtml } from './utils/portableExporter';
import { Header } from './components/Header';
import { UploadSection } from './components/UploadSection';
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
    selectedLogoId: DEFAULT_LOGO_ID,
    logoBase64: null,
    showZebra: true,
    repeatHeader: true,
    compactMode: false,
    confidentialityText:
      'DOCUMENTO DE USO CORPORATIVO / RESERVADO • GERADO CLIENT-SIDE VIA SISTEMA DE RELATÓRIOS',
    filterStatus: 'all',
    filterOccurrence: '',
    filterNature: '',
    filterMunicipality: 'all',
    filterDateField: 'any',
    filterStartDateTime: '',
    filterEndDateTime: '',
    searchQuery: '',
  };

  try {
    const raw = localStorage.getItem(STORAGE_CONFIG_KEY);
    if (!raw) return baseConfig;
    const parsed = JSON.parse(raw);
    return {
      ...baseConfig,
      ...parsed,
      selectedLogoId: parsed.selectedLogoId || DEFAULT_LOGO_ID,
      logoBase64: null,
      filterStatus: 'all',
      filterOccurrence: '',
      filterNature: '',
      filterMunicipality: 'all',
      filterDateField: 'any',
      filterStartDateTime: '',
      filterEndDateTime: '',
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

  const [defaultLogoBase64, setDefaultLogoBase64] = useState<string | null>(null);
  const [customLogos, setCustomLogos] = useState<LogoOption[]>(() => loadSavedCustomLogos());
  const [logoError, setLogoError] = useState<string | null>(null);

  const [config, setConfig] = useState<ReportConfig>(() => loadSavedConfig(defaultRange));

  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState<boolean>(false);

  // Carrega a logo institucional padrão em Base64 PNG para o pdfmake
  useEffect(() => {
    let active = true;
    loadFixedLogoBase64().then((base64) => {
      if (active && base64) {
        setDefaultLogoBase64(base64);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const allLogos = useMemo<LogoOption[]>(() => {
    const builtInLogo: LogoOption = {
      id: DEFAULT_LOGO_ID,
      name: 'Brasão Oficial 4º BBM (Padrão)',
      dataUrl: defaultLogoBase64 || FIXED_LOGO_URL,
      sourceUrl: FIXED_LOGO_URL,
      isBuiltIn: true,
    };
    return [builtInLogo, ...customLogos];
  }, [defaultLogoBase64, customLogos]);

  // Mantém config.logoBase64 sincronizado com a logo selecionada
  useEffect(() => {
    if (config.selectedLogoId === DEFAULT_LOGO_ID) {
      setConfig((prev) =>
        prev.logoBase64 === defaultLogoBase64 ? prev : { ...prev, logoBase64: defaultLogoBase64 }
      );
      return;
    }

    const found = customLogos.find((l) => l.id === config.selectedLogoId);
    if (found) {
      setConfig((prev) =>
        prev.logoBase64 === found.dataUrl ? prev : { ...prev, logoBase64: found.dataUrl }
      );
    } else {
      setConfig((prev) => ({
        ...prev,
        selectedLogoId: DEFAULT_LOGO_ID,
        logoBase64: defaultLogoBase64,
      }));
    }
  }, [config.selectedLogoId, customLogos, defaultLogoBase64]);

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
        selectedLogoId: config.selectedLogoId,
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
    config.selectedLogoId,
    config.showZebra,
    config.repeatHeader,
    config.compactMode,
    config.confidentialityText,
  ]);

  const applyParsedDataset = useCallback(
    (parsed: OccurrenceDataset, warnings?: string[]) => {
      const savedHiddenSet = new Set(hiddenColumnLabels.map((l) => l.toUpperCase()));
      const headersWithSavedVisibility = parsed.headers.map((h) => ({
        ...h,
        visible: !savedHiddenSet.has(h.label.toUpperCase()),
      }));

      setDataset({
        ...parsed,
        headers: headersWithSavedVisibility,
      });
      setNatureOverrides({});
      if (warnings && warnings.length > 0) {
        setWarningMessages(warnings);
      }
    },
    [hiddenColumnLabels]
  );

  const handleProcessInput = useCallback(
    (rawText: string, clipboardHtml?: string, sourceName?: string) => {
      setIsProcessing(true);
      setErrorMessage(null);
      setWarningMessages([]);

      setTimeout(() => {
        const result = parseOccurrenceInput(rawText, clipboardHtml, sourceName);
        if (result.success && result.dataset) {
          applyParsedDataset(result.dataset, result.warnings);
        } else {
          setErrorMessage(result.errorMessage || 'Falha ao extrair tabela dos dados informados.');
        }
        setIsProcessing(false);
      }, 100);
    },
    [applyParsedDataset]
  );

  const handleProcessMultiPage = useCallback(
    (pages: MultiPageInputChunk[]) => {
      setIsProcessing(true);
      setErrorMessage(null);
      setWarningMessages([]);

      setTimeout(() => {
        const result = parseMultiPageOccurrenceInputs(pages);
        if (result.success && result.dataset) {
          applyParsedDataset(result.dataset, result.warnings);
        } else {
          setErrorMessage(
            result.errorMessage || 'Falha ao consolidar os dados das páginas informadas.'
          );
        }
        setIsProcessing(false);
      }, 100);
    },
    [applyParsedDataset]
  );

  const handleClearFilters = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      filterStatus: 'all',
      filterOccurrence: '',
      filterNature: '',
      filterMunicipality: 'all',
      filterDateField: 'any',
      filterStartDateTime: '',
      filterEndDateTime: '',
      searchQuery: '',
    }));
  }, []);

  const handleClearData = useCallback(() => {
    setDataset(null);
    setNatureOverrides({});
    setErrorMessage(null);
    setWarningMessages([]);
    handleClearFilters();
  }, [handleClearFilters]);

  const handleChangeConfig = useCallback((newConfig: Partial<ReportConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
  }, []);

  const handleSelectLogo = useCallback(
    (logoId: string) => {
      setLogoError(null);
      if (logoId === DEFAULT_LOGO_ID) {
        setConfig((prev) => ({
          ...prev,
          selectedLogoId: DEFAULT_LOGO_ID,
          logoBase64: defaultLogoBase64,
        }));
        return;
      }
      const found = customLogos.find((l) => l.id === logoId);
      if (found) {
        setConfig((prev) => ({
          ...prev,
          selectedLogoId: found.id,
          logoBase64: found.dataUrl,
        }));
      }
    },
    [customLogos, defaultLogoBase64]
  );

  const handleUploadLogo = useCallback(
    async (file: File) => {
      setLogoError(null);
      if (!file.type.startsWith('image/')) {
        setLogoError('Envie um arquivo de imagem válido (PNG, JPG, WEBP ou SVG).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setLogoError('A imagem selecionada excede 5 MB. Escolha um arquivo menor.');
        return;
      }

      try {
        const dataUrl = await convertLogoFileToBase64(file);
        const cleanName = file.name.replace(/\.[^.]+$/, '') || 'Logo personalizada';
        const newLogo: LogoOption = {
          id: `custom-logo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: cleanName,
          dataUrl,
          isBuiltIn: false,
          addedAt: new Date().toISOString(),
        };
        const updated = [...customLogos, newLogo];
        setCustomLogos(updated);
        saveCustomLogos(updated);
        setConfig((prev) => ({
          ...prev,
          selectedLogoId: newLogo.id,
          logoBase64: newLogo.dataUrl,
        }));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro ao processar a logo enviada.';
        setLogoError(msg);
      }
    },
    [customLogos]
  );

  const handleDeleteLogo = useCallback(
    (logoId: string) => {
      setLogoError(null);
      const updated = customLogos.filter((l) => l.id !== logoId);
      setCustomLogos(updated);
      saveCustomLogos(updated);

      if (config.selectedLogoId === logoId) {
        setConfig((prev) => ({
          ...prev,
          selectedLogoId: DEFAULT_LOGO_ID,
          logoBase64: defaultLogoBase64,
        }));
      }
    },
    [customLogos, config.selectedLogoId, defaultLogoBase64]
  );

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

    const statusColKey = findColumnKeyByKeyword(dataset.headers, ['STATUS', 'SITUACAO']);
    const numColKey = findColumnKeyByKeyword(dataset.headers, ['NÚMERO', 'NUMERO', 'NUM']);
    const natureColKey = findColumnKeyByKeyword(dataset.headers, ['NATUREZA']);
    const munColKey = findColumnKeyByKeyword(dataset.headers, ['MUNICÍPIO', 'MUNICIPIO', 'CIDADE']);
    const factColKey = findColumnKeyByKeyword(dataset.headers, ['DATA FATO', 'FATO']);
    const regColKey = findColumnKeyByKeyword(dataset.headers, ['DATA REGISTRO', 'REGISTRO']);

    const occFilter = config.filterOccurrence.trim().toLowerCase();
    const natureFilter = config.filterNature.trim().toLowerCase();
    const globalFilter = config.searchQuery.trim().toLowerCase();

    const startMs = config.filterStartDateTime
      ? parseOccurrenceDateToMs(config.filterStartDateTime)
      : null;
    const endMs = config.filterEndDateTime
      ? parseOccurrenceDateToMs(config.filterEndDateTime)
      : null;
    const hasDateFilter = startMs !== null || endMs !== null;

    return dataset.rows.filter((row) => {
      if (config.filterStatus !== 'all' && statusColKey) {
        if ((row[statusColKey] || '').trim() !== config.filterStatus) {
          return false;
        }
      }

      if (config.filterMunicipality !== 'all' && munColKey) {
        if ((row[munColKey] || '').trim() !== config.filterMunicipality) {
          return false;
        }
      }

      if (occFilter) {
        const val = numColKey
          ? (row[numColKey] || '').toLowerCase()
          : Object.values(row).join(' ').toLowerCase();
        if (!val.includes(occFilter)) {
          return false;
        }
      }

      if (natureFilter) {
        const val = natureColKey
          ? (row[natureColKey] || '').toLowerCase()
          : Object.values(row).join(' ').toLowerCase();
        if (!val.includes(natureFilter)) {
          return false;
        }
      }

      if (hasDateFilter) {
        const colsToCheck: string[] = [];
        if (config.filterDateField === 'fact' && factColKey) {
          colsToCheck.push(factColKey);
        } else if (config.filterDateField === 'register' && regColKey) {
          colsToCheck.push(regColKey);
        } else {
          if (factColKey) colsToCheck.push(factColKey);
          if (regColKey) colsToCheck.push(regColKey);
        }

        const timestamps = colsToCheck
          .map((k) => parseOccurrenceDateToMs(row[k] || ''))
          .filter((ms): ms is number => ms !== null);

        if (timestamps.length === 0) {
          return false;
        }

        const matchesRange = timestamps.some(
          (ts) => (startMs === null || ts >= startMs) && (endMs === null || ts <= endMs)
        );
        if (!matchesRange) {
          return false;
        }
      }

      if (globalFilter) {
        const matches = Object.values(row).some((val) =>
          (val || '').toLowerCase().includes(globalFilter)
        );
        if (!matches) return false;
      }

      return true;
    });
  }, [
    dataset,
    config.filterStatus,
    config.filterMunicipality,
    config.filterOccurrence,
    config.filterNature,
    config.filterDateField,
    config.filterStartDateTime,
    config.filterEndDateTime,
    config.searchQuery,
  ]);

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
              <span className="font-mono font-semibold text-sky-400">
                4º BBM · Plantão Operacional
              </span>
              <span aria-hidden="true">·</span>
              <span>Configurações e logos salvas automaticamente neste navegador</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Gerador de Relatório de Ocorrências em PDF
            </h1>
            <p className="text-xs text-slate-300 max-w-3xl">
              Cole uma ou várias páginas de ocorrências, escolha a Ala de Serviço (A, B, C ou D),
              ajuste o logotipo e os filtros e gere o PDF com Quadro Resumo operacional e Produtividade.
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

        {/* 1. Colar Dados das Ocorrências (Página Única ou Multipágina) */}
        <UploadSection
          onProcessInput={handleProcessInput}
          onProcessMultiPage={handleProcessMultiPage}
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
          logos={allLogos}
          onSelectLogo={handleSelectLogo}
          onUploadLogo={handleUploadLogo}
          onDeleteLogo={handleDeleteLogo}
          logoError={logoError}
          onChangeConfig={handleChangeConfig}
          onToggleColumn={handleToggleColumn}
          onToggleAllColumns={handleToggleAllColumns}
          onResetColumnsToStandard={handleResetColumnsToStandard}
          onOpenPdfPreview={handleOpenPdfPreview}
          onDownloadPdf={handleDownloadPdf}
          isGeneratingPdf={isGeneratingPdf}
          hasData={Boolean(dataset)}
        />

        {/* 3. Classificação, Natureza Predominante & Produtividade */}
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

              <span className="text-xs text-slate-500 font-mono tabular-nums">
                Ala {config.serviceWing} · {filteredRows.length} atendimento(s) ·{' '}
                {summary.totalConcurrentNatures} natureza(s) · {summary.byGroup.length} grupo(s)
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
                filteredRows={filteredRows}
                config={config}
                onChangeConfig={handleChangeConfig}
                onClearFilters={handleClearFilters}
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
                Todo o processamento ocorre exclusivamente no navegador do operador (arquitetura 100% client-side, sem backend). Os dados das ocorrências nunca são enviados a servidores externos, e suas configurações, colunas e logos enviadas ficam armazenadas apenas localmente no seu navegador.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Sistema de Relatórios Operacionais — 4º BBM</span>
          <div className="flex items-center gap-3">
            <span>
              Orientação: {config.orientation === 'landscape' ? 'Paisagem (A4)' : 'Retrato (A4)'}
            </span>
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
