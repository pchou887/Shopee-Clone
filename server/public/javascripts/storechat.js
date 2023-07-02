const getUserProfile = async () => {
  const response = await fetch("/api/1.0/user/profile");
  const result = await response.json();
  if (result.errors) throw new Error("get user error");
  return result.data.id;
};
const getAllUserMessage = async (jwt, storeId) => {
  const response = await fetch("/api/1.0/chat/users/message", {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      store_id: storeId,
    }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors);
  return result.data;
};

const getUserMessage = async (jwt, userId, storeId) => {
  const response = await fetch("/api/1.0/chat/user/message", {
    method: "POST",
    headers: new Headers({
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({
      user_id: userId,
      store_id: storeId,
    }),
  });
  const result = await response.json();
  if (result.errors) throw new Error("get history error");
  return result.data;
};

(async function () {
  try {
    const jwt = Cookies.get("authorization");
    const storeId = Number(Cookies.get("storeId"));
    const userId = await getUserProfile();
    socket.emit("staffJoin", { userId, storeId });
    const data = await getAllUserMessage(jwt, storeId);
    console.log(data);
    data.forEach((ele) => {
      console.log(ele);
      $(".user").append(`
        <div class="user_${ele.user_id} store_${ele.store_id} border-top room py-4">user_${ele.user_id}</div>
      `);
    });
    if (Cookies.get("now")) Cookies.set("now", "");
  } catch (err) {
    console.log(err);
  }
})();

socket.on("hasCustomer", async ({ room, userId, storeId }) => {
  if (!(Cookies.get("now") === `${userId}`))
    $(".user").append(
      `<div class="user_${userId} store_${storeId} border-top room py-4">user_${userId}</div>`
    );

  socket.emit("customerService", {
    room,
    storeId: Number(Cookies.get("storeId")),
    userId: await getUserProfile(),
  });
});
socket.on("toStore", (data) => {
  if (Cookies.get("now") === `${data.userId}`) {
    $(".chat").append(`
    <div class="border-bottom d-flex">
      <p class="me-auto">${data.userId}：${data.message}</p>
      <p>${new Date(data.time).toLocaleString()}</p>
    </div>
  `);
  }
});
socket.on("change", ({ storeId, userId }) => {
  socket.emit("customerService", {
    room: `store_${storeId}-user_${userId}`,
    storeId,
    userId,
  });
});
socket.on("staffLeave", ({ storeId, userId }) => {
  console.log(`You already leave store_${storeId}-user_${userId} room`);
  socket.emit("staffLeaveRoom", {
    room: `store_${storeId}-user_${userId}`,
    storeId,
    userId,
  });
});

$(document).on("click", ".user", async (e) => {
  try {
    const buttonClasses = e.target.classList;
    const userId = Number(buttonClasses[0].replace("user_", ""));
    const storeId = Number(buttonClasses[1].replace("store_", ""));
    const jwt = Cookies.get("authorization");
    Cookies.set("now", userId);
    const data = await getUserMessage(jwt, userId, storeId);
    let inner = "";
    data.message.forEach((ele) => {
      inner += `
      <div class="border-bottom d-flex">
        <p class="me-auto">${Number(ele.from) === userId ? userId : "客服"}：${
        ele.content
      }</p>
        <p>${new Date(ele.timestamp).toLocaleString()}</p>
      </div>
    `;
    });
    $(".chat").html(inner);
  } catch (err) {
    console.log(err);
  }
});

$(document).ready(function () {
  $(".send").click(async function () {
    const time = new Date().toLocaleString();
    const staffId = await getUserProfile();
    const userId = Number(Cookies.get("now"));
    const storeId = Number(Cookies.get("storeId"));
    const input = $(this).siblings('input[type="text"]');
    const text = input.val();
    input.val("");
    $(".chat").append(`
        <div class="border-bottom d-flex">
            <p class="me-auto">客服：${text}</p>
            <p>${time}</p>
        </div>
    `);
    socket.emit("toUser", { from: staffId, userId, storeId, message: text });
  });
});
