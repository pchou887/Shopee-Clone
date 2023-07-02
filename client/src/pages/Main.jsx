import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";

function Main() {
  return (
    <>
      <ToastContainer
        position="top-center"
        autoClose={2000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
      />
      <Header />
      <Outlet />
    </>
  );
}
export default Main;
