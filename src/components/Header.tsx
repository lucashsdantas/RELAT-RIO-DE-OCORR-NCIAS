import React from 'react';
import { Download } from 'lucide-react';
import { FIXED_LOGO_URL } from '../utils/sampleData';

interface HeaderProps {
  onExportPortableHtml: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onExportPortableHtml }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Brand Wordmark */}
          <a href="#extracao" className="flex items-center gap-2.5 shrink-0">
            <img
              src={FIXED_LOGO_URL}
              alt="Brasão 4º BBM"
              referrerPolicy="no-referrer"
              className="w-8 h-8 object-contain shrink-0"
            />
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
              Relatórios de Ocorrências
            </span>
          </a>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
            <a
              href="#extracao"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Colar Dados
            </a>
            <a
              href="#configuracao"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Ala e Período
            </a>
            <a
              href="#previa"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Pré-visualização
            </a>
            <a
              href="#seguranca"
              className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
            >
              Privacidade Local
            </a>
          </nav>

          {/* Zone 3: Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onExportPortableHtml}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              title="Baixar arquivo único index.html pronto para GitHub Pages ou uso offline"
            >
              <Download className="w-3.5 h-3.5 text-slate-300" />
              <span>Baixar HTML Portátil</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
