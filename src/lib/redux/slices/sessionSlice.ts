import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SessionState {
  // Solo información no sensible para mejorar UX
  isLoggedIn: boolean;
  userType: string | null;
  theme: 'light' | 'dark' | 'system';
  language: 'es' | 'en';
  lastLoginDate: string | null;
}

// Estado inicial
const initialState: SessionState = {
  isLoggedIn: false,
  userType: null,
  theme: 'system',
  language: 'es',
  lastLoginDate: null,
};

// Slice de sesión
const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setSession: (
      state,
      action: PayloadAction<{
        isLoggedIn: boolean;
        userType?: SessionState['userType'];
      }>
    ) => {
      state.isLoggedIn = action.payload.isLoggedIn;
      state.userType = action.payload.userType || null;
      state.lastLoginDate = action.payload.isLoggedIn
        ? new Date().toISOString()
        : null;
    },

    clearSession: state => {
      state.isLoggedIn = false;
      state.userType = null;
      state.lastLoginDate = null;
    },

    setTheme: (state, action: PayloadAction<SessionState['theme']>) => {
      state.theme = action.payload;
    },

    setLanguage: (state, action: PayloadAction<SessionState['language']>) => {
      state.language = action.payload;
    },

    updateLastLogin: state => {
      state.lastLoginDate = new Date().toISOString();
    },
  },
});

export const {
  setSession,
  clearSession,
  setTheme,
  setLanguage,
  updateLastLogin,
} = sessionSlice.actions;

export default sessionSlice.reducer;
