$("#native-login").submit(async function (e) {
  try {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("provider", "native");
    const response = await fetch(`/api/1.0/user/signin`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        provider: formData.get("provider"),
      }),
    });
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    Cookies.set("authorization", result.data.access_token);
    window.location.href = "/user";
  } catch (err) {
    console.log(err);
  }
});

$("#native-register").submit(async function (e) {
  try {
    e.preventDefault();
    const formData = new FormData(e.target);
    formData.append("provider", "native");
    const response = await fetch(`/api/1.0/user/signup`, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        provider: formData.get("provider"),
      }),
    });
    const result = await response.json();
    if (result.error) {
      throw new Error(result.error);
    }
    Cookies.set("authorization", result.data.access_token);
    window.location.href = "/user";
  } catch (err) {
    console.log(err);
  }
});

$(".register").hide();
$(document).ready(function () {
  $(".go-login").click(function () {
    $(".login").show();
    $(".register").hide();
  });

  $(".go-register").click(function () {
    $(".register").show();
    $(".login").hide();
  });
});
