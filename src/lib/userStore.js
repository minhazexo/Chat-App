// File: src/lib/userStore.js

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { db } from './firebase';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,

  fetchUserInfo: async (uid) => {
    if (!uid) {
      console.log("No UID provided, clearing user info.");
      return set({ currentUser: null, isLoading: false });
    }

    console.log("Fetching user info for UID:", uid);

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // If document exists, update the currentUser
        set({ currentUser: docSnap.data(), isLoading: false });
      } else {
        // If no document found, create a new one with default data
        const newUser = {
          uid: uid,
          displayName: "New User",
          email: "user@example.com", // Replace with actual email if available
          createdAt: new Date(),
        };
        
        await setDoc(docRef, newUser);
        set({ currentUser: newUser, isLoading: false });
        console.log("User document created for UID:", uid);
      }
    } catch (err) {
      console.error("Error fetching or creating user info:", err);
      set({ currentUser: null, isLoading: false });
    }
  },
}));
