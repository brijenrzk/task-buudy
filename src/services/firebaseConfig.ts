// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth, GoogleAuthProvider, signOut, signInWithRedirect, signInWithPopup, getRedirectResult } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAwRO6OJ3dw9uuAXIogzVNC-PbuCR18X_4",
    authDomain: "task-buddy-cf672.firebaseapp.com",
    projectId: "task-buddy-cf672",
    storageBucket: "task-buddy-cf672.firebasestorage.app",
    messagingSenderId: "789251215625",
    appId: "1:789251215625:web:8ecead58ed4f13a74543d8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const provider = new GoogleAuthProvider();



// Function to handle Google sign-in
export const signInWithGoogle = async () => {
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    try {
        if (isMobile) {
            // Use redirect method for mobile devices
            await signInWithRedirect(auth, provider);
        } else {
            // Use popup method for desktop devices
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            return user; // Return user info
        }
    } catch (error: any) {
        throw new Error(error.message);
    }
};

// Handle redirect result (use this in the component where the login occurs)
export const handleRedirectResult = async () => {
    const auth = getAuth();
    try {
        const result = await getRedirectResult(auth); // Get the result of the redirect

        if (result) {
            const user = result.user;
            return user; // Return the user object after a successful login
        }
    } catch (error: any) {
        console.error("Error during sign-in redirect:", error.message);
    }
};


export default app;




// Function to handle sign-out
export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error: any) {
        throw new Error(error.message);
    }
};