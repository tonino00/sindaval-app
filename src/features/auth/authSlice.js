import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';

const initialState = {
  user: null,
  accessToken: null, // Mantido para compatibilidade com refresh token
  refreshToken: null, // Mantido para compatibilidade com refresh token
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false,
  pendingTwoFactor: null,
};

// Log de inicialização
console.log('🔐 AuthSlice inicializado - usando cookies para autenticação');

const decodeUser = (user) => {
  if (!user) return null;
  
  return {
    id: user.id,
    nomeCompleto: user.nomeCompleto,
    email: user.email,
    cpf: user.cpf,
    fotoUrl: user.fotoUrl,
    numeroOAB: user.numeroOAB,
    telefone: user.telefone,
    enderecoResidencial: user.enderecoResidencial,
    enderecoProfissional: user.enderecoProfissional,
    instagram: user.instagram,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    isTwoFactorEnabled: user.isTwoFactorEnabled,
  };
};

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('🔑 Tentando fazer login...');
      const response = await api.post('/auth/login', { email, password });

      if (response.data?.requiresTwoFactor) {
        console.log('🔐 2FA necessário');
        return { requiresTwoFactor: true, email, password };
      }

      console.log('✅ Login bem-sucedido');
      console.log('🍪 Cookies após login:', document.cookie);
      
      return {
        requiresTwoFactor: false,
        user: decodeUser(response.data.user),
        accessToken: response.data?.accessToken || null,
        refreshToken: response.data?.refreshToken || null,
      };
    } catch (error) {
      console.error('❌ Erro no login:', error.response?.data?.message || error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Erro ao fazer login'
      );
    }
  }
);

export const login2fa = createAsyncThunk(
  'auth/login2fa',
  async ({ email, password, twoFactorToken, recoveryCode }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login/2fa', {
        email,
        password,
        ...(twoFactorToken ? { twoFactorToken } : {}),
        ...(recoveryCode ? { recoveryCode } : {}),
      });
      return {
        user: decodeUser(response.data.user),
        accessToken: response.data?.accessToken || null,
        refreshToken: response.data?.refreshToken || null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erro ao validar 2FA'
      );
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refresh',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState?.();
      const currentRefreshToken = state?.auth?.refreshToken || null;
      const response = await api.post('/auth/refresh',
        currentRefreshToken ? { refreshToken: currentRefreshToken } : undefined
      );
      return {
        user: decodeUser(response.data.user),
        accessToken: response.data?.accessToken || null,
        refreshToken: response.data?.refreshToken || null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Sessão expirada'
      );
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout');
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Erro ao fazer logout'
      );
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔍 Verificando autenticação via /auth/me...');
      console.log('📋 Cookies atuais:', document.cookie);
      const response = await api.get('/auth/me');
      console.log('✅ Usuário autenticado:', response.data?.user?.email);
      return decodeUser(response.data?.user);
    } catch (error) {
      console.error('❌ Erro ao verificar autenticação:', error.response?.data?.message || error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Erro ao buscar perfil'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    setRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.pendingTwoFactor = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.requiresTwoFactor) {
          state.isAuthenticated = false;
          state.user = null;
          state.accessToken = null;
          state.refreshToken = null;
          state.pendingTwoFactor = {
            email: action.payload.email,
            password: action.payload.password,
          };
          state.error = null;
          state.initialized = true;
          return;
        }

        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.pendingTwoFactor = null;
        state.error = null;
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload;
        state.initialized = true;
        state.pendingTwoFactor = null;
      })
      .addCase(login2fa.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login2fa.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.pendingTwoFactor = null;
        state.error = null;
        state.initialized = true;
      })
      .addCase(login2fa.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = action.payload;
        state.pendingTwoFactor = state.pendingTwoFactor;
        state.initialized = true;
      })
      .addCase(refreshToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken || state.refreshToken;
        state.error = null;
        state.initialized = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
        state.initialized = true;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
        state.initialized = true;
      })
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.initialized = true;
        state.pendingTwoFactor = null;
      })
      .addCase(getProfile.rejected, (state, action) => {
        console.log('⚠️ getProfile rejeitado - usuário não autenticado');
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.initialized = true;
      });
  },
});

export const { clearError, setAccessToken, setRefreshToken } = authSlice.actions;
export default authSlice.reducer;
