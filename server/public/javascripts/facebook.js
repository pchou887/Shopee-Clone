window.fbAsyncInit = function () {
  FB.init({
    appId: "787847959521480",
    cookie: true,
    xfbml: true,
    version: "v16.0",
  });
  FB.AppEvents.logPageView();
};

(function (d, s, id) {
  var js,
    fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) {
    return;
  }
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
})(document, "script", "facebook-jssdk");

function loginWithFacebook() {
  FB.login(
    function (response) {
      if (response.authResponse) {
        const accessToken = response.authResponse.accessToken;
        $.ajax({
          url: "/api/1/user/signin",
          method: "POST",
          data: {
            access_token: accessToken,
            provider: "facebook",
          },
          success: function (res) {
            console.log(res);
            $(".text-danger").hide();
            $(".text-success").text("Sign in success! Token is in console.");
            $(".text-success").show();
          },
          error: function (xhr, status, error) {
            $(".text-success").hide();
            $(".text-danger").text(xhr.responseJSON.error);
            $(".text-danger").show();
          },
        });
      } else {
        console.log("User cancelled login or did not fully authorize.");
      }
    },
    { scope: "public_profile,email" }
  );
}
