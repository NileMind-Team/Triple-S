import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaArrowLeft,
  FaCheck,
  FaClock,
  FaMotorcycle,
  FaHome,
  FaShoppingBag,
  FaMapMarkerAlt,
  FaPhone,
  FaUser,
  FaCreditCard,
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function OrderTracking() {
  const navigate = useNavigate();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("preparing");
  const [timeRemaining, setTimeRemaining] = useState(25);
  const [loading, setLoading] = useState(true);

  const orderStatuses = [
    {
      status: "preparing",
      title: "Preparing Your Order",
      description: "Our kitchen is preparing your delicious meal",
      icon: FaShoppingBag,
      color: "text-[#E41E26]",
      bgColor: "bg-[#E41E26]",
    },
    {
      status: "on_the_way",
      title: "On The Way",
      description: "Your order is out for delivery",
      icon: FaMotorcycle,
      color: "text-[#FDB913]",
      bgColor: "bg-[#FDB913]",
    },
    {
      status: "delivered",
      title: "Delivered",
      description: "Your order has been delivered",
      icon: FaHome,
      color: "text-green-500",
      bgColor: "bg-green-500",
    },
  ];

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        setLoading(true);

        // Get order data from localStorage or location state
        const savedOrder = localStorage.getItem("currentOrder");

        if (savedOrder) {
          const orderData = JSON.parse(savedOrder);

          // Validate order data structure
          if (orderData && orderData.orderNumber && orderData.items) {
            setOrder(orderData);
            setCurrentStatus(orderData.status || "preparing");
          } else {
            throw new Error("Invalid order data structure");
          }
        } else if (location.state?.orderNumber) {
          // If coming from checkout with order number but no saved data
          // Create a demo order with proper structure
          const demoOrder = {
            orderNumber: location.state.orderNumber,
            items: [
              {
                id: 1,
                name: "Classic Fried Chicken",
                price: 45.99,
                quantity: 2,
                image:
                  "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
              },
              {
                id: 2,
                name: "Spicy Chicken Wings",
                price: 35.99,
                quantity: 1,
                image:
                  "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop",
              },
            ],
            subtotal: 127.97,
            discount: 10,
            discountAmount: 12.8,
            deliveryFee: 15,
            total: 130.17,
            status: "preparing",
            estimatedDelivery: "25-35 minutes",
            customerInfo: {
              name: "Mohamed Ahmed",
              phone: "+20 123 456 7890",
              address: "123 Main Street, Cairo, Egypt",
            },
            paymentMethod: "Cash on Delivery",
            createdAt: new Date().toISOString(),
          };
          setOrder(demoOrder);
          localStorage.setItem("currentOrder", JSON.stringify(demoOrder));
        } else {
          // No order data found
          Swal.fire({
            title: "Order Not Found",
            text: "Unable to load order details. Please try again.",
            icon: "error",
            confirmButtonColor: "#E41E26",
          }).then(() => {
            navigate("/my-orders");
          });
        }
      } catch (error) {
        console.error("Error loading order:", error);
        Swal.fire({
          title: "Error",
          text: "Failed to load order details. Please try again.",
          icon: "error",
          confirmButtonColor: "#E41E26",
        }).then(() => {
          navigate("/my-orders");
        });
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();

    // Simulate order progress
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [location.state, navigate]);

  const getStatusIndex = (status) => {
    return orderStatuses.findIndex((s) => s.status === status);
  };

  const handleCancelOrder = () => {
    Swal.fire({
      title: "Cancel Order?",
      html: `
        <div class="text-center">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </div>
          <p class="text-gray-600 mb-2">Are you sure you want to cancel this order?</p>
          <p class="text-sm text-gray-500">You can only cancel orders that haven't started preparation.</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Cancel Order",
      cancelButtonText: "Keep Order",
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      reverseButtons: true,
      customClass: {
        popup: "rounded-3xl shadow-2xl",
        confirmButton: "px-6 py-3 rounded-xl font-bold",
        cancelButton: "px-6 py-3 rounded-xl font-bold border-2",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // Update order status to cancelled
        const updatedOrder = { ...order, status: "cancelled" };
        setOrder(updatedOrder);
        localStorage.setItem("currentOrder", JSON.stringify(updatedOrder));

        Swal.fire({
          title: "Order Cancelled",
          text: "Your order has been successfully cancelled.",
          icon: "success",
          confirmButtonColor: "#E41E26",
          confirmButtonText: "Back to Home",
          customClass: {
            popup: "rounded-3xl shadow-2xl",
          },
        }).then(() => {
          navigate("/");
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#E41E26] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaShoppingBag className="text-red-500 text-xl sm:text-3xl" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
            Order Not Found
          </h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base px-4">
            Unable to load order details.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/my-orders")}
            className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
          >
            Back to My Orders
          </motion.button>
        </div>
      </div>
    );
  }

  const currentStatusIndex = getStatusIndex(currentStatus);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/my-orders")}
            className="bg-white/80 backdrop-blur-md rounded-full p-2 sm:p-3 text-[#E41E26] hover:bg-[#E41E26] hover:text-white transition-all duration-300 shadow-lg flex-shrink-0"
          >
            <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </motion.button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">
              Order Tracking
            </h1>
            <p className="text-gray-600 text-sm sm:text-base truncate">
              Track your order in real-time
            </p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Order Progress */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Order Status Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6"
            >
              <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-4 sm:mb-6">
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800 truncate">
                    Order #{order.orderNumber}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Placed on {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div
                    className={`text-sm font-semibold px-3 py-1 rounded-full whitespace-nowrap ${
                      currentStatus === "preparing"
                        ? "bg-orange-100 text-orange-800"
                        : currentStatus === "on_the_way"
                        ? "bg-blue-100 text-blue-800"
                        : currentStatus === "delivered"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {currentStatus === "preparing" && "Preparing"}
                    {currentStatus === "on_the_way" && "On The Way"}
                    {currentStatus === "delivered" && "Delivered"}
                    {currentStatus === "cancelled" && "Cancelled"}
                  </div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="space-y-4 sm:space-y-6">
                {orderStatuses.map((status, index) => {
                  const StatusIcon = status.icon;
                  const isCompleted = index < currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;

                  return (
                    <div
                      key={status.status}
                      className="flex items-start gap-3 sm:gap-4 relative"
                    >
                      {/* Icon */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                          isCompleted
                            ? status.bgColor
                            : isCurrent
                            ? status.bgColor
                            : "bg-gray-200"
                        }`}
                      >
                        {isCompleted ? (
                          <FaCheck className="text-white text-xs sm:text-sm" />
                        ) : (
                          <StatusIcon
                            className={`text-xs sm:text-sm ${
                              isCurrent ? "text-white" : "text-gray-400"
                            }`}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`font-semibold text-sm sm:text-base ${
                            isCompleted || isCurrent
                              ? "text-gray-800"
                              : "text-gray-400"
                          }`}
                        >
                          {status.title}
                        </h3>
                        <p
                          className={`text-xs sm:text-sm ${
                            isCompleted || isCurrent
                              ? "text-gray-600"
                              : "text-gray-400"
                          }`}
                        >
                          {status.description}
                        </p>
                      </div>

                      {/* Connector Line */}
                      {index < orderStatuses.length - 1 && (
                        <div
                          className={`absolute left-4 sm:left-5 top-8 sm:top-10 w-0.5 h-6 sm:h-12 ${
                            isCompleted ? status.bgColor : "bg-gray-200"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Time Estimate */}
              {currentStatus === "preparing" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] rounded-xl border border-[#FDB913]/30"
                >
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FaClock className="text-[#E41E26] w-3 h-3 sm:w-4 sm:h-4" />
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm sm:text-base">
                        Estimated Delivery
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">
                        {timeRemaining > 0
                          ? `Approximately ${timeRemaining} minutes remaining`
                          : "Your order should arrive soon!"}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Cancel Button */}
              {currentStatus === "preparing" && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCancelOrder}
                  className="w-full mt-4 border-2 border-red-500 text-red-500 py-2 sm:py-3 rounded-xl font-semibold hover:bg-red-500 hover:text-white transition-all duration-300 text-sm sm:text-base"
                >
                  Cancel Order
                </motion.button>
              )}
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                Order Items
              </h3>
              <div className="space-y-2 sm:space-y-3">
                {order.items &&
                  order.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 sm:p-3 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] rounded-xl border border-[#FDB913]/30"
                    >
                      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-gray-800 text-xs sm:text-sm truncate">
                            {item.name}
                          </h4>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity} × EGP {item.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-[#E41E26] text-sm sm:text-base whitespace-nowrap ml-2">
                        EGP {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 lg:sticky lg:top-4"
            >
              <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
                Order Summary
              </h3>

              {/* Customer Info */}
              <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] rounded-xl border border-[#FDB913]/30">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#E41E26] rounded-full flex items-center justify-center flex-shrink-0">
                    <FaUser className="text-white text-xs sm:text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Customer</p>
                    <p className="font-semibold text-xs sm:text-sm truncate">
                      {order.customerInfo?.name || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] rounded-xl border border-[#FDB913]/30">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#E41E26] rounded-full flex items-center justify-center flex-shrink-0">
                    <FaPhone className="text-white text-xs sm:text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Phone</p>
                    <p className="font-semibold text-xs sm:text-sm truncate">
                      {order.customerInfo?.phone || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] rounded-xl border border-[#FDB913]/30">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-[#E41E26] rounded-full flex items-center justify-center flex-shrink-0">
                    <FaMapMarkerAlt className="text-white text-xs sm:text-sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-600">Address</p>
                    <p className="font-semibold text-xs sm:text-sm truncate">
                      {order.customerInfo?.address || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 border-t pt-3 sm:pt-4">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">
                    EGP {order.subtotal?.toFixed(2) || "0.00"}
                  </span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-green-600">
                      Discount ({order.discount}%)
                    </span>
                    <span className="font-semibold text-green-600">
                      -EGP {order.discountAmount?.toFixed(2) || "0.00"}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold">
                    EGP {order.deliveryFee?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-sm sm:text-base font-bold border-t pt-2 mt-2">
                  <span className="text-gray-800">Total</span>
                  <span className="text-[#E41E26]">
                    EGP {order.total?.toFixed(2) || "0.00"}
                  </span>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] rounded-xl border border-[#FDB913]/30">
                <div className="flex items-center gap-2 mb-1 sm:mb-2">
                  <FaClock className="text-[#E41E26] text-xs sm:text-sm" />
                  <span className="font-semibold text-xs sm:text-sm">
                    Delivery Time
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  {order.estimatedDelivery || "N/A"}
                </p>
              </div>

              {/* Payment Method */}
              <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] rounded-xl border border-[#FDB913]/30">
                <div className="flex items-center gap-2">
                  <FaCreditCard className="text-[#E41E26] text-xs sm:text-sm" />
                  <span className="font-semibold text-xs sm:text-sm truncate">
                    {order.paymentMethod || "N/A"}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
