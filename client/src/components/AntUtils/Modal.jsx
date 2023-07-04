import { useState } from "react";
import { Modal } from "antd";
import toastMessage from "../../utils/toast";

const App = ({ modalOpen, setModalOpen, setRecipient }) => {
  const [tempInfo, setTempInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  return (
    <>
      <Modal
        title="請輸入收件人資料"
        centered
        open={modalOpen}
        onOk={() => {
          if (Object.values(tempInfo).some((value) => !value)) {
            toastMessage.error("請輸入完整資料！");
            return;
          }
          setRecipient(tempInfo);
          setModalOpen(false);
        }}
        onCancel={() => setModalOpen(false)}
      >
        <div className="recipient-form">
          <div className="recipient-info">
            <div className="recipient-info-title">姓名：</div>
            <input
              type="text"
              className="recipient-info-input"
              onChange={(e) =>
                setTempInfo({ ...tempInfo, name: e.target.value })
              }
              required
            />
          </div>
          <div className="recipient-info">
            <div className="recipient-info-title">Email：</div>
            <input
              type="text"
              className="recipient-info-input"
              onChange={(e) =>
                setTempInfo({ ...tempInfo, email: e.target.value })
              }
              required
            />
          </div>
          <div className="recipient-info">
            <div className="recipient-info-title">電話：</div>
            <input
              type="text"
              className="recipient-info-input"
              onChange={(e) =>
                setTempInfo({ ...tempInfo, phone: e.target.value })
              }
              required
            />
          </div>
          <div className="recipient-info">
            <div className="recipient-info-title">收件地址：</div>
            <input
              type="text"
              className="recipient-info-input"
              onChange={(e) =>
                setTempInfo({ ...tempInfo, address: e.target.value })
              }
              required
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default App;
