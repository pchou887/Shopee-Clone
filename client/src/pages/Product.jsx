import { useState, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import toastMessage from "../utils/toast";
import Product from "../components/Product";
import UserChat from "../components/UserChat";

function ProductPage() {
  const [product, setProduct] = useState("");
  const [variantId, setVariantId] = useState("");
  const [store, setStore] = useState("");
  const [amount, setAmount] = useState(0);
  const [open, setOpen] = useState(false);
  const [storeChat, setStoreChat] = useState("");
  const navigate = useNavigate();
  const productId = useParams("id");
  useLayoutEffect(() => {
    async function getProduct() {
      try {
        const productResult = await api.GetProduct(productId.id);
        if (productResult.errors)
          throw new Error("Cannot not found this product");
        const storeResult = await api.GetProductStore(
          productResult.data.store_id
        );
        setProduct(productResult.data);
        setStore(storeResult.data);
      } catch (err) {
        console.log(err);
      }
    }
    getProduct();
  }, []);
  function addToCart() {
    if (!variantId) {
      toastMessage.error("請選擇至少一樣商品!");
      return;
    }
    const cartItems = localStorage.getItem("cartItems");

    if (cartItems) {
      const cartItemsObj = JSON.parse(cartItems);
      if (cartItemsObj.some((ele) => Number(ele.variantId) === variantId)) {
        toastMessage.error("請不要加入重複的商品!");
        return;
      }
      cartItemsObj.push({ productId: product.id, variantId, amount });
      localStorage.setItem("cartItems", JSON.stringify(cartItemsObj));
    } else {
      localStorage.setItem(
        "cartItems",
        JSON.stringify([
          {
            productId: product.id,
            variantId,
            amount,
          },
        ])
      );
    }
    toastMessage.success("已將商品加入購物車!");
  }
  function sendOrder() {
    if (!variantId) {
      toastMessage.error("請選擇至少一樣商品!");
      return;
    }
    if (
      product.variants.some(
        (ele) => ele.stock === variantId && amount > ele.stock
      )
    ) {
      toastMessage.error("庫存不足!");
      return;
    }
    if (amount === 0) {
      toastMessage.error("請選擇數量");
      return;
    }
    const variant = product.variants.filter(
      (ele) => ele.variantId === variantId
    );
    localStorage.setItem(
      "orderProducts",
      JSON.stringify([
        {
          ...variant[0],
          name: product.name,
          storeId: product.store_id,
          image: product.main_image,
          productId: product.id,
          amount,
        },
      ])
    );
    navigate("/order");
  }

  return (
    <>
      <div className="main">
        {product && (
          <Product
            product={product}
            store={store}
            amount={amount}
            setAmount={setAmount}
            variantId={variantId}
            setVariantId={setVariantId}
            sendOrder={sendOrder}
            addToCart={addToCart}
            open={open}
            setOpen={setOpen}
            storeChat={storeChat}
            setStoreChat={setStoreChat}
          />
        )}
      </div>
      {open ? (
        <UserChat
          open={open}
          setOpen={setOpen}
          storeChat={storeChat}
          setStoreChat={setStoreChat}
        />
      ) : (
        <div
          style={{
            display: `${localStorage.getItem("user") ? "fixed" : "none"}`,
          }}
          className="chat-area-icon"
          onClick={() => setOpen(!open)}
        >
          <img
            src="https://d1a26cbu5iquck.cloudfront.net/icon/chat.png"
            alt=""
            className="chat-area-icon-img"
          />
          聊聊
        </div>
      )}
    </>
  );
}

export default ProductPage;
