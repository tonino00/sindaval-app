import { useEffect } from 'react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', variant = 'danger' }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'Enter') {
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onConfirm]);

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: '⚠️',
      confirmBg: '#dc2626',
      confirmHoverBg: '#b91c1c',
    },
    warning: {
      icon: '⚡',
      confirmBg: '#f59e0b',
      confirmHoverBg: '#d97706',
    },
    info: {
      icon: 'ℹ️',
      confirmBg: '#1a365d',
      confirmHoverBg: '#0f2847',
    },
  };

  const currentVariant = variantStyles[variant] || variantStyles.danger;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.iconContainer}>
          <span style={styles.icon}>{currentVariant.icon}</span>
        </div>

        <h3 style={styles.title}>{title}</h3>
        <p style={styles.message}>{message}</p>

        <div style={styles.actions}>
          <button
            onClick={onClose}
            style={styles.cancelButton}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              ...styles.confirmButton,
              backgroundColor: currentVariant.confirmBg,
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
    animation: 'fadeIn 0.2s ease-out',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '90%',
    maxWidth: '420px',
    padding: '2rem',
    animation: 'slideUp 0.3s ease-out',
    textAlign: 'center',
  },
  iconContainer: {
    width: '64px',
    height: '64px',
    margin: '0 auto 1.25rem',
    backgroundColor: '#fef2f2',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: '2rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1a202c',
    margin: '0 0 0.75rem 0',
  },
  message: {
    color: '#6b7280',
    fontSize: '0.9375rem',
    marginBottom: '1.75rem',
    lineHeight: '1.6',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  },
  cancelButton: {
    padding: '0.75rem 1rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    border: '2px solid #e5e7eb',
    backgroundColor: '#ffffff',
    color: '#374151',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  confirmButton: {
    padding: '0.75rem 1rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    border: 'none',
    color: '#ffffff',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default ConfirmModal;
