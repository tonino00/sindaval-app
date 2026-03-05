import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSelector, useDispatch } from 'react-redux';
import api, { API_URL } from '../services/api';
import { getProfile } from '../features/auth/authSlice';

const profileSchema = z.object({
  nomeCompleto: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z.string().email('Email inválido'),
  numeroOAB: z.string().optional(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Senha atual obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação obrigatória'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [errorProfile, setErrorProfile] = useState(null);
  const [errorPassword, setErrorPassword] = useState(null);
  const [successProfile, setSuccessProfile] = useState(null);
  const [successPassword, setSuccessPassword] = useState(null);

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: errorsProfile },
  } = useForm({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: errorsPassword },
  } = useForm({
    resolver: zodResolver(passwordSchema),
  });

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      resetProfile({
        nomeCompleto: user.nomeCompleto || '',
        email: user.email || '',
        numeroOAB: user.numeroOAB || '',
      });
    }
  }, [user, resetProfile]);

  const onSubmitProfile = async (data) => {
    setLoadingProfile(true);
    setErrorProfile(null);
    setSuccessProfile(null);

    try {
      await api.patch('/users/me', data);
      setSuccessProfile('Perfil atualizado com sucesso!');
      await dispatch(getProfile());
    } catch (err) {
      setErrorProfile(err.response?.data?.message || 'Erro ao atualizar perfil');
    } finally {
      setLoadingProfile(false);
    }
  };

  const onSubmitPassword = async (data) => {
    setLoadingPassword(true);
    setErrorPassword(null);
    setSuccessPassword(null);

    try {
      await api.patch('/users/me/password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      setSuccessPassword('Senha alterada com sucesso!');
      resetPassword();
    } catch (err) {
      setErrorPassword(err.response?.data?.message || 'Erro ao alterar senha');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Meu Perfil</h1>
          <p style={styles.subtitle}>Gerencie suas informações pessoais e segurança</p>
        </div>
        <div style={styles.headerBadge}>
          {user?.fotoUrl ? (
            <img 
              src={API_URL + user.fotoUrl} 
              alt={user.nomeCompleto}
              style={styles.userAvatarImage}
            />
          ) : (
            <div style={styles.userAvatar}>{user?.nomeCompleto?.charAt(0).toUpperCase()}</div>
          )}
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>👤</div>
            <h2 style={styles.sectionTitle}>Informações Pessoais</h2>
          </div>
          <form onSubmit={handleSubmitProfile(onSubmitProfile)} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nome Completo</label>
              <input
                type="text"
                {...registerProfile('nomeCompleto')}
                style={styles.input}
                disabled={loadingProfile}
              />
              {errorsProfile.nomeCompleto && (
                <span style={styles.errorText}>{errorsProfile.nomeCompleto.message}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                {...registerProfile('email')}
                style={styles.input}
                disabled={loadingProfile}
              />
              {errorsProfile.email && (
                <span style={styles.errorText}>{errorsProfile.email.message}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Número OAB</label>
              <input
                type="text"
                {...registerProfile('numeroOAB')}
                style={styles.input}
                disabled={loadingProfile}
                placeholder="Ex: OAB123456"
              />
            </div>

            {errorProfile && <div style={styles.errorBox}>{errorProfile}</div>}
            {successProfile && <div style={styles.successBox}>{successProfile}</div>}

            <button
              type="submit"
              disabled={loadingProfile}
              style={{
                ...styles.button,
                ...(loadingProfile ? styles.buttonDisabled : {}),
              }}
            >
              {loadingProfile ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>🔐</div>
            <h2 style={styles.sectionTitle}>Alterar Senha</h2>
          </div>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Senha Atual</label>
              <input
                type="password"
                {...registerPassword('currentPassword')}
                style={styles.input}
                disabled={loadingPassword}
              />
              {errorsPassword.currentPassword && (
                <span style={styles.errorText}>{errorsPassword.currentPassword.message}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nova Senha</label>
              <input
                type="password"
                {...registerPassword('newPassword')}
                style={styles.input}
                disabled={loadingPassword}
              />
              {errorsPassword.newPassword && (
                <span style={styles.errorText}>{errorsPassword.newPassword.message}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Confirmar Nova Senha</label>
              <input
                type="password"
                {...registerPassword('confirmPassword')}
                style={styles.input}
                disabled={loadingPassword}
              />
              {errorsPassword.confirmPassword && (
                <span style={styles.errorText}>{errorsPassword.confirmPassword.message}</span>
              )}
            </div>

            {errorPassword && <div style={styles.errorBox}>{errorPassword}</div>}
            {successPassword && <div style={styles.successBox}>{successPassword}</div>}

            <button
              type="submit"
              disabled={loadingPassword}
              style={{
                ...styles.button,
                ...(loadingPassword ? styles.buttonDisabled : {}),
              }}
            >
              {loadingPassword ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>
        </div>
      </div>

      <div style={styles.accountDataSection}>
        <div style={styles.accountHeader}>
          <div>
            <h2 style={styles.accountTitle}>Informações da Conta</h2>
            <p style={styles.accountSubtitle}>Dados cadastrais e status atual</p>
          </div>
        </div>
        
        <div style={styles.accountGrid}>
          <div style={styles.accountCard}>
            <div style={styles.accountCardHeader}>
              <div style={styles.accountCardIcon}>✉️</div>
              <span style={styles.accountCardLabel}>Email de Acesso</span>
            </div>
            <p style={styles.accountCardValue}>{user?.email}</p>
          </div>

          <div style={styles.accountCard}>
            <div style={styles.accountCardHeader}>
              <div style={styles.accountCardIcon}>👤</div>
              <span style={styles.accountCardLabel}>CPF</span>
            </div>
            <p style={styles.accountCardValue}>{user?.cpf || 'Não informado'}</p>
          </div>

          <div style={styles.accountCard}>
            <div style={styles.accountCardHeader}>
              <div style={styles.accountCardIcon}>⚖️</div>
              <span style={styles.accountCardLabel}>Registro OAB</span>
            </div>
            <p style={styles.accountCardValue}>{user?.numeroOAB || 'Não informado'}</p>
          </div>

          <div style={styles.accountCard}>
            <div style={styles.accountCardHeader}>
              <div style={styles.accountCardIcon}>
                {user?.status === 'ATIVO' && '✅'}
                {user?.status === 'INADIMPLENTE' && '⚠️'}
                {user?.status === 'INATIVO' && '⭕'}
              </div>
              <span style={styles.accountCardLabel}>Status da Conta</span>
            </div>
            <div style={styles.statusContainer}>
              <span
                style={{
                  ...styles.statusBadgeLarge,
                  ...(user?.status === 'ATIVO' ? styles.statusActive : {}),
                  ...(user?.status === 'INADIMPLENTE' ? styles.statusWarning : {}),
                  ...(user?.status === 'INATIVO' ? styles.statusInactive : {}),
                }}
              >
                {user?.status}
              </span>
            </div>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
    gap: '1.5rem',
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
  headerBadge: {
    display: 'flex',
    alignItems: 'center',
  },
  userAvatar: {
    width: '5rem',
    height: '5rem',
    borderRadius: '50%',
    backgroundColor: '#1a365d',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    fontWeight: '800',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  userAvatarImage: {
    width: '5rem',
    height: '5rem',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))',
    gap: '1.5rem',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '2px solid #f3f4f6',
  },
  sectionIcon: {
    fontSize: '1.5rem',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1a365d',
    margin: 0,
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
    outline: 'none',
  },
  errorText: {
    fontSize: '0.75rem',
    color: '#dc2626',
    fontWeight: '500',
  },
  infoBox: {
    padding: '1rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
  },
  infoText: {
    fontSize: '0.875rem',
    color: '#374151',
    margin: '0.5rem 0',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
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
    padding: '1rem 2rem',
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
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  accountDataSection: {
    backgroundColor: '#ffffff',
    padding: '2.5rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    marginTop: '1.5rem',
  },
  accountHeader: {
    marginBottom: '2rem',
    paddingBottom: '1.5rem',
    borderBottom: '2px solid #f3f4f6',
  },
  accountTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    color: '#1a365d',
    marginBottom: '0.5rem',
  },
  accountSubtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    margin: 0,
  },
  accountGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
    gap: '1.5rem',
  },
  accountCard: {
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s',
  },
  accountCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  accountCardIcon: {
    fontSize: '1.5rem',
    width: '2.5rem',
    height: '2.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '0.5rem',
    border: '1px solid #e5e7eb',
  },
  accountCardLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  accountCardValue: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
    wordBreak: 'break-word',
  },
  statusContainer: {
    marginTop: '0.5rem',
  },
  statusBadgeLarge: {
    display: 'inline-block',
    padding: '0.75rem 1.25rem',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
};

export default Profile;
