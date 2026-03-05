import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <div style={styles.brand}>
          <h2 style={styles.title}>Sindaval</h2>
        </div>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{user?.nomeCompleto}</span>
            <span style={styles.userRole}>
              {user?.role === 'ADMIN' && 'Administrador'}
              {user?.role === 'FINANCEIRO' && 'Financeiro'}
              {user?.role === 'SINDICALIZADO' && 'Sindicalizado'}
            </span>
            <span
              style={{
                ...styles.userStatus,
                ...(user?.status === 'ATIVO' ? styles.statusActive : {}),
                ...(user?.status === 'INADIMPLENTE' ? styles.statusWarning : {}),
                ...(user?.status === 'INATIVO' ? styles.statusInactive : {}),
              }}
            >
              {user?.status}
            </span>
          </div>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    backdropFilter: 'blur(10px)',
  },
  container: {
    maxWidth: '100%',
    margin: '0 auto',
    padding: '0.75rem 1rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  title: {
    fontSize: '1.375rem',
    fontWeight: '800',
    margin: 0,
    background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    letterSpacing: '0.025em',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.25rem',
  },
  userName: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '150px',
  },
  userRole: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  userStatus: {
    fontSize: '0.6875rem',
    padding: '0.125rem 0.5rem',
    borderRadius: '9999px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  statusActive: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusInactive: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
  },
  logoutButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#1a365d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  },
};

export default Navbar;
