import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaChartBar,
  FaDollarSign,
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
} from "react-icons/fa";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import axiosInstance from "../api/axiosInstance";

const fetchOrders = async (startDate, endDate) => {
  try {
    let url = `/api/Orders/GetAll`;
    const params = {};

    if (startDate) {
      params.startRange = format(startDate, "yyyy-MM-dd");
    }
    if (endDate) {
      params.endRange = format(endDate, "yyyy-MM-dd");
    }

    const response = await axiosInstance.get(url, { params });

    return response.data;
  } catch (error) {
    console.error("Error fetching orders:", error);
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

const calculateSummary = (data, startDate, endDate) => {
  if (!data || data.length === 0) {
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

  const totalSales = data.reduce((sum, order) => sum + order.totalWithFee, 0);
  const totalOrders = data.length;

  const deliveryOrders = data.filter(
    (order) => order.deliveryFee.fee > 0
  ).length;
  const pickupOrders = data.filter(
    (order) => order.deliveryFee.fee === 0
  ).length;

  const productSales = {};
  data.forEach((order) => {
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

const OrderDetailsModal = ({ order, onClose, users }) => {
  if (!order) return null;

  const BASE_URL = "https://restaurant-template.runasp.net";

  // البحث عن اسم المستخدم بناءً على الـ userId
  const findUserName = (userId) => {
    if (!userId || !users) return "غير معروف";
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : userId.substring(0, 8);
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
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:shadow-lg transition-shadow duration-200"
                  >
                    <div className="flex flex-col md:flex-row gap-4">
                      {/* صورة المنتج */}
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

                      {/* معلومات المنتج */}
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
                              {item.menuItem?.description?.substring(0, 100) ||
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
                              السعر
                            </p>
                            <p className="font-bold text-lg text-green-600 dark:text-green-400">
                              {item.menuItem?.basePrice?.toFixed(2) || "0.00"}{" "}
                              ج.م
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                الخصم
                              </p>
                              <p className="font-bold text-red-600 dark:text-red-400">
                                {item.totalDiscount?.toFixed(2) || "0.00"} ج.م
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                                الإجمالي
                              </p>
                              <p className="font-bold text-lg text-[#E41E26] dark:text-[#FDB913]">
                                {item.totalPrice?.toFixed(2) || "0.00"} ج.م
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
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
                  الإجمالي قبل الخصم
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
                  className={`text-lg font-bold ${
                    order.status === "Pending"
                      ? "text-yellow-600 dark:text-yellow-400"
                      : order.status === "Preparing"
                      ? "text-blue-600 dark:text-blue-400"
                      : order.status === "Delivered"
                      ? "text-green-600 dark:text-green-400"
                      : order.status === "Cancelled"
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-600 dark:text-gray-400"
                  }`}
                >
                  {order.status === "Pending"
                    ? "قيد الانتظار"
                    : order.status === "Preparing"
                    ? "قيد التحضير"
                    : order.status === "Delivered"
                    ? "تم التوصيل"
                    : order.status === "Cancelled"
                    ? "ملغي"
                    : order.status}
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

  useEffect(() => {
    setSummary({
      totalSales: 0,
      totalOrders: 0,
      deliveryOrders: 0,
      pickupOrders: 0,
      topProducts: [],
      dateRange: "لم يتم تحديد فترة",
    });

    // جلب بيانات المستخدمين
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

  const fetchReportData = async () => {
    if (!startDate || !endDate) {
      Swal.fire({
        icon: "warning",
        title: "تاريخ غير مكتمل",
        text: "يرجى تحديد تاريخ البداية والنهاية أولاً",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    if (startDate > endDate) {
      Swal.fire({
        icon: "error",
        title: "خطأ في التاريخ",
        text: "تاريخ البداية يجب أن يكون قبل تاريخ النهاية",
        timer: 3000,
        showConfirmButton: false,
      });
      return;
    }

    setLoading(true);
    try {
      const orders = await fetchOrders(startDate, endDate);
      setReportData(orders);
      const summaryData = calculateSummary(orders, startDate, endDate);
      setSummary(summaryData);

      Swal.fire({
        icon: "success",
        title: "تم تحميل التقرير",
        text: `تم تحميل ${orders.length} طلب`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error fetching report data:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحميل بيانات التقرير",
        timer: 2000,
        showConfirmButton: false,
      });
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
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحميل تفاصيل الطلب",
        timer: 2000,
        showConfirmButton: false,
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseOrderDetails = () => {
    setSelectedOrder(null);
    setOrderDetails(null);
  };

  // دالة للبحث عن اسم المستخدم بناءً على الـ userId
  const findUserName = (userId) => {
    if (!userId || !users || users.length === 0)
      return userId?.substring(0, 8) || "غير معروف";
    const user = users.find((u) => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : userId.substring(0, 8);
  };

  const handlePrint = () => {
    if (!reportData || reportData.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "لا توجد بيانات",
        text: "لا توجد بيانات لعرضها في التقرير",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>تقرير المبيعات - Chicken One</title>
        <style>
          @media print {
            body { margin: 0; padding: 20px; font-family: 'Arial', sans-serif; }
            .no-print { display: none !important; }
          }
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 20px;
            max-width: 100%;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #E41E26;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #E41E26;
            margin: 0;
            font-size: 28px;
          }
          .header .date-range {
            color: #666;
            font-size: 16px;
            margin-top: 10px;
          }
          .summary-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-right: 4px solid #FDB913;
          }
          .summary-section h2 {
            color: #333;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 20px;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
          }
          .summary-item {
            background: white;
            padding: 15px;
            border-radius: 6px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .summary-item .label {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .summary-item .value {
            color: #E41E26;
            font-size: 24px;
            font-weight: bold;
          }
          .table-section {
            margin-top: 30px;
            overflow-x: auto;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
          }
          th {
            background: #E41E26;
            color: white;
            padding: 8px;
            text-align: center;
            font-weight: bold;
            font-size: 12px;
          }
          td {
            padding: 6px;
            text-align: center;
            border-bottom: 1px solid #ddd;
            font-size: 11px;
          }
          tr:nth-child(even) {
            background: #f9f9f9;
          }
          .total-row {
            background: #f8f9fa !important;
            font-weight: bold;
          }
          .delivery { color: #2196F3; }
          .pickup { color: #4CAF50; }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            color: #666;
            font-size: 12px;
          }
          .status-badge {
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 10px;
            font-weight: bold;
          }
          .status-pending { background: #fff3cd; color: #856404; }
          .status-preparing { background: #cce5ff; color: #004085; }
          .status-delivered { background: #d4edda; color: #155724; }
          .status-cancelled { background: #f8d7da; color: #721c24; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>تقرير المبيعات - Chicken One</h1>
          <div class="date-range">${
            summary?.dateRange || "فترة غير محددة"
          }</div>
        </div>

        <div class="summary-section">
          <h2>ملخص التقرير</h2>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="label">إجمالي المبيعات</div>
              <div class="value">${
                summary?.totalSales?.toFixed(2) || "0.00"
              } ج.م</div>
            </div>
            <div class="summary-item">
              <div class="label">عدد الطلبات</div>
              <div class="value">${summary?.totalOrders || "0"}</div>
            </div>
            <div class="summary-item">
              <div class="label">طلبات التوصيل</div>
              <div class="value">${summary?.deliveryOrders || "0"}</div>
            </div>
            <div class="summary-item">
              <div class="label">طلبات الاستلام</div>
              <div class="value">${summary?.pickupOrders || "0"}</div>
            </div>
          </div>
        </div>

        <div class="table-section">
          <h2>تفاصيل الطلبات</h2>
          <table>
            <thead>
              <tr>
                <th>رقم الطلب</th>
                <th>اسم العميل</th>
                <th>رقم الهاتف</th>
                <th>نوع الطلب</th>
                <th>المدينة</th>
                <th>العنوان</th>
                <th>الحالة</th>
                <th>الإجمالي</th>
              </tr>
            </thead>
            <tbody>
              ${reportData
                .map((order) => {
                  const userName = findUserName(order.userId);
                  const statusClass = `status-${order.status.toLowerCase()}`;
                  return `
                    <tr>
                      <td>${order.orderNumber}</td>
                      <td>${userName}</td>
                      <td>${order.location?.phoneNumber || "غير متوفر"}</td>
                      <td class="${
                        order.deliveryFee?.fee > 0 ? "delivery" : "pickup"
                      }">
                        ${order.deliveryFee?.fee > 0 ? "توصيل" : "استلام"}
                      </td>
                      <td>${
                        order.location?.city?.name ||
                        order.location?.city ||
                        "غير متوفر"
                      }</td>
                      <td>${order.location?.streetName || "غير متوفر"}</td>
                      <td>
                        <span class="status-badge ${statusClass}">
                          ${
                            order.status === "Pending"
                              ? "قيد الانتظار"
                              : order.status === "Preparing"
                              ? "قيد التحضير"
                              : order.status === "Delivered"
                              ? "تم التوصيل"
                              : order.status === "Cancelled"
                              ? "ملغي"
                              : order.status
                          }
                        </span>
                      </td>
                      <td><strong>${
                        order.totalWithFee?.toFixed(2) || "0.00"
                      } ج.م</strong></td>
                    </tr>
                  `;
                })
                .join("")}
              <tr class="total-row">
                <td colspan="7"><strong>المجموع الكلي:</strong></td>
                <td>
                  <strong>${reportData
                    .reduce((sum, order) => sum + (order.totalWithFee || 0), 0)
                    .toFixed(2)} ج.م</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        ${
          summary?.topProducts && summary.topProducts.length > 0
            ? `
        <div class="table-section">
          <h2>المنتجات الأكثر مبيعاً</h2>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>اسم المنتج</th>
                <th>الكمية</th>
                <th>الإيرادات</th>
              </tr>
            </thead>
            <tbody>
              ${summary.topProducts
                .map(
                  (product, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${product.name}</td>
                    <td>${product.quantity}</td>
                    <td>${product.revenue?.toFixed(2) || "0.00"} ج.م</td>
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

        <div class="footer">
          <p>تم الإنشاء في: ${format(new Date(), "yyyy-MM-dd HH:mm")}</p>
          <p>Chicken One © ${new Date().getFullYear()}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = document.createElement("iframe");
    printWindow.style.position = "absolute";
    printWindow.style.width = "0";
    printWindow.style.height = "0";
    printWindow.style.border = "none";

    document.body.appendChild(printWindow);

    const printDoc = printWindow.contentWindow.document;
    printDoc.open();
    printDoc.write(printContent);
    printDoc.close();

    setTimeout(() => {
      printWindow.contentWindow.focus();
      printWindow.contentWindow.print();

      setTimeout(() => {
        document.body.removeChild(printWindow);
      }, 100);
    }, 100);
  };

  const handleDateFilter = () => {
    fetchReportData();
  };

  const formatCurrency = (amount) => {
    return `${amount?.toFixed(2) || "0.00"} ج.م`;
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
                    <FaDollarSign className="text-2xl" />
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FaListAlt className="text-[#E41E26] text-xl" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                      تفاصيل الطلبات
                    </h3>
                  </div>
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
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              order.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                                : order.status === "Preparing"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                                : order.status === "Delivered"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : order.status === "Cancelled"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                                : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {order.status === "Pending"
                              ? "قيد الانتظار"
                              : order.status === "Preparing"
                              ? "قيد التحضير"
                              : order.status === "Delivered"
                              ? "تم التوصيل"
                              : order.status === "Cancelled"
                              ? "ملغي"
                              : order.status}
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
                          {formatCurrency(
                            reportData.reduce(
                              (sum, order) => sum + (order.totalWithFee || 0),
                              0
                            )
                          )}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
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

          {/* Quick Actions */}
          {reportData && reportData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-center mt-6"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrint}
                className="flex items-center justify-center gap-3 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <FaPrint className="text-2xl" />
                <div className="text-right">
                  <p className="font-bold">طباعة التقرير</p>
                  <p className="text-sm opacity-90">طباعة التقرير الحالي</p>
                </div>
              </motion.button>
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
