import { Card } from "antd";

const { Meta } = Card;

function StoreProduct({ products }) {
  return (
    <div className="store-product">
      {products.map((ele) => (
        <Card
          key={ele.id}
          hoverable
          style={{ width: 240 }}
          cover={<img alt={ele.name} src={ele.main_image} />}
        >
          <Meta title={ele.name} description={ele.description} />
        </Card>
      ))}
    </div>
  );
}

export default StoreProduct;
