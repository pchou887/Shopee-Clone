import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import Cards from "../components/Stores/StoreCards";
const token = localStorage.getItem("jwtToken");

function Stores() {
  const [stores, setStores] = useState("");

  useEffect(() => {
    async function getOwnStores() {
      try {
        const result = await api.GetUserStores(token);
        if (result.errors) throw new Error(result.errors);
        setStores(result.data);
      } catch (err) {
        console.log(err);
        // localStorage.removeItem("jwtToken");
        // navigate("/login");
      }
    }
    getOwnStores();
  }, []);
  console.log(stores);
  return (
    <>
      <div className="content" style={{ paddingTop: "3rem" }}>
        {stores && <Cards data={stores} />}
      </div>
    </>
  );
}

export default Stores;
