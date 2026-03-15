import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [mpParams, setMpParams] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      const mpData = {
        payment_id: searchParams.get('payment_id'),
        status: searchParams.get('status'),
        preference_id: searchParams.get('preference_id'),
        collection_id: searchParams.get('collection_id'),
        merchant_order_id: searchParams.get('merchant_order_id'),
      };
      setMpParams(mpData);

      try {
        const response = await api.get('/payments/checkout/current');

        if (response.data.status === 'APROVADO') {
          navigate('/payment/success?' + searchParams.toString());
        } else if (response.data.status === 'PENDENTE') {
          navigate('/payment/pending?' + searchParams.toString());
        } else {
          setStatus('failure');
        }
      } catch (err) {
        console.error('Erro ao verificar pagamento:', err);
        setStatus('failure');
      }
    };

    verifyPayment();
  }, [navigate, searchParams]);

  if (status === 'loading') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.loadingIcon}>⏳</div>
          <h1 style={styles.title}>Verificando pagamento...</h1>
          <p style={styles.text}>Aguarde enquanto confirmamos o status do seu pagamento.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.errorIcon}>✕</div>
        <h1 style={styles.title}>Não foi possível processar o pagamento</h1>
        <p style={styles.text}>
          Seu pagamento foi recusado ou cancelado. Você pode tentar novamente.
        </p>

        <div style={styles.buttonGroup}>
          <button onClick={() => navigate('/checkout')} style={styles.primaryButton}>
            Tentar Novamente
          </button>
          <button onClick={() => navigate('/dashboard')} style={styles.secondaryButton}>
            Voltar ao Dashboard
          </button>
        </div>

        {mpParams && (
          <details style={styles.debugDetails}>
            <summary style={styles.debugSummary}>Detalhes técnicos (debug)</summary>
            <div style={styles.debugBox}>
              <div style={styles.debugDivider}></div>

              <div style={styles.debugRow}>
                <span style={styles.debugKey}>payment_id (MP)</span>
                <span style={styles.debugValue}>{mpParams?.payment_id || '-'}</span>
              </div>
              <div style={styles.debugRow}>
                <span style={styles.debugKey}>status (MP)</span>
                <span style={styles.debugValue}>{mpParams?.status || '-'}</span>
              </div>
              <div style={styles.debugRow}>
                <span style={styles.debugKey}>preference_id (MP)</span>
                <span style={styles.debugValue}>{mpParams?.preference_id || '-'}</span>
              </div>
              <div style={styles.debugRow}>
                <span style={styles.debugKey}>collection_id (MP)</span>
                <span style={styles.debugValue}>{mpParams?.collection_id || '-'}</span>
              </div>
              <div style={styles.debugRow}>
                <span style={styles.debugKey}>merchant_order_id (MP)</span>
                <span style={styles.debugValue}>{mpParams?.merchant_order_id || '-'}</span>
              </div>
            </div>
          </details>
        )}
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
  debugDetails: {
    marginTop: '1.5rem',
    textAlign: 'left',
  },
  debugSummary: {
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '700',
    color: '#374151',
    marginBottom: '0.75rem',
  },
  debugBox: {
    marginTop: '0.75rem',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    padding: '1rem',
  },
  debugRow: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    marginBottom: '0.5rem',
  },
  debugKey: {
    fontSize: '0.75rem',
    color: '#6b7280',
    fontWeight: '700',
  },
  debugValue: {
    fontSize: '0.75rem',
    color: '#111827',
    fontWeight: '600',
    wordBreak: 'break-word',
    textAlign: 'right',
  },
  debugDivider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '0.75rem 0',
  },
};

export default PaymentFailure;
