import { useState } from "react";
import { Modal } from "antd";
import toastMessage from "../../utils/toast";

function isEmail(email) {
  const checkEmail = email.trim().toLowerCase();
  const atIndex = checkEmail.indexOf("@");
  const dotIndex = checkEmail.indexOf(".", atIndex);
  return (
    !checkEmail[dotIndex + 2] || !(dotIndex - atIndex > 2) || !(atIndex > 1)
  );
}

function isPhone(phone) {
  return phone.replace(/[0-9]/g, "") || phone.length < 9 || phone.length > 10;
}

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
          if (isEmail(tempInfo.email)) {
            toastMessage.warn("請輸入正確的 email");
            return;
          }
          if (isPhone(tempInfo.phone)) {
            toastMessage.warn("請輸入正確的號碼");
            return;
          }
          setRecipient({
            ...tempInfo,
            email: tempInfo.email.trim().toLowerCase(),
          });
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
              type="email"
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
              type="tel"
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
