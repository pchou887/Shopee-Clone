import { useState, useLayoutEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../utils/api";
import toastMessage from "../utils/toast";
import Product from "../components/Product";

function ProductPage() {
  const [product, setProduct] = useState("");
  const [variantId, setVariantId] = useState("");
  const [store, setStore] = useState("");
  const [amount, setAmount] = useState(1);
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

  function sendOrder() {
    if (!variantId) {
      toastMessage.error("請選擇至少一樣商品!");
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
          />
        )}
      </div>
    </>
  );
}

export default ProductPage;
