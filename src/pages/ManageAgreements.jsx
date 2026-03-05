import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { formatPhone } from '../utils/formatters';

const agreementSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  descricao: z.string().optional(),
  categoria: z.string().optional(),
  desconto: z.number().min(0).max(100).optional(),
  contato: z.string().optional(),
  ativo: z.boolean(),
});

const ManageAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [phoneValue, setPhoneValue] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(agreementSchema),
    defaultValues: {
      ativo: true,
    },
  });

  const handlePhoneChange = (e) => {
    const formatted = formatPhone(e.target.value);
    setPhoneValue(formatted);
    setValue('contato', formatted);
  };

  useEffect(() => {
    fetchAgreements();
  }, []);

  const fetchAgreements = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agreements');
      setAgreements(response.data);
    } catch (err) {
      setError('Erro ao carregar convênios');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(null);

    try {
      if (editingId) {
        await api.patch(`/agreements/${editingId}`, data);
        setSuccess('Convênio atualizado com sucesso!');
        setEditingId(null);
      } else {
        await api.post('/agreements', data);
        setSuccess('Convênio criado com sucesso!');
      }
      reset({ ativo: true });
      await fetchAgreements();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar convênio');
    }
  };

  const handleEdit = (agreement) => {
    setEditingId(agreement.id);
    setValue('titulo', agreement.titulo);
    setValue('descricao', agreement.descricao || '');
    setValue('categoria', agreement.categoria || '');
    setValue('desconto', agreement.desconto || 0);
    const formattedPhone = formatPhone(agreement.contato || '');
    setPhoneValue(formattedPhone);
    setValue('contato', formattedPhone);
    setValue('ativo', agreement.ativo);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setPhoneValue('');
    reset({ ativo: true });
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/agreements/${id}`, { ativo: !currentStatus });
      await fetchAgreements();
      setSuccess('Status atualizado com sucesso!');
    } catch (err) {
      setError('Erro ao atualizar status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este convênio?')) return;

    try {
      await api.delete(`/agreements/${id}`);
      await fetchAgreements();
      setSuccess('Convênio excluído com sucesso!');
    } catch (err) {
      setError('Erro ao excluir convênio');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestão de Convênios</h1>
          <p style={styles.subtitle}>Crie, edite e gerencie convênios do sindicato</p>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statBadge}>
            <span style={styles.statBadgeLabel}>Total de Convênios</span>
            <span style={styles.statBadgeValue}>{agreements.length}</span>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>{editingId ? '✏️' : '➕'}</div>
            <h2 style={styles.sectionTitle}>
              {editingId ? 'Editar Convênio' : 'Criar Novo Convênio'}
            </h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Título *</label>
              <input
                type="text"
                {...register('titulo')}
                style={styles.input}
                placeholder="Título do convênio"
              />
              {errors.titulo && (
                <span style={styles.errorText}>{errors.titulo.message}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Descrição</label>
              <textarea
                {...register('descricao')}
                style={{ ...styles.input, minHeight: '100px' }}
                placeholder="Descrição do convênio"
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Categoria</label>
                <input
                  type="text"
                  {...register('categoria')}
                  style={styles.input}
                  placeholder="Ex: Saúde, Educação"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Desconto (%)</label>
                <input
                  type="number"
                  {...register('desconto', { valueAsNumber: true })}
                  style={styles.input}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Contato (Telefone)</label>
              <input
                type="text"
                value={phoneValue}
                onChange={handlePhoneChange}
                style={styles.input}
                placeholder="(00) 00000-0000"
                maxLength="15"
              />
            </div>

            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                {...register('ativo')}
                style={styles.checkbox}
                id="ativo"
              />
              <label htmlFor="ativo" style={styles.checkboxLabel}>
                Convênio ativo
              </label>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            <div style={styles.buttonGroup}>
              <button type="submit" style={styles.button}>
                {editingId ? 'Atualizar' : 'Criar'} Convênio
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  style={styles.cancelButton}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>📋</div>
            <h2 style={styles.sectionTitle}>Lista de Convênios</h2>
          </div>
          {loading ? (
            <div style={styles.loadingState}>
              <div style={styles.loadingSpinner}>⏳</div>
              <p style={styles.loadingText}>Carregando convênios...</p>
            </div>
          ) : agreements.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <p style={styles.emptyText}>Nenhum convênio encontrado</p>
              <p style={styles.emptySubtext}>Crie seu primeiro convênio usando o formulário ao lado</p>
            </div>
          ) : (
            <div style={styles.agreementsList}>
              {agreements.map((agreement) => (
                <div key={agreement.id} style={styles.agreementCard}>
                  <div style={styles.agreementHeader}>
                    <div style={styles.agreementTitleSection}>
                      <div style={styles.agreementIcon}>🤝</div>
                      <h3 style={styles.agreementTitle}>{agreement.titulo}</h3>
                    </div>
                    <span
                      style={{
                        ...styles.statusBadge,
                        ...(agreement.ativo ? styles.statusActive : styles.statusInactive),
                      }}
                    >
                      {agreement.ativo ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </div>
                  <p style={styles.agreementDescription}>{agreement.descricao}</p>
                  <div style={styles.agreementDetails}>
                    <div style={styles.agreementDetail}>
                      <span style={styles.detailIcon}>🏷️</span>
                      <span style={styles.detailText}>
                        <strong>Categoria:</strong> {agreement.categoria}
                      </span>
                    </div>
                    <div style={styles.agreementDetail}>
                      <span style={styles.detailIcon}>💰</span>
                      <span style={styles.detailText}>
                        <strong>Desconto:</strong> {agreement.desconto}%
                      </span>
                    </div>
                  </div>
                  {agreement.contato && (
                    <div style={styles.agreementContact}>
                      <span style={styles.detailIcon}>📞</span>
                      <span style={styles.detailText}>
                        <strong>Telefone:</strong> {formatPhone(agreement.contato)}
                      </span>
                    </div>
                  )}
                  <div style={styles.agreementActions}>
                    <button
                      onClick={() => handleEdit(agreement)}
                      style={styles.editButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#1e40af';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563eb';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleToggleStatus(agreement.id, agreement.ativo)}
                      style={{
                        ...styles.toggleButton,
                        ...(agreement.ativo ? styles.toggleButtonActive : styles.toggleButtonInactive),
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {agreement.ativo ? '🔴 Desativar' : '🟢 Ativar'}
                    </button>
                    <button
                      onClick={() => handleDelete(agreement.id)}
                      style={styles.deleteButton}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc2626';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#ef4444';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
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
  headerStats: {
    display: 'flex',
    gap: '1rem',
  },
  statBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    backgroundColor: '#1a365d',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  statBadgeLabel: {
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '0.5rem',
  },
  statBadgeValue: {
    fontSize: '2rem',
    color: '#ffffff',
    fontWeight: '800',
    lineHeight: 1,
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
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
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
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  checkbox: {
    width: '1.25rem',
    height: '1.25rem',
    cursor: 'pointer',
  },
  checkboxLabel: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
  },
  errorText: {
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
  successBox: {
    padding: '0.75rem 1rem',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '0.5rem',
    color: '#166534',
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
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
  cancelButton: {
    flex: 1,
    padding: '0.875rem 1.5rem',
    backgroundColor: 'transparent',
    color: '#1a365d',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  agreementsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    maxHeight: '600px',
    overflowY: 'auto',
  },
  agreementCard: {
    backgroundColor: '#ffffff',
    padding: '1.75rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  agreementHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    gap: '1rem',
  },
  agreementTitleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  agreementIcon: {
    fontSize: '1.75rem',
  },
  agreementTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  statusBadge: {
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
  statusInactive: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
  },
  agreementDescription: {
    fontSize: '0.875rem',
    color: '#6b7280',
    marginBottom: '0.75rem',
  },
  agreementDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  agreementDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  detailIcon: {
    fontSize: '1.25rem',
  },
  detailText: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  agreementContact: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  agreementActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
    flexWrap: 'wrap',
  },
  editButton: {
    flex: 1,
    minWidth: '120px',
    padding: '0.75rem 1.25rem',
    backgroundColor: '#2563eb',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  },
  toggleButton: {
    flex: 1,
    minWidth: '120px',
    padding: '0.75rem 1.25rem',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  },
  toggleButtonActive: {
    backgroundColor: '#f59e0b',
  },
  toggleButtonInactive: {
    backgroundColor: '#059669',
  },
  deleteButton: {
    flex: 1,
    minWidth: '120px',
    padding: '0.75rem 1.25rem',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
  },
  loadingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '1rem',
  },
  loadingSpinner: {
    fontSize: '3rem',
  },
  loadingText: {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    gap: '0.75rem',
  },
  emptyIcon: {
    fontSize: '4rem',
  },
  emptyText: {
    fontSize: '1.125rem',
    color: '#111827',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: '0.875rem',
    color: '#6b7280',
    textAlign: 'center',
  },
};

export default ManageAgreements;
