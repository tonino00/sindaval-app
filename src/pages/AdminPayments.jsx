import { useState, useEffect } from 'react';
import api from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [metodoFilter, setMetodoFilter] = useState('TODOS');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments');
      setPayments(response.data);
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = (paymentId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Confirmar Pagamento',
      message: 'Tem certeza que deseja confirmar este pagamento manualmente? Esta ação irá alterar o status para APROVADO.',
      onConfirm: async () => {
        try {
          await api.patch(`/payments/${paymentId}`, { status: 'APROVADO' });
          await fetchPayments();
        } catch (err) {
          console.error('Erro ao confirmar pagamento:', err);
        }
      },
    });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesStatus = statusFilter === 'TODOS' || payment.status === statusFilter;
    const matchesMetodo = metodoFilter === 'TODOS' || payment.metodoPagamento === metodoFilter;
    return matchesStatus && matchesMetodo;
  });

  const totalRecebido = filteredPayments
    .filter(p => p.status === 'APROVADO')
    .reduce((sum, p) => sum + (p.valor || 0), 0);

  const totalPendente = filteredPayments
    .filter(p => p.status === 'PENDENTE')
    .reduce((sum, p) => sum + (p.valor || 0), 0);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestão de Pagamentos</h1>
          <p style={styles.subtitle}>Visualize e gerencie todos os pagamentos do sistema</p>
        </div>
        <button style={styles.refreshButton} onClick={fetchPayments}>
          🔄 Atualizar
        </button>
      </div>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.statSuccess }}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Total Recebido</h3>
            <p style={styles.statValue}>R$ {totalRecebido.toFixed(2)}</p>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statWarning }}>
          <div style={styles.statIcon}>⏳</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Total Pendente</h3>
            <p style={styles.statValue}>R$ {totalPendente.toFixed(2)}</p>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statInfo }}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Total de Pagamentos</h3>
            <p style={styles.statValue}>{filteredPayments.length}</p>
          </div>
        </div>
      </div>

      <div style={styles.tableSection}>
        <div style={styles.filterSection}>
          <div style={styles.filterContainer}>
            <label style={styles.filterLabel}>Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="TODOS">Todos</option>
              <option value="APROVADO">Aprovado</option>
              <option value="PENDENTE">Pendente</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>
          <div style={styles.filterContainer}>
            <label style={styles.filterLabel}>Método:</label>
            <select
              value={metodoFilter}
              onChange={(e) => setMetodoFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="TODOS">Todos</option>
              <option value="PIX">PIX</option>
              <option value="CARTAO">Cartão</option>
            </select>
          </div>
          <div style={styles.resultCount}>
            <span style={styles.resultText}>
              {filteredPayments.length} pagamento(s) encontrado(s)
            </span>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner}>⏳</div>
            <p style={styles.loadingText}>Carregando pagamentos...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <p style={styles.emptyText}>Nenhum pagamento encontrado</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.tableHeaderCell}>ID</th>
                  <th style={styles.tableHeaderCell}>Usuário</th>
                  <th style={styles.tableHeaderCell}>Método</th>
                  <th style={styles.tableHeaderCell}>Valor</th>
                  <th style={styles.tableHeaderCell}>Status</th>
                  <th style={styles.tableHeaderCell}>Data</th>
                  <th style={styles.tableHeaderCell}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => (
                  <tr key={payment.id} style={{
                    ...styles.tableRow,
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                  }}>
                    <td style={styles.tableCell}>
                      <span style={styles.paymentId}>{payment.id.substring(0, 8)}...</span>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.userInfo}>
                        <span style={styles.userName}>{payment.usuario?.nomeCompleto || 'N/A'}</span>
                        <span style={styles.userEmail}>{payment.usuario?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.metodoBadge,
                        ...(payment.metodoPagamento === 'PIX' ? styles.metodoPix : styles.metodoCartao),
                      }}>
                        {payment.metodoPagamento === 'PIX' ? '💳 PIX' : '💰 Cartão'}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.valorText}>R$ {payment.valor?.toFixed(2) || '0.00'}</span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.statusBadge,
                        ...(payment.status === 'APROVADO' ? styles.statusAprovado : {}),
                        ...(payment.status === 'PENDENTE' ? styles.statusPendente : {}),
                        ...(payment.status === 'CANCELADO' ? styles.statusCancelado : {}),
                      }}>
                        {payment.status}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td style={styles.tableCell}>
                      {payment.status === 'PENDENTE' && (
                        <button
                          onClick={() => handleConfirmPayment(payment.id)}
                          style={styles.confirmButton}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#059669';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#10b981';
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        >
                          ✅ Confirmar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={styles.infoBox}>
        <h3 style={styles.infoTitle}>⚠️ Importante</h3>
        <ul style={styles.infoList}>
          <li>A confirmação manual de pagamentos é apenas para fins de protótipo</li>
          <li>Em produção, os pagamentos são confirmados automaticamente via webhooks</li>
          <li>Não é possível alterar o valor de um pagamento por questões de segurança</li>
          <li>O status real dos pagamentos vem diretamente do gateway de pagamento</li>
        </ul>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        variant="warning"
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    gap: '1rem',
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
  refreshButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#ffffff',
    color: '#1a365d',
    border: '2px solid #1a365d',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
    gap: '1.5rem',
    marginBottom: '2.5rem',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start',
  },
  statSuccess: {
    borderLeft: '4px solid #059669',
  },
  statWarning: {
    borderLeft: '4px solid #f59e0b',
  },
  statInfo: {
    borderLeft: '4px solid #2563eb',
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
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statValue: {
    fontSize: '2.25rem',
    fontWeight: '800',
    color: '#111827',
    margin: 0,
    lineHeight: 1,
  },
  tableSection: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    marginBottom: '2rem',
  },
  filterSection: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    whiteSpace: 'nowrap',
  },
  filterSelect: {
    padding: '0.75rem 1rem',
    border: '2px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  resultCount: {
    marginLeft: 'auto',
  },
  resultText: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#6b7280',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '1rem',
  },
  loadingSpinner: {
    fontSize: '3rem',
  },
  loadingText: {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '1rem',
  },
  emptyIcon: {
    fontSize: '4rem',
  },
  emptyText: {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)',
  },
  tableHeaderCell: {
    padding: '1rem 1.25rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#1a365d',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #e5e7eb',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s',
  },
  tableCell: {
    padding: '1.25rem',
    fontSize: '0.875rem',
    color: '#374151',
  },
  paymentId: {
    fontFamily: 'monospace',
    fontSize: '0.8125rem',
    color: '#6b7280',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  userName: {
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: '0.8125rem',
    color: '#6b7280',
  },
  metodoBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    fontSize: '0.8125rem',
    fontWeight: '600',
  },
  metodoPix: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  metodoCartao: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  valorText: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
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
  confirmButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
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

export default AdminPayments;
