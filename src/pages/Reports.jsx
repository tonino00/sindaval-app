import { useState, useEffect } from 'react';
import api from '../services/api';

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [filters, setFilters] = useState({
    tipo: 'usuarios',
    formato: 'csv',
    dataInicio: '',
    dataFim: '',
    status: '',
  });
  const [previewData, setPreviewData] = useState({
    usuarios: {},
    pagamentos: {},
    convenios: {},
    notificacoes: {},
    financeiro: {},
  });
  const [loadingPreview, setLoadingPreview] = useState(true);

  useEffect(() => {
    fetchPreviewData();
  }, [filters.tipo]);

  const fetchPreviewData = async () => {
    try {
      setLoadingPreview(true);
      const response = await api.get(`/admin/reports/preview?tipo=${filters.tipo}`);
      setPreviewData(prev => ({
        ...prev,
        [filters.tipo]: response.data
      }));
    } catch (err) {
      console.error('Erro ao carregar preview:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/admin/reports/export', filters, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `relatorio-${filters.tipo}-${Date.now()}.${filters.formato}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSuccess('Relatório exportado com sucesso!');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao exportar relatório');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentPreview = () => {
    return previewData[filters.tipo] || {};
  };

  const preview = getCurrentPreview();

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Relatórios e Análises</h1>
          <p style={styles.subtitle}>Exporte dados e gere relatórios personalizados</p>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.previewCard}>
          <h2 style={styles.previewTitle}>� Preview de Dados</h2>
          {loadingPreview ? (
            <div style={styles.loadingPreview}>
              <p>⏳ Carregando preview...</p>
            </div>
          ) : Object.keys(preview).length > 0 ? (
            <>
              <div style={styles.previewStats}>
                {Object.entries(preview).map(([key, value]) => (
                  <div key={key} style={styles.previewStat}>
                    <span style={styles.previewLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    <span style={styles.previewValue}>{value || 0}</span>
                  </div>
                ))}
              </div>
              
              <div style={styles.chartPreview}>
                <div style={styles.miniBarChart}>
                  {Object.entries(preview).map(([key, value], index) => {
                    const maxVal = Math.max(...Object.values(preview).map(v => v || 0));
                    const percentage = maxVal > 0 ? ((value || 0) / maxVal) * 100 : 0;
                    const colors = ['#1a365d', '#059669', '#f59e0b', '#dc2626'];
                    return (
                      <div key={key} style={styles.miniBar}>
                        <div style={styles.miniBarLabel}>{key.substring(0, 3)}</div>
                        <div
                          style={{
                            ...styles.miniBarFill,
                            width: `${percentage}%`,
                            backgroundColor: colors[index % colors.length],
                          }}
                        >
                          <span style={styles.miniBarValue}>{value || 0}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div style={styles.emptyPreview}>
              <p style={styles.emptyText}>Nenhum dado disponível para preview</p>
            </div>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>⚙️ Configurar Relatório</h2>

          <div style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Tipo de Relatório</label>
            <select
              value={filters.tipo}
              onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
              style={styles.select}
            >
              <option value="usuarios">Usuários</option>
              <option value="pagamentos">Pagamentos</option>
              <option value="convenios">Convênios</option>
              <option value="notificacoes">Notificações</option>
              <option value="financeiro">Financeiro</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Formato</label>
            <select
              value={filters.formato}
              onChange={(e) => setFilters({ ...filters, formato: e.target.value })}
              style={styles.select}
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
              <option value="xlsx">Excel (XLSX)</option>
            </select>
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Data Início</label>
              <input
                type="date"
                value={filters.dataInicio}
                onChange={(e) => setFilters({ ...filters, dataInicio: e.target.value })}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Data Fim</label>
              <input
                type="date"
                value={filters.dataFim}
                onChange={(e) => setFilters({ ...filters, dataFim: e.target.value })}
                style={styles.input}
              />
            </div>
          </div>

          {filters.tipo === 'usuarios' && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                style={styles.select}
              >
                <option value="">Todos</option>
                <option value="ATIVO">Ativo</option>
                <option value="INADIMPLENTE">Inadimplente</option>
                <option value="INATIVO">Inativo</option>
              </select>
            </div>
          )}

            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            <button
              onClick={handleExport}
              disabled={loading}
              style={{
                ...styles.button,
                ...(loading ? styles.buttonDisabled : {}),
              }}
            >
              {loading ? '⏳ Exportando...' : '📥 Exportar Relatório'}
            </button>
          </div>
        </div>
      </div>

      <div style={styles.infoCard}>
        <div style={styles.infoHeader}>
          <div style={styles.infoIcon}>ℹ️</div>
          <h3 style={styles.infoTitle}>Informações sobre Relatórios</h3>
        </div>
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <div style={styles.infoItemIcon}>📄</div>
            <div>
              <h4 style={styles.infoItemTitle}>CSV</h4>
              <p style={styles.infoItemText}>Compatível com Excel e planilhas</p>
            </div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoItemIcon}>📋</div>
            <div>
              <h4 style={styles.infoItemTitle}>PDF</h4>
              <p style={styles.infoItemText}>Ideal para impressão e visualização</p>
            </div>
          </div>
          <div style={styles.infoItem}>
            <div style={styles.infoItemIcon}>📊</div>
            <div>
              <h4 style={styles.infoItemTitle}>Excel</h4>
              <p style={styles.infoItemText}>Formato nativo do Microsoft Excel</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2.5rem',
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
  singleCard: {
    maxWidth: '800px',
    margin: '0 auto 2rem auto',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  },
  previewTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: '1.5rem',
  },
  previewStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  previewStat: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
  },
  previewLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  previewValue: {
    fontSize: '1.875rem',
    fontWeight: '800',
    color: '#1a365d',
    lineHeight: 1,
  },
  chartPreview: {
    marginTop: '1.5rem',
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
  },
  miniBarChart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  miniBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  miniBarLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    width: '40px',
    flexShrink: 0,
  },
  miniBarFill: {
    height: '32px',
    borderRadius: '0.375rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: '0.75rem',
    transition: 'width 0.3s',
    minWidth: '60px',
  },
  miniBarValue: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  },
  cardTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    marginBottom: '2rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    outline: 'none',
  },
  select: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    outline: 'none',
    backgroundColor: '#ffffff',
  },
  errorBox: {
    padding: '1rem 1.25rem',
    backgroundColor: '#fef2f2',
    border: '2px solid #fecaca',
    borderRadius: '0.5rem',
    color: '#991b1b',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  successBox: {
    padding: '1rem 1.25rem',
    backgroundColor: '#f0fdf4',
    border: '2px solid #bbf7d0',
    borderRadius: '0.5rem',
    color: '#166534',
    fontSize: '0.875rem',
    fontWeight: '600',
  },
  button: {
    padding: '1rem 2rem',
    background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    width: '100%',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  loadingPreview: {
    padding: '3rem 2rem',
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '0.875rem',
  },
  emptyPreview: {
    padding: '3rem 2rem',
    textAlign: 'center',
  },
  emptyText: {
    color: '#6b7280',
    fontSize: '0.875rem',
    margin: 0,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  },
  infoHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f3f4f6',
  },
  infoIcon: {
    fontSize: '1.5rem',
  },
  infoTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1a365d',
    margin: 0,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
    gap: '1.25rem',
  },
  infoItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1.25rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
  },
  infoItemIcon: {
    fontSize: '2rem',
    flexShrink: 0,
  },
  infoItemTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 0.25rem 0',
  },
  infoItemText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.5',
  },
};

export default Reports;
