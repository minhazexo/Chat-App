import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-e290e.firebaseapp.com",
  projectId: "reactchat-e290e",
  storageBucket: "reactchat-e290e.appspot.com",
  messagingSenderId: "765453356734",
  appId: "1:765453356734:web:3ef7dc697b3b2fe75298ef",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();
export const storage = getStorage();
