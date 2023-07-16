import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toastMessage from "../../utils/toast";

import api from "../../utils/api";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const result = await api.SignIn(email, password);
      if (result.errors) throw new Error("Login Failed.");
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
      localStorage.setItem("jwtToken", result.data.access_token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      toastMessage.success("Welcome!");
      return navigate("/");
    } catch (err) {
      toastMessage.error(err.message);
    }
  }
  return (
    <>
      <div className="login">
        <h2 className="login-title">登入會員</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email：</label>
          <input
            type="email"
            id="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password">密碼：</label>
          <input
            type="password"
            id="password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button id="sign-in-btn" type="submit">
            登入
          </button>
        </form>
      </div>
    </>
  );
}

export default SignIn;
