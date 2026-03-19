import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDate } from '../utils/formatters';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TODOS');

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/me');
      setPayments(response.data);
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (filter === 'TODOS') return true;
    return payment.status === filter;
  });

  const stats = {
    total: payments.length,
    totalPago: payments.filter((p) => p.status === 'APROVADO').reduce((sum, p) => sum + p.valor, 0),
    aprovados: payments.filter((p) => p.status === 'APROVADO').length,
    pendentes: payments.filter((p) => p.status === 'PENDENTE').length,
    cancelados: payments.filter((p) => p.status === 'CANCELADO').length,
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div style={styles.loadingSpinner}>⏳</div>
          <p style={styles.loadingText}>Carregando pagamentos...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Histórico de Pagamentos</h1>
          <p style={styles.subtitle}>Acompanhe todas as suas transações</p>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.statSuccess }}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Total Pago</h3>
            <p style={styles.statValue}>R$ {stats.totalPago.toFixed(2)}</p>
            <p style={styles.statTrend}>✅ Pagamentos confirmados</p>
          </div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statPrimary }}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Aprovados</h3>
            <p style={styles.statValue}>{stats.aprovados}</p>
            <p style={styles.statTrend}>Transações concluídas</p>
          </div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statWarning }}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Pendentes</h3>
            <p style={styles.statValue}>{stats.pendentes}</p>
            <p style={styles.statTrend}>Aguardando confirmação</p>
          </div>
        </div>
        <div style={{ ...styles.statCard, ...styles.statDanger }}>
          <div style={styles.statIcon}>❌</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Cancelados</h3>
            <p style={styles.statValue}>{stats.cancelados}</p>
            <p style={styles.statTrend}>Transações canceladas</p>
          </div>
        </div>
      </div>

      <div style={styles.filterCard}>
        <div style={styles.filterHeader}>
          <div style={styles.filterIcon}>🔍</div>
          <h3 style={styles.filterTitle}>Filtrar Pagamentos</h3>
        </div>
        <div style={styles.filterContent}>
          <label style={styles.filterLabel}>Status</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="TODOS">📋 Todos os Status</option>
            <option value="APROVADO">✅ Aprovados</option>
            <option value="PENDENTE">⏳ Pendentes</option>
            <option value="CANCELADO">❌ Cancelados</option>
          </select>
        </div>
      </div>

      {filteredPayments.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📦</div>
          <p style={styles.emptyText}>Nenhum pagamento encontrado</p>
          <p style={styles.emptySubtext}>Tente filtrar por outro status ou aguarde novas transações.</p>
        </div>
      ) : (
        <div style={styles.timelineContainer}>
          <div style={styles.timelineTitle}>
            <div style={styles.timelineIcon}>🕒️</div>
            <h3 style={styles.timelineTitleText}>Histórico de Pagamentos</h3>
          </div>
          {filteredPayments.map((payment) => (
            <div key={payment.id} style={styles.paymentDetail}>
              <div style={styles.detailIcon}>📝</div>
              <div style={styles.detailContent}>
                <p style={styles.detailLabel}>Data:</p>
                <p style={styles.detailValue}>{formatDate(payment.createdAt)}</p>
                <p style={styles.detailLabel}>Valor:</p>
                <p style={styles.detailValue}>R$ {Number(payment.valor || 0).toFixed(2).replace('.', ',')}</p>
                <p style={styles.detailLabel}>Status:</p>
                <p style={styles.detailValue}>{payment.status}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#1a365d',
    marginBottom: '0.5rem',
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: '400',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '1.75rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    gap: '1.25rem',
    alignItems: 'flex-start',
  },
  statSuccess: {
    borderLeft: '4px solid #059669',
  },
  statPrimary: {
    borderLeft: '4px solid #1a365d',
  },
  statWarning: {
    borderLeft: '4px solid #f59e0b',
  },
  statDanger: {
    borderLeft: '4px solid #ef4444',
  },
  statIcon: {
    fontSize: '2.5rem',
    flexShrink: 0,
  },
  statContent: {
    flex: 1,
  },
  statTitle: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '0.5rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: '1.875rem',
    fontWeight: '800',
    color: '#111827',
    margin: '0 0 0.5rem 0',
    lineHeight: 1,
  },
  statTrend: {
    fontSize: '0.8125rem',
    color: '#6b7280',
    margin: 0,
  },
  filterCard: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    marginBottom: '2rem',
  },
  filterHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  filterIcon: {
    fontSize: '1.5rem',
  },
  filterTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1a365d',
    margin: 0,
  },
  filterContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  filterLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  filterSelect: {
    padding: '0.875rem 1.25rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    fontSize: '0.9375rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '0.75rem',
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    border: '1px solid #e5e7eb',
  },
  emptyIcon: {
    fontSize: '4rem',
  },
  emptyText: {
    fontSize: '1.125rem',
    color: '#111827',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: '0.875rem',
    color: '#6b7280',
    textAlign: 'center',
  },
  timelineContainer: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  },
  timelineTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f3f4f6',
  },
  timelineIcon: {
    fontSize: '1.5rem',
  },
  timelineTitleText: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1a365d',
    margin: 0,
  },
  paymentDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
  },
  detailIcon: {
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  detailContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  detailLabel: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  detailValue: {
    fontSize: '1rem',
    color: '#111827',
    fontWeight: '700',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '1rem',
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    border: '1px solid #e5e7eb',
  },
  loadingSpinner: {
    fontSize: '3rem',
  },
  loadingText: {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: '500',
  },
};

export default Payments;
