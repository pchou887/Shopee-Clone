const getUserProfile = async () => {
  const response = await fetch("/api/1.0/user/profile");
  const result = await response.json();
  if (result.errors) throw new Error("get user error");
  return result.data.id;
};

const getHistoryMessage = async (jwt, storeId) => {
  const response = await fetch("/api/1.0/chat/message", {
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
  if (result.errors) throw new Error("get history error");
  return result.data[0];
};

const getStore = async (storeId) => {
  const response = await fetch(`/api/1.0/store/${storeId}`);
  const result = await response.json();
  if (result.errors) throw new Error("get history error");
  return result.data;
};

(async function () {
  try {
    const jwt = Cookies.get("authorization");
    const storeId = Number(Cookies.get("storeId"));
    const userId = await getUserProfile();
    socket.emit("userJoin", { userId, storeId });
    const data = await getHistoryMessage(jwt, storeId);
    const storeData = await getStore(storeId);
    $(".main-content").append(
      `<h1 class="text-center border-bottom">${storeData.name}</h1>`
    );
    data.message.forEach((ele) => {
      $(".main-content").append(`
            <div class="border-bottom d-flex">
                <p class="me-auto">${
                  Number(ele.from) === userId ? "自己" : "客服"
                }：${ele.content}</p>
                <p>${new Date(ele.timestamp).toLocaleString()}</p>
            </div>
        `);
    });
  } catch (err) {
    console.log(err);
  }
})();
$(document).ready(function () {
  $(".send").click(async function () {
    const time = new Date().toLocaleString();
    const userId = await getUserProfile();
    const storeId = Number(Cookies.get("storeId"));
    const input = $(this).siblings('input[type="text"]');
    const text = input.val();
    input.val("");
    $(".main-content").append(`
        <div class="border-bottom d-flex">
            <p class="me-auto">自己：${text}</p>
            <p>${time}</p>
        </div>
    `);
    socket.emit("toStore", { from: userId, userId, storeId, message: text });
  });
});

socket.on("toUser", (data) => {
  $(".main-content").append(`
    <div class="border-bottom d-flex">
      <p class="me-auto">客服：${data.message}</p>
      <p>${new Date(data.time).toLocaleString()}</p>
    </div>
  `);
});

$(document).ready(function () {
  $("#send").click(async function () {
    try {
      const time = new Date().toLocaleString();
      const userId = await getUserProfile();
      const storeId = Number(Cookies.get("storeId"));
      const input = $(this).siblings('input[type="text"]');
      const text = input.val();
      input.val("");

      const response = await fetch(
        `/chat/store/${storeId}/user/${userId}/touser`,
        {
          method: "POST",
          headers: new Headers({
            Authorization: `Bearer ${jwt}`,
            "Content-Type": "application/json",
          }),
          body: JSON.stringify({
            userId,
            storeId,
            from: userId,
            message: text,
          }),
        }
      );
      const result = await response.json();
      if (result.errors) throw new Error("message send failed.");

      $(".main-content").append(`
        <div class="border-bottom d-flex">
            <p class="me-auto">自己：${text}</p>
            <p>${time}</p>
        </div>
    `);
    } catch (err) {
      console.log(err);
    }
  });
});
