import React, { useState } from "react";
import "./addUser.css";
import { db } from "../../../../lib/firebase";
import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  doc,
  arrayUnion,
  updateDoc,
} from "firebase/firestore";
import { useUserStore } from "../../../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const { currentUser } = useUserStore();

  // Handle search by username
  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");

    try {
      const userRef = collection(db, "users");
      const q = query(userRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setUser(querySnapshot.docs[0].data()); // Get the first matched user
      } else {
        setUser(null); // Clear user if no match is found
      }
    } catch (err) {
      console.log("Error fetching user:", err);
    }
  };

  // Handle adding a new chat
  const handleAdd = async () => {
    if (!user) return;

    try {
      // Create a new chat reference in "chats" collection
      const chatRef = collection(db, "chats");
      const newChatRef = doc(chatRef); // Generates a unique document reference

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      // Add the new chat to both current user and searched user's chat list
      const userChatRef = collection(db, "userchats");

      await setDoc(doc(userChatRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      }, { merge: true });  // Use { merge: true } to avoid errors if document doesn't exist

      await setDoc(doc(userChatRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      }, { merge: true });  // Use { merge: true } here as well

      console.log("New chat created with ID:", newChatRef.id);

      // Add the chat reference to the user's "userchats" collection
      const userChatDoc = doc(userChatRef, user.uid || newChatRef.id); // Use a unique identifier

      await setDoc(userChatDoc, {
        chatId: newChatRef.id,
        user: user.username,
      }, { merge: true });

      console.log("User chat document created.");
    } catch (err) {
      console.log("Error creating chat:", err);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" required />
        <button type="submit">Search</button>
      </form>

      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="User avatar" />
            <span>{user.username}</span> {/* Display the actual username */}
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
