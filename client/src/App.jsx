import { Route, Routes, BrowserRouter } from "react-router-dom";
import Main from "./pages/Main";
import Home from "./pages/Home";
import SnapUpProduct from "./pages/SnapUpProduct";
import Cart from "./pages/Cart";
import Order from "./pages/Order";
import Login from "./pages/Login";
import Stores from "./pages/Stores";
import Store from "./pages/Store";
import Profile from "./pages/Profile";
import Product from "./pages/Product";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Main />}>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<Product />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/snapup" element={<SnapUpProduct />} />
          <Route path="/order" element={<Order />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/stores" element={<Stores />} />
          <Route path="/store/:id" element={<Store />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
