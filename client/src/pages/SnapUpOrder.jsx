import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import tappay from "../utils/tappay";
import toastMessage from "../utils/toast";
import OrderConponent from "../components/Order";

function Order() {
  const [recipient, setRecipient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [product, setProduct] = useState("");
  const navigate = useNavigate();
  const freight = 45;
  useEffect(() => {
    const snapUpProduct = localStorage.getItem("snapUpProduct");
    if (!snapUpProduct) {
      toastMessage.error("您沒有任何訂單喔！");
      navigate("/");
    }
    setProduct(JSON.parse(snapUpProduct));
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
        window.alert("付款資料輸入有誤");
        return;
      }

      const result = await tappay.getPrime();
      if (result.status !== 0) {
        toastMessage.error("付款資料輸入有誤");
        return;
      }
      const subtotal = product.reduce(
        (acc, ele) => acc + ele.price * ele.amount,
        0
      );
      const list = product.map((ele) => ({
        id: ele.productId,
        name: ele.name,
        variantId: ele.variantId,
        kind: ele.kind,
        price: ele.price,
        qty: ele.amount,
      }));
      const body = {
        prime: result.card.prime,
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
      const response = await fetch(`/api/1.0/snapup/order/checkout`, {
        body: JSON.stringify(body),
        headers: new Headers({
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }),
        method: "POST",
      });
      const data = await response.json();
      if (data.errors) {
        console.log(data.errors);
        toastMessage.error("資料輸入或是登入有錯誤");
        return;
      }
      localStorage.removeItem("snapUpProduct");
      window.alert("付款成功");
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <OrderConponent
        products={product}
        recipient={recipient}
        setRecipient={setRecipient}
        checkoutSubmit={checkoutSubmit}
      />
    </>
  );
}

export default Order;
