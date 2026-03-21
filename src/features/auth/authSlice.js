import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import api from '../../services/api';

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  initialized: false, // Flag para controlar se verificação inicial foi feita
  pendingTwoFactor: null,
};

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
      const response = await api.post('/auth/login', { email, password });

      if (response.data?.requiresTwoFactor) {
        return { requiresTwoFactor: true, email, password };
      }

      return {
        requiresTwoFactor: false,
        user: decodeUser(response.data.user),
        accessToken: response.data?.accessToken || null,
      };
    } catch (error) {
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
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/refresh');
      return {
        user: decodeUser(response.data.user),
        accessToken: response.data?.accessToken || null,
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
      const response = await api.get('/auth/me');
      return decodeUser(response.data?.user);
    } catch (error) {
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
        state.pendingTwoFactor = null;
        state.error = null;
        state.initialized = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
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
        state.pendingTwoFactor = null;
        state.error = null;
        state.initialized = true;
      })
      .addCase(login2fa.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
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
        state.error = null;
        state.initialized = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
      })
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.error = null;
        state.initialized = true;
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
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
      .addCase(getProfile.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.initialized = true;
      });
  },
});

export const { clearError, setAccessToken } = authSlice.actions;
export default authSlice.reducer;
