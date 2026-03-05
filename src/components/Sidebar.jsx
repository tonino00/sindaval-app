import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/auth/authSlice';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logout());
    navigate('/login');
  };

  const links = [
    { to: '/dashboard', label: 'Dashboard', roles: ['SINDICALIZADO', 'FINANCEIRO'] },
    { to: '/profile', label: 'Meu Perfil', roles: ['SINDICALIZADO', 'FINANCEIRO'] },
    { to: '/payments', label: 'Histórico de Pagamentos', roles: ['SINDICALIZADO', 'FINANCEIRO'] },
    { to: '/digital-card', label: 'Carteira Digital', roles: ['SINDICALIZADO', 'FINANCEIRO'] },
    { to: '/agreements', label: 'Convênios', roles: ['SINDICALIZADO', 'FINANCEIRO'] },
    { to: '/notifications', label: 'Notificações', roles: ['SINDICALIZADO', 'FINANCEIRO'] },
    { to: '/admin/dashboard', label: 'Dashboard', roles: ['ADMIN'] },
    { to: '/admin', label: 'Gestão de Usuários', roles: ['ADMIN'] },
    { to: '/admin/agreements', label: 'Gestão de Convênios', roles: ['ADMIN'] },
    { to: '/admin/reports', label: 'Relatórios', roles: ['ADMIN'] },
    { to: '/notifications', label: 'Notificações', roles: ['ADMIN'] },
  ];

  const filteredLinks = links.filter((link) =>
    link.roles.includes(user?.role)
  );

  return (
    <aside
      className="app-sidebar"
      style={{
        ...styles.sidebar,
        ...(isOpen ? styles.sidebarOpen : styles.sidebarClosed),
      }}
    >
      <div style={styles.userSection}>
        <div style={styles.userAvatar}>
          {user?.nomeCompleto?.charAt(0).toUpperCase()}
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.nomeCompleto}</span>
          <span style={styles.userRole}>
            {user?.role === 'ADMIN' && 'Administrador'}
            {user?.role === 'FINANCEIRO' && 'Financeiro'}
            {user?.role === 'SINDICALIZADO' && 'Sindicalizado'}
          </span>
        </div>
        <button onClick={handleLogout} style={styles.logoutButton}>
          Sair
        </button>
      </div>
      <div style={styles.divider} />
      <nav style={styles.nav}>
        {filteredLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            onClick={onClose}
            style={({ isActive }) => ({
              ...styles.link,
              ...(isActive ? styles.linkActive : {}),
            })}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: '100%',
    maxWidth: '260px',
    backgroundColor: '#ffffff',
    borderRight: '1px solid #e5e7eb',
    padding: 0,
    flexShrink: 0,
    transition: 'transform 0.3s ease-in-out',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
    overflowY: 'auto',
    paddingTop: '4rem',
  },
  userSection: {
    padding: '1.5rem 1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    alignItems: 'center',
  },
  userAvatar: {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '50%',
    backgroundColor: '#1a365d',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: '700',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.25rem',
    textAlign: 'center',
  },
  userName: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#111827',
  },
  userRole: {
    fontSize: '0.8125rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  logoutButton: {
    width: '100%',
    padding: '0.625rem 1rem',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    transition: 'all 0.2s',
    marginTop: '0.5rem',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '0 1rem',
  },
  sidebarOpen: {
    transform: 'translateX(0)',
  },
  sidebarClosed: {
    transform: 'translateX(-100%)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    padding: '0 0.75rem',
  },
  link: {
    padding: '0.75rem 1rem',
    color: '#4b5563',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    borderRadius: '0.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  linkActive: {
    backgroundColor: '#eff6ff',
    color: '#1a365d',
    fontWeight: '600',
  },
};

export default Sidebar;
