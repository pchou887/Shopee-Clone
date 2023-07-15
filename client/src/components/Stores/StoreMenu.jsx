import {
  ShoppingCartOutlined,
  TeamOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";

function getItem(label, key, icon, children, type) {
  return {
    key,
    icon,
    children,
    label,
    type,
  };
}

const putItem = {
  isCreateProduct: [getItem("新增商品", "2")],
  isRemoveProduct: [getItem("刪除商品", "3")],
  isPermission: [
    getItem("員工管理", "staff", <TeamOutlined />, [
      getItem("更新權限", "5"),
      getItem("新增員工", "6"),
      getItem("刪除員工", "7"),
    ]),
  ],
  isCustomerService: [getItem("客服", "customer", <CommentOutlined />)],
};

function StoreMenu({ onClick, roles }) {
  const items = [
    getItem("商品", "product", <ShoppingCartOutlined />, [
      getItem("商品列表", "1"),
      ...(roles.isCreateProduct ? putItem.isCreateProduct : []),
      ...(roles.isRemoveProduct ? putItem.isRemoveProduct : []),
    ]),
    ...(roles.isPermission ? putItem.isPermission : []),
    ...(roles.isCustomerService ? putItem.isCustomerService : []),
  ];
  return (
    <Menu
      onClick={onClick}
      style={{ width: 256, border: 0 }}
      mode="inline"
      items={items}
    />
  );
}

export default StoreMenu;
