import { useEffect, useRef, useState } from 'react';

const InputModal = ({ isOpen, onClose, onConfirm, title, description, placeholder, maxLength = 6, inputType = 'text' }) => {
  const [value, setValue] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setValue('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onConfirm(value);
      setValue('');
    }
  };

  const handleCancel = () => {
    setValue('');
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleCancel}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{title}</h3>
          <button
            onClick={handleCancel}
            style={styles.closeButton}
            aria-label="Fechar"
          >
            ✕
          </button>
        </div>

        {description && (
          <p style={styles.description}>{description}</p>
        )}

        <form onSubmit={handleSubmit}>
          <input
            ref={inputRef}
            type={inputType}
            value={value}
            onChange={(e) => {
              const newValue = e.target.value;
              if (inputType === 'text' && maxLength) {
                setValue(newValue.replace(/\D/g, '').slice(0, maxLength));
              } else {
                setValue(newValue);
              }
            }}
            placeholder={placeholder}
            style={styles.input}
            maxLength={maxLength}
            onKeyDown={handleKeyDown}
          />

          <div style={styles.actions}>
            <button
              type="button"
              onClick={handleCancel}
              style={styles.cancelButton}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!value.trim()}
              style={{
                ...styles.confirmButton,
                ...(value.trim() ? {} : styles.buttonDisabled),
              }}
            >
              Confirmar
            </button>
          </div>
        </form>
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
    maxWidth: '450px',
    padding: '1.5rem',
    animation: 'slideUp 0.3s ease-out',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#1a365d',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0.25rem',
    lineHeight: 1,
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.375rem',
    transition: 'all 0.2s',
  },
  description: {
    color: '#6b7280',
    fontSize: '0.9375rem',
    marginBottom: '1.25rem',
    lineHeight: '1.5',
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    fontSize: '1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    textAlign: 'center',
    letterSpacing: '4px',
    fontWeight: '600',
  },
  actions: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginTop: '1.25rem',
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
    backgroundColor: '#1a365d',
    color: '#ffffff',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};

export default InputModal;
