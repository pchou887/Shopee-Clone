import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toastMessage from "../utils/toast";
import api from "../utils/api";
import Cards from "../components/Stores/StoreCards";

function Stores() {
  const [stores, setStores] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    async function getOwnStores() {
      try {
        const result = await api.GetUserStores(token);
        if (result.errors) throw new Error(result.errors);
        setStores(result.data);
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
  return (
    <>
      <div className="content" style={{ paddingTop: "3rem" }}>
        {stores && <Cards data={stores} />}
      </div>
    </>
  );
}

export default Stores;
