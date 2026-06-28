import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy',
    danger: false,
    resolve: null,
  });

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        title: options.title || 'Xác nhận',
        message: options.message || 'Bạn có chắc chắn muốn thực hiện hành động này?',
        confirmText: options.confirmText || 'Xác nhận',
        cancelText: options.cancelText || 'Hủy',
        danger: options.danger || false,
        resolve,
      });
    });
  }, []);

  const handleClose = useCallback((value) => {
    setConfirmState((prev) => {
      if (prev.resolve) prev.resolve(value);
      return { ...prev, isOpen: false };
    });
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      <AnimatePresence>
        {confirmState.isOpen && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(244, 244, 245, 0.8)',
            zIndex: 10000,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'var(--color-background)',
                padding: '24px',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '400px',
                boxShadow: '0 12px 28px rgba(0,0,0,0.2)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}
            >
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: 'var(--color-text)' }}>
                {confirmState.title}
              </h3>
              <p style={{ margin: 0, fontSize: '15px', color: 'var(--color-text-light)', lineHeight: 1.5 }}>
                {confirmState.message}
              </p>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button
                  onClick={() => handleClose(false)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: '#e4e6eb',
                    color: '#050505',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {confirmState.cancelText}
                </button>
                <button
                  onClick={() => handleClose(true)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    background: confirmState.danger ? '#e41e3f' : 'var(--color-primary)',
                    color: 'white',
                    fontSize: '15px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {confirmState.confirmText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm must be used within a ConfirmProvider');
  return context;
}
