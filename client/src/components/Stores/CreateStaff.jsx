import { useState } from "react";
import toastMessage from "../../utils/toast";
import api from "../../utils/api";
const ROLE_NAME = [
  [2, "總經理"],
  [3, "產品主管"],
  [4, "客服主管"],
  [5, "產品部門"],
  [6, "客服部門"],
  [7, "產品實習生"],
  [8, "客服實習生"],
];

function CreateStaff({
  storeId,
  activeRole,
  setActiveRole,
  targetRole,
  setTargetRole,
}) {
  const [email, setEmail] = useState("");
  const handleRoleClick = (id) => {
    setActiveRole(id);
  };
  const changeRoleClick = async () => {
    const token = localStorage.getItem("jwtToken");
    try {
      const result = await api.CreateStaff(email, storeId, targetRole, token);
      if (!email) throw new Error("請輸入 Email");
      if (result.errors) throw new Error(result.errors);
      toastMessage.success("新增員工成功!");
    } catch (err) {
      console.log(err.message);
      toastMessage.error("請輸入正確格式!");
    }
  };
  return (
    <>
      <div className="controll-permission">
        <div className="target-user-email">
          <h3 style={{ textAlign: "center", paddingBottom: 20 }}>
            請輸入要加入的人
          </h3>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div
          className="target-user-roles"
          style={{
            marginLeft: "20vw",
          }}
        >
          <h3 style={{ textAlign: "center", paddingBottom: 20 }}>
            請選擇想新增的權限
          </h3>
          {ROLE_NAME.map((ele) => (
            <div
              key={ele[0]}
              className={`target-user-role ${
                ele[0] === activeRole ? "store-target-active" : ""
              }`}
              onClick={() => {
                setTargetRole(ele[0] === targetRole ? "" : ele[0]);
                handleRoleClick(ele[0] === activeRole ? "" : ele[0]);
              }}
            >
              <p className="role-name">{ele[1]}</p>
            </div>
          ))}
          {targetRole && (
            <button className="store-change-role" onClick={changeRoleClick}>
              確認變更
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default CreateStaff;
