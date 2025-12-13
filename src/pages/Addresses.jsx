import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPlus,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaStar,
  FaCheck,
  FaTimes,
  FaPhone,
  FaCity,
  FaRoad,
  FaBuilding as FaBuildingIcon,
  FaChevronDown,
  FaTag,
  FaMap,
  FaExternalLinkAlt,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "390px",
};

const defaultCenter = {
  lat: 30.0444,
  lng: 31.2357,
};

const libraries = ["places"];

export default function Addresses() {
  const navigate = useNavigate();
  const location = useLocation();
  const [addresses, setAddresses] = useState([]);
  const [cities, setCities] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [expandedMaps, setExpandedMaps] = useState({});

  const [formData, setFormData] = useState({
    cityId: "",
    locationUrl: "",
    streetName: "",
    phoneNumber: "",
    buildingNumber: "",
    floorNumber: "",
    flatNumber: "",
    detailedDescription: "",
  });

  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (menu) =>
    setOpenDropdown(openDropdown === menu ? null : menu);

  const toggleMapVisibility = (addressId) => {
    setExpandedMaps((prev) => ({
      ...prev,
      [addressId]: !prev[addressId],
    }));
  };

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedDarkMode = localStorage.getItem("darkMode");
      if (savedDarkMode) {
        setDarkMode(JSON.parse(savedDarkMode));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    const interval = setInterval(handleStorageChange, 1000);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    fetchAddresses();
    fetchCities();
  }, []);

  useEffect(() => {
    if (location.state?.fromCart) {
      console.log("Came from cart page");
    }
  }, [location.state]);

  const fetchAddresses = async () => {
    try {
      setIsLoading(true);
      const res = await axiosInstance.get("/api/Locations/GetAllForUser");
      if (res.status === 200) {
        setAddresses(res.data);
        const initialExpandedState = {};
        res.data.forEach((address) => {
          initialExpandedState[address.id] = false;
        });
        setExpandedMaps(initialExpandedState);
      }
    } catch (err) {
      console.error("Failed to fetch addresses", err);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحميل العناوين",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await axiosInstance.get("/api/Cities/GetAll");
      if (res.status === 200) {
        setCities(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch cities", err);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحميل المدن",
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (
      name === "buildingNumber" ||
      name === "floorNumber" ||
      name === "flatNumber"
    ) {
      const numValue = parseInt(value);
      if (value === "" || numValue > 0) {
        setFormData({
          ...formData,
          [name]: value,
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const generateEmbedUrl = (lat, lng) => {
    const apiKey = "AIzaSyC9UUx3lHra53Dbx5rcZdWSBsSxUaPZDa4";
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=18`;
  };

  const handleMapClick = useCallback((event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();

    setSelectedLocation({ lat, lng });

    const embedUrl = generateEmbedUrl(lat, lng);

    setFormData((prev) => ({
      ...prev,
      locationUrl: embedUrl,
    }));

    Swal.fire({
      icon: "success",
      title: "تم اختيار الموقع",
      text: "تم إضافة رابط الخريطة تلقائياً",
      timer: 2000,
      showConfirmButton: false,
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = { ...formData };

      if (!submitData.locationUrl || submitData.locationUrl.trim() === "") {
        delete submitData.locationUrl;
      }

      const formattedData = {
        ...submitData,
        cityId: parseInt(submitData.cityId),
        buildingNumber: parseInt(submitData.buildingNumber) || 0,
        floorNumber: parseInt(submitData.floorNumber) || 0,
        flatNumber: parseInt(submitData.flatNumber) || 0,
      };

      if (editingId) {
        const res = await axiosInstance.put(
          `/api/Locations/Update/${editingId}`,
          formattedData
        );
        if (res.status === 200) {
          setAddresses(
            addresses.map((addr) =>
              addr.id === editingId ? { ...addr, ...formattedData } : addr
            )
          );
          Swal.fire({
            icon: "success",
            title: "تم تحديث العنوان",
            text: "تم تحديث عنوانك بنجاح",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      } else {
        const res = await axiosInstance.post(
          "/api/Locations/Add",
          formattedData
        );
        if (res.status === 200) {
          fetchAddresses();
          Swal.fire({
            icon: "success",
            title: "تم إضافة العنوان",
            text: "تم إضافة عنوانك الجديد بنجاح",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }

      resetForm();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: err.response?.data?.message || "فشل في حفظ العنوان",
      });
    }
  };

  const handleEdit = (address) => {
    setFormData({
      cityId: address.city.id.toString(),
      locationUrl: address.locationUrl || "",
      streetName: address.streetName || "",
      phoneNumber: address.phoneNumber || "",
      buildingNumber: address.buildingNumber?.toString() || "",
      floorNumber: address.floorNumber?.toString() || "",
      flatNumber: address.flatNumber?.toString() || "",
      detailedDescription: address.detailedDescription || "",
    });
    setEditingId(address.id);
    setIsAdding(true);
    setShowMapModal(false);
    setSelectedLocation(null);

    setTimeout(() => {
      const formElement = document.getElementById("address-form");
      if (formElement && window.innerWidth < 1280) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/Locations/Delete/${id}`);
          setAddresses(addresses.filter((addr) => addr.id !== id));
          Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف عنوانك",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف العنوان",
          });
        }
      }
    });
  };

  const handleSetDefault = async (id) => {
    try {
      await axiosInstance.put(`/api/Locations/ChangeDefaultLocation/${id}`);
      setAddresses(
        addresses.map((addr) => ({
          ...addr,
          isDefaultLocation: addr.id === id,
        }))
      );

      Swal.fire({
        icon: "success",
        title: "تم تحديث العنوان الافتراضي",
        text: "تم تغيير عنوانك الافتراضي",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        if (location.state?.fromCart) {
          navigate("/cart", { state: { fromAddresses: true } });
        }
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تعيين العنوان الافتراضي",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      cityId: "",
      locationUrl: "",
      streetName: "",
      phoneNumber: "",
      buildingNumber: "",
      floorNumber: "",
      flatNumber: "",
      detailedDescription: "",
    });
    setEditingId(null);
    setIsAdding(false);
    setOpenDropdown(null);
    setShowMapModal(false);
    setSelectedLocation(null);
  };

  const handleAddNewAddress = () => {
    setIsAdding(true);
    setShowMapModal(false);
    setSelectedLocation(null);

    setTimeout(() => {
      const formElement = document.getElementById("address-form");
      if (formElement && window.innerWidth < 1280) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const openMapModal = () => {
    setShowMapModal(true);
    setMapLoaded(false);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const embedUrl = generateEmbedUrl(lat, lng);
          setSelectedLocation({ lat, lng });
          setFormData((prev) => ({ ...prev, locationUrl: embedUrl }));
        },
        (error) => {
          console.warn("خطأ في تحديد الموقع:", error);
          setSelectedLocation(defaultCenter);
        },
        { enableHighAccuracy: true }
      );
    } else {
      setSelectedLocation(defaultCenter);
    }
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setMapLoaded(false);
  };

  const confirmLocation = () => {
    if (selectedLocation) {
      closeMapModal();
      Swal.fire({
        icon: "success",
        title: "تم تأكيد الموقع",
        text: "تم حفظ موقعك بنجاح",
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "تحذير",
        text: "يرجى اختيار موقع من الخريطة أولاً",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleMapLoad = () => {
    setMapLoaded(true);
  };

  const isFormValid = () => {
    const requiredFields = [
      "cityId",
      "streetName",
      "phoneNumber",
      "buildingNumber",
      "floorNumber",
      "flatNumber",
      "detailedDescription",
    ];

    return requiredFields.every(
      (field) => formData[field] && formData[field].toString().trim() !== ""
    );
  };

  const getAddressTypeColor = () => {
    return "from-gray-500/10 to-gray-600/10 border-gray-200 dark:from-gray-500/20 dark:to-gray-600/20 dark:border-gray-700";
  };

  if (isLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          darkMode
            ? "dark bg-gray-900"
            : "bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4]"
        } px-4`}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode
          ? "dark bg-gray-900"
          : "bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4]"
      } px-3 sm:px-4 md:px-6 py-3 sm:py-6 relative font-sans overflow-hidden transition-colors duration-300`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 sm:-left-20 -top-10 sm:-top-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute -right-10 sm:-right-20 -bottom-10 sm:-bottom-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
      </div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className={`fixed top-3 sm:top-4 left-3 sm:left-4 z-50 ${
          darkMode
            ? "bg-gray-800/80 text-white border-gray-600 hover:bg-[#E41E26]"
            : "bg-white/80 text-[#E41E26] border-[#E41E26]/30 hover:bg-[#E41E26] hover:text-white"
        } backdrop-blur-md rounded-full p-2 sm:p-3 border shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group`}
      >
        <FaArrowLeft
          size={14}
          className="sm:size-4 group-hover:scale-110 transition-transform"
        />
      </motion.button>

      <AnimatePresence>
        {showMapModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`${
                darkMode ? "bg-gray-800" : "bg-white"
              } rounded-2xl sm:rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col`}
            >
              <div
                className={`${
                  darkMode ? "bg-gray-700" : "bg-gray-50"
                } px-6 py-4 border-b ${
                  darkMode ? "border-gray-600" : "border-gray-200"
                } flex items-center justify-between flex-shrink-0`}
              >
                <div className="flex items-center gap-3">
                  <FaMap className="text-[#E41E26] text-xl" />
                  <h3
                    className={`text-lg font-bold ${
                      darkMode ? "text-white" : "text-gray-800"
                    }`}
                  >
                    اختر موقعك من الخريطة
                  </h3>
                </div>
                <button
                  onClick={closeMapModal}
                  className={`p-2 rounded-full ${
                    darkMode
                      ? "hover:bg-gray-600 text-gray-300"
                      : "hover:bg-gray-200 text-gray-500"
                  } transition-colors`}
                >
                  <FaTimes size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4">
                  <div className="mb-4">
                    <p
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      انقر على الخريطة لتحديد موقعك بدقة
                    </p>
                  </div>

                  {!mapLoaded && (
                    <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-[#E41E26] mx-auto mb-4"></div>
                        <p
                          className={`text-sm ${
                            darkMode ? "text-gray-300" : "text-gray-600"
                          }`}
                        >
                          جاري تحميل الخريطة...
                        </p>
                      </div>
                    </div>
                  )}

                  <LoadScript
                    googleMapsApiKey="AIzaSyC9UUx3lHra53Dbx5rcZdWSBsSxUaPZDa4"
                    libraries={libraries}
                    onLoad={() => setMapLoaded(true)}
                    onError={() => {
                      setMapLoaded(false);
                      Swal.fire({
                        icon: "error",
                        title: "خطأ في تحميل الخريطة",
                        text: "يرجى المحاولة مرة أخرى",
                        timer: 3000,
                        showConfirmButton: false,
                      });
                    }}
                  >
                    {mapLoaded && (
                      <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={selectedLocation || defaultCenter}
                        zoom={12}
                        onClick={handleMapClick}
                        onLoad={handleMapLoad}
                      >
                        {selectedLocation && (
                          <Marker position={selectedLocation} />
                        )}
                      </GoogleMap>
                    )}
                  </LoadScript>

                  {selectedLocation && (
                    <div
                      className={`mt-4 p-4 rounded-lg ${
                        darkMode
                          ? "bg-green-900/20 border border-green-800"
                          : "bg-green-50 border border-green-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <p
                            className={`text-sm font-medium ${
                              darkMode ? "text-green-300" : "text-green-700"
                            }`}
                          >
                            ✓ الموقع المختار
                          </p>
                          <p
                            className={`text-xs ${
                              darkMode ? "text-green-400" : "text-green-600"
                            }`}
                          >
                            خط العرض: {selectedLocation.lat.toFixed(6)} | خط
                            الطول: {selectedLocation.lng.toFixed(6)}
                          </p>
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={confirmLocation}
                          className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 py-3 rounded-lg font-semibold text-sm hover:shadow-lg transition-all duration-200 flex items-center gap-2 whitespace-nowrap flex-shrink-0"
                        >
                          <FaCheck className="text-sm" />
                          تأكيد الموقع
                        </motion.button>
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
        className={`max-w-7xl mx-auto ${
          darkMode
            ? "bg-gray-800/90 border-gray-700"
            : "bg-white/90 border-white/50"
        } backdrop-blur-xl shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl border relative overflow-hidden transition-colors duration-300`}
      >
        <div className="relative h-36 sm:h-40 md:h-44 lg:h-52 bg-gradient-to-r from-[#E41E26] to-[#FDB913] overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-white/10 rounded-full"></div>
          <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 bg-white/10 rounded-full"></div>

          <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-4 sm:px-6 pb-6 sm:pb-8 md:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3"
            >
              <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
                <FaMapMarkerAlt className="text-white text-xl sm:text-2xl md:text-3xl" />
              </div>
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
                عناويني
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mb-2 sm:mb-3"
            >
              إدارة عناوين التوصيل الخاصة بك
            </motion.p>
          </div>
        </div>

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
              onClick={handleAddNewAddress}
              className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-2xl sm:shadow-3xl hover:shadow-4xl hover:shadow-[#E41E26]/50 transition-all duration-300 text-sm sm:text-base md:text-lg border-2 border-white whitespace-nowrap transform translate-y-2"
            >
              <FaPlus className="text-sm sm:text-base md:text-lg" />
              <span>إضافة عنوان جديد</span>
            </motion.button>
          </motion.div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <div
              className={`space-y-3 sm:space-y-4 md:space-y-5 ${
                isAdding ? "xl:col-span-2" : "xl:col-span-3"
              }`}
            >
              <AnimatePresence>
                {addresses.map((address, index) => (
                  <motion.div
                    key={address.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`${
                      darkMode
                        ? "bg-gray-700/80 border-gray-600"
                        : "bg-white/80 border-gray-200/50"
                    } backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 transition-all duration-300 hover:shadow-lg ${
                      address.isDefaultLocation
                        ? `border-[#E41E26] ${
                            darkMode
                              ? "bg-gradient-to-r from-gray-800 to-gray-700"
                              : "bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4]"
                          }`
                        : ""
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                          <div
                            className={`p-1 sm:p-2 rounded-lg sm:rounded-xl bg-gradient-to-r ${getAddressTypeColor()} border`}
                          >
                            <FaMapMarkerAlt className="text-[#E41E26]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h3
                                className={`font-bold ${
                                  darkMode ? "text-white" : "text-gray-800"
                                } text-base sm:text-lg md:text-xl truncate`}
                              >
                                {address.city.name}
                              </h3>
                              {address.isDefaultLocation && (
                                <span className="bg-[#E41E26] text-white text-xs px-2 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1 self-start sm:self-center">
                                  <FaStar className="text-xs" />
                                  افتراضي
                                </span>
                              )}
                            </div>
                            <p
                              className={`${
                                darkMode ? "text-gray-300" : "text-gray-600"
                              } text-xs sm:text-sm capitalize truncate mt-1`}
                            >
                              {address.streetName}
                            </p>
                          </div>
                        </div>

                        <div
                          className={`space-y-1 sm:space-y-2 ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } text-sm sm:text-base`}
                        >
                          <p className="truncate">{address.phoneNumber}</p>
                          <p className="truncate">
                            {address.streetName}, مبنى رقم{" "}
                            {address.buildingNumber}
                          </p>
                          {(address.floorNumber || address.flatNumber) && (
                            <p className="truncate">
                              الدور {address.floorNumber}, شقة{" "}
                              {address.flatNumber}
                            </p>
                          )}
                          {address.detailedDescription && (
                            <p className="truncate">
                              {address.detailedDescription}
                            </p>
                          )}
                        </div>

                        {address.locationUrl && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{
                              opacity: expandedMaps[address.id] ? 1 : 0,
                              height: expandedMaps[address.id] ? "auto" : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="mt-3 sm:mt-4 overflow-hidden"
                          >
                            {expandedMaps[address.id] && (
                              <div className="rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600">
                                <iframe
                                  src={address.locationUrl}
                                  width="100%"
                                  height="200"
                                  style={{ border: 0 }}
                                  allowFullScreen=""
                                  loading="lazy"
                                  referrerPolicy="no-referrer-when-downgrade"
                                  title={`خريطة موقع ${address.streetName}`}
                                  className="w-full"
                                />
                              </div>
                            )}
                          </motion.div>
                        )}

                        {address.locationUrl && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="mt-3 sm:mt-4"
                          >
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => toggleMapVisibility(address.id)}
                              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 ${
                                darkMode
                                  ? expandedMaps[address.id]
                                    ? "bg-gray-600 text-gray-200 hover:bg-gray-500"
                                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                                  : expandedMaps[address.id]
                                  ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              } border ${
                                darkMode ? "border-gray-600" : "border-gray-200"
                              }`}
                            >
                              {expandedMaps[address.id] ? (
                                <>
                                  <FaEyeSlash className="text-xs sm:text-sm" />
                                  <span>إخفاء الخريطة</span>
                                </>
                              ) : (
                                <>
                                  <FaEye className="text-xs sm:text-sm" />
                                  <span>عرض الخريطة</span>
                                </>
                              )}
                            </motion.button>
                          </motion.div>
                        )}
                      </div>

                      <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 justify-end sm:justify-start">
                        {!address.isDefaultLocation && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleSetDefault(address.id)}
                            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 ${
                              darkMode
                                ? "bg-green-900/50 text-green-300 hover:bg-green-800"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            } rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center`}
                          >
                            <FaStar className="text-xs sm:text-sm" />
                            <span className="whitespace-nowrap hidden xs:inline">
                              تعيين افتراضي
                            </span>
                            <span className="whitespace-nowrap xs:hidden">
                              افتراضي
                            </span>
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEdit(address)}
                          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 ${
                            darkMode
                              ? "bg-blue-900/50 text-blue-300 hover:bg-blue-800"
                              : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                          } rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center`}
                        >
                          <FaEdit className="text-xs sm:text-sm" />
                          <span className="whitespace-nowrap">تعديل</span>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDelete(address.id)}
                          className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 ${
                            darkMode
                              ? "bg-red-900/50 text-red-300 hover:bg-red-800"
                              : "bg-red-50 text-red-700 hover:bg-red-100"
                          } rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center`}
                        >
                          <FaTrash className="text-xs sm:text-sm" />
                          <span className="whitespace-nowrap">حذف</span>
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {addresses.length === 0 && !isAdding && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center py-8 sm:py-10 md:py-12 ${
                    darkMode
                      ? "bg-gray-700/80 border-gray-600"
                      : "bg-white/80 border-gray-200/50"
                  } backdrop-blur-sm rounded-xl sm:rounded-2xl border`}
                >
                  <FaMapMarkerAlt
                    className={`mx-auto text-3xl sm:text-4xl md:text-5xl ${
                      darkMode ? "text-gray-500" : "text-gray-400"
                    } mb-3 sm:mb-4`}
                  />
                  <h3
                    className={`text-lg sm:text-xl md:text-2xl font-semibold ${
                      darkMode ? "text-gray-300" : "text-gray-600"
                    } mb-2 sm:mb-3`}
                  >
                    لا توجد عناوين حتى الآن
                  </h3>
                  <p
                    className={`${
                      darkMode ? "text-gray-400" : "text-gray-500"
                    } text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto`}
                  >
                    أضف عنوانك الأول للبدء
                  </p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddNewAddress}
                    className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
                  >
                    <FaPlus className="text-xs sm:text-sm" />
                    <span>أضف عنوانك الأول</span>
                  </motion.button>
                </motion.div>
              )}
            </div>

            <AnimatePresence>
              {isAdding && (
                <motion.div
                  id="address-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="xl:col-span-1"
                >
                  <div
                    className={`${
                      darkMode
                        ? "bg-gray-700/80 border-gray-600"
                        : "bg-white/80 border-gray-200/50"
                    } backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border shadow-lg sticky top-4 sm:top-6 transition-colors duration-300`}
                  >
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <h3
                        className={`text-base sm:text-lg md:text-xl font-bold ${
                          darkMode ? "text-white" : "text-gray-800"
                        } truncate`}
                      >
                        {editingId ? "تعديل العنوان" : "إضافة عنوان جديد"}
                      </h3>
                      <button
                        onClick={resetForm}
                        className={`${
                          darkMode
                            ? "text-gray-400 hover:text-[#FDB913]"
                            : "text-gray-500 hover:text-[#E41E26]"
                        } transition-colors duration-200 flex-shrink-0 ml-2`}
                      >
                        <FaTimes size={16} className="sm:size-5" />
                      </button>
                    </div>

                    <form
                      onSubmit={handleSubmit}
                      className="space-y-3 sm:space-y-4"
                    >
                      <div>
                        <label
                          className={`block text-xs sm:text-sm font-semibold ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-1 sm:mb-2`}
                        >
                          المدينة *
                        </label>
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => toggleDropdown("city")}
                            className={`w-full flex items-center justify-between border ${
                              darkMode
                                ? "border-gray-600 bg-gray-800 text-gray-300 hover:border-[#E41E26]"
                                : "border-gray-200 bg-white text-gray-600 hover:border-[#E41E26]"
                            } rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 transition-all group text-sm sm:text-base`}
                          >
                            <div className="flex items-center gap-3">
                              <FaCity className="text-[#E41E26] text-sm" />
                              <span>
                                {formData.cityId
                                  ? cities.find(
                                      (c) => c.id.toString() === formData.cityId
                                    )?.name
                                  : "اختر المدينة"}
                              </span>
                            </div>
                            <motion.div
                              animate={{
                                rotate: openDropdown === "city" ? 180 : 0,
                              }}
                              transition={{ duration: 0.3 }}
                            >
                              <FaChevronDown className="text-[#E41E26]" />
                            </motion.div>
                          </button>
                          <AnimatePresence>
                            {openDropdown === "city" && (
                              <motion.ul
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.2 }}
                                className={`absolute z-10 mt-2 w-full ${
                                  darkMode
                                    ? "bg-gray-800 border-gray-600"
                                    : "bg-white border-gray-200"
                                } border shadow-xl rounded-lg sm:rounded-xl overflow-hidden max-h-48 overflow-y-auto`}
                              >
                                {cities.map((city) => (
                                  <li
                                    key={city.id}
                                    onClick={() => {
                                      setFormData({
                                        ...formData,
                                        cityId: city.id.toString(),
                                      });
                                      setOpenDropdown(null);
                                    }}
                                    className={`px-4 py-2.5 sm:py-3 ${
                                      darkMode
                                        ? "hover:bg-gray-700 text-gray-300 border-gray-600"
                                        : "hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] text-gray-700 border-gray-100"
                                    } cursor-pointer transition-all text-sm sm:text-base border-b last:border-b-0`}
                                  >
                                    {city.name}
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-xs sm:text-sm font-semibold ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-1 sm:mb-2`}
                        >
                          رقم الهاتف *
                        </label>
                        <div className="relative group">
                          <FaPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="tel"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleInputChange}
                            required
                            className={`w-full border ${
                              darkMode
                                ? "border-gray-600 bg-gray-800 text-white"
                                : "border-gray-200 bg-white text-black"
                            } rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base`}
                            placeholder="رقم الهاتف"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-xs sm:text-sm font-semibold ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-1 sm:mb-2`}
                        >
                          اسم الشارع *
                        </label>
                        <div className="relative group">
                          <FaRoad className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                          <input
                            type="text"
                            name="streetName"
                            value={formData.streetName}
                            onChange={handleInputChange}
                            required
                            className={`w-full border ${
                              darkMode
                                ? "border-gray-600 bg-gray-800 text-white"
                                : "border-gray-200 bg-white text-black"
                            } rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base`}
                            placeholder="اسم الشارع"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                        <div>
                          <label
                            className={`block text-xs sm:text-sm font-semibold ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            } mb-1 sm:mb-2`}
                          >
                            رقم المبنى *
                          </label>
                          <div className="relative group">
                            <FaBuildingIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                            <input
                              type="number"
                              name="buildingNumber"
                              value={formData.buildingNumber}
                              onChange={handleInputChange}
                              required
                              min="1"
                              className={`w-full border ${
                                darkMode
                                  ? "border-gray-600 bg-gray-800 text-white"
                                  : "border-gray-200 bg-white text-black"
                              } rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base`}
                              placeholder="رقم"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            className={`block text-xs sm:text-sm font-semibold ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            } mb-1 sm:mb-2`}
                          >
                            رقم الدور *
                          </label>
                          <div className="relative group">
                            <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                            <input
                              type="number"
                              name="floorNumber"
                              value={formData.floorNumber}
                              onChange={handleInputChange}
                              required
                              min="1"
                              className={`w-full border ${
                                darkMode
                                  ? "border-gray-600 bg-gray-800 text-white"
                                  : "border-gray-200 bg-white text-black"
                              } rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base`}
                              placeholder="الدور"
                            />
                          </div>
                        </div>
                        <div>
                          <label
                            className={`block text-xs sm:text-sm font-semibold ${
                              darkMode ? "text-gray-300" : "text-gray-700"
                            } mb-1 sm:mb-2`}
                          >
                            رقم الشقة *
                          </label>
                          <div className="relative group">
                            <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                            <input
                              type="number"
                              name="flatNumber"
                              value={formData.flatNumber}
                              onChange={handleInputChange}
                              required
                              min="1"
                              className={`w-full border ${
                                darkMode
                                  ? "border-gray-600 bg-gray-800 text-white"
                                  : "border-gray-200 bg-white text-black"
                              } rounded-lg sm:rounded-xl pl-9 pr-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base`}
                              placeholder="الشقة"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label
                          className={`block text-xs sm:text-sm font-semibold ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-1 sm:mb-2`}
                        >
                          تفاصيل إضافية *
                        </label>
                        <textarea
                          name="detailedDescription"
                          value={formData.detailedDescription}
                          onChange={handleInputChange}
                          required
                          rows="3"
                          className={`w-full border ${
                            darkMode
                              ? "border-gray-600 bg-gray-800 text-white"
                              : "border-gray-200 bg-white text-black"
                          } rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base resize-none`}
                          placeholder="أي تفاصيل إضافية عن موقعك..."
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-xs sm:text-sm font-semibold ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          } mb-1 sm:mb-2`}
                        >
                          رابط الموقع
                        </label>

                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={openMapModal}
                          className="flex items-center gap-2 w-full mb-2 px-3 py-2.5 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-lg hover:shadow-lg transition-all duration-200 text-sm font-semibold"
                        >
                          <FaMap className="text-sm" />
                          <span>اختيار الموقع من الخريطة</span>
                          <FaExternalLinkAlt className="text-sm ml-auto" />
                        </motion.button>

                        <input
                          type="url"
                          name="locationUrl"
                          value={formData.locationUrl}
                          onChange={handleInputChange}
                          disabled
                          className={`w-full border ${
                            darkMode
                              ? "border-gray-600 bg-gray-800 text-gray-400"
                              : "border-gray-200 bg-gray-100 text-gray-500"
                          } rounded-lg sm:rounded-xl px-3 py-2.5 sm:py-3 outline-none transition-all duration-200 text-sm sm:text-base cursor-not-allowed`}
                          placeholder="سيتم تعبئته تلقائياً عند اختيار موقع من الخريطة"
                        />

                        {formData.locationUrl && (
                          <p
                            className={`text-xs mt-1 ${
                              darkMode ? "text-green-400" : "text-green-600"
                            }`}
                          >
                            ✓ تم إضافة رابط الخريطة بنجاح
                          </p>
                        )}
                      </div>

                      <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={resetForm}
                          className={`flex-1 py-2.5 sm:py-3 border-2 border-[#E41E26] text-[#E41E26] rounded-lg sm:rounded-xl font-semibold hover:bg-[#E41E26] hover:text-white transition-all duration-300 text-sm sm:text-base`}
                        >
                          إلغاء
                        </motion.button>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          disabled={!isFormValid()}
                          className={`flex-1 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 text-sm sm:text-base flex items-center justify-center gap-1 sm:gap-2 ${
                            isFormValid()
                              ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 cursor-pointer"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          <FaCheck className="text-xs sm:text-sm" />
                          {editingId ? "تحديث" : "حفظ"}
                        </motion.button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
