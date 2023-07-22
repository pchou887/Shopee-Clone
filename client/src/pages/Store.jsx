import { useState, useLayoutEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import StoreMenu from "../components/Stores/StoreMenu";
import api from "../utils/api";
import toastMessage from "../utils/toast";
import checkRoles from "../utils/checkRole";
import StoreProduct from "../components/Stores/StoreProduct";
import CreateProduct from "../components/Stores/CreateProduct";
import StoreStaff from "../components/Stores/StoreStaff";
import CustomerService from "../components/Stores/CustomerService";
import CreateStaff from "../components/Stores/CreateStaff";
import DeleteStaff from "../components/Stores/DeleteStaff";
import DeleteProduct from "../components/Stores/DeleteProduct";

function Store() {
  const userData = JSON.parse(localStorage.getItem("user"));
  const { id } = useParams();
  const [menu, setMenu] = useState("");
  const [products, setProducts] = useState("");
  const [targetProduct, setTargetProduct] = useState("");
  const [staff, setStaff] = useState("");
  const [targetStaff, setTargetStaff] = useState("");
  const [activeStaff, setActiveStaff] = useState(null);
  const [targetRole, setTargetRole] = useState("");
  const [activeRole, setActiveRole] = useState(null);
  const [roles, setRoles] = useState({
    isCreateProduct: false,
    isRemoveProduct: false,
    isPermission: false,
    isCustomerService: false,
  });
  const navigate = useNavigate();
  const onClick = (e) => {
    if (e.key === "customer")
      navigate(`/store/${id}/staff/${userData.id}/chat`);
    setMenu(e.key);
    setActiveStaff(null);
    setTargetStaff("");
    setActiveRole(null);
    setTargetRole("");
    setTargetProduct("");
  };
  useLayoutEffect(() => {
    const token = localStorage.getItem("jwtToken");
    async function getStore() {
      try {
        const storeProducts = await api.GetStoreProducts(id);
        const storeOwnRole = await api.GetStoreOwnRole(id, token);
        const storeStaff = await api.GetStoreStaff(id, token);
        const errors = storeProducts.errors || storeOwnRole.errors;
        if (errors) throw new Error(errors);
        setProducts(storeProducts.data);
        setRoles({
          isCreateProduct: checkRoles.createProduct(storeOwnRole.data.roles),
          isRemoveProduct: checkRoles.removeProduct(storeOwnRole.data.roles),
          isPermission: checkRoles.Permission(storeOwnRole.data.roles),
          isCustomerService: checkRoles.CustomerService(
            storeOwnRole.data.roles
          ),
        });
        setStaff(storeStaff.data);
      } catch (err) {
        if (err.message.includes("jwt")) {
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("user");
          toastMessage.error("登入超時");
          navigate("/login");
        }
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
          {menu === "2" && <CreateProduct storeId={Number(id)} />}
          {menu === "3" && (
            <DeleteProduct
              storeId={Number(id)}
              products={products}
              setProducts={setProducts}
              targetProduct={targetProduct}
              setTargetProduct={setTargetProduct}
            />
          )}
          {menu === "5" && (
            <StoreStaff
              data={staff}
              storeId={Number(id)}
              setStaff={setStaff}
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
          {menu === "6" && (
            <CreateStaff
              storeId={Number(id)}
              staff={staff}
              setStaff={setStaff}
              activeRole={activeRole}
              setActiveRole={setActiveRole}
              targetRole={targetRole}
              setTargetRole={setTargetRole}
            />
          )}
          {menu === "7" && (
            <DeleteStaff
              data={staff}
              storeId={Number(id)}
              setStaff={setStaff}
              activeStaff={activeStaff}
              setActiveStaff={setActiveStaff}
              targetStaff={targetStaff}
              setTargetStaff={setTargetStaff}
            />
          )}
          {menu === "customer" && (
            <CustomerService storeId={id} staffId={userData.id} />
          )}
        </div>
      </div>
    </>
  );
}

export default Store;
