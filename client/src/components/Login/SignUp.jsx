import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

const SignUp = () => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const result = await api.SignUp(name, email, password);
      if (result.errors) throw new Error(result.errors);
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("user");
      localStorage.setItem("jwtToken", result.data.access_token);
      localStorage.setItem("user", result.data);
      return navigate("/");
    } catch (err) {
      console.log(err);
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
