import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      delete timers.current[id];
    }, 300);
  }, []);

  const addToast = useCallback((message, type = 'error', duration = 3500) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type, exiting: false }]);
    timers.current[id] = setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  const toast = {
    error:   (msg, dur) => addToast(msg, 'error', dur),
    success: (msg, dur) => addToast(msg, 'success', dur),
    info:    (msg, dur) => addToast(msg, 'info', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
  };

  const ICONS = {
    error:   'error',
    success: 'check_circle',
    info:    'info',
    warning: 'warning',
  };

  const COLORS = {
    error:   { bg: '#fef2f2', border: '#fca5a5', icon: '#ef4444', text: '#991b1b' },
    success: { bg: '#f0fdf4', border: '#86efac', icon: '#22c55e', text: '#166534' },
    info:    { bg: '#eff6ff', border: '#93c5fd', icon: '#3b82f6', text: '#1e40af' },
    warning: { bg: '#fffbeb', border: '#fcd34d', icon: '#f59e0b', text: '#92400e' },
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed',
        top: '72px',
        right: '16px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
        maxWidth: '360px',
        width: '100%',
      }}>
        {toasts.map(t => {
          const c = COLORS[t.type];
          return (
            <div
              key={t.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                padding: '12px 14px',
                background: c.bg,
                border: `1px solid ${c.border}`,
                borderRadius: '10px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
                pointerEvents: 'all',
                cursor: 'default',
                opacity: t.exiting ? 0 : 1,
                transform: t.exiting ? 'translateX(20px)' : 'translateX(0)',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                animation: t.exiting ? 'none' : 'toastSlideIn 0.3s ease',
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: c.icon, fontSize: '20px', marginTop: '1px', flexShrink: 0 }}
              >
                {ICONS[t.type]}
              </span>
              <p style={{ margin: 0, fontSize: '14px', color: c.text, lineHeight: '1.45', flex: 1 }}>
                {t.message}
              </p>
              <button
                onClick={() => dismiss(t.id)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: c.text, opacity: 0.6, padding: '0 2px', lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes toastSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
