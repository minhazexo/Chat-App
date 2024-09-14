import "./chatList.css";
import AddUser from "./addUser/AddUser"; // Fixed missing quote
import { useEffect, useState } from "react";
import { useUserStore } from "../../../lib/userStore";
import { doc, onSnapshot, getDoc, updateDoc } from "firebase/firestore"; // Added getDoc import
import { db } from "../../../lib/firebase";
import { useChatStore } from "../../../lib/chatStore";

const ChatList = () => {
  const [chats, setChats] = useState([]); // Fixed typo: setchats -> setChats
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chatId, changeChat } = useChatStore();

  useEffect(() => {
    if (!currentUser?.id) return; // Ensure currentUser is available

    const unSub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const chatData = res.data();
        if (!chatData) return; // Prevent errors if no data is found

        const items = chatData.chats || [];

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.exists() ? userDocSnap.data() : null; // Check if user data exists

          return { ...item, user };
        });

        const chatList = await Promise.all(promises);
        setChats(chatList.sort((a, b) => b.updateAt - a.updateAt));
      }
    );

    return () => {
      unSub();
    };
  }, [currentUser?.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { user, ...rest } = item;
      return rest;
    });
    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );
    userChats[chatIndex].isSeen = true;
    const userChatRef = doc(db, "userchats", currentUser.id);
    try {
      await updateDoc(userChatRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (err) {
      console.log(err);
    }
  };
  const filteredChats = chats.filter(c => c.user.username.toLowerCase().includes(input.toLowerCase()))

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="Search Icon" />
          <input type="text" placeholder='Search' onChange={(e) => setInput(e.target.value)} />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt="Add Icon"
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>

      {filteredChats.map((chat, index) => (
        <div
          className="item"
          key={chat.chatId}
          onClick={() => handleSelect(chat)}
          style={{
            backgroundColor: chat?.isSeen ? "transparent" : "#5183fe",
          }}
        >
          <img
            src={
              chat.user.blocked.includes(currentUser.id)
                ? "./avatar.png"
                : chat.user.avatar || "./avatar.png"
            }
            alt=""
          />
          <div className="texts">
            <span>
              {chat.user.blocked.includes(currentUser.id)
                ? "User"
                : chat.user.username}
            </span>
            <p>{chat.lastMessage}</p>
          </div>
        </div>
      ))}

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
