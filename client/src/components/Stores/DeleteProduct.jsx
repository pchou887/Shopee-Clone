import { useState, useEffect } from "react";
import Loading from "../Loading";
import toastMessage from "../../utils/toast";
import api from "../../utils/api";

function DeleteProduct({
  storeId,
  products,
  setProducts,
  targetProduct,
  setTargetProduct,
}) {
  const [check, setCheck] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");
  const [isLoad, setIsLoad] = useState(false);

  async function deleteProduct() {
    const token = localStorage.getItem("jwtToken");
    setIsLoad(true);
    if (checkMessage !== "刪除") {
      toastMessage.error("請輸入正確格式");
      setCheckMessage("");
      setIsLoad(false);
      return;
    }
    try {
      const result = await api.DeleteProduct(targetProduct, storeId, token);
      if (result.errors) throw new Error(result.errors);
      const remainProducts = products.filter((ele) => ele.id != targetProduct);
      setProducts(remainProducts);
      toastMessage.success("刪除成功");
    } catch (err) {
      toastMessage.error(err.message);
    } finally {
      setCheck(false);
      setCheckMessage("");
      setIsLoad(false);
    }
  }
  return (
    <>
      <div className="store-delete" style={{ margin: "10rem" }}>
        <div style={{ textAlign: "center", fontSize: 24, padding: 20 }}>
          請選擇商品
        </div>
        <select
          name="store-delete-product"
          value={targetProduct}
          onChange={(e) => setTargetProduct(e.target.value)}
          style={{
            width: 300,
            height: 50,
            fontSize: 20,
            fontWeight: 500,
          }}
        >
          <option value="">請選擇要刪除的品項</option>
          {products &&
            products.map((ele) => (
              <option key={ele.id} value={ele.id}>
                {ele.name}
              </option>
            ))}
        </select>
      </div>

      {check && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            zIndex: 2,
            top: 0,
            left: 0,
            backgroundColor: "rgba(255, 255, 255, 0.5)",
          }}
        >
          <div
            className="overlay"
            style={{
              padding: "4vh 6vw",
              position: "absolute",
              width: "34vw",
              height: "30vh",
              zIndex: 2,
              margin: "35vh 33vw",
              backgroundColor: "#FFF",
              borderRadius: 5,
              border: "1px solid rgba(0, 0, 0, 0.3)",
            }}
          >
            <div style={{ marginBottom: "3vh" }}>
              確認要刪除該商品，請在下方輸入刪除
            </div>
            <input
              type="text"
              style={{ margin: "auto", borderRadius: 3 }}
              placeholder="刪除"
              value={checkMessage}
              onChange={(e) => setCheckMessage(e.target.value)}
            />
            <div
              style={{
                display: "flex",
                marginTop: "5vh",
                marginLeft: "12vw",
              }}
            >
              <div
                style={{
                  padding: "1vh 1vw",
                  border: "1px solid rgba(0, 0, 0, 0.3)",
                  cursor: "pointer",
                }}
                onClick={() => setCheck(!check)}
              >
                取消
              </div>
              {isLoad ? (
                <Loading
                  style={{ marginLeft: "2vw", marginTop: "0.5vh" }}
                  imgStyle={{ width: "1.5vw", height: "1.5vw" }}
                />
              ) : (
                <div
                  style={{
                    backgroundColor: "rgba(145, 151, 174, 1)",
                    padding: "1vh 1vw",
                    border: "1px solid rgba(0, 0, 0, 0.09)",
                    color: "white",
                    marginLeft: "1vw",
                    cursor: "pointer",
                  }}
                  onClick={deleteProduct}
                >
                  確認
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {targetProduct && (
        <button
          className="store-change-role"
          onClick={() => setCheck(!check)}
          style={{ marginLeft: "15rem", marginTop: "12rem" }}
        >
          確認
        </button>
      )}
    </>
  );
}

export default DeleteProduct;
