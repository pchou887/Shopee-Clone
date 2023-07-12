import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toastMessage from "../utils/toast";
import api from "../utils/api";
import Cards from "../components/Stores/StoreCards";

function Stores() {
  const [ownStores, setOwnStores] = useState("");
  const [otherStores, setOtherStores] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    async function getOwnStores() {
      try {
        const result = await api.GetUserStores(token);
        if (result.errors) throw new Error(result.errors);
        setOwnStores(result.data.own);
        setOtherStores(result.data.other);
      } catch (err) {
        if (err.message.includes("jwt")) {
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("user");
          toastMessage.error("登入超時");
          navigate("/login");
        }
      }
    }
    getOwnStores();
  }, []);
  console.log(ownStores);
  return (
    <>
      <div className="content" style={{ paddingTop: "3rem" }}>
        {ownStores ? (
          <div className="own-store-area">
            <div className="own-store-area-title">我的商城</div>
            <Cards data={ownStores} />
          </div>
        ) : (
          <Link to="/store/create">
            <div className="own-store-area-create">創建商城</div>
          </Link>
        )}
        {otherStores && (
          <div className="other-store-area">
            <div className="other-store-area-title">其他商城</div>
            <Cards data={otherStores} />
          </div>
        )}
      </div>
    </>
  );
}

export default Stores;
