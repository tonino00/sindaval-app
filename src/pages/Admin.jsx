import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import api, { API_URL } from '../services/api';

const notificationSchema = z.object({
  titulo: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  mensagem: z.string().min(10, 'Mensagem deve ter no mínimo 10 caracteres'),
  tipo: z.enum(['GERAL', 'INDIVIDUAL']),
  canal: z.enum(['INTERNA', 'EMAIL', 'WHATSAPP', 'MULTICANAL']),
  usuarioId: z.string().optional(),
});

const userSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  nomeCompleto: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  cpf: z.string().min(11, 'CPF deve ter no mínimo 11 caracteres').max(14, 'CPF deve ter no máximo 14 caracteres'),
  numeroOAB: z.string().optional(),
  role: z.enum(['ADMIN', 'FINANCEIRO', 'SINDICALIZADO']),
  status: z.enum(['ATIVO', 'INADIMPLENTE', 'INATIVO']),
});

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [errorNotification, setErrorNotification] = useState(null);
  const [successNotification, setSuccessNotification] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const {
    register: registerNotification,
    handleSubmit: handleSubmitNotification,
    reset: resetNotification,
    watch: watchNotification,
    formState: { errors: errorsNotification },
  } = useForm({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      tipo: 'GERAL',
      canal: 'INTERNA',
    },
  });

  const {
    register: registerUser,
    handleSubmit: handleSubmitUser,
    reset: resetUser,
    formState: { errors: errorsUser },
  } = useForm({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: 'SINDICALIZADO',
      status: 'ATIVO',
    },
  });

  const tipoNotificacao = watchNotification('tipo');

  useEffect(() => {
    fetchUsers();
    fetchNotifications();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err) {
      setError('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitNotification = async (data) => {
    setErrorNotification(null);
    setSuccessNotification(null);

    try {
      await api.post('/notifications', data);
      setSuccessNotification('Notificação enviada com sucesso!');
      resetNotification();
    } catch (err) {
      setErrorNotification(err.response?.data?.message || 'Erro ao enviar notificação');
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const onSubmitUser = async (data) => {
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      
      // Adiciona todos os campos do formulário
      Object.keys(data).forEach(key => {
        if (data[key]) {
          formData.append(key, data[key]);
        }
      });
      
      // Adiciona a foto se existir
      if (photoFile) {
        formData.append('foto', photoFile);
      }

      await api.post('/users', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess('Usuário criado com sucesso!');
      resetUser();
      handleRemovePhoto();
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar usuário');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;

    try {
      await api.delete(`/users/${id}`);
      setSuccess('Usuário excluído com sucesso!');
      await fetchUsers();
    } catch (err) {
      setError('Erro ao excluir usuário');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    
    if (!window.confirm(`Tem certeza que deseja alterar o status para ${newStatus}?`)) return;

    try {
      await api.patch(`/users/${userId}`, { status: newStatus });
      setSuccess(`Status alterado para ${newStatus} com sucesso!`);
      await fetchUsers();
    } catch (err) {
      setError('Erro ao alterar status');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    if (!window.confirm(`Tem certeza que deseja alterar o perfil para ${newRole}?`)) return;

    try {
      await api.patch(`/users/${userId}`, { role: newRole });
      setSuccess(`Perfil alterado para ${newRole} com sucesso!`);
      await fetchUsers();
    } catch (err) {
      setError('Erro ao alterar perfil');
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await api.get('/notifications');
      setNotifications(response.data);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleBlockUser = async (userId, isBlocked) => {
    const action = isBlocked ? 'desbloquear' : 'bloquear';
    
    if (!window.confirm(`Tem certeza que deseja ${action} este usuário?`)) return;

    try {
      await api.patch(`/users/${userId}`, { bloqueado: !isBlocked });
      setSuccess(`Usuário ${action}ado com sucesso!`);
      await fetchUsers();
    } catch (err) {
      setError(`Erro ao ${action} usuário`);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta notificação?')) return;

    try {
      await api.delete(`/notifications/${notificationId}`);
      setSuccessNotification('Notificação excluída com sucesso!');
      await fetchNotifications();
    } catch (err) {
      setErrorNotification('Erro ao excluir notificação');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'TODOS' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Gestão Administrativa</h1>
          <p style={styles.subtitle}>Gerencie usuários e envie notificações</p>
        </div>
        <div style={styles.headerStats}>
          <div style={styles.statBadge}>
            <span style={styles.statBadgeLabel}>Total de Usuários</span>
            <span style={styles.statBadgeValue}>{users.length}</span>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>📢</div>
            <h2 style={styles.sectionTitle}>Enviar Notificação</h2>
          </div>
          <form onSubmit={handleSubmitNotification(onSubmitNotification)} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Título</label>
              <input
                type="text"
                {...registerNotification('titulo')}
                style={styles.input}
                placeholder="Título da notificação"
              />
              {errorsNotification.titulo && (
                <span style={styles.errorText}>{errorsNotification.titulo.message}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Mensagem</label>
              <textarea
                {...registerNotification('mensagem')}
                style={{ ...styles.input, minHeight: '100px' }}
                placeholder="Mensagem da notificação"
              />
              {errorsNotification.mensagem && (
                <span style={styles.errorText}>{errorsNotification.mensagem.message}</span>
              )}
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Tipo</label>
                <select {...registerNotification('tipo')} style={styles.select}>
                  <option value="GERAL">Geral</option>
                  <option value="INDIVIDUAL">Individual</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Canal</label>
                <select {...registerNotification('canal')} style={styles.select}>
                  <option value="INTERNA">Interna</option>
                  <option value="EMAIL">Email</option>
                  <option value="WHATSAPP">WhatsApp</option>
                  <option value="MULTICANAL">Multicanal</option>
                </select>
              </div>
            </div>

            {tipoNotificacao === 'INDIVIDUAL' && (
              <div style={styles.formGroup}>
                <label style={styles.label}>ID do Usuário</label>
                <input
                  type="text"
                  {...registerNotification('usuarioId')}
                  style={styles.input}
                  placeholder="ID do usuário"
                />
              </div>
            )}

            {errorNotification && <div style={styles.errorBox}>{errorNotification}</div>}
            {successNotification && <div style={styles.successBox}>{successNotification}</div>}

            <button type="submit" style={styles.button}>
              Enviar Notificação
            </button>
          </form>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>👤</div>
            <h2 style={styles.sectionTitle}>Criar Novo Usuário</h2>
          </div>
          <form onSubmit={handleSubmitUser(onSubmitUser)} style={styles.form}>
            {/* Campo de Upload de Foto */}
            <div style={styles.photoUploadSection}>
              <label style={styles.label}>Foto do Usuário</label>
              <div style={styles.photoUploadContainer}>
                {photoPreview ? (
                  <div style={styles.photoPreviewWrapper}>
                    <img src={photoPreview} alt="Preview" style={styles.photoPreview} />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      style={styles.removePhotoButton}
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
                    />
                    <div style={styles.photoUploadPlaceholder}>
                      <span style={styles.photoUploadIcon}>📷</span>
                      <span style={styles.photoUploadText}>Clique para adicionar foto</span>
                      <span style={styles.photoUploadHint}>JPG, PNG ou GIF</span>
                    </div>
                  </label>
                )}
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Nome Completo</label>
              <input
                type="text"
                {...registerUser('nomeCompleto')}
                style={styles.input}
                placeholder="Nome completo"
              />
              {errorsUser.nomeCompleto && (
                <span style={styles.errorText}>{errorsUser.nomeCompleto.message}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input
                type="email"
                {...registerUser('email')}
                style={styles.input}
                placeholder="email@exemplo.com"
              />
              {errorsUser.email && (
                <span style={styles.errorText}>{errorsUser.email.message}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>CPF</label>
              <input
                type="text"
                {...registerUser('cpf')}
                style={styles.input}
                placeholder="000.000.000-00"
              />
              {errorsUser.cpf && (
                <span style={styles.errorText}>{errorsUser.cpf.message}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Senha</label>
              <input
                type="password"
                {...registerUser('password')}
                style={styles.input}
                placeholder="Senha"
              />
              {errorsUser.password && (
                <span style={styles.errorText}>{errorsUser.password.message}</span>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Número OAB (opcional)</label>
              <input
                type="text"
                {...registerUser('numeroOAB')}
                style={styles.input}
                placeholder="OAB123456"
              />
            </div>

            <div style={styles.formRow}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Perfil</label>
                <select {...registerUser('role')} style={styles.select}>
                  <option value="SINDICALIZADO">Sindicalizado</option>
                  <option value="FINANCEIRO">Financeiro</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Status</label>
                <select {...registerUser('status')} style={styles.select}>
                  <option value="ATIVO">Ativo</option>
                  <option value="INADIMPLENTE">Inadimplente</option>
                  <option value="INATIVO">Inativo</option>
                </select>
              </div>
            </div>

            {error && <div style={styles.errorBox}>{error}</div>}
            {success && <div style={styles.successBox}>{success}</div>}

            <button type="submit" style={styles.button}>
              Criar Usuário
            </button>
          </form>
        </div>
      </div>

      <div style={styles.tableSection}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>👥</div>
          <h2 style={styles.sectionTitle}>Lista de Usuários</h2>
        </div>
        
        <div style={styles.filterSection}>
          <div style={styles.searchContainer}>
            <input
              type="text"
              placeholder="🔍 Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={styles.searchInput}
            />
          </div>
          <div style={styles.filterContainer}>
            <label style={styles.filterLabel}>Filtrar por status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="TODOS">Todos</option>
              <option value="ATIVO">Ativo</option>
              <option value="INADIMPLENTE">Inadimplente</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>
          <div style={styles.resultCount}>
            <span style={styles.resultText}>
              {filteredUsers.length} usuário(s) encontrado(s)
            </span>
          </div>
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner}>⏳</div>
            <p style={styles.loadingText}>Carregando usuários...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <p style={styles.emptyText}>Nenhum usuário encontrado</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.tableHeaderCell}>Nome</th>
                  <th style={styles.tableHeaderCell}>Email</th>
                  <th style={styles.tableHeaderCell}>CPF</th>
                  <th style={styles.tableHeaderCell}>OAB</th>
                  <th style={styles.tableHeaderCell}>Perfil</th>
                  <th style={styles.tableHeaderCell}>Status</th>
                  <th style={styles.tableHeaderCell}>Data Cadastro</th>
                  <th style={styles.tableHeaderCell}>Bloqueio</th>
                  <th style={styles.tableHeaderCell}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr key={user.id} style={{
                    ...styles.tableRow,
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                  }}>
                    <td style={styles.tableCell}>
                      <div style={styles.userCell}>
                        {user.fotoUrl ? (
                          <img 
                            src={API_URL + user.fotoUrl} 
                            alt={user.nomeCompleto}
                            style={styles.userAvatarImage}
                          />
                        ) : (
                          <div style={styles.userAvatar}>{user.nomeCompleto.charAt(0).toUpperCase()}</div>
                        )}
                        <span style={styles.userName}>{user.nomeCompleto}</span>
                      </div>
                    </td>
                    <td style={styles.tableCell}>{user.email}</td>
                    <td style={styles.tableCell}>{user.cpf || 'N/A'}</td>
                    <td style={styles.tableCell}>{user.numeroOAB || 'N/A'}</td>
                    <td style={styles.tableCell}>
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user.id, e.target.value)}
                        style={styles.roleSelect}
                      >
                        <option value="ADMIN">Admin</option>
                        <option value="FINANCEIRO">Financeiro</option>
                        <option value="SINDICALIZADO">Sindicalizado</option>
                      </select>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.status)}
                        style={{
                          ...styles.statusButton,
                          ...(user.status === 'ATIVO' ? styles.statusButtonActive : {}),
                          ...(user.status === 'INADIMPLENTE' ? styles.statusButtonWarning : {}),
                          ...(user.status === 'INATIVO' ? styles.statusButtonInactive : {}),
                        }}
                      >
                        {user.status}
                      </button>
                    </td>
                    <td style={styles.tableCell}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => handleBlockUser(user.id, user.bloqueado)}
                        style={{
                          ...styles.blockButton,
                          ...(user.bloqueado ? styles.blockButtonBlocked : styles.blockButtonActive),
                        }}
                      >
                        {user.bloqueado ? '🔓 Desbloquear' : '🔒 Bloquear'}
                      </button>
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        style={styles.deleteButton}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef4444';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div style={styles.tableSection}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionIcon}>📨</div>
          <h2 style={styles.sectionTitle}>Histórico de Notificações Enviadas</h2>
        </div>
        {loadingNotifications ? (
          <div style={styles.loadingState}>
            <div style={styles.loadingSpinner}>⏳</div>
            <p style={styles.loadingText}>Carregando notificações...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📭</div>
            <p style={styles.emptyText}>Nenhuma notificação enviada</p>
          </div>
        ) : (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeader}>
                  <th style={styles.tableHeaderCell}>Título</th>
                  <th style={styles.tableHeaderCell}>Tipo</th>
                  <th style={styles.tableHeaderCell}>Canal</th>
                  <th style={styles.tableHeaderCell}>Data de Envio</th>
                  <th style={styles.tableHeaderCell}>Destinatário</th>
                  <th style={styles.tableHeaderCell}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification, index) => (
                  <tr key={notification.id} style={{
                    ...styles.tableRow,
                    backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
                  }}>
                    <td style={styles.tableCell}>
                      <div style={styles.notificationTitle}>
                        {notification.tipo === 'URGENTE' && '⚠️ '}
                        {notification.titulo}
                      </div>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{
                        ...styles.typeBadge,
                        ...(notification.tipo === 'GERAL' ? styles.typeGeneral : {}),
                        ...(notification.tipo === 'INDIVIDUAL' ? styles.typeIndividual : {}),
                        ...(notification.tipo === 'URGENTE' ? styles.typeUrgent : {}),
                      }}>
                        {notification.tipo}
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={styles.canalBadge}>{notification.canal}</span>
                    </td>
                    <td style={styles.tableCell}>
                      {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString('pt-BR') : 'N/A'}
                    </td>
                    <td style={styles.tableCell}>
                      {notification.tipo === 'INDIVIDUAL' ? notification.usuarioId || 'N/A' : 'Todos'}
                    </td>
                    <td style={styles.tableCell}>
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        style={styles.deleteButton}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#dc2626';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#ef4444';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        🗑️ Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
    marginBottom: '2rem',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
  },
  tableSection: {
    backgroundColor: '#ffffff',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb',
    marginTop: '1.5rem',
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
  select: {
    padding: '0.75rem 1rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    outline: 'none',
    backgroundColor: '#ffffff',
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
    animation: 'spin 1s linear infinite',
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
    gap: '1rem',
  },
  emptyIcon: {
    fontSize: '4rem',
  },
  emptyText: {
    fontSize: '1rem',
    color: '#6b7280',
    fontWeight: '500',
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    background: 'linear-gradient(to bottom, #f9fafb, #f3f4f6)',
  },
  tableHeaderCell: {
    padding: '1rem 1.25rem',
    textAlign: 'left',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#1a365d',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '2px solid #e5e7eb',
  },
  tableRow: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s',
  },
  tableCell: {
    padding: '1.25rem',
    fontSize: '0.875rem',
    color: '#374151',
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  userAvatar: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    backgroundColor: '#1a365d',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
    fontWeight: '700',
    flexShrink: 0,
  },
  userAvatarImage: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #e5e7eb',
    flexShrink: 0,
  },
  userName: {
    fontWeight: '600',
    color: '#111827',
  },
  filterSection: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1.5rem',
    backgroundColor: '#f9fafb',
    borderRadius: '0.75rem',
    border: '1px solid #e5e7eb',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  searchContainer: {
    flex: '1 1 300px',
  },
  searchInput: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  filterContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  filterLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#374151',
    whiteSpace: 'nowrap',
  },
  filterSelect: {
    padding: '0.75rem 1rem',
    border: '2px solid #d1d5db',
    borderRadius: '0.5rem',
    fontSize: '0.9375rem',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
  },
  resultCount: {
    marginLeft: 'auto',
  },
  resultText: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#6b7280',
  },
  roleSelect: {
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '0.375rem',
    fontSize: '0.8125rem',
    fontWeight: '600',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    color: '#1a365d',
  },
  statusButton: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  statusButtonActive: {
    backgroundColor: '#d1fae5',
    color: '#065f46',
  },
  statusButtonWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  statusButtonInactive: {
    backgroundColor: '#f3f4f6',
    color: '#4b5563',
  },
  blockButton: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  blockButtonActive: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  blockButtonBlocked: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  notificationTitle: {
    fontWeight: '600',
    color: '#111827',
  },
  typeBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  typeGeneral: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
  },
  typeIndividual: {
    backgroundColor: '#e0e7ff',
    color: '#4338ca',
  },
  typeUrgent: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
  },
  canalBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#f3f4f6',
    color: '#374151',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
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
  roleBadge: {
    padding: '0.375rem 0.875rem',
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.025em',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  photoUploadSection: {
    marginBottom: '1.5rem',
  },
  photoUploadContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
  },
  photoUploadLabel: {
    display: 'block',
    width: '100%',
    cursor: 'pointer',
  },
  photoInput: {
    display: 'none',
  },
  photoUploadPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 2rem',
    border: '2px dashed #d1d5db',
    borderRadius: '1rem',
    backgroundColor: '#f9fafb',
    transition: 'all 0.3s',
    ':hover': {
      borderColor: '#2563eb',
      backgroundColor: '#eff6ff',
    },
  },
  photoUploadIcon: {
    fontSize: '3rem',
    marginBottom: '1rem',
  },
  photoUploadText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  photoUploadHint: {
    fontSize: '0.875rem',
    color: '#6b7280',
  },
  photoPreviewWrapper: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  photoPreview: {
    width: '200px',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '1rem',
    border: '3px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
  removePhotoButton: {
    padding: '0.5rem 1.5rem',
    backgroundColor: '#dc2626',
    color: '#ffffff',
    border: 'none',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};

export default Admin;
