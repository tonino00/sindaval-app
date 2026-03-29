import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setError('Token inválido ou ausente. Solicite um novo link de redefinição.');
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) {
      setError('Token inválido. Solicite um novo link de redefinição.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.newPassword,
      });
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message;
      
      if (errorMessage?.includes('expirado') || errorMessage?.includes('expired')) {
        setError('O link de redefinição expirou. Solicite um novo link.');
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      } else if (errorMessage?.includes('inválido') || errorMessage?.includes('invalid')) {
        setError('Token inválido. Solicite um novo link de redefinição.');
      } else {
        setError(errorMessage || 'Erro ao redefinir senha. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Redefinir senha</h1>
          <p style={styles.subtitle}>
            Digite sua nova senha
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Nova senha</label>
            <div style={styles.inputWrapper}>
              <input
                type={showPassword ? "text" : "password"}
                {...register('newPassword')}
                style={{
                  ...styles.input,
                  ...(errors.newPassword ? styles.inputError : {}),
                }}
                placeholder="••••••••"
                disabled={loading || success || !token}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={styles.toggleButton}
                disabled={loading || success || !token}
              >
                {showPassword ? (
                  <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.newPassword && (
              <span style={styles.error}>{errors.newPassword.message}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirmar nova senha</label>
            <div style={styles.inputWrapper}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                {...register('confirmPassword')}
                style={{
                  ...styles.input,
                  ...(errors.confirmPassword ? styles.inputError : {}),
                }}
                placeholder="••••••••"
                disabled={loading || success || !token}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.toggleButton}
                disabled={loading || success || !token}
              >
                {showConfirmPassword ? (
                  <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg style={styles.icon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {errors.confirmPassword && (
              <span style={styles.error}>{errors.confirmPassword.message}</span>
            )}
          </div>

          <div style={styles.requirements}>
            <p style={styles.requirementsTitle}>Requisitos da senha:</p>
            <ul style={styles.requirementsList}>
              <li style={styles.requirementsItem}>Mínimo de 6 caracteres</li>
            </ul>
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          {success && (
            <div style={styles.successBox}>
              ✓ Senha redefinida com sucesso! Redirecionando para login...
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success || !token}
            style={{
              ...styles.button,
              ...(loading || success || !token ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Redefinindo...' : success ? 'Senha redefinida!' : 'Redefinir senha'}
          </button>

          <div style={styles.footer}>
            <Link to="/login" style={styles.link}>
              ← Voltar para login
            </Link>
          </div>
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
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  title: {
    fontSize: '1.875rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '0.75rem',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  input: {
    padding: '0.75rem 3rem 0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
    width: '100%',
  },
  toggleButton: {
    position: 'absolute',
    right: '0.75rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    transition: 'color 0.2s',
  },
  icon: {
    width: '1.25rem',
    height: '1.25rem',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  error: {
    fontSize: '0.75rem',
    color: '#dc2626',
    fontWeight: '500',
  },
  requirements: {
    backgroundColor: '#f9fafb',
    padding: '1rem',
    borderRadius: '0.5rem',
  },
  requirementsTitle: {
    fontSize: '0.8125rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  requirementsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  requirementsItem: {
    fontSize: '0.75rem',
    color: '#6b7280',
    paddingLeft: '1rem',
    position: 'relative',
  },
  errorBox: {
    padding: '0.75rem 1rem',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '0.5rem',
    color: '#991b1b',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  successBox: {
    padding: '0.75rem 1rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '0.5rem',
    color: '#166534',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  button: {
    padding: '1rem 1.5rem',
    background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.75rem',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    width: '100%',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  footer: {
    marginTop: '1rem',
    textAlign: 'center',
  },
  link: {
    color: '#1a365d',
    fontWeight: '600',
    textDecoration: 'none',
    fontSize: '0.875rem',
  },
};

export default ResetPassword;
