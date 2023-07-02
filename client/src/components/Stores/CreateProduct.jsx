import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Select, Upload, Space } from "antd";
import { useState } from "react";
const { TextArea } = Input;

function CreateProduct() {
  const [main, setMain] = useState([]);
  const [images, setImages] = useState([]);
  const onFinish = (values) => {
    console.log("Received values of form:", values);
    if (!values.variants.length) {
      window.alert("請至少添加一個種類");
      return;
    }
    console.log(main);
    console.log(images);
  };
  const mainProps = {
    onRemove: (file) => {
      const index = main.indexOf(file);
      const newFileList = main.slice();
      newFileList.splice(index, 1);
      setMain(newFileList);
    },
    beforeUpload: (file) => {
      setMain([...main, file]);

      return false;
    },
    main,
  };
  const imagesProps = {
    onRemove: (file) => {
      const index = images.indexOf(file);
      const newFileList = images.slice();
      newFileList.splice(index, 1);
      setImages(newFileList);
    },
    beforeUpload: (file) => {
      setImages([...images, file]);

      return false;
    },
    images,
  };
  return (
    <div className="create-product">
      <Form
        labelCol={{ span: 4 }}
        wrapperCol={{ span: 14 }}
        onFinish={onFinish}
        layout="horizontal"
        style={{ minWidth: 600 }}
        autoComplete="off"
      >
        <Form.Item
          name="name"
          label="商品名稱"
          rules={[{ required: true, message: "Missing!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="category"
          label="類別"
          rules={[{ required: true, message: "Missing!" }]}
        >
          <Select>
            <Select.Option value="video_game_peripherals">
              電玩周邊
            </Select.Option>
            <Select.Option value="clothes">服飾</Select.Option>
            <Select.Option value="shoes">鞋子</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="descrition"
          label="描述"
          rules={[{ required: true, message: "Missing!" }]}
        >
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="main_image"
          label="封面照片"
          rules={[{ required: true, message: "Missing!" }]}
        >
          <Upload {...mainProps} maxCount={1}>
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
        </Form.Item>
        <Form.Item name="images" label="其他照片">
          <Upload {...imagesProps} maxCount={5}>
            <Button icon={<UploadOutlined />}>Select File</Button>
          </Upload>
        </Form.Item>
        <div className="create-variants">
          <Form.List name="variants">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "kind"]}
                      rules={[{ required: true, message: "Missing!" }]}
                      style={{
                        display: "flex",
                        paddingRight: 50,
                      }}
                    >
                      <Input style={{ width: 200 }} placeholder="種類" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "stock"]}
                      rules={[{ required: true, message: "Missing!" }]}
                    >
                      <InputNumber placeholder="庫存" />
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "price"]}
                      rules={[{ required: true, message: "Missing!" }]}
                    >
                      <InputNumber placeholder="價格" />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    增加種類
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </div>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
export default CreateProduct;
