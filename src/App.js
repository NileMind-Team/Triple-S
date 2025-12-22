import { Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ConfirmEmail from "./pages/ConfirmEmail";
import ResetPassword from "./pages/ResetPassword";
import AuthPage from "./pages/AuthPage";
import Profile from "./pages/Profile";
import Addresses from "./pages/Addresses";
import Reviews from "./pages/Reviews";
import Cart from "./pages/Cart";
import OrderTracking from "./pages/OrderTracking";
import MyOrders from "./pages/MyOrders";
import ProductForm from "./pages/ProductForm";
import Footer from "./components/Footer";
import AdminUsers from "./pages/AdminUsers";
import AdminBranches from "./pages/AdminBranches";
import DeliveryCostManagement from "./pages/DeliveryCostManagement";
import CitiesManagement from "./pages/CitiesManagement";
import ProductDetails from "./pages/ProductDetails";
import Cashier from "./pages/Cashier";
import Favorites from "./pages/Favorites";
import Branches from "./pages/Branches";
import ItemOffersManagement from "./pages/ItemOffersManagement";
import SalesReports from "./pages/SalesReports";

function App() {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  const hideNavbarFooterPaths = [
    "/login",
    "/register",
    "/auth/verify-email-address",
    "/reset-password",
    "/profile",
    "/addresses",
    "/reviews",
    "/admin/users",
    "/admin/branches",
    "/auth",
  ];

  const shouldShowNavbarFooter = !hideNavbarFooterPaths.includes(
    location.pathname
  );

  useEffect(() => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.add("dark");
      html.style.colorScheme = "dark";
    } else {
      html.classList.remove("dark");
      html.style.colorScheme = "light";
    }
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? "dark" : ""}`}>
      {/* Navbar */}
      {shouldShowNavbarFooter && (
        <Navbar darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
      )}

      {/* Main content */}
      <main className="flex-grow w-full bg-white dark:bg-gray-900 transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="/register" element={<AuthPage />} />
          <Route path="/auth/verify-email-address" element={<ConfirmEmail />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/addresses" element={<Addresses />} />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/products/new" element={<ProductForm />} />
          <Route path="/products/edit" element={<ProductForm />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/branches" element={<AdminBranches />} />
          <Route
            path="/admin/delivery-cost"
            element={<DeliveryCostManagement />}
          />
          {/* <Route path="/admin/coupons" element={<CouponsManagement />} /> */}
          <Route path="/admin/cities" element={<CitiesManagement />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cashier" element={<Cashier />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/branches" element={<Branches />} />
          <Route path="/admin/item-offers" element={<ItemOffersManagement />} />
          <Route path="/admin/reports" element={<SalesReports />} />
          <Route path="/auth" element={<AuthPage />} />
        </Routes>
      </main>

      {/* Footer */}
      {shouldShowNavbarFooter && <Footer />}
    </div>
  );
}

export default App;
