import { Card } from "antd";
import { Link } from "react-router-dom";

const { Meta } = Card;

function StoreProduct({ products }) {
  return (
    <div className="store-product">
      {products.map((ele) => (
        <Link key={ele.id} to={`/product/${ele.id}`}>
          <Card
            key={ele.id}
            hoverable
            style={{ width: 240 }}
            cover={<img alt={ele.name} src={ele.main_image} />}
          >
            <Meta
              title={ele.name}
              description={
                ele.description.length > 10
                  ? `${ele.description.replace("\n", " ").substr(0, 10)}...`
                  : ele.description
              }
            />
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default StoreProduct;
