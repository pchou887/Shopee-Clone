import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../utils/api";
import ShowProducts from "../components/ShowProducts";

function SearchPage() {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  useEffect(() => {
    async function getProduct() {
      try {
        const result = await api.GetSearchProduct(searchParams.get("keyword"));
        if (result.errors) throw new Error(result.errors);
        setProducts(result.data);
      } catch (err) {
        console.log(err);
      }
    }
    getProduct();
  }, [searchParams.get("keyword")]);
  return (
    <>
      <div className="main">
        <div style={{ marginTop: 119 }}>
          <div
            style={{
              fontSize: 20,
              padding: 10,
              paddingTop: 20,
              margin: "auto",
              width: 1200,
            }}
          >
            <span>{`'`}</span>
            <span style={{ color: "#ee4d2d" }}>{`${searchParams.get(
              "keyword"
            )}`}</span>
            <span>{`'`}</span>
            搜尋結果
          </div>
          <ShowProducts products={products} />
        </div>
      </div>
    </>
  );
}

export default SearchPage;
