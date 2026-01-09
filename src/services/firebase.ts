import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeFirestore } from "firebase/firestore"; // Changed this
import { getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyDXtuSGDaEidywn8yuAU9_7BIzLRIQPyHo",
    authDomain: "hostelmanagement-8f095.firebaseapp.com",
    projectId: "hostelmanagement-8f095",
    storageBucket: "hostelmanagement-8f095.firebasestorage.app",
    messagingSenderId: "357787768234",
    appId: "1:357787768234:web:543de80c5edacbc74f87d3",
    measurementId: "G-S5K80PWP7F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// FIX: Use initializeFirestore with ignoreUndefinedProperties set to true
const db = initializeFirestore(app, {
    ignoreUndefinedProperties: true
});

const auth = getAuth(app);

export { app, analytics, db, auth };