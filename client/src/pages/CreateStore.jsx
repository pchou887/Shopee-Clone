import { Form, Select, Input, Button } from "antd";
import toastMessage from "../utils/toast";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

function CreateStore() {
  const navigate = useNavigate();
  async function onFinish(values) {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        toastMessage.error("請先登入!");
        return navigate("/login");
      }
      const { name, city, district } = values;
      const result = await api.CreateStore(name, city, district, token);
      if (result.errors) {
        if (result.errors.message.includes("jwt")) {
          localStorage.removeItem("jwtToken");
          localStorage.removeItem("user");
          toastMessage.error("登入超時");
          return navigate("/login");
        }
        throw new Error("創建失敗!");
      }
      toastMessage.success("創建成功!");
      navigate(`/store/${result.data}`);
    } catch (err) {
      toastMessage.error(err.message);
    }
  }
  return (
    <>
      <div className="content">
        <h1
          style={{ textAlign: "center", padding: 30 }}
          className="create-store-title"
        >
          創建商城
        </h1>
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          onFinish={onFinish}
          layout="horizontal"
          style={{ minWidth: 600, marginLeft: 120 }}
          autoComplete="off"
        >
          <Form.Item
            name="name"
            label="商城名稱"
            rules={[{ required: true, message: "Missing!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="city"
            label="縣市"
            rules={[{ required: true, message: "Missing!" }]}
          >
            <Select>
              <Select.Option value="臺北市">臺北市</Select.Option>
              <Select.Option value="新北市">新北市</Select.Option>
              <Select.Option value="桃園市">桃園市</Select.Option>
              <Select.Option value="臺中市">臺中市</Select.Option>
              <Select.Option value="高雄市">高雄市</Select.Option>
              <Select.Option value="臺南市">臺南市</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="district"
            label="鄉鎮市區"
            rules={[{ required: true, message: "Missing!" }]}
          >
            <Input />
          </Form.Item>
          <div className="create-store-btn" style={{ marginLeft: 750 }}>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                送出
              </Button>
            </Form.Item>
          </div>
        </Form>
      </div>
    </>
  );
}

export default CreateStore;
