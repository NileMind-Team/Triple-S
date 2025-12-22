import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  FaArrowLeft,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaShoppingBag,
  FaFilter,
  FaChevronDown,
  FaTrash,
  FaUser,
  FaMapMarkerAlt,
  FaPhone,
  FaTimes,
  FaReceipt,
  FaBox,
  FaTag,
  FaPlusCircle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const BASE_URL = "https://restaurant-template.runasp.net/";
  const refreshIntervalRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const addTwoHoursToDate = (dateString) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 2);
    return date;
  };

  const calculatePricesFromItems = (items) => {
    if (!items || items.length === 0) {
      return {
        subtotal: 0,
        totalAdditions: 0,
        totalDiscount: 0,
        deliveryFee: 0,
        totalWithFee: 0,
      };
    }

    let subtotal = 0;
    let totalAdditions = 0;
    let totalDiscount = 0;

    items.forEach((item) => {
      const basePrice =
        item.menuItemBasePriceSnapshotAtOrder > 0
          ? item.menuItemBasePriceSnapshotAtOrder
          : item.menuItem?.basePrice || 0;

      subtotal += basePrice * item.quantity;

      if (item.options && item.options.length > 0) {
        item.options.forEach((option) => {
          totalAdditions += option.optionPriceAtOrder || 0;
        });
      }

      if (item.totalDiscount && item.totalDiscount > 0) {
        totalDiscount += item.totalDiscount;
      }
    });

    return {
      subtotal,
      totalAdditions,
      totalDiscount,
      deliveryFee: 0,
      totalWithFee: 0,
    };
  };

  const getFinalTotal = (order) => {
    return order.totalWithFee || 0;
  };

  const buildFiltersArray = () => {
    const filtersArray = [];

    if (filter && filter !== "all") {
      filtersArray.push({
        propertyName: "status",
        propertyValue: filter,
        range: false,
      });
    }

    if (isAdminOrRestaurantOrBranch && selectedUserId) {
      filtersArray.push({
        propertyName: "userId",
        propertyValue: selectedUserId,
        range: false,
      });
    }

    if (dateRange.start && dateRange.end) {
      filtersArray.push({
        propertyName: "createdAt",
        propertyValue: dateRange.start,
        range: true,
      });
    }

    return filtersArray;
  };

  const fetchOrders = async () => {
    if (isInitialLoad) {
      return;
    }

    try {
      setFetchingOrders(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setOrders([]);
        setFetchingOrders(false);
        return;
      }

      const requestBody = {
        pageNumber: currentPage,
        pageSize: pageSize,
        filters: buildFiltersArray(),
      };

      console.log("Request Body:", JSON.stringify(requestBody, null, 2));

      let url = "/api/Orders/GetAllWithPagination";
      let params = {};

      if (dateRange.start) {
        params.startRange = dateRange.start;
      }
      if (dateRange.end) {
        params.endRange = dateRange.end;
      }

      if (!isAdminOrRestaurantOrBranch) {
        url = "/api/Orders/GetAllForUser";
        if (filter !== "all") {
          params.status = filter;
        }
      }

      let response;
      if (isAdminOrRestaurantOrBranch) {
        response = await axiosInstance.post(url, requestBody);
      } else {
        response = await axiosInstance.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: params,
        });
      }

      const responseData = response.data;

      if (isAdminOrRestaurantOrBranch) {
        const ordersData = responseData.data || [];
        setOrders(ordersData);
        setTotalPages(responseData.totalPages || 1);
        setTotalItems(responseData.totalItems || 0);
        setCurrentPage(responseData.pageNumber || 1);
        setPageSize(responseData.pageSize || 10);
      } else {
        setOrders(responseData || []);
        setTotalPages(1);
        setTotalItems(responseData?.length || 0);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (!selectedOrder) {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل تحميل الطلبات. يرجى المحاولة مرة أخرى.",
          confirmButtonColor: "#E41E26",
        });
      }
      setOrders([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setFetchingOrders(false);
    }
  };

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          setLoading(false);
          setIsInitialLoad(false);
          return;
        }

        const response = await axiosInstance.get("/api/Account/Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = response.data;
        const userRoles = userData.roles || [];

        const hasAdminOrRestaurantOrBranchRole =
          userRoles.includes("Admin") ||
          userRoles.includes("Restaurant") ||
          userRoles.includes("Branch");

        setIsAdminOrRestaurantOrBranch(hasAdminOrRestaurantOrBranchRole);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAdminOrRestaurantOrBranch(false);
      } finally {
        setLoading(false);
        setIsInitialLoad(false);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    if (isAdminOrRestaurantOrBranch) {
      const fetchUsers = async () => {
        try {
          setLoadingUsers(true);
          const token = localStorage.getItem("token");

          if (!token) {
            setUsers([]);
            return;
          }

          const response = await axiosInstance.get("/api/Users/GetAll", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          setUsers(response.data || []);
        } catch (error) {
          console.error("Error fetching users:", error);
          setUsers([]);
        } finally {
          setLoadingUsers(false);
        }
      };

      fetchUsers();
    }
  }, [isAdminOrRestaurantOrBranch]);

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filter,
    dateRange,
    selectedUserId,
    isAdminOrRestaurantOrBranch,
    isInitialLoad,
    currentPage,
    pageSize,
  ]);

  useEffect(() => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }

    refreshIntervalRef.current = setInterval(() => {
      if (!isInitialLoad && !selectedOrder) {
        fetchOrders();
      }
    }, 60000);

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitialLoad, selectedOrder]);

  useEffect(() => {
    if (selectedOrder) {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    } else if (!isInitialLoad) {
      if (!refreshIntervalRef.current) {
        refreshIntervalRef.current = setInterval(() => {
          fetchOrders();
        }, 60000);
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOrder, isInitialLoad]);

  const mapStatus = (apiStatus) => {
    const statusMap = {
      Pending: "pending",
      Confirmed: "confirmed",
      Preparing: "preparing",
      OutForDelivery: "out_for_delivery",
      Delivered: "delivered",
      Cancelled: "cancelled",
    };
    return statusMap[apiStatus] || "pending";
  };

  const getStatusText = (apiStatus) => {
    const textMap = {
      Pending: "قيد الانتظار",
      Confirmed: "تم التأكيد",
      Preparing: "قيد التحضير",
      OutForDelivery: "قيد التوصيل",
      Delivered: "تم التوصيل",
      Cancelled: "ملغي",
    };
    return textMap[apiStatus] || apiStatus;
  };

  const getStatusIcon = (status) => {
    const mappedStatus = mapStatus(status);
    switch (mappedStatus) {
      case "delivered":
        return <FaCheckCircle className="text-green-500" />;
      case "confirmed":
        return <FaCheckCircle className="text-blue-500" />;
      case "pending":
        return <FaClock className="text-yellow-500" />;
      case "preparing":
        return <FaClock className="text-orange-500" />;
      case "out_for_delivery":
        return <FaShoppingBag className="text-purple-500" />;
      case "cancelled":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    const mappedStatus = mapStatus(status);
    switch (mappedStatus) {
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "preparing":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "out_for_delivery":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const handleCancelOrder = async (orderId, e) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "هل أنت متأكد؟",
      text: "هل تريد إلغاء هذا الطلب؟",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، إلغِه!",
      cancelButtonText: "لا",
    });

    if (result.isConfirmed) {
      try {
        localStorage.getItem("token");

        setOrders(
          orders.map((order) =>
            order.id === orderId
              ? {
                  ...order,
                  status: "Cancelled",
                }
              : order
          )
        );

        if (selectedOrder?.id === orderId && orderDetails) {
          setOrderDetails((prev) => ({
            ...prev,
            status: "Cancelled",
          }));
        }

        Swal.fire({
          title: "تم الإلغاء!",
          text: "تم إلغاء الطلب.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });

        setTimeout(() => {
          fetchOrders();
        }, 500);
      } catch (error) {
        console.error("Error cancelling order:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل إلغاء الطلب.",
          confirmButtonColor: "#E41E26",
        });
      }
    }
  };

  const handleOrderClick = async (order) => {
    setSelectedOrder(order);
    setLoadingOrderDetails(true);

    try {
      const token = localStorage.getItem("token");
      let details;

      if (isAdminOrRestaurantOrBranch) {
        const response = await axiosInstance.get(
          `/api/Orders/GetById/${order.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        details = response.data;
      } else {
        const response = await axiosInstance.get(
          `/api/Orders/GetByForUserId/${order.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        details = response.data;
      }

      if (details && details.items) {
        details.items = details.items.map((item) => ({
          ...item,
          menuItemImageUrlSnapshotAtOrder:
            item.menuItemImageUrlSnapshotAtOrder ||
            (item.menuItem ? item.menuItem.imageUrl : null),
          menuItemNameSnapshotAtOrder:
            item.menuItemNameSnapshotAtOrder ||
            (item.menuItem ? item.menuItem.name : "عنصر غير معروف"),
          menuItemDescriptionAtOrder:
            item.menuItemDescriptionAtOrder ||
            (item.menuItem ? item.menuItem.description : ""),
          menuItemBasePriceSnapshotAtOrder:
            item.menuItemBasePriceSnapshotAtOrder > 0
              ? item.menuItemBasePriceSnapshotAtOrder
              : item.menuItem
              ? item.menuItem.basePrice
              : 0,
          totalPrice:
            item.totalPrice < 0 ? Math.abs(item.totalPrice) : item.totalPrice,
        }));
      }

      if (details && details.items && details.items.length > 0) {
        const calculatedPrices = calculatePricesFromItems(details.items);
        details.calculatedSubtotal = calculatedPrices.subtotal;
        details.calculatedTotalAdditions = calculatedPrices.totalAdditions;
        details.calculatedTotalDiscount = calculatedPrices.totalDiscount;
        details.calculatedDeliveryFee = details.deliveryCost || 0;
        details.calculatedTotalWithFee =
          calculatedPrices.subtotal +
          calculatedPrices.totalAdditions +
          details.calculatedDeliveryFee -
          calculatedPrices.totalDiscount;
      }

      setOrderDetails(details);
    } catch (error) {
      console.error("Error fetching order details:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل تحميل تفاصيل الطلب.",
        confirmButtonColor: "#E41E26",
      });
    } finally {
      setLoadingOrderDetails(false);
    }
  };

  const closeOrderDetails = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const handleDateRangeChange = (type, value) => {
    setDateRange((prev) => ({
      ...prev,
      [type]: value,
    }));
  };

  const clearDateRange = () => {
    setDateRange({ start: "", end: "" });
  };

  const clearUserFilter = () => {
    setSelectedUserId("");
  };

  const clearAllFilters = () => {
    setFilter("all");
    setDateRange({ start: "", end: "" });
    setSelectedUserId("");
    setCurrentPage(1);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    scrollToTop();
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      scrollToTop();
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      scrollToTop();
    }
  };

  const getPaginationNumbers = () => {
    if (totalPages <= 1) return [1];

    const delta = 2;
    const range = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      range.unshift("...");
    }
    if (currentPage + delta < totalPages - 1) {
      range.push("...");
    }

    range.unshift(1);
    if (totalPages > 1) {
      range.push(totalPages);
    }

    return range;
  };

  if (loading && isInitialLoad) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <>
      <div
        className={`min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 py-4 sm:py-8 transition-colors duration-300`}
      >
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
                className="bg-white/80 backdrop-blur-md rounded-full p-2 sm:p-3 text-[#E41E26] hover:bg-[#E41E26] hover:text-white transition-all duration-300 shadow-lg dark:bg-gray-800/80 dark:text-gray-200 dark:hover:bg-[#E41E26]"
              >
                <FaArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200">
                  {isAdminOrRestaurantOrBranch ? "جميع الطلبات" : "طلباتي"}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  {isAdminOrRestaurantOrBranch
                    ? "إدارة جميع الطلبات"
                    : "تتبع وإدارة طلباتك"}
                </p>
              </div>
            </div>
            <div className="text-right self-end sm:self-auto">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#E41E26]">
                {totalItems} طلب
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                إجمالي
              </div>
            </div>
          </motion.div>

          {/* Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 mb-6 sm:mb-8 relative z-30 dark:bg-gray-800/90"
          >
            <div className="flex flex-col gap-4">
              {/* Status and User Filters in Same Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Status Filter - Always shown */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    الحالة
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "status" ? null : "status"
                        )
                      }
                      className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <span className="flex items-center gap-2">
                        <FaFilter className="text-[#E41E26]" />
                        {filter === "all"
                          ? "جميع الحالات"
                          : getStatusText(filter)}
                      </span>
                      <motion.div
                        animate={{
                          rotate: openDropdown === "status" ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaChevronDown className="text-[#E41E26]" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {openDropdown === "status" && (
                        <motion.ul
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto dark:bg-gray-700 dark:border-gray-600"
                        >
                          {[
                            { value: "all", label: "جميع الحالات" },
                            { value: "Pending", label: "قيد الانتظار" },
                            { value: "Confirmed", label: "تم التأكيد" },
                            { value: "Preparing", label: "قيد التحضير" },
                            {
                              value: "OutForDelivery",
                              label: "قيد التوصيل",
                            },
                            { value: "Delivered", label: "تم التوصيل" },
                            { value: "Cancelled", label: "ملغي" },
                          ].map((item) => (
                            <li
                              key={item.value}
                              onClick={() => {
                                setFilter(item.value);
                                setCurrentPage(1);
                                setOpenDropdown(null);
                              }}
                              className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-sm sm:text-base border-b border-gray-100 last:border-b-0 dark:hover:from-gray-600 dark:hover:to-gray-500 dark:text-gray-300 dark:border-gray-600"
                            >
                              {item.label}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* User Filter - Only for admin users */}
                {isAdminOrRestaurantOrBranch && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      المستخدم
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === "user" ? null : "user"
                          )
                        }
                        className="w-full flex items-center justify-between border border-gray-200 bg-white rounded-xl px-4 py-3 text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      >
                        <span className="flex items-center gap-2">
                          <FaUser className="text-[#E41E26]" />
                          {selectedUserId
                            ? users.find((u) => u.id === selectedUserId)
                                ?.firstName +
                              " " +
                              users.find((u) => u.id === selectedUserId)
                                ?.lastName
                            : "جميع المستخدمين"}
                        </span>
                        <motion.div
                          animate={{
                            rotate: openDropdown === "user" ? 180 : 0,
                          }}
                          transition={{ duration: 0.3 }}
                        >
                          <FaChevronDown className="text-[#E41E26]" />
                        </motion.div>
                      </button>

                      <AnimatePresence>
                        {openDropdown === "user" && (
                          <motion.ul
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                            className="absolute z-50 mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-h-64 overflow-y-auto dark:bg-gray-700 dark:border-gray-600"
                          >
                            <li
                              onClick={() => {
                                setSelectedUserId("");
                                setCurrentPage(1);
                                setOpenDropdown(null);
                              }}
                              className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-sm sm:text-base border-b border-gray-100 dark:hover:from-gray-600 dark:hover:to-gray-500 dark:text-gray-300 dark:border-gray-600"
                            >
                              جميع المستخدمين
                            </li>
                            {loadingUsers ? (
                              <li className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                                جاري تحميل المستخدمين...
                              </li>
                            ) : (
                              users.map((user) => (
                                <li
                                  key={user.id}
                                  onClick={() => {
                                    setSelectedUserId(user.id);
                                    setCurrentPage(1);
                                    setOpenDropdown(null);
                                  }}
                                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] cursor-pointer text-gray-700 transition-all text-sm sm:text-base border-b border-gray-100 last:border-b-0 dark:hover:from-gray-600 dark:hover:to-gray-500 dark:text-gray-300 dark:border-gray-600"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex-shrink-0">
                                      {user.imageUrl &&
                                      user.imageUrl !==
                                        "Profiles/Default-Image.jpg" ? (
                                        <img
                                          src={`${BASE_URL}${user.imageUrl}`}
                                          alt={user.firstName}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E41E26] to-[#FDB913] text-white text-xs">
                                          {user.firstName?.charAt(0)}
                                          {user.lastName?.charAt(0)}
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <div className="font-medium">
                                        {user.firstName} {user.lastName}
                                      </div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {user.email}
                                      </div>
                                    </div>
                                  </div>
                                </li>
                              ))
                            )}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Range Filter - Modified for mobile */}
              <div className="space-y-4">
                <div className="space-y-4 sm:space-y-0 sm:flex sm:gap-4 sm:items-end">
                  {/* على الشاشات الصغيرة: تاريخ البداية يأخذ العرض كامل */}
                  <div className="block sm:hidden space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        تاريخ البداية
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => {
                          handleDateRangeChange("start", e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        تاريخ النهاية
                      </label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => {
                          handleDateRangeChange("end", e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="hidden sm:flex-1 sm:grid sm:grid-cols-2 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        تاريخ البداية
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => {
                          handleDateRangeChange("start", e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        تاريخ النهاية
                      </label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => {
                          handleDateRangeChange("end", e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-black focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Clear Buttons */}
                  <div className="flex gap-2 pt-2 sm:pt-0">
                    {(dateRange.start ||
                      dateRange.end ||
                      (isAdminOrRestaurantOrBranch && selectedUserId) ||
                      filter !== "all") && (
                      <>
                        {(dateRange.start || dateRange.end) && (
                          <button
                            onClick={() => {
                              clearDateRange();
                              setCurrentPage(1);
                            }}
                            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
                          >
                            مسح التواريخ
                          </button>
                        )}
                        {isAdminOrRestaurantOrBranch && selectedUserId && (
                          <button
                            onClick={() => {
                              clearUserFilter();
                              setCurrentPage(1);
                            }}
                            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
                          >
                            مسح المستخدم
                          </button>
                        )}
                        <button
                          onClick={clearAllFilters}
                          className="px-4 py-3 bg-[#E41E26] text-white rounded-xl hover:bg-[#c91c23] transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
                        >
                          مسح الكل
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading State when fetching orders */}
          {fetchingOrders && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 bg-white/80 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl mb-6 sm:mb-8 dark:bg-gray-800/80"
            >
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26] mb-4"></div>
            </motion.div>
          )}

          {/* Orders List */}
          <div className="space-y-4 sm:space-y-6 relative z-20">
            {!fetchingOrders && (
              <AnimatePresence>
                {orders.map((order, index) => {
                  const finalTotal = getFinalTotal(order);

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 cursor-pointer hover:shadow-2xl transition-all duration-300 dark:bg-gray-800/90"
                      onClick={() => handleOrderClick(order)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Order Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 sm:gap-6 mb-3">
                            <div className="min-w-0">
                              <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 truncate">
                                طلب #{order.orderNumber}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-400 text-sm">
                                {addTwoHoursToDate(
                                  order.createdAt
                                ).toLocaleDateString("ar-SA", {
                                  weekday: "long",
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                              {isAdminOrRestaurantOrBranch && order.userId && (
                                <div className="flex items-center gap-2 mt-2">
                                  <FaUser className="text-gray-400 dark:text-gray-500 w-3 h-3" />
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {users.find((u) => u.id === order.userId)
                                      ?.firstName || "مستخدم غير معروف"}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                                  order.status
                                )} whitespace-nowrap`}
                              >
                                {getStatusText(order.status)}
                              </div>
                            </div>
                          </div>

                          {isAdminOrRestaurantOrBranch && (
                            <div className="flex gap-2 mb-3">
                              {order.status !== "Cancelled" &&
                                order.status !== "Rejected" && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={(e) =>
                                      handleCancelOrder(order.id, e)
                                    }
                                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                                  >
                                    <FaTrash size={10} />
                                    إلغاء الطلب
                                  </motion.button>
                                )}
                            </div>
                          )}

                          {/* Customer/Delivery Info */}
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-[#E41E26] flex-shrink-0 w-3 h-3" />
                              <span className="truncate">
                                {order.location?.streetName ||
                                  "لم يتم تحديد العنوان"}
                              </span>
                            </div>
                            {order.location?.phoneNumber && (
                              <div className="flex items-center gap-2 sm:ml-4">
                                <FaPhone className="text-[#E41E26] flex-shrink-0 w-3 h-3" />
                                <span>{order.location.phoneNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Total and Action */}
                        <div className="flex flex-row sm:flex-col items-center justify-between sm:items-end lg:items-start gap-3 sm:gap-2 lg:gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
                          <div className="text-left sm:text-right lg:text-left">
                            <div className="text-lg sm:text-xl font-bold text-[#E41E26]">
                              ج.م {finalTotal.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 hidden sm:block">
                              المبلغ الإجمالي
                              {order.totalDiscount > 0 && (
                                <span className="ml-2 text-green-600 dark:text-green-400 flex items-center gap-1">
                                  <FaTag className="w-3 h-3" />
                                  -ج.م {order.totalDiscount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-[#E41E26]">
                            {getStatusIcon(order.status)}
                            <span className="text-sm font-semibold whitespace-nowrap">
                              عرض التفاصيل
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}

            {!fetchingOrders && orders.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 sm:py-12"
              >
                <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaShoppingBag className="text-gray-400 dark:text-gray-500 text-xl sm:text-3xl" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                  لا توجد طلبات
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm sm:text-base px-4">
                  {filter !== "all" ||
                  dateRange.start ||
                  dateRange.end ||
                  selectedUserId
                    ? "حاول تعديل معايير التصفية"
                    : "لم تقم بوضع أي طلبات بعد"}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate("/")}
                  className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 sm:px-8 py-2 sm:py-3 rounded-xl font-bold hover:shadow-lg transition-all duration-300 text-sm sm:text-base"
                >
                  ابدأ التسوق
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Pagination - Show only for admin users with pagination */}
          {isAdminOrRestaurantOrBranch && totalPages > 1 && (
            <div className="mt-8 flex flex-col items-center">
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`p-2 sm:p-3 rounded-xl transition-all ${
                    currentPage === 1
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <FaChevronRight className="text-sm sm:text-base" />
                </motion.button>

                <div className="flex items-center gap-1 sm:gap-2">
                  {getPaginationNumbers().map((pageNum, index) => (
                    <React.Fragment key={index}>
                      {pageNum === "..." ? (
                        <span className="px-2 sm:px-3 py-1 sm:py-2 text-gray-500">
                          ...
                        </span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handlePageChange(pageNum)}
                          className={`px-3 sm:px-4 py-1 sm:py-2 rounded-xl font-semibold transition-all ${
                            currentPage === pageNum
                              ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white shadow-lg"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                          }`}
                        >
                          {pageNum}
                        </motion.button>
                      )}
                    </React.Fragment>
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`p-2 sm:p-3 rounded-xl transition-all ${
                    currentPage === totalPages
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <FaChevronLeft className="text-sm sm:text-base" />
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedOrder && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOrderDetails}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col mx-auto my-auto h-full sm:h-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-800 dark:to-gray-700">
                  <div className="flex items-center gap-3 min-w-0">
                    <FaReceipt className="text-[#E41E26] text-xl sm:text-2xl flex-shrink-0" />
                    <div className="min-w-0">
                      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-200 truncate">
                        طلب #{selectedOrder.orderNumber}
                      </h2>
                      {orderDetails && (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                          <span
                            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${getStatusColor(
                              orderDetails.status
                            )} whitespace-nowrap self-start`}
                          >
                            {getStatusText(orderDetails.status)}
                          </span>
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                            {addTwoHoursToDate(
                              orderDetails.createdAt
                            ).toLocaleDateString("ar-SA", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={closeOrderDetails}
                    className="p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200 flex-shrink-0 ml-2"
                  >
                    <FaTimes className="text-gray-500 dark:text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
                  {loadingOrderDetails ? (
                    <div className="flex flex-col items-center justify-center h-48 sm:h-64">
                      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-[#E41E26] mb-4"></div>
                    </div>
                  ) : orderDetails ? (
                    <div className="space-y-4 sm:space-y-6">
                      {/* Customer Information */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-base sm:text-lg">
                          <FaUser className="text-[#E41E26] flex-shrink-0" />
                          معلومات العميل
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex items-start gap-2 sm:gap-3">
                            <FaPhone className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 dark:text-gray-200 break-words">
                                {orderDetails.location?.phoneNumber ||
                                  "غير متاح"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-2 sm:gap-3">
                            <FaMapMarkerAlt className="text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-800 dark:text-gray-200 break-words">
                                {orderDetails.location?.streetName || ""}{" "}
                                {orderDetails.location?.buildingNumber || ""}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-words">
                                {orderDetails.location?.city?.name || ""} -
                                الطابق{" "}
                                {orderDetails.location?.floorNumber || ""}، شقة{" "}
                                {orderDetails.location?.flatNumber || ""}
                              </p>
                              {orderDetails.location?.detailedDescription && (
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 break-words">
                                  {orderDetails.location.detailedDescription}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Order Items */}
                      {orderDetails.items && orderDetails.items.length > 0 && (
                        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-base sm:text-lg">
                            <FaBox className="text-[#E41E26] flex-shrink-0" />
                            العناصر المطلوبة ({orderDetails.items.length})
                          </h3>
                          <div className="space-y-3 sm:space-y-4">
                            {orderDetails.items.map((item, index) => {
                              const imageUrl =
                                item.menuItemImageUrlSnapshotAtOrder ||
                                item.menuItem?.imageUrl;
                              const itemName =
                                item.menuItemNameSnapshotAtOrder ||
                                item.menuItem?.name ||
                                "عنصر غير معروف";
                              const itemDescription =
                                item.menuItemDescriptionAtOrder ||
                                item.menuItem?.description ||
                                "";
                              const basePrice =
                                item.menuItemBasePriceSnapshotAtOrder > 0
                                  ? item.menuItemBasePriceSnapshotAtOrder
                                  : item.menuItem?.basePrice || 0;
                              const totalPrice =
                                item.totalPrice < 0
                                  ? Math.abs(item.totalPrice)
                                  : item.totalPrice;

                              let itemAdditions = 0;
                              if (item.options && item.options.length > 0) {
                                item.options.forEach((option) => {
                                  itemAdditions +=
                                    option.optionPriceAtOrder || 0;
                                });
                              }

                              const itemDiscount = item.totalDiscount || 0;

                              return (
                                <div
                                  key={index}
                                  className="flex items-start gap-3 sm:gap-4 p-2 sm:p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                  <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                                    {imageUrl ? (
                                      <img
                                        src={`${BASE_URL}${imageUrl}`}
                                        alt={itemName}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          e.target.onerror = null;
                                          e.target.src =
                                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236b7280'%3E%3Cpath d='M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z'/%3E%3C/svg%3E";
                                        }}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-600">
                                        <FaBox className="text-gray-400 dark:text-gray-500 text-lg sm:text-xl" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 text-sm sm:text-base truncate">
                                      {itemName}
                                    </h4>
                                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                                      الكمية: {item.quantity}
                                    </p>
                                    {itemDescription && (
                                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                                        {itemDescription}
                                      </p>
                                    )}
                                    {item.options &&
                                      item.options.length > 0 && (
                                        <div className="mt-2">
                                          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            الإضافات:
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                            {item.options.map(
                                              (opt, optIndex) => (
                                                <span
                                                  key={optIndex}
                                                  className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs rounded"
                                                >
                                                  {opt.optionNameAtOrder} (+ج.م{" "}
                                                  {opt.optionPriceAtOrder?.toFixed(
                                                    2
                                                  ) || "0.00"}
                                                  )
                                                </span>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      )}
                                  </div>
                                  <div className="text-right flex-shrink-0">
                                    <p className="font-bold text-gray-800 dark:text-gray-200 text-sm sm:text-base">
                                      ج.م {totalPrice?.toFixed(2) || "0.00"}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 hidden xs:block">
                                      الأساسي: ج.م {basePrice.toFixed(2)} لكل
                                    </p>
                                    {itemAdditions > 0 && (
                                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                        <FaPlusCircle className="inline w-2 h-2 mr-1" />
                                        إضافات: +ج.م {itemAdditions.toFixed(2)}
                                      </p>
                                    )}
                                    {itemDiscount > 0 && (
                                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                        <FaTag className="inline w-2 h-2 mr-1" />
                                        خصم: -ج.م {itemDiscount.toFixed(2)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Order Summary */}
                      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-3 text-base sm:text-lg">
                          ملخص الطلب
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                              المجموع الجزئي (العناصر):
                            </span>
                            <span className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200">
                              ج.م{" "}
                              {orderDetails.calculatedSubtotal?.toFixed(2) ||
                                "0.00"}
                            </span>
                          </div>

                          {orderDetails.calculatedTotalAdditions > 0 && (
                            <div className="flex justify-between items-center text-blue-600 dark:text-blue-400">
                              <span className="flex items-center gap-1 text-sm sm:text-base">
                                <FaPlusCircle className="w-3 h-3" />
                                إجمالي الإضافات:
                              </span>
                              <span className="font-medium text-sm sm:text-base">
                                +ج.م{" "}
                                {orderDetails.calculatedTotalAdditions?.toFixed(
                                  2
                                ) || "0.00"}
                              </span>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                              رسوم التوصيل:
                            </span>
                            <span className="font-medium text-sm sm:text-base text-gray-800 dark:text-gray-200">
                              ج.م{" "}
                              {orderDetails.calculatedDeliveryFee?.toFixed(2) ||
                                "0.00"}
                            </span>
                          </div>

                          {orderDetails.deliveryFee && (
                            <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 pl-3 sm:pl-4">
                              <i>
                                {orderDetails.deliveryFee.areaName} -{" "}
                                {orderDetails.deliveryFee.estimatedTimeMin}-
                                {orderDetails.deliveryFee.estimatedTimeMax}{" "}
                                دقيقة
                              </i>
                            </div>
                          )}

                          {orderDetails.calculatedTotalDiscount > 0 && (
                            <div className="flex justify-between items-center text-green-600 dark:text-green-400">
                              <span className="flex items-center gap-1 text-sm sm:text-base">
                                <FaTag className="w-3 h-3" />
                                إجمالي الخصم:
                              </span>
                              <span className="font-medium text-sm sm:text-base">
                                -ج.م{" "}
                                {orderDetails.calculatedTotalDiscount?.toFixed(
                                  2
                                ) || "0.00"}
                              </span>
                            </div>
                          )}

                          <div className="border-t pt-2 sm:pt-3 mt-2 sm:mt-3">
                            <div className="flex justify-between items-center font-bold text-base sm:text-lg">
                              <span className="text-gray-800 dark:text-gray-200">
                                الإجمالي:
                              </span>
                              <span className="text-[#E41E26]">
                                ج.م{" "}
                                {(
                                  orderDetails.calculatedTotalWithFee ||
                                  orderDetails.totalWithFee ||
                                  0
                                ).toFixed(2)}
                              </span>
                            </div>

                            {orderDetails.calculatedTotalDiscount > 0 && (
                              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <span className="text-green-600 dark:text-green-400">
                                  لقد وفرت ج.م{" "}
                                  {orderDetails.calculatedTotalDiscount?.toFixed(
                                    2
                                  ) ||
                                    orderDetails.totalDiscount?.toFixed(2) ||
                                    "0.00"}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Notes */}
                      {orderDetails.notes && (
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5">
                          <h3 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2 text-sm sm:text-base">
                            <svg
                              className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                clipRule="evenodd"
                              />
                            </svg>
                            ملاحظات خاصة
                          </h3>
                          <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 break-words">
                            {orderDetails.notes}
                          </p>
                        </div>
                      )}

                      {/* Admin Actions */}
                      {isAdminOrRestaurantOrBranch && (
                        <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-700">
                          {orderDetails.status !== "Cancelled" &&
                            orderDetails.status !== "Rejected" && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) =>
                                  handleCancelOrder(orderDetails.id, e)
                                }
                                className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors text-sm sm:text-base"
                              >
                                <FaTrash className="w-3 h-3 sm:w-4 sm:h-4" />
                                إلغاء الطلب
                              </motion.button>
                            )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <FaTimesCircle className="text-red-500 text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4" />
                      <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                        فشل تحميل تفاصيل الطلب
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                        يرجى المحاولة مرة أخرى لاحقاً
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
