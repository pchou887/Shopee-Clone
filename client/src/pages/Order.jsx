import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import tappay from "../utils/tappay";
import toastMessage from "../utils/toast";
import api from "../utils/api";
import OrderConponent from "../components/Order";

function Order() {
  const [recipient, setRecipient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [products, setProducts] = useState("");
  const navigate = useNavigate();
  const freight = 45;
  useEffect(() => {
    async function getUserInfo() {
      try {
        const token = localStorage.getItem("jwtToken");
        const result = await api.GetUserInfo(token);
        if (result.errors) throw new Error(result.errors);
        setRecipient({
          name: result.data.name,
          email: result.data.email,
          phone: result.data.phone,
          address: result.data.address,
        });
      } catch (err) {
        if (err.message.includes("jwt")) {
          toastMessage.error("登入超時");
          navigate("/login");
        }
      }
    }
    const orderProducts = localStorage.getItem("orderProducts");
    if (!orderProducts) {
      toastMessage.error("您沒有任何訂單喔！");
      navigate("/");
    }
    setProducts(JSON.parse(orderProducts));
    getUserInfo();
  }, []);
  async function checkoutSubmit() {
    try {
      const token = localStorage.getItem("jwtToken");

      if (!token) {
        toastMessage.error("請登入會員");
        navigate("/login");
        return;
      }

      if (Object.values(recipient).some((value) => !value)) {
        toastMessage.error("請填寫完整訂購資料");
        return;
      }
      if (!tappay.canGetPrime()) {
        toastMessage.error("付款資料輸入有誤");
        return;
      }

      const result = await tappay.getPrime();
      if (result.status !== 0) {
        toastMessage.error("付款資料輸入有誤");
        return;
      }
      const subtotal = products.reduce(
        (acc, ele) => acc + ele.price * ele.amount,
        0
      );
      const list = products.map((ele) => ({
        id: ele.productId,
        name: ele.name,
        variantId: ele.variantId,
        kind: ele.kind,
        price: ele.price,
        qty: ele.amount,
      }));
      const body = {
        prime: result.card.prime || "",
        order: {
          shipping: "delivery",
          payment: "credit_card",
          subtotal,
          freight,
          total: subtotal + freight,
          recipient,
          list,
        },
      };
      const response = await fetch(`/api/1.0/order/checkout`, {
        body: JSON.stringify(body),
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }),
        method: "POST",
      });
      const data = await response.json();
      if (data.errors) {
        toastMessage.error("資料輸入或是登入有錯誤");
        return;
      }
      localStorage.removeItem("orderProducts");
      toastMessage.success("付款成功!");
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  }
  return (
    <>
      <OrderConponent
        products={products}
        recipient={recipient}
        setRecipient={setRecipient}
        checkoutSubmit={checkoutSubmit}
      />
    </>
  );
}

export default Order;
