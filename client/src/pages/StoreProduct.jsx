import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import ShowProducts from "../components/ShowProducts";
import UserChat from "../components/UserChat";

function StoreProduct() {
  const { id } = useParams();
  const [products, setProducts] = useState("");
  const [store, setStore] = useState("");
  const [open, setOpen] = useState(false);
  const [storeChat, setStoreChat] = useState("");
  useEffect(() => {
    async function getStore() {
      try {
        const storeProducts = await api.GetStoreProducts(id);
        const storeResult = await api.GetProductStore(id);
        if (storeProducts.errors || storeResult.errors)
          throw new Error(storeProducts.errors);
        setProducts(storeProducts.data);
        setStore(storeResult.data);
      } catch (err) {
        console.log(err.message);
      }
    }
    getStore();
  }, []);

  return (
    <>
      <div className="main">
        <div className="shop-space-content">
          {store && (
            <div className="shop-space-info">
              <div className="shop-space-info-detail">
                <div className="shop-space-user">
                  <div className="shop-space-user-background"></div>
                  <div className="shop-space-user-background-color"></div>
                  <div className="shop-space-user-info">
                    <img
                      src={store.picture}
                      alt=""
                      className="shop-space-user-img"
                    />
                    <h1 className="shop-space-user-name">{store.name}</h1>
                  </div>
                  <div
                    className="shop-space-chat-btn"
                    onClick={() => {
                      setOpen(true);
                      setStoreChat({ storeId: id, storeName: store.name });
                    }}
                  >
                    聊聊
                  </div>
                </div>
                <div className="shop-space-user-info-other">
                  <div className="shop-space-user-info-other-items">
                    <div className="shop-space-user-info-other-item">
                      <div className="shop-space-user-info-other-title">
                        <img
                          src="https://d1a26cbu5iquck.cloudfront.net/icon/store.png"
                          alt="store-icon"
                          className="shop-space-user-info-other-icon"
                        />
                        商品：
                      </div>
                      <div className="shop-space-user-info-other-content">
                        {products && products.reduce((acc) => acc + 1, 0)}
                      </div>
                    </div>
                    <div className="shop-space-user-info-other-item">
                      <div className="shop-space-user-info-other-title">
                        <img
                          src="https://d1a26cbu5iquck.cloudfront.net/icon/add-friend.png"
                          alt="store-icon"
                          className="shop-space-user-info-other-icon"
                        />
                        加入時間：
                      </div>
                      <div className="shop-space-user-info-other-content">
                        {new Date(store.create_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="shop-space-user-info-other-items">
                    <div className="shop-space-user-info-other-item">
                      <div className="shop-space-user-info-other-title">
                        <img
                          src="https://d1a26cbu5iquck.cloudfront.net/icon/delivery-truck.png"
                          alt="store-icon"
                          className="shop-space-user-info-other-icon"
                        />
                        出貨地：
                      </div>
                      <div className="shop-space-user-info-other-content">
                        {store.city + store.district}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="shop-space-nav">
          <div className="shop-space-nav-titles">
            <div className="shop-space-nav-title">商品列表</div>
          </div>
        </div>
        <ShowProducts products={products} />
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
export default StoreProduct;
