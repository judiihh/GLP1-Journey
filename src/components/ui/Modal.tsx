"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

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
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4"
      aria-hidden={!open}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px] animate-fade-in touch-manipulation"
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
          "relative z-10 flex w-full max-h-[92dvh] flex-col bg-white shadow-2xl outline-none",
          "rounded-t-3xl sm:max-w-md sm:rounded-2xl sm:max-h-[min(90dvh,720px)]",
          "animate-slide-up sm:animate-scale-in safe-area-bottom"
        )}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-lavender-100 px-5 pb-4 pt-5 safe-area-top sm:pt-5">
          <div className="min-w-0 pr-2">
            <h2 className="font-display text-lg font-bold text-gray-800 sm:text-xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-500 leading-snug">{subtitle}</p>
            )}
          </div>
          {!preventClose && (
            <button
              type="button"
              onClick={onClose}
              className="shrink-0 rounded-xl p-2.5 text-gray-500 transition-colors hover:bg-lavender-50 active:bg-lavender-100 touch-manipulation"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 border-t border-lavender-100 bg-white px-5 py-4 safe-area-bottom">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
