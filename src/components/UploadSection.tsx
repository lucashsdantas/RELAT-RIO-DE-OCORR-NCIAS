import React, { useState, useRef, ChangeEvent, ClipboardEvent } from 'react';
import {
  ClipboardPaste,
  Upload,
  Trash2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface UploadSectionProps {
  onProcessInput: (rawText: string, clipboardHtml?: string, sourceName?: string) => void;
  onClearData: () => void;
  isProcessing: boolean;
  errorMessage?: string | null;
  warningMessages?: string[];
  hasData: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  onProcessInput,
  onClearData,
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
    // Se já existe uma tabela carregada, bloqueia edição/colagem até limpar
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
        setRawText(content);
        onProcessInput(content, undefined, file.name);
      }
    };
    reader.readAsText(file);
  };

  const handleProcessManual = () => {
    if (hasData || !rawText.trim()) return;
    onProcessInput(rawText, lastClipboardHtml, sourceLabel || 'Dados Colados');
  };

  const handleClearAll = () => {
    setRawText('');
    setLastClipboardHtml(undefined);
    setSourceLabel(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onClearData();
  };

  return (
    <section id="extracao" className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            1. Cole os Dados das Ocorrências
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {hasData
              ? 'Tabela processada e bloqueada contra alterações acidentais. Para inserir novos dados, clique em Limpar Dados.'
              : 'Selecione as ocorrências na página do sistema, copie (Ctrl+C) e cole (Ctrl+V) diretamente abaixo.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
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

          {(rawText || hasData) && (
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

      {/* Campo Principal de Colagem */}
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
          onPaste={handlePaste}
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
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-300 rounded-lg transition-colors cursor-pointer shrink-0"
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
            </>
          )}
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
