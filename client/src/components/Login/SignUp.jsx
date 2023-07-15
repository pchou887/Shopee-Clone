import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toastMessage from "../../utils/toast";
import api from "../../utils/api";

const SignUp = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      if (!name) return toastMessage.error("請輸入帳號名稱");
      if (!email) return toastMessage.error("請輸入信箱");
      if (!password) return toastMessage.error("請輸入密碼");
      const result = await api.SignUp(name, email, password);
      if (result.errors) throw new Error(result.errors);
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
      localStorage.setItem("jwtToken", result.data.access_token);
      localStorage.setItem("user", JSON.stringify(result.data.user));
      toastMessage.success("Welcome!");
      return navigate("/");
    } catch (err) {
      if (err.message.includes("token"))
        return toastMessage.error("此信箱已被註冊");
      toastMessage.error("請輸入正確格式");
    }
  };
  return (
    <div className="login">
      <h2 className="login-title">加入會員</h2>
      <div className="form">
        <label htmlFor="name">名字：</label>
        <input
          type="text"
          id="name"
          onChange={(e) => setName(e.target.value)}
        />
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
        <button id="sign-up-btn" onClick={handleSubmit}>
          註冊
        </button>
      </div>
    </div>
  );
};

export default SignUp;
