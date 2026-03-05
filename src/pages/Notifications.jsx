import { useState, useEffect } from 'react';
import api from '../services/api';
import DOMPurify from 'dompurify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        <p>Carregando notificações...</p>
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
        <h1 style={styles.title}>Notificações</h1>
        {unreadCount > 0 && (
          <span style={styles.badge}>{unreadCount} não lida{unreadCount > 1 ? 's' : ''}</span>
        )}
      </div>

      {notifications.length === 0 ? (
        <div style={styles.emptyState}>
          <p style={styles.emptyText}>Nenhuma notificação encontrada</p>
        </div>
      ) : (
        <div style={styles.notificationsList}>
          {notifications.map((notif) => (
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
                  {new Date(notif.createdAt).toLocaleString('pt-BR')}
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
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#111827',
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
  emptyState: {
    padding: '3rem',
    textAlign: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
  },
  emptyText: {
    fontSize: '1rem',
    color: '#6b7280',
  },
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  notificationCard: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
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
};

export default Notifications;
