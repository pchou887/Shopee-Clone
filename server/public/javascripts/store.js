(async function () {
  try {
    const jwt = Cookies.get("authorization");
    const response = await fetch("/api/1.0/stores/staff", {
      headers: new Headers({
        Authorization: `Bearer ${jwt}`,
      }),
    });
    const result = await response.json();
    if (result.errors) throw new Error(result.errors);
    result.data.forEach((ele) => {
      $(".row").append(`
      <div class="col-sm-4">
        <div class="card" style="max-width: 18rem">
          <div class="card-body">
            <h5 class="card-title">${ele.name}</h5>
            <p class="card-text">${ele.city} ${ele.district}</p>
            <button class="store_${ele.id} btn btn-primary">Go to Store</button>
          </div>
        </div>
      </div>
    `);
    });
  } catch (err) {
    console.log(err);
  }
})();
$(document).on("click", "button", function () {
  const buttonClass = $(this).attr("class").split(" ")[0];
  if (buttonClass.includes("store_")) {
    Cookies.set("storeId", buttonClass.replace("store_", ""));
    window.location.href = "/storechat";
  }
});
