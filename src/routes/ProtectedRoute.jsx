import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import logoSindav from '../assets/logo-main.png';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, initialized } = useSelector((state) => state.auth);
  const spinnerCss = `
    @keyframes protected_spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  // Aguardar verificação inicial antes de redirecionar
  if (!initialized || loading) {
    return (
      <div style={styles.container}>
        <style>{spinnerCss}</style>
        <div style={styles.loaderWrap} aria-busy="true" aria-live="polite">
          <div style={styles.spinnerRing}>
            <div style={styles.spinnerRingInner} />
          </div>
          <img src={logoSindav} alt="SINDAVAL" style={styles.logo} />
          <div style={styles.loadingText}>Carregando...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
  },
  loaderWrap: {
    position: 'relative',
    width: '200px',
    height: '200px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
  },
  spinnerRing: {
    position: 'absolute',
    inset: 0,
    borderRadius: '9999px',
    background: 'conic-gradient(from 0deg, rgba(26, 54, 93, 0.0), rgba(26, 54, 93, 0.95))',
    animation: 'protected_spin 1s linear infinite',
    filter: 'drop-shadow(0 6px 18px rgba(0,0,0,0.12))',
  },
  spinnerRingInner: {
    position: 'absolute',
    inset: '12px',
    borderRadius: '9999px',
    backgroundColor: '#f8fafc',
    border: '1px solid #e5e7eb',
  },
  logo: {
    width: '160px',
    height: 'auto',
    objectFit: 'contain',
    zIndex: 1,
    marginTop:'2.5rem'
  },
  loadingText: {
    zIndex: 1,
    color: '#6b7280',
    fontWeight: '700',
    fontSize: '0.95rem',
    position:'relative',
    top:'1rem'
  },
};

export default ProtectedRoute;
