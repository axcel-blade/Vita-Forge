/* src/features/resume-builder/components/SharedInputs.jsx */

import React from "react";

export function Label({ children, htmlFor, className = "" }) {
    return (
        <label htmlFor={htmlFor} className={"text-sm font-medium text-gray-700 " + className}>
        {children}
        </label>
    );
}

export function Text({ id, value, onChange, placeholder, className = "" }) {
    return (
        <input
        id={id}
        className={
            "w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 " +
            className
        }
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        />
    );
}

export function TextArea({ id, value, onChange, placeholder, rows = 4 }) {
    return (
        <textarea
        id={id}
        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        />
    );
}

export function IconButton({ title, onClick, children, disabled = false }) {
    return (
        <button
        type="button"
        title={title}
        disabled={disabled}
        className="rounded-xl border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        onClick={onClick}
        >
        {children}
        </button>
    );
}

export function SectionCard({ title, action, children }) {
    return (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold tracking-wide text-gray-700">{title}</h3>
            {action}
        </div>
        {children}
        </div>
    );
}

export function Chip({ children, onRemove }) {
    return (
        <span className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-3 py-1 text-xs">
        {children}
        <button className="text-gray-500 hover:text-red-500" onClick={onRemove} aria-label="Remove">
            ×
        </button>
        </span>
    );
}