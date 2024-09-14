import "./list.css";
import Userinfo from "./userinfo/Userinfo";
import Chatlist from "./chatList/ChatList";
const list = () => {
  return (
    <div className="list">
      <Userinfo />
      <Chatlist />
    </div>
  );
};
export default list;
