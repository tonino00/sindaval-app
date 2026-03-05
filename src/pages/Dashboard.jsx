import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Dashboard</h1>

      <div style={styles.grid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Bem-vindo(a)</h3>
          <p style={styles.cardText}>{user?.nomeCompleto}</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Email</h3>
          <p style={styles.cardText}>{user?.email}</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>OAB</h3>
          <p style={styles.cardText}>{user?.numeroOAB || 'Não informado'}</p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Perfil</h3>
          <p style={styles.cardText}>
            {user?.role === 'ADMIN' && 'Administrador'}
            {user?.role === 'FINANCEIRO' && 'Financeiro'}
            {user?.role === 'SINDICALIZADO' && 'Sindicalizado'}
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Status da Associação</h3>
          <p
            style={{
              ...styles.cardText,
              ...styles.statusBadge,
              ...(user?.status === 'ATIVO' ? styles.statusActive : {}),
              ...(user?.status === 'INADIMPLENTE' ? styles.statusWarning : {}),
              ...(user?.status === 'INATIVO' ? styles.statusInactive : {}),
            }}
          >
            {user?.status}
          </p>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>ID do Usuário</h3>
          <p style={{ ...styles.cardText, fontSize: '12px', wordBreak: 'break-all' }}>
            {user?.id}
          </p>
        </div>
      </div>

      <div style={styles.actionsSection}>
        <h2 style={styles.actionsTitle}>Ações Rápidas</h2>
        <div style={styles.actionsGrid}>
          <button onClick={() => navigate('/checkout')} style={styles.actionButton}>
            <div style={styles.actionIcon}>💳</div>
            <div style={styles.actionContent}>
              <h3 style={styles.actionTitle}>Pagar Mensalidade</h3>
              <p style={styles.actionDescription}>Realize o pagamento da sua mensalidade</p>
            </div>
          </button>
          <button onClick={() => navigate('/digital-card')} style={styles.actionButton}>
            <div style={styles.actionIcon}>🎫</div>
            <div style={styles.actionContent}>
              <h3 style={styles.actionTitle}>Carteira Digital</h3>
              <p style={styles.actionDescription}>Acesse sua carteira com QR Code</p>
            </div>
          </button>
          <button onClick={() => navigate('/agreements')} style={styles.actionButton}>
            <div style={styles.actionIcon}>🎁</div>
            <div style={styles.actionContent}>
              <h3 style={styles.actionTitle}>Convênios</h3>
              <p style={styles.actionDescription}>Veja os benefícios disponíveis</p>
            </div>
          </button>
        </div>
      </div>

      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>Informações de Segurança</h3>
        <ul style={styles.infoList}>
          <li>Seus dados estão protegidos e criptografados</li>
          <li>A sessão é renovada automaticamente enquanto você estiver ativo</li>
          <li>Tokens de autenticação são armazenados de forma segura em cookies HTTP-only</li>
          <li>Nenhum dado sensível é armazenado no navegador</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '2rem',
    letterSpacing: '-0.025em',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '1.75rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  cardTitle: {
    fontSize: '0.6875rem',
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  cardText: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    lineHeight: '1.5',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
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
  actionsSection: {
    marginBottom: '2rem',
  },
  actionsTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '1.5rem',
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
    gap: '1rem',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    border: '2px solid #e5e7eb',
    borderRadius: '1rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    textAlign: 'left',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    width: '100%',
  },
  actionIcon: {
    fontSize: '2.5rem',
    flexShrink: 0,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.25rem 0',
  },
  actionDescription: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
  },
  infoBox: {
    backgroundColor: '#eff6ff',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid #dbeafe',
  },
  infoTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: '1rem',
  },
  infoList: {
    listStyle: 'disc',
    paddingLeft: '1.25rem',
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    color: '#1e40af',
    fontSize: '0.875rem',
    lineHeight: '1.5',
  },
};

export default Dashboard;
