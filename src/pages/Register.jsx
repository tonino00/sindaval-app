import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import InputMask from 'react-input-mask';
import api from '../services/api';

const validateCPF = (cpf) => {
  const clean = String(cpf || '').replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(clean.charAt(i), 10) * (10 - i);
  let check = (sum * 10) % 11;
  if (check === 10) check = 0;
  if (check !== parseInt(clean.charAt(9), 10)) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(clean.charAt(i), 10) * (11 - i);
  check = (sum * 10) % 11;
  if (check === 10) check = 0;
  return check === parseInt(clean.charAt(10), 10);
};

const validateOAB = (value) => {
  const v = String(value || '').trim().toUpperCase();
  if (!v) return false;
  
  const ufsValidas = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];
  
  const match = v.match(/^([A-Z]{2})\s*(\d{4,10})$/);
  if (!match) return false;
  
  const [, uf, numero] = match;
  return ufsValidas.includes(uf) && numero.length >= 4;
};

const validatePhone = (value) => {
  const clean = String(value || '').replace(/\D/g, '');
  // 10 (fixo) ou 11 (celular) dígitos com DDD
  return clean.length === 10 || clean.length === 11;
};

const registerSchema = z.object({
  nomeCompleto: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome deve conter apenas letras')
    .refine((val) => val.trim().split(/\s+/).length >= 2, 'Digite o nome completo (nome e sobrenome)'),
  email: z.string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .toLowerCase(),
  cpf: z.string().min(11, 'CPF inválido').refine(validateCPF, 'CPF inválido'),
  numeroOAB: z.string().min(1, 'Número da OAB é obrigatório').refine(validateOAB, 'Formato da OAB inválido'),
  telefone: z.string().min(1, 'Telefone é obrigatório').refine(validatePhone, 'Telefone inválido'),
  enderecoResidencial: z.string().optional(),
  enderecoProfissional: z.string().optional(),
  instagram: z.string().optional(),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida');
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB');
      setPhotoFile(null);
      setPhotoPreview(null);
      return;
    }

    setError(null);
    setPhotoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      if (!photoFile) {
        setError('Foto do usuário é obrigatória');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('nomeCompleto', data.nomeCompleto);
      formData.append('email', data.email);
      formData.append('cpf', data.cpf);
      formData.append('numeroOAB', data.numeroOAB);
      formData.append('telefone', data.telefone);
      if (data.enderecoResidencial) formData.append('enderecoResidencial', data.enderecoResidencial);
      if (data.enderecoProfissional) formData.append('enderecoProfissional', data.enderecoProfissional);
      if (data.instagram) formData.append('instagram', data.instagram);
      formData.append('password', data.password);
      formData.append('foto', photoFile);

      await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
      handleRemovePhoto();
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar conta');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successIcon}>✅</div>
          <h2 style={styles.successTitle}>Conta criada com sucesso!</h2>
          <p style={styles.successText}>Redirecionando para o sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Criar Conta</h1>
        <p style={styles.subtitle}>Sindaval - Área de Cadastro</p>

        <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Foto do Usuário</label>
            <div style={styles.photoUploadContainer}>
              {photoPreview ? (
                <div style={styles.photoPreviewWrapper}>
                  <img src={photoPreview} alt="Preview" style={styles.photoPreview} />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    style={styles.removePhotoButton}
                    disabled={loading}
                  >
                    ✕ Remover
                  </button>
                </div>
              ) : (
                <label style={styles.photoUploadLabel}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={styles.photoInput}
                    disabled={loading}
                  />
                  <div style={styles.photoUploadPlaceholder}>
                    <span style={styles.photoUploadIcon}>📷</span>
                    <span style={styles.photoUploadText}>Clique para adicionar foto</span>
                    <span style={styles.photoUploadHint}>JPG, PNG ou GIF (máx. 5MB)</span>
                  </div>
                </label>
              )}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Nome Completo</label>
            <input
              type="text"
              {...register('nomeCompleto')}
              style={{
                ...styles.input,
                ...(errors.nomeCompleto ? styles.inputError : {}),
              }}
              placeholder="Seu nome completo"
              disabled={loading}
            />
            {errors.nomeCompleto && (
              <span style={styles.errorText}>{errors.nomeCompleto.message}</span>
            )}
          </div>

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
              disabled={loading}
            />
            {errors.email && (
              <span style={styles.errorText}>{errors.email.message}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>CPF</label>
            <Controller
              name="cpf"
              control={control}
              render={({ field }) => (
                <InputMask
                  mask="999.999.999-99"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loading}
                >
                  {(inputProps) => (
                    <input
                      {...inputProps}
                      type="text"
                      style={{
                        ...styles.input,
                        ...(errors.cpf ? styles.inputError : {}),
                      }}
                      placeholder="000.000.000-00"
                    />
                  )}
                </InputMask>
              )}
            />
            {errors.cpf && (
              <span style={styles.errorText}>{errors.cpf.message}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Número da OAB</label>
            <Controller
              name="numeroOAB"
              control={control}
              render={({ field }) => (
                <InputMask
                  mask="aa 999999"
                  value={field.value}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase();
                    field.onChange(value);
                  }}
                  disabled={loading}
                  formatChars={{
                    '9': '[0-9]',
                    'a': '[A-Za-z]'
                  }}
                >
                  {(inputProps) => (
                    <input
                      {...inputProps}
                      type="text"
                      style={{
                        ...styles.input,
                        ...(errors.numeroOAB ? styles.inputError : {}),
                      }}
                      placeholder="Ex: AL 123456"
                    />
                  )}
                </InputMask>
              )}
            />
            {errors.numeroOAB && (
              <span style={styles.errorText}>{errors.numeroOAB.message}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Telefone</label>
            <Controller
              name="telefone"
              control={control}
              render={({ field }) => (
                <InputMask
                  mask="(99) 99999-9999"
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loading}
                >
                  {(inputProps) => (
                    <input
                      {...inputProps}
                      type="text"
                      style={{
                        ...styles.input,
                        ...(errors.telefone ? styles.inputError : {}),
                      }}
                      placeholder="(82) 99999-9999"
                    />
                  )}
                </InputMask>
              )}
            />
            {errors.telefone && (
              <span style={styles.errorText}>{errors.telefone.message}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Endereço Residencial (opcional)</label>
            <input
              type="text"
              {...register('enderecoResidencial')}
              style={styles.input}
              placeholder="Rua, número, bairro, cidade"
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Endereço Profissional (opcional)</label>
            <input
              type="text"
              {...register('enderecoProfissional')}
              style={styles.input}
              placeholder="Rua, número, bairro, cidade"
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Instagram (opcional)</label>
            <input
              type="text"
              {...register('instagram')}
              style={styles.input}
              placeholder="@seuusuario"
              disabled={loading}
            />
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
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
            />
            {errors.password && (
              <span style={styles.errorText}>{errors.password.message}</span>
            )}
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Confirmar Senha</label>
            <input
              type="password"
              {...register('confirmPassword')}
              style={{
                ...styles.input,
                ...(errors.confirmPassword ? styles.inputError : {}),
              }}
              placeholder="Confirme sua senha"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span style={styles.errorText}>{errors.confirmPassword.message}</span>
            )}
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              ...(loading ? styles.buttonDisabled : {}),
            }}
          >
            {loading ? 'Criando conta...' : 'Criar Conta'}
          </button>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Já tem uma conta?{' '}
              <Link to="/login" style={styles.link}>
                Fazer login
              </Link>
            </p>
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
    backgroundColor: '#f3f4f6',
    padding: '1rem',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '2.5rem',
    borderRadius: '1rem',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '500px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '0.9375rem',
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
  photoUploadContainer: {
    border: '2px dashed #d1d5db',
    borderRadius: '0.75rem',
    padding: '1rem',
    backgroundColor: '#f9fafb',
  },
  photoUploadLabel: {
    cursor: 'pointer',
    display: 'block',
  },
  photoInput: {
    display: 'none',
  },
  photoUploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1.25rem 0.75rem',
  },
  photoUploadIcon: {
    fontSize: '2rem',
  },
  photoUploadText: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#1a365d',
  },
  photoUploadHint: {
    fontSize: '0.8125rem',
    color: '#6b7280',
  },
  photoPreviewWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
  },
  photoPreview: {
    width: '160px',
    height: '160px',
    objectFit: 'cover',
    borderRadius: '0.75rem',
    border: '2px solid #e5e7eb',
    backgroundColor: '#ffffff',
  },
  removePhotoButton: {
    padding: '0.5rem 0.875rem',
    borderRadius: '0.5rem',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#991b1b',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '0.75rem',
    fontSize: '0.9375rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    outline: 'none',
    transition: 'all 0.2s',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    fontSize: '0.8125rem',
    color: '#ef4444',
  },
  errorBox: {
    padding: '0.75rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  },
  button: {
    padding: '0.875rem',
    backgroundColor: '#1a365d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '0.5rem',
  },
  buttonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  footer: {
    marginTop: '1rem',
    textAlign: 'center',
  },
  footerText: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  link: {
    color: '#1a365d',
    fontWeight: '600',
    textDecoration: 'none',
  },
  successIcon: {
    fontSize: '4rem',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  successTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#059669',
    textAlign: 'center',
    marginBottom: '0.5rem',
  },
  successText: {
    fontSize: '0.9375rem',
    color: '#6b7280',
    textAlign: 'center',
  },
};

export default Register;
