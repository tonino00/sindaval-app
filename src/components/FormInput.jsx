const FormInput = ({ label, error, ...props }) => {
  return (
    <div style={styles.container}>
      {label && <label style={styles.label}>{label}</label>}
      <input
        {...props}
        style={{
          ...styles.input,
          ...(error ? styles.inputError : {}),
        }}
      />
      {error && <span style={styles.error}>{error}</span>}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  error: {
    fontSize: '0.75rem',
    color: '#dc2626',
    fontWeight: '500',
  },
};

export default FormInput;
