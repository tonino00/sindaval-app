import { useLocation, Link } from 'react-router-dom';

const CheckEmail = () => {
  const location = useLocation();
  const email = location.state?.email || '';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.iconContainer}>
          <svg
            style={styles.icon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        <h1 style={styles.title}>Verifique seu email</h1>
        
        <p style={styles.message}>
          Enviamos instruções para redefinir sua senha para:
        </p>
        
        {email && (
          <p style={styles.email}>{email}</p>
        )}

        <p style={styles.instructions}>
          Clique no link que enviamos para redefinir sua senha. 
          O link expira em 1 hora.
        </p>

        <div style={styles.tips}>
          <p style={styles.tipsTitle}>Não recebeu o email?</p>
          <ul style={styles.tipsList}>
            <li style={styles.tipsItem}>Verifique sua pasta de spam</li>
            <li style={styles.tipsItem}>Aguarde alguns minutos</li>
            <li style={styles.tipsItem}>Certifique-se de que digitou o email correto</li>
          </ul>
        </div>

        <div style={styles.actions}>
          <Link to="/forgot-password" style={styles.linkButton}>
            Tentar outro email
          </Link>
          <Link to="/login" style={styles.linkSecondary}>
            Voltar para login
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '500px',
    backgroundColor: '#ffffff',
    padding: '3rem 2rem',
    borderRadius: '1.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    textAlign: 'center',
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  icon: {
    width: '4rem',
    height: '4rem',
    color: '#2563eb',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '1rem',
  },
  message: {
    fontSize: '0.9375rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
  },
  email: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1a365d',
    marginBottom: '1.5rem',
  },
  instructions: {
    fontSize: '0.875rem',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '2rem',
  },
  tips: {
    backgroundColor: '#f9fafb',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    marginBottom: '2rem',
    textAlign: 'left',
  },
  tipsTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.75rem',
  },
  tipsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  tipsItem: {
    fontSize: '0.8125rem',
    color: '#6b7280',
    marginBottom: '0.5rem',
    paddingLeft: '1.25rem',
    position: 'relative',
    '::before': {
      content: '•',
      position: 'absolute',
      left: '0.5rem',
    },
  },
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  linkButton: {
    padding: '0.875rem 1.5rem',
    background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  linkSecondary: {
    color: '#1a365d',
    fontWeight: '600',
    textDecoration: 'none',
    fontSize: '0.875rem',
  },
};

export default CheckEmail;
