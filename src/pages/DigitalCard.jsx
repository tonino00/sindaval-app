import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../services/api';
import { getProfile } from '../features/auth/authSlice';

const DigitalCard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dispatch(getProfile());
    generateQRCode();
  }, [dispatch]);

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
            <div style={styles.headerContent}>
              <div style={styles.logoSection}>
                <div style={styles.logoCircle}>S</div>
                <div>
                  <h2 style={styles.cardTitle}>SINDAVAL</h2>
                  <p style={styles.cardSubtitle}>Sindicato dos Advogados de Alagoas</p>
                </div>
              </div>
              <div style={styles.cardNumber}>N° {user?.id?.substring(0, 8).toUpperCase()}</div>
            </div>
          </div>

          <div style={styles.cardBody}>
            <div style={styles.cardInfo}>
              <div style={styles.infoGroup}>
                <label style={styles.infoLabel}>Nome</label>
                <p style={styles.infoValue}>{user?.nomeCompleto}</p>
              </div>

              <div style={styles.infoRow}>
                <div style={styles.infoGroup}>
                  <label style={styles.infoLabel}>CPF</label>
                  <p style={styles.infoValue}>{user?.cpf || 'Não informado'}</p>
                </div>
                <div style={styles.infoGroup}>
                  <label style={styles.infoLabel}>OAB</label>
                  <p style={styles.infoValue}>{user?.numeroOAB || 'N/A'}</p>
                </div>
              </div>

              <div style={styles.infoGroup}>
                <label style={styles.infoLabel}>Email</label>
                <p style={styles.infoValue}>{user?.email}</p>
              </div>

              <div style={styles.infoGroup}>
                <label style={styles.infoLabel}>Status</label>
                <span
                  style={{
                    ...styles.statusBadge,
                    ...(user?.status === 'ATIVO' ? styles.statusActive : {}),
                    ...(user?.status === 'INADIMPLENTE' ? styles.statusWarning : {}),
                    ...(user?.status === 'INATIVO' ? styles.statusInactive : {}),
                  }}
                >
                  {user?.status}
                </span>
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
    background: 'linear-gradient(135deg, #1a365d 0%, #1e40af 50%, #2563eb 100%)',
    padding: '2.5rem 2rem',
    color: '#ffffff',
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    position: 'relative',
    zIndex: 1,
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
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
  cardTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    margin: '0 0 0.25rem 0',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  },
  cardSubtitle: {
    fontSize: '0.875rem',
    margin: 0,
    opacity: 0.95,
    fontWeight: '400',
  },
  cardNumber: {
    fontSize: '0.875rem',
    fontWeight: '700',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    letterSpacing: '0.05em',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(10px)',
  },
  cardBody: {
    padding: '1.5rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
    gap: '1.5rem',
  },
  cardInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
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
