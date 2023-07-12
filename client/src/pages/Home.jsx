import { useEffect, useState } from "react";
import ShowProducts from "../components/ShowProducts";
import api from "../utils/api";
import toastMessage from "../utils/toast";
import Carousels from "../components/AntUtils/Carousel";
import UserChat from "../components/UserChat";

function Home() {
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    async function getProduct() {
      try {
        const result = await api.GetProducts();
        if (result.errors) throw new Error("fetch error!");
        setProducts(result.data);
      } catch (err) {
        console.log(err);
        toastMessage.error(err.message);
      }
    }
    getProduct();
  }, []);
  return (
    <>
      <div className="main">
        <div className="campaign">
          <div className="campaign-content">
            <div className="carousel">
              <Carousels />
            </div>
            <div className="campaign-other">
              <div className="other other-1">
                <h3>other 1</h3>
              </div>
              <div className="other">
                <h3>other 2</h3>
              </div>
            </div>
          </div>
        </div>
        <div className="home-product-header">
          <h3>每日新發現</h3>
        </div>
        <ShowProducts products={products} />
      </div>
      {open ? (
        <UserChat open={open} setOpen={setOpen} />
      ) : (
        <div className="chat-area-icon" onClick={() => setOpen(!open)}>
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
export default Home;
