import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../utils/api";
import toastMessage from "../utils/toast";

const URL = import.meta.env.VITE_DEV_HOST_NAME || "";

function UserChat({ open, setOpen, storeChat, setStoreChat }) {
  const [user, setUser] = useState("");
  const [socket] = useState(() => io(URL));
  const messageContainerRef = useRef(null);
  const [chats, setChats] = useState("");
  const [message, setMessage] = useState("");
  const [chatRoom, setChatRoom] = useState("");
  const [chatStoreId, setChatStoreId] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    const userLocal = localStorage.getItem("user");
    if (!token || !userLocal) return navigate("/");
    setUser(JSON.parse(userLocal));
    socket.emit("userConnect", { userId: user.id });
    async function getChats() {
      try {
        const result = await api.GetUserChat(token);
        if (result.errors) throw new Error(result.errors);
        if (
          storeChat &&
          result.data.some((ele) => ele.storeId == storeChat.storeId)
        ) {
          const remainChat = result.data.filter(
            (ele) => ele.storeId != storeChat.storeId
          );
          setChats([storeChat, ...remainChat]);
          setStoreChat("");
        } else if (
          storeChat &&
          !result.data.some((ele) => ele.storeId == storeChat.storeId)
        ) {
          setChats([storeChat, ...result.data]);
          setStoreChat("");
        } else {
          setChats(result.data);
        }
      } catch (err) {
        if (err.message.includes("jwt")) {
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("user");
          toastMessage.error("登入超時");
          return navigate("/login");
        }
      }
    }
    getChats();
  }, []);
  useEffect(() => {
    socket.on("toUser", (data) => {
      const { storeId, storeName, from } = data;
      if (storeId === chatStoreId) {
        setChatRoom([...chatRoom, { from, content: data.message }]);
        setTimeout(() => {
          messageContainerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }, 0);
      } else if (!chats.some((ele) => ele.storeId === storeId)) {
        setChats([
          {
            storeId,
            storeName,
            message: data.message,
          },
          ...chats,
        ]);
      } else {
        const updateChat = chats.filter((ele) => ele.storeId !== storeId);
        setChats([
          {
            storeId,
            storeName,
            message: data.message,
          },
          ...updateChat,
        ]);
      }
    });
    return () => {
      socket.off("toUser");
    };
  }, [chats, chatStoreId, chatRoom]);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    async function getChatMessage() {
      const result = await api.GetUserChatMessage(token, chatStoreId);

      setChatRoom(result.data.message);
      setTimeout(() => {
        messageContainerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 0);
    }
    getChatMessage();
  }, [chatStoreId]);
  function sendMessage(e) {
    e.preventDefault();
    setMessage("");
    setChatRoom([...chatRoom, { from: user.id, content: message }]);

    socket.emit("toStore", {
      from: user.id,
      userId: user.id,
      userName: user.name,
      storeId: chatStoreId,
      picture: user.picture,
      message,
    });
    setTimeout(() => {
      messageContainerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 0);
  }
  return (
    <>
      <div className="chat-area">
        <div className="chat-area-title">
          <div className="chat-area-title-logo">聊聊</div>
          <img
            src="https://d1a26cbu5iquck.cloudfront.net/icon/cancel.png"
            alt=""
            className="chat-area-title-cancel"
            onClick={() => {
              setOpen(!open);
              setChatStoreId("");
              setChatRoom("");
            }}
          />
        </div>
        <div className="chat-area-content">
          <div className="chat-area-content-list">
            <div className="chat-area-content-list-nav">
              <div className="chat-area-content-list-search">
                <input
                  className="chat-area-content-list-input"
                  type="text"
                  placeholder="搜尋"
                />
              </div>
            </div>
            <div className="chat-area-list-name">
              {chats &&
                chats.map((ele) => (
                  <div
                    key={ele.storeId}
                    onClick={() => {
                      setChatStoreId(ele.storeId);
                      socket.emit("userJoin", {
                        userId: user.id,
                        storeId: ele.storeId,
                        picture: user.picture,
                        userName: user.name,
                      });
                    }}
                  >
                    {ele.storeName}
                  </div>
                ))}
            </div>
          </div>
          {chatStoreId && (
            <div className="chat-area-content-room-space">
              <div className="chat-area-content-room">
                {chatRoom &&
                  chatRoom.map((ele, index) =>
                    user.id === ele.from ? (
                      <div key={index} className="chat-area-content-room-user">
                        {ele.content}
                      </div>
                    ) : (
                      <div key={index} className="chat-area-content-room-store">
                        {ele.content}
                      </div>
                    )
                  )}
                <div ref={messageContainerRef}></div>
              </div>
              <form
                className="chat-area-content-room-input"
                onSubmit={sendMessage}
              >
                <input
                  type="text"
                  className="chat-area-content-room-inputbox"
                  placeholder="輸入文字"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button
                  className="chat-area-content-room-input-send"
                  type="submit"
                >
                  傳送
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UserChat;
