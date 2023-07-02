/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../utils/api";

function Product() {
  const [variantId, setVariantId] = useState("");
  const [product, setProduct] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [amount, setAmount] = useState(1);
  const socket = io("http://localhost:3000");
  const navigate = useNavigate();
  socket.on("wait", (data) => {
    console.log(data);
  });
  socket.on("turnTo", () => {
    localStorage.setItem("snapUpProduct", JSON.stringify(product));
    localStorage.setItem("snapUpVariantId", variantId);
    localStorage.setItem("snapUpAmount", amount);
    navigate("/order");
  });
  socket.on("stockChange", ({ amount }) => {
    setStock(stock - amount);
  });
  socket.on("error", (err) => {
    console.log(err);
  });

  useEffect(() => {
    async function getProduct() {
      try {
        const { data } = await api.GetSnapUpProduct(1);
        if (!data) throw new Error("No Found Product");
        setProduct(data);
        setVariantId(data.variants[0].variantId);
      } catch (err) {
        console.log(err);
      }
    }
    getProduct();
  }, []);

  useEffect(() => {
    if (variantId) {
      const variant = product.variants.find(
        (ele) => ele.variantId === variantId
      );
      setPrice(variant.price);
      setStock(variant.stock);
    }
  }, [product.variants, variantId]);

  function sendOrder() {
    const token = localStorage.getItem("jwtToken");
    socket.emit("queue", { token, amount });
  }

  return (
    <>
      {product && (
        <div className="content">
          <div className="product">
            <div className="product-img">
              <img
                className="product-img"
                src={product.main_image}
                alt="product"
              />
            </div>
            <div className="product-info">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-variant">
                種類：
                {product.variants.map((ele) => {
                  return (
                    <button
                      className="product-kind"
                      key={ele.variantId}
                      onClick={() => {
                        setVariantId(ele.variantId);
                      }}
                    >
                      {ele.kind}
                    </button>
                  );
                })}
              </div>
              <p className="product-price">價格：{price}</p>
              <div className="product-amount">
                <button
                  className="amount-diff amount-button"
                  onClick={() =>
                    setAmount(amount - 1 > 0 ? amount - 1 : amount)
                  }
                >
                  -
                </button>
                <input
                  className="amount"
                  type="number"
                  value={amount}
                  required
                  readOnly
                />
                <button
                  className="amount-plus amount-button"
                  onClick={() =>
                    setAmount(amount + 1 <= 5 ? amount + 1 : amount)
                  }
                >
                  +
                </button>
              </div>
              <button className="product-buy" onClick={sendOrder}>
                直接購買
              </button>
              <p className="product-stock">(庫存剩下 {stock})</p>
            </div>
          </div>
          <div className="product-description">描述：{product.description}</div>
        </div>
      )}
    </>
  );
}

export default Product;
