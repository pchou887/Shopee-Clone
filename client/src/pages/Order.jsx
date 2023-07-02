import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import tappay from "../utils/tappay";

const TAPPAY_ID = import.meta.env.VITE_TAPPAY_ID;
const TAPPAY_KEY = import.meta.env.VITE_TAPPAY_KEY;

function Order() {
  const [recipient, setRecipient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const product = JSON.parse(localStorage.getItem("snapUpProduct"));
  const variantId = Number(localStorage.getItem("snapUpVariantId"));
  const amount = Number(localStorage.getItem("snapUpAmount"));
  const variant = product.variants.find((ele) => ele.variantId === variantId);
  const cardNumberRef = useRef();
  const cardExpirationDateRef = useRef();
  const cardCCVRef = useRef();
  const formRef = useRef();
  const navigate = useNavigate();
  const freight = 30;

  useEffect(() => {
    const setupTappay = async () => {
      await tappay.setupSDK(TAPPAY_ID, TAPPAY_KEY);
      tappay.setupCard(
        cardNumberRef.current,
        cardExpirationDateRef.current,
        cardCCVRef.current
      );
    };
    setupTappay();
  }, []);

  async function checkoutSubmit() {
    try {
      const token = localStorage.getItem("jwtToken");

      if (!token) {
        window.alert("請登入會員");
        return;
      }

      if (Object.values(recipient).some((value) => !value)) {
        window.alert("請填寫完整訂購資料");
        return;
      }

      if (!tappay.canGetPrime()) {
        window.alert("付款資料輸入有誤");
        return;
      }

      const result = await tappay.getPrime();
      if (result.status !== 0) {
        window.alert("付款資料輸入有誤");
        return;
      }
      const subtotal = variant.price * amount;
      const body = {
        prime: result.card.prime,
        order: {
          shipping: "delivery",
          payment: "credit_card",
          subtotal,
          freight,
          total: subtotal + freight,
          recipient,
          list: [
            {
              id: product.id,
              name: product.name,
              variantId,
              kind: variant.kind,
              price: variant.price,
              qty: amount,
            },
          ],
        },
      };
      const response = await fetch(
        `http://localhost:3000/api/1.0/order/checkout`,
        {
          body: JSON.stringify(body),
          headers: new Headers({
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          }),
          method: "POST",
        }
      );
      const data = await response.json();
      console.log(data);
      if (data.errors) {
        window.alert("資料輸入或是登入有錯誤");
        return;
      }
      localStorage.removeItem("snapUpProduct");
      localStorage.removeItem("snapUpVariantId");
      localStorage.removeItem("snapUpAmount");
      window.alert("付款成功");
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <>
      <div className="content">
        <div className="order-info">
          <img className="order-img" src={product.main_image} />
          <div className="order-details">
            <h1 className="order-title">{product.name}</h1>
            <p className="order-kind">種類：{variant.kind}</p>
            <p className="order-amount">數量：{amount}</p>
            <p className="order-price">價格：{variant.price}</p>
          </div>
        </div>
        <div className="order-total">
          <h2>運費：{freight}</h2>
          <h1>總價：{variant.price * amount + freight}</h1>
        </div>
      </div>
      <form className="order-form" ref={formRef}>
        <div className="recipent-name recipent">
          <p className="recipent-title">姓名：</p>
          <input
            type="text"
            onChange={(e) =>
              setRecipient({ ...recipient, name: e.target.value })
            }
          />
        </div>
        <div className="recipent-email recipent">
          <p className="recipent-title">Email：</p>

          <input
            type="text"
            onChange={(e) =>
              setRecipient({ ...recipient, email: e.target.value })
            }
          />
        </div>
        <div className="recipent-phone recipent">
          <p className="recipent-title">電話：</p>

          <input
            type="text"
            onChange={(e) =>
              setRecipient({ ...recipient, phone: e.target.value })
            }
          />
        </div>
        <div className="recipent-address recipent">
          <p className="recipent-title">地址：</p>

          <input
            type="text"
            onChange={(e) =>
              setRecipient({ ...recipient, address: e.target.value })
            }
          />
        </div>
        <div className="order-tappay">
          <div className="card-number card">
            <p className="card-title">信用卡號碼：</p>
            <div className="tpfield" id="card-number" ref={cardNumberRef}></div>
          </div>
          <div className="card-expiration-date card">
            <p className="card-title">有效期限：</p>
            <div
              className="tpfield"
              id="card-expiration-date"
              ref={cardExpirationDateRef}
            ></div>
          </div>

          <div className="card-ccv card">
            <p className="card-title">安全碼：</p>
            <div className="tpfield" id="card-ccv" ref={cardCCVRef}></div>
          </div>
        </div>
      </form>
      <button className="product-buy" onClick={checkoutSubmit}>
        確認付款
      </button>
    </>
  );
}

export default Order;
