import { useState, useLayoutEffect } from "react";
import api from "../../utils/api";
import toastMessage from "../../utils/toast";
import Loading from "../Loading";

function DeleteStaff({
  data,
  storeId,
  activeStaff,
  setActiveStaff,
  targetStaff,
  setTargetStaff,
}) {
  const [isLoad, setIsLoad] = useState(false);
  const [check, setCheck] = useState(false);
  const [checkMessage, setCheckMessage] = useState("");
  const [filterData, setFilterData] = useState(data);
  useLayoutEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const userId = user.id;
    const filterOwnId = data.filter(
      (ele) => userId != ele.user_id && ele.role_name != "admin"
    );
    setFilterData(filterOwnId);
  }, [data]);
  const handleStaffClick = (id) => {
    setActiveStaff(id);
  };
  const changeRoleClick = async () => {
    setIsLoad(true);
    setCheckMessage("");
    if (checkMessage !== "刪除") {
      setIsLoad(false);
      toastMessage.error("請輸入正確格式");
      return;
    }
    const token = localStorage.getItem("jwtToken");
    try {
      const result = await api.DeleteStaff(storeId, targetStaff, token);
      if (result.errors) throw new Error(result.errors);
      toastMessage.success("更改成功!");
    } catch (err) {
      console.log(err);
      toastMessage.error("請確認您的權限!");
    } finally {
      setIsLoad(false);
      setCheck(false);
    }
  };
  return (
    <>
      <div className="controll-permission">
        <div className="store-staff">
          <h3 style={{ textAlign: "center", paddingBottom: 20 }}>
            請選擇開除的人
          </h3>
          <div className="store-staff-list">
            {filterData.map((ele) => (
              <div
                key={ele.user_id}
                className={`store-target-item ${
                  ele.user_id === activeStaff ? "store-target-active" : ""
                }`}
                onClick={() => {
                  setTargetStaff(
                    ele.user_id === targetStaff ? "" : ele.user_id
                  );
                  handleStaffClick(
                    ele.user_id === activeStaff ? "" : ele.user_id
                  );
                }}
              >
                <p className="target-name">{ele.user_name}</p>
                <p className="target-role">
                  {ele.role_name === "admin" ? "管理員" : ele.role_name}
                </p>
              </div>
            ))}
          </div>
        </div>
        {check && (
          <div
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              zIndex: 2,
              top: 0,
              left: 0,
              backgroundColor: "rgba(255, 255, 255, 0.5)",
            }}
          >
            <div
              className="overlay"
              style={{
                padding: "4vh 6vw",
                position: "absolute",
                width: "34vw",
                height: "30vh",
                zIndex: 2,
                margin: "35vh 33vw",
                backgroundColor: "#FFF",
                borderRadius: 5,
                border: "1px solid rgba(0, 0, 0, 0.3)",
              }}
            >
              <div style={{ marginBottom: "3vh" }}>
                確認要開除該員工，請在下方輸入刪除
              </div>
              <input
                type="text"
                style={{ margin: "auto", borderRadius: 3 }}
                placeholder="刪除"
                value={checkMessage}
                onChange={(e) => setCheckMessage(e.target.value)}
              />
              <div
                style={{
                  display: "flex",
                  marginTop: "5vh",
                  marginLeft: "12vw",
                }}
              >
                <div
                  style={{
                    padding: "1vh 1vw",
                    border: "1px solid rgba(0, 0, 0, 0.3)",
                    cursor: "pointer",
                  }}
                  onClick={() => setCheck(!check)}
                >
                  取消
                </div>
                {isLoad ? (
                  <Loading
                    style={{ marginLeft: "2vw", marginTop: "0.5vh" }}
                    imgStyle={{ width: "1.5vw", height: "1.5vw" }}
                  />
                ) : (
                  <div
                    style={{
                      backgroundColor: "rgba(145, 151, 174, 1)",
                      padding: "1vh 1vw",
                      border: "1px solid rgba(0, 0, 0, 0.09)",
                      color: "white",
                      marginLeft: "1vw",
                      cursor: "pointer",
                    }}
                    onClick={changeRoleClick}
                  >
                    確認
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {targetStaff && (
          <button
            className="store-change-role"
            onClick={() => setCheck(!check)}
            style={{ marginLeft: "30rem" }}
          >
            確認
          </button>
        )}
      </div>
    </>
  );
}

export default DeleteStaff;
