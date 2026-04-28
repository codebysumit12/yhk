// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// Note: measurementId removed since we're not using Analytics
const firebaseConfig = {
  apiKey: "AIzaSyA8Rk5ViCQQdjnTXv98iO9jADFmtg3LxDU",
  authDomain: "yeswanth-s-healthy-kitchen.firebaseapp.com",
  projectId: "yeswanth-s-healthy-kitchen",
  storageBucket: "yeswanth-s-healthy-kitchen.firebasestorage.app",
  messagingSenderId: "579329797638",
  appId: "1:579329797638:web:a48a7f64634775117b1d87"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services (only Firestore since we use MSG91 for auth)
export const db = getFirestore(app);

// Export the app instance for use in other components
export default app;
