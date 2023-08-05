import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "../utils/api";
import toastMessage from "../utils/toast";
import ProductConponent from "../components/Product";
const URL = import.meta.env.VITE_DEV_SNAPUP_SOCKET || "";

function Product() {
  const snapup = true;
  const { id } = useParams();
  const [isLoad, setIsLoad] = useState(false);
  const [socket] = useState(() => io(URL, { transports: ["websocket"] }));
  const [variantId, setVariantId] = useState("");
  const [product, setProduct] = useState("");
  const [store, setStore] = useState("");
  const [stock, setStock] = useState("");
  const [amount, setAmount] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    if (![19, 17].includes(Number(id))) return navigate("/snapup");
    socket.on("wait", async () => {
      await new Promise((resolve) => setTimeout(resolve, 1 * 1000));
      if (window.location.pathname !== "/snapup/order")
        toastMessage.warn("現在人數眾多請稍等");
    });
    socket.on("hadOrder", ({ order, expire }) => {
      toastMessage.warn("你已經有訂單了!");
      const sendData = {
        name: order.name,
        storeId: order.store_id,
        image: order.main_image,
        productId: order.id,
        amount: order.amount,
        variantId: order.variantId,
        kind: order.kind,
        price: order.price,
        stock: order.stock,
        expire: new Date(Number(expire)).toLocaleString(),
      };
      localStorage.setItem("snapUpProduct", JSON.stringify([sendData]));
      navigate("/snapup/order");
    });
    socket.on("error", (err) => {
      if (err.message.includes("jwt")) {
        toastMessage.error("請先登入");
        navigate("/login");
        return;
      }
      toastMessage.error(err.message);
    });
    return () => {
      socket.off("wait");
      socket.off("error");
    };
  }, []);
  useEffect(() => {
    async function getProduct() {
      try {
        const result = await api.GetSnapUpProduct(id);
        if (result.errors) throw new Error("查無此商品");
        setProduct(result.data);
        setStore(result.data.store);
      } catch (err) {
        toastMessage.error(err.message);
        navigate("/");
      }
    }
    getProduct();
  }, []);

  useEffect(() => {
    socket.on("turnTo", (data) => {
      toastMessage.warn("您有 15 分鐘的時間可在此頁面操作");
      const user = JSON.parse(localStorage.getItem("user"));
      const variant = product.variants.filter(
        (ele) => ele.variantId === data.variantId
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
      socket.emit("orderProduct", { ...sendData, userId: user.id });
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
    return () => {
      socket.off("turnTo");
      socket.off("diffStock");
      socket.off("addStock");
    };
  }, [product]);

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
    if (
      product.variants.some(
        (ele) => ele.stock === variantId && amount > ele.stock
      )
    ) {
      toastMessage.error("庫存不足");
      return;
    }
    setIsLoad(true);
    socket.emit("queue", { token, productId: product.id, variantId, amount });
  }
  return (
    <>
      {product && (
        <div className="main">
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
            isLoad={isLoad}
          />
        </div>
      )}
    </>
  );
}

export default Product;
