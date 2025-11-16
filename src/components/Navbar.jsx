import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome,
  FaChevronDown,
  FaUser,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaTrash,
  FaStar,
  FaShoppingCart,
  FaClipboardList,
} from "react-icons/fa";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUser] = useState({});
  const dropdownRef = useRef(null);

  const isLoggedIn = !!localStorage.getItem("token");
  const links = [
    { path: "/", label: "Home", icon: <FaHome /> },
    { path: "/cart", label: "Cart", icon: <FaShoppingCart /> },
  ];

  const authLinks = [
    { path: "/login", label: "Sign In" },
    { path: "/register", label: "Create Account" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
    window.location.reload();
  };

  const handleDeleteAccount = async () => {
    setIsDropdownOpen(false);

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to delete your account? This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        await axiosInstance.delete("/api/Account/DeleteAccount");

        Swal.fire({
          title: "Deleted!",
          text: "Your account has been deleted successfully.",
          icon: "success",
          confirmButtonColor: "#E41E26",
        });

        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
        window.location.reload();
      } catch (error) {
        console.error("Failed to delete account", error);
        Swal.fire({
          title: "Error!",
          text: "Failed to delete account. Please try again.",
          icon: "error",
          confirmButtonColor: "#E41E26",
        });
      }
    }
  };

  const handleAuthClick = (path) => {
    setIsDropdownOpen(false);
    navigate(path);
  };

  const handleProfileClick = () => {
    setIsDropdownOpen(false);
    navigate("/profile");
  };

  const handleAddressesClick = () => {
    setIsDropdownOpen(false);
    navigate("/addresses");
  };

  const handleReviewsClick = () => {
    setIsDropdownOpen(false);
    navigate("/reviews");
  };

  const handleOrdersClick = () => {
    setIsDropdownOpen(false);
    navigate("/my-orders");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch user profile
  useEffect(() => {
    if (!isLoggedIn) return;
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get("/api/Account/Profile");
        if (res.status === 200) {
          const fixedImageUrl = res.data.imageUrl
            ? `https://nilefood.runasp.net/${res.data.imageUrl}`
            : null;
          setUser({ ...res.data, avatar: fixedImageUrl });
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
      }
    };
    fetchProfile();
  }, [isLoggedIn]);

  const getInitial = (name) => (!name ? "?" : name.charAt(0).toUpperCase());

  return (
    <nav className="bg-white/90 backdrop-blur-xl shadow-lg py-4 px-6 flex items-center justify-between sticky top-0 z-50 border-b border-[#E41E26]/20">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold">
          <Link
            to="/"
            className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent hover:scale-105 transition-transform duration-200"
          >
            Chicken One
          </Link>
        </h1>
      </motion.div>

      {/* Links */}
      <div className="flex items-center gap-8">
        <ul className="flex items-center gap-6">
          {links.map((link) => (
            <motion.li
              key={link.path}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to={link.path}
                className={`flex items-center gap-2 font-medium transition-all duration-200 
                hover:text-[#E41E26] ${
                  location.pathname === link.path
                    ? "text-[#E41E26]"
                    : "text-gray-700"
                }`}
              >
                {link.icon}
                {link.label}
              </Link>
            </motion.li>
          ))}

          {/* My Orders Link - Only show when logged in */}
          {isLoggedIn && (
            <motion.li whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/my-orders"
                className={`flex items-center gap-2 font-medium transition-all duration-200 
                hover:text-[#E41E26] ${
                  location.pathname === "/my-orders"
                    ? "text-[#E41E26]"
                    : "text-gray-700"
                }`}
              >
                <FaClipboardList />
                My Orders
              </Link>
            </motion.li>
          )}
        </ul>

        {/* Auth Section */}
        <div className="relative" ref={dropdownRef}>
          {isLoggedIn ? (
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] px-4 py-2 rounded-xl border border-[#FDB913]/30">
                {userData.avatar ? (
                  <img
                    src={userData.avatar}
                    alt="User avatar"
                    className="w-8 h-8 rounded-full object-cover border border-[#FDB913]/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#E41E26] text-white flex items-center justify-center font-semibold border border-[#FDB913]/50">
                    {getInitial(userData.firstName)}
                  </div>
                )}
                <span className="text-gray-700 font-medium">
                  {userData.firstName || "User"}
                </span>
                <motion.div
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown className="text-[#E41E26] text-sm" />
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="flex items-center gap-3 cursor-pointer"
              whileHover={{ scale: 1.05 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] px-6 py-2.5 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl hover:shadow-[#E41E26]/25 transition-all duration-300">
                <span>Get Started</span>
                <motion.div
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FaChevronDown className="text-white text-sm" />
                </motion.div>
              </div>
            </motion.div>
          )}

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full right-0 mt-2 w-72 bg-white/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-[#E41E26]/20 overflow-hidden z-50"
              >
                {isLoggedIn ? (
                  <div className="p-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-600">Welcome back!</p>
                      <p className="font-semibold text-gray-800">
                        {userData.firstName} {userData.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {userData.email}
                      </p>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={handleProfileClick}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] transition-all duration-200 font-medium rounded-lg"
                      >
                        <FaUser className="text-[#E41E26]" />
                        <span>My Profile</span>
                      </button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={handleOrdersClick}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] transition-all duration-200 font-medium rounded-lg"
                      >
                        <FaClipboardList className="text-[#E41E26]" />
                        <span>My Orders</span>
                      </button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={handleAddressesClick}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] transition-all duration-200 font-medium rounded-lg"
                      >
                        <FaMapMarkerAlt className="text-[#E41E26]" />
                        <span>My Addresses</span>
                      </button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={handleReviewsClick}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] transition-all duration-200 font-medium rounded-lg"
                      >
                        <FaStar className="text-[#E41E26]" />
                        <span>My Reviews</span>
                      </button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={handleDeleteAccount}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200 font-medium rounded-lg"
                      >
                        <FaTrash className="text-red-500" />
                        <span>Delete Account</span>
                      </button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-[#E41E26] transition-all duration-200 font-medium rounded-lg"
                      >
                        <FaSignOutAlt className="text-[#E41E26]" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  </div>
                ) : (
                  <div className="p-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm text-gray-600">Join Chicken One</p>
                      <p className="font-semibold text-gray-800">
                        Start your journey
                      </p>
                    </div>

                    {authLinks.map((link) => (
                      <motion.div
                        key={link.path}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <button
                          onClick={() => handleAuthClick(link.path)}
                          className={`w-full text-left flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] transition-all duration-200 font-medium rounded-lg ${
                            location.pathname === link.path
                              ? "bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] text-[#E41E26]"
                              : ""
                          }`}
                        >
                          <span>{link.label}</span>
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
