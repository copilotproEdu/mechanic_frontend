import { useState, useEffect, useRef } from 'react';

type Option = { value: string; label?: string };

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  allowFreeText?: boolean;
}

export default function SearchableSelect({ value, onChange, options, placeholder, allowFreeText = true }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, []);

  const filtered = options.filter(o => (o.label || o.value).toLowerCase().includes(query.toLowerCase()));

  return (
    <div ref={ref} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); if (allowFreeText) onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-700 focus:ring-2 focus:ring-primary-200"
      />

      {open && filtered.length > 0 && (
        <ul className="absolute z-40 left-0 right-0 bg-white border border-gray-200 rounded mt-1 max-h-48 overflow-auto">
          {filtered.map(opt => (
            <li
              key={opt.value}
              onClick={() => { onChange(opt.value); setQuery(opt.label || opt.value); setOpen(false); }}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
            >
              {opt.label || opt.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
