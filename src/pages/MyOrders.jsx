import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowLeft,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaShoppingBag,
  FaSearch,
  FaFilter,
  FaChevronDown,
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  // Sample orders data - UPDATED to match OrderTracking structure
  const sampleOrders = [
    {
      id: 1,
      orderNumber: "CHK001",
      status: "delivered",
      statusText: "Delivered",
      date: "2024-01-15",
      total: 130.17,
      subtotal: 127.97,
      discount: 10,
      discountAmount: 12.8,
      deliveryFee: 15,
      items: [
        {
          id: 1,
          name: "Classic Fried Chicken",
          quantity: 2,
          price: 45.99,
          image:
            "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
        },
        {
          id: 2,
          name: "Spicy Chicken Wings",
          quantity: 1,
          price: 35.99,
          image:
            "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop",
        },
      ],
      customerInfo: {
        name: "Mohamed Ahmed",
        phone: "+20 123 456 7890",
        address: "123 Main Street, Cairo, Egypt",
      },
      paymentMethod: "Cash on Delivery",
      estimatedDelivery: "25-35 minutes",
      createdAt: new Date("2024-01-15").toISOString(),
    },
    {
      id: 2,
      orderNumber: "CHK002",
      status: "preparing",
      statusText: "Preparing",
      date: "2024-01-16",
      total: 85.5,
      subtotal: 70.97,
      discount: 0,
      discountAmount: 0,
      deliveryFee: 15,
      items: [
        {
          id: 3,
          name: "Chicken Burger",
          quantity: 1,
          price: 32.99,
          image:
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
        },
        {
          id: 4,
          name: "Chocolate Milkshake",
          quantity: 2,
          price: 18.99,
          image:
            "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop",
        },
      ],
      customerInfo: {
        name: "Mohamed Ahmed",
        phone: "+20 123 456 7890",
        address: "456 Downtown, Cairo, Egypt",
      },
      paymentMethod: "Cash on Delivery",
      estimatedDelivery: "20-30 minutes",
      createdAt: new Date().toISOString(),
    },
    {
      id: 3,
      orderNumber: "CHK003",
      status: "on_the_way",
      statusText: "On The Way",
      date: "2024-01-16",
      total: 60.99,
      subtotal: 45.99,
      discount: 0,
      discountAmount: 0,
      deliveryFee: 15,
      items: [
        {
          id: 1,
          name: "Classic Fried Chicken",
          quantity: 1,
          price: 45.99,
          image:
            "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
        },
      ],
      customerInfo: {
        name: "Mohamed Ahmed",
        phone: "+20 123 456 7890",
        address: "789 Garden City, Cairo, Egypt",
      },
      paymentMethod: "Cash on Delivery",
      estimatedDelivery: "15-25 minutes",
      createdAt: new Date().toISOString(),
    },
    {
      id: 4,
      orderNumber: "CHK004",
      status: "cancelled",
      statusText: "Cancelled",
      date: "2024-01-14",
      total: 67.98,
      subtotal: 71.98,
      discount: 0,
      discountAmount: 0,
      deliveryFee: 15,
      items: [
        {
          id: 2,
          name: "Spicy Chicken Wings",
          quantity: 2,
          price: 35.99,
          image:
            "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop",
        },
      ],
      customerInfo: {
        name: "Mohamed Ahmed",
        phone: "+20 123 456 7890",
        address: "321 Heliopolis, Cairo, Egypt",
      },
      paymentMethod: "Cash on Delivery",
      estimatedDelivery: "30-40 minutes",
      createdAt: new Date("2024-01-14").toISOString(),
    },
  ];

  useEffect(() => {
    setOrders(sampleOrders);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filter === "all" || order.status === filter;
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "preparing":
        return <FaClock className="text-orange-500" />;
      case "on_the_way":
        return <FaShoppingBag className="text-blue-500" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "on_the_way":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleOrderClick = (order) => {
    if (order.status === "preparing" || order.status === "on_the_way") {
      // Save the COMPLETE order data to localStorage for tracking page
      localStorage.setItem("currentOrder", JSON.stringify(order));
      navigate("/order-tracking", {
        state: { orderNumber: order.orderNumber },
      });
    } else {
      Swal.fire({
        title: "Order Details",
        html: `
          <div class="text-left">
            <div class="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] rounded-xl p-4 mb-4">
              <h3 class="font-bold text-gray-800 mb-2">Order #${
                order.orderNumber
              }</h3>
              <p class="text-sm text-gray-600">Status: <span class="font-semibold ${getStatusColor(
                order.status
              )} px-2 py-1 rounded-full text-xs">${order.statusText}</span></p>
              <p class="text-sm text-gray-600">Date: ${new Date(
                order.date
              ).toLocaleDateString()}</p>
            </div>
            <div class="space-y-2">
              ${order.items
                .map(
                  (item) => `
                <div class="flex justify-between text-sm">
                  <span>${item.name} × ${item.quantity}</span>
                  <span class="font-semibold">EGP ${(
                    item.price * item.quantity
                  ).toFixed(2)}</span>
                </div>
              `
                )
                .join("")}
            </div>
            <div class="border-t mt-3 pt-3">
              <div class="flex justify-between font-bold">
                <span>Total:</span>
                <span class="text-[#E41E26]">EGP ${order.total.toFixed(
                  2
                )}</span>
              </div>
            </div>
          </div>
        `,
        icon: "info",
        confirmButtonColor: "#E41E26",
        confirmButtonText: "OK",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="bg-white/80 backdrop-blur-md rounded-full p-2 sm:p-3 text-[#E41E26] hover:bg-[#E41E26] hover:text-white transition-all duration-300 shadow-lg"
            >
              <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                My Orders
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Track and manage your orders
              </p>
            </div>
          </div>
          <div className="text-right self-end sm:self-auto">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#E41E26]">
              {orders.length} Orders
            </div>
            <div className="text-gray-600 text-sm sm:text-base">in total</div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8 relative z-30"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders or items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
              />
            </div>

            {/* Filter */}
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-48">
                <button
                  type="button"
                  onClick={() =>
                    setOpenDropdown(openDropdown === "orders" ? null : "orders")
                  }
                  className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-[#E41E26] transition-all duration-200 text-sm sm:text-base"
                >
                  <span className="flex items-center gap-2">
                    <FaFilter className="text-[#E41E26]" />
                    {filter === "all"
                      ? "All Orders"
                      : filter === "preparing"
                      ? "Preparing"
                      : filter === "on_the_way"
                      ? "On The Way"
                      : filter === "delivered"
                      ? "Delivered"
                      : "Cancelled"}
                  </span>

                  <motion.div
                    animate={{ rotate: openDropdown === "orders" ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FaChevronDown className="text-[#E41E26]" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openDropdown === "orders" && (
                    <motion.ul
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-50 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                    >
                      {[
                        { value: "all", label: "All Orders" },
                        { value: "preparing", label: "Preparing" },
                        { value: "on_the_way", label: "On The Way" },
                        { value: "delivered", label: "Delivered" },
                        { value: "cancelled", label: "Cancelled" },
                      ].map((item) => (
                        <li
                          key={item.value}
                          onClick={() => {
                            setFilter(item.value);
                            setOpenDropdown(null);
                          }}
                          className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-sm sm:text-base border-b border-gray-100 last:border-b-0"
                        >
                          {item.label}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Orders List */}
        <div className="space-y-4 sm:space-y-6 relative z-20">
          <AnimatePresence>
            {filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 cursor-pointer hover:shadow-2xl transition-all duration-300"
                onClick={() => handleOrderClick(order)}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 sm:gap-6 mb-3">
                      <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                          Order #{order.orderNumber}
                        </h3>
                        <p className="text-gray-600 text-sm">
                          {new Date(order.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                            order.status
                          )} whitespace-nowrap`}
                        >
                          {order.statusText}
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-2 mb-3">
                      {order.items.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700 truncate pr-2">
                            {item.name} × {item.quantity}
                          </span>
                          <span className="font-semibold text-gray-800 whitespace-nowrap">
                            EGP {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-sm text-gray-500">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </div>

                    {/* Delivery Info */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaShoppingBag className="text-[#E41E26] flex-shrink-0 w-3 h-3" />
                      <span className="truncate">
                        {order.customerInfo.address}
                      </span>
                    </div>
                  </div>

                  {/* Total and Action */}
                  <div className="flex flex-row sm:flex-col items-center justify-between sm:items-end lg:items-start gap-3 sm:gap-2 lg:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                    <div className="text-left sm:text-right lg:text-left">
                      <div className="text-lg sm:text-xl font-bold text-[#E41E26]">
                        EGP {order.total.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-600 hidden sm:block">
                        Total Amount
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[#E41E26]">
                      {getStatusIcon(order.status)}
                      <span className="text-sm font-semibold whitespace-nowrap">
                        {order.status === "preparing" ||
                        order.status === "on_the_way"
                          ? "Track Order"
                          : "View Details"}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredOrders.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8 sm:py-12"
            >
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShoppingBag className="text-gray-400 text-xl sm:text-3xl" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                No orders found
              </h3>
              <p className="text-gray-600 mb-6 text-sm sm:text-base px-4">
                {searchTerm || filter !== "all"
                  ? "Try adjusting your search or filter criteria"
                  : "You haven't placed any orders yet"}
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/")}
                className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
              >
                Start Shopping
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
