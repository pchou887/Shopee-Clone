import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
function Profile() {
  const [userProfile, setUserProfile] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    async function getUserProfile() {
      try {
        const result = await api.GetUser(token);

        setUserProfile(result.data);
      } catch (err) {
        if (err.message.includes("jwt")) {
          localStorage.removeItem("user");
          localStorage.removeItem("jwtToken");
          return navigate("/login");
        }
      }
    }
    getUserProfile();
  }, []);
  console.log(userProfile);
  return (
    <div className="content">
      {userProfile && (
        <div
          className="profile-content"
          style={{ width: 300, height: 500, margin: "auto", paddingTop: 50 }}
        >
          <img
            src={userProfile.picture}
            alt=""
            style={{ width: 200, height: 200 }}
          />
          <div
            className="profile-content-detail"
            style={{ fontSize: 18, paddingTop: 20 }}
          >
            <div className="profile-content-email">
              信箱：{userProfile.email}
            </div>
            <div className="profile-content-name">名稱：{userProfile.name}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
