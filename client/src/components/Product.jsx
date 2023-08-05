import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Amount from "./Amount";
import Loading from "./Loading";

function priceRange(variants) {
  const groupPrice = variants.map((ele) => Number(ele.price));
  const max = Math.max(...groupPrice);
  const min = Math.min(...groupPrice);
  return `${min}-${max}`;
}
function allStock(variants) {
  const sum = variants.reduce((acc, curr) => acc + curr.stock, 0);
  return sum;
}

function Product({
  product,
  sendOrder,
  store,
  variantId,
  setVariantId,
  amount,
  setAmount,
  addToCart,
  snapup,
  setOpen,
  setStoreChat,
  isLoad,
}) {
  const [price, setPrice] = useState(priceRange(product.variants));
  const [stock, setStock] = useState(allStock(product.variants));
  useEffect(() => {
    if (variantId) {
      const variant = product.variants.find(
        (ele) => ele.variantId === variantId
      );
      setPrice(variant.price);
      setStock(variant.stock);
    }
  }, [product.variants, variantId]);
  useEffect(() => {
    setStock(allStock(product.variants));
  }, [product.variants]);

  return (
    <>
      {product && (
        <div className="content">
          {snapup && (
            <h1
              style={{
                marginTop: 119,
                fontSize: 48,
                margin: "auto",
                maxWidth: 550,
              }}
            >
              🔥🔥🔥限時搶購🔥🔥🔥
            </h1>
          )}
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
                    <div
                      className={`select-btn ${
                        variantId === ele.variantId ? `select-btn-active` : ""
                      }`}
                      key={ele.variantId}
                      onClick={() => {
                        setVariantId(ele.variantId);
                      }}
                    >
                      {ele.kind}
                    </div>
                  );
                })}
              </div>
              <div className="amount-stock">
                <div className="info-title">數量</div>
                <Amount
                  amount={amount}
                  setAmount={setAmount}
                  limited={snapup ? (stock > 5 ? 5 : stock) : stock}
                />
                <p className="product-stock">還剩{stock}件</p>
              </div>
              <div className="product-cart-buy">
                {addToCart && (
                  <div className="product-cart" onClick={addToCart}>
                    <img
                      src="https://d1a26cbu5iquck.cloudfront.net/icon/add-cart.png"
                      alt=""
                      className="cart-img"
                    />
                    加入購物車
                  </div>
                )}
                {isLoad ? (
                  <Loading style={{ marginLeft: 25, marginTop: 10 }} />
                ) : (
                  <button className="product-buy" onClick={sendOrder}>
                    {snapup ? "立即搶購" : "直接購買"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {store && (
        <div className="product-store">
          <img src={store.picture} alt="" className="product-store-picture" />
          <div className="product-store-info">
            <div className="product-store-name">{store.name}</div>
            <div className="product-store-interact-btn">
              <div
                className="product-store-chat"
                onClick={() => {
                  setOpen(true);
                  setStoreChat({ storeId: store.id, storeName: store.name });
                }}
              >
                <img
                  src="https://d1a26cbu5iquck.cloudfront.net/icon/chat.png"
                  alt=""
                  className="product-store-btn-icon"
                />
                聊聊
              </div>
              <Link to={`/store/${product.store_id}/product`}>
                <div className="product-check-store-btn">
                  <img
                    src="https://d1a26cbu5iquck.cloudfront.net/icon/store.png"
                    alt=""
                    className="product-store-btn-icon"
                  />
                  查看賣場
                </div>
              </Link>
            </div>
          </div>
          <div className="product-store-detail">
            <div
              className="product-store-detail-items"
              style={{ paddingBottom: 20 }}
            >
              <div className="product-store-detail-item">
                <div className="product-store-detail-title">加入時間</div>
                <div className="product-store-detail-content">
                  {new Date(store.create_at).toLocaleDateString()}
                </div>
              </div>
            </div>
            <div className="product-store-detail-items">
              <div className="product-store-detail-item">
                <div className="product-store-detail-title">地區</div>
                <div className="product-store-detail-content">
                  {store.city + store.district}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {product && (
        <div className="description">
          <div className="product-description">
            <div className="description-title">商品描述</div>
            <div className="description-content">
              {product.description.split("\n").map((ele, index) => (
                <p key={index}>{ele}</p>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
export default Product;
