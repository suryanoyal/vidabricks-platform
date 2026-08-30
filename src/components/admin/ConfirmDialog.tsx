'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  isDestructive = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-vb-card border border-vb-border rounded-2xl p-6 shadow-2xl space-y-4">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-vb-navy text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-display">{title}</h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="pt-3 border-t border-vb-border flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl bg-vb-navy hover:bg-vb-border border border-vb-border text-slate-300 text-xs font-semibold transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-500 text-white'
                : 'bg-vb-gold hover:bg-vb-gold-light text-vb-black'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
