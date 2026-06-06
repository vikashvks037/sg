"use client";
import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = "Select...",
  className,
  label,
  error,
  disabled,
}: DropdownProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const listRef = React.useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  React.useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  // Smart positioning: flip to top if not enough space below
  const [dropUp, setDropUp] = React.useState(false);
  React.useEffect(() => {
    if (!open || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const listHeight = Math.min(options.length * 40 + 8, 240);
    setDropUp(spaceBelow < listHeight && rect.top > listHeight);
  }, [open, options.length]);

  const handleSelect = (val: string) => {
    onChange?.(val);
    setOpen(false);
  };

  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div ref={ref} className="relative w-full">
        <button
          type="button"
          onClick={() => !disabled && setOpen((p) => !p)}
          disabled={disabled}
          className={cn(
            "w-full flex items-center justify-between border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#CF1432] focus:border-transparent transition",
            "disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400",
            error && "border-red-400 focus:ring-red-400",
            open && "ring-2 ring-[#CF1432] border-transparent"
          )}
        >
          <span className={cn("truncate text-left", !selected && "text-gray-400")}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-gray-400 flex-shrink-0 ml-2 transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        {open && (
          <ul
            ref={listRef}
            className={cn(
              "absolute left-0 right-0 z-[9999] bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto",
              "max-h-60 py-1",
              dropUp ? "bottom-full mb-1" : "top-full mt-1"
            )}
          >
            {options.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 text-sm text-left hover:bg-gray-50 transition",
                    opt.value === value
                      ? "text-[#CF1432] font-semibold bg-red-50"
                      : "text-gray-700"
                  )}
                >
                  <span>{opt.label}</span>
                  {opt.value === value && (
                    <Check className="w-3.5 h-3.5 flex-shrink-0 text-[#CF1432]" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
