import { createSlice, PayloadAction } from '@reduxjs/toolkit';




interface User {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}
interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    loading: false,
    error: null
}


const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess: (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.user = action.payload;
        },
        loginFailure: (state, action: PayloadAction<any>) => {
            state.loading = false;
            state.error = action.payload;
        },
        logoutAction: (state) => {
            state.user = null;
        }
    }
})

export const { loginStart, loginSuccess, loginFailure, logoutAction } = authSlice.actions;

export default authSlice.reducer;
