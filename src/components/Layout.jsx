import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div style={styles.container}>
      <Navbar />
      <div style={styles.main}>
        <Sidebar />
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
};

// Media query para desktop
if (window.innerWidth >= 768) {
  styles.content.padding = '2rem';
}

export default Layout;
