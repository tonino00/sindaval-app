import { useState, useEffect } from 'react';
import api from '../services/api';
import { formatPhone } from '../utils/formatters';

const Agreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('TODOS');

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agreements');
      console.log('📋 Convênios recebidos da API:', response.data);
      if (response.data.length > 0) {
        console.log('📋 Estrutura do primeiro convênio:', response.data[0]);
      }
      setAgreements(response.data);
    } catch (err) {
      console.error('Erro ao carregar convênios:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredAgreements = agreements.filter((agreement) => {
    const matchesSearch = agreement.titulo.toLowerCase().includes(search.toLowerCase()) ||
                         agreement.descricao?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'TODOS' || 
                         (filter === 'ATIVO' && agreement.ativo) ||
                         (filter === 'INATIVO' && !agreement.ativo);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Carregando convênios...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Convênios Disponíveis</h1>
          <p style={styles.subtitle}>Descubra os benefícios exclusivos para sindicalizados</p>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statBadge}>
            <span style={styles.statBadgeLabel}>Total Disponível</span>
            <span style={styles.statBadgeValue}>{filteredAgreements.length}</span>
          </div>
        </div>
      </div>

      <div style={styles.filtersCard}>
        <div style={styles.filtersHeader}>
          <div style={styles.filterIcon}>🔍</div>
          <h3 style={styles.filtersTitle}>Filtros de Busca</h3>
        </div>
        <div style={styles.filters}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Buscar</label>
            <input
              type="text"
              placeholder="Digite o nome do convênio..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="TODOS">Todos os Status</option>
              <option value="ATIVO">✅ Ativos</option>
              <option value="INATIVO">❌ Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {filteredAgreements.length === 0 ? (
        <div style={styles.emptyState}>
          <p>Nenhum convênio encontrado</p>
        </div>
      ) : (
        <div style={styles.agreementsGrid}>
          {filteredAgreements.map((agreement) => (
            <div key={agreement.id} style={styles.agreementCard}>
              {/* Header com destaque para desconto */}
              <div style={styles.cardTop}>
                <div style={styles.discountBadge}>
                  <span style={styles.discountValue}>{agreement.desconto || 0}%</span>
                  <span style={styles.discountLabel}>OFF</span>
                </div>
                {agreement.ativo ? (
                  <span style={styles.statusActive}>✓ Ativo</span>
                ) : (
                  <span style={styles.statusInactive}>✕ Inativo</span>
                )}
              </div>

              {/* Título e Categoria */}
              <div style={styles.cardBody}>
                <h3 style={styles.cardTitle}>{agreement.titulo}</h3>
                <div style={styles.categoryTag}>
                  <span style={styles.categoryIcon}>🏷️</span>
                  <span style={styles.categoryText}>{agreement.categoria || 'Geral'}</span>
                </div>

                {agreement.descricao && (
                  <p style={styles.cardDescription}>{agreement.descricao}</p>
                )}

                {/* Informações de contato */}
                {agreement.contato && (
                  <div style={styles.contactInfo}>
                    <span style={styles.contactIconNew}>📞</span>
                    <span style={styles.contactText}>{formatPhone(agreement.contato)}</span>
                  </div>
                )}
              </div>

              {/* Footer com botão de ação */}
              <div style={styles.cardFooter}>
                <button style={styles.actionButton}>
                  <span style={styles.buttonIcon}>✨</span>
                  <span style={styles.buttonText}>Usar Convênio</span>
                </button>
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
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
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
  headerStats: {
    display: 'flex',
    gap: '1rem',
  },
  statBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    backgroundColor: '#1a365d',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  statBadgeLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  statBadgeValue: {
    fontSize: '2rem',
    color: '#ffffff',
    fontWeight: '800',
    lineHeight: 1,
  },
  filtersCard: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    marginBottom: '2rem',
  },
  filtersHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  filterIcon: {
    fontSize: '1.5rem',
  },
  filtersTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1a365d',
    margin: 0,
  },
  filters: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
    gap: '1.25rem',
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
  searchInput: {
    padding: '0.875rem 1.25rem',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'all 0.2s',
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
  emptySubtext: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  agreementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))',
    gap: '2rem',
  },
  agreementCard: {
    backgroundColor: '#ffffff',
    borderRadius: '1.25rem',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    overflow: 'hidden',
    cursor: 'pointer',
    ':hover': {
      transform: 'translateY(-8px)',
      boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.15)',
    },
  },
  cardTop: {
    background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  discountBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: '0.75rem',
    padding: '0.75rem 1.25rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  discountValue: {
    fontSize: '2rem',
    fontWeight: '900',
    color: '#059669',
    lineHeight: 1,
  },
  discountLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#6b7280',
    marginTop: '0.25rem',
    letterSpacing: '0.05em',
  },
  statusActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
  },
  statusInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    color: '#ffffff',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    fontSize: '0.875rem',
    fontWeight: '600',
    backdropFilter: 'blur(10px)',
    opacity: 0.7,
  },
  cardBody: {
    padding: '1.75rem',
  },
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#111827',
    marginBottom: '0.75rem',
    letterSpacing: '-0.025em',
  },
  categoryTag: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#f3f4f6',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    marginBottom: '1rem',
  },
  categoryIcon: {
    fontSize: '1rem',
  },
  categoryText: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  cardDescription: {
    fontSize: '0.9375rem',
    color: '#6b7280',
    lineHeight: '1.7',
    marginBottom: '1.25rem',
  },
  contactInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
  },
  contactIconNew: {
    fontSize: '1.25rem',
  },
  contactText: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#1a365d',
  },
  cardFooter: {
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderTop: '1px solid #e5e7eb',
  },
  actionButton: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 6px -1px rgba(5, 150, 105, 0.3)',
  },
  buttonIcon: {
    fontSize: '1.25rem',
  },
  buttonText: {
    letterSpacing: '0.025em',
  },
};

export default Agreements;
