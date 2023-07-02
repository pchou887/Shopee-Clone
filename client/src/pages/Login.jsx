import { useState } from "react";
import SignIn from "../components/Login/SignIn";
import SignUp from "../components/Login/SignUp";

function Login() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div>
      <div className="content">
        {isSignIn ? <SignIn /> : <SignUp />}
        <p className="change-sign-p">
          {isSignIn ? "沒有帳號?" : "已經有帳號了?"}
          <button
            className="change-sign"
            onClick={() => setIsSignIn(!isSignIn)}
          >
            {isSignIn ? "這裡創建" : "登入"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
