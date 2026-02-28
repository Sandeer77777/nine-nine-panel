import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

interface Option {
  id: string;
  name: string;
}

interface MultiSelectTagsProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export default function MultiSelectTags({ options, selected, onChange, placeholder = "Selecione..." }: MultiSelectTagsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const safeSelected = selected || [];
  const safeOptions = options || [];

  const toggleSelection = (id: string) => {
    if (safeSelected.includes(id)) {
      onChange(safeSelected.filter(item => item !== id));
    } else {
      onChange([...safeSelected, id]);
    }
  };

  const filteredOptions = safeOptions.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !safeSelected.includes(option.id)
  );
  
  return (
    <div className="relative" ref={ref}>
      <div 
        className="form-input-dark flex flex-wrap items-center gap-2 min-h-[3rem] cursor-text" 
        onClick={() => setIsOpen(true)}
      >
        {safeSelected.map(id => {
          const option = safeOptions.find(opt => opt.id === id);
          return (
            <div key={id} className="bg-cyan-900/50 text-cyan-200 border border-cyan-800 text-sm font-medium px-3 py-1 rounded-full flex items-center gap-2">
              <span>{option?.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelection(id);
                }}
                className="bg-cyan-500/10 hover:bg-cyan-500/30 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={safeSelected.length === 0 ? placeholder : ''}
          className="bg-transparent flex-grow focus:outline-none p-1"
        />
      </div>
      {isOpen && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-slate-950 border border-slate-700 rounded-lg z-10 max-h-60 overflow-y-auto shadow-2xl">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(option => (
              <div
                key={option.id}
                onClick={() => {
                  toggleSelection(option.id);
                  setSearchTerm('');
                }}
                className="px-4 py-3 cursor-pointer text-slate-300 hover:bg-slate-800"
              >
                {option.name}
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-slate-500">Nenhum resultado encontrado.</div>
          )}
        </div>
      )}
    </div>
  );
}
