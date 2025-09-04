import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDg9x7TdGYA2x7ycFj1v1lIbbSuFX451xE",
  authDomain: "temp-senser-ceteprm.firebaseapp.com",
  projectId: "temp-senser-ceteprm",
  storageBucket: "temp-senser-ceteprm.firebasestorage.app",
  messagingSenderId: "997895478941",
  appId: "1:997895478941:web:89a8f9c0f862ab3c147e74",
  measurementId: "G-W0T03J8J5E"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app)