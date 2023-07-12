import { Route, Routes, BrowserRouter } from "react-router-dom";
import Main from "./pages/Main";
import Home from "./pages/Home";
import SnapUpProduct from "./pages/SnapUpProduct";
import Cart from "./pages/Cart";
import SnapOrder from "./pages/SnapUpOrder";
import Login from "./pages/Login";
import Stores from "./pages/Stores";
import Store from "./pages/Store";
import Profile from "./pages/Profile";
import Product from "./pages/Product";
import Order from "./pages/Order";
import StoreProducts from "./pages/StoreProduct";
import CustomerService from "./pages/CustomerService";
import CreateStore from "./pages/CreateStore";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/snapup" element={<SnapUpProduct />} />
          <Route path="/snapup/order" element={<SnapOrder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/order" element={<Order />} />
          <Route path="/store/create" element={<CreateStore />} />
          <Route path="/store/:id" element={<Store />} />
          <Route path="/store/:id/product" element={<StoreProducts />} />
          <Route
            path="/store/:id/staff/:staffId/chat"
            element={<CustomerService />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
