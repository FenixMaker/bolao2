// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAsMItWqD1DeRgDSAT3Ht5icLLC7ruB4Qs",
    authDomain: "flabibi-41919.firebaseapp.com",
    projectId: "flabibi-41919",
    storageBucket: "flabibi-41919.firebasestorage.app",
    messagingSenderId: "317644157311",
    appId: "1:317644157311:web:e7493c680541ee1c616a4a",
    measurementId: "G-1DDPT52XKD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

export { auth, db, analytics }; 