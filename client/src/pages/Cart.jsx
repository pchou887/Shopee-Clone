import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toastMessage from "../utils/toast";
import api from "../utils/api";

function Cart() {
  const [existIds, setExistIds] = useState([]);
  const [variants, setVariants] = useState([]);
  const [amount, setAmount] = useState({});
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();
  useEffect(() => {
    function getProduct() {
      const cart = localStorage.getItem("cartItems");
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toastMessage.error("請先登入!");
        navigate("/login");
        return;
      }
      if (cart) {
        const cartObj = JSON.parse(cart);
        const productIds = cartObj.map((ele) => Number(ele.productId));
        const variantIds = cartObj.map((ele) => Number(ele.variantId));
        const cartAmountWithVariantId = cartObj.reduce((acc, ele) => {
          acc[ele.variantId] = ele.amount;
          return acc;
        }, {});
        productIds.forEach(async (ele) => {
          const result = await api.GetProduct(ele);
          const variant = result.data.variants.filter(
            (ele) =>
              variantIds.includes(ele.variantId) &&
              !existIds.includes(ele.variantId)
          );
          variant.forEach((ele) => {
            setVariants([
              ...variants,
              {
                ...ele,
                name: result.data.name,
                storeId: result.data.store_id,
                image: result.data.main_image,
                productId: result.data.id,
              },
            ]);
            setExistIds([...existIds, ele.variantId]);
            setAmount({
              ...amount,
              [ele.variantId]: cartAmountWithVariantId[ele.variantId],
            });
            setTotal(
              total + ele.price * cartAmountWithVariantId[ele.variantId]
            );
          });
        });
      }
    }
    getProduct();
    if (localStorage.getItem("orderProducts"))
      localStorage.removeItem("orderProducts");
  }, [amount, existIds, variants]);
  function deleteProduct(targetProductId, targetVariantId) {
    const cart = localStorage.getItem("cartItems");
    const cartObj = JSON.parse(cart);
    const remainVaraints = variants.filter(
      (ele) => ele.variantId !== targetVariantId
    );
    const productIds = cartObj.map((ele) => Number(ele.productId));
    const variantIds = cartObj.map((ele) => Number(ele.variantId));
    if (productIds.length === 1 && variantIds.length === 1) {
      localStorage.removeItem("cartItems");
    } else {
      const remainCart = cartObj.filter(
        (ele) => ele.variantId !== targetProductId
      );
      localStorage.setItem("cartItems", JSON.stringify(remainCart));
    }
    setVariants(remainVaraints);
  }
  function submitOrder() {
    const orderProducts = variants.map((ele) => ({
      ...ele,
      amount: amount[ele.variantId],
    }));
    localStorage.setItem("orderProducts", JSON.stringify(orderProducts));
    navigate("/order");
  }
  return (
    <>
      <div className="main">
        <div className="content">
          {variants.map((ele) => (
            <div key={ele.variantId} className="shopping-cart">
              <div className="cart-title">
                <div className="cart-title-checkbox"></div>
                <div className="cart-title-product">商品</div>
                <div className="cart-title-price">單價</div>
                <div className="cart-title-amount">數量</div>
                <div className="cart-title-total">總計</div>
                <div className="cart-title-operate">操作</div>
              </div>
              <div className="cart-product">
                <div className="cart-product-checkbox"></div>
                <div className="cart-product-img">
                  <img
                    className="cart-product-main_image"
                    src={ele.image}
                    alt="product-img"
                  />
                </div>
                <div className="cart-product-name">{ele.name}</div>
                <div className="cart-product-kind">{ele.kind}</div>
                <div className="cart-product-price">${ele.price}</div>
                <div className="cart-product-amount">
                  <div className="product-amount">
                    <button
                      className="amount-diff amount-button"
                      onClick={() => {
                        setAmount(
                          amount[ele.variantId] - 1 > 0
                            ? {
                                ...amount,
                                [ele.variantId]: amount[ele.variantId] - 1,
                              }
                            : {
                                ...amount,
                                [ele.variantId]: amount[ele.variantId],
                              }
                        );
                        setTotal(
                          amount[ele.variantId] - 1 > 0
                            ? total - ele.price
                            : total
                        );
                      }}
                    >
                      -
                    </button>
                    <input
                      className="amount"
                      type="number"
                      value={amount[ele.variantId]}
                      required
                      readOnly
                    />
                    <button
                      className="amount-plus amount-button"
                      onClick={() => {
                        setAmount(
                          amount[ele.variantId] + 1 <= ele.stock
                            ? {
                                ...amount,
                                [ele.variantId]: amount[ele.variantId] + 1,
                              }
                            : {
                                ...amount,
                                [ele.variantId]: amount[ele.variantId],
                              }
                        );
                        setTotal(
                          amount[ele.variantId] + 1 <= ele.stock
                            ? total + ele.price
                            : total
                        );
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-product-total">
                  ${amount[ele.variantId] * ele.price}
                </div>
                <div
                  className="cart-product-operate"
                  onClick={() => {
                    setTotal(total - amount[ele.variantId] * ele.price);
                    deleteProduct(ele.productId, ele.variantId);
                  }}
                >
                  刪除
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="content">
          <div className="cart-buy">
            <div className="cart-buy-checkbox"></div>
            <div className="cart-buy-amount">
              總金額 ( {variants.length} 個商品 ):
            </div>
            <div className="cart-buy-price">{`$${total}`}</div>
            <div className="cart-buy-order" onClick={submitOrder}>
              去買單
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Cart;
