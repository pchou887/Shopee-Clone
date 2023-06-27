import { useEffect, useState } from "react";

function Product() {
  const queryParameters = new URLSearchParams(window.location.search);
  const id = useState(queryParameters.get("id"));
  const [productInfo, setProductInfo] = useState({
    name: "",
    description: "",
    store_id: "",
    main_image: "",
    images: "",
    varaints: "",
  });
  useEffect(() => {
    getProduct();
  }, []);
  function getProduct() {
    fetch(`http://localhost:3000/api/1.0/product/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const { name, description, store_id, main_image, images, varaints } =
          data;
        setProductInfo({
          name,
          description,
          store_id,
          main_image,
          images,
          varaints,
        });
      })
      .catch((err) => console.log(err));
  }
  return (
    <>
      <div className="product">{productInfo.name}</div>
    </>
  );
}

export default Product;
