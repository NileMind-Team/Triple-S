import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaClock,
  FaMapMarkerAlt,
  FaCheck,
  FaTimes,
  FaEdit,
  FaFire,
  FaStickyNote,
  FaInfoCircle,
  FaSave,
  FaStore,
  FaLocationArrow,
  FaChevronDown,
  FaMapMarker,
  FaPlusCircle,
  FaUser,
  FaExchangeAlt,
  FaPhone,
  FaMapPin,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Cart() {
  const navigate = useNavigate();
  const location = useLocation();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState(null);
  const [deliveryType, setDeliveryType] = useState("delivery");
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);
  const [branches, setBranches] = useState([]);
  const [deliveryAreas, setDeliveryAreas] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [showProductDetailsModal, setShowProductDetailsModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [productAddons, setProductAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [productQuantity, setProductQuantity] = useState(1);
  const [updatingCart, setUpdatingCart] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [userAddresses, setUserAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressDropdownOpen, setAddressDropdownOpen] = useState(false);
  const [deliveryFees, setDeliveryFees] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [loadingDeliveryFees, setLoadingDeliveryFees] = useState(false);
  const [itemNotes, setItemNotes] = useState("");
  const [showMissingInfoModal, setShowMissingInfoModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPhoneInputModal, setShowPhoneInputModal] = useState(false); // New state for phone input modal
  const [newPhoneNumber, setNewPhoneNumber] = useState(""); // New state for phone input

  const notesModalRef = React.useRef(null);
  const productDetailsModalRef = React.useRef(null);
  const addressDropdownRef = React.useRef(null);

  const isMobile = () => window.innerWidth <= 768;

  useEffect(() => {
    fetchCartItems();
    fetchBranches();
    fetchUserAddresses();
    fetchDeliveryFees();
    fetchUserProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedBranch && deliveryType === "delivery") {
      fetchDeliveryAreas(selectedBranch.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranch, deliveryType]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notesModalRef.current &&
        !notesModalRef.current.contains(event.target)
      ) {
        handleCloseNotesModal();
      }

      if (
        addressDropdownRef.current &&
        !addressDropdownRef.current.contains(event.target) &&
        addressDropdownOpen
      ) {
        setAddressDropdownOpen(false);
      }
    };

    if (showNotesModal || addressDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showNotesModal, addressDropdownOpen]);

  useEffect(() => {
    if (location.state?.fromAddresses) {
      fetchUserAddresses();
      toast.success("تم تحديث العنوان الافتراضي", {
        position: "top-right",
        autoClose: 1500,
        rtl: true,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  // New function: Fetch user profile
  const fetchUserProfile = async () => {
    try {
      setLoadingProfile(true);
      const response = await axiosInstance.get("/api/Account/Profile");
      setUserProfile(response.data);
      setPhoneNumber(response.data.phoneNumber || "");
      setNewPhoneNumber(response.data.phoneNumber || ""); // Initialize new phone number
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // New function: Update phone number
  const updatePhoneNumber = async () => {
    try {
      if (!newPhoneNumber.trim()) {
        toast.error("الرجاء إدخال رقم هاتف صحيح", {
          position: "top-right",
          autoClose: 2000,
          rtl: true,
        });
        return;
      }

      setLoadingProfile(true);
      await axiosInstance.put("/api/Account/UpdateProfile", {
        firstName: userProfile?.firstName || "",
        lastName: userProfile?.lastName || "",
        phoneNumber: newPhoneNumber,
      });

      toast.success("تم تحديث رقم الهاتف بنجاح", {
        position: "top-right",
        autoClose: 2000,
        rtl: true,
      });

      setShowPhoneInputModal(false);
      setShowMissingInfoModal(false);
      fetchUserProfile(); // Reload user data

      // Try checkout again after updating phone
      setTimeout(() => {
        handleCheckout();
      }, 500);
    } catch (error) {
      console.error("Error updating phone number:", error);
      toast.error("فشل في تحديث رقم الهاتف", {
        position: "top-right",
        autoClose: 2000,
        rtl: true,
      });
    } finally {
      setLoadingProfile(false);
    }
  };

  // Function to open phone input modal
  const openPhoneInputModal = () => {
    setShowMissingInfoModal(false); // Close missing info modal
    setShowPhoneInputModal(true); // Open phone input modal
  };

  // Function to handle adding address
  const handleAddAddress = () => {
    setShowMissingInfoModal(false); // Close missing info modal
    navigate("/addresses", { state: { fromCart: true, requireDefault: true } });
  };

  const fetchDeliveryFees = async () => {
    try {
      setLoadingDeliveryFees(true);
      const response = await axiosInstance.get("/api/DeliveryFees/GetAll");

      if (response.data && Array.isArray(response.data)) {
        setDeliveryFees(response.data);
      }
    } catch (error) {
      console.error("Error fetching delivery fees:", error);
    } finally {
      setLoadingDeliveryFees(false);
    }
  };

  const fetchUserAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await axiosInstance.get("/api/Locations/GetAllForUser");

      if (response.data && Array.isArray(response.data)) {
        setUserAddresses(response.data);

        const defaultAddress = response.data.find(
          (addr) => addr.isDefaultLocation
        );
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
        } else if (response.data.length > 0) {
          setSelectedAddress(response.data[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      if (error.response?.status !== 404) {
        if (isMobile()) {
          toast.error("فشل في تحميل العناوين", {
            position: "top-right",
            autoClose: 3000,
            rtl: true,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في تحميل العناوين",
            timer: 2500,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
            },
          });
        }
      }
    } finally {
      setLoadingAddresses(false);
    }
  };

  const calculateDiscountInMoney = (basePrice, itemOffer) => {
    if (!itemOffer || !itemOffer.isEnabled) return 0;

    if (itemOffer.isPercentage) {
      return (basePrice * itemOffer.discountValue) / 100;
    } else {
      return itemOffer.discountValue;
    }
  };

  const calculatePriceAfterDiscount = (basePrice, itemOffer) => {
    if (!itemOffer || !itemOffer.isEnabled) return basePrice;

    if (itemOffer.isPercentage) {
      return basePrice - (basePrice * itemOffer.discountValue) / 100;
    } else {
      return basePrice - itemOffer.discountValue;
    }
  };

  const calculateOptionsTotal = (menuItemOptions, quantity) => {
    if (!menuItemOptions || !Array.isArray(menuItemOptions)) return 0;

    const optionsTotal = menuItemOptions.reduce((total, option) => {
      return total + (option.price || 0);
    }, 0);

    return optionsTotal * quantity;
  };

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axiosInstance.get("/api/CartItems/GetAll");

      if (response.data && response.data.length > 0) {
        setCartId(response.data[0].cartId);
      }

      const transformedItems = response.data.map((item) => {
        const basePrice = item.menuItem?.basePrice || 0;
        const itemOffer = item.menuItem?.itemOffer;

        const priceAfterDiscount = calculatePriceAfterDiscount(
          basePrice,
          itemOffer
        );

        const discountInMoney = calculateDiscountInMoney(basePrice, itemOffer);

        let prepTime = null;
        if (
          item.menuItem?.preparationTimeStart !== null &&
          item.menuItem?.preparationTimeEnd !== null
        ) {
          prepTime = `${item.menuItem.preparationTimeStart}-${item.menuItem.preparationTimeEnd} mins`;
        }

        const optionsTotal = calculateOptionsTotal(
          item.menuItemOptions,
          item.quantity
        );

        const finalPrice = priceAfterDiscount;
        const totalPrice = priceAfterDiscount * item.quantity + optionsTotal;

        return {
          id: item.id,
          name: item.menuItem?.name || "Product",
          category: item.menuItem?.category?.name?.toLowerCase() || "meals",
          price: basePrice,
          finalPrice: finalPrice,
          isPriceBasedOnRequest: basePrice === 0,
          image: item.menuItem?.imageUrl
            ? `https://restaurant-template.runasp.net/${item.menuItem.imageUrl}`
            : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
          description: item.menuItem?.description || "",
          prepTime: prepTime,
          quantity: item.quantity,
          totalPrice: totalPrice,
          menuItem: item.menuItem,
          menuItemOptions: item.menuItemOptions || [],
          note: item.note || "",
          hasDiscount: itemOffer?.isEnabled || false,
          discountValue: discountInMoney,
          originalDiscountValue: itemOffer?.discountValue || 0,
          isPercentageDiscount: itemOffer?.isPercentage || false,
          originalTotalPrice: item.totalPrice || basePrice * item.quantity,
          optionsTotal: optionsTotal,
        };
      });

      setCartItems(transformedItems);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      if (isMobile()) {
        toast.error("فشل في تحميل عناصر السلة", {
          position: "top-right",
          autoClose: 2500,
          rtl: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل عناصر السلة",
          timer: 2500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await axiosInstance.get("/api/Branches/GetList");
      setBranches(response.data);

      if (response.data.length > 0) {
        setSelectedBranch(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      if (isMobile()) {
        toast.error("فشل في تحميل فروع المطعم", {
          position: "top-right",
          autoClose: 2500,
          rtl: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل فروع المطعم",
          timer: 2500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
      }
    } finally {
      setLoadingBranches(false);
    }
  };

  const fetchDeliveryAreas = async (branchId) => {
    try {
      setLoadingAreas(true);
      const response = await axiosInstance.get("/api/DeliveryFees/GetAll", {
        params: { branchId },
      });

      const filteredAreas = response.data.filter(
        (area) => !area.areaName.includes("الاستلام من المكان")
      );

      setDeliveryAreas(filteredAreas);

      if (filteredAreas.length > 0) {
        setSelectedArea(filteredAreas[0]);
      }
    } catch (error) {
      console.error("Error fetching delivery areas:", error);
      if (isMobile()) {
        toast.error("فشل في تحميل مناطق التوصيل", {
          position: "top-right",
          autoClose: 2500,
          rtl: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل مناطق التوصيل",
          timer: 2500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
      }
    } finally {
      setLoadingAreas(false);
    }
  };

  const toArabicNumbers = (num) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().replace(/\d/g, (digit) => arabicNumbers[digit]);
  };

  const formatAddressText = (address) => {
    if (!address) return "";

    const parts = [];
    if (address.city?.name) parts.push(address.city.name);
    if (address.streetName) parts.push(address.streetName);
    if (address.detailedDescription) parts.push(address.detailedDescription);

    return parts.join("، ");
  };

  const getDeliveryFee = () => {
    if (deliveryType === "delivery" && selectedArea) {
      return selectedArea.fee;
    } else if (deliveryType === "pickup" && selectedBranch) {
      const branchPickupFee = deliveryFees.find(
        (fee) =>
          fee.areaName.includes("الاستلام من المكان") &&
          fee.branchId === selectedBranch.id
      );

      if (branchPickupFee) {
        return branchPickupFee.fee;
      }

      const anyPickupFee = deliveryFees.find((fee) =>
        fee.areaName.includes("الاستلام من المكان")
      );

      return anyPickupFee ? anyPickupFee.fee : 0;
    }
    return 0;
  };

  const getDeliveryFeeId = () => {
    if (deliveryType === "delivery" && selectedArea) {
      return selectedArea.id;
    } else if (deliveryType === "pickup" && selectedBranch) {
      const branchPickupFee = deliveryFees.find(
        (fee) =>
          fee.areaName.includes("الاستلام من المكان") &&
          fee.branchId === selectedBranch.id
      );

      if (branchPickupFee) {
        return branchPickupFee.id;
      }

      const anyPickupFee = deliveryFees.find((fee) =>
        fee.areaName.includes("الاستلام من المكان")
      );

      return anyPickupFee ? anyPickupFee.id : 0;
    }
    return 0;
  };

  const formatPriceDisplay = (product) => {
    if (product.isPriceBasedOnRequest) {
      return (
        <div className="text-[#E41E26] dark:text-[#FDB913] font-bold text-base sm:text-lg">
          السعر حسب الطلب
        </div>
      );
    }

    if (product.hasDiscount) {
      return (
        <>
          <span className="text-gray-500 dark:text-gray-400 text-sm line-through">
            {toArabicNumbers(product.price.toFixed(2))} ج.م
          </span>
          <span className="text-[#E41E26] dark:text-[#FDB913] font-bold text-base sm:text-lg">
            {toArabicNumbers(product.finalPrice.toFixed(2))} ج.م
          </span>
        </>
      );
    }

    return (
      <div className="text-[#E41E26] dark:text-[#FDB913] font-bold text-base sm:text-lg">
        {toArabicNumbers(product.price.toFixed(2))} ج.م
      </div>
    );
  };

  const formatPriceInModal = (product) => {
    if (product.basePrice === 0) {
      return (
        <span className="text-base sm:text-xl font-bold text-[#E41E26]">
          السعر حسب الطلب
        </span>
      );
    }

    if (product.itemOffer?.isEnabled) {
      const priceAfterDiscount = calculatePriceAfterDiscount(
        product.basePrice,
        product.itemOffer
      );

      return (
        <>
          <span className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm line-through">
            {toArabicNumbers(product.basePrice)} ج.م
          </span>
          <span className="text-base sm:text-xl font-bold text-[#E41E26]">
            {toArabicNumbers(priceAfterDiscount.toFixed(2))} ج.م
          </span>
        </>
      );
    }

    return (
      <span className="text-base sm:text-xl font-bold text-[#E41E26]">
        {toArabicNumbers(product.basePrice)} ج.م
      </span>
    );
  };

  const openAddressesPage = () => {
    navigate("/addresses", { state: { fromCart: true } });
  };

  const renderAddressSection = () => {
    if (loadingAddresses) {
      return (
        <div className="mb-4 sm:mb-6">
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-12"></div>
        </div>
      );
    }

    if (userAddresses.length === 0) {
      return (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-600 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <FaMapMarker className="text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm sm:text-base">
                لا توجد عناوين
              </h4>
              <p className="text-blue-600 dark:text-blue-400 text-xs sm:text-sm mb-2">
                يجب إضافة عنوان للتوصيل أولاً
              </p>
              <button
                onClick={() => navigate("/addresses")}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg transition-all flex items-center gap-2"
              >
                <FaPlusCircle />
                إضافة عنوان جديد
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
            عنوان التوصيل
          </label>
          <button
            onClick={openAddressesPage}
            className="text-[#E41E26] dark:text-[#FDB913] text-sm font-semibold hover:underline flex items-center gap-1"
          >
            <FaExchangeAlt className="text-xs" />
            تغيير
          </button>
        </div>

        <div className="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl border border-[#FDB913]/30 dark:border-gray-600 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center 
                ${
                  selectedAddress?.isDefaultLocation
                    ? "bg-[#E41E26] dark:bg-[#FDB913] border-[#E41E26] dark:border-[#FDB913]"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {selectedAddress?.isDefaultLocation && (
                  <FaCheck className="text-white text-xs" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800 dark:text-white">
                  {selectedAddress?.city?.name || "عنوان"}
                </span>
                {selectedAddress?.isDefaultLocation && (
                  <span className="text-xs bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300 px-2 py-0.5 rounded-full">
                    افتراضي
                  </span>
                )}
              </div>
              <div className="text-gray-600 dark:text-gray-400 text-xs">
                {formatAddressText(selectedAddress)}
              </div>
              <div className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                {selectedAddress?.phoneNumber &&
                  `📞 ${selectedAddress.phoneNumber}`}
                {selectedAddress?.buildingNumber &&
                  ` | 🏢 مبنى ${selectedAddress.buildingNumber}`}
                {selectedAddress?.floorNumber &&
                  ` | دور ${selectedAddress.floorNumber}`}
                {selectedAddress?.flatNumber &&
                  ` | شقة ${selectedAddress.flatNumber}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const openProductDetailsModal = async (item) => {
    try {
      setSelectedProduct(item);
      setProductQuantity(item.quantity);
      setItemNotes(item.note || "");

      const response = await axiosInstance.get(
        `/api/MenuItems/Get/${item.menuItem?.id}`
      );
      const productData = response.data;

      productData.isPriceBasedOnRequest = productData.basePrice === 0;

      const transformedAddons =
        productData.typesWithOptions?.map((type) => ({
          id: type.id,
          title: type.name,
          type: type.canSelectMultipleOptions ? "multiple" : "single",
          required: type.isSelectionRequired,
          canSelectMultipleOptions: type.canSelectMultipleOptions,
          isSelectionRequired: type.isSelectionRequired,
          options:
            type.menuItemOptions?.map((option) => ({
              id: option.id,
              name: option.name,
              price: option.price,
              typeId: type.id,
              branchMenuItemOption: option.branchMenuItemOption || [],
            })) || [],
        })) || [];

      setProductAddons(transformedAddons);
      setProductDetails(productData);

      const initialSelectedAddons = {};

      if (item.menuItemOptions && item.menuItemOptions.length > 0) {
        const optionIdMap = {};
        transformedAddons.forEach((addon) => {
          addon.options.forEach((option) => {
            optionIdMap[option.id] = {
              typeId: addon.id,
              option: option,
            };
          });
        });

        item.menuItemOptions.forEach((cartOption) => {
          const optionInfo = optionIdMap[cartOption.id];
          if (optionInfo) {
            const typeId = optionInfo.typeId;
            if (!initialSelectedAddons[typeId]) {
              initialSelectedAddons[typeId] = [];
            }
            initialSelectedAddons[typeId].push(cartOption.id);
          }
        });
      }

      setSelectedAddons(initialSelectedAddons);

      setShowProductDetailsModal(true);
    } catch (error) {
      console.error("Error fetching product details:", error);
      if (isMobile()) {
        toast.error("فشل في تحميل تفاصيل المنتج", {
          position: "top-right",
          autoClose: 2500,
          rtl: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل تفاصيل المنتج",
          timer: 2500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
      }
    }
  };

  const closeProductDetailsModal = () => {
    setShowProductDetailsModal(false);
    setSelectedProduct(null);
    setProductDetails(null);
    setProductAddons([]);
    setSelectedAddons({});
    setItemNotes("");
  };

  const handleAddonSelect = (addonId, optionId, type) => {
    setSelectedAddons((prev) => {
      const newSelectedAddons = { ...prev };

      if (type === "single") {
        newSelectedAddons[addonId] = [optionId];
      } else {
        const currentSelections = newSelectedAddons[addonId] || [];

        if (currentSelections.includes(optionId)) {
          newSelectedAddons[addonId] = currentSelections.filter(
            (id) => id !== optionId
          );
        } else {
          newSelectedAddons[addonId] = [...currentSelections, optionId];
        }

        if (newSelectedAddons[addonId].length === 0) {
          delete newSelectedAddons[addonId];
        }
      }

      return newSelectedAddons;
    });
  };

  const calculateProductTotalPrice = () => {
    if (!productDetails) return 0;

    const basePrice = productDetails.basePrice || 0;

    if (basePrice === 0) {
      let total = 0;

      Object.values(selectedAddons).forEach((optionIds) => {
        optionIds.forEach((optionId) => {
          productAddons.forEach((addon) => {
            const option = addon.options.find((opt) => opt.id === optionId);
            if (option) {
              total += option.price * productQuantity;
            }
          });
        });
      });

      return total;
    }

    const priceAfterDiscount = calculatePriceAfterDiscount(
      basePrice,
      productDetails.itemOffer
    );

    let total = priceAfterDiscount * productQuantity;

    Object.values(selectedAddons).forEach((optionIds) => {
      optionIds.forEach((optionId) => {
        productAddons.forEach((addon) => {
          const option = addon.options.find((opt) => opt.id === optionId);
          if (option) {
            total += option.price * productQuantity;
          }
        });
      });
    });

    return total;
  };

  const updateCartItem = async () => {
    if (!selectedProduct || !productDetails) return;

    try {
      setUpdatingCart(true);

      const missingRequiredAddons = [];
      productAddons.forEach((addon) => {
        if (addon.isSelectionRequired) {
          const selectedOptionIds = selectedAddons[addon.id] || [];
          if (selectedOptionIds.length === 0) {
            missingRequiredAddons.push(addon.title);
          }
        }
      });

      if (missingRequiredAddons.length > 0) {
        if (isMobile()) {
          toast.warning(`الرجاء اختيار ${missingRequiredAddons.join(" و ")}`, {
            position: "top-right",
            autoClose: 2500,
            rtl: true,
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "إضافات مطلوبة",
            text: `الرجاء اختيار ${missingRequiredAddons.join(" و ")}`,
            timer: 2500,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
            },
          });
        }
        setUpdatingCart(false);
        return;
      }

      const options = [];
      Object.values(selectedAddons).forEach((optionIds) => {
        optionIds.forEach((optionId) => {
          options.push(optionId);
        });
      });

      await axiosInstance.put(`/api/CartItems/Update/${selectedProduct.id}`, {
        note: itemNotes.trim(),
        options: options,
      });

      if (productQuantity !== selectedProduct.quantity) {
        await axiosInstance.put(
          `/api/CartItems/UpdateQuantity/${selectedProduct.id}`,
          {
            quantity: productQuantity,
          }
        );
      }

      await fetchCartItems();

      closeProductDetailsModal();

      if (isMobile()) {
        setTimeout(() => {
          toast.success("تم تحديث المنتج في سلة التسوق بنجاح", {
            position: "top-right",
            autoClose: 2500,
            rtl: true,
          });
        }, 100);
      } else {
        Swal.fire({
          icon: "success",
          title: "تم التحديث!",
          text: "تم تحديث المنتج في سلة التسوق بنجاح",
          timer: 2500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
      }
    } catch (error) {
      console.error("Error updating cart item:", error);
      if (isMobile()) {
        toast.error("فشل في تحديث المنتج", {
          position: "top-right",
          autoClose: 2500,
          rtl: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحديث المنتج",
          timer: 2500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
      }
    } finally {
      setUpdatingCart(false);
    }
  };

  const handleOpenNotesModal = () => {
    setShowNotesModal(true);
  };

  const handleCloseNotesModal = () => {
    setShowNotesModal(false);
  };

  const handleSaveNotes = () => {
    if (selectedProduct) {
      updateCartItem();
    } else {
      handleCloseNotesModal();
      toast.success("تم حفظ التعليمات الإضافية", {
        position: "top-right",
        autoClose: 1500,
        rtl: true,
      });
    }
  };

  const handleClearNotes = () => {
    setItemNotes("");
    toast.info("تم مسح التعليمات الإضافية", {
      position: "top-right",
      autoClose: 1500,
      rtl: true,
    });
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const cartItem = cartItems.find((item) => item.id === id);
      if (!cartItem) return;

      const basePrice = cartItem.finalPrice;
      const optionsPricePerUnit = cartItem.optionsTotal / cartItem.quantity;

      const newOptionsTotal = optionsPricePerUnit * newQuantity;
      const newTotalPrice = basePrice * newQuantity + newOptionsTotal;

      await axiosInstance.put(`/api/CartItems/UpdateQuantity/${id}`, {
        quantity: newQuantity,
      });

      setCartItems((prevItems) =>
        prevItems.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: newTotalPrice,
              optionsTotal: newOptionsTotal,
            };
          }
          return item;
        })
      );

      toast.success("تم تحديث الكمية", {
        position: "top-right",
        autoClose: 1000,
        rtl: true,
      });
    } catch (error) {
      console.error("Error updating quantity:", error);
      if (isMobile()) {
        toast.error("فشل في تحديث الكمية", {
          position: "top-right",
          autoClose: 2500,
          rtl: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحديث الكمية",
          timer: 2500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
      }
    }
  };

  const removeItem = async (id) => {
    Swal.fire({
      title: "إزالة المنتج؟",
      text: "هل أنت متأكد من إزالة هذا المنتج من سلة التسوق؟",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، قم بإزالته!",
      cancelButtonText: "إلغاء",
      reverseButtons: true,
      customClass: {
        popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/CartItems/Delete/${id}`);

          setCartItems((prevItems) =>
            prevItems.filter((item) => item.id !== id)
          );

          if (isMobile()) {
            toast.success("تم إزالة المنتج من سلة التسوق", {
              position: "top-right",
              autoClose: 2500,
              rtl: true,
            });
          } else {
            Swal.fire({
              title: "تمت الإزالة!",
              text: "تم إزالة المنتج من سلة التسوق",
              icon: "success",
              timer: 2500,
              showConfirmButton: false,
              customClass: {
                popup:
                  "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
              },
            });
          }
        } catch (error) {
          console.error("Error removing item:", error);
          if (isMobile()) {
            toast.error("فشل في إزالة المنتج", {
              position: "top-right",
              autoClose: 2500,
              rtl: true,
            });
          } else {
            Swal.fire({
              icon: "error",
              title: "خطأ",
              text: "فشل في إزالة المنتج",
              timer: 2500,
              showConfirmButton: false,
              customClass: {
                popup:
                  "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
              },
            });
          }
        }
      }
    });
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryFee = getDeliveryFee();

    return subtotal + deliveryFee;
  };

  const handleCheckout = async () => {
    // Case 1: User logged in but cart is empty
    if (cartItems.length === 0) {
      if (isMobile()) {
        toast.warning(
          "الرجاء إضافة بعض المنتجات إلى سلة التسوق قبل المتابعة للدفع.",
          {
            position: "top-right",
            autoClose: 2500,
            rtl: true,
          }
        );
      } else {
        Swal.fire({
          icon: "warning",
          title: "السلة فارغة",
          text: "الرجاء إضافة بعض المنتجات إلى سلة التسوق قبل المتابعة للدفع.",
          timer: 2500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
      }
      return;
    }

    if (!cartId) {
      if (isMobile()) {
        toast.error("لم يتم العثور على معرف السلة", {
          position: "top-right",
          autoClose: 2500,
          rtl: true,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "لم يتم العثور على معرف السلة",
          timer: 2500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
      }
      return;
    }

    if (!selectedBranch) {
      if (isMobile()) {
        toast.warning("الرجاء اختيار فرع المطعم", {
          position: "top-right",
          autoClose: 2500,
          rtl: true,
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "اختر الفرع",
          text: "الرجاء اختيار فرع المطعم",
          timer: 2500,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        });
      }
      return;
    }

    if (deliveryType === "delivery") {
      // Case 2: User logged in but no addresses
      if (userAddresses.length === 0) {
        if (isMobile()) {
          toast.warning("يجب إضافة عنوان للتوصيل أولاً.", {
            position: "top-right",
            autoClose: 2500,
            rtl: true,
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "أضف عنوان التوصيل",
            text: "يجب إضافة عنوان للتوصيل أولاً.",
            timer: 2500,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
            },
          });
        }
        return;
      }

      // Case 3: User logged in with addresses but none selected
      if (!selectedAddress) {
        if (isMobile()) {
          toast.warning("الرجاء اختيار عنوان التوصيل", {
            position: "top-right",
            autoClose: 2500,
            rtl: true,
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "اختر عنوان التوصيل",
            text: "الرجاء اختيار عنوان التوصيل",
            timer: 2500,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
            },
          });
        }
        return;
      }

      if (!selectedArea) {
        if (isMobile()) {
          toast.warning("الرجاء اختيار منطقة التوصيل", {
            position: "top-right",
            autoClose: 2500,
            rtl: true,
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "اختر منطقة التوصيل",
            text: "الرجاء اختيار منطقة التوصيل",
            timer: 2500,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
            },
          });
        }
        return;
      }
    }

    try {
      const orderData = {
        branchId: selectedBranch.id,
        deliveryFeeId: getDeliveryFeeId(),
        notes: additionalNotes.trim(),
        locationId:
          deliveryType === "delivery" && selectedAddress
            ? selectedAddress.id
            : 0,
      };

      const response = await axiosInstance.post("/api/Orders/Add", orderData);

      if (response.status === 200 || response.status === 201) {
        Swal.fire({
          title:
            '<h2 class="text-2xl font-bold text-gray-800 dark:text-white">تم تأكيد الطلب!</h2>',
          html: `
            <div class="text-center">
              <div class="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 mx-auto">
                <svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                </svg>
              </div>
              <p class="text-lg text-gray-600 dark:text-gray-400 mb-4">تم تقديم طلبك بنجاح!</p>
              <div class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 border border-green-200 dark:border-green-800">
                <p class="text-sm text-green-600 dark:text-green-400 mt-1">
                  سيتم تجهيز طلبك في فرع ${selectedBranch.name}
                  ${
                    deliveryType === "delivery"
                      ? `ويتم التوصيل إلى ${selectedArea.areaName}`
                      : "يمكنك الاستلام من المطعم"
                  }
                </p>
              </div>
            </div>
          `,
          icon: null,
          timer: 3000,
          showConfirmButton: false,
          customClass: {
            popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
          },
        }).then(() => {
          navigate("/my-orders", { state: { orderData: response.data } });
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);

      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;

        let errorMessages = [];

        errors.forEach((errorItem) => {
          if (
            errorItem.code === "User" &&
            errorItem.description === "User is not active."
          ) {
            errorMessages.push(
              "حسابك غير نشط حالياً. الرجاء التواصل مع إدارة المطعم لتفعيل الحساب."
            );
          } else if (errorItem.code === "Branch.Closed") {
            errorMessages.push(
              "الفرع المختار مغلق حالياً. الرجاء اختيار فرع آخر أو المحاولة عند فتح الفرع."
            );
          } else if (errorItem.code === "Branch.InActive") {
            errorMessages.push(
              "الفرع المختار غير نشط حالياً. الرجاء اختيار فرع آخر أو المحاولة عندما يكون الفرع نشطاً."
            );
          } else if (errorItem.code === "DeliveryFee.NotActive") {
            errorMessages.push(
              `رسوم ${
                deliveryType === "delivery" ? "التوصيل" : "الاستلام"
              } غير نشطة حالياً. الرجاء اختيار فرع آخر أو طريقة استلام مختلفة.`
            );
          } else if (errorItem.code === "Cart") {
            const match = errorItem.description.match(/\d+/g);
            const unavailableItemIds = match ? match.map(Number) : [];

            const unavailableItems = cartItems.filter((item) =>
              unavailableItemIds.includes(item.id)
            );

            const itemNames = unavailableItems
              .map((item) => item.name)
              .join("، ");

            errorMessages.push(
              `المنتجات التالية غير متاحة في فرع ${
                selectedBranch?.name || "المختار"
              }: ${itemNames}. الرجاء إزالتها من السلة أو اختيار فرع آخر.`
            );
          } else if (errorItem.code === "DeliveryFee.NotFound") {
            errorMessages.push(
              `رسوم ${
                deliveryType === "delivery" ? "التوصيل" : "الاستلام"
              } غير متاحة لهذا الفرع حالياً. الرجاء اختيار فرع آخر أو طريقة استلام مختلفة.`
            );
          } else if (errorItem.code === "User.MissingInfo") {
            errorMessages.push(
              "يجب إضافة رقم هاتف أو تعيين عنوان افتراضي قبل إتمام الطلب."
            );

            setShowMissingInfoModal(true);
            fetchUserProfile();
          }
        });

        if (errorMessages.length === 0) {
          errorMessages.push("فشل في إنشاء الطلب. الرجاء المحاولة مرة أخرى.");
        }

        if (isMobile()) {
          toast.error(errorMessages.join(" "), {
            position: "top-right",
            autoClose: 3000,
            rtl: true,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            html: errorMessages
              .map((msg) => `<div class="text-right mb-2">${msg}</div>`)
              .join(""),
            timer: 2500,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
            },
          });
        }
      } else {
        if (isMobile()) {
          toast.error("فشل في إنشاء الطلب. الرجاء المحاولة مرة أخرى.", {
            position: "top-right",
            autoClose: 2500,
            rtl: true,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في إنشاء الطلب. الرجاء المحاولة مرة أخرى.",
            timer: 2500,
            showConfirmButton: false,
            customClass: {
              popup: "rounded-3xl shadow-2xl dark:bg-gray-800 dark:text-white",
            },
          });
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex items-center justify-center px-3 sm:px-4 py-4 sm:py-8 transition-colors duration-300">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-3 sm:px-4 py-4 sm:py-8 transition-colors duration-300">
      {/* Phone Input Modal */}
      {showPhoneInputModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[80] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FaPhone className="text-[#E41E26] text-xl" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  تحديث رقم الهاتف
                </h3>
              </div>
              <button
                onClick={() => setShowPhoneInputModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="mb-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-600 mb-4">
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  الرجاء إدخال رقم هاتفك لتتمكن من إكمال عملية الدفع.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  value={newPhoneNumber}
                  onChange={(e) => setNewPhoneNumber(e.target.value)}
                  placeholder="أدخل رقم الهاتف"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent"
                  dir="ltr"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  سيتم استخدام هذا الرقم للتواصل بشأن الطلب
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPhoneInputModal(false)}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={updatePhoneNumber}
                disabled={loadingProfile || !newPhoneNumber.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loadingProfile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <FaSave />
                    حفظ وتأكيد الدفع
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Missing Info Modal */}
      {showMissingInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[70] p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FaInfoCircle className="text-[#E41E26] text-xl" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  معلومات ناقصة
                </h3>
              </div>
              <button
                onClick={() => setShowMissingInfoModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="mb-6">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl border border-yellow-200 dark:border-yellow-600 mb-4">
                <p className="text-yellow-700 dark:text-yellow-300 text-sm">
                  يرجى إضافة رقم هاتف أو عنوان افتراضي للمتابعة في عملية الدفع.
                </p>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    اختر أحد الخيارات التالية:
                  </p>
                </div>

                {/* Add Phone Number Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={openPhoneInputModal}
                  className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border-2 border-blue-200 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
                    <FaPhone className="text-blue-600 dark:text-blue-300 text-xl" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 text-base">
                      إضافة رقم هاتف
                    </h4>
                    <p className="text-blue-600 dark:text-blue-400 text-sm">
                      أضف رقم هاتف للتواصل معك بشأن الطلب
                    </p>
                  </div>
                </motion.button>

                {/* Add Address Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddAddress}
                  className="w-full p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl border-2 border-green-200 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500 transition-all duration-300 flex items-center justify-center gap-3"
                >
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                    <FaMapPin className="text-green-600 dark:text-green-300 text-xl" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-bold text-green-800 dark:text-green-300 text-base">
                      إضافة عنوان
                    </h4>
                    <p className="text-green-600 dark:text-green-400 text-sm">
                      أضف عنوان افتراضي لتوصيل الطلب
                    </p>
                  </div>
                </motion.button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMissingInfoModal(false)}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                إلغاء الطلب
              </button>
              <button
                onClick={() => {
                  setShowMissingInfoModal(false);
                  navigate("/");
                }}
                className="flex-1 py-3 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                مواصلة التسوق
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <motion.div
            ref={notesModalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FaStickyNote className="text-[#E41E26] text-xl" />
                <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                  تعليمات إضافية
                </h3>
              </div>
              <button
                onClick={handleCloseNotesModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                اكتب أي ملاحظات
              </p>

              <textarea
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                placeholder="اكتب تعليماتك هنا..."
                className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent resize-none"
                dir="rtl"
                maxLength={500}
                autoFocus
              />

              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  اختياري
                </span>
                <span
                  className={`text-xs ${
                    itemNotes.length >= 450
                      ? "text-red-500"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {itemNotes.length}/500
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleClearNotes}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <FaTrash className="text-sm" />
                مسح
              </button>
              <button
                onClick={handleCloseNotesModal}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveNotes}
                className="flex-1 py-3 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FaSave className="text-sm" />
                حفظ
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {showProductDetailsModal && productDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="fixed inset-0" onClick={closeProductDetailsModal} />
          <motion.div
            ref={productDetailsModalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full ${
              isMobile() ? "max-w-full h-full" : "max-w-2xl max-h-[90vh]"
            } overflow-hidden relative z-50 flex flex-col`}
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="relative">
                  <img
                    src={
                      productDetails.imageUrl
                        ? `https://restaurant-template.runasp.net/${productDetails.imageUrl}`
                        : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop"
                    }
                    alt={productDetails.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-xl font-bold text-gray-800 dark:text-white truncate">
                    {productDetails.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 sm:mt-2">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                      {formatPriceInModal(productDetails)}
                    </div>

                    {productDetails.itemOffer?.isEnabled &&
                      productDetails.basePrice !== 0 && (
                        <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg font-bold shadow text-xs sm:text-sm flex items-center gap-1">
                          <span>خصم</span>
                          <span>
                            {toArabicNumbers(
                              calculateDiscountInMoney(
                                productDetails.basePrice,
                                productDetails.itemOffer
                              ).toFixed(2)
                            )}{" "}
                            ج.م
                          </span>
                        </div>
                      )}
                  </div>
                </div>
              </div>
              <button
                onClick={closeProductDetailsModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full flex-shrink-0"
              >
                <FaTimes className="text-base sm:text-lg" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
              {/* Calories and Prep Time */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                {productDetails.calories && (
                  <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                    <FaFire className="text-orange-500 text-xs sm:text-sm" />
                    {toArabicNumbers(productDetails.calories)} كالوري
                  </span>
                )}

                {productDetails.preparationTimeStart !== null &&
                  productDetails.preparationTimeEnd !== null && (
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                      <FaClock className="text-blue-500 text-xs sm:text-sm" />
                      {toArabicNumbers(productDetails.preparationTimeStart)}
                      {productDetails.preparationTimeEnd !== null &&
                        `-${toArabicNumbers(
                          productDetails.preparationTimeEnd
                        )}`}{" "}
                      دقيقة
                    </span>
                  )}
              </div>

              {/* Description */}
              {productDetails.description && (
                <div className="mb-4 sm:mb-5 lg:mb-6">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white mb-1 sm:mb-2">
                    الوصف
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-xs sm:text-sm">
                    {productDetails.description}
                  </p>
                </div>
              )}

              {/* Addons - UPDATED DESIGN TO MATCH PRODUCT DETAILS PAGE */}
              {productAddons.length > 0 && (
                <div className="space-y-3 sm:space-y-5 lg:space-y-6 mb-4 sm:mb-5 lg:mb-6">
                  {productAddons.map((addon) => {
                    const selectedOptionIds = selectedAddons[addon.id] || [];

                    return (
                      <div
                        key={addon.id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-200 dark:border-gray-600"
                        dir="rtl"
                      >
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                            <h4 className="font-semibold text-sm sm:text-base text-gray-800 dark:text-gray-200">
                              {addon.title}
                            </h4>
                            {addon.isSelectionRequired && (
                              <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                                مطلوب
                              </span>
                            )}
                            {addon.canSelectMultipleOptions && (
                              <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
                                متعدد
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2">
                          {addon.options.map((option) => {
                            const isSelected = selectedOptionIds.includes(
                              option.id
                            );
                            return (
                              <motion.button
                                key={option.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  handleAddonSelect(
                                    addon.id,
                                    option.id,
                                    addon.type
                                  )
                                }
                                className={`w-full p-2 rounded-md sm:rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${
                                  isSelected
                                    ? "border-[#E41E26] bg-red-50 dark:bg-red-900/20"
                                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500"
                                }`}
                                dir="rtl"
                              >
                                <div className="flex items-center gap-1">
                                  <span
                                    className={`font-medium text-xs sm:text-sm ${
                                      isSelected
                                        ? "text-[#E41E26]"
                                        : "text-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    {option.name}
                                  </span>
                                  {isSelected && (
                                    <FaCheck className="text-[#E41E26] text-xs" />
                                  )}
                                </div>

                                {option.price > 0 && (
                                  <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                                    +{toArabicNumbers(option.price)} ج.م
                                  </span>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div
                onClick={handleOpenNotesModal}
                className={`w-full rounded-lg sm:rounded-xl p-3 sm:p-4 text-center transition-all duration-300 mb-4 sm:mb-5 lg:mb-6 cursor-pointer ${
                  itemNotes
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-solid border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500"
                    : "bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 border-2 border-dashed border-indigo-300 dark:border-indigo-600 hover:border-solid hover:border-indigo-400 dark:hover:border-indigo-500"
                }`}
                dir="rtl"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div
                    className={`p-1.5 sm:p-2 rounded-full ${
                      itemNotes
                        ? "bg-green-100 dark:bg-green-800/50"
                        : "bg-indigo-100 dark:bg-indigo-800/50"
                    }`}
                  >
                    <FaStickyNote
                      className={`text-lg sm:text-xl ${
                        itemNotes
                          ? "text-green-600 dark:text-green-400"
                          : "text-indigo-600 dark:text-indigo-400"
                      }`}
                    />
                  </div>
                  <div>
                    <h4
                      className={`font-semibold text-sm sm:text-base ${
                        itemNotes
                          ? "text-green-700 dark:text-green-300"
                          : "text-indigo-700 dark:text-indigo-300"
                      }`}
                    >
                      {itemNotes ? "تعليمات إضافية" : "إضافة تعليمات إضافية"}
                    </h4>
                    <p
                      className={`text-xs mt-0.5 sm:mt-1 ${
                        itemNotes
                          ? "text-green-600/70 dark:text-green-400/70"
                          : "text-indigo-600/70 dark:text-indigo-400/70"
                      }`}
                    >
                      {itemNotes
                        ? `انقر لتعديل التعليمات: ${itemNotes.substring(
                            0,
                            60
                          )}${itemNotes.length > 60 ? "..." : ""}`
                        : "انقر لإضافة تعليمات إضافية"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer - Quantity and Actions */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 sm:p-5 lg:p-6 bg-gray-50 dark:bg-gray-800/50 flex-shrink-0">
              <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center justify-between w-full md:w-auto gap-3 sm:gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm">
                      الكمية:
                    </span>
                    <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg p-1 shadow">
                      <button
                        onClick={() =>
                          setProductQuantity((prev) =>
                            prev > 1 ? prev - 1 : 1
                          )
                        }
                        className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FaMinus className="text-[#E41E26] text-xs" />
                      </button>
                      <span className="font-bold text-gray-800 dark:text-white min-w-8 sm:min-w-10 text-center text-sm sm:text-base">
                        {toArabicNumbers(productQuantity)}
                      </span>
                      <button
                        onClick={() => setProductQuantity((prev) => prev + 1)}
                        className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <FaPlus className="text-[#E41E26] text-xs" />
                      </button>
                    </div>
                  </div>
                  <div className="text-base sm:text-lg lg:text-xl font-bold text-[#E41E26]">
                    {toArabicNumbers(calculateProductTotalPrice().toFixed(2))}{" "}
                    ج.م
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
                  <button
                    onClick={closeProductDetailsModal}
                    className="flex-1 md:flex-none px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                  >
                    إلغاء
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={updateCartItem}
                    disabled={updatingCart}
                    className="flex-1 md:flex-none px-4 py-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {updatingCart ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        تحديث...
                      </>
                    ) : (
                      <>
                        <FaEdit className="text-xs" />
                        تحديث
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

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
              className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full p-2 sm:p-3 text-[#E41E26] dark:text-gray-300 hover:bg-[#E41E26] dark:hover:bg-[#FDB913] hover:text-white transition-all duration-300 shadow-lg"
            >
              <FaArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                سلة التسوق
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                راجع طلبك و تابع للدفع
              </p>
            </div>
          </div>
          <div className="text-right self-end sm:self-auto">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#E41E26] dark:text-[#FDB913]">
              {cartItems.reduce((total, item) => total + item.quantity, 0)}{" "}
              عناصر
            </div>
            <div className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
              في سلة التسوق الخاصة بك
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 transition-colors duration-300"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <FaShoppingCart
                  className="text-[#E41E26] dark:text-[#FDB913] sm:w-6 sm:h-6"
                  size={18}
                />
                عناصر الطلب ({cartItems.length})
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <AnimatePresence>
                  {cartItems.length === 0 ? (
                    <div className="text-center py-8 sm:py-12 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border border-[#FDB913]/30 dark:border-gray-600">
                      <FaShoppingCart className="mx-auto text-4xl sm:text-5xl text-gray-400 mb-3 sm:mb-4" />
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        سلة التسوق فارغة
                      </h3>
                      <p className="text-gray-500 dark:text-gray-500 mb-4 px-4">
                        لم تقم بإضافة أي منتجات إلى سلة التسوق بعد
                      </p>
                      <button
                        onClick={() => navigate("/")}
                        className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
                      >
                        تصفح المنتجات
                      </button>
                    </div>
                  ) : (
                    cartItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border border-[#FDB913]/30 dark:border-gray-600 transition-colors duration-300 hover:shadow-lg cursor-pointer group"
                        onClick={() => openProductDetailsModal(item)}
                      >
                        <div className="flex gap-3 sm:gap-4 w-full sm:w-auto sm:flex-1">
                          <div className="relative">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl object-cover flex-shrink-0"
                            />
                            {/* Badge for discount */}
                            {item.hasDiscount &&
                              !item.isPriceBasedOnRequest && (
                                <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                                  خصم{" "}
                                  {toArabicNumbers(
                                    item.discountValue.toFixed(2)
                                  )}{" "}
                                  ج.م
                                </div>
                              )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="mb-1 sm:mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg group-hover:text-[#E41E26] transition-colors">
                                  {item.name}
                                </h3>
                                <FaInfoCircle className="text-[#E41E26] opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </div>

                            <div className="flex items-center gap-2 mb-1 sm:mb-2">
                              {formatPriceDisplay(item)}
                            </div>

                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2">
                              {item.description}
                            </p>

                            {/* Prep Time */}
                            {item.prepTime && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2">
                                <FaClock
                                  className="text-[#E41E26] dark:text-[#FDB913]"
                                  size={12}
                                />
                                <span>{item.prepTime}</span>
                              </div>
                            )}

                            {/* Notes - New Section Added */}
                            {item.note && (
                              <div className="flex items-start gap-2 text-xs sm:text-sm text-green-600 dark:text-green-400 mt-2 bg-green-50 dark:bg-green-900/20 px-3 py-2 rounded-lg">
                                <FaStickyNote
                                  className="text-green-500 dark:text-green-400 mt-0.5"
                                  size={12}
                                />
                                <span className="font-medium">ملاحظة:</span>
                                <span className="flex-1 break-words max-w-[150px] line-clamp-2">
                                  {item.note}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls, Total Price and Remove Button */}
                        <div
                          className="flex items-center justify-between w-full sm:w-auto sm:flex-nowrap gap-2 sm:gap-3 mt-3 sm:mt-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Quantity Controls */}
                          <div className="flex items-center gap-1 sm:gap-2 bg-white dark:bg-gray-700 rounded-lg sm:rounded-xl p-1 sm:p-2 shadow-lg">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.id, item.quantity - 1);
                              }}
                              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-[#E41E26] dark:text-[#FDB913]"
                            >
                              <FaMinus size={10} className="sm:w-3 sm:h-3" />
                            </button>
                            <span className="font-bold text-gray-800 dark:text-white min-w-6 sm:min-w-8 text-center text-sm sm:text-base">
                              {item.quantity}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateQuantity(item.id, item.quantity + 1);
                              }}
                              className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 text-[#E41E26] dark:text-[#FDB913]"
                            >
                              <FaPlus size={10} className="sm:w-3 sm:h-3" />
                            </button>
                          </div>

                          {/* Item Total */}
                          <div className="text-right min-w-20 sm:min-w-24">
                            <div className="font-bold text-gray-800 dark:text-white text-base sm:text-lg whitespace-nowrap">
                              {toArabicNumbers(item.totalPrice.toFixed(2))} ج.م
                            </div>
                            {item.optionsTotal > 0 && (
                              <div className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                                +{toArabicNumbers(item.optionsTotal.toFixed(2))}{" "}
                                ج.م للإضافات
                              </div>
                            )}
                          </div>

                          {/* Remove Button */}
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                            className="p-1 sm:p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md sm:rounded-lg transition-colors duration-200"
                          >
                            <FaTrash size={14} className="sm:w-4 sm:h-4" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 transition-colors duration-300"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <FaMapMarkerAlt
                  className="text-[#E41E26] dark:text-[#FDB913] sm:w-6 sm:h-6"
                  size={18}
                />
                خيارات {deliveryType === "delivery" ? "التوصيل" : "الاستلام"}
              </h2>

              {deliveryType === "delivery" && renderAddressSection()}

              <div className="mb-4 sm:mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div
                    className={`p-4 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border-2 cursor-pointer hover:shadow-lg transition-all duration-300 ${
                      deliveryType === "delivery"
                        ? "border-[#E41E26] dark:border-[#FDB913]"
                        : "border-[#FDB913]/30 dark:border-gray-600"
                    }`}
                    onClick={() => setDeliveryType("delivery")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                          deliveryType === "delivery"
                            ? "bg-[#E41E26] dark:bg-[#FDB913] border-[#E41E26] dark:border-[#FDB913]"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {deliveryType === "delivery" && (
                          <FaCheck className="text-white text-xs" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 dark:text-white text-sm sm:text-base">
                          التوصيل للمنزل
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                          توصيل الطلب إلى عنوانك
                        </div>
                      </div>
                      <FaMapMarkerAlt className="text-[#E41E26] text-lg" />
                    </div>
                  </div>

                  <div
                    className={`p-4 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl border-2 cursor-pointer hover:shadow-lg transition-all duration-300 ${
                      deliveryType === "pickup"
                        ? "border-[#E41E26] dark:border-[#FDB913]"
                        : "border-[#FDB913]/30 dark:border-gray-600"
                    }`}
                    onClick={() => setDeliveryType("pickup")}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                          deliveryType === "pickup"
                            ? "bg-[#E41E26] dark:bg-[#FDB913] border-[#E41E26] dark:border-[#FDB913]"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {deliveryType === "pickup" && (
                          <FaCheck className="text-white text-xs" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-800 dark:text-white text-sm sm:text-base">
                          الاستلام من المطعم
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm">
                          استلام الطلب من الفرع
                        </div>
                      </div>
                      <FaStore className="text-[#E41E26] text-lg" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Branch Selection Dropdown - UPDATED DESIGN */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  اختر الفرع
                </label>
                {loadingBranches ? (
                  <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-12"></div>
                ) : (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === "branch" ? null : "branch"
                        )
                      }
                      className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FaStore className="text-[#E41E26] dark:text-[#FDB913]" />
                        {selectedBranch ? selectedBranch.name : "اختر الفرع"}
                      </span>
                      <motion.div
                        animate={{
                          rotate: openDropdown === "branch" ? 180 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <FaChevronDown className="text-[#E41E26] dark:text-[#FDB913]" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {openDropdown === "branch" && (
                        <motion.ul
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.2 }}
                          className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                        >
                          {branches.map((branch) => (
                            <li
                              key={branch.id}
                              onClick={() => {
                                setSelectedBranch(branch);
                                setOpenDropdown(null);
                              }}
                              className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-600 dark:hover:to-gray-500 cursor-pointer text-gray-700 dark:text-gray-300 transition-all text-sm sm:text-base border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                            >
                              {branch.name}
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {deliveryType === "delivery" && (
                <>
                  {/* Delivery Area Selection Dropdown - UPDATED DESIGN */}
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      اختر منطقة التوصيل
                    </label>
                    {loadingAreas ? (
                      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-xl h-12"></div>
                    ) : deliveryAreas.length > 0 ? (
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenDropdown(
                              openDropdown === "area" ? null : "area"
                            )
                          }
                          className="w-full flex items-center justify-between border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-black dark:text-white rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <FaMapMarkerAlt className="text-[#E41E26] dark:text-[#FDB913]" />
                            {selectedArea
                              ? `${selectedArea.areaName} - ${selectedArea.fee} ج.م`
                              : "اختر منطقة التوصيل"}
                          </span>
                          <motion.div
                            animate={{
                              rotate: openDropdown === "area" ? 180 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <FaChevronDown className="text-[#E41E26] dark:text-[#FDB913]" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {openDropdown === "area" && (
                            <motion.ul
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -5 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-2xl rounded-xl overflow-hidden max-h-48 overflow-y-auto"
                            >
                              {deliveryAreas.map((area) => (
                                <li
                                  key={area.id}
                                  onClick={() => {
                                    setSelectedArea(area);
                                    setOpenDropdown(null);
                                  }}
                                  className="px-4 py-3 hover:bg-gradient-to-r hover:from-[#fff8e7] hover:to-[#ffe5b4] dark:hover:from-gray-600 dark:hover:to-gray-500 cursor-pointer text-gray-700 dark:text-gray-300 transition-all text-sm sm:text-base border-b border-gray-100 dark:border-gray-600 last:border-b-0"
                                >
                                  <div>
                                    <div className="font-medium">
                                      {area.areaName}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                      رسوم: {area.fee} ج.م - وقت:{" "}
                                      {area.estimatedTimeMin}-
                                      {area.estimatedTimeMax} دقيقة
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl border border-yellow-200 dark:border-yellow-600 text-center">
                        <p className="text-yellow-700 dark:text-yellow-300">
                          لا توجد مناطق توصيل متاحة لهذا الفرع حالياً
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}

              {deliveryType === "pickup" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl sm:rounded-2xl border border-green-200 dark:border-green-600 mb-4 sm:mb-6"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-full flex items-center justify-center">
                      <FaStore className="text-green-600 dark:text-green-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800 dark:text-green-300 text-sm sm:text-base">
                        الاستلام من المطعم
                      </h4>
                      <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm">
                        {selectedBranch?.name || "المطعم"}
                      </p>
                      <p className="text-green-700 dark:text-green-300 text-xs mt-1">
                        رسوم الاستلام: {getDeliveryFee().toFixed(2)} ج.م
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Additional Notes */}
              <div className="mt-4 sm:mt-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  ملاحظات إضافية للطلب الكامل
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="أضف ملاحظات أو تعليمات خاصة للطلب الكامل..."
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-lg sm:rounded-xl dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent resize-none h-32"
                  dir="rtl"
                  maxLength={500}
                />
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    اختياري
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {additionalNotes.length}/500
                  </span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto transition-colors duration-300"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white mb-4 sm:mb-6">
                ملخص الطلب
              </h2>

              {/* User Info */}
              <div className="mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#FDB913]/30 dark:border-gray-600">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-[#E41E26] dark:bg-[#FDB913] rounded-full flex items-center justify-center">
                      <FaUser className="text-white text-sm" />
                    </div>
                    <h4 className="font-bold text-gray-800 dark:text-white text-sm sm:text-base">
                      معلومات العميل
                    </h4>
                  </div>
                  <div className="text-sm">
                    {deliveryType === "delivery" && selectedAddress ? (
                      <div>
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                          {selectedAddress.city?.name || "عنوان"}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                          {formatAddressText(selectedAddress)}
                        </div>
                        {selectedAddress.phoneNumber && (
                          <div className="text-gray-600 dark:text-gray-400 text-xs mt-1">
                            📞 {selectedAddress.phoneNumber}
                          </div>
                        )}
                      </div>
                    ) : deliveryType === "pickup" ? (
                      <div className="text-gray-600 dark:text-gray-400">
                        الاستلام من المطعم
                      </div>
                    ) : deliveryType === "delivery" &&
                      userAddresses.length === 0 ? (
                      <div className="text-yellow-600 dark:text-yellow-400 text-sm">
                        يجب إضافة عنوان للتوصيل
                      </div>
                    ) : (
                      <div className="text-yellow-600 dark:text-yellow-400 text-sm">
                        لم يتم اختيار عنوان التوصيل
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    المجموع الفرعي
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                    {calculateSubtotal().toFixed(2)} ج.م
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                    رسوم {deliveryType === "delivery" ? "التوصيل" : "الاستلام"}
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white text-sm sm:text-base">
                    {getDeliveryFee().toFixed(2)} ج.م
                  </span>
                </div>

                {deliveryType === "delivery" && selectedArea && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    وقت التوصيل المتوقع: {selectedArea.estimatedTimeMin}-
                    {selectedArea.estimatedTimeMax} دقيقة
                  </div>
                )}

                <div className="border-t border-gray-200 dark:border-gray-600 pt-3 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 dark:text-white text-base sm:text-lg">
                      الإجمالي
                    </span>
                    <span className="font-bold text-[#E41E26] dark:text-[#FDB913] text-lg sm:text-xl md:text-2xl">
                      {calculateTotal().toFixed(2)} ج.م
                    </span>
                  </div>
                </div>
              </div>

              {/* Branch and Area Info */}
              <div className="mb-4 sm:mb-6">
                <div className="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-[#FDB913]/30 dark:border-gray-600">
                  <h4 className="font-bold text-gray-800 dark:text-white text-sm sm:text-base mb-2">
                    معلومات{" "}
                    {deliveryType === "delivery" ? "التوصيل" : "الاستلام"}
                  </h4>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        طريقة{" "}
                        {deliveryType === "delivery" ? "التوصيل" : "الاستلام"}:
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {deliveryType === "delivery"
                          ? "توصيل للمنزل"
                          : "استلام من المطعم"}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs sm:text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        الفرع:
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-white">
                        {selectedBranch ? selectedBranch.name : "غير محدد"}
                      </span>
                    </div>

                    {deliveryType === "delivery" && selectedArea && (
                      <>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            منطقة التوصيل:
                          </span>
                          <span className="font-semibold text-gray-800 dark:text-white">
                            {selectedArea.areaName}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            رسوم التوصيل:
                          </span>
                          <span className="font-semibold text-[#E41E26] dark:text-[#FDB913]">
                            {getDeliveryFee().toFixed(2)} ج.م
                          </span>
                        </div>
                      </>
                    )}

                    {deliveryType === "pickup" && (
                      <>
                        <div className="flex justify-between text-xs sm:text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            رسوم الاستلام:
                          </span>
                          <span className="font-semibold text-[#E41E26] dark:text-[#FDB913]">
                            {getDeliveryFee().toFixed(2)} ج.م
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                disabled={
                  cartItems.length === 0 ||
                  !selectedBranch ||
                  (deliveryType === "delivery" && !selectedArea) ||
                  (deliveryType === "delivery" && userAddresses.length === 0) ||
                  (deliveryType === "delivery" && !selectedAddress)
                }
                className={`w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  cartItems.length === 0 ||
                  !selectedBranch ||
                  (deliveryType === "delivery" && !selectedArea) ||
                  (deliveryType === "delivery" && userAddresses.length === 0) ||
                  (deliveryType === "delivery" && !selectedAddress)
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl"
                }`}
              >
                <FaLocationArrow className="text-sm" />
                المتابعة للدفع
              </motion.button>

              {/* Continue Shopping */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/")}
                className="w-full mt-3 sm:mt-4 border-2 border-[#E41E26] dark:border-[#FDB913] text-[#E41E26] dark:text-[#FDB913] py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:bg-[#E41E26] dark:hover:bg-[#FDB913] hover:text-white transition-all duration-300"
              >
                مواصلة التسوق
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
