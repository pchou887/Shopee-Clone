import { useState, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StoreMenu from "../components/Stores/StoreMenu";
import api from "../utils/api";
import checkRoles from "../utils/checkRole";
import StoreProduct from "../components/Stores/StoreProduct";
import CreateProduct from "../components/Stores/CreateProduct";
import StoreStaff from "../components/Stores/StoreStaff";

function Store() {
  const storeId = useParams("id");
  const [menu, setMenu] = useState("");
  const [products, setProducts] = useState("");
  const [staff, setStaff] = useState("");
  const [targetStaff, setTargetStaff] = useState("");
  const [activeStaff, setActiveStaff] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [activeRole, setActiveRole] = useState(null);
  const [roles, setRoles] = useState({
    isProduct: false,
    isPermission: false,
    isCustomerService: false,
  });
  const navigate = useNavigate();
  const onClick = (e) => {
    setMenu(e.key);
    setActiveStaff(null);
    setTargetStaff("");
    setActiveRole(null);
    setTargetRole("");
  };
  useLayoutEffect(() => {
    const token = localStorage.getItem("jwtToken");
    async function getStore() {
      try {
        const storeProducts = await api.GetStoreProducts(storeId.id, token);
        const storeOwnRole = await api.GetStoreOwnRole(storeId.id, token);
        const storeStaff = await api.GetStoreStaff(storeId.id, token);
        const errors =
          storeStaff.errors || storeOwnRole.errors || storeProducts.errors;
        if (errors) throw new Error(errors);
        setProducts(storeProducts.data);
        setRoles({
          isProduct: checkRoles.createProduct(storeOwnRole.data.roles),
          isPermission: checkRoles.Permission(storeOwnRole.data.roles),
          isCustomerService: checkRoles.CustomerService(
            storeOwnRole.data.roles
          ),
        });
        setStaff(storeStaff.data);
        localStorage.setItem("userId", storeOwnRole.data.id);
      } catch (err) {
        console.log(err);
        localStorage.removeItem("jwtToken");
        navigate("/login");
      }
    }
    getStore();
  }, []);
  return (
    <>
      <div className="store-content">
        <div className="store">
          <StoreMenu onClick={onClick} roles={roles} />
          {menu === "1" && products && <StoreProduct products={products} />}
          {menu === "2" && <CreateProduct />}
          {menu === "5" && (
            <StoreStaff
              data={staff}
              activeStaff={activeStaff}
              setActiveStaff={setActiveStaff}
              activeRole={activeRole}
              setActiveRole={setActiveRole}
              targetRole={targetRole}
              setTargetRole={setTargetRole}
              targetStaff={targetStaff}
              setTargetStaff={setTargetStaff}
            />
          )}
        </div>
      </div>
    </>
  );
}

export default Store;
