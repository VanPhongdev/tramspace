import { useEffect, useRef, useState } from 'react';

/**
 * AutocompleteInput — text input với dropdown gợi ý.
 * Props:
 *   value: string
 *   onChange: (value: string) => void
 *   options: string[]      — danh sách gợi ý
 *   placeholder?: string
 *   maxLength?: number
 */
export default function AutocompleteInput({
    value,
    onChange,
    options = [],
    placeholder = '',
    maxLength = 150,
}) {
    const [open, setOpen] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const wrapRef = useRef(null);

    /* Lọc options theo input */
    useEffect(() => {
        if (!value.trim()) { setFiltered([]); return; }
        const q = value.toLowerCase();
        setFiltered(
            options.filter((o) => o.toLowerCase().includes(q)).slice(0, 8)
        );
    }, [value, options]);

    /* Đóng dropdown khi click ra ngoài */
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelect = (option) => {
        onChange(option);
        setOpen(false);
    };

    return (
        <div className="epm-autocomplete-wrap" ref={wrapRef}>
            <input
                className="epm-input"
                type="text"
                value={value}
                onChange={(e) => { onChange(e.target.value); setOpen(true); }}
                onFocus={() => setOpen(true)}
                placeholder={placeholder}
                maxLength={maxLength}
                autoComplete="off"
            />
            {open && filtered.length > 0 && (
                <ul className="epm-autocomplete-list">
                    {filtered.map((option) => (
                        <li
                            key={option}
                            className="epm-autocomplete-item"
                            onMouseDown={() => handleSelect(option)}
                        >
                            {option}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
