import { Card, Space } from "antd";

const Cards = ({ data }) => (
  <Space direction="vertical" size={16}>
    {data.map((ele) => (
      <Card
        key={`store-${ele.id}`}
        title={ele.name}
        extra={<a href={`/store/${ele.id}`}>Go to Store</a>}
        style={{ width: 300 }}
      >
        <p>{ele.city}</p>
        <p>{ele.district}</p>
        <p>創建於 {new Date(ele.create_at).toLocaleString()}</p>
      </Card>
    ))}
  </Space>
);

export default Cards;
