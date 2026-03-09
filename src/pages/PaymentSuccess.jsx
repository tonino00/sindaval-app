import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { formatDateTime } from '../utils/formatters';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [paymentData, setPaymentData] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentId = searchParams.get('payment_id');

      if (!paymentId) {
        setStatus('error');
        return;
      }

      try {
        const response = await api.get(`/payments/${paymentId}`);
        setPaymentData(response.data);
        
        if (response.data.status === 'APROVADO') {
          setStatus('success');
        } else if (response.data.status === 'PENDENTE') {
          setStatus('pending');
        } else {
          setStatus('error');
        }
      } catch (err) {
        console.error('Erro ao verificar pagamento:', err);
        setStatus('error');
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (status === 'loading') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loadingIcon}>⏳</div>
          <h1 style={styles.title}>Verificando pagamento...</h1>
          <p style={styles.text}>Aguarde enquanto confirmamos seu pagamento.</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✓</div>
          <h1 style={styles.title}>Pagamento Confirmado!</h1>
          <p style={styles.text}>
            Sua mensalidade foi paga com sucesso. Obrigado!
          </p>

          {paymentData && (
            <div style={styles.detailsCard}>
              <h2 style={styles.detailsTitle}>Detalhes do Pagamento</h2>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Valor:</span>
                <span style={styles.detailValue}>
                  R$ {paymentData.valor?.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Método:</span>
                <span style={styles.detailValue}>
                  {paymentData.metodoPagamento === 'PIX' && 'Pix'}
                  {paymentData.metodoPagamento === 'CARTAO_CREDITO' && 'Cartão de Crédito'}
                  {paymentData.metodoPagamento === 'CARTAO_DEBITO' && 'Cartão de Débito'}
                </span>
              </div>
              <div style={styles.detailItem}>
                <span style={styles.detailLabel}>Data:</span>
                <span style={styles.detailValue}>
                  {formatDateTime(paymentData.createdAt)}
                </span>
              </div>
              {paymentData.transactionId && (
                <div style={styles.detailItem}>
                  <span style={styles.detailLabel}>ID Transação:</span>
                  <span style={styles.detailValue}>{paymentData.transactionId}</span>
                </div>
              )}
            </div>
          )}

          <div style={styles.buttonGroup}>
            <button onClick={() => navigate('/payments')} style={styles.primaryButton}>
              Ver Histórico de Pagamentos
            </button>
            <button onClick={() => navigate('/dashboard')} style={styles.secondaryButton}>
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'pending') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.pendingIcon}>⏱️</div>
          <h1 style={styles.title}>Pagamento Pendente</h1>
          <p style={styles.text}>
            Seu pagamento está sendo processado. Você receberá uma notificação assim que for confirmado.
          </p>

          <div style={styles.infoBox}>
            <p style={styles.infoText}>
              <strong>Cartão:</strong> A confirmação é geralmente imediata, mas pode levar alguns minutos.
            </p>
            <p style={styles.infoText}>
              <strong>Pix:</strong> A confirmação é geralmente instantânea.
            </p>
          </div>

          <div style={styles.buttonGroup}>
            <button onClick={() => navigate('/payments')} style={styles.primaryButton}>
              Ver Histórico de Pagamentos
            </button>
            <button onClick={() => navigate('/dashboard')} style={styles.secondaryButton}>
              Voltar ao Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.errorIcon}>✕</div>
        <h1 style={styles.title}>Erro no Pagamento</h1>
        <p style={styles.text}>
          Não foi possível processar seu pagamento. Por favor, tente novamente.
        </p>

        <div style={styles.buttonGroup}>
          <button onClick={() => navigate('/checkout')} style={styles.primaryButton}>
            Tentar Novamente
          </button>
          <button onClick={() => navigate('/dashboard')} style={styles.secondaryButton}>
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '4rem auto',
    padding: '0 1rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '0.75rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    padding: '3rem 2rem',
    textAlign: 'center',
  },
  loadingIcon: {
    fontSize: '4rem',
    marginBottom: '1.5rem',
  },
  successIcon: {
    fontSize: '4rem',
    color: '#059669',
    marginBottom: '1.5rem',
    width: '5rem',
    height: '5rem',
    borderRadius: '50%',
    backgroundColor: '#d1fae5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
  },
  pendingIcon: {
    fontSize: '4rem',
    color: '#d97706',
    marginBottom: '1.5rem',
  },
  errorIcon: {
    fontSize: '4rem',
    color: '#dc2626',
    marginBottom: '1.5rem',
    width: '5rem',
    height: '5rem',
    borderRadius: '50%',
    backgroundColor: '#fee2e2',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '1rem',
  },
  text: {
    fontSize: '1rem',
    color: '#6b7280',
    marginBottom: '2rem',
    lineHeight: '1.5',
  },
  detailsCard: {
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    marginBottom: '2rem',
    textAlign: 'left',
  },
  detailsTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: '1rem',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.75rem',
  },
  detailLabel: {
    fontSize: '0.875rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '0.875rem',
    color: '#111827',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#fef3c7',
    borderRadius: '0.5rem',
    padding: '1rem',
    marginBottom: '2rem',
    textAlign: 'left',
  },
  infoText: {
    fontSize: '0.875rem',
    color: '#92400e',
    margin: '0.5rem 0',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  primaryButton: {
    padding: '0.875rem 1.5rem',
    backgroundColor: '#1a365d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  secondaryButton: {
    padding: '0.875rem 1.5rem',
    backgroundColor: 'transparent',
    color: '#1a365d',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
};

export default PaymentSuccess;
