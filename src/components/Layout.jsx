import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.main}>
        {/* Botão Hamburguer */}
        <button 
          onClick={toggleSidebar}
          className="hamburger-menu"
          style={styles.hamburger}
          aria-label="Menu"
        >
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
          <span style={styles.hamburgerLine}></span>
        </button>

        {/* Overlay para fechar sidebar em mobile */}
        {sidebarOpen && (
          <div 
            className="sidebar-overlay"
            style={styles.overlay} 
            onClick={closeSidebar}
          />
        )}

        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  main: {
    display: 'flex',
    flex: 1,
    position: 'relative',
  },
  content: {
    flex: 1,
    padding: '1rem',
    backgroundColor: '#f9fafb',
    overflowY: 'auto',
    maxWidth: '100%',
  },
  hamburger: {
    position: 'fixed',
    top: '3px',
    left: '1rem',
    zIndex: 1003,
    width: '2.5rem',
    height: '2.5rem',
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    border: '1px solid rgba(212, 175, 55, 0.3)',
    borderRadius: '0.5rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.375rem',
    cursor: 'pointer',
    padding: '0.5rem',
    transition: 'all 0.2s ease',
  },
  hamburgerLine: {
    width: '1.75rem',
    height: '3px',
    backgroundColor: '#d4af37',
    borderRadius: '2px',
    transition: 'all 0.3s ease',
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
};

export default Layout;
