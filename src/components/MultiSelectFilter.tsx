import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';

interface MultiSelectFilterProps {
  id: string;
  label: string;
  options: string[];
  selected: string[];
  onChange: (nextSelected: string[]) => void;
  allLabel: string;
  searchPlaceholder?: string;
  monoOptions?: boolean;
}

export const MultiSelectFilter: React.FC<MultiSelectFilterProps> = ({
  id,
  label,
  options,
  selected,
  onChange,
  allLabel,
  searchPlaceholder = 'Buscar opção...',
  monoOptions = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, query]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const toggleOption = (option: string) => {
    if (selectedSet.has(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const handleSelectVisible = () => {
    const merged = new Set(selected);
    filteredOptions.forEach((opt) => merged.add(opt));
    onChange(Array.from(merged));
  };

  const handleClear = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onChange([]);
  };

  const triggerText =
    selected.length === 0
      ? `${allLabel} (${options.length})`
      : selected.length === 1
      ? selected[0]
      : `${selected.length} selecionados`;

  return (
    <div ref={containerRef} className="relative">
      <label htmlFor={id} className="text-[11px] font-bold text-slate-700 block mb-1">
        {label}
      </label>

      <div className="relative flex items-center">
        <button
          id={id}
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded-lg border text-left transition-colors cursor-pointer ${
            selected.length > 0
              ? 'bg-slate-900 text-white border-slate-900 font-semibold'
              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50'
          }`}
        >
          <span className={`truncate ${monoOptions ? 'font-mono' : ''}`}>{triggerText}</span>
          <span className="flex items-center gap-1 shrink-0">
            {selected.length > 0 && (
              <span
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClear();
                  }
                }}
                title="Limpar este filtro"
                className="p-0.5 rounded hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <X className="w-3 h-3" />
              </span>
            )}
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''} ${
                selected.length > 0 ? 'text-sky-300' : 'text-slate-400'
              }`}
            />
          </span>
        </button>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-300 rounded-xl shadow-lg z-30 overflow-hidden">
          {/* Busca interna */}
          <div className="p-2 border-b border-slate-100 bg-slate-50 space-y-1.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={searchPlaceholder}
                autoFocus
                className="w-full pl-7 pr-2 py-1 text-xs bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-800"
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={handleSelectVisible}
                disabled={filteredOptions.length === 0}
                className="font-semibold text-sky-700 hover:text-sky-900 disabled:opacity-40 cursor-pointer"
              >
                Marcar visíveis ({filteredOptions.length})
              </button>
              <button
                type="button"
                onClick={() => handleClear()}
                disabled={selected.length === 0}
                className="font-medium text-rose-700 hover:text-rose-900 disabled:opacity-40 cursor-pointer"
              >
                Limpar ({selected.length})
              </button>
            </div>
          </div>

          {/* Lista de opções com checkbox */}
          <div className="max-h-52 overflow-y-auto divide-y divide-slate-100">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">
                Nenhuma opção encontrada.
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isChecked = selectedSet.has(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => toggleOption(option)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-left transition-colors cursor-pointer ${
                      isChecked
                        ? 'bg-sky-50/70 text-slate-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-white border-slate-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </span>
                    <span className={`truncate ${monoOptions ? 'font-mono' : ''}`} title={option}>
                      {option}
                    </span>
                  </button>
                );
              })
            )}
          </div>

          <div className="px-2.5 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span className="font-mono tabular-nums">
              {selected.length === 0
                ? 'Sem filtro (todos)'
                : `${selected.length} de ${options.length} selecionado(s)`}
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="font-semibold text-slate-900 hover:underline cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
