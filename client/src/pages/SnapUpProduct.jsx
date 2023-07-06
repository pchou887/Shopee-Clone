/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../utils/api";
import toastMessage from "../utils/toast";
import ProductConponent from "../components/Product";

function Product() {
  const snapup = true;
  const [variantId, setVariantId] = useState("");
  const [product, setProduct] = useState("");
  const [store, setStore] = useState("");
  const [stock, setStock] = useState("");
  const [amount, setAmount] = useState(1);
  const socket = io("http://localhost:8080");
  const navigate = useNavigate();
  socket.on("wait", (data) => {
    toastMessage.warn("現在人數眾多請稍待片刻");
    console.log(data);
  });
  socket.on("turnTo", (data) => {
    toastMessage.warn("您有 15 分鐘的時間可在此頁面操作");
    const userInfo = JSON.parse(localStorage.getItem("user"));
    const variant = product.variants.filter(
      (ele) => ele.variantId === variantId
    );
    const sendData = {
      ...variant[0],
      name: product.name,
      storeId: product.store_id,
      image: product.main_image,
      productId: product.id,
      amount: data.amount,
      expire: new Date(Number(data.expire)).toLocaleString(),
    };
    socket.emit("orderProduct", { ...sendData, userId: userInfo.user.id });
    localStorage.setItem("snapUpProduct", JSON.stringify([sendData]));
    navigate("/snapup/order");
  });
  socket.on("diffStock", (data) => {
    const variants = product.variants.map((ele) => {
      if (ele.variantId === data.variantId)
        return { ...ele, stock: ele.stock - data.stock };
      return ele;
    });
    setProduct({ ...product, variants });
  });
  socket.on("addStock", (data) => {
    const variants = product.variants.map((ele) => {
      if (ele.variantId === data.variantId)
        return { ...ele, stock: ele.stock + data.stock };
      return ele;
    });
    setProduct({ ...product, variants });
    setStock;
  });
  socket.on("error", (err) => {
    if (err.message.includes("jwt")) {
      toastMessage.error("登入超時");
      navigate("/login");
      return;
    }
    toastMessage.error(err.message);
  });

  useEffect(() => {
    async function getProduct() {
      try {
        const result = await api.GetSnapUpProduct(1);
        if (result.errors) throw new Error("No Found Product");
        setProduct(result.data);
        setStore(result.data.store);
      } catch (err) {
        console.log(err);
      }
    }
    getProduct();
  }, []);

  async function sendOrder() {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      toastMessage.error("請先登入會員!");
      navigate("/login");
      return;
    }
    if (!variantId) {
      toastMessage.error("請選擇至少一樣商品!");
      return;
    }
    socket.emit("queue", { token, productId: product.id, variantId, amount });
  }
  return (
    <>
      {product && (
        <ProductConponent
          product={product}
          store={store}
          amount={amount}
          setAmount={setAmount}
          variantId={variantId}
          setVariantId={setVariantId}
          stock={stock}
          setStock={setStock}
          sendOrder={sendOrder}
          snapup={snapup}
        />
      )}
    </>
  );
}

export default Product;
