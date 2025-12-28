import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaPlus, FaBuilding } from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { useBranches } from "../hooks/useBranches";
import Header from "../components/adminUsers/Header";
import BranchCard from "../components/adminBranchs/BranchCard";
import SearchBar from "../components/adminUsers/SearchBar";
import BranchForm from "../components/adminBranchs/BranchForm";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { translateErrorMessageAdminBranches } from "../utils/ErrorTranslator";

const adjustTimeForBackend = (timeString) => {
  if (!timeString) return "";

  const convert12to24 = (time12) => {
    if (!time12) return "";

    const time = time12.trim();
    let hours, minutes, period;

    if (time.includes("ص") || time.includes("م")) {
      const match = time.match(/(\d{1,2}):(\d{2})\s*(ص|م)/);
      if (match) {
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        period = match[3];
      }
    } else if (time.includes("AM") || time.includes("PM")) {
      const match = time.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (match) {
        hours = parseInt(match[1]);
        minutes = parseInt(match[2]);
        period = match[3].toUpperCase() === "AM" ? "ص" : "م";
      }
    } else {
      const [h, m] = time.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        return time;
      }
    }

    if (isNaN(hours) || isNaN(minutes)) return "";

    if (period === "م" && hours < 12) {
      hours += 12;
    } else if (period === "ص" && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const time24 = convert12to24(timeString);
  if (!time24) return "";

  const [hours, minutes] = time24.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setHours(date.getHours() - 2);

  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const adjustTimeFromBackend = (timeString) => {
  if (!timeString) return "";

  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  date.setHours(date.getHours() + 2);

  return `${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

const convert24To12HourFormat = (time24) => {
  if (!time24) return "";

  const [hours, minutes] = time24.split(":").map(Number);

  if (isNaN(hours) || isNaN(minutes)) return time24;

  const period = hours >= 12 ? "م" : "ص";
  const hours12 = hours % 12 || 12;

  return `${hours12.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")} ${period}`;
};

const convertErrorObjectToText = (errorMessages) => {
  if (!errorMessages || typeof errorMessages !== "object") {
    return "حدث خطأ غير معروف";
  }

  if (Array.isArray(errorMessages)) {
    return errorMessages.join("، ");
  }

  const allMessages = [];

  Object.keys(errorMessages).forEach((field) => {
    const messages = errorMessages[field];
    if (Array.isArray(messages)) {
      messages.forEach((msg) => {
        allMessages.push(msg);
      });
    } else if (typeof messages === "string") {
      allMessages.push(messages);
    }
  });

  if (allMessages.length === 0) {
    return "حدث خطأ غير معروف";
  }

  return allMessages.join("، ");
};

const showMobileMessage = (type, title, text) => {
  if (window.innerWidth < 768) {
    const message = text || title;

    if (type === "success") {
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
    } else if (type === "error") {
      toast.error(message, {
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
    } else if (type === "info") {
      toast.info(message, {
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
    } else if (type === "warning") {
      toast.warning(message, {
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
    return true;
  }
  return false;
};

const showErrorAlert = (errorMessages) => {
  const errorText = convertErrorObjectToText(errorMessages);

  const isMobile = showMobileMessage("error", "خطأ", errorText);

  if (!isMobile) {
    if (!errorMessages || typeof errorMessages !== "object") {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        html: `<div style="text-align: right; direction: rtl; margin-bottom: 8px; padding-right: 15px; position: relative; font-weight: semibold;">
                <span style="position: absolute; right: 0; top: 0;">-</span>
                حدث خطأ غير معروف
              </div>`,
        timer: 2500,
        showConfirmButton: false,
      });
      return;
    }

    const allMessages = [];

    Object.keys(errorMessages).forEach((field) => {
      const messages = errorMessages[field];
      if (Array.isArray(messages)) {
        messages.forEach((msg) => {
          allMessages.push(msg);
        });
      }
    });

    if (allMessages.length === 0) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        html: `<div style="text-align: right; direction: rtl; margin-bottom: 8px; padding-right: 15px; position: relative; font-weight: semibold;">
                <span style="position: absolute; right: 0; top: 0;">-</span>
                حدث خطأ غير معروف
              </div>`,
        timer: 2500,
        showConfirmButton: false,
      });
      return;
    }

    const htmlMessages = allMessages.map(
      (msg) => `
      <div style="
        direction: rtl;
        text-align: right;
        margin-bottom: 8px;
        padding-right: 15px;
        position: relative;
        font-weight: semibold;
      ">
        <span style="position: absolute; right: 0; top: 0;">-</span>
        ${msg}
      </div>`
    );

    Swal.fire({
      icon: "error",
      title: "خطأ في البيانات",
      html: htmlMessages.join(""),
      timer: 2500,
      showConfirmButton: false,
    });
  }
};

export default function AdminBranches() {
  const navigate = useNavigate();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    locationUrl: "",
    status: "Open",
    openingTime: "",
    closingTime: "",
    isActive: true,
    cityId: "",
    managerId: "",
    phoneNumbers: [],
  });

  const {
    branches,
    cities,
    managers,
    isLoading: isLoadingData,
    addBranch,
    updateBranch,
    toggleBranchActive,
  } = useBranches();

  const [filteredBranches, setFilteredBranches] = useState([]);

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

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        const profileRes = await axiosInstance.get("/api/Account/Profile");
        const userRoles = profileRes.data.roles;

        if (!userRoles || !userRoles.includes("Admin")) {
          const isMobile = showMobileMessage(
            "error",
            "تم الرفض",
            "ليس لديك صلاحية للوصول إلى هذه الصفحة."
          );

          if (!isMobile) {
            Swal.fire({
              icon: "error",
              title: "تم الرفض",
              text: "ليس لديك صلاحية للوصول إلى هذه الصفحة.",
              confirmButtonColor: "#E41E26",
              timer: 2500,
              showConfirmButton: false,
            });
          }

          setTimeout(() => {
            navigate("/");
          }, 2500);
          return;
        }

        setIsAdmin(true);
      } catch (err) {
        console.error("Failed to verify admin access", err);

        const errorObj = translateErrorMessageAdminBranches(err.response?.data);
        const errorText = convertErrorObjectToText(errorObj);

        const isMobile = showMobileMessage(
          "error",
          "تم الرفض",
          errorText || "فشل في التحقق من صلاحياتك."
        );

        if (!isMobile) {
          Swal.fire({
            icon: "error",
            title: "تم الرفض",
            text: errorText || "فشل في التحقق من صلاحياتك.",
            confirmButtonColor: "#E41E26",
            timer: 2500,
            showConfirmButton: false,
          });
        }

        setTimeout(() => {
          navigate("/");
        }, 2500);
      } finally {
        setIsLoadingAuth(false);
      }
    };

    checkAdminAndFetchData();
  }, [navigate]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredBranches(branches);
      return;
    }

    const filtered = branches.filter((branch) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        branch.name?.toLowerCase().includes(searchLower) ||
        branch.address?.toLowerCase().includes(searchLower) ||
        branch.email?.toLowerCase().includes(searchLower) ||
        branch.city?.name?.toLowerCase().includes(searchLower) ||
        branch.phoneNumbers?.some((phone) => phone.phone?.includes(searchTerm))
      );
    });

    setFilteredBranches(filtered);
  }, [searchTerm, branches]);

  const handleAddNewBranch = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      name: "",
      email: "",
      address: "",
      locationUrl: "",
      status: "Open",
      openingTime: "",
      closingTime: "",
      isActive: true,
      cityId: "",
      managerId: "",
      phoneNumbers: [],
    });

    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById("branch-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleEdit = (branch) => {
    const openingTime24 = branch.openingTime
      ? adjustTimeFromBackend(branch.openingTime)
      : "";
    const closingTime24 = branch.closingTime
      ? adjustTimeFromBackend(branch.closingTime)
      : "";

    setFormData({
      name: branch.name || "",
      email: branch.email || "",
      address: branch.address || "",
      locationUrl: branch.locationUrl || "",
      status: branch.status || "Open",
      openingTime: convert24To12HourFormat(openingTime24),
      closingTime: convert24To12HourFormat(closingTime24),
      isActive: branch.isActive !== undefined ? branch.isActive : true,
      cityId: branch.city?.id || "",
      managerId: branch.managerId || "",
      phoneNumbers: branch.phoneNumbers
        ? branch.phoneNumbers.map((phone) => ({
            phone: phone.phone,
            type: phone.type,
            isWhatsapp: phone.type === "Mobile" ? phone.isWhatsapp : false,
          }))
        : [],
    });
    setEditingId(branch.id);
    setIsAdding(true);

    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById("branch-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleToggleActive = async (branchId, currentStatus) => {
    try {
      await toggleBranchActive(branchId);

      const isMobile = showMobileMessage(
        "success",
        "تم تحديث الحالة",
        `تم ${currentStatus ? "تعطيل" : "تفعيل"} الفرع.`
      );

      if (!isMobile) {
        Swal.fire({
          icon: "success",
          title: "تم تحديث الحالة",
          text: `تم ${currentStatus ? "تعطيل" : "تفعيل"} الفرع.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (errorMessages) {
      showErrorAlert(errorMessages);
    }
  };

  const handleSubmit = async (submitData) => {
    const processedData = {
      ...submitData,
      openingTime: submitData.openingTime
        ? adjustTimeForBackend(submitData.openingTime)
        : "",
      closingTime: submitData.closingTime
        ? adjustTimeForBackend(submitData.closingTime)
        : "",
      phoneNumbers: submitData.phoneNumbers.map((phone) => ({
        phone: phone.phone,
        type: phone.type,
        isWhatsapp: phone.type === "Mobile" ? phone.isWhatsapp : false,
      })),
    };

    if (!processedData.locationUrl.trim()) {
      delete processedData.locationUrl;
    }

    try {
      if (editingId) {
        await updateBranch(editingId, processedData);

        const isMobile = showMobileMessage(
          "success",
          "تم تحديث الفرع",
          "تم تحديث الفرع بنجاح."
        );

        if (!isMobile) {
          Swal.fire({
            icon: "success",
            title: "تم تحديث الفرع",
            text: "تم تحديث الفرع بنجاح.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else {
        await addBranch(processedData);

        const isMobile = showMobileMessage(
          "success",
          "تم إضافة الفرع",
          "تم إضافة الفرع الجديد بنجاح."
        );

        if (!isMobile) {
          Swal.fire({
            icon: "success",
            title: "تم إضافة الفرع",
            text: "تم إضافة الفرع الجديد بنجاح.",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }
      resetForm();
    } catch (errorMessages) {
      showErrorAlert(errorMessages);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      address: "",
      locationUrl: "",
      status: "Open",
      openingTime: "",
      closingTime: "",
      isActive: true,
      cityId: "",
      managerId: "",
      phoneNumbers: [],
    });
    setEditingId(null);
    setIsAdding(false);
  };

  if (isLoadingAuth || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 md:px-6 py-3 sm:py-6 relative font-sans overflow-hidden"
      dir="rtl"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 sm:-left-20 -top-10 sm:-top-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute -right-10 sm:-right-20 -bottom-10 sm:-bottom-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
      </div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="fixed top-3 sm:top-4 left-3 sm:left-4 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md hover:bg-[#E41E26] hover:text-white rounded-full p-2 sm:p-3 text-[#E41E26] dark:text-gray-300 border border-[#E41E26]/30 dark:border-gray-600 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group"
      >
        <FaArrowLeft
          size={14}
          className="sm:size-4 group-hover:scale-110 transition-transform"
        />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-7xl mx-auto bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl border border-white/50 dark:border-gray-700/50 relative overflow-hidden"
      >
        <Header title="لوحة التحكم" subtitle="إدارة فروع المطعم" />

        <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center -mt-6 sm:-mt-7 md:-mt-8 mb-6 sm:mb-8 md:mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNewBranch}
              className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-2xl sm:shadow-3xl hover:shadow-4xl hover:shadow-[#E41E26]/50 transition-all duration-300 text-sm sm:text-base md:text-lg border-2 border-white whitespace-nowrap transform translate-y-2"
            >
              <FaPlus className="text-sm sm:text-base md:text-lg" />
              <span>إضافة فرع جديد</span>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <SearchBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="البحث بالاسم، العنوان، البريد الإلكتروني، المدينة، أو رقم الهاتف..."
            />
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <div
              className={`space-y-3 sm:space-y-4 md:space-y-5 ${
                isAdding ? "xl:col-span-2" : "xl:col-span-3"
              }`}
            >
              {filteredBranches.map((branch, index) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  onEdit={handleEdit}
                  onToggleActive={handleToggleActive}
                  getPhoneTypeArabic={getPhoneTypeArabic}
                  adjustTimeFromBackend={adjustTimeFromBackend}
                />
              ))}

              {filteredBranches.length === 0 && !isAdding && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 sm:py-10 md:py-12 bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50 dark:border-gray-600/50"
                >
                  <FaBuilding className="mx-auto text-3xl sm:text-4xl md:text-5xl text-gray-400 dark:text-gray-500 mb-3 sm:mb-4" />
                  <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
                    {searchTerm
                      ? "لم يتم العثور على فروع"
                      : "لم يتم العثور على فروع"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
                    {searchTerm
                      ? "حاول تعديل مصطلحات البحث"
                      : "ابدأ بإضافة أول فرع لك"}
                  </p>
                  {!searchTerm && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddNewBranch}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                    >
                      <FaPlus className="text-xs sm:text-sm" />
                      <span>أضف أول فرع لك</span>
                    </motion.button>
                  )}
                </motion.div>
              )}
            </div>

            <AnimatePresence>
              {isAdding && (
                <BranchForm
                  formData={formData}
                  setFormData={setFormData}
                  cities={cities}
                  managers={managers}
                  onSubmit={handleSubmit}
                  onCancel={resetForm}
                  isEditing={!!editingId}
                  openDropdown={openDropdown}
                  setOpenDropdown={setOpenDropdown}
                  convert24To12HourFormat={convert24To12HourFormat}
                  adjustTimeFromBackend={adjustTimeFromBackend}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
