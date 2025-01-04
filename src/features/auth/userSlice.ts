import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import Cookies from 'js-cookie';

interface UserData {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}


interface UserState {
    user: any | null;
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: UserState = {
    user: null,
    status: 'idle',
};



// Async action to fetch user data
export const fetchUserData = createAsyncThunk('user/fetchUserData', async () => {
    const auth = getAuth();
    const db = getFirestore();

    const userCookie = Cookies.get('user');
    if (userCookie) {
        // User exists in cookie, return the stored data
        return JSON.parse(userCookie);
    }

    return new Promise<UserData>((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userDoc = doc(db, 'users', user.uid);
                const userSnapshot: any = await getDoc(userDoc);

                if (userSnapshot.exists()) {
                    const userData = userSnapshot.data();
                    Cookies.set('user', JSON.stringify(userData), { expires: 7 }); // Store in cookie
                    resolve({
                        uid: user.uid,
                        displayName: user.displayName,
                        email: user.email,
                        photoURL: user.photoURL,
                    });
                } else {
                    reject(new Error('User document not found'));
                }
            } else {
                reject(new Error('No authenticated user found'));
            }
        });
    });
});

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUser: (state) => {
            state.user = null; // Clear user data in the store
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUserData.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchUserData.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.user = action.payload;
            })
            .addCase(fetchUserData.rejected, (state) => {
                state.status = 'failed';
                state.user = null;
            })
    },
});
export const { clearUser } = userSlice.actions;

export default userSlice.reducer;
