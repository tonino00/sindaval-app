import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login2fa, clearError } from '../features/auth/authSlice';

const TwoFactorLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pendingTwoFactor, loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [mode, setMode] = useState('totp');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');

  const email = pendingTwoFactor?.email;
  const password = pendingTwoFactor?.password;

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (!email || !password) {
      navigate('/login', { replace: true });
    }
  }, [email, password, navigate]);

  const canSubmit = useMemo(() => {
    if (mode === 'totp') return twoFactorToken.length === 6;
    return recoveryCode.length === 10;
  }, [mode, twoFactorToken, recoveryCode]);

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) return;

    const payload = {
      email,
      password,
      twoFactorToken: mode === 'totp' ? twoFactorToken : undefined,
      recoveryCode: mode === 'recovery' ? recoveryCode.toUpperCase() : undefined,
    };

    const result = await dispatch(login2fa(payload));
    if (login2fa.fulfilled.match(result)) {
      navigate('/');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Verificação em Duas Etapas</h1>
        <p style={styles.subtitle}>
          {mode === 'totp'
            ? 'Digite o código de 6 dígitos do seu autenticador.'
            : 'Digite um código de recuperação (10 caracteres).'}
        </p>

        <div style={styles.modeRow}>
          <button
            type="button"
            onClick={() => {
              setMode('totp');
              setRecoveryCode('');
              dispatch(clearError());
            }}
            style={{
              ...styles.modeButton,
              ...(mode === 'totp' ? styles.modeButtonActive : {}),
            }}
          >
            Código do App
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('recovery');
              setTwoFactorToken('');
              dispatch(clearError());
            }}
            style={{
              ...styles.modeButton,
              ...(mode === 'recovery' ? styles.modeButtonActive : {}),
            }}
          >
            Recovery Code
          </button>
        </div>

        <form onSubmit={onSubmit} style={styles.form}>
          {mode === 'totp' ? (
            <input
              value={twoFactorToken}
              onChange={(e) => setTwoFactorToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              inputMode="numeric"
              style={styles.codeInput}
              maxLength={6}
              autoFocus
            />
          ) : (
            <input
              value={recoveryCode}
              onChange={(e) => setRecoveryCode(e.target.value.toUpperCase().slice(0, 10))}
              placeholder="ABCD1234EF"
              style={styles.recoveryInput}
              maxLength={10}
              autoFocus
            />
          )}

          {error && <div style={styles.errorBox}>{error}</div>}

          <button
            type="submit"
            disabled={loading || !canSubmit}
            style={{
              ...styles.button,
              ...(loading || !canSubmit ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Verificando...' : 'Verificar'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            style={styles.backButton}
          >
            Voltar ao login
          </button>
        </form>
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
    background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    backgroundColor: '#ffffff',
    padding: '3rem 2rem',
    borderRadius: '1.5rem',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    border: 'none',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1a365d',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  modeRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
    marginBottom: '1.25rem',
  },
  modeButton: {
    padding: '0.75rem 1rem',
    border: '1px solid #e5e7eb',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
    color: '#374151',
    fontWeight: '700',
  },
  modeButtonActive: {
    borderColor: '#1a365d',
    backgroundColor: '#eff6ff',
    color: '#1a365d',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  codeInput: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.75rem',
    textAlign: 'center',
    letterSpacing: '8px',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    outline: 'none',
  },
  recoveryInput: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.25rem',
    textAlign: 'center',
    border: '2px solid #e5e7eb',
    borderRadius: '0.75rem',
    outline: 'none',
  },
  errorBox: {
    padding: '0.75rem 1rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.75rem',
    color: '#991b1b',
    fontSize: '0.875rem',
    fontWeight: '600',
    textAlign: 'center',
  },
  button: {
    padding: '1rem 1.5rem',
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
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  backButton: {
    padding: '0.75rem 1rem',
    backgroundColor: 'transparent',
    border: '1px solid #e5e7eb',
    borderRadius: '0.75rem',
    cursor: 'pointer',
    color: '#1a365d',
    fontWeight: '700',
  },
};

export default TwoFactorLogin;
