import { doc, getDoc } from 'firebase/firestore';
import { create } from 'zustand';
import { db } from './firebase';

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  
  fetchUserInfo: async (uid) => {
    // If no UID is provided, clear currentUser and stop loading
    if (!uid) return set({ currentUser: null, isLoading: false });

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // If document exists, update the currentUser and stop loading
        set({ currentUser: docSnap.data(), isLoading: false });
      } else {
        // If no document found, clear currentUser and stop loading
        set({ currentUser: null, isLoading: false });
      }
    } catch (err) {
      console.log("Error fetching user info:", err);
      // On error, clear currentUser and stop loading
      set({ currentUser: null, isLoading: false });
    }
  }
}));
