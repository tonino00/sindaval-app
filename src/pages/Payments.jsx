import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatDate } from '../utils/formatters';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const itemsPerPage = 5;

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
    const matchesStatus = filter === 'TODOS' || payment.status === filter;
    
    let matchesDate = true;
    if (startDate || endDate) {
      const paymentDate = new Date(payment.createdAt);
      paymentDate.setHours(0, 0, 0, 0);
      
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        matchesDate = matchesDate && paymentDate >= start;
      }
      
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && paymentDate <= end;
      }
    }
    
    return matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, startDate, endDate]);

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
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
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
          <div style={styles.filterRow}>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>📅 Data Início</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                style={styles.filterInput}
              />
            </div>
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>📅 Data Fim</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={styles.filterInput}
              />
            </div>
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              style={styles.clearFiltersButton}
            >
              ❌ Limpar Filtros de Data
            </button>
          )}
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
          <div style={styles.timelineHeader}>
            <div style={styles.timelineTitle}>
              <div style={styles.timelineIcon}>🕒️</div>
              <h3 style={styles.timelineTitleText}>Histórico de Pagamentos</h3>
            </div>
            <div style={styles.paginationInfo}>
              <span style={styles.paginationText}>
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredPayments.length)} de {filteredPayments.length}
              </span>
            </div>
          </div>

          <div style={styles.paymentsGrid}>
            {paginatedPayments.map((payment) => (
              <div key={payment.id} style={styles.paymentCard}>
                <div style={styles.paymentCardHeader}>
                  <div style={styles.paymentCardIcon}>
                    {payment.status === 'APROVADO' ? '✅' : payment.status === 'PENDENTE' ? '⏳' : '❌'}
                  </div>
                  <span
                    style={{
                      ...styles.paymentStatusBadge,
                      ...(payment.status === 'APROVADO' ? styles.statusAprovado : {}),
                      ...(payment.status === 'PENDENTE' ? styles.statusPendente : {}),
                      ...(payment.status === 'CANCELADO' ? styles.statusCancelado : {}),
                    }}
                  >
                    {payment.status}
                  </span>
                </div>
                <div style={styles.paymentCardBody}>
                  <div style={styles.paymentCardRow}>
                    <span style={styles.paymentCardLabel}>📅 Data</span>
                    <span style={styles.paymentCardValue}>{formatDate(payment.createdAt)}</span>
                  </div>
                  <div style={styles.paymentCardRow}>
                    <span style={styles.paymentCardLabel}>💰 Valor</span>
                    <span style={styles.paymentCardValueHighlight}>
                      R$ {Number(payment.valor || 0).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  {payment.metodoPagamento && (
                    <div style={styles.paymentCardRow}>
                      <span style={styles.paymentCardLabel}>💳 Método</span>
                      <span style={styles.paymentCardValue}>{payment.metodoPagamento}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div style={styles.pagination}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  ...styles.paginationButton,
                  ...(currentPage === 1 ? styles.paginationButtonDisabled : {}),
                }}
              >
                ← Anterior
              </button>
              <div style={styles.paginationNumbers}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    style={{
                      ...styles.paginationNumber,
                      ...(currentPage === page ? styles.paginationNumberActive : {}),
                    }}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  ...styles.paginationButton,
                  ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}),
                }}
              >
                Próxima →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '0 1rem',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
    gap: '1rem',
    marginBottom: '2rem',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    gap: '1rem',
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
    fontSize: '2rem',
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
    fontSize: '1.5rem',
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
    gap: '1rem',
  },
  filterRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
    gap: '1rem',
  },
  filterGroup: {
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
  filterInput: {
    padding: '0.875rem 1.25rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    fontSize: '0.9375rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
  },
  clearFiltersButton: {
    padding: '0.75rem 1.25rem',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '0.5rem',
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
    padding: '1.25rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  },
  timelineHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f3f4f6',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  timelineTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
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
  paginationInfo: {
    display: 'flex',
    alignItems: 'center',
  },
  paginationText: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#6b7280',
    whiteSpace: 'nowrap',
  },
  paymentsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  paymentCard: {
    backgroundColor: '#ffffff',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    overflow: 'hidden',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: 'default',
  },
  paymentCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  paymentCardIcon: {
    fontSize: '1.5rem',
  },
  paymentStatusBadge: {
    padding: '0.375rem 0.875rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  statusAprovado: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusPendente: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusCancelado: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  paymentCardBody: {
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  paymentCardRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentCardLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#6b7280',
  },
  paymentCardValue: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#111827',
  },
  paymentCardValueHighlight: {
    fontSize: '1.125rem',
    fontWeight: '800',
    color: '#1a365d',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1.5rem',
    paddingTop: '1.25rem',
    borderTop: '1px solid #e5e7eb',
    flexWrap: 'wrap',
  },
  paginationButton: {
    padding: '0.625rem 1rem',
    backgroundColor: '#1a365d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  paginationButtonDisabled: {
    backgroundColor: '#e5e7eb',
    color: '#9ca3af',
    cursor: 'not-allowed',
  },
  paginationNumbers: {
    display: 'flex',
    gap: '0.5rem',
  },
  paginationNumber: {
    minWidth: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 0.5rem',
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  paginationNumberActive: {
    backgroundColor: '#1a365d',
    color: '#ffffff',
    borderColor: '#1a365d',
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
