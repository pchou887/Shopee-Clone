import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Menu from "./Menu";
import toastMessage from "../utils/toast";
function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");
  const [isActive, setIsActive] = useState(false);
  function handleLogout() {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("user");
    toastMessage.success("登出成功");
    navigate("/");
  }
  function goLogin() {
    localStorage.setItem("original", window.location.pathname);
    navigate("/login");
  }
  return (
    <>
      <div className="header">
        <div className="header-items">
          <div className="header-download">
            <Link to="/">
              <p className="header-first-item">下載</p>
            </Link>
          </div>
          <div className="header-follow">
            <p className="header-item">追蹤我們</p>
            <img
              src="https://d1a26cbu5iquck.cloudfront.net/icon/facebook.png"
              alt="facebook"
              className="header-icon"
            />
            <img
              src="https://d1a26cbu5iquck.cloudfront.net/icon/instagram.png"
              alt="instagram"
              className="header-icon"
            />
            <img
              src="https://d1a26cbu5iquck.cloudfront.net/icon/line.png"
              alt="line"
              className="header-icon"
            />
          </div>
          <div className="help">
            <img
              src="https://d1a26cbu5iquck.cloudfront.net/icon/notify.png"
              alt=""
              className="notify-icon"
            />
            <Link path="#">
              <p className="help-text">通知中心</p>
            </Link>
          </div>
          <div className="help">
            <img
              src="https://d1a26cbu5iquck.cloudfront.net/icon/help.png"
              alt=""
              className="help-icon"
            />
            <Link path="#">
              <p className="help-text">幫助中心</p>
            </Link>
          </div>
        </div>
        <div className="header-main">
          <Link to="/">
            <div className="logo">
              <img
                src="https://d1a26cbu5iquck.cloudfront.net/icon/shopee-icon.png"
                alt="logo"
                className="logo-icon"
              />
              <p className="logo-text">蝦皮購物</p>
            </div>
          </Link>
          <div className="search">
            <div className="search-box">
              <input
                className="search-input"
                type="text"
                placeholder="快來搜尋商品開始購物吧!"
              />
              <div className="search-button">
                <img
                  src="https://d1a26cbu5iquck.cloudfront.net/icon/search.png"
                  alt="search-icon"
                  className="search-icon"
                />
              </div>
            </div>
            <div className="search-keyword">
              <div className="keyword">太鼓鼓棒</div>
              <div className="keyword">電玩周邊</div>
            </div>
          </div>
          <div className="cart">
            <Link to="/cart">
              <img
                src="https://d1a26cbu5iquck.cloudfront.net/icon/cart.png"
                alt="cart-icon"
                className="cart-icon"
              />
            </Link>
          </div>
          <div
            className="user"
            onClick={() => {
              setIsActive(!isActive);
              if (!token) goLogin();
            }}
          >
            <img
              src="https://d1a26cbu5iquck.cloudfront.net/icon/user-icon.png"
              alt="user-icon"
              className="user-icon"
            />
            {token && isActive && <Menu handleLogout={handleLogout} />}
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
