import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosClient from '../api/axiosClient';

const storedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
const storedToken = localStorage.getItem('token') || null;

export const loginUser = createAsyncThunk('auth/loginUser', async (credentials, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/users/login', credentials);
    const { token, user } = response.data;
    if (!user?.admin) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
    return { token, user };
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data?.err || 'Login failed';
    return rejectWithValue(message);
  }
});

export const verifyAdminSecret = createAsyncThunk('auth/verifyAdminSecret', async ({ adminSecret, tempAuth }, { rejectWithValue }) => {
  try {
    await axiosClient.post('/users/verify-admin-secret', {
      adminSecret,
      username: tempAuth.user?.username,
      userId: tempAuth.user?._id
    });
    localStorage.setItem('token', tempAuth.token);
    localStorage.setItem('user', JSON.stringify(tempAuth.user));
    return tempAuth;
  } catch (err) {
    const message = err.response?.data?.message || 'Mã xác nhận Admin không chính xác!';
    return rejectWithValue(message);
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosClient.post('/users/signup', userData);
    return response.data;
  } catch (err) {
    const message = err.response?.data?.message || err.response?.data?.err || 'Registration failed';
    return rejectWithValue(message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!storedToken,
    isAdmin: storedUser?.admin || false,
    tempAuth: null,
    requiresAdminVerification: false,
    loading: false,
    error: null
  },
  reducers: {
    logoutUser: (state) => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.tempAuth = null;
      state.requiresAdminVerification = false;
      state.error = null;
    },
    cancelAdminVerification: (state) => {
      state.tempAuth = null;
      state.requiresAdminVerification = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.user?.admin) {
          // Admin can buoc 2: Nhap Admin Secret Code
          state.tempAuth = action.payload;
          state.requiresAdminVerification = true;
          state.isAuthenticated = false;
        } else {
          // User thuong dang nhap luon
          state.isAuthenticated = true;
          state.token = action.payload.token;
          state.user = action.payload.user;
          state.isAdmin = false;
          state.tempAuth = null;
          state.requiresAdminVerification = false;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Admin Secret
      .addCase(verifyAdminSecret.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyAdminSecret.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.isAdmin = true;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.tempAuth = null;
        state.requiresAdminVerification = false;
      })
      .addCase(verifyAdminSecret.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logoutUser, cancelAdminVerification, clearError } = authSlice.actions;
export default authSlice.reducer;