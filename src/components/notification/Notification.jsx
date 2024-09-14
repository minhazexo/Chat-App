import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./notification.css"; // Import custom CSS

const Notification = () => {
  const notify = () => {
    toast.success("This is a toast notification!", {
      position: "bottom-left",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  return (
    <div>
      <button onClick={notify}>Show Notification</button>
      <ToastContainer
        className="custom-toast-container" // Apply custom class
        position="bottom-left"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
        progress={undefined}
      />
    </div>
  );
};

export default Notification;
