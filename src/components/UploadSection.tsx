import React, { useState, useRef, ChangeEvent, ClipboardEvent } from 'react';
import {
  ClipboardPaste,
  Upload,
  Sparkles,
  Trash2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { SAMPLE_TSV_SOURCE } from '../utils/sampleData';

interface UploadSectionProps {
  onProcessInput: (rawText: string, clipboardHtml?: string, sourceName?: string) => void;
  isProcessing: boolean;
  errorMessage?: string | null;
  warningMessages?: string[];
  hasData: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onProcessInput,
  isProcessing,
  errorMessage,
  warningMessages,
  hasData,
}) => {
  const [rawText, setRawText] = useState<string>('');
  const [lastClipboardHtml, setLastClipboardHtml] = useState<string | undefined>(undefined);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    const plain = e.clipboardData?.getData('text/plain') || '';
    const html = e.clipboardData?.getData('text/html') || '';

    if (plain || html) {
      e.preventDefault();
      const displayValue = plain || html;
      setRawText(displayValue);
      setLastClipboardHtml(html || undefined);
      setSourceLabel('Dados colados da área de transferência');
      onProcessInput(displayValue, html || undefined, 'Dados Colados');
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
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
        setRawText(content);
        onProcessInput(content, undefined, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessManual = () => {
    if (!rawText.trim()) return;
    onProcessInput(rawText, lastClipboardHtml, sourceLabel || 'Dados Colados');
  };

  const handleLoadSample = () => {
    setRawText(SAMPLE_TSV_SOURCE);
    setLastClipboardHtml(undefined);
    setSourceLabel('Exemplo de Plantão (10 ocorrências)');
    onProcessInput(SAMPLE_TSV_SOURCE, undefined, 'Exemplo de Plantão');
  };

  const handleClear = () => {
    setRawText('');
    setLastClipboardHtml(undefined);
    setSourceLabel(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <section id="extracao" className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            1. Cole os Dados das Ocorrências
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecione as ocorrências na página do sistema, copie (Ctrl+C) e cole (Ctrl+V) diretamente abaixo. A tabela será extraída automaticamente.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".html,.htm,.txt,.csv,.tsv"
            onChange={handleFileInputChange}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            title="Opcional: importar um arquivo .html, .csv ou .txt salvo"
          >
            <Upload className="w-3.5 h-3.5 text-slate-500" />
            <span>Importar Arquivo</span>
          </button>

          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Carregar Exemplo</span>
          </button>

          {rawText && (
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              title="Limpar campo de dados"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}
        </div>
      </div>

      {/* Campo Principal de Colagem */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="paste-data-textarea"
            className="text-xs font-semibold text-slate-700 flex items-center gap-1.5"
          >
            <ClipboardPaste className="w-4 h-4 text-slate-500" />
            <span>Campo de Entrada de Dados (Tabela copiada da web, Excel, CSV ou código HTML)</span>
          </label>

          {hasData && sourceLabel && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{sourceLabel}</span>
            </span>
          )}
        </div>

        <textarea
          id="paste-data-textarea"
          value={rawText}
          onPaste={handlePaste}
          onChange={(e) => {
            setRawText(e.target.value);
            setLastClipboardHtml(undefined);
          }}
          placeholder={`Cole aqui com Ctrl+V os registros copiados...\n\nExemplo de colunas reconhecidas automaticamente:\nNÚMERO | DATA REGISTRO | STATUS | DATA FATO | UNIDADES ATUAL | NATUREZAS | MUNICÍPIO | BAIRRO | LOGRADOURO`}
          rows={6}
          className="w-full text-xs font-mono p-3.5 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white resize-y text-slate-800 placeholder:text-slate-400 leading-relaxed"
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 gap-3">
          <span className="text-[11px] text-slate-500">
            {rawText.length > 0
              ? `${rawText.split(/\r?\n/).filter((l) => l.trim()).length} linha(s) no campo · ${rawText.length.toLocaleString('pt-BR')} caracteres`
              : 'Ao colar com Ctrl+V, os dados são processados e pré-visualizados instantaneamente.'}
          </span>

          <button
            type="button"
            onClick={handleProcessManual}
            disabled={!rawText.trim() || isProcessing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-xs transition-colors cursor-pointer shrink-0"
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
      </div>

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
