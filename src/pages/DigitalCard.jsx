import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api, { API_URL } from '../services/api';
import { getProfile } from '../features/auth/authSlice';

const DigitalCard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    generateQRCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/digital-card/qrcode');
      
      // Backend retorna string direta: "data:image/png;base64,..."
      if (typeof response.data === 'string' && response.data.startsWith('data:image')) {
        setQrCode(response.data);
      } else {
        console.error('Formato inesperado de QR Code:', response.data);
        setError('QR Code não disponível');
      }
    } catch (err) {
      console.error('Erro ao gerar QR Code:', err);
      setError(err.response?.data?.message || 'Erro ao carregar QR Code');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <p>Carregando carteira digital...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <h1 style={styles.title}>Carteira Digital do Sindicalizado</h1>
        <p style={styles.subtitle}>Apresente este documento para validação de benefícios</p>
      </div>

      <div style={styles.cardContainer}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div style={styles.headerTop}>
              <div style={styles.headerLeft}>
                <h2 style={styles.cardTitle}>SINDAVAL</h2>
                <p style={styles.cardSubtitle}>SINDICATO DOS ADVOGADOS DE ALAGOAS</p>
              </div>
              <div style={styles.headerRight}>
                <div style={styles.cardNumber}>N° {user?.id?.substring(0, 8).toUpperCase()}</div>
                <div style={styles.validityBadge}>VÁLIDO</div>
              </div>
            </div>
          </div>

          <div style={styles.cardBody}>
            <div style={styles.mainContent}>
              <div style={styles.photoSection}>
                {user?.fotoUrl ? (
                  <img 
                    src={API_URL + user.fotoUrl} 
                    alt={user.nomeCompleto}
                    style={styles.userPhotoLarge}
                  />
                ) : (
                  <div style={styles.userPhotoPlaceholder}>
                    {user?.nomeCompleto?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <div style={styles.photoLabel}>FOTO</div>
              </div>
              
              <div style={styles.dataSection}>
                <div style={styles.dataRow}>
                  <div style={styles.dataField}>
                    <label style={styles.fieldLabel}>NOME COMPLETO</label>
                    <p style={styles.fieldValue}>{user?.nomeCompleto?.toUpperCase()}</p>
                  </div>
                </div>

                <div style={styles.dataRow}>
                  <div style={styles.dataField}>
                    <label style={styles.fieldLabel}>CPF</label>
                    <p style={styles.fieldValue}>{user?.cpf || 'NÃO INFORMADO'}</p>
                  </div>
                  <div style={styles.dataField}>
                    <label style={styles.fieldLabel}>INSCRIÇÃO OAB</label>
                    <p style={styles.fieldValue}>{user?.numeroOAB || 'N/A'}</p>
                  </div>
                </div>

                <div style={styles.dataRow}>
                  <div style={styles.dataField}>
                    <label style={styles.fieldLabel}>E-MAIL</label>
                    <p style={styles.fieldValue}>{user?.email}</p>
                  </div>
                </div>

                <div style={styles.dataRow}>
                  <div style={styles.dataField}>
                    <label style={styles.fieldLabel}>SITUAÇÃO</label>
                    <span
                      style={{
                        ...styles.statusBadgeOAB,
                        ...(user?.status === 'ATIVO' ? styles.statusActiveOAB : {}),
                        ...(user?.status === 'INADIMPLENTE' ? styles.statusWarningOAB : {}),
                        ...(user?.status === 'INATIVO' ? styles.statusInactiveOAB : {}),
                      }}
                    >
                      {user?.status}
                    </span>
                  </div>
                  {user?.createdAt && (
                    <div style={styles.dataField}>
                      <label style={styles.fieldLabel}>MEMBRO DESDE</label>
                      <p style={styles.fieldValue}>
                        {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div style={styles.qrCodeSection}>
              <div style={styles.qrCodeContainer}>
                {qrCode ? (
                  <>
                    <div style={styles.qrCodeFrame}>
                      <img src={qrCode} alt="QR Code de Validação" style={styles.qrCodeImage} />
                    </div>
                    <div style={styles.qrCodeLabel}>
                      <div style={styles.qrCodeIcon}>📱</div>
                      <div>
                        <p style={styles.qrCodeTitle}>Código de Validação</p>
                        <p style={styles.qrCodeText}>Escaneie para verificar autenticidade</p>
                      </div>
                    </div>
                  </>
                ) : error ? (
                  <div style={styles.qrCodeError}>
                    <div style={styles.qrCodeErrorIcon}>⚠️</div>
                    <div>
                      <p style={styles.qrCodeErrorTitle}>QR Code Indisponível</p>
                      <p style={styles.qrCodeErrorText}>{error}</p>
                      <button onClick={generateQRCode} style={styles.retryButton}>
                        🔄 Tentar Novamente
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.qrCodeLoading}>
                    <div style={styles.loadingSpinner}>⏳</div>
                    <p style={styles.loadingText}>Gerando QR Code...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div style={styles.instructionsCard}>
          <div style={styles.instructionsHeader}>
            <div style={styles.instructionsIcon}>ℹ️</div>
            <h3 style={styles.instructionsTitle}>Instruções de Uso</h3>
          </div>
          <div style={styles.instructionsGrid}>
            <div style={styles.instructionItem}>
              <div style={styles.instructionNumber}>1</div>
              <div>
                <h4 style={styles.instructionTitle}>Apresentação</h4>
                <p style={styles.instructionText}>Mostre o QR Code em estabelecimentos conveniados</p>
              </div>
            </div>
            <div style={styles.instructionItem}>
              <div style={styles.instructionNumber}>2</div>
              <div>
                <h4 style={styles.instructionTitle}>Validação</h4>
                <p style={styles.instructionText}>Aguarde a leitura do código para confirmação</p>
              </div>
            </div>
            <div style={styles.instructionItem}>
              <div style={styles.instructionNumber}>3</div>
              <div>
                <h4 style={styles.instructionTitle}>Segurança</h4>
                <p style={styles.instructionText}>Não compartilhe ou fotografe sua carteira</p>
              </div>
            </div>
          </div>
        </div>

        {user?.status === 'INADIMPLENTE' && (
          <div style={styles.alertCard}>
            <div style={styles.alertIcon}>⚠️</div>
            <div style={styles.alertContent}>
              <h4 style={styles.alertTitle}>Situação Pendente</h4>
              <p style={styles.alertText}>Regularize seus pagamentos para continuar usufruindo dos benefícios do sindicato.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
  },
  pageHeader: {
    marginBottom: '2.5rem',
    textAlign: 'center',
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
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '1.25rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  cardHeader: {
    background: '#1a365d',
    padding: '1.5rem 2rem',
    color: '#ffffff',
    borderBottom: '4px solid #d4af37',
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
  },
  logoCircle: {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.75rem',
    fontWeight: '800',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  userPhoto: {
    width: '3.5rem',
    height: '3.5rem',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid rgba(255, 255, 255, 0.9)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
  },
  cardTitle: {
    fontSize: '1.75rem',
    fontWeight: '900',
    margin: '0 0 0.25rem 0',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: '#ffffff',
  },
  cardSubtitle: {
    fontSize: '0.75rem',
    margin: 0,
    fontWeight: '600',
    letterSpacing: '0.1em',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  validityBadge: {
    backgroundColor: '#059669',
    color: '#ffffff',
    padding: '0.375rem 0.875rem',
    borderRadius: '0.25rem',
    fontSize: '0.75rem',
    fontWeight: '800',
    letterSpacing: '0.1em',
  },
  cardNumber: {
    fontSize: '0.875rem',
    fontWeight: '700',
    letterSpacing: '0.1em',
    color: '#ffffff',
  },
  cardBody: {
    padding: '2.5rem 2rem',
    backgroundColor: '#ffffff',
  },
  mainContent: {
    display: 'flex',
    gap: '2.5rem',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  photoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
  },
  photoLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: '0.1em',
  },
  userPhotoLarge: {
    width: '140px',
    height: '180px',
    objectFit: 'cover',
    border: '3px solid #1a365d',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  userPhotoPlaceholder: {
    width: '140px',
    height: '180px',
    backgroundColor: '#f3f4f6',
    border: '3px solid #1a365d',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '4rem',
    fontWeight: '800',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  },
  dataSection: {
    flex: 1,
    minWidth: '350px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  dataRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid #e5e7eb',
  },
  dataField: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.375rem',
  },
  fieldLabel: {
    fontSize: '0.6875rem',
    fontWeight: '700',
    color: '#6b7280',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  fieldValue: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    lineHeight: '1.4',
  },
  statusBadgeOAB: {
    display: 'inline-block',
    padding: '0.375rem 1rem',
    fontSize: '0.8125rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    border: '2px solid',
  },
  statusActiveOAB: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderColor: '#059669',
  },
  statusWarningOAB: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderColor: '#f59e0b',
  },
  statusInactiveOAB: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
    borderColor: '#9ca3af',
  },
  infoGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  infoRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  infoLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  infoValue: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
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
  qrCodeSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCodeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  qrCodeFrame: {
    padding: '1.5rem',
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: '3px solid #1a365d',
    position: 'relative',
  },
  qrCodeImage: {
    width: '220px',
    height: '220px',
    display: 'block',
  },
  qrCodeLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
  },
  qrCodeIcon: {
    fontSize: '2rem',
  },
  qrCodeTitle: {
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#1a365d',
    margin: '0 0 0.25rem 0',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  qrCodeText: {
    fontSize: '0.8125rem',
    color: '#6b7280',
    margin: 0,
  },
  instructionsCard: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  },
  instructionsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f3f4f6',
  },
  instructionsIcon: {
    fontSize: '1.5rem',
  },
  instructionsTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1a365d',
    margin: 0,
  },
  instructionsGrid: {
    display: 'grid',
    gap: '1.25rem',
  },
  instructionItem: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  instructionNumber: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    backgroundColor: '#1a365d',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  instructionTitle: {
    fontSize: '0.9375rem',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 0.25rem 0',
  },
  instructionText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.5',
  },
  alertCard: {
    display: 'flex',
    gap: '1rem',
    padding: '1.5rem',
    backgroundColor: '#fef3c7',
    border: '2px solid #fbbf24',
    borderRadius: '0.75rem',
    alignItems: 'flex-start',
  },
  alertIcon: {
    fontSize: '2rem',
    flexShrink: 0,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#92400e',
    margin: '0 0 0.5rem 0',
  },
  alertText: {
    fontSize: '0.875rem',
    color: '#92400e',
    margin: 0,
    lineHeight: '1.5',
  },
  qrCodeError: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '2rem',
    backgroundColor: '#fef2f2',
    borderRadius: '1rem',
    border: '2px solid #fecaca',
    textAlign: 'center',
  },
  qrCodeErrorIcon: {
    fontSize: '3rem',
  },
  qrCodeErrorTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#991b1b',
    margin: '0 0 0.5rem 0',
  },
  qrCodeErrorText: {
    fontSize: '0.875rem',
    color: '#991b1b',
    margin: '0 0 1rem 0',
  },
  retryButton: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1a365d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  qrCodeLoading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
    padding: '3rem 2rem',
  },
  loadingSpinner: {
    fontSize: '3rem',
  },
  loadingText: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500',
  },
};

export default DigitalCard;
