import { Link } from "react-router-dom";

const Menu = ({ handleLogout }) => {
  return (
    <div className="menu">
      <Link to="/profile">
        <div style={{ padding: "8px 16px", cursor: "pointer" }}>會員中心</div>
      </Link>
      <Link to="/stores">
        <div style={{ padding: "8px 16px", cursor: "pointer" }}>賣場中心</div>
      </Link>
      <div
        onClick={handleLogout}
        style={{ padding: "8px 16px", cursor: "pointer" }}
      >
        Logout
      </div>
    </div>
  );
};

export default Menu;
