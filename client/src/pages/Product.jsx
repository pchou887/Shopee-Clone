import { useState, useLayoutEffect, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import Product from "../components/Product";

function ProductPage() {
  const [product, setProduct] = useState("");
  const productId = useParams("id");
  useLayoutEffect(() => {
    async function getProduct() {
      try {
        const result = await api.GetProduct(productId.id);
        if (result.errors) throw new Error("Cannot not found this product");
        setProduct(result.data);
      } catch (err) {
        console.log(err);
      }
    }
    getProduct();
  }, []);
  console.log(product);

  function sendOrder() {
    const token = localStorage.getItem("jwtToken");
    console.log(token);
  }

  return (
    <>
      <div className="main">
        {product && <Product sendOrder={sendOrder} product={product} />}
      </div>
    </>
  );
}

export default ProductPage;
