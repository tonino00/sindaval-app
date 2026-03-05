import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, clearError } from '../features/auth/authSlice';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

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

  const onSubmit = async (data) => {
    await dispatch(login(data));
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Sindaval</h1>
        <p style={styles.subtitle}>Sistema Jurídico</p>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              {...register('email')}
              style={{
                ...styles.input,
                ...(errors.email ? styles.inputError : {}),
              }}
              placeholder="seu@email.com"
            />
            {errors.email && (
              <span style={styles.error}>{errors.email.message}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Senha</label>
            <input
              type="password"
              {...register('password')}
              style={{
                ...styles.input,
                ...(errors.password ? styles.inputError : {}),
              }}
              placeholder="••••••••"
            />
            {errors.password && (
              <span style={styles.error}>{errors.password.message}</span>
            )}
          </div>

          {error && (
            <div style={styles.errorBox}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
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
    position: 'relative',
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
    fontSize: '2.25rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #1a365d 0%, #2563eb 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '0.5rem',
    textAlign: 'center',
    letterSpacing: '0.025em',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '2rem',
    textAlign: 'center',
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
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    outline: 'none',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  error: {
    fontSize: '0.75rem',
    color: '#dc2626',
    fontWeight: '500',
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
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    width: '100%',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  buttonDisabled: {
    background: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
};

export default Login;
