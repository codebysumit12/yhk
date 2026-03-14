// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, signInWithPhoneNumber, RecaptchaVerifier } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDHGwe0-KiZP8g92INeiMqnlBMXJOz0Mx8",
  authDomain: "yhk-p2.firebaseapp.com",
  projectId: "yhk-p2",
  storageBucket: "yhk-p2.firebasestorage.app",
  messagingSenderId: "516859500701",
  appId: "1:516859500701:web:8462ccaacfb3b00e3e5c74",
  measurementId: "G-WRWZF4X8JF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Export the app instance for use in other components
export default app;
