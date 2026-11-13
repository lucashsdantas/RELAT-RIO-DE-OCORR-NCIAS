import React, { useEffect } from 'react';
import { X, Download, ExternalLink, Printer, FileText, CheckCircle2 } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  blobUrl: string | null;
  fileName: string;
  onDownload: () => void;
  onOpenNewTab: () => void;
  onPrint: () => void;
  isLandscape: boolean;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  blobUrl,
  fileName,
  onDownload,
  onOpenNewTab,
  onPrint,
  isLandscape,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden">
        {/* Top bar of modal */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 truncate">
            <div className="w-7 h-7 rounded-md bg-slate-800 flex items-center justify-center text-sky-400">
              <FileText className="w-4 h-4" />
            </div>
            <div className="truncate">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                Prévia Oficial do Relatório em PDF
              </h3>
              <span className="text-[11px] font-mono text-slate-400 truncate block">
                {fileName} • {isLandscape ? 'Orientação Paisagem' : 'Orientação Retrato'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Imprimir documento"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Imprimir</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewTab}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              title="Abrir PDF em nova aba do navegador"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nova Aba</span>
            </button>

            <button
              type="button"
              onClick={onDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors cursor-pointer shadow-xs"
              title="Baixar arquivo PDF diretamente"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Baixar PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer ml-1"
              title="Fechar prévia (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Viewport */}
        <div className="flex-1 bg-slate-100 p-2 sm:p-4 flex items-center justify-center overflow-hidden">
          {blobUrl ? (
            <iframe
              src={blobUrl}
              title="Prévia do Relatório PDF"
              className="w-full h-full rounded-lg bg-white shadow-md border border-slate-300"
            />
          ) : (
            <div className="text-center p-8">
              <div className="w-8 h-8 border-3 border-slate-800 border-t-sky-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-xs text-slate-600 font-medium">Carregando visualização do PDF...</p>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>PDF gerado com cabeçalho fixo, paginação dinâmica e suporte a anexação oficial.</span>
          </div>
          <div>
            Pressione <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-[10px]">ESC</kbd> para fechar
          </div>
        </div>
      </div>
    </div>
  );
};
