import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../services/api';
import { getProfile } from '../features/auth/authSlice';
import { QRCodeCanvas } from 'qrcode.react';

const TwoFactorSetup = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [step, setStep] = useState('password');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpauthUrl, setOtpauthUrl] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [token, setToken] = useState('');
  const [recoveryCodes, setRecoveryCodes] = useState([]);
  const [codesCopied, setCodesCopied] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isTwoFactorEnabled = Boolean(user?.isTwoFactorEnabled);

  useEffect(() => {
    setError(null);
    setSuccess(null);
  }, [step]);

  const canConfirm = useMemo(() => token.length === 6, [token]);

  const handleSetup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/auth/2fa/setup', { password });
      setOtpauthUrl(response.data.otpauthUrl);
      setQrCodeDataUrl(response.data.qrCodeDataUrl);
      setStep('qrcode');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao iniciar configuração do 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await api.post('/auth/2fa/confirm', { token });
      setRecoveryCodes(response.data.recoveryCodes || []);
      setStep('recovery');
      await dispatch(getProfile());
    } catch (err) {
      setError(err.response?.data?.message || 'Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const copyCodes = async () => {
    try {
      await navigator.clipboard.writeText((recoveryCodes || []).join('\n'));
      setCodesCopied(true);
      setTimeout(() => setCodesCopied(false), 2500);
    } catch {
      setCodesCopied(false);
    }
  };

  const downloadCodes = () => {
    const blob = new Blob([(recoveryCodes || []).join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recovery-codes-2fa.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDisable = async () => {
    const code = window.prompt('Digite o código do autenticador para desativar o 2FA:');
    if (!code) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await api.post('/auth/2fa/disable', { token: String(code).replace(/\D/g, '').slice(0, 6) });
      setSuccess('2FA desativado com sucesso.');
      await dispatch(getProfile());
      setStep('password');
      setPassword('');
      setToken('');
      setRecoveryCodes([]);
      setOtpauthUrl('');
      setQrCodeDataUrl('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao desativar 2FA');
    } finally {
      setLoading(false);
    }
  };

  if (isTwoFactorEnabled) {
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>🔐 Autenticação de Dois Fatores</h2>
        <div style={styles.successBox}>✅ 2FA está ATIVADO na sua conta</div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {success && <div style={styles.successBox}>{success}</div>}

        <button
          onClick={handleDisable}
          disabled={loading}
          style={{
            ...styles.button,
            ...styles.dangerButton,
            ...(loading ? styles.buttonDisabled : {}),
          }}
        >
          {loading ? 'Processando...' : '❌ Desativar 2FA'}
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🔐 Configurar Autenticação de Dois Fatores</h2>

      <div style={styles.stepIndicator}>
        <div style={{ ...styles.step, ...(step === 'password' ? styles.stepActive : {}) }}>1. Senha</div>
        <div style={{ ...styles.step, ...(step === 'qrcode' ? styles.stepActive : {}) }}>2. QR Code</div>
        <div style={{ ...styles.step, ...(step === 'verify' ? styles.stepActive : {}) }}>3. Verificar</div>
        <div style={{ ...styles.step, ...(step === 'recovery' ? styles.stepActive : {}) }}>4. Códigos</div>
      </div>

      {error && <div style={styles.errorBox}>{error}</div>}
      {success && <div style={styles.successBox}>{success}</div>}

      {step === 'password' && (
        <form onSubmit={handleSetup}>
          <p>Confirme sua senha para continuar:</p>
          <div style={styles.passwordRow}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.passwordInput}
              placeholder="Sua senha atual"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              style={styles.showPasswordButton}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              ...styles.button,
              ...(loading || !password ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Verificando...' : 'Continuar'}
          </button>
        </form>
      )}

      {step === 'qrcode' && (
        <>
          <div style={styles.warningBox}>
            ⚠️ Escaneie o QR code com o Microsoft Authenticator ou Google Authenticator.
          </div>

          <div style={{ textAlign: 'center', margin: '2rem 0' }}>
            {qrCodeDataUrl ? (
              <img src={qrCodeDataUrl} alt="QR Code 2FA" style={{ width: 200, height: 200 }} />
            ) : (
              <QRCodeCanvas value={otpauthUrl || ''} size={200} />
            )}
          </div>

          {otpauthUrl && (
            <p style={{ textAlign: 'center', color: '#6b7280', margin: '0 0 1rem 0' }}>
              Se necessário, você pode usar o código manual (otpauth) no autenticador.
            </p>
          )}

          <button onClick={() => setStep('verify')} style={styles.button}>
            Já escaneei o QR Code
          </button>
        </>
      )}

      {step === 'verify' && (
        <form onSubmit={handleConfirm}>
          <p>Digite o código de 6 dígitos do aplicativo:</p>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            style={styles.codeInput}
            maxLength={6}
            autoFocus
          />

          <button
            type="submit"
            disabled={loading || !canConfirm}
            style={{
              ...styles.button,
              ...(loading || !canConfirm ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Verificando...' : 'Ativar 2FA'}
          </button>
        </form>
      )}

      {step === 'recovery' && (
        <>
          <div style={styles.warningBox}>
            ⚠️ IMPORTANTE: Guarde estes códigos de recuperação em local seguro. Cada código pode ser usado uma vez.
          </div>

          <div style={styles.codesBox}>
            {(recoveryCodes || []).map((code, idx) => (
              <div key={idx}>{code}</div>
            ))}
          </div>

          <div style={styles.actionsRow}>
            <button
              type="button"
              onClick={copyCodes}
              style={{
                ...styles.smallButton,
                backgroundColor: codesCopied ? '#10b981' : '#1a365d',
              }}
            >
              {codesCopied ? '✓ Copiado!' : '📋 Copiar códigos'}
            </button>
            <button type="button" onClick={downloadCodes} style={styles.smallButton}>
              💾 Baixar arquivo
            </button>
          </div>

          <button
            type="button"
            onClick={async () => {
              setSuccess('Configuração concluída!');
              await dispatch(getProfile());
            }}
            style={{ ...styles.button, backgroundColor: '#10b981' }}
          >
            ✅ Concluir
          </button>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1a365d',
    marginBottom: '1rem',
  },
  stepIndicator: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '1.5rem',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  step: {
    flex: 1,
    minWidth: '120px',
    textAlign: 'center',
    padding: '0.5rem',
    borderBottom: '2px solid #e5e7eb',
    color: '#9ca3af',
    fontWeight: '700',
    fontSize: '0.875rem',
  },
  stepActive: {
    borderBottom: '2px solid #1a365d',
    color: '#1a365d',
  },
  warningBox: {
    padding: '1rem',
    backgroundColor: '#fff3cd',
    border: '1px solid #ffeeba',
    borderRadius: '0.5rem',
    color: '#856404',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  successBox: {
    padding: '1rem',
    backgroundColor: '#d4edda',
    border: '1px solid #c3e6cb',
    borderRadius: '0.5rem',
    color: '#155724',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  errorBox: {
    padding: '1rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    color: '#991b1b',
    marginBottom: '1rem',
    fontWeight: '600',
  },
  codesBox: {
    backgroundColor: '#1a365d',
    color: 'white',
    padding: '1.5rem',
    borderRadius: '0.75rem',
    fontFamily: 'monospace',
    fontSize: '1.05rem',
    textAlign: 'center',
    margin: '1rem 0',
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '0.5rem',
  },
  actionsRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid #d1d5db',
    outline: 'none',
    fontSize: '0.95rem',
    margin: '0.75rem 0 1rem 0',
  },
  passwordRow: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    margin: '0.75rem 0 1rem 0',
  },
  passwordInput: {
    width: '100%',
    padding: '0.875rem 1rem',
    borderRadius: '0.75rem',
    border: '1px solid #d1d5db',
    outline: 'none',
    fontSize: '0.95rem',
    margin: 0,
  },
  showPasswordButton: {
    width: '44px',
    height: '44px',
    borderRadius: '0.75rem',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    flexShrink: 0,
  },
  codeInput: {
    width: '100%',
    padding: '1rem',
    fontSize: '1.5rem',
    textAlign: 'center',
    letterSpacing: '8px',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    margin: '1rem 0',
    outline: 'none',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1a365d',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  smallButton: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1a365d',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  dangerButton: {
    backgroundColor: '#dc2626',
  },
};

export default TwoFactorSetup;
