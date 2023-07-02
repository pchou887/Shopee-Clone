import { useState, useEffect } from "react";
import Amount from "./Amount";
import toastMessage from "../utils/toast";

function priceRange(variants) {
  const groupPrice = variants.map((ele) => ele.price);
  const max = Math.max(groupPrice);
  const min = Math.min(groupPrice);
  return max === min ? min : `${max}-${min}`;
}
function allStock(variants) {
  const initValue = 0;
  const sum = variants.reduce((acc, curr) => acc + curr.stock, initValue);
  return sum;
}

function Product({ product, sendOrder }) {
  const [variantId, setVariantId] = useState("");
  const [price, setPrice] = useState(priceRange(product.variants));
  const [stock, setStock] = useState(allStock(product.variants));
  const [amount, setAmount] = useState(1);
  useEffect(() => {
    if (variantId) {
      const variant = product.variants.find(
        (ele) => ele.variantId === variantId
      );
      setPrice(variant.price);
      setStock(variant.stock);
    }
  }, [product.variants, variantId]);
  function addToCart() {
    if (!variantId) {
      toastMessage.error("請選擇至少一樣商品!");
      return;
    }
    const cartItemsByProductId = localStorage.getItem("cartProductId");
    const cartItemsByVariantId = localStorage.getItem("cartVariantId");

    if (cartItemsByProductId && cartItemsByVariantId) {
      if (cartItemsByVariantId.includes(variantId)) {
        toastMessage.error("請不要加入重複的商品!");
        return;
      }
      const cartProductArray = cartItemsByProductId.split(",");
      const cartVariantArray = cartItemsByVariantId.split(",");
      cartProductArray.push(product.id);
      cartVariantArray.push(variantId);
      localStorage.setItem("cartProductId", cartProductArray.toString());
      localStorage.setItem("cartVariantId", cartVariantArray.toString());
    } else {
      localStorage.setItem("cartProductId", product.id);
      localStorage.setItem("cartVariantId", variantId);
    }
    toastMessage.success("已將商品加入購物車!");
  }
  return (
    <>
      {product && (
        <div className="content">
          <div className="product">
            <div className="product-img">
              <div className="product-main-img">
                <img
                  className="main-img"
                  src={product.main_image}
                  alt="product"
                />
              </div>
              <div className="product-other-img">
                <img className="imgs" src={product.main_image} alt="product" />
                {product.images.map((ele, i) => (
                  <img key={i} className="imgs" src={ele} alt="product" />
                ))}
              </div>
            </div>
            <div className="product-info">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-page-price">${price}</div>
              <div className="product-variant">
                <div className="info-title">種類</div>
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
              <div className="amount-stock">
                <div className="info-title">數量</div>
                <Amount amount={amount} setAmount={setAmount} limited={stock} />
                <p className="product-stock">還剩{stock}件</p>
              </div>
              <div className="product-cart-buy">
                <div className="product-cart" onClick={addToCart}>
                  <img
                    src="https://d1a26cbu5iquck.cloudfront.net/icon/add-cart.png"
                    alt=""
                    className="cart-img"
                  />
                  加入購物車
                </div>
                <button className="product-buy" onClick={sendOrder}>
                  直接購買
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {product && (
        <div className="description">
          <div className="product-description">
            <div className="description-title">商品描述</div>
            <div className="description-content">{product.description}</div>
          </div>
        </div>
      )}
    </>
  );
}
export default Product;
