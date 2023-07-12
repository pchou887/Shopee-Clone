import { Link } from "react-router-dom";

function CustomerService({ storeId, staffId }) {
  return (
    <>
      <div className="store-cs-btn">
        <Link to={`/store/${storeId}/staff/${staffId}/chat`} target="_blank">
          客服頁面
        </Link>
      </div>
    </>
  );
}

export default CustomerService;
