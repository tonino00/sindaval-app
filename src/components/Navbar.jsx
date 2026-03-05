const Navbar = () => {
  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <h1 style={styles.title}>SINDAVAL</h1>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#1a365d',
    borderBottom: '3px solid #d4af37',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1002,
  },
  container: {
    maxWidth: '100%',
    padding: '1rem 1.5rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '900',
    margin: 0,
    color: '#ffffff',
    letterSpacing: '0.2em',
    textAlign: 'center',
  },
};

export default Navbar;
