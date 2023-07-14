import { useState } from "react";
import {
  MinusCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, InputNumber, Select, Upload, Space } from "antd";
import api from "../../utils/api";
import toastMessage from "../../utils/toast";

const { TextArea } = Input;
const fileTypes = [
  "image/apng",
  "image/bmp",
  "image/gif",
  "image/jpeg",
  "image/pjpeg",
  "image/png",
  "image/svg+xml",
  "image/tiff",
  "image/webp",
  "image/x-icon",
];
function validFileType(main_image, images) {
  const imageFileTypes = [];
  main_image.forEach((ele) => imageFileTypes.push(ele.type));
  images.forEach((ele) => imageFileTypes.push(ele.type));
  return imageFileTypes.every((ele) => fileTypes.includes(ele));
}
function isMinus(variants) {
  return variants.some((ele) => ele.stock < 0 || ele.price <= 0);
}
function validFileSize(main_image, images) {
  const MB = 1024 * 1024;
  const imageFileSize = [];
  main_image.forEach((ele) => imageFileSize.push(ele.size));
  images.forEach((ele) => imageFileSize.push(ele.size));
  return imageFileSize.every((ele) => ele < 5 * MB);
}
function isLengthLimit(name, variants) {
  const strLengthArr = [];
  strLengthArr.push(name.length);
  variants.forEach((ele) => strLengthArr.push(ele.kind.length));
  return strLengthArr.some((ele) => ele > 20);
}
function CreateProduct({ storeId }) {
  const [main, setMain] = useState([]);
  const [images, setImages] = useState([]);
  async function onFinish(values) {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!values.variants || !values.variants.length) {
        toastMessage.error("請至少添加一個種類");
        return;
      }
      if (!validFileType(main, images))
        throw new Error("請不要上傳照片以外的檔案");
      if (!validFileSize(main, images))
        throw new Error("請上傳小於 5 MB 的檔案");
      if (isMinus(values.variants)) throw new Error("庫存與價格不能為負");
      if (isLengthLimit(values.name, values.variants))
        throw new Error("名字與種類不得超過20字");
      const result = await api.CreateProduct(
        {
          ...values,
          store_id: storeId,
          main_image: main[0],
          images: images,
        },
        token
      );
      if (result.errors) throw new Error("創建商品失敗");
      toastMessage.success("創建成功");
    } catch (err) {
      toastMessage.error(err.message);
    }
  }
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
          name="description"
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
            <Button icon={<UploadOutlined />}>照片請小於 5 MB</Button>
          </Upload>
        </Form.Item>
        <Form.Item name="images" label="其他照片">
          <Upload {...imagesProps} maxCount={5}>
            <Button icon={<UploadOutlined />}>照片請小於 5 MB</Button>
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
