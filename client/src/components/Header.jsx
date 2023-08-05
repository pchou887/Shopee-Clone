import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Menu from "./Menu";
import toastMessage from "../utils/toast";
function Header() {
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");
  const [search, setSearch] = useState("");
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
  function submitSearch(e) {
    e.preventDefault();
    setSearch("");
    navigate(`/search?keyword=${search}`);
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
            <form className="search-box" onSubmit={submitSearch}>
              <input
                className="search-input"
                type="text"
                placeholder="快來搜尋商品開始購物吧!"
                onChange={(e) => setSearch(e.target.value)}
                value={search}
              />
              <button className="search-button">
                <img
                  src="https://d1a26cbu5iquck.cloudfront.net/icon/search.png"
                  alt="search-icon"
                  className="search-icon"
                />
              </button>
            </form>
            <div className="search-keyword">
              <Link to="/search?keyword=iPhone14">
                <div className="keyword">iPhone14</div>
              </Link>
              <Link to="/search?keyword=電競">
                <div className="keyword">電競用品</div>
              </Link>
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
