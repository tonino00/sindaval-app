import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';

const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const { user } = useSelector((state) => state.auth);

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
    padding: '1rem 0',
    flexShrink: 0,
    transition: 'transform 0.3s ease-in-out',
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
    overflowY: 'auto',
    paddingTop: '4.5rem',
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
