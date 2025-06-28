import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD30OgZvFdrU0yHV55HJdlGUFdfpTkdg40",
  authDomain: "tbc-blog-170fa.firebaseapp.com",
  projectId: "tbc-blog-170fa",
  storageBucket: "tbc-blog-170fa.firebasestorage.app",
  messagingSenderId: "617567066420",
  appId: "1:617567066420:web:21fc298b8e850eea236d61",
  measurementId: "G-K3BDKLK8ZD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;