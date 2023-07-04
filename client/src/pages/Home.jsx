import { useEffect, useState } from "react";
import ShowProducts from "../components/ShowProducts";
import api from "../utils/api";
import toastMessage from "../utils/toast";
import Carousels from "../components/AntUtils/Carousel";

function Home() {
  const [products, setProducts] = useState([]);
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
    </>
  );
}
export default Home;
