import React from "react";
import "./detail.css";
import { auth, db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";

const Detail = () => {
  // Extract user and other necessary data from useChatStore
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, changeBlock } = useChatStore();
  const { currentUser } = useUserStore();

  // Handle blocking user logic
  const handleBlock = async() => {
    if (!user) return;
    // Logic to block or unblock the user

    const userDocRef = doc(db, "users", currentUser.id)
    
    try {
      await updateDoc(userDocRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id): arrayUnion(user.id),
      })
      changeBlock()
    }catch(err){
      console.log(err)
    }
    
  };

  return (
    <div className="detail">
      <div className="user">
        {/* Ensure user data is available before rendering */}
        <img src={user?.avatar || "./avatar.png"} alt="User Avatar" />
        <h2>{user?.username || "Unknown User"}</h2>
        <p className="statusMessage">{user?.statusMessage || "No status available."}</p>
      </div>

      <div className="info">
        <div className="option">
          <div className="title">
            <span>Chat Settings</span>
            <img src="./arrowUp.png" alt="Arrow Up" className="icon" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Privacy & Help</span>
            <img src="./arrowUp.png" alt="Arrow Up" className="icon" />
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Photos</span>
            <img src="./arrowDown.png" alt="Arrow Down" className="icon" />
          </div>
          <div className="photos">
            <div className="photoItem">
              <img
                src="https://images.pexels.com/photos/15020759/pexels-photo-15020759/free-photo-of-cars-driving-cobblestone-city-street-on-sunset.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="Shared Photo"
                className="sharedPhoto"
              />
              <span>photo_2024_2.png</span>
              <img
                src="./download.png"
                alt="Download"
                className="downloadIcon"
              />
            </div>
          </div>
        </div>

        <div className="option">
          <div className="title">
            <span>Shared Files</span>
            <img src="./arrowUp.png" alt="Arrow Up" className="icon" />
          </div>
        </div>

        <button className="blockButton" onClick={handleBlock}>
          {isReceiverBlocked ? "Unblock User" : "Block User"}
        </button>
        <button className="logoutButton" onClick={() => auth.signOut()}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Detail;
