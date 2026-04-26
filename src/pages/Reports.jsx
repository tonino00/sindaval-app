import { useMemo, useState, useEffect } from 'react';
import api from '../services/api';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const resolvedVfs = pdfFonts?.pdfMake?.vfs || pdfFonts?.vfs;
if (resolvedVfs) {
  pdfMake.vfs = resolvedVfs;
}

const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const shimmerCss = `
    @keyframes reports_shimmer {
      0% { background-position: -600px 0; }
      100% { background-position: 600px 0; }
    }
  `;
  const [filters, setFilters] = useState({
    tipo: 'usuarios',
    formato: 'pdf',
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
      if (filters.tipo === 'convenios') {
        const response = await api.get('/agreements');
        setPreviewData((prev) => ({
          ...prev,
          [filters.tipo]: { agreements: response.data || [] },
        }));
        return;
      }

      const response = await api.get(`/admin/reports/preview?tipo=${filters.tipo}`);
      setPreviewData((prev) => ({
        ...prev,
        [filters.tipo]: response.data,
      }));
    } catch (err) {
      console.error('Erro ao carregar preview:', err);
    } finally {
      setLoadingPreview(false);
    }
  };

  const formatPreviewLabel = (key) => {
    if (!key) return '';
    return key
      .toString()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const formatNumberBR = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value ?? '');
    return num.toLocaleString('pt-BR');
  };

  const formatCurrencyBR = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value ?? '');
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatPercentBR = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return String(value ?? '');
    return `${num.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`;
  };

  const formatDateBR = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    if (!year || !month || !day) return isoDate;
    return `${day}/${month}/${year}`;
  };

  const getPeriodoLabel = () => {
    if (filters.dataInicio && filters.dataFim) return `${filters.dataInicio} a ${filters.dataFim}`;
    if (filters.dataInicio) return `A partir de ${filters.dataInicio}`;
    if (filters.dataFim) return `Até ${filters.dataFim}`;
    return 'Todo o período';
  };

  const getResumo = (dados) => {
    if (dados?.agreements && Array.isArray(dados.agreements)) {
      const descontos = dados.agreements
        .map((a) => Number(a?.desconto))
        .filter((n) => !Number.isNaN(n));
      const totalRegistros = dados.agreements.length;
      const descontoMedio = descontos.length
        ? descontos.reduce((acc, v) => acc + v, 0) / descontos.length
        : 0;
      return { totalRegistros, somaValores: descontoMedio };
    }

    const values = Object.values(dados || {}).map((v) => Number(v) || 0);
    const totalRegistros = values.reduce((acc, v) => acc + v, 0);
    const somaValores = values.reduce((acc, v) => acc + v, 0);
    return { totalRegistros, somaValores };
  };

  const gerarPDFProfissional = (dados, tipo, filtrosAtuais) => {
    const colors = {
      primary: '#1a365d',
      light: '#f3f4f6',
      zebra: '#f9fafb',
      text: '#111827',
      muted: '#6b7280',
    };

    const now = new Date();
    const periodo = (() => {
      if (filtrosAtuais?.dataInicio && filtrosAtuais?.dataFim) return `${formatDateBR(filtrosAtuais.dataInicio)} a ${formatDateBR(filtrosAtuais.dataFim)}`;
      if (filtrosAtuais?.dataInicio) return `A partir de ${formatDateBR(filtrosAtuais.dataInicio)}`;
      if (filtrosAtuais?.dataFim) return `Até ${formatDateBR(filtrosAtuais.dataFim)}`;
      return 'Todo o período';
    })();

    const resumo = getResumo(dados);

    const isConvenios = tipo === 'convenios' && Array.isArray(dados?.agreements);
    const isNotificacoes = tipo === 'notificacoes';
    const entries = isConvenios ? [] : Object.entries(dados || {});

    const body = isConvenios
      ? [
          [
            { text: 'Convênio', style: 'tableHeader' },
            { text: 'Desconto', style: 'tableHeader', alignment: 'right' },
            { text: 'Status', style: 'tableHeader', alignment: 'right' },
          ],
          ...(dados.agreements || []).map((agreement, idx) => [
            { text: agreement?.titulo || '-', fillColor: idx % 2 === 0 ? colors.zebra : '#ffffff' },
            {
              text: formatPercentBR(agreement?.desconto ?? 0),
              alignment: 'right',
              fillColor: idx % 2 === 0 ? colors.zebra : '#ffffff',
            },
            {
              text: agreement?.ativo ? 'Ativo' : 'Inativo',
              alignment: 'right',
              fillColor: idx % 2 === 0 ? colors.zebra : '#ffffff',
            },
          ]),
        ]
      : [
          [
            { text: 'Métrica', style: 'tableHeader' },
            { text: 'Valor', style: 'tableHeader', alignment: 'right' },
          ],
          ...entries.map(([k, v], idx) => [
            { text: formatPreviewLabel(k), fillColor: idx % 2 === 0 ? colors.zebra : '#ffffff' },
            { text: formatNumberBR(v), alignment: 'right', fillColor: idx % 2 === 0 ? colors.zebra : '#ffffff' },
          ]),
        ];

    const docDefinition = {
      pageSize: 'A4',
      pageMargins: [40, 80, 40, 60],
      header: {
        margin: [40, 25, 40, 0],
        columns: [
          {
            stack: [
              { text: 'SINDAVAL', style: 'brand' },
              { text: 'Relatório Institucional', style: 'brandSub' },
            ],
          },
          {
            stack: [
              { text: `Tipo: ${getTipoLabel(tipo)}`, style: 'headerRight' },
              { text: `Período: ${periodo}`, style: 'headerRight' },
            ],
            alignment: 'right',
          },
        ],
      },
      footer: (currentPage, pageCount) => ({
        margin: [40, 0, 40, 25],
        columns: [
          { text: `Gerado em: ${now.toLocaleString('pt-BR')}`, style: 'footerLeft' },
          { text: `${currentPage} / ${pageCount}`, style: 'footerRight', alignment: 'right' },
        ],
      }),
      content: [
        {
          text: 'Resumo',
          style: 'sectionTitle',
          margin: [0, 0, 0, 10],
        },
        {
          columns: [
            {
              width: isNotificacoes ? '*' : '*',
              stack: [
                { text: 'Total de registros', style: 'metricLabel' },
                { text: formatNumberBR(resumo.totalRegistros), style: 'metricValue' },
              ],
              style: 'metricCard',
            },
            ...(!isNotificacoes
              ? [
                  {
                    width: '*',
                    stack: [
                      { text: isConvenios ? 'Desconto médio (indicativo)' : 'Soma (indicativa)', style: 'metricLabel' },
                      {
                        text: isConvenios
                          ? formatPercentBR(resumo.somaValores)
                          : formatCurrencyBR(resumo.somaValores),
                        style: 'metricValue',
                      },
                    ],
                    style: 'metricCard',
                  },
                ]
              : []),
          ],
          columnGap: 12,
          margin: [0, 0, 0, 16],
        },
        {
          text: 'Detalhamento',
          style: 'sectionTitle',
          margin: [0, 0, 0, 10],
        },
        {
          table: {
            headerRows: 1,
            widths: isConvenios ? ['*', 80, 60] : ['*', 120],
            body,
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#e5e7eb',
            vLineColor: () => '#e5e7eb',
            paddingLeft: () => 8,
            paddingRight: () => 8,
            paddingTop: () => 6,
            paddingBottom: () => 6,
          },
        },
      ],
      styles: {
        brand: {
          fontSize: 16,
          bold: true,
          color: colors.primary,
        },
        brandSub: {
          fontSize: 10,
          color: colors.muted,
          margin: [0, 2, 0, 0],
        },
        headerRight: {
          fontSize: 9,
          color: colors.muted,
        },
        footerLeft: {
          fontSize: 8,
          color: colors.muted,
        },
        footerRight: {
          fontSize: 8,
          color: colors.muted,
        },
        sectionTitle: {
          fontSize: 12,
          bold: true,
          color: colors.primary,
        },
        metricCard: {
          margin: [0, 0, 0, 0],
          fillColor: colors.light,
          border: [false, false, false, false],
        },
        metricLabel: {
          fontSize: 9,
          color: colors.muted,
          margin: [10, 10, 10, 2],
        },
        metricValue: {
          fontSize: 16,
          bold: true,
          color: colors.text,
          margin: [10, 0, 10, 10],
        },
        tableHeader: {
          bold: true,
          fillColor: colors.primary,
          color: '#ffffff',
          fontSize: 10,
        },
      },
      defaultStyle: {
        fontSize: 10,
        color: colors.text,
      },
    };

    pdfMake.createPdf(docDefinition).download(`relatorio-${tipo}-${Date.now()}.pdf`);
  };

  const handleExport = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (filters.formato === 'pdf') {
        if (filters.tipo === 'convenios') {
          const response = await api.get('/agreements');
          gerarPDFProfissional({ agreements: response.data || [] }, filters.tipo, filters);
        } else {
          const response = await api.get(`/admin/reports/preview?tipo=${filters.tipo}`);
          gerarPDFProfissional(response.data, filters.tipo, filters);
        }
        setSuccess('PDF gerado com sucesso!');
      } else {
        const response = await api.post('/admin/reports/export', filters, {
          responseType: 'blob',
          withCredentials: true,
        });

        const disposition = response.headers?.['content-disposition'];
        const filenameMatch = disposition?.match(/filename=([^;]+)/i);
        const filename = filenameMatch?.[1] ?? `relatorio-${filters.tipo}-${Date.now()}.${filters.formato}`;

        const blob = new Blob([response.data], { type: response.headers?.['content-type'] });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        setSuccess('Relatório exportado com sucesso!');
      }
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

  const previewAgreements = useMemo(() => {
    if (filters.tipo !== 'convenios') return [];
    return Array.isArray(preview?.agreements) ? preview.agreements : [];
  }, [filters.tipo, preview]);

  const chartData = useMemo(() => {
    if (filters.tipo === 'convenios') {
      return (previewAgreements || []).slice(0, 12).map((agreement) => ({
        name: agreement?.titulo || '-',
        value: Number(agreement?.desconto) || 0,
      }));
    }

    const entries = Object.entries(preview || {});
    return entries.map(([key, value]) => ({
      name: formatPreviewLabel(key),
      value: Number(value) || 0,
    }));
  }, [filters.tipo, preview, previewAgreements]);

  const getTipoLabel = (tipo) => {
    if (tipo === 'usuarios') return 'Usuários';
    if (tipo === 'pagamentos') return 'Pagamentos';
    if (tipo === 'convenios') return 'Convênios';
    if (tipo === 'notificacoes') return 'Notificações';
    if (tipo === 'financeiro') return 'Financeiro';
    return 'Relatório';
  };

  const getFormatoLabel = (formato) => {
    if (formato === 'csv') return 'CSV';
    if (formato === 'pdf') return 'PDF';
    if (formato === 'xlsx') return 'Excel (XLSX)';
    return formato;
  };

  return (
    <div style={styles.container}>
      <style>{shimmerCss}</style>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Relatórios e Análises</h1>
          <p style={styles.subtitle}>Exporte dados e gere relatórios personalizados</p>
        </div>
        <div style={styles.headerBadge}>
          <span style={styles.headerBadgeLabel}>Seleção Atual</span>
          <span style={styles.headerBadgeValue}>
            {getTipoLabel(filters.tipo)} • {getFormatoLabel(filters.formato)}
          </span>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.previewCard}>
          <div style={styles.previewHeader}>
            <h2 style={styles.previewTitle}>📊 Visão Geral</h2>
            <button
              onClick={fetchPreviewData}
              style={styles.refreshButton}
              disabled={loadingPreview}
            >
              {loadingPreview ? '⏳ Atualizando...' : '🔄 Atualizar'}
            </button>
          </div>
          {loadingPreview ? (
            <div style={styles.loadingPreview}>
              <div style={styles.skeletonStack}>
                <div style={styles.skeletonRow}>
                  <div style={{ ...styles.skeletonLine, width: '55%' }} />
                  <div style={{ ...styles.skeletonLine, width: '25%' }} />
                </div>
                <div style={styles.skeletonRow}>
                  <div style={{ ...styles.skeletonLine, width: '62%' }} />
                  <div style={{ ...styles.skeletonLine, width: '20%' }} />
                </div>
                <div style={styles.skeletonRow}>
                  <div style={{ ...styles.skeletonLine, width: '48%' }} />
                  <div style={{ ...styles.skeletonLine, width: '30%' }} />
                </div>
                <div style={styles.skeletonChart} />
              </div>
            </div>
          ) : Object.keys(preview).length > 0 ? (
            <>
              {filters.tipo === 'convenios' ? (
                <div style={styles.previewStats}>
                  <div style={styles.previewStat}>
                    <span style={styles.previewLabel}>Total de convênios</span>
                    <span style={styles.previewValue}>{previewAgreements.length}</span>
                  </div>
                  <div style={styles.previewStat}>
                    <span style={styles.previewLabel}>Desconto médio (indicativo)</span>
                    <span style={styles.previewValue}>
                      {formatPercentBR(getResumo({ agreements: previewAgreements }).somaValores)}
                    </span>
                  </div>
                </div>
              ) : filters.tipo === 'notificacoes' ? (
                <div style={styles.previewStats}>
                  <div style={styles.previewStat}>
                    <span style={styles.previewLabel}>Total de registros</span>
                    <span style={styles.previewValue}>
                      {formatNumberBR(getResumo(preview).totalRegistros)}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={styles.previewStats}>
                  {Object.entries(preview).map(([key, value]) => (
                    <div key={key} style={styles.previewStat}>
                      <span style={styles.previewLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      <span style={styles.previewValue}>{value || 0}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <div style={styles.chartPreview}>
                <div style={styles.rechartsContainer}>
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" angle={-20} textAnchor="end" interval={0} height={60} />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => (filters.tipo === 'convenios' ? formatPercentBR(value) : formatNumberBR(value))}
                        labelStyle={{ fontWeight: 700 }}
                      />
                      <Bar dataKey="value" fill="#1a365d" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {filters.tipo === 'convenios' && (
                <div style={styles.agreementsTableWrapper}>
                  <div style={styles.agreementsTableHeader}>
                    <div style={styles.agreementsColTitle}>Convênio</div>
                    <div style={styles.agreementsColDiscount}>Desconto</div>
                  </div>
                  <div style={styles.agreementsTableBody}>
                    {previewAgreements.map((agreement) => (
                      <div key={agreement?.id ?? agreement?.titulo} style={styles.agreementsRow}>
                        <div style={styles.agreementsColTitle}>{agreement?.titulo || '-'}</div>
                        <div style={styles.agreementsColDiscount}>{formatPercentBR(agreement?.desconto ?? 0)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            <div style={styles.formRow}>
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
                  <option value="pdf">PDF</option>
                  <option value="xlsx">Excel (XLSX)</option>
                </select>
              </div>
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
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '1.25rem',
    flexWrap: 'wrap',
  },
  headerBadge: {
    padding: '0.75rem 1rem',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '0.75rem',
    minWidth: '240px',
  },
  headerBadgeLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '0.25rem',
  },
  headerBadgeValue: {
    display: 'block',
    fontSize: '0.9375rem',
    fontWeight: '700',
    color: '#111827',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
    gap: '1.5rem',
    marginBottom: '1.5rem',
  },
  previewCard: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
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
    margin: 0,
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  refreshButton: {
    padding: '0.625rem 0.875rem',
    borderRadius: '0.75rem',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#1a365d',
  },
  previewStats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
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
  agreementsTableWrapper: {
    marginTop: '1.5rem',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  agreementsTableHeader: {
    display: 'grid',
    gridTemplateColumns: '1fr 120px',
    gap: '0.75rem',
    padding: '0.875rem 1rem',
    backgroundColor: '#1a365d',
    color: '#ffffff',
    fontWeight: '700',
    fontSize: '0.875rem',
  },
  agreementsTableBody: {
    maxHeight: '260px',
    overflowY: 'auto',
    backgroundColor: '#ffffff',
  },
  agreementsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 120px',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    borderBottom: '1px solid #f3f4f6',
    alignItems: 'center',
  },
  agreementsColTitle: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#111827',
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  agreementsColDiscount: {
    fontSize: '0.9375rem',
    fontWeight: '800',
    color: '#1a365d',
    textAlign: 'right',
  },
  miniBarChart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  rechartsContainer: {
    width: '100%',
    height: '260px',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
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
    backgroundImage: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
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
  skeletonStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.85rem',
  },
  skeletonRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
  },
  skeletonLine: {
    height: '14px',
    borderRadius: '999px',
    backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 40%, #e5e7eb 80%)',
    backgroundSize: '600px 100%',
    animation: 'reports_shimmer 1.25s linear infinite',
  },
  skeletonChart: {
    height: '220px',
    borderRadius: '0.75rem',
    backgroundImage: 'linear-gradient(90deg, #e5e7eb 0%, #f3f4f6 40%, #e5e7eb 80%)',
    backgroundSize: '600px 100%',
    animation: 'reports_shimmer 1.25s linear infinite',
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
