import { useState, useEffect } from "react";
import api from "../utils/api";

function totalPrice(obj) {
  const arr = Object.values(obj);
  const initValue = 0;
  const result = arr.reduce((acc, curr) => (acc += curr), initValue);
  return result;
}

function Cart() {
  const productId = localStorage.getItem("cartProductId");
  const variantId = localStorage.getItem("cartVariantId");
  const [existIds, setExistIds] = useState([]);
  const [variants, setVariants] = useState([]);
  const [targetId, setTargetId] = useState("");
  const [amount, setAmount] = useState({});
  const [totalObj, setTotalObj] = useState({});
  const [total, setTotal] = useState(0);
  useEffect(() => {
    function getProduct() {
      if (productId && variantId) {
        const productIds = productId.split(",").map((ele) => Number(ele));
        const variantIds = variantId.split(",").map((ele) => Number(ele));
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
              },
            ]);
            setExistIds([...existIds, ele.variantId]);
            setAmount({ ...amount, [ele.variantId]: 1 });
            setTotalObj({ ...totalObj, [ele.variantId]: 1 * ele.price });
          });
        });
      }
    }
    getProduct();
  }, [amount, existIds, productId, variantId, variants]);
  function deleteProduct(e) {
    const targetVaraint = variants.filter((ele) => ele.variantId !== targetId);
    console.log(targetVaraint);
    setVariants(targetVaraint);
  }
  return (
    <>
      <div className="main">
        <div className="content">
          {variants.length &&
            variants.map((ele) => (
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
                          setTotalObj({
                            ...totalObj,
                            [ele.variantId]: amount[ele.variantId] * ele.price,
                          });
                          setTotal(totalPrice(totalObj));
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
                          setTotalObj({
                            ...totalObj,
                            [ele.variantId]: amount[ele.variantId] * ele.price,
                          });
                          setTotal(totalPrice(totalObj));
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
                      setTargetId(ele.variantId);
                      deleteProduct();
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
            <div className="cart-buy-order">去買單</div>
          </div>
        </div>
      </div>
    </>
  );
}
export default Cart;
