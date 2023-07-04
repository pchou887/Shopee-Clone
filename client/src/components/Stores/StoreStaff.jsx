import { useState, useLayoutEffect } from "react";
import Loading from "../Loading";
import api from "../../utils/api";
import toastMessage from "../../utils/toast";
const ROLE_NAME = [
  [2, "總經理"],
  [3, "產品主管"],
  [4, "客服主管"],
  [5, "產品部門"],
  [6, "客服部門"],
  [7, "產品實習生"],
  [8, "客服實習生"],
];
function StoreStaff({
  data,
  storeId,
  activeStaff,
  setActiveStaff,
  activeRole,
  setActiveRole,
  targetStaff,
  setTargetStaff,
  targetRole,
  setTargetRole,
}) {
  const [isLoad, setIsLoad] = useState(false);
  const [filterData, setFilterData] = useState(data);
  const [filterRole, setFilterRole] = useState({});
  useLayoutEffect(() => {
    setIsLoad(true);
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user.user.id;
    const filterOwnId = data.filter(
      (ele) => userId != ele.user_id && ele.role_name != "admin"
    );
    const filterOwnRole = filterOwnId.reduce((obj, ele) => {
      const result = ROLE_NAME.filter((role) => role[1] != ele.role_name);
      obj[ele.user_id] = [];
      obj[ele.user_id].push(result);
      return obj;
    }, {});
    setFilterData(filterOwnId);
    setFilterRole(filterOwnRole);
    setIsLoad(false);
  }, [data]);
  const handleStaffClick = (id) => {
    setActiveStaff(id);
    setTargetRole("");
    setActiveRole(null);
  };
  const handleRoleClick = (id) => {
    setActiveRole(id);
  };
  const changeRoleClick = async (e) => {
    const token = localStorage.getItem("jwtToken");
    console.log(storeId);
    console.log(targetStaff);
    console.log(targetRole);
    try {
      const result = await api.ChangeRole(
        storeId,
        targetStaff,
        targetRole,
        token
      );
      if (result.errors) throw new Error(result.errors);
      toastMessage.success("更改成功!");
    } catch (err) {
      console.log(err);
      toastMessage.error("請確認您的權限!");
    }
  };
  return (
    <div className="controll-permission">
      <div className="store-staff">
        <h3 style={{ textAlign: "center", paddingBottom: 20 }}>
          請選擇想變更權限的人
        </h3>
        {filterData.map((ele) => (
          <div
            key={ele.user_id}
            className={`store-target-item ${
              ele.user_id === activeStaff ? "store-target-active" : ""
            }`}
            onClick={() => {
              setTargetStaff(ele.user_id === targetStaff ? "" : ele.user_id);
              handleStaffClick(ele.user_id === activeStaff ? "" : ele.user_id);
            }}
          >
            <p className="target-name">{ele.user_name}</p>
            <p className="target-role">
              {ele.role_name === "admin" ? "管理員" : ele.role_name}
            </p>
          </div>
        ))}
      </div>
      <div
        className="target-user-roles"
        style={{
          display: activeStaff && targetStaff ? "block" : "none",
          marginLeft: "20vw",
        }}
      >
        <h3 style={{ textAlign: "center", paddingBottom: 20 }}>
          請選擇想變更權限
        </h3>
        {isLoad ? <Loading /> : ""}
        {activeStaff &&
          filterRole[targetStaff] &&
          filterRole[targetStaff][0].map((ele) => (
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
  );
}

export default StoreStaff;
