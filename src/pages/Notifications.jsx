import { useState, useEffect } from 'react';
import api from '../services/api';
import DOMPurify from 'dompurify';
import { formatDateTime } from '../utils/formatters';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const shimmerCss = `
    @keyframes notifications_shimmer {
      0% { background-position: -600px 0; }
      100% { background-position: 600px 0; }
    }
  `;
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('TODAS');
  const itemsPerPage = 5;

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notifications/me/notifications');
      setNotifications(response.data);
      setError(null);
    } catch (err) {
      if (err.response?.status === 403) {
        setError('Você não tem permissão para acessar as notificações');
      } else {
        setError(err.response?.data?.message || 'Erro ao carregar notificações');
      }
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/notifications/me/notifications/unread-count');
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Erro ao buscar contagem de não lidas:', err);
    }
  };

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === 'TODAS') return true;
    if (filter === 'NAO_LIDAS') return !notif.lida;
    if (filter === 'LIDAS') return notif.lida;
    return true;
  });

  const totalPages = Math.ceil(filteredNotifications.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedNotifications = filteredNotifications.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/me/notifications/${id}/read`);
      await fetchNotifications();
      await fetchUnreadCount();
    } catch (err) {
      console.error('Erro ao marcar como lida:', err);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <style>{shimmerCss}</style>
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Notificações</h1>
            <p style={styles.subtitle}>Acompanhe todas as suas notificações</p>
          </div>
          {unreadCount > 0 && (
            <span style={styles.badge}>{unreadCount} não lida{unreadCount > 1 ? 's' : ''}</span>
          )}
        </div>

        <div style={styles.filterCard}>
          <div style={styles.filterHeader}>
            <div style={styles.filterIcon}>🔍</div>
            <h3 style={styles.filterTitle}>Filtrar Notificações</h3>
          </div>
          <div style={styles.filterContent}>
            <div style={styles.filterRow}>
              <div style={styles.filterGroup}>
                <label style={styles.filterLabel}>Status</label>
                <select value={filter} onChange={(e) => setFilter(e.target.value)} style={styles.filterSelect} disabled>
                  <option value="TODAS">📋 Todas</option>
                  <option value="NAO_LIDAS">🔔 Não Lidas</option>
                  <option value="LIDAS">✅ Lidas</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.skeletonList}>
          <div style={styles.skeletonCard}>
            <div style={styles.skeletonRow}>
              <div style={{ ...styles.skeletonLine, width: '60%' }} />
              <div style={{ ...styles.skeletonPill, width: '120px' }} />
            </div>
            <div style={{ ...styles.skeletonLine, width: '92%' }} />
            <div style={{ ...styles.skeletonLine, width: '84%' }} />
            <div style={styles.skeletonFooter}>
              <div style={{ ...styles.skeletonLine, width: '160px' }} />
              <div style={{ ...styles.skeletonPill, width: '140px' }} />
            </div>
          </div>
          <div style={styles.skeletonCard}>
            <div style={styles.skeletonRow}>
              <div style={{ ...styles.skeletonLine, width: '55%' }} />
              <div style={{ ...styles.skeletonPill, width: '110px' }} />
            </div>
            <div style={{ ...styles.skeletonLine, width: '90%' }} />
            <div style={{ ...styles.skeletonLine, width: '78%' }} />
            <div style={styles.skeletonFooter}>
              <div style={{ ...styles.skeletonLine, width: '150px' }} />
              <div style={{ ...styles.skeletonPill, width: '140px' }} />
            </div>
          </div>
          <div style={styles.skeletonCard}>
            <div style={styles.skeletonRow}>
              <div style={{ ...styles.skeletonLine, width: '62%' }} />
              <div style={{ ...styles.skeletonPill, width: '130px' }} />
            </div>
            <div style={{ ...styles.skeletonLine, width: '94%' }} />
            <div style={{ ...styles.skeletonLine, width: '80%' }} />
            <div style={styles.skeletonFooter}>
              <div style={{ ...styles.skeletonLine, width: '170px' }} />
              <div style={{ ...styles.skeletonPill, width: '140px' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorBox}>{error}</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Notificações</h1>
          <p style={styles.subtitle}>Acompanhe todas as suas notificações</p>
        </div>
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount} não lida{unreadCount > 1 ? 's' : ''}</span>
        )}
      </div>

      <div style={styles.filterCard}>
        <div style={styles.filterHeader}>
          <div style={styles.filterIcon}>🔍</div>
          <h3 style={styles.filterTitle}>Filtrar Notificações</h3>
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
                <option value="TODAS">📋 Todas</option>
                <option value="NAO_LIDAS">🔔 Não Lidas</option>
                <option value="LIDAS">✅ Lidas</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {filteredNotifications.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📭</div>
          <p style={styles.emptyText}>Nenhuma notificação encontrada</p>
          <p style={styles.emptySubtext}>Tente filtrar por outro status ou aguarde novas notificações.</p>
        </div>
      ) : (
        <div style={styles.notificationsContainer}>
          <div style={styles.notificationsHeader}>
            <div style={styles.notificationsTitle}>
              <div style={styles.notificationsTitleIcon}>📬</div>
              <h3 style={styles.notificationsTitleText}>Lista de Notificações</h3>
            </div>
            <div style={styles.paginationInfo}>
              <span style={styles.paginationText}>
                Mostrando {startIndex + 1}-{Math.min(endIndex, filteredNotifications.length)} de {filteredNotifications.length}
              </span>
            </div>
          </div>

          <div style={styles.notificationsList}>
            {paginatedNotifications.map((notif) => (
            <div
              key={notif.id}
              style={{
                ...styles.notificationCard,
                ...(notif.lida ? {} : styles.notificationUnread),
              }}
            >
              <div style={styles.notificationHeader}>
                <h3 style={styles.notificationTitle}>{notif.titulo}</h3>
                <div style={styles.notificationMeta}>
                  <span style={styles.notificationType}>
                    {notif.tipo === 'GERAL' ? 'Geral' : 'Individual'}
                  </span>
                  <span style={styles.notificationChannel}>
                    {notif.canal === 'INTERNA' && 'Interna'}
                    {notif.canal === 'EMAIL' && 'Email'}
                    {notif.canal === 'WHATSAPP' && 'WhatsApp'}
                    {notif.canal === 'MULTICANAL' && 'Multicanal'}
                  </span>
                </div>
              </div>

              <div
                style={styles.notificationBody}
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(notif.mensagem),
                }}
              />

              <div style={styles.notificationFooter}>
                <span style={styles.notificationDate}>
                  {formatDateTime(notif.createdAt)}
                </span>
                {!notif.lida && (
                  <button
                    onClick={() => markAsRead(notif.id)}
                    style={styles.markAsReadButton}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#047857';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#059669';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    ✓ Marcar como lida
                  </button>
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
    maxWidth: '900px',
    margin: '0 auto',
    padding: '0 1rem',
  },
  skeletonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    gap: '1rem',
    paddingTop: '0.25rem',
  },
  skeletonList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  skeletonCard: {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '0.75rem',
    border: '2px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  skeletonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  },
  skeletonFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    paddingTop: '0.5rem',
  },
  skeletonLine: {
    height: '12px',
    borderRadius: '999px',
    backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 40%, #e5e7eb 80%)',
    backgroundSize: '600px 100%',
    animation: 'notifications_shimmer 1.25s linear infinite',
  },
  skeletonPill: {
    height: '22px',
    borderRadius: '999px',
    backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 40%, #e5e7eb 80%)',
    backgroundSize: '600px 100%',
    animation: 'notifications_shimmer 1.25s linear infinite',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
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
  badge: {
    padding: '0.5rem 1rem',
    backgroundColor: '#1a365d',
    color: '#ffffff',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  errorBox: {
    padding: '1rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    color: '#991b1b',
    fontSize: '0.875rem',
    fontWeight: '500',
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
  notificationsContainer: {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  },
  notificationsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f3f4f6',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  notificationsTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  notificationsTitleIcon: {
    fontSize: '1.5rem',
  },
  notificationsTitleText: {
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
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    padding: '1.25rem',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '2px solid #e5e7eb',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  notificationUnread: {
    borderLeft: '4px solid #1a365d',
    backgroundColor: '#eff6ff',
  },
  notificationHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  notificationTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  notificationMeta: {
    display: 'flex',
    gap: '0.5rem',
  },
  notificationType: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  notificationChannel: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  notificationBody: {
    fontSize: '0.9375rem',
    color: '#374151',
    lineHeight: '1.6',
    marginBottom: '1rem',
  },
  notificationFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  notificationDate: {
    fontSize: '0.8125rem',
    color: '#6b7280',
  },
  markAsReadButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    whiteSpace: 'nowrap',
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
};

export default Notifications;
