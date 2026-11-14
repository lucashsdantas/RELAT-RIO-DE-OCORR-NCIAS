import React, { useState, useRef, ChangeEvent, ClipboardEvent } from 'react';
import {
  ClipboardPaste,
  Upload,
  Trash2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
  Plus,
  Layers,
  X,
} from 'lucide-react';
import { MultiPageInputChunk } from '../utils/htmlParser';

interface PageDraft {
  id: string;
  rawText: string;
  clipboardHtml?: string;
  sourceLabel?: string;
}

interface UploadSectionProps {
  onProcessInput: (rawText: string, clipboardHtml?: string, sourceName?: string) => void;
  onProcessMultiPage: (pages: MultiPageInputChunk[]) => void;
  onClearData: () => void;
  isProcessing: boolean;
  errorMessage?: string | null;
  warningMessages?: string[];
  hasData: boolean;
}

function createEmptyPage(index: number): PageDraft {
  return {
    id: `page-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 6)}`,
    rawText: '',
  };
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onProcessInput,
  onProcessMultiPage,
  onClearData,
  isProcessing,
  errorMessage,
  warningMessages,
  hasData,
}) => {
  const [entryMode, setEntryMode] = useState<'single' | 'multi'>('single');
  const [rawText, setRawText] = useState<string>('');
  const [lastClipboardHtml, setLastClipboardHtml] = useState<string | undefined>(undefined);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);

  const [pages, setPages] = useState<PageDraft[]>([createEmptyPage(1), createEmptyPage(2)]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePasteSingle = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (hasData) {
      e.preventDefault();
      return;
    }

    const plain = e.clipboardData?.getData('text/plain') || '';
    const html = e.clipboardData?.getData('text/html') || '';

    if (plain || html) {
      e.preventDefault();
      const displayValue = plain || html;
      setRawText(displayValue);
      setLastClipboardHtml(html || undefined);
      setSourceLabel('Tabela colada da área de transferência');
      onProcessInput(displayValue, html || undefined, 'Dados Colados');
    }
  };

  const handlePastePage = (pageId: string, e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (hasData) {
      e.preventDefault();
      return;
    }

    const plain = e.clipboardData?.getData('text/plain') || '';
    const html = e.clipboardData?.getData('text/html') || '';

    if (plain || html) {
      e.preventDefault();
      const displayValue = plain || html;
      setPages((prev) =>
        prev.map((p) =>
          p.id === pageId
            ? {
                ...p,
                rawText: displayValue,
                clipboardHtml: html || undefined,
                sourceLabel: 'Tabela colada',
              }
            : p
        )
      );
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (hasData) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(html|htm|txt|csv|tsv)$/i)) {
      onProcessInput('', undefined, file.name);
      return;
    }

    setSourceLabel(file.name);
    setLastClipboardHtml(undefined);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        if (entryMode === 'single') {
          setRawText(content);
          onProcessInput(content, undefined, file.name);
        } else {
          setPages((prev) => {
            const firstEmptyIdx = prev.findIndex((p) => !p.rawText.trim());
            if (firstEmptyIdx >= 0) {
              return prev.map((p, idx) =>
                idx === firstEmptyIdx
                  ? { ...p, rawText: content, clipboardHtml: undefined, sourceLabel: file.name }
                  : p
              );
            }
            return [
              ...prev,
              {
                id: createEmptyPage(prev.length + 1).id,
                rawText: content,
                sourceLabel: file.name,
              },
            ];
          });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleProcessManual = () => {
    if (hasData) return;
    if (entryMode === 'single') {
      if (!rawText.trim()) return;
      onProcessInput(rawText, lastClipboardHtml, sourceLabel || 'Dados Colados');
    } else {
      const chunks: MultiPageInputChunk[] = pages
        .map((p, idx) => ({
          rawText: p.rawText,
          clipboardHtml: p.clipboardHtml,
          label: `Página ${idx + 1}`,
        }))
        .filter((c) => c.rawText.trim() || (c.clipboardHtml || '').trim());

      if (chunks.length === 0) return;
      onProcessMultiPage(chunks);
    }
  };

  const handleSwitchToMultiFromSingle = () => {
    if (hasData) return;
    setEntryMode('multi');
    if (rawText.trim()) {
      setPages([
        {
          id: createEmptyPage(1).id,
          rawText,
          clipboardHtml: lastClipboardHtml,
          sourceLabel: sourceLabel || 'Página 1',
        },
        createEmptyPage(2),
      ]);
    } else {
      setPages([createEmptyPage(1), createEmptyPage(2)]);
    }
  };

  const handleAddBlankPage = () => {
    if (hasData) return;
    setPages((prev) => [...prev, createEmptyPage(prev.length + 1)]);
  };

  const handleRemovePage = (pageId: string) => {
    if (hasData) return;
    setPages((prev) => (prev.length <= 1 ? prev : prev.filter((p) => p.id !== pageId)));
  };

  const handleClearAll = () => {
    setRawText('');
    setLastClipboardHtml(undefined);
    setSourceLabel(null);
    setPages([createEmptyPage(1), createEmptyPage(2)]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClearData();
  };

  const filledPagesCount = pages.filter((p) => p.rawText.trim()).length;
  const hasAnyContent = entryMode === 'single' ? Boolean(rawText.trim()) : filledPagesCount > 0;

  return (
    <section id="extracao" className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            1. Coleta de Dados das Ocorrências
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {hasData
              ? 'Tabela processada e bloqueada contra alterações acidentais. Para inserir novos dados, clique em Limpar Dados.'
              : entryMode === 'single'
              ? 'Selecione as ocorrências na página do sistema, copie (Ctrl+C) e cole (Ctrl+V) diretamente abaixo.'
              : 'Cole os dados de cada página do sistema nos campos abaixo para somar todas as ocorrências em um único relatório.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Seletor de Modo: Página Única vs Multipágina */}
          {!hasData && (
            <div className="inline-flex items-center p-1 bg-slate-100 border border-slate-200 rounded-lg">
              <button
                type="button"
                onClick={() => setEntryMode('single')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  entryMode === 'single'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Página Única
              </button>
              <button
                type="button"
                onClick={handleSwitchToMultiFromSingle}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                  entryMode === 'multi'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-sky-600" />
                <span>Relatório Multipágina</span>
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm,.txt,.csv,.tsv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {!hasData && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="Opcional: importar um arquivo .html, .csv ou .txt salvo"
            >
              <Upload className="w-3.5 h-3.5 text-slate-500" />
              <span>Importar Arquivo</span>
            </button>
          )}

          {(hasAnyContent || hasData) && (
            <button
              type="button"
              onClick={handleClearAll}
              className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap shadow-xs ${
                hasData
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300'
              }`}
              title="Limpar os dados atuais para colar uma nova tabela"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpar Dados</span>
            </button>
          )}
        </div>
      </div>

      {/* Modo Página Única */}
      {entryMode === 'single' ? (
        <div className="mt-4">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label
              htmlFor="paste-data-textarea"
              className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
            >
              {hasData ? (
                <>
                  <Lock className="w-4 h-4 text-slate-500" />
                  <span>Dados Carregados (Somente Leitura)</span>
                </>
              ) : (
                <>
                  <ClipboardPaste className="w-4 h-4 text-slate-500" />
                  <span>Campo de Entrada de Dados (Tabela copiada da web, Excel, CSV ou código HTML)</span>
                </>
              )}
            </label>

            {hasData && sourceLabel && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{sourceLabel}</span>
              </span>
            )}
          </div>

          <textarea
            id="paste-data-textarea"
            value={rawText}
            readOnly={hasData}
            onPaste={handlePasteSingle}
            onChange={(e) => {
              if (hasData) return;
              setRawText(e.target.value);
              setLastClipboardHtml(undefined);
            }}
            placeholder={`Cole aqui com Ctrl+V os registros copiados...\n\nColunas reconhecidas automaticamente:\nNÚMERO | DATA REGISTRO | STATUS | DATA FATO | UNIDADES ATUAL | NATUREZAS | MUNICÍPIO | BAIRRO | LOGRADOURO`}
            rows={hasData ? 4 : 6}
            className={`w-full text-xs font-mono p-3.5 border rounded-xl focus:outline-none resize-y leading-relaxed transition-colors ${
              hasData
                ? 'bg-slate-100 border-slate-300 text-slate-600 cursor-not-allowed select-all'
                : 'bg-slate-50 border-slate-300 text-slate-800 focus:ring-2 focus:ring-slate-900 focus:bg-white placeholder:text-slate-400'
            }`}
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-3">
            {hasData ? (
              <>
                <span className="text-xs font-medium text-slate-600">
                  Edição bloqueada após processamento. Use o botão <strong className="text-rose-700">Limpar Dados</strong> caso precise colar uma nova tabela.
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Dados e Inserir Novo</span>
                </button>
              </>
            ) : (
              <>
                <span className="text-[11px] text-slate-500">
                  {rawText.length > 0
                    ? `${rawText.split(/\r?\n/).filter((l) => l.trim()).length} linha(s) no campo · ${rawText.length.toLocaleString('pt-BR')} caracteres`
                    : 'Ao colar com Ctrl+V, os dados são processados automaticamente — ou use Relatório Multipágina para somar várias páginas.'}
                </span>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleSwitchToMultiFromSingle}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-3.5 h-3.5 text-sky-700" />
                    <span>Adicionar Mais Dados (Multipágina)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleProcessManual}
                    disabled={!rawText.trim() || isProcessing}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Processando Dados...</span>
                      </>
                    ) : (
                      <>
                        <span>Processar Dados Colados</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        /* Modo Relatório Multipágina */
        <div className="mt-4 space-y-4">
          <div className="space-y-3">
            {pages.map((page, index) => {
              const lineCount = page.rawText
                ? page.rawText.split(/\r?\n/).filter((l) => l.trim()).length
                : 0;
              return (
                <div
                  key={page.id}
                  className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/60 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <label
                      htmlFor={`page-textarea-${page.id}`}
                      className="text-xs font-bold text-slate-800 flex items-center gap-2"
                    >
                      {hasData ? (
                        <Lock className="w-3.5 h-3.5 text-slate-500" />
                      ) : (
                        <ClipboardPaste className="w-3.5 h-3.5 text-sky-700" />
                      )}
                      <span>Página {index + 1}</span>
                      {lineCount > 0 && (
                        <span className="text-[11px] font-mono font-normal text-slate-500">
                          · {lineCount} linha(s)
                        </span>
                      )}
                    </label>

                    {!hasData && pages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemovePage(page.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded transition-colors cursor-pointer whitespace-nowrap"
                        title={`Remover Página ${index + 1}`}
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Remover</span>
                      </button>
                    )}
                  </div>

                  <textarea
                    id={`page-textarea-${page.id}`}
                    value={page.rawText}
                    readOnly={hasData}
                    onPaste={(e) => handlePastePage(page.id, e)}
                    onChange={(e) => {
                      if (hasData) return;
                      const val = e.target.value;
                      setPages((prev) =>
                        prev.map((p) =>
                          p.id === page.id
                            ? { ...p, rawText: val, clipboardHtml: undefined }
                            : p
                        )
                      );
                    }}
                    placeholder={`Cole aqui com Ctrl+V os registros da Página ${index + 1}...`}
                    rows={hasData ? 3 : 4}
                    className={`w-full text-xs font-mono p-3 border rounded-lg focus:outline-none resize-y leading-relaxed transition-colors ${
                      hasData
                        ? 'bg-slate-100 border-slate-300 text-slate-600 cursor-not-allowed select-all'
                        : 'bg-white border-slate-300 text-slate-800 focus:ring-2 focus:ring-slate-900 placeholder:text-slate-400'
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            {hasData ? (
              <>
                <span className="text-xs font-medium text-slate-600">
                  Edição bloqueada após processamento único de {filledPagesCount} página(s). Clique em{' '}
                  <strong className="text-rose-700">Limpar Dados</strong> para inserir um novo lote.
                </span>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors cursor-pointer shrink-0 whitespace-nowrap"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Limpar Dados e Inserir Novo</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleAddBlankPage}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 text-sky-700" />
                  <span>Adicionar Mais Dados (Página {pages.length + 1})</span>
                </button>

                <button
                  type="button"
                  onClick={handleProcessManual}
                  disabled={filledPagesCount === 0 || isProcessing}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Somando e Processando...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        Processar Tudo em Um Relatório ({filledPagesCount}{' '}
                        {filledPagesCount === 1 ? 'página' : 'páginas'})
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error message alert */}
      {errorMessage && (
        <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 text-red-800 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Não foi possível processar os dados:</p>
            <p className="mt-0.5 text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Warning messages */}
      {warningMessages && warningMessages.length > 0 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-900 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            {warningMessages.map((msg, i) => (
              <p key={i}>{msg}</p>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
