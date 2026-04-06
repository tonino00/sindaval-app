import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api from '../services/api';
import { formatPhone } from '../utils/formatters';
import ConfirmModal from '../components/ConfirmModal';

const customErrorMap = (issue, ctx) => {
  if (issue.code === z.ZodIssueCode.invalid_union) {
    return { message: 'Valor inválido para este campo' };
  }
  if (issue.code === z.ZodIssueCode.invalid_type) {
    if (issue.expected === 'string') {
      return { message: 'Este campo deve ser um texto' };
    }
    if (issue.expected === 'number') {
      return { message: 'Este campo deve ser um número' };
    }
    return { message: 'Tipo de dado inválido' };
  }
  if (issue.code === z.ZodIssueCode.too_small) {
    return { message: `Valor mínimo: ${issue.minimum}` };
  }
  if (issue.code === z.ZodIssueCode.too_big) {
    return { message: `Valor máximo: ${issue.maximum}` };
  }
  return { message: ctx.defaultError };
};

z.setErrorMap(customErrorMap);

const agreementSchema = z.object({
  titulo: z
    .string({ 
      required_error: 'Título é obrigatório',
      invalid_type_error: 'Título deve ser um texto'
    })
    .min(3, 'Título deve ter no mínimo 3 caracteres')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  descricao: z
    .string({ invalid_type_error: 'Descrição deve ser um texto' })
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  categoryId: z
    .union([z.string(), z.number()], {
      invalid_type_error: 'Categoria inválida'
    })
    .optional()
    .or(z.literal('')),
  desconto: z
    .union([
      z.string(),
      z.number({
        invalid_type_error: 'Desconto deve ser um número entre 0 e 100'
      }).min(0, 'Desconto deve ser no mínimo 0%').max(100, 'Desconto deve ser no máximo 100%')
    ], {
      invalid_type_error: 'Desconto deve ser um número entre 0 e 100'
    })
    .optional()
    .or(z.literal('')),
  contato: z
    .string({ invalid_type_error: 'Telefone deve ser um texto' })
    .max(15, 'Telefone deve ter no máximo 15 caracteres')
    .optional()
    .or(z.literal('')),
  ativo: z.boolean({ 
    required_error: 'Status ativo/inativo é obrigatório',
    invalid_type_error: 'Status deve ser verdadeiro ou falso'
  }),
});

const ManageAgreements = () => {
  const [agreements, setAgreements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [phoneValue, setPhoneValue] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState(null);
  const [editingCategoryId, setEditingCategoryId] = useState(null);

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
    fetchCategories();
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

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError('Nome da categoria é obrigatório');
      return;
    }

    try {
      setCategoryError(null);
      if (editingCategoryId) {
        await api.patch(`/categories/${editingCategoryId}`, { nome: newCategoryName.trim() });
        setSuccess('Categoria atualizada com sucesso!');
        setEditingCategoryId(null);
      } else {
        await api.post('/categories', { nome: newCategoryName.trim() });
        setSuccess('Categoria criada com sucesso!');
      }
      setNewCategoryName('');
      setShowCategoryModal(false);
      await fetchCategories();
    } catch (err) {
      setCategoryError(err.response?.data?.message || 'Erro ao salvar categoria');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategoryId(category.id);
    setNewCategoryName(category.nome);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (id, nome) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Categoria',
      message: `Tem certeza que deseja excluir a categoria "${nome}"? Esta ação só será possível se não houver convênios associados.`,
      onConfirm: async () => {
        try {
          await api.delete(`/categories/${id}`);
          setSuccess('Categoria excluída com sucesso!');
          await fetchCategories();
          if (showCategoryModal) {
            setShowCategoryModal(false);
          }
        } catch (err) {
          setError(err.response?.data?.message || 'Erro ao excluir categoria');
        }
      },
    });
  };

  const onSubmit = async (data) => {
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      const payload = {
        ...data,
        categoryId: data.categoryId || null,
        desconto: data.desconto || data.desconto === 0 ? Number(data.desconto) : null,
      };
      
      
      if (editingId) {
        await api.patch(`/agreements/${editingId}`, payload);
        setSuccess('Convênio atualizado com sucesso!');
        setEditingId(null);
      } else {
        await api.post('/agreements', payload);
        setSuccess('Convênio criado com sucesso!');
      }
      reset({
        titulo: '',
        descricao: '',
        categoryId: '',
        desconto: '',
        contato: '',
        ativo: true,
      });
      setPhoneValue('');
      await fetchAgreements();
    } catch (err) {
      console.error('Erro ao salvar convênio:', err);
      setError(err.response?.data?.message || 'Erro ao salvar convênio');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (agreement) => {
    setEditingId(agreement.id);
    setValue('titulo', agreement.titulo);
    setValue('descricao', agreement.descricao || '');
    setValue('categoryId', agreement.category?.id || undefined);
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

  const handleDelete = (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Excluir Convênio',
      message: 'Tem certeza que deseja excluir este convênio? Esta ação não pode ser desfeita.',
      onConfirm: async () => {
        try {
          await api.delete(`/agreements/${id}`);
          await fetchAgreements();
          setSuccess('Convênio excluído com sucesso!');
        } catch (err) {
          setError('Erro ao excluir convênio');
        }
      },
    });
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
                <select
                  {...register('categoryId')}
                  style={styles.input}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  style={styles.addCategoryLink}
                >
                  ➕ Criar nova categoria
                </button>
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

            {Object.keys(errors).length > 0 && (
              <div style={styles.errorBox}>
                <strong>Erros de validação:</strong>
                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
                  {errors.titulo && <li><strong>Título:</strong> {errors.titulo.message}</li>}
                  {errors.descricao && <li><strong>Descrição:</strong> {errors.descricao.message}</li>}
                  {errors.categoryId && <li><strong>Categoria:</strong> {errors.categoryId.message}</li>}
                  {errors.desconto && <li><strong>Desconto:</strong> {errors.desconto.message}</li>}
                  {errors.contato && <li><strong>Telefone:</strong> {errors.contato.message}</li>}
                </ul>
              </div>
            )}

            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            <div style={styles.buttonGroup}>
              <button 
                type="submit" 
                style={{
                  ...styles.button,
                  ...(submitting ? { opacity: 0.6, cursor: 'not-allowed' } : {})
                }}
                disabled={submitting}
              >
                {submitting ? '⏳ Salvando...' : `${editingId ? 'Atualizar' : 'Criar'} Convênio`}
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

      {showCategoryModal && (
        <div style={styles.modalOverlay} onClick={() => {
          setShowCategoryModal(false);
          setNewCategoryName('');
          setCategoryError(null);
          setEditingCategoryId(null);
        }}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>
                🏷️ {editingCategoryId ? 'Editar Categoria' : 'Gerenciar Categorias'}
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setNewCategoryName('');
                  setCategoryError(null);
                  setEditingCategoryId(null);
                }}
                style={styles.modalCloseButton}
              >
                ✕
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.categoryFormSection}>
                <label style={styles.label}>
                  {editingCategoryId ? 'Editar Nome da Categoria *' : 'Nova Categoria *'}
                </label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  style={styles.input}
                  placeholder="Ex: Saúde, Educação, Lazer"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCreateCategory();
                    } else if (e.key === 'Escape') {
                      if (editingCategoryId) {
                        setEditingCategoryId(null);
                        setNewCategoryName('');
                        setCategoryError(null);
                      } else {
                        setShowCategoryModal(false);
                        setNewCategoryName('');
                        setCategoryError(null);
                      }
                    }
                  }}
                />
                {categoryError && (
                  <div style={styles.errorBox}>{categoryError}</div>
                )}
                <div style={styles.categoryFormActions}>
                  {editingCategoryId && (
                    <button
                      onClick={() => {
                        setEditingCategoryId(null);
                        setNewCategoryName('');
                        setCategoryError(null);
                      }}
                      style={styles.modalCancelButton}
                    >
                      Cancelar Edição
                    </button>
                  )}
                  <button
                    onClick={handleCreateCategory}
                    style={styles.modalConfirmButton}
                    disabled={!newCategoryName.trim()}
                  >
                    {editingCategoryId ? 'Salvar Alterações' : 'Criar Categoria'}
                  </button>
                </div>
              </div>

              {!editingCategoryId && categories.length > 0 && (
                <div style={styles.categoryListSection}>
                  <h4 style={styles.categoryListTitle}>Categorias Existentes</h4>
                  <div style={styles.categoryList}>
                    {categories.map((cat) => (
                      <div key={cat.id} style={styles.categoryItem}>
                        <span style={styles.categoryName}>{cat.nome}</span>
                        <div style={styles.categoryItemActions}>
                          <button
                            onClick={() => handleEditCategory(cat)}
                            style={styles.categoryEditButton}
                            title="Editar categoria"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.nome)}
                            style={styles.categoryDeleteButton}
                            title="Excluir categoria"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {!editingCategoryId && (
              <div style={styles.modalFooter}>
                <button
                  onClick={() => {
                    setShowCategoryModal(false);
                    setNewCategoryName('');
                    setCategoryError(null);
                  }}
                  style={styles.modalCancelButton}
                >
                  Fechar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
      />
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1rem',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
    gap: '1.5rem',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '1.5rem',
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
    gap: '1rem',
  },
  addCategoryLink: {
    marginTop: '0.5rem',
    padding: '0.5rem 0',
    backgroundColor: 'transparent',
    color: '#1a365d',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
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
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))',
    gap: '0.75rem',
    marginTop: '1.5rem',
    paddingTop: '1rem',
    borderTop: '1px solid #e5e7eb',
  },
  editButton: {
    padding: '0.75rem 1rem',
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
    padding: '0.75rem 1rem',
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
    padding: '0.75rem 1rem',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
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
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(4px)',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: '1rem',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    width: '90%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflow: 'auto',
    margin: '1rem',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem',
    borderBottom: '1px solid #e5e7eb',
    gap: '1rem',
  },
  modalTitle: {
    fontSize: '1.125rem',
    fontWeight: '700',
    color: '#1a365d',
    margin: 0,
    lineHeight: 1.3,
  },
  modalCloseButton: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1.5rem',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '0.25rem',
    lineHeight: 1,
    transition: 'color 0.2s',
  },
  modalBody: {
    padding: '1.25rem',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    padding: '1.25rem',
    borderTop: '1px solid #e5e7eb',
    flexWrap: 'wrap',
  },
  modalCancelButton: {
    padding: '0.75rem 1.25rem',
    backgroundColor: '#ffffff',
    color: '#374151',
    border: '2px solid #e5e7eb',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  modalConfirmButton: {
    padding: '0.75rem 1.25rem',
    backgroundColor: '#1a365d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  },
  categoryFormSection: {
    marginBottom: '1.5rem',
  },
  categoryFormActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1rem',
    flexWrap: 'wrap',
  },
  categoryListSection: {
    borderTop: '2px solid #e5e7eb',
    paddingTop: '1.5rem',
  },
  categoryListTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#1a365d',
    marginBottom: '1rem',
  },
  categoryList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    maxHeight: '300px',
    overflowY: 'auto',
  },
  categoryItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.875rem 1rem',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '0.5rem',
    transition: 'all 0.2s',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  categoryName: {
    fontSize: '0.9375rem',
    fontWeight: '600',
    color: '#374151',
    wordBreak: 'break-word',
    flex: 1,
    minWidth: '120px',
  },
  categoryItemActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  categoryEditButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  categoryDeleteButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#ef4444',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default ManageAgreements;
