"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    custom: (message: string, type?: ToastType, title?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// Global event bus for server actions or client triggers
type ToastListener = (toast: Omit<ToastItem, "id">) => void;
const listeners: ToastListener[] = [];

export const notifyToast = {
  success: (message: string, title?: string) => listeners.forEach((l) => l({ message, title, type: "success" })),
  error: (message: string, title?: string) => listeners.forEach((l) => l({ message, title, type: "error" })),
  warning: (message: string, title?: string) => listeners.forEach((l) => l({ message, title, type: "warning" })),
  info: (message: string, title?: string) => listeners.forEach((l) => l({ message, title, type: "info" })),
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "success", title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { id, message, type, title };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  React.useEffect(() => {
    const handleListener: ToastListener = ({ message, type, title }) => {
      addToast(message, type, title);
    };
    listeners.push(handleListener);
    return () => {
      const idx = listeners.indexOf(handleListener);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, [addToast]);

  const toastMethods = React.useMemo(
    () => ({
      toast: {
        success: (message: string, title?: string) => addToast(message, "success", title || "Success"),
        error: (message: string, title?: string) => addToast(message, "error", title || "Error"),
        warning: (message: string, title?: string) => addToast(message, "warning", title || "Warning"),
        info: (message: string, title?: string) => addToast(message, "info", title || "Notice"),
        custom: (message: string, type: ToastType = "info", title?: string) => addToast(message, type, title),
      },
    }),
    [addToast]
  );

  return (
    <ToastContext.Provider value={toastMethods}>
      {children}
      
      {/* Toast Alert Container - Fixed at Bottom Right */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in slide-in-from-bottom-5 fade-in ${
              item.type === "success"
                ? "bg-slate-900/95 text-white border-emerald-500/50 shadow-emerald-950/20"
                : item.type === "error"
                ? "bg-slate-900/95 text-white border-red-500/50 shadow-red-950/20"
                : item.type === "warning"
                ? "bg-slate-900/95 text-white border-amber-500/50 shadow-amber-950/20"
                : "bg-slate-900/95 text-white border-blue-500/50 shadow-slate-950/20"
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {item.type === "success" && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {item.type === "error" && <XCircle className="w-5 h-5 text-red-400" />}
              {item.type === "warning" && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {item.type === "info" && <Info className="w-5 h-5 text-blue-400" />}
            </div>

            <div className="flex-1 space-y-0.5">
              {item.title && <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">{item.title}</h4>}
              <p className="text-xs leading-relaxed font-medium text-slate-100">{item.message}</p>
            </div>

            <button
              type="button"
              onClick={() => removeToast(item.id)}
              className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context.toast;
}
