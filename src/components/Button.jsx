const Button = ({ children, variant = 'primary', type = 'button', onClick, disabled, style }) => {
  const baseStyles = {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    opacity: disabled ? 0.6 : 1,
  };

  const variants = {
    primary: {
      backgroundColor: '#1a365d',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: 'transparent',
      color: '#1a365d',
      border: '1px solid #d1d5db',
    },
    danger: {
      backgroundColor: '#dc2626',
      color: '#ffffff',
    },
    success: {
      backgroundColor: '#059669',
      color: '#ffffff',
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...baseStyles, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
};

export default Button;
