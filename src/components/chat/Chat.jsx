import React, { useState, useRef, useEffect } from "react";
import "./chat.css";
import EmojiPicker from "emoji-picker-react";
import { db, storage } from "../../lib/firebase";
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  getDoc,
} from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";

const Chat = () => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chat, setChats] = useState([]);
  const [userChats, setUserChats] = useState(null);
  const lastMessageRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const [img, setImg] = useState(null);

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } = useChatStore();
  const { currentUser } = useUserStore();

  const timeFormatter = new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  // Fetch user chats
  useEffect(() => {
    if (!currentUser) return;
    const userChatsRef = doc(db, "userChats", currentUser.id);

    const fetchUserChats = async () => {
      try {
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot.exists()) {
          setUserChats(userChatsSnapshot.data().chats || []);
        }
      } catch (error) {
        console.error("Error fetching user chats:", error);
      }
    };

    fetchUserChats();
  }, [currentUser]);

  // Listen for chat updates
  useEffect(() => {
    if (!chatId) return;

    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      const chatData = res.data();
      if (chatData) {
        setChats(chatData.messages || []);
      }
    });

    return () => unSub();
  }, [chatId]);

  // Handle image selection
  const handleImg = (e) => {
    if (e.target.files[0]) {
      setImg(e.target.files[0]);
    }
  };

  // Handle emoji selection
  const handleEmojiClick = (emoji) => {
    setMessage((prevMessage) => prevMessage + emoji.emoji);
  };

  // Scroll to the last message when chat updates
  useEffect(() => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle sending message
  const handleSendMessage = async () => {
    if (!currentUser || (!message.trim() && !img)) return;

    let imageUrl = null;
    if (img) {
      const imgRef = ref(storage, `chatImages/${Date.now()}_${img.name}`);
      const uploadTask = uploadBytesResumable(imgRef, img);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => {
            console.error("Error uploading image:", error);
            reject(error);
          },
          async () => {
            imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve();
          }
        );
      });
    }

    try {
      const newMessage = {
        text: message || "",
        createAt: new Date(),
        own: true,
        img: imageUrl || null,
        senderId: currentUser.id,
      };

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(newMessage),
      });

      setMessage("");
      setImg(null);
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          <img src={user?.avatar || "./avatar.png"} alt="" />
          <div className="texts">
            <span>{user?.username}</span>
            <p>{chat.length > 0 ? chat[chat.length - 1].text || (chat[chat.length - 1].img ? "[Image]" : "No messages yet") : "No messages yet"}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./phone.png" alt="Phone" />
          <img src="./video.png" alt="Video Call" />
          <img src="./info.png" alt="Info" />
        </div>
      </div>

      <div className="center">
        {chat?.map((message, index) => {
          const messageDate = message.createAt?.toDate ? message.createAt.toDate() : new Date(message.createAt);
          const isOwnMessage = message.senderId === currentUser.id;

          return (
            <div key={index} className={`message ${isOwnMessage ? "own" : ""}`} ref={index === chat.length - 1 ? lastMessageRef : null}>
              {!isOwnMessage && <img src="./avatar.png" alt="Other User" />}
              <div className="texts">
                {message.img && <img src={message.img} alt="Message Content" />}
                {message.text && <p>{message.text}</p>}
                <span>{timeFormatter.format(messageDate)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bottom">
        <div className="inputContainer">
          <div className="icons-left">
            <label htmlFor="file">
              <img src="./img.png" alt="Image" />
            </label>

            <input type="file" id="file" style={{ display: "none" }} onChange={handleImg} />
            <img src="./camera.png" alt="Camera" />
            <img src="./mic.png" alt="Microphone" />
          </div>
          <input
            type="text"
            placeholder={isCurrentUserBlocked || isReceiverBlocked ? "You cannot send a message" : "Type a message..."}
            className="messageInput"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={isCurrentUserBlocked || isReceiverBlocked}
          />
          <div className="emoji" ref={emojiPickerRef}>
            <img src="./emoji.png" alt="Emoji" onClick={() => setShowEmojiPicker((prev) => !prev)} />
            {showEmojiPicker && <EmojiPicker onEmojiClick={handleEmojiClick} />}
          </div>
          <button className="sendButton" onClick={handleSendMessage} disabled={isCurrentUserBlocked || isReceiverBlocked || (!message.trim() && !img)}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
