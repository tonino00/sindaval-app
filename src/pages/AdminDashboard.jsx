import { useState, useEffect } from 'react';
import api from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [monthlyData, setMonthlyData] = useState([]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/dashboard/stats');
      setStats(response.data);
      
      // Backend agora retorna pagamentosMensais
      if (response.data.pagamentosMensais && response.data.pagamentosMensais.length > 0) {
        setMonthlyData(response.data.pagamentosMensais);
      } else {
        setMonthlyData([]);
      }
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Carregando estatísticas...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={styles.container}>
        <p>Erro ao carregar estatísticas</p>
      </div>
    );
  }

  const maxValue = monthlyData.length > 0 
    ? Math.max(...monthlyData.map(d => Math.max(d.pix || 0, d.cartao || 0)))
    : 100;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard Administrativo</h1>
          <p style={styles.subtitle}>Visão geral e métricas do sistema</p>
        </div>
        <div style={styles.headerActions}>
          <button style={styles.refreshButton} onClick={fetchStats}>
            🔄 Atualizar
          </button>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.statPrimary }}>
          <div style={styles.statIcon}>👥</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Total de Sindicalizados</h3>
            <p style={styles.statValue}>{stats.totalSindicalizados || 0}</p>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statSuccess }}>
          <div style={styles.statIcon}>✅</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Ativos</h3>
            <p style={styles.statValue}>{stats.totalAtivos || 0}</p>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statWarning }}>
          <div style={styles.statIcon}>⚠️</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Inadimplentes</h3>
            <p style={styles.statValue}>{stats.totalInadimplentes || 0}</p>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statInfo }}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Total Recebido</h3>
            <p style={styles.statValue}>R$ {(stats.totalRecebido || 0).toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={{ ...styles.statCard, ...styles.statSuccess }}>
          <div style={styles.statIcon}>💳</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Pagamentos Pix</h3>
            <p style={styles.statValue}>{stats.pagamentosPix || 0}</p>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statInfo }}>
          <div style={styles.statIcon}>💰</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Pagamentos Cartão</h3>
            <p style={styles.statValue}>{stats.pagamentosCartao || 0}</p>
          </div>
        </div>

        <div style={{ ...styles.statCard, ...styles.statPrimary }}>
          <div style={styles.statIcon}>📊</div>
          <div style={styles.statContent}>
            <h3 style={styles.statTitle}>Taxa de Adimplência</h3>
            <p style={styles.statValue}>{stats.percentualAdimplencia || '0%'}</p>
          </div>
        </div>
      </div>

      <div style={styles.chartsGrid}>
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Pagamentos Mensais</h3>
            <div style={styles.chartLegend}>
              <span style={styles.legendItem}>
                <span style={{ ...styles.legendDot, backgroundColor: '#059669' }}></span>
                Pix
              </span>
              <span style={styles.legendItem}>
                <span style={{ ...styles.legendDot, backgroundColor: '#2563eb' }}></span>
                Cartão
              </span>
            </div>
          </div>
          {monthlyData.length > 0 ? (
            <div style={styles.barChart}>
              {monthlyData.map((data, index) => (
                <div key={index} style={styles.barGroup}>
                  <div style={styles.barContainer}>
                    <div
                      style={{
                        ...styles.bar,
                        ...styles.barPix,
                        height: `${((data.pix || 0) / maxValue) * 100}%`,
                      }}
                    >
                      <span style={styles.barValue}>{data.pix || 0}</span>
                    </div>
                    <div
                      style={{
                        ...styles.bar,
                        ...styles.barCartao,
                        height: `${((data.cartao || 0) / maxValue) * 100}%`,
                      }}
                    >
                      <span style={styles.barValue}>{data.cartao || 0}</span>
                    </div>
                  </div>
                  <span style={styles.barLabel}>{data.month}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.emptyChart}>
              <p style={styles.emptyText}>Nenhum dado de pagamento mensal disponível</p>
            </div>
          )}
        </div>
      </div>

      <div style={styles.activityCard}>
        <h3 style={styles.chartTitle}>Atividade Recente</h3>
        {stats?.atividadeRecente && stats.atividadeRecente.length > 0 ? (
          <div style={styles.activityList}>
            {stats.atividadeRecente.map((activity, index) => (
              <div key={index} style={styles.activityItem}>
                <div style={styles.activityIcon}>📊</div>
                <div style={styles.activityContent}>
                  <span style={styles.activityText}>{activity.descricao}</span>
                  <span style={styles.activityDate}>
                    {new Date(activity.data).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p style={styles.emptyText}>Nenhuma atividade recente</p>
        )}
      </div>
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
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
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
    transition: 'all 0.3s',
  },
  statPrimary: {
    borderLeft: '4px solid #1a365d',
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
    margin: '0 0 0.5rem 0',
    lineHeight: 1,
  },
  statChange: {
    fontSize: '0.8125rem',
    color: '#059669',
    fontWeight: '600',
    margin: 0,
  },
  chartsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  chartCard: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  },
  chartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
    gap: '1rem',
  },
  chartTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1a365d',
    margin: 0,
  },
  chartLegend: {
    display: 'flex',
    gap: '1.5rem',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  legendDot: {
    width: '12px',
    height: '12px',
    borderRadius: '50%',
  },
  barChart: {
    display: 'flex',
    alignItems: 'flex-end',
    height: '280px',
    padding: '1rem 0',
    paddingBottom: '1.5rem',
    gap: '0.75rem',
    overflowX: 'auto',
    overflowY: 'hidden',
    width: '100%',
  },
  barGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    minWidth: '80px',
    flexShrink: 0,
  },
  barContainer: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '0.25rem',
    height: '240px',
    width: '100%',
    justifyContent: 'center',
  },
  bar: {
    width: '100%',
    maxWidth: '32px',
    borderRadius: '0.375rem 0.375rem 0 0',
    transition: 'all 0.3s',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '0.5rem',
  },
  barPix: {
    backgroundColor: '#059669',
  },
  barCartao: {
    backgroundColor: '#2563eb',
  },
  barValue: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#ffffff',
  },
  barLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
  },
  pieChartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
    alignItems: 'center',
  },
  pieChart: {
    width: '200px',
    height: '200px',
  },
  pieSlice: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieCenter: {
    width: '140px',
    height: '140px',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  pieValue: {
    fontSize: '2.5rem',
    fontWeight: '800',
    color: '#059669',
    lineHeight: 1,
  },
  pieLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '600',
    marginTop: '0.5rem',
  },
  pieStats: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    width: '100%',
  },
  pieStatItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
  },
  pieStatDot: {
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    flexShrink: 0,
  },
  pieStatLabel: {
    flex: 1,
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  pieStatValue: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#111827',
  },
  emptyChart: {
    padding: '3rem 2rem',
    textAlign: 'center',
  },
  infoMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '0.75rem',
    marginBottom: '2rem',
  },
  infoIcon: {
    fontSize: '1.5rem',
  },
  infoText: {
    fontSize: '0.875rem',
    color: '#1e40af',
    margin: 0,
  },
  activityCard: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  },
  activityList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  activityItem: {
    display: 'flex',
    gap: '1rem',
    padding: '1.25rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s',
  },
  activityIcon: {
    fontSize: '1.5rem',
    flexShrink: 0,
  },
  activityContent: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  activityText: {
    fontSize: '0.9375rem',
    color: '#374151',
    fontWeight: '500',
  },
  activityDate: {
    fontSize: '0.8125rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    textAlign: 'center',
    padding: '2rem',
  },
};

export default AdminDashboard;
