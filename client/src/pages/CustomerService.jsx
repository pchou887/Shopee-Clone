import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../utils/api";
import checkRoles from "../utils/checkRole";
import toastMessage from "../utils/toast";

const URL = import.meta.env.VITE_DEV_HOST_NAME || "";

function CustomerService() {
  const user = JSON.parse(localStorage.getItem("user"));
  const { id, staffId } = useParams();
  const [socket] = useState(() => io(URL));
  const [store, setStore] = useState("");
  const [chats, setChats] = useState("");
  const [serverId, setServerId] = useState("");
  const [message, setMessage] = useState("");
  const [roomMessage, setRoomMessage] = useState("");
  const [userOrders, setUserOrders] = useState("");
  const [picture, setPicture] = useState("");
  const messageContainerRef = useRef(null);
  const navigate = useNavigate();
  useEffect(() => {
    socket.emit("staffJoin", { userId: staffId, storeId: id });
    const token = localStorage.getItem("jwtToken");
    async function getChats() {
      const result = await api.GetStoreChat(id, token);
      setChats([...result.data]);
    }
    async function checkPermission() {
      const result = await api.GetStoreOwnRole(id, token);
      if (result.errors.includes("jwt")) {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("user");
        toastMessage.error("登入超時");
        return navigate("/login");
      }
      if (!checkRoles.CustomerService(result.data.roles)) {
        toastMessage.error("你沒有權限可以訪問該網站");
        return navigate(`/store/${id}`);
      }
      setStore(result.data);
    }
    getChats();
    checkPermission();
  }, []);
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    async function getMessages() {
      const messageResult = await api.GetStoreChatMessage(id, serverId, token);
      const orderResult = await api.GetStoreUserOrders(id, serverId, token);
      setRoomMessage(messageResult.data.message);
      setUserOrders(orderResult.data);
      setTimeout(() => {
        messageContainerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 0);
    }
    getMessages();
  }, [serverId]);
  useEffect(() => {
    socket.on("hasCustomer", ({ room, storeId, userId, picture, userName }) => {
      const isExist = chats.filter(
        (ele) => Number(ele.user_id) === Number(userId)
      );
      if (!isExist.length) {
        setChats([
          {
            user_id: userId,
            name: userName,
            picture,
          },
          ...chats,
        ]);
      } else {
        const updateChat = chats.filter((ele) => ele.user_id !== userId);
        setChats([
          {
            user_id: userId,
            name: userName,
            picture,
          },
          ...updateChat,
        ]);
      }
      socket.emit("customerService", { room, storeId, userId });
    });
    socket.on("toStore", (data) => {
      if (data.from === serverId) {
        setRoomMessage([
          ...roomMessage,
          { from: data.from, content: data.message },
        ]);
        setTimeout(() => {
          messageContainerRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
          });
        }, 0);
      } else if (!chats.some((ele) => ele.user_id === data.userId)) {
        setChats([
          {
            user_id: data.from,
            name: data.userName,
            picture: data.picture,
            message: data.message,
          },
          ...chats,
        ]);
      } else {
        const updateChat = chats.filter((ele) => ele.user_id !== data.from);
        setChats([
          {
            user_id: data.from,
            name: data.userName,
            picture: data.picture,
            message: data.message,
          },
          ...updateChat,
        ]);
      }
    });
    return () => {
      socket.off("toStore");
      socket.off("hasCustomer");
    };
  }, [serverId, chats, roomMessage]);

  function sendMessage() {
    setRoomMessage([...roomMessage, { from: staffId, content: message }]);
    setMessage("");
    socket.emit("toUser", {
      from: staffId,
      userId: serverId,
      storeId: id,
      message,
      storeName: store.name,
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
      <div className="cs-content">
        <div className="cs-channels">
          <h1 className="cs-channels-title">客服中心</h1>
          {chats &&
            chats.map((ele) => (
              <div
                key={ele.user_id}
                className={`cs-channel  ${
                  serverId === ele.user_id ? "cs-channel-active" : ""
                }`}
                onClick={() => {
                  socket.emit("staffLeaveRoom", {
                    room: `${id}:${serverId}`,
                    storeId: id,
                    userId: user.id,
                  });
                  socket.emit("customerService", {
                    room: `${id}:${ele.user_id}`,
                    storeId: id,
                    userId: user.id,
                  });
                  setServerId(ele.user_id);
                  setPicture(ele.picture);
                }}
              >
                <img src={ele.picture} className="cs-channel-picture" />
                <div className="cs-channel-user">{ele.name}</div>
              </div>
            ))}
        </div>
        <div className="cs-chatroom" id="chatroom">
          {roomMessage &&
            roomMessage.map((ele, index) =>
              serverId === ele.from ? (
                <div key={index} className="cs-chatroom-user">
                  <img src={picture} className="cs-channel-picture" />
                  <div className="cs-chatroom-content">{ele.content}</div>
                </div>
              ) : (
                <div key={index} className="cs-chatroom-store">
                  <div className="cs-chatroom-content">{ele.content}</div>
                </div>
              )
            )}
          {roomMessage && (
            <div className="cs-chatroom-input">
              <input
                type="text"
                className="cs-chatroom-inputbox"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
              />
              <div className="cs-chatroom-input-btn" onClick={sendMessage}>
                傳送
              </div>
            </div>
          )}
          <div ref={messageContainerRef}></div>
        </div>
        <div className="cs-order">
          <div className="cs-order-title">訂單訊息</div>
          <div className="cs-order-content">
            {userOrders &&
              userOrders.map((ele) => (
                <div key={ele.order_id} className="cs-order-detail">
                  <div className="cs-order-detail-title">
                    訂單編號：{ele.order_id}
                  </div>
                  <div className="cs-order-detail-info">
                    <div className="cs-order-detail-info-title">
                      <div className="cs-order-detail-info-title-product">
                        商品
                      </div>
                      <div className="cs-order-detail-info-title-qty">數量</div>
                      <div className="cs-order-detail-info-title-price">
                        單價
                      </div>
                    </div>
                    {ele.order_list.map((list) => (
                      <div
                        key={list.variantId}
                        className="cs-order-detail-info-variant"
                      >
                        <img
                          src={list.image}
                          alt=""
                          className="cs-order-detail-info-variant-img"
                        />
                        <div className="cs-order-detail-info-variant-name">
                          <div className="cs-order-detail-info-variant-product-name">
                            {list.name}
                          </div>
                          <div className="cs-order-detail-info-variant-kind">
                            {list.kind}
                          </div>
                        </div>
                        <div className="cs-order-detail-info-variant-qty">
                          {list.qty}
                        </div>
                        <div className="cs-order-detail-info-variant-price">
                          ${list.price}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="cs-order-detail-footer">
                    <div className="cs-order-detail-recipient">
                      <div className="cs-order-detail-recipient-name">
                        收件人：{ele.recipient}
                      </div>
                      <div className="cs-order-detail-recipient-phone">
                        電話：{ele.phone}
                      </div>
                      <div className="cs-order-detail-recipient-address">
                        地址：{ele.address}
                      </div>
                    </div>
                    <div className="cs-order-detail-price">
                      <div className="cs-order-detail-price-payment">
                        付款：信用卡
                      </div>
                      <div className="cs-order-detail-price-freight">
                        運費：${ele.freight}
                      </div>
                      <div className="cs-order-detail-price-subtotal">
                        小計：${ele.subtotal}
                      </div>
                      <div className="cs-order-detail-price-total">
                        總計：${ele.total}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default CustomerService;
