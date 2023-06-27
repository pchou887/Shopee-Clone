(async function () {
  try {
    const jwt = Cookies.get("authorization");
    const response = await fetch("/api/1.0/stores", {
      headers: new Headers({
        Authorization: `Bearer ${jwt}`,
      }),
    });
    const result = await response.json();
    if (result.errors) {
      throw new Error(result.errors);
    }
    result.data.forEach((ele) => {
      $(".main-content").append(
        `<div class="card text-center mb-5">
            <div class="card-header">
                ${ele.id}
            </div>
            <div class="card-body">
                <h5 class="card-title">${ele.name}</h5>
                <p class="card-text">${ele.city} ${ele.district}</p>
                <button class="store_${ele.id} btn btn-primary">Chat</button>
            </div>
            <div class="card-footer text-muted">
                ${ele.create_at.substring(0, 10)}
            </div> 
        </div>`
      );
    });
  } catch (err) {
    console.log(err);
  }
})();
$(document).on("click", "button", function () {
  const buttonClass = $(this).attr("class").split(" ")[0];
  if (buttonClass.includes("store_")) {
    Cookies.set("storeId", buttonClass.replace("store_", ""));
    window.location.href = "/userchat";
  }
});
