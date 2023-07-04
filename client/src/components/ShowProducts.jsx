import { Link } from "react-router-dom";
function ShowProducts({ products }) {
  return (
    <>
      <div className="home-products">
        {products.length &&
          products.map((ele) => (
            <Link key={ele.id} to={`/product/${ele.id}`}>
              <div className="home-product">
                <img
                  src={ele.main_image}
                  alt={ele.name}
                  className="home-product-img"
                />
                <div className="home-product-info">
                  <p className="product-name">{ele.name}</p>
                  <p className="product-price">{`$${ele.variants[0].price}`}</p>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </>
  );
}

export default ShowProducts;
