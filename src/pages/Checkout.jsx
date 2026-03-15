import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../services/api';
import mpLogo from '../assets/mp-logo.png';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CARTAO');
  const [amount] = useState(200.0);
  const lastTriggeredMethodRef = useRef(null);

  const buildCheckoutPayload = (metodo) => ({
    valor: amount,
    metodo,
  });

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/payments/checkout', buildCheckoutPayload(paymentMethod));

      const nextPaymentId = response.data.paymentId;
      const nextPreferenceId = response.data.preferenceId;
      const nextUrl = response.data.initPoint || response.data.sandboxInitPoint || response.data.paymentUrl;

      if (nextUrl) {
        window.location.href = nextUrl;
      } else {
        setError('Erro ao gerar link de pagamento');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPaymentMethod = async (nextMethod) => {
    if (loading) return;

    setPaymentMethod(nextMethod);
    lastTriggeredMethodRef.current = nextMethod;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/payments/checkout', buildCheckoutPayload(nextMethod));

      const nextUrl = response.data.initPoint || response.data.sandboxInitPoint || response.data.paymentUrl;

      if (nextUrl) {
        window.location.href = nextUrl;
      } else {
        setError('Erro ao gerar link de pagamento');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao processar pagamento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <button onClick={() => navigate('/payments')} style={styles.backButton}>
            ← Voltar
          </button>
          <h1 style={styles.title}>Pagamento de Mensalidade</h1>
        </div>

        <div style={styles.content}>
          <div style={styles.summaryCard}>
            <h2 style={styles.summaryTitle}>Resumo do Pagamento</h2>
            
            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Associado:</span>
              <span style={styles.summaryValue}>{user?.nomeCompleto}</span>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>CPF:</span>
              <span style={styles.summaryValue}>{user?.cpf || 'Não informado'}</span>
            </div>

            <div style={styles.summaryItem}>
              <span style={styles.summaryLabel}>Referência:</span>
              <span style={styles.summaryValue}>
                {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </span>
            </div>

            <div style={styles.divider}></div>

            <div style={styles.totalItem}>
              <span style={styles.totalLabel}>Total a Pagar:</span>
              <span style={styles.totalValue}>
                R$ {amount.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          <div style={styles.paymentCard}>
            <h2 style={styles.paymentTitle}>Método de Pagamento</h2>

            <div style={styles.paymentMethods}>
              <button
                onClick={() => handleSelectPaymentMethod('CARTAO')}
                style={{
                  ...styles.methodButton,
                  ...(paymentMethod === 'CARTAO' ? styles.methodButtonActive : {}),
                }}
              >
                <div style={styles.methodIcon}>
                  <img
                    src={mpLogo}
                    alt="Mercado Pago"
                    style={styles.methodIconImage}
                  />
                </div>
                <div style={styles.methodInfo}>
                  <h3 style={styles.methodName}>Mercado Pago</h3>
                  <p style={styles.methodDescription}>Pix ou cartão (ambiente seguro)</p>
                </div>
              </button>
            </div>

            <div style={styles.securityInfo}>
              <div style={styles.securityIcon}>🔒</div>
              <div style={styles.securityText}>
                <strong>Pagamento 100% seguro</strong>
                <p>Processado pelo Mercado Pago. Seus dados nunca são armazenados em nossos servidores.</p>
              </div>
            </div>

            {error && (
              <div style={styles.errorBox}>
                <strong>Erro:</strong> {error}
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              style={{
                ...styles.checkoutButton,
                ...(loading ? styles.buttonDisabled : {}),
              }}
            >
              {loading ? 'Processando...' : 'Prosseguir para Pagamento'}
            </button>

            <p style={styles.disclaimer}>
              Ao clicar em "Prosseguir para Pagamento", você será redirecionado para o ambiente seguro do Mercado Pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  header: {
    padding: '1.5rem',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  backButton: {
    padding: '0.5rem 1rem',
    backgroundColor: 'transparent',
    color: '#1a365d',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginBottom: '1rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  content: {
    padding: '1.5rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))',
    gap: '1.5rem',
  },
  summaryCard: {
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
  },
  summaryTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: '1.5rem',
  },
  summaryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  },
  summaryLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: '0.875rem',
    color: '#111827',
    fontWeight: '600',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '1.5rem 0',
  },
  totalItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: '1rem',
    color: '#111827',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: '1.5rem',
    color: '#1a365d',
    fontWeight: '700',
  },
  paymentCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  paymentTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1a365d',
  },
  paymentMethods: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  methodButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#ffffff',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: '#e5e7eb',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    textAlign: 'left',
    outline: 'none',
    boxShadow: 'none',
  },
  methodButtonActive: {
    borderColor: '#1a365d',
    backgroundColor: '#eff6ff',
    boxShadow: '0 0 0 3px rgba(26, 54, 93, 0.12)',
  },
  methodIcon: {
    width: '3rem',
    height: '3rem',
    borderRadius: '0.75rem',
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  methodIconImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    padding: '0.5rem',
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.25rem 0',
  },
  methodDescription: {
    fontSize: '0.75rem',
    color: '#6b7280',
    margin: 0,
  },
  securityInfo: {
    display: 'flex',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: '#f0fdf4',
    borderRadius: '0.5rem',
    border: '1px solid #bbf7d0',
  },
  securityIcon: {
    fontSize: '1.5rem',
  },
  securityText: {
    flex: 1,
  },
  checkoutButton: {
    padding: '1rem 1.5rem',
    backgroundColor: '#059669',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  disclaimer: {
    fontSize: '0.75rem',
    color: '#6b7280',
    textAlign: 'center',
    margin: 0,
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
};

export default Checkout;
