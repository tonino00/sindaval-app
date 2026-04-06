import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_URL as BACKEND_URL } from '../services/api';

const PublicValidateCard = () => {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${BACKEND_URL.replace(/\/$/, '')}/api/v1/public/validar/${encodeURIComponent(token)}`,
          {
            method: 'GET',
            credentials: 'omit',
          },
        );
        if (!response.ok) {
          throw new Error('HTTP_ERROR');
        }
        const payload = await response.json();
        if (!mounted) return;

        setData(payload);
      } catch (err) {
        if (!mounted) return;
        setError('Não foi possível validar a carteira.');
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    if (token) run();

    return () => {
      mounted = false;
    };
  }, [token]);

  const valid = Boolean(data?.valid);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Validação da Carteira Digital</h1>
        <p style={styles.subtitle}>SINDAVAL</p>

        {loading && <div style={styles.infoBox}>Validando...</div>}

        {!loading && error && (
          <div style={{ ...styles.infoBox, ...styles.errorBox }}>
            <strong>Falha na validação</strong>
            <div style={{ marginTop: '0.5rem' }}>{error}</div>
          </div>
        )}

        {!loading && !error && (
          <>
            <div
              style={{
                ...styles.statusBox,
                ...(valid ? styles.statusValid : styles.statusInvalid),
              }}
            >
              {valid ? '✅ Carteira válida' : '❌ Carteira inválida'}
            </div>

            {data?.fotoUrl && (
              <div style={styles.photoSection}>
                <img
                  src={data.fotoUrl}
                  alt={data?.nomeCompleto || 'Foto do sindicalizado'}
                  style={styles.photo}
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}

            <div style={styles.detailsBox}>
              <div style={styles.row}>
                <span style={styles.label}>Nome</span>
                <span style={styles.value}>{data?.nomeCompleto || '—'}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>OAB</span>
                <span style={styles.value}>{data?.numeroOAB || '—'}</span>
              </div>
              <div style={styles.row}>
                <span style={styles.label}>Status</span>
                <span style={styles.value}>{data?.status || '—'}</span>
              </div>

              {!valid && data?.reason && (
                <div style={{ ...styles.infoBox, ...styles.reasonBox }}>
                  <strong>Motivo:</strong> {data.reason}
                </div>
              )}
            </div>
          </>
        )}

        <div style={styles.footer}>
          <Link to="/login" style={styles.link}>
            Ir para o login
          </Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1.5rem',
    backgroundColor: '#f8fafc',
  },
  card: {
    width: '100%',
    maxWidth: '560px',
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    padding: '2rem',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  title: {
    margin: 0,
    color: '#1a365d',
    fontWeight: '900',
    fontSize: '1.5rem',
  },
  subtitle: {
    marginTop: '0.25rem',
    marginBottom: '1.25rem',
    color: '#6b7280',
    fontWeight: '700',
  },
  statusBox: {
    marginTop: '0.5rem',
    padding: '0.875rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid transparent',
    fontWeight: '800',
    textAlign: 'center',
  },
  statusValid: {
    backgroundColor: '#d1fae5',
    borderColor: '#a7f3d0',
    color: '#065f46',
  },
  statusInvalid: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
    color: '#991b1b',
  },
  detailsBox: {
    marginTop: '1rem',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
    padding: '1rem',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    padding: '0.5rem 0',
    borderBottom: '1px solid #e5e7eb',
  },
  label: {
    color: '#6b7280',
    fontWeight: '700',
  },
  value: {
    color: '#111827',
    fontWeight: '700',
    textAlign: 'right',
    overflowWrap: 'anywhere',
  },
  infoBox: {
    marginTop: '1rem',
    padding: '0.75rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    color: '#374151',
  },
  errorBox: {
    borderColor: '#fecaca',
    backgroundColor: '#fff1f2',
    color: '#991b1b',
  },
  reasonBox: {
    marginTop: '1rem',
  },
  photoSection: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
    marginBottom: '0.5rem',
  },
  photo: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #1a365d',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  footer: {
    marginTop: '1.5rem',
    textAlign: 'center',
  },
  link: {
    color: '#1a365d',
    fontWeight: '800',
    textDecoration: 'none',
  },
};

export default PublicValidateCard;
