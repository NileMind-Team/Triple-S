import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaChartBar,
  FaShoppingCart,
  FaTruck,
  FaStore,
  FaPrint,
  FaFilter,
  FaListAlt,
  FaUser,
  FaMapMarkerAlt,
  FaBox,
  FaTimes,
  FaEye,
  FaClipboardList,
  FaMoneyBill,
  FaCheckCircle,
  FaClock,
  FaUtensils,
  FaMotorcycle,
  FaCheck,
  FaBan,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, startOfDay, endOfDay, addHours } from "date-fns";
import axiosInstance from "../api/axiosInstance";

const showSalesMobileSuccessToast = (message) => {
  if (window.innerWidth < 768) {
    toast.success(message, {
      position: "top-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        width: "70%",
        margin: "10px",
        borderRadius: "8px",
        textAlign: "right",
        fontSize: "14px",
        direction: "rtl",
      },
    });
  }
};

const showSalesMobileAlertToast = (message, type = "info") => {
  if (window.innerWidth < 768) {
    const toastFunc =
      type === "error"
        ? toast.error
        : type === "warning"
        ? toast.warning
        : toast.info;
    toastFunc(message, {
      position: "top-right",
      autoClose: 2500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      style: {
        width: "70%",
        margin: "10px",
        borderRadius: "8px",
        textAlign: "right",
        fontSize: "14px",
        direction: "rtl",
      },
    });
  }
};

const fetchOrders = async (
  startDate,
  endDate,
  pageNumber = 1,
  pageSize = 10
) => {
  try {
    const requestBody = {
      pageNumber: pageNumber,
      pageSize: pageSize,
      filters: [],
    };

    if (startDate && endDate) {
      const startDateISO = addHours(startOfDay(startDate), 2).toISOString();
      const endDateISO = addHours(endOfDay(endDate), 2).toISOString();

      requestBody.filters.push({
        propertyName: "createdAt",
        propertyValue: `${startDateISO},${endDateISO}`,
        range: true,
      });
    }

    console.log(
      "Request Body for Orders:",
      JSON.stringify(requestBody, null, 2)
    );

    const response = await axiosInstance.post(
      "/api/Orders/GetAllWithPagination",
      requestBody
    );

    if (
      !response.data ||
      !response.data.data ||
      response.data.data.length === 0
    ) {
      throw new Error("لا توجد بيانات في الفترة المحددة");
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
    throw error;
  }
};

const fetchAllOrdersForPrint = async (startDate, endDate) => {
  try {
    if (!startDate || !endDate) {
      return {
        orders: [],
        totalPrice: 0,
      };
    }

    const startDateWithTime = startOfDay(startDate);
    const endDateWithTime = endOfDay(endDate);

    console.log(
      `Fetching print orders from ${startDateWithTime} to ${endDateWithTime}`
    );

    const response = await axiosInstance.get("/api/Orders/GetAll", {
      params: {
        startRange: startDateWithTime.toISOString(),
        endRange: endDateWithTime.toISOString(),
      },
    });

    const orders = response.data || [];
    console.log(`تم جلب ${orders.length} طلب للطباعة`);

    return {
      orders: orders,
      totalPrice: 0,
    };
  } catch (error) {
    console.error("Error fetching all orders for print:", error);
    throw error;
  }
};

const fetchOrderDetails = async (orderId) => {
  try {
    const response = await axiosInstance.get(`/api/Orders/GetById/${orderId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching order details:", error);
    throw error;
  }
};

const fetchUsers = async () => {
  try {
    const response = await axiosInstance.get("/api/Users/GetAll");
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

const calculateSummary = (allOrders, startDate, endDate, totalPrice = 0) => {
  if (!allOrders || allOrders.length === 0) {
    return {
      totalSales: 0,
      totalOrders: 0,
      deliveryOrders: 0,
      pickupOrders: 0,
      topProducts: [],
      dateRange:
        startDate && endDate
          ? `${format(startDate, "yyyy-MM-dd")} إلى ${format(
              endDate,
              "yyyy-MM-dd"
            )}`
          : "لم يتم تحديد فترة",
    };
  }

  const totalSales =
    totalPrice > 0
      ? totalPrice
      : allOrders.reduce((sum, order) => sum + (order.totalWithFee || 0), 0);

  const totalOrders = allOrders.length;

  const deliveryOrders = allOrders.filter(
    (order) => order.deliveryFee?.fee > 0
  ).length;
  const pickupOrders = allOrders.filter(
    (order) => order.deliveryFee?.fee === 0
  ).length;

  const productSales = {};
  allOrders.forEach((order) => {
    if (order.items && order.items.length > 0) {
      order.items.forEach((item) => {
        const productName =
          item.menuItem?.name ||
          item.menuItemNameSnapshotAtOrder ||
          "منتج غير معروف";
        if (!productSales[productName]) {
          productSales[productName] = {
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[productName].quantity += item.quantity || 1;
        productSales[productName].revenue += item.totalPrice || 0;
      });
    }
  });

  const topProducts = Object.entries(productSales)
    .map(([name, data]) => ({
      name,
      quantity: data.quantity,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  return {
    totalSales,
    totalOrders,
    deliveryOrders,
    pickupOrders,
    topProducts,
    dateRange:
      startDate && endDate
        ? `${format(startDate, "yyyy-MM-dd")} إلى ${format(
            endDate,
            "yyyy-MM-dd"
          )}`
        : "لم يتم تحديد فترة",
  };
};

const toArabicNumbers = (num) => {
  if (num === null || num === undefined) return "٠";

  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return num
    .toString()
    .replace(/\d/g, (digit) => arabicDigits[parseInt(digit)]);
};

const formatCurrencyArabic = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "٠٫٠٠ ج.م";
  }

  const numberStr = Number(amount).toFixed(2);
  const [wholePart, decimalPart] = numberStr.split(".");
  const arabicWhole = toArabicNumbers(wholePart);
  const arabicDecimal = toArabicNumbers(decimalPart);
  const withCommas = arabicWhole.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");

  return `${withCommas}.${arabicDecimal} ج.م`;
};

const formatNumberArabic = (number) => {
  if (number === null || number === undefined || isNaN(number)) {
    return "٠";
  }

  const num = Math.round(number);
  const arabicNum = toArabicNumbers(num);

  return arabicNum.replace(/\B(?=(\d{3})+(?!\d))/g, "٬");
};

const OrderDetailsModal = ({ order, onClose, users }) => {
  if (!order) return null;

  const BASE_URL = "https://restaurant-template.runasp.net";

  const findUserName = (userId) => {
    if (!userId || !users) return "غير معروف";
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : userId.substring(0, 8);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="text-yellow-500" />;
      case "Confirmed":
        return <FaCheckCircle className="text-blue-500" />;
      case "Preparing":
        return <FaUtensils className="text-orange-500" />;
      case "OutForDelivery":
        return <FaMotorcycle className="text-purple-500" />;
      case "Delivered":
        return <FaCheck className="text-green-500" />;
      case "Cancelled":
        return <FaBan className="text-red-500" />;
      default:
        return <FaClock className="text-gray-500" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return "قيد الانتظار";
      case "Confirmed":
        return "تم التأكيد";
      case "Preparing":
        return "قيد التحضير";
      case "OutForDelivery":
        return "قيد التوصيل";
      case "Delivered":
        return "تم التوصيل";
      case "Cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600 dark:text-yellow-400";
      case "Confirmed":
        return "text-blue-600 dark:text-blue-400";
      case "Preparing":
        return "text-orange-600 dark:text-orange-400";
      case "OutForDelivery":
        return "text-purple-600 dark:text-purple-400";
      case "Delivered":
        return "text-green-600 dark:text-green-400";
      case "Cancelled":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  // دالة لحساب السعر النهائي لكل منتج (بعد الاضافات وخصم المنتج)
  const calculateItemFinalPrice = (item) => {
    if (!item) return 0;

    // السعر الأساسي للمنتج
    const basePrice = item.menuItem?.basePrice || item.basePriceAtOrder || 0;

    // خصم المنتج (إن وجد)
    const itemDiscount = item.totalDiscount || 0;

    // اجمالي الاضافات
    const optionsTotal =
      item.options?.reduce(
        (sum, option) => sum + (option.optionPriceAtOrder || 0),
        0
      ) || 0;

    // حساب السعر النهائي للمنتج الواحد
    const itemPriceBeforeDiscount =
      (basePrice + optionsTotal) * (item.quantity || 1);
    const itemFinalPrice = itemPriceBeforeDiscount - itemDiscount;

    return Math.max(itemFinalPrice, 0); // التأكد من عدم ظهور سعر سالب
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative bg-white dark:bg-gray-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] p-6 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <FaClipboardList className="text-white text-2xl" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">
                  تفاصيل الطلب #{order.orderNumber}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaTimes className="text-white text-xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <FaUser className="text-[#E41E26]" />
                <h3 className="font-bold text-gray-800 dark:text-white">
                  معلومات العميل
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    اسم العميل:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {findUserName(order.userId)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    رقم الهاتف:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {order.location?.phoneNumber || "غير متوفر"}
                  </span>
                </div>
                {order.location?.city && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      المدينة:
                    </span>
                    <span className="font-medium text-gray-800 dark:text-white">
                      {order.location.city.name || order.location.city}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <FaMapMarkerAlt className="text-[#E41E26]" />
                <h3 className="font-bold text-gray-800 dark:text-white">
                  معلومات التوصيل
                </h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    نوع الطلب:
                  </span>
                  <span
                    className={`font-medium ${
                      order.deliveryFee?.fee > 0
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    {order.deliveryFee?.areaName ||
                      (order.deliveryFee?.fee > 0 ? "توصيل" : "استلام")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    العنوان:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {order.location?.streetName || "غير متوفر"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    تكلفة التوصيل:
                  </span>
                  <span className="font-medium text-gray-800 dark:text-white">
                    {order.deliveryCost?.toFixed(2) || "0.00"} ج.م
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FaBox className="text-[#E41E26]" />
              <h3 className="font-bold text-gray-800 dark:text-white">
                المنتجات المطلوبة
              </h3>
            </div>
            {order.items && order.items.length > 0 ? (
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  const itemFinalPrice = calculateItemFinalPrice(item);

                  const basePrice =
                    item.menuItem?.basePrice || item.basePriceAtOrder || 0;
                  const isPriceBasedOnRequest = basePrice === 0;

                  const itemPriceWithOptions = (
                    ((item.menuItem?.basePrice || 0) +
                      (item.options?.reduce(
                        (sum, option) => sum + (option.optionPriceAtOrder || 0),
                        0
                      ) || 0)) *
                    (item.quantity || 1)
                  ).toFixed(2);

                  return (
                    <div
                      key={index}
                      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {(item.menuItem?.imageUrl ||
                          item.menuItemImageUrlSnapshotAtOrder) && (
                          <div className="md:w-1/4">
                            <div className="relative w-full h-48 md:h-40 rounded-lg overflow-hidden">
                              <img
                                src={`${BASE_URL}/${
                                  item.menuItem?.imageUrl ||
                                  item.menuItemImageUrlSnapshotAtOrder
                                }`}
                                alt={
                                  item.menuItem?.name ||
                                  item.menuItemNameSnapshotAtOrder ||
                                  "صورة المنتج"
                                }
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/300x200?text=No+Image";
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <div
                          className={`${
                            item.menuItem?.imageUrl ||
                            item.menuItemImageUrlSnapshotAtOrder
                              ? "md:w-3/4"
                              : "w-full"
                          }`}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                              <p className="font-bold text-lg text-gray-800 dark:text-white mb-1">
                                {item.menuItem?.name ||
                                  item.menuItemNameSnapshotAtOrder ||
                                  "منتج غير معروف"}
                              </p>
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {item.menuItem?.description?.substring(
                                  0,
                                  100
                                ) ||
                                  item.menuItemDescriptionAtOrder?.substring(
                                    0,
                                    100
                                  ) ||
                                  "لا يوجد وصف"}
                                {(item.menuItem?.description?.length > 100 ||
                                  item.menuItemDescriptionAtOrder?.length >
                                    100) &&
                                  "..."}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                الكمية
                              </p>
                              <p className="font-bold text-lg text-gray-800 dark:text-white">
                                {item.quantity || 1}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                السعر الأساسي
                              </p>
                              <p className="font-bold text-lg text-green-600 dark:text-green-400">
                                {isPriceBasedOnRequest ? (
                                  <span className="text-[#E41E26] dark:text-[#FDB913]">
                                    السعر حسب الطلب
                                  </span>
                                ) : (
                                  `${basePrice.toFixed(2)} ج.م`
                                )}
                              </p>
                            </div>
                          </div>

                          {item.options && item.options.length > 0 && (
                            <div className="mt-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                الاضافات المختارة:
                              </p>
                              <div className="space-y-2">
                                {item.options.map((option, optionIndex) => (
                                  <div
                                    key={optionIndex}
                                    className="flex justify-between items-center bg-white dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700"
                                  >
                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                      {option.optionNameAtOrder ||
                                        `إضافة ${optionIndex + 1}`}
                                    </span>
                                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                      +
                                      {option.optionPriceAtOrder?.toFixed(2) ||
                                        "0.00"}{" "}
                                      ج.م
                                    </span>
                                  </div>
                                ))}
                                <div className="flex justify-between items-center pt-2 border-t border-gray-300 dark:border-gray-600">
                                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    إجمالي الاضافات:
                                  </span>
                                  <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                    {item.options
                                      .reduce(
                                        (sum, option) =>
                                          sum +
                                          (option.optionPriceAtOrder || 0),
                                        0
                                      )
                                      .toFixed(2)}{" "}
                                    ج.م
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  السعر
                                </p>
                                <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                  {itemPriceWithOptions} ج.م
                                </p>
                              </div>

                              <div className="text-center">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  خصم المنتج
                                </p>
                                <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                  {item.totalDiscount?.toFixed(2) || "0.00"} ج.م
                                </p>
                              </div>

                              <div className="text-center col-span-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  الإجمالي النهائي للمنتج
                                </p>
                                <p className="text-lg font-bold text-[#E41E26] dark:text-[#FDB913]">
                                  {itemFinalPrice.toFixed(2)} ج.م
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <FaBox className="mx-auto text-3xl text-gray-400 dark:text-gray-500 mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  لا توجد منتجات في هذا الطلب
                </p>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-r from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  الإجمالي بعد الخصم
                </p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">
                  {order.totalWithoutFee?.toFixed(2) || "0.00"} ج.م
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  إجمالي الخصم
                </p>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  {order.totalDiscount?.toFixed(2) || "0.00"} ج.م
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  المبلغ النهائي
                </p>
                <p className="text-xl font-bold text-[#E41E26] dark:text-[#FDB913]">
                  {order.totalWithFee?.toFixed(2) || "0.00"} ج.م
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  حالة الطلب
                </p>
                <p
                  className={`text-lg font-bold ${getStatusColor(
                    order.status
                  )}`}
                >
                  <span className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    {getStatusLabel(order.status)}
                  </span>
                </p>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  ملاحظات:
                </p>
                <p className="text-gray-800 dark:text-gray-300">
                  {order.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const SalesReports = () => {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [reportData, setReportData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [users, setUsers] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // eslint-disable-next-line no-unused-vars
  const [totalItems, setTotalItems] = useState(0);
  const [allOrdersForStats, setAllOrdersForStats] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [totalPriceFromResponse, setTotalPriceFromResponse] = useState(0);

  useEffect(() => {
    setSummary({
      totalSales: 0,
      totalOrders: 0,
      deliveryOrders: 0,
      pickupOrders: 0,
      topProducts: [],
      dateRange: "لم يتم تحديد فترة",
    });

    const loadUsers = async () => {
      setLoadingUsers(true);
      try {
        const usersData = await fetchUsers();
        setUsers(usersData);
      } catch (error) {
        console.error("Error loading users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const fetchReportData = async (page = 1, isFilterAction = false) => {
    if (!startDate || !endDate) {
      if (isFilterAction) {
        if (window.innerWidth < 768) {
          showSalesMobileAlertToast(
            "يرجى تحديد تاريخ البداية والنهاية أولاً",
            "warning"
          );
        } else {
          Swal.fire({
            icon: "warning",
            title: "تاريخ غير مكتمل",
            text: "يرجى تحديد تاريخ البداية والنهاية أولاً",
            timer: 3000,
            showConfirmButton: false,
            background: "#fff",
            color: "#333",
          });
        }
      }
      return;
    }

    if (startDate > endDate) {
      if (isFilterAction) {
        if (window.innerWidth < 768) {
          showSalesMobileAlertToast(
            "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
            "error"
          );
        } else {
          Swal.fire({
            icon: "error",
            title: "خطأ في التاريخ",
            text: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
            timer: 3000,
            showConfirmButton: false,
          });
        }
      }
      return;
    }

    setLoading(true);
    try {
      const response = await fetchOrders(startDate, endDate, page, 10);
      const orders = response.data;
      setReportData(orders);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalItems);
      setCurrentPage(response.pageNumber);
      setTotalPriceFromResponse(response.totalPrice || 0);

      let allOrders = [];
      if (isFilterAction) {
        allOrders = orders;
        setAllOrdersForStats(allOrders);
      } else {
        allOrders = allOrdersForStats;
      }

      const summaryData = calculateSummary(
        allOrders,
        startDate,
        endDate,
        response.totalPrice || 0
      );
      setSummary(summaryData);

      if (isFilterAction) {
        setTimeout(() => {
          if (window.innerWidth < 768) {
            showSalesMobileSuccessToast("تم تطبيق الفلترة بنجاح");
          } else {
            Swal.fire({
              icon: "success",
              title: "تم تطبيق الفلترة بنجاح",
              timer: 1500,
              showConfirmButton: false,
            });
          }
        }, 500);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);

      const errorMessage =
        error.message === "لا توجد بيانات في الفترة المحددة"
          ? "لا توجد بيانات في الفترة المحددة"
          : "فشل في تحميل بيانات التقرير";

      if (window.innerWidth < 768) {
        showSalesMobileAlertToast(errorMessage, "info");
      } else {
        Swal.fire({
          icon: "info",
          title: "لا توجد بيانات",
          text: errorMessage,
          timer: 2500,
          showConfirmButton: false,
        });
      }

      setReportData([]);
      setSummary({
        totalSales: 0,
        totalOrders: 0,
        deliveryOrders: 0,
        pickupOrders: 0,
        topProducts: [],
        dateRange:
          startDate && endDate
            ? `${format(startDate, "yyyy-MM-dd")} إلى ${format(
                endDate,
                "yyyy-MM-dd"
              )}`
            : "لم يتم تحديد فترة",
      });
      setTotalPages(1);
      setCurrentPage(1);
      setTotalItems(0);
      setAllOrdersForStats([]);
      setTotalPriceFromResponse(0);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrderDetails = async (orderId) => {
    setLoadingDetails(true);
    try {
      const details = await fetchOrderDetails(orderId);
      setOrderDetails(details);
      setSelectedOrder(details);
    } catch (error) {
      if (window.innerWidth < 768) {
        showSalesMobileAlertToast("فشل في تحميل تفاصيل الطلب", "error");
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل تفاصيل الطلب",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  const findUserName = (userId) => {
    if (!userId || !users || users.length === 0)
      return userId?.substring(0, 8) || "غير معروف";
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : userId.substring(0, 8);
  };

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return "0.00 ج.م";
    }
    return `${Number(amount).toLocaleString("ar-EG")} ج.م`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <FaClock className="text-xs" />;
      case "Confirmed":
        return <FaCheckCircle className="text-xs" />;
      case "Preparing":
        return <FaUtensils className="text-xs" />;
      case "OutForDelivery":
        return <FaMotorcycle className="text-xs" />;
      case "Delivered":
        return <FaCheck className="text-xs" />;
      case "Cancelled":
        return <FaBan className="text-xs" />;
      default:
        return <FaClock className="text-xs" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "Pending":
        return "قيد الانتظار";
      case "Confirmed":
        return "تم التأكيد";
      case "Preparing":
        return "قيد التحضير";
      case "OutForDelivery":
        return "قيد التوصيل";
      case "Delivered":
        return "تم التوصيل";
      case "Cancelled":
        return "ملغي";
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "Confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "Preparing":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "OutForDelivery":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "Delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "Cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getPrintStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "status-pending";
      case "Confirmed":
        return "status-confirmed";
      case "Preparing":
        return "status-preparing";
      case "OutForDelivery":
        return "status-outfordelivery";
      case "Delivered":
        return "status-delivered";
      case "Cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    fetchReportData(pageNumber, false);
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  const getPaginationNumbers = () => {
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

  const handlePrint = async () => {
    try {
      setIsPrinting(true);

      if (!startDate || !endDate) {
        if (window.innerWidth < 768) {
          showSalesMobileAlertToast(
            "يرجى تحديد تاريخ البداية والنهاية أولاً",
            "warning"
          );
        } else {
          Swal.fire({
            icon: "warning",
            title: "تاريخ غير مكتمل",
            text: "يرجى تحديد تاريخ البداية والنهاية أولاً",
            timer: 2000,
            showConfirmButton: false,
          });
        }
        setIsPrinting(false);
        return;
      }

      Swal.fire({
        title: "جاري الطباعة",
        text: `يتم تحضير التقرير للطباعة...`,
        icon: "info",
        showConfirmButton: false,
        timer: 500,
      }).then(async () => {
        try {
          const printData = await fetchAllOrdersForPrint(startDate, endDate);
          const allOrders = printData.orders || [];

          if (allOrders.length === 0) {
            if (window.innerWidth < 768) {
              showSalesMobileAlertToast(
                "لا توجد بيانات لعرضها في التقرير",
                "warning"
              );
            } else {
              Swal.fire({
                icon: "warning",
                title: "لا توجد بيانات",
                text: "لا توجد بيانات لعرضها في التقرير",
                timer: 2000,
                showConfirmButton: false,
              });
            }
            setIsPrinting(false);
            return;
          }

          const printSummary = calculateSummary(
            allOrders,
            startDate,
            endDate,
            summary?.totalSales || 0
          );

          const printContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>تقرير المبيعات - Triple S</title>
<style>
  @media print {
    @page { margin: 0; size: A4 portrait; }
    body {
      margin: 0; padding: 15px;
      font-family: 'Arial', sans-serif;
      background: white !important;
      color: black !important;
      direction: rtl;
      font-size: 15px;
    }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
  
  body {
    margin: 0; padding: 15px;
    font-family: 'Arial', sans-serif;
    background: white !important;
    color: black !important;
    direction: rtl;
    font-size: 11px;
  }
  
  .print-header {
    text-align: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 2px solid #000;
  }
  
  .print-header h1 {
    color: black !important;
    margin: 0 0 5px 0;
    font-size: 22px;
    font-weight: bold;
  }
  
  .print-header p {
    color: #666 !important;
    margin: 0;
    font-size: 14px;
  }
  
  .print-info {
    margin: 15px 0;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    background: #f9f9f9;
  }
  
  .print-info div {
    margin: 5px 0;
  }
  
  .stats-container {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 15px 0;
    text-align: center;
  }
  
  .stat-card {
    background: #f5f5f5 !important;
    border: 1px solid #ddd !important;
    border-radius: 5px;
    padding: 8px;
  }
  
  .stat-card h3 {
    color: #666 !important;
    margin: 0 0 6px 0;
    font-size: 10px;
    font-weight: normal;
  }
  
  .stat-card p {
    color: black !important;
    margin: 0;
    font-size: 14px;
    font-weight: bold;
  }
  
  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 9px;
    table-layout: fixed;
  }
  
  .print-table th {
    background-color: #f0f0f0 !important;
    color: black !important;
    padding: 6px 3px;
    text-align: center;
    border: 1px solid #ccc !important;
    font-weight: bold;
    font-size: 9px;
  }
  
  .print-table td {
    padding: 5px 3px;
    border: 1px solid #ddd !important;
    text-align: center;
    color: black !important;
    font-size: 8px;
  }
  
  .print-table tr:nth-child(even) {
    background-color: #f9f9f9 !important;
  }
  
  .customer-name {
    font-weight: bold;
  }
  
  .status-badge {
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 8px;
    font-weight: bold;
  }
  
  .status-pending {
    background: #fef3c7 !important;
    color: #92400e !important;
  }
  
  .status-confirmed {
    background: #dbeafe !important;
    color: #1e40af !important;
  }
  
  .status-preparing {
    background: #ffedd5 !important;
    color: #92400e !important;
  }
  
  .status-outfordelivery {
    background: #f3e8ff !important;
    color: #6b21a8 !important;
  }
  
  .status-delivered {
    background: #d1fae5 !important;
    color: #065f46 !important;
  }
  
  .status-cancelled {
    background: #f8d7da !important;
    color: #721c24 !important;
  }
  
  .order-type-delivery {
    color: #1d4ed8 !important;
  }
  
  .order-type-pickup {
    color: #059669 !important;
  }
  
  .total-amount {
    font-weight: bold;
  }
  
  .print-footer {
    margin-top: 20px;
    text-align: center;
    color: #666 !important;
    font-size: 9px;
    padding-top: 10px;
    border-top: 1px solid #ddd;
  }
  
  .no-data {
    text-align: center;
    padding: 40px;
    color: #666 !important;
  }
</style>
</head>
<body>

<div class="print-header">
  <h1>تقرير المبيعات - Triple S</h1>
  <p>نظام إدارة المطاعم</p>
</div>

<div class="print-info">
  <div>تاريخ التقرير: ${new Date().toLocaleDateString("ar-EG")}</div>
  ${
    startDate
      ? `<div>من: ${new Date(startDate).toLocaleDateString("ar-EG")}</div>`
      : ""
  }
  ${
    endDate
      ? `<div>إلى: ${new Date(endDate).toLocaleDateString("ar-EG")}</div>`
      : ""
  }
  <div>عدد السجلات: ${formatNumberArabic(allOrders.length)}</div>
</div>

<div class="stats-container">
  <div class="stat-card">
    <h3>إجمالي المبيعات</h3>
    <p>${formatCurrencyArabic(printSummary.totalSales || 0)}</p>
  </div>
  <div class="stat-card">
    <h3>إجمالي الطلبات</h3>
    <p>${formatNumberArabic(printSummary.totalOrders || 0)}</p>
  </div>
  <div class="stat-card">
    <h3>طلبات التوصيل</h3>
    <p>${formatNumberArabic(printSummary.deliveryOrders || 0)}</p>
  </div>
  <div class="stat-card">
    <h3>طلبات الاستلام</h3>
    <p>${formatNumberArabic(printSummary.pickupOrders || 0)}</p>
  </div>
</div>

${
  allOrders.length === 0
    ? `
  <div class="no-data">
    <h3>لا توجد طلبات في الفترة المحددة</h3>
  </div>
`
    : `
  <table class="print-table">
    <thead>
      <tr>
        <th width="10%">رقم الطلب</th>
        <th width="15%">العميل</th>
        <th width="10%">الهاتف</th>
        <th width="10%">نوع الطلب</th>
        <th width="20%">العنوان</th>
        <th width="10%">الحالة</th>
        <th width="15%">المبلغ النهائي</th>
      </tr>
    </thead>
    <tbody>
      ${allOrders
        .map((order, index) => {
          const userName = findUserName(order.userId);
          const statusClass = getPrintStatusClass(order.status);
          const orderTypeClass = `order-type-${
            order.deliveryFee?.fee > 0 ? "delivery" : "pickup"
          }`;
          const orderNumberArabic = order.orderNumber
            ? order.orderNumber.replace(/\d/g, (d) => toArabicNumbers(d))
            : "";
          const phoneArabic = order.location?.phoneNumber
            ? order.location.phoneNumber.replace(/\d/g, (d) =>
                toArabicNumbers(d)
              )
            : "غير متوفر";
          return `
          <tr>
            <td class="customer-name">${orderNumberArabic}</td>
            <td>${userName}</td>
            <td>${phoneArabic}</td>
            <td class="${orderTypeClass}">${
            order.deliveryFee?.fee > 0 ? "توصيل" : "استلام"
          }</td>
            <td>${order.location?.streetName || "غير متوفر"}</td>
            <td><span class="status-badge ${statusClass}">${getStatusLabel(
            order.status
          )}</span></td>
            <td class="total-amount">${formatCurrencyArabic(
              order.totalWithFee || 0
            )}</td>
          </tr>
        `;
        })
        .join("")}
      <tr style="background-color: #f0f0f0 !important; font-weight: bold;">
        <td colspan="6" style="text-align: left; padding-right: 20px;">المجموع الكلي:</td>
        <td class="total-amount" style="text-align: center;">${formatCurrencyArabic(
          printSummary.totalSales || 0
        )}</td>
      </tr>
    </tbody>
  </table>
`
}

${
  printSummary?.topProducts && printSummary.topProducts.length > 0
    ? `
<div style="margin-top: 30px;">
  <div style="text-align: center; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #ddd;">
    <h2 style="margin: 0; font-size: 16px; color: black;">المنتجات الأكثر مبيعاً</h2>
  </div>
  <table class="print-table">
    <thead>
      <tr>
        <th width="5%">#</th>
        <th width="45%">اسم المنتج</th>
        <th width="20%">الكمية</th>
        <th width="30%">الإيرادات</th>
      </tr>
    </thead>
    <tbody>
      ${printSummary.topProducts
        .map(
          (product, index) => `
        <tr>
          <td style="text-align: center;">${toArabicNumbers(index + 1)}</td>
          <td style="text-align: center;">${product.name}</td>
          <td style="text-align: center;">${formatNumberArabic(
            product.quantity
          )}</td>
          <td class="total-amount" style="text-align: center;">${formatCurrencyArabic(
            product.revenue
          )}</td>
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
</div>
`
    : ""
}

<div class="print-footer">
  <p>تم الإنشاء في: ${format(new Date(), "yyyy/MM/dd HH:mm").replace(
    /\d/g,
    (d) => toArabicNumbers(d)
  )}</p>
  <p>Triple S © ${toArabicNumbers(new Date().getFullYear())}</p>
</div>

</body>
</html>
          `;

          const printFrame = document.createElement("iframe");
          printFrame.style.display = "none";
          printFrame.style.position = "absolute";
          printFrame.style.top = "-9999px";
          printFrame.style.left = "-9999px";
          document.body.appendChild(printFrame);

          const printWindow = printFrame.contentWindow;

          printWindow.document.open();
          printWindow.document.write(printContent);
          printWindow.document.close();

          printWindow.onload = () => {
            setTimeout(() => {
              printWindow.focus();
              printWindow.print();

              setTimeout(() => {
                document.body.removeChild(printFrame);
                setIsPrinting(false);
                if (window.innerWidth < 768) {
                  showSalesMobileSuccessToast("تم تحضير التقرير للطباعة");
                }
              }, 1000);
            }, 500);
          };
        } catch (error) {
          console.error("Error in print process:", error);
          if (window.innerWidth < 768) {
            showSalesMobileAlertToast("فشل في تحميل بيانات الطباعة", "error");
          } else {
            Swal.fire({
              icon: "error",
              title: "خطأ",
              text: "فشل في تحميل بيانات الطباعة",
              timer: 2000,
              showConfirmButton: false,
            });
          }
          setIsPrinting(false);
        }
      });
    } catch (error) {
      console.error("Error in handlePrint:", error);
      setIsPrinting(false);
    }
  };

  const handleDateFilter = () => {
    setCurrentPage(1);
    fetchReportData(1, true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 md:px-6 py-6 relative font-sans overflow-hidden transition-colors duration-300"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 -top-10 w-40 h-40 sm:w-60 sm:h-60 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 sm:w-60 sm:h-60 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-2xl animate-pulse"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-7xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl rounded-2xl sm:rounded-3xl border border-white/50 dark:border-gray-700/50 relative overflow-hidden transition-colors duration-300"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] px-6 py-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                <FaChartBar className="text-white text-2xl" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  تقارير المبيعات
                </h1>
                <p className="text-white/90 text-sm">
                  تحليل مفصل لأداء المبيعات والفروع
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-4 sm:p-6" dir="rtl">
          {/* Date Filter Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 sm:p-6 mb-6 shadow-lg"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-[#E41E26] text-xl" />
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  فلترة بتاريخ
                </h3>
              </div>
            </div>

            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              dir="rtl"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  من تاريخ
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26]" />
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    dateFormat="dd/MM/yyyy"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#E41E26] focus:border-transparent outline-none text-right"
                    locale="ar"
                    placeholderText="اختر تاريخ البداية"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  إلى تاريخ
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26]" />
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate}
                    dateFormat="dd/MM/yyyy"
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-[#E41E26] focus:border-transparent outline-none text-right"
                    locale="ar"
                    placeholderText="اختر تاريخ النهاية"
                  />
                </div>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  إجراءات التقرير
                </label>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDateFilter}
                    disabled={!startDate || !endDate}
                    className={`flex-1 px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                      startDate && endDate
                        ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white cursor-pointer"
                        : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <FaFilter />
                    تطبيق الفلترة
                  </motion.button>
                  {reportData && reportData.length > 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 ${
                        isPrinting
                          ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-cyan-600 text-white cursor-pointer"
                      }`}
                    >
                      {isPrinting ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          جاري الطباعة...
                        </>
                      ) : (
                        <>
                          <FaPrint />
                          طباعة
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Summary Cards */}
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
            >
              {/* Total Sales Card */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">إجمالي المبيعات</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatCurrency(summary.totalSales)}
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FaMoneyBill className="text-2xl" />
                  </div>
                </div>
              </div>

              {/* Total Orders Card */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">إجمالي الطلبات</p>
                    <p className="text-2xl font-bold mt-1">
                      {summary.totalOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FaShoppingCart className="text-2xl" />
                  </div>
                </div>
              </div>

              {/* Delivery Orders */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">طلبات التوصيل</p>
                    <p className="text-2xl font-bold mt-1">
                      {summary.deliveryOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FaTruck className="text-2xl" />
                  </div>
                </div>
              </div>

              {/* Pickup Orders */}
              <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-5 text-white shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">طلبات الاستلام</p>
                    <p className="text-2xl font-bold mt-1">
                      {summary.pickupOrders}
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-xl">
                    <FaStore className="text-2xl" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Top Products Section */}
          {summary?.topProducts && summary.topProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 mb-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <FaChartBar className="text-[#E41E26] text-xl" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    المنتجات الأكثر مبيعاً
                  </h3>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  أعلى 5 منتجات حسب الإيرادات
                </span>
              </div>

              <div className="space-y-3">
                {summary.topProducts.map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#E41E26] to-[#FDB913] flex items-center justify-center text-white font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.quantity} وحدة مباعة
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800 dark:text-white">
                        {formatCurrency(product.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Orders Table */}
          {reportData && reportData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-lg"
            >
              <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <FaListAlt className="text-[#E41E26] text-xl" />
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                    تفاصيل الطلبات
                  </h3>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        رقم الطلب
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        اسم العميل
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        رقم الهاتف
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        نوع الطلب
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        المدينة
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        الحالة
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        الإجمالي
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700 dark:text-gray-300">
                        الإجراءات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {reportData.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors duration-150"
                      >
                        <td className="px-4 py-3 text-center font-mono text-sm text-gray-800 dark:text-white font-bold">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                          {findUserName(order.userId)}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                          {order.location?.phoneNumber || "غير متوفر"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              order.deliveryFee?.fee > 0
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                            }`}
                          >
                            {order.deliveryFee?.fee > 0 ? (
                              <>
                                <FaTruck className="text-xs" />
                                توصيل
                              </>
                            ) : (
                              <>
                                <FaStore className="text-xs" />
                                استلام
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-600 dark:text-gray-400">
                          {order.location?.streetName || "غير متوفر"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(
                              order.status
                            )}`}
                          >
                            {getStatusIcon(order.status)}
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-[#E41E26] dark:text-[#FDB913]">
                          {formatCurrency(order.totalWithFee)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewOrderDetails(order.id)}
                            disabled={loadingDetails}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-300 mx-auto"
                          >
                            {loadingDetails &&
                            selectedOrder?.id === order.id ? (
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <FaEye />
                            )}
                            عرض التفاصيل
                          </motion.button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700">
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-3 text-center font-bold text-gray-800 dark:text-white"
                      >
                        المجموع الكلي:
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-xl font-bold text-[#E41E26] dark:text-[#FDB913]">
                          {formatCurrency(summary?.totalSales || 0)}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Pagination Controls - Only at bottom */}
              {totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-center gap-2">
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
            </motion.div>
          )}

          {(!reportData || reportData.length === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-5xl mb-4 text-gray-400">📊</div>
              <h3 className="text-xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                لا توجد بيانات لعرضها
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                يرجى تحديد فترة زمنية وتطبيق الفلترة لعرض التقرير
              </p>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={orderDetails || selectedOrder}
          onClose={handleCloseOrderDetails}
          users={users}
        />
      )}
    </div>
  );
};

export default SalesReports;
