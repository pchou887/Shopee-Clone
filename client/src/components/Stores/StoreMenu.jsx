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

const StoreMenu = ({ onClick, roles }) => {
  // const rolesArr = Object.values(roles);
  // const putItem = itemName.filter((ele, index) => rolesArr[index]);
  // const showItem = putItem.map((ele) => getItem(ele[0], ele[1]));
  // const items = [
  //   getItem(
  //     "賣家中心",
  //     "grp",
  //     null,
  //     [getItem("商品列表", "1"), ...showItem],
  //     "group"
  //   ),
  // ];
  const items = [
    getItem("商品", "sub1", <ShoppingCartOutlined />, [
      getItem("商品列表", "1"),
      getItem("新增商品", "2"),
      getItem("更新商品", "3"),
      getItem("刪除商品", "4"),
    ]),
    getItem("員工管理", "sub2", <TeamOutlined />, [
      getItem("更新權限", "5"),
      getItem("新增員工", "6"),
      getItem("刪除員工", "7"),
    ]),
    getItem("客服", "customer", <CommentOutlined />),
  ];
  return (
    // <Menu
    //   onClick={onClick}
    //   style={{ width: 256 }}
    //   defaultSelectedKeys={["1"]}
    //   defaultValue={1}
    //   mode="inline"
    //   items={items}
    // />
    <Menu
      onClick={onClick}
      style={{ width: 256, border: 0 }}
      mode="inline"
      items={items}
    />
  );
};

export default StoreMenu;
