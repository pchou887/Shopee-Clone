import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import api from "../utils/api";

const SOCKET_URL = import.meta.env.VITE_DEV_HOST_NAME;
const socket = io(SOCKET_URL);

function UserChat({ open, setOpen }) {
  const user = JSON.parse(localStorage.getItem("user")).user;
  const messageContainerRef = useRef(null);
  const [chats, setChats] = useState("");
  const [message, setMessage] = useState("");
  const [chatRoom, setChatRoom] = useState("");
  const [chatStoreId, setChatStoreId] = useState("");
  if (chatStoreId)
    socket.emit("userJoin", {
      userId: user.id,
      storeId: chatStoreId,
      picture: user.picture,
      userName: user.name,
    });
  socket.on("toUser", (data) => {
    if (data.from === chatStoreId) {
      setChatRoom([...chatRoom, { from: data.from, content: data.message }]);
    } else if (!chats.some((ele) => ele.storeId === data.storeId)) {
      setChats([
        {
          storeId: data.storeId,
          storeName: data.storeName,
          message: data.message,
        },
        ...chats,
      ]);
    } else {
      const updateChat = chats.filter((ele) => ele.storeId !== data.storeId);
      setChats([
        {
          storeId: data.storeId,
          storeName: data.storeName,
          message: data.message,
        },
        ...updateChat,
      ]);
    }
  });
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    async function getChats() {
      const result = await api.GetUserChat(token);
      setChats(result.data);
    }
    getChats();
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    async function getChatMessage() {
      const result = await api.GetUserChatMessage(token, chatStoreId);
      setChatRoom(result.data.message);
    }
    getChatMessage();
  }, [chatStoreId]);
  function sendMessage() {
    setMessage("");
    setChatRoom([...chatRoom, { from: user.id, content: message }]);

    socket.emit("toStore", {
      from: user.id,
      userId: user.id,
      storeId: chatStoreId,
      message,
    });
    scrollToLatestMessage();
  }
  const scrollToLatestMessage = () => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  };
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
              <div className="chat-area-content-room" ref={messageContainerRef}>
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
              </div>
              <div className="chat-area-content-room-input">
                <input
                  type="text"
                  className="chat-area-content-room-inputbox"
                  placeholder="輸入文字"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                />
                <div
                  className="chat-area-content-room-input-send"
                  onClick={sendMessage}
                >
                  傳送
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default UserChat;
