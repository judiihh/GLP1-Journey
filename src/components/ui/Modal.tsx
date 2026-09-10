"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { ui } from "@/lib/ui-classes";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Block backdrop, escape, and close button while saving */
  preventClose?: boolean;
  ariaLabel?: string;
}

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  preventClose = false,
  ariaLabel,
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || preventClose) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, preventClose]);

  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 bg-lavender-900/30 backdrop-blur-sm animate-fade-in touch-manipulation"
        onClick={preventClose ? undefined : onClose}
        aria-label="Close dialog"
        tabIndex={-1}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex w-full max-w-md max-h-[min(92dvh,720px)] flex-col overflow-hidden outline-none",
          "rounded-3xl border border-white/80 bg-white/95 shadow-[0_24px_60px_-12px_rgba(120,96,168,0.35)]",
          "ring-1 ring-lavender-100/80 backdrop-blur-md animate-scale-in"
        )}
      >
        <div className="relative shrink-0 border-b border-lavender-100/80 bg-gradient-to-br from-lavender-50/90 via-white to-rose-50/60 px-5 pb-4 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 pr-2">
              <h2 className="font-display text-lg font-bold text-gray-800 sm:text-xl">
                {title}
              </h2>
              <div className={cn(ui.titleUnderline, "mt-2 mb-1")} />
              {subtitle && (
                <p className="text-sm text-gray-500 leading-snug">{subtitle}</p>
              )}
            </div>
            {!preventClose && (
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-full border border-lavender-100 bg-white/80 p-2 text-gray-500 shadow-sm transition-colors hover:bg-lavender-50 hover:text-lavender-600 active:bg-lavender-100 touch-manipulation"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-lavender-100/80 bg-gradient-to-t from-lavender-50/50 to-white px-5 py-4 safe-area-bottom">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
