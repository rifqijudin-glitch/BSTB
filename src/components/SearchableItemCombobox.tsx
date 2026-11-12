import React, { useState, useRef, useEffect, useMemo } from 'react';
import { MASTER_ITEMS_B3, CatalogItem } from '../utils/itemCatalog';

interface SearchableItemComboboxProps {
  id?: string;
  value: string;
  selectedCode?: string;
  placeholder?: string;
  onSelect: (item: CatalogItem) => void;
  required?: boolean;
  disabled?: boolean;
}

export const SearchableItemCombobox: React.FC<SearchableItemComboboxProps> = ({
  id,
  value,
  selectedCode,
  placeholder = '-- Pilih / Cari Nama Barang --',
  onSelect,
  required = false,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync internal display text when external value changes
  useEffect(() => {
    setSearchTerm(value || '');
  }, [value]);

  // Handle outside click to close dropdown and lock in valid master item
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        const currentTrimmed = searchTerm.trim().toLowerCase();

        // Cari pencocokan persis di master
        const exactMatch = MASTER_ITEMS_B3.find(
          (m) => m.name.toLowerCase() === currentTrimmed || m.code.toLowerCase() === currentTrimmed
        );

        if (exactMatch) {
          onSelect(exactMatch);
          setSearchTerm(exactMatch.name);
        } else if (selectedCode) {
          const matchedByCode = MASTER_ITEMS_B3.find((m) => m.code === selectedCode);
          if (matchedByCode) {
            onSelect(matchedByCode);
            setSearchTerm(matchedByCode.name);
          } else {
            setSearchTerm(value || '');
          }
        } else {
          setSearchTerm(value || '');
        }
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [searchTerm, selectedCode, value, onSelect]);

  // Filter master items based on search term
  const filteredList = useMemo(() => {
    if (!searchTerm.trim()) {
      return MASTER_ITEMS_B3;
    }
    const q = searchTerm.trim().toLowerCase();
    const matches = MASTER_ITEMS_B3.filter(
      (item) => item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q)
    );
    // If no direct query match, show all options so user is never stranded
    return matches.length > 0 ? matches : MASTER_ITEMS_B3;
  }, [searchTerm]);

  const handleSelectOption = (item: CatalogItem) => {
    onSelect(item);
    setSearchTerm(item.name);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    if (disabled) return;
    if (!isOpen) {
      setIsOpen(true);
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    } else {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* INPUT FIELD PERSIS SEPERTI GAMBAR CONTOH DENGAN PANAH HITAM SEGITIGA DI KANAN */}
      <div className="relative flex items-center">
        <input
          ref={inputRef}
          id={id}
          type="text"
          required={required}
          disabled={disabled}
          value={searchTerm}
          autoComplete="off"
          placeholder={placeholder}
          onClick={() => setIsOpen(true)}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            } else if (e.key === 'ArrowDown') {
              e.preventDefault();
              setIsOpen(true);
            } else if (e.key === 'Enter') {
              e.preventDefault();
              if (filteredList.length > 0) {
                handleSelectOption(filteredList[0]);
              }
            }
          }}
          className="w-full bg-white border border-slate-300 hover:border-slate-400 rounded-md px-3 py-1.5 pr-8 text-xs font-semibold text-slate-800 outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-500 shadow-2xs transition-all cursor-text"
        />

        {/* PANAH DROPDOWN SEGITIGA HITAM PERSIS GAMBAR CONTOH */}
        <button
          type="button"
          tabIndex={-1}
          disabled={disabled}
          onClick={toggleDropdown}
          className="absolute right-0 top-0 bottom-0 px-2.5 flex items-center justify-center text-slate-800 hover:text-black cursor-pointer bg-transparent"
          title="Buka daftar pilihan nama barang"
        >
          <span className="text-[10px] select-none leading-none transform active:scale-95 transition-transform">
            ▼
          </span>
        </button>
      </div>

      {/* FLOATING DROPDOWN LIST PERSIS GAMBAR CONTOH */}
      {isOpen && !disabled && (
        <div
          className="absolute left-0 top-full mt-1 z-[999] min-w-[340px] max-w-[500px] w-full bg-white border border-slate-200 rounded-lg shadow-2xl max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs py-1"
          style={{
            boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.2), 0 6px 12px -2px rgba(0, 0, 0, 0.1)'
          }}
        >
          {filteredList.map((item) => {
            const isSelected =
              item.name.toLowerCase() === value.toLowerCase() ||
              (selectedCode && item.code.toLowerCase() === selectedCode.toLowerCase());

            return (
              <button
                key={item.code}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSelectOption(item);
                }}
                className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 text-blue-900 font-bold'
                    : 'hover:bg-slate-100 text-slate-800 font-medium'
                }`}
              >
                <span className="text-[11.5px] uppercase tracking-wide leading-snug">
                  {item.name}
                </span>

                <span className="shrink-0 font-mono text-[10.5px] font-bold text-slate-700 bg-slate-100 border border-slate-300 px-1.5 py-0.5 rounded">
                  {item.code}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
