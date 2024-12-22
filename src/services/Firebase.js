import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBW90twAztthLWwZbNXi7qFkpkqG4jMxnI",
    authDomain: "chronosfy1.firebaseapp.com",
    projectId: "chronosfy1",
    storageBucket: "chronosfy1.firebasestorage.app",
    messagingSenderId: "1042106951386",
    appId: "1:1042106951386:web:ae77e85d01909c8385a7e3"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
