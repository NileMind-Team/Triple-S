import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaClock,
  FaPhone,
  FaWhatsapp,
  FaEnvelope,
  FaCity,
  FaBuilding,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaMap,
  FaTimes,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
  FaCommentAlt,
  FaChevronDown,
  FaChevronUp,
  FaUserCircle,
} from "react-icons/fa";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [filteredBranches, setFilteredBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedBranchForMap, setSelectedBranchForMap] = useState(null);
  const [showReviews, setShowReviews] = useState({});

  const isMobile = () => {
    return window.innerWidth < 768;
  };

  const showMessage = (type, title, text, options = {}) => {
    if (isMobile() && !options.forceSwal) {
      const toastOptions = {
        position: "top-right",
        autoClose: options.timer || 2500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        style: {
          width: "70vw",
          maxWidth: "none",
          minWidth: "200px",
          fontSize: "14px",
          borderRadius: "8px",
          right: "0",
          top: "0",
          margin: "0",
          wordBreak: "break-word",
          overflowWrap: "break-word",
          zIndex: 9999,
        },
        bodyStyle: {
          padding: "12px 16px",
          textAlign: "right",
          direction: "rtl",
          width: "100%",
          overflow: "hidden",
          margin: 0,
        },
      };

      switch (type) {
        case "success":
          toast.success(text, toastOptions);
          break;
        case "error":
          toast.error(text, toastOptions);
          break;
        case "warning":
          toast.warning(text, toastOptions);
          break;
        case "info":
          toast.info(text, toastOptions);
          break;
        default:
          toast(text, toastOptions);
      }
    } else {
      Swal.fire({
        icon: type,
        title: title,
        text: text,
        confirmButtonColor: options.confirmButtonColor || "#E41E26",
        timer: options.timer || 2500,
        showConfirmButton:
          options.showConfirmButton !== undefined
            ? options.showConfirmButton
            : false,
        ...options,
      });
    }
  };

  useEffect(() => {
    const fetchBranchesAndCities = async () => {
      try {
        const [branchesRes] = await Promise.all([
          axiosInstance.get("/api/Branches/GetAll"),
        ]);

        if (branchesRes.status === 200) {
          setBranches(branchesRes.data);
          setFilteredBranches(branchesRes.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);

        showMessage("error", "خطأ", "فشل في تحميل بيانات الفروع", {
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBranchesAndCities();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let filtered = branches;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (branch) =>
          branch.name?.toLowerCase().includes(searchLower) ||
          branch.address?.toLowerCase().includes(searchLower) ||
          branch.city?.name?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredBranches(filtered);
  }, [searchTerm, branches]);

  const convertToArabicNumbers = (number) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return number.toString().replace(/\d/g, (digit) => arabicNumbers[digit]);
  };

  const formatTimeTo12HourArabic = (timeString) => {
    if (!timeString) return "";

    try {
      const [hours, minutes] = timeString.split(":");
      let hour = parseInt(hours);
      const minute = minutes || "00";

      const period = hour >= 12 ? "م" : "ص";
      hour = hour % 12 || 12;

      const arabicHour = convertToArabicNumbers(hour);
      const arabicMinute = convertToArabicNumbers(minute);

      return `${arabicHour}:${arabicMinute} ${period}`;
    } catch (error) {
      console.error("Error formatting time:", error);
      return timeString;
    }
  };

  const getStatusText = (status) => {
    return status === "Open" ? "مفتوح الآن" : "مغلق حالياً";
  };

  const getStatusColor = (status, isActive) => {
    if (!isActive) return "bg-red-500 text-white";
    return status === "Open"
      ? "bg-green-500 text-white"
      : "bg-yellow-500 text-white";
  };

  const getStatusIcon = (status, isActive) => {
    if (!isActive) return <FaTimesCircle className="text-red-500" />;
    return status === "Open" ? (
      <FaCheckCircle className="text-green-500" />
    ) : (
      <FaTimesCircle className="text-yellow-500" />
    );
  };

  const formatTime = (timeString) => {
    if (!timeString) return "";
    return formatTimeTo12HourArabic(timeString.substring(0, 5));
  };

  const getPhoneTypeArabic = (type) => {
    switch (type) {
      case "Mobile":
        return "موبايل";
      case "Landline":
        return "أرضي";
      case "Other":
        return "آخر";
      default:
        return type;
    }
  };

  const handleViewOnMap = (branch) => {
    setSelectedBranchForMap(branch);
    setShowMapModal(true);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setSelectedBranchForMap(null);
  };

  const toggleBranchDetails = (branch) => {
    setSelectedBranch(selectedBranch?.id === branch.id ? null : branch);
  };

  const toggleReviews = (branchId) => {
    setShowReviews((prev) => ({
      ...prev,
      [branchId]: !prev[branchId],
    }));
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <FaStar key={i} className="text-yellow-500 text-sm sm:text-base" />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <FaStarHalfAlt
            key={i}
            className="text-yellow-500 text-sm sm:text-base"
          />
        );
      } else {
        stars.push(
          <FaRegStar key={i} className="text-gray-300 text-sm sm:text-base" />
        );
      }
    }
    return stars;
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    const cleanPath = imagePath.trim();

    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }

    const baseUrl = "https://restaurant-template.runasp.net/";

    const normalizedPath = cleanPath.startsWith("/")
      ? cleanPath.substring(1)
      : cleanPath;

    return `${baseUrl}${normalizedPath}`;
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4"
        dir="rtl"
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <>

      <div
        className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-6 relative font-sans overflow-hidden transition-colors duration-300"
        dir="rtl"
      >
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-10 sm:-left-20 -top-10 sm:-top-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
          <div className="absolute -right-10 sm:-right-20 -bottom-10 sm:-bottom-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        </div>

        {/* Map Modal */}
        <AnimatePresence>
          {showMapModal && selectedBranchForMap && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl md:rounded-3xl w-full max-w-2xl md:max-w-3xl lg:max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
              >
                <div className="bg-gray-50 dark:bg-gray-700 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-600 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <FaMap className="text-[#E41E26] text-lg sm:text-xl" />
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">
                      موقع {selectedBranchForMap.name}
                    </h3>
                  </div>
                  <button
                    onClick={closeMapModal}
                    className="p-1 sm:p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-300 transition-colors"
                  >
                    <FaTimes size={14} className="sm:w-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <div className="p-3 sm:p-4">
                    <div className="mb-3 sm:mb-4">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300">
                        {selectedBranchForMap.address}
                      </p>
                    </div>

                    {selectedBranchForMap.locationUrl ? (
                      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                        <iframe
                          src={selectedBranchForMap.locationUrl}
                          width="100%"
                          height="300"
                          className="h-48 sm:h-64 md:h-80 lg:h-96 w-full"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title={`خريطة فرع ${selectedBranchForMap.name}`}
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-48 sm:h-64 md:h-80 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <div className="text-center">
                          <FaMap className="text-gray-400 text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4" />
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 px-2">
                            رابط الخريطة غير متوفر لهذا الفرع
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="max-w-6xl mx-auto bg-white/90 backdrop-blur-xl shadow-lg sm:shadow-xl md:shadow-2xl rounded-xl sm:rounded-2xl md:rounded-3xl border border-white/50 relative overflow-hidden dark:bg-gray-800/90 dark:border-gray-700/50"
        >
          {/* Header */}
          <div className="relative h-32 sm:h-36 md:h-40 lg:h-44 xl:h-52 bg-gradient-to-r from-[#E41E26] to-[#FDB913] overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-32 lg:h-32 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-24 lg:h-24 bg-white/10 rounded-full"></div>

            <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-3 sm:px-4 md:px-6 pb-4 sm:pb-6 md:pb-8 lg:pb-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2 md:mb-3"
              >
                <div className="p-1.5 sm:p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-lg sm:rounded-xl md:rounded-2xl">
                  <FaBuilding className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl" />
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-white">
                  فروعنا
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-white/80 text-xs sm:text-sm md:text-base px-2"
              >
                اكتشف فروع Triple S القريبة منك وتعرّف على تفاصيل كل فرع
                وتقييمات العملاء
              </motion.p>
            </div>
          </div>

          {/* Content */}
          <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 pb-3 sm:pb-4 md:pb-6 lg:pb-8">
            {/* Filters Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mb-6 sm:mb-8 md:mb-10 lg:mb-12 mt-4 sm:mt-6 md:mt-8"
            >
              {/* Search Input Only */}
              <div className="max-w-full sm:max-w-2xl mx-auto">
                <div className="relative group">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-xs sm:text-sm transition-all duration-300 group-focus-within:scale-110" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-lg sm:rounded-xl md:rounded-2xl pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 md:py-4 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-xs sm:text-sm md:text-base shadow"
                    placeholder="ابحث باسم الفرع أو العنوان أو المدينة..."
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="text-center mt-3 sm:mt-4">
                <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm md:text-base">
                  عرض{" "}
                  <span className="font-bold text-[#E41E26]">
                    {filteredBranches.length}
                  </span>{" "}
                  من أصل{" "}
                  <span className="font-bold text-[#E41E26]">
                    {branches.length}
                  </span>{" "}
                  فرع
                </p>
              </div>
            </motion.div>

            {/* Branches List */}
            {filteredBranches.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 sm:py-12 md:py-16 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:bg-gray-700/80 dark:border-gray-600/50 my-4 sm:my-6"
              >
                <div className="max-w-md mx-auto px-3">
                  <div className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                    <FaBuilding className="text-white text-2xl sm:text-3xl md:text-4xl" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3 sm:mb-4">
                    لا توجد فروع
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg">
                    {searchTerm
                      ? "لم نتمكن من العثور على فروع تطابق بحثك"
                      : "لا توجد فروع متاحة حالياً"}
                  </p>
                  {searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSearchTerm("");
                      }}
                      className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 sm:px-8 py-2.5 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-bold hover:shadow-xl transition-all duration-300 text-sm sm:text-base md:text-lg"
                    >
                      عرض جميع الفروع
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                layout
                className="space-y-3 sm:space-y-4 md:space-y-6"
              >
                {filteredBranches.map((branch, index) => (
                  <motion.div
                    key={branch.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm dark:bg-gray-700/80 rounded-lg sm:rounded-xl md:rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200/50 dark:border-gray-600/50 overflow-hidden group relative"
                  >
                    <div className="absolute sm:hidden top-3 left-3 z-10">
                      <div
                        className={`p-1.5 rounded-lg transition-colors duration-300 ${
                          selectedBranch?.id === branch.id
                            ? "bg-[#E41E26] text-white"
                            : "bg-gray-100 dark:bg-gray-600 text-[#E41E26]"
                        }`}
                        onClick={() => toggleBranchDetails(branch)}
                      >
                        <FaEye className="text-sm" />
                      </div>
                    </div>

                    {/* Branch Header */}
                    <div
                      className="p-3 sm:p-4 md:p-6 cursor-pointer"
                      onClick={() => toggleBranchDetails(branch)}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                        {/* Branch Info */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3">
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className="p-1.5 sm:p-2 md:p-3 bg-gradient-to-r from-[#E41E26] to-[#FDB913] rounded-lg sm:rounded-xl text-white flex-shrink-0">
                                <FaBuilding className="text-sm sm:text-base md:text-lg" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-800 dark:text-gray-200 truncate pr-7 sm:pr-0">
                                    {branch.name}
                                  </h3>
                                  <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                                    <div className="flex items-center gap-1">
                                      {getStatusIcon(
                                        branch.status,
                                        branch.isActive
                                      )}
                                      <div
                                        className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                          branch.status,
                                          branch.isActive
                                        )}`}
                                      >
                                        {branch.isActive ? "نشط" : "غير نشط"}
                                      </div>
                                    </div>
                                    <div
                                      className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                        branch.status,
                                        branch.isActive
                                      )}`}
                                    >
                                      {getStatusText(branch.status)}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3">
                                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                                    <FaCity className="text-[#E41E26] text-xs sm:text-sm flex-shrink-0" />
                                    <span className="font-medium text-xs sm:text-sm md:text-base truncate">
                                      {branch.city?.name}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 sm:gap-2 text-gray-600 dark:text-gray-400">
                                    <FaClock className="text-[#E41E26] text-xs sm:text-sm flex-shrink-0" />
                                    <span className="font-medium text-xs sm:text-sm md:text-base">
                                      {formatTime(branch.openingTime)} -{" "}
                                      {formatTime(branch.closingTime)}
                                    </span>
                                  </div>
                                </div>

                                {branch.rating_Avgarage > 0 && (
                                  <div className="flex items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3 justify-start">
                                    <div className="flex items-center gap-0.5">
                                      {renderStars(branch.rating_Avgarage)}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="hidden sm:flex flex-shrink-0 self-start sm:self-center">
                          <div
                            className={`p-1.5 sm:p-2 rounded-lg transition-colors duration-300 ${
                              selectedBranch?.id === branch.id
                                ? "bg-[#E41E26] text-white"
                                : "bg-gray-100 dark:bg-gray-600 text-[#E41E26]"
                            }`}
                          >
                            <FaEye className="text-sm sm:text-base md:text-lg" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    <AnimatePresence>
                      {selectedBranch?.id === branch.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200 dark:border-gray-600"
                        >
                          <div className="p-3 sm:p-4 md:p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                              {/* Contact Information */}
                              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                                <div className="space-y-3 sm:space-y-4">
                                  <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-1.5 sm:pb-2">
                                    معلومات التواصل
                                  </h4>

                                  {/* Address */}
                                  <div className="flex items-start gap-2 sm:gap-3">
                                    <FaMapMarkerAlt className="text-[#E41E26] mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base" />
                                    <div className="flex-1 min-w-0">
                                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">
                                        العنوان
                                      </p>
                                      <p className="text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base">
                                        {branch.address}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Email */}
                                  {branch.email && (
                                    <div className="flex items-start gap-2 sm:gap-3">
                                      <FaEnvelope className="text-[#E41E26] mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base" />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">
                                          البريد الإلكتروني
                                        </p>
                                        <p className="text-gray-800 dark:text-gray-200 font-medium text-sm sm:text-base break-all">
                                          {branch.email}
                                        </p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Phone Numbers */}
                                  {branch.phoneNumbers &&
                                    branch.phoneNumbers.length > 0 && (
                                      <div className="flex items-start gap-2 sm:gap-3">
                                        <FaPhone className="text-[#E41E26] mt-0.5 sm:mt-1 flex-shrink-0 text-sm sm:text-base" />
                                        <div className="flex-1 min-w-0">
                                          <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">
                                            أرقام الهاتف
                                          </p>
                                          <div className="space-y-1.5 sm:space-y-2">
                                            {branch.phoneNumbers.map(
                                              (phone, idx) => (
                                                <div
                                                  key={idx}
                                                  className="flex items-center justify-between bg-gray-50 dark:bg-gray-600 rounded-lg px-2.5 sm:px-3 py-1.5 sm:py-2"
                                                >
                                                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                                    <span className="text-gray-800 dark:text-gray-200 font-medium text-xs sm:text-sm md:text-base truncate">
                                                      {phone.phone}
                                                    </span>
                                                    <span className="text-gray-500 dark:text-gray-400 text-xs bg-gray-200 dark:bg-gray-500 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded flex-shrink-0">
                                                      {getPhoneTypeArabic(
                                                        phone.type
                                                      )}
                                                    </span>
                                                  </div>
                                                  {phone.isWhatsapp && (
                                                    <FaWhatsapp className="text-green-500 text-base sm:text-lg md:text-xl flex-shrink-0 ml-1" />
                                                  )}
                                                </div>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                </div>

                                {/* Reviews Section */}
                                {branch.reviews &&
                                  branch.reviews.length > 0 && (
                                    <div className="space-y-3 sm:space-y-4">
                                      {/* Reviews Dropdown Header */}
                                      <div
                                        className="flex items-center justify-between cursor-pointer"
                                        onClick={() => toggleReviews(branch.id)}
                                      >
                                        <div className="flex items-center gap-2">
                                          <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            <FaCommentAlt className="text-[#E41E26]" />
                                            تقييمات العملاء
                                            <span className="text-sm font-normal text-gray-600 dark:text-gray-400">
                                              ({branch.reviews.length})
                                            </span>
                                          </h4>
                                        </div>
                                        <div>
                                          {showReviews[branch.id] ? (
                                            <FaChevronUp className="text-[#E41E26]" />
                                          ) : (
                                            <FaChevronDown className="text-[#E41E26]" />
                                          )}
                                        </div>
                                      </div>

                                      {/* Reviews Content */}
                                      <AnimatePresence>
                                        {showReviews[branch.id] && (
                                          <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{
                                              opacity: 1,
                                              height: "auto",
                                            }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4 overflow-hidden"
                                          >
                                            <div className="space-y-3 sm:space-y-4">
                                              {branch.reviews.map(
                                                (review, index) => (
                                                  <motion.div
                                                    key={review.id}
                                                    initial={{
                                                      opacity: 0,
                                                      y: 10,
                                                    }}
                                                    animate={{
                                                      opacity: 1,
                                                      y: 0,
                                                    }}
                                                    transition={{
                                                      delay: index * 0.1,
                                                    }}
                                                    className="bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-600"
                                                  >
                                                    {/* User Info */}
                                                    <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                      <div className="flex items-center gap-2 sm:gap-3">
                                                        {/* User Avatar */}
                                                        <div className="flex-shrink-0">
                                                          {review.user
                                                            ?.imageUrl ? (
                                                            <img
                                                              src={getImageUrl(
                                                                review.user
                                                                  .imageUrl
                                                              )}
                                                              alt={`${
                                                                review.user
                                                                  .firstName ||
                                                                ""
                                                              } ${
                                                                review.user
                                                                  .lastName ||
                                                                ""
                                                              }`}
                                                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                                              onError={(e) => {
                                                                e.target.onerror =
                                                                  null;
                                                                e.target.src =
                                                                  "";
                                                                e.target.className =
                                                                  "hidden";
                                                              }}
                                                            />
                                                          ) : (
                                                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#E41E26] to-[#FDB913] flex items-center justify-center">
                                                              <FaUserCircle className="text-white text-lg sm:text-xl" />
                                                            </div>
                                                          )}
                                                        </div>

                                                        {/* User Details */}
                                                        <div className="flex-1 min-w-0">
                                                          <p className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200">
                                                            {
                                                              review.user
                                                                ?.firstName
                                                            }{" "}
                                                            {
                                                              review.user
                                                                ?.lastName
                                                            }
                                                          </p>
                                                          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">
                                                            {review.user?.email}
                                                          </p>
                                                        </div>
                                                      </div>

                                                      <div className="flex-shrink-0">
                                                        <div
                                                          className="flex items-center gap-0.5"
                                                          dir="ltr"
                                                        >
                                                          {renderStars(
                                                            review.rating
                                                          )}
                                                        </div>
                                                      </div>
                                                    </div>

                                                    {/* Comment */}
                                                    {review.comment && (
                                                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                                                        <div className="flex items-start gap-2">
                                                          <FaCommentAlt className="text-[#E41E26] mt-0.5 text-xs sm:text-sm flex-shrink-0" />
                                                          <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                                                            {review.comment}
                                                          </p>
                                                        </div>
                                                      </div>
                                                    )}
                                                  </motion.div>
                                                )
                                              )}
                                            </div>
                                          </motion.div>
                                        )}
                                      </AnimatePresence>
                                    </div>
                                  )}
                              </div>

                              {/* Map & Actions */}
                              <div className="space-y-4 sm:space-y-6">
                                <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-600 pb-1.5 sm:pb-2">
                                  الموقع والخدمات
                                </h4>

                                {/* Status Card */}
                                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-600 dark:to-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-4">
                                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-center">
                                    <div className="text-center">
                                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">
                                        حالة الفرع
                                      </p>
                                      <div className="flex items-center justify-center gap-1">
                                        {getStatusIcon(
                                          branch.status,
                                          branch.isActive
                                        )}
                                        <div
                                          className={`px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                            branch.status,
                                            branch.isActive
                                          )}`}
                                        >
                                          {branch.isActive ? "نشط" : "غير نشط"}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1">
                                        ساعات العمل
                                      </p>
                                      <p className="text-gray-800 dark:text-gray-200 font-bold text-xs sm:text-sm md:text-base">
                                        {formatTime(branch.openingTime)} -{" "}
                                        {formatTime(branch.closingTime)}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {branch.locationUrl && (
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleViewOnMap(branch)}
                                    className="w-full py-2.5 sm:py-3 md:py-4 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base md:text-lg"
                                  >
                                    <FaMap className="text-xs sm:text-sm" />
                                    <span>عرض الخريطة</span>
                                  </motion.button>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Branches;
