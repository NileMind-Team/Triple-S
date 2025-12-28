import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaFire,
  FaClock,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaCheck,
  FaPlusCircle,
  FaSave,
  FaTimes,
  FaLayerGroup,
  FaStickyNote,
  FaPercent,
} from "react-icons/fa";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import "../style/ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);
  const [userRoles, setUserRoles] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [isSticky, setIsSticky] = useState(false);
  const [addonsData, setAddonsData] = useState([]);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [editingOption, setEditingOption] = useState(null);
  const [currentAddonId, setCurrentAddonId] = useState(null);
  const [optionForm, setOptionForm] = useState({
    name: "",
    price: 0,
  });

  const [showAddonTypeModal, setShowAddonTypeModal] = useState(false);
  const [addonTypeForm, setAddonTypeForm] = useState({
    name: "",
    canSelectMultipleOptions: false,
    isSelectionRequired: false,
  });

  const [additionalNotes, setAdditionalNotes] = useState("");
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [categoryInfo, setCategoryInfo] = useState(null);
  const [newAddonOptions, setNewAddonOptions] = useState([]);
  const modalRef = useRef(null);
  const addonTypeModalRef = useRef(null);
  const notesModalRef = useRef(null);

  const isMobile = () => {
    return window.innerWidth < 768;
  };

  const showMessage = (type, title, text, options = {}) => {
    const hasButtons =
      options.showConfirmButton === true ||
      (options.showCancelButton !== undefined && options.showCancelButton);

    if (hasButtons) {
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
        showCancelButton:
          options.showCancelButton !== undefined
            ? options.showCancelButton
            : false,
        confirmButtonText: options.confirmButtonText || "موافق",
        cancelButtonText: options.cancelButtonText || "إلغاء",
        ...options,
      });
      return;
    }

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
          top: "10px",
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
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          return;
        }

        const response = await axiosInstance.get("/api/Account/Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = response.data;
        const roles = userData.roles || [];
        setUserRoles(roles);

        const hasAdminOrRestaurantOrBranchRole =
          roles.includes("Admin") ||
          roles.includes("Restaurant") ||
          roles.includes("Branch");

        setIsAdminOrRestaurantOrBranch(hasAdminOrRestaurantOrBranchRole);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAdminOrRestaurantOrBranch(false);
      }
    };

    checkUserRole();
  }, []);

  const fetchCartItemsCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axiosInstance.get("/api/CartItems/GetAll");
      const cartItems = response.data;

      const totalCount = cartItems.reduce(
        (total, item) => total + item.quantity,
        0
      );
      setCartItemsCount(totalCount);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      setCartItemsCount(0);
    }
  };

  const fetchCategoryInfo = async (categoryId) => {
    try {
      if (!categoryId) return;

      const response = await axiosInstance.get(
        `/api/Categories/Get/${categoryId}`
      );
      setCategoryInfo(response.data);
    } catch (error) {
      console.error("Error fetching category info:", error);
      setCategoryInfo(null);
    }
  };

  const fetchProductDetails = async () => {
    try {
      setLoading(true);

      const response = await axiosInstance.get(`/api/MenuItems/Get/${id}`);
      const productData = response.data;

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

      setAddonsData(transformedAddons);

      const finalPrice = productData.itemOffer
        ? productData.itemOffer.isPercentage
          ? productData.basePrice *
            (1 - productData.itemOffer.discountValue / 100)
          : productData.basePrice - productData.itemOffer.discountValue
        : productData.basePrice;

      const transformedProduct = {
        id: productData.id,
        name: productData.name,
        category: productData.category?.name?.toLowerCase() || "meals",
        categoryId: productData.category?.id,
        price: productData.basePrice,
        isPriceBasedOnRequest: productData.basePrice === 0,
        finalPrice: finalPrice,
        image: productData.imageUrl
          ? `https://restaurant-template.runasp.net/${productData.imageUrl}`
          : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
        ingredients: [],
        description: productData.description,
        isActive: productData.isActive,
        isAvailable: productData.isAvailable !== false, // Assuming true if not specified
        calories: productData.calories,
        preparationTimeStart: productData.preparationTimeStart,
        preparationTimeEnd: productData.preparationTimeEnd,
        availabilityTime: {
          alwaysAvailable: productData.isAllTime,
          startTime:
            productData.menuItemSchedules?.[0]?.startTime?.substring(0, 5) ||
            "",
          endTime:
            productData.menuItemSchedules?.[0]?.endTime?.substring(0, 5) || "",
        },
        availabilityDays: {
          everyday: productData.isAllTime,
          specificDays:
            productData.menuItemSchedules?.map((schedule) =>
              getDayName(schedule.day)
            ) || [],
        },
        menuItemSchedules: productData.menuItemSchedules || [],
        typesWithOptions: productData.typesWithOptions || [],
        canSelectMultipleOptions: productData.canSelectMultipleOptions,
        isSelectionRequired: productData.isSelectionRequired,
        itemOffer: productData.itemOffer,
      };

      setProduct(transformedProduct);

      if (productData.category?.id) {
        fetchCategoryInfo(productData.category.id);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      showMessage("error", "خطأ", "فشل في تحميل تفاصيل المنتج", {
        timer: 2000,
      });
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductDetails();
    fetchCartItemsCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const cartSection = document.getElementById("cart-section");
      if (cartSection) {
        const rect = cartSection.getBoundingClientRect();
        setIsSticky(rect.top > 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        handleCloseOptionModal();
      }
      if (
        addonTypeModalRef.current &&
        !addonTypeModalRef.current.contains(event.target)
      ) {
        handleCloseAddonTypeModal();
      }
      if (
        notesModalRef.current &&
        !notesModalRef.current.contains(event.target)
      ) {
        handleCloseNotesModal();
      }
    };

    if (showOptionModal || showAddonTypeModal || showNotesModal) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showOptionModal, showAddonTypeModal, showNotesModal]);

  const getDayName = (dayNumber) => {
    const days = [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    return days[dayNumber - 1] || "";
  };

  const toArabicNumbers = (num) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().replace(/\d/g, (digit) => arabicNumbers[digit]);
  };

  const formatOfferText = (offer) => {
    if (!offer) return "";
    if (offer.isPercentage) {
      return `خصم ${offer.discountValue}%`;
    } else {
      return `خصم ${offer.discountValue} ج.م`;
    }
  };

  const formatPriceDisplay = (product) => {
    if (product.isPriceBasedOnRequest) {
      return (
        <div className="text-[#E41E26] font-bold text-2xl md:text-3xl">
          السعر حسب الطلب
        </div>
      );
    }

    if (product.itemOffer && product.itemOffer.isEnabled) {
      return (
        <>
          <div className="text-gray-400 dark:text-gray-500 text-base md:text-lg line-through">
            {toArabicNumbers(product.price)} ج.م
          </div>
          <div className="text-[#E41E26] font-bold text-2xl md:text-3xl">
            {toArabicNumbers(product.finalPrice.toFixed(2))} ج.م
          </div>
        </>
      );
    }

    return (
      <div className="text-[#E41E26] font-bold text-2xl md:text-3xl">
        {toArabicNumbers(product.price)} ج.م
      </div>
    );
  };

  const isCategoryDisabled = () => {
    if (!categoryInfo) return false;
    return !categoryInfo.isActive;
  };

  // تحديث الدالة لتأخذ بعين الاعتبار isActive و isAvailable
  const isProductActive = () => {
    if (!product) return false;
    // المنتج يعتبر مفعل إذا كان isActive = true و isAvailable = true
    return product.isActive && product.isAvailable;
  };

  const isProductAvailableForCart = () => {
    if (!product) return false;

    if (!isProductActive()) {
      return false;
    }

    return !isCategoryDisabled();
  };

  const canToggleProductActive = () => {
    if (!product?.categoryId) return true;
    return !isCategoryDisabled();
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

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

  const calculateTotalPrice = () => {
    if (!product) return 0;

    let total = 0;

    if (!product.isPriceBasedOnRequest) {
      const basePrice =
        product.itemOffer && product.itemOffer.isEnabled
          ? product.finalPrice
          : product.price;
      total = basePrice * quantity;
    }

    Object.values(selectedAddons).forEach((optionIds) => {
      optionIds.forEach((optionId) => {
        addonsData.forEach((addon) => {
          const option = addon.options.find((opt) => opt.id === optionId);
          if (option) {
            total += option.price * quantity;
          }
        });
      });
    });

    return total;
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "تسجيل الدخول مطلوب",
        text: "يجب تسجيل الدخول لإضافة المنتجات إلى السلة",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#E41E26",
        cancelButtonColor: "#6B7280",
        confirmButtonText: "تسجيل الدخول",
        cancelButtonText: "إنشاء حساب جديد",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          navigate("/register");
        }
      });
      return;
    }

    if (!isProductAvailableForCart()) {
      showMessage(
        "warning",
        "تحذير",
        `لا يمكن إضافة هذا المنتج إلى السلة حالياً`,
        { timer: 2000 }
      );
      return;
    }

    const requiredAddons = addonsData.filter(
      (addon) => addon.isSelectionRequired
    );
    const missingRequiredAddons = requiredAddons.filter(
      (addon) => !selectedAddons[addon.id]
    );

    if (missingRequiredAddons.length > 0) {
      showMessage(
        "warning",
        "تحذير",
        `يرجى اختيار ${missingRequiredAddons
          .map((addon) => addon.title)
          .join(" و ")}`,
        { timer: 2000 }
      );
      return;
    }

    try {
      const options = [];
      Object.values(selectedAddons).forEach((optionIds) => {
        optionIds.forEach((optionId) => {
          options.push(optionId);
        });
      });

      await axiosInstance.post("/api/CartItems/AddCartItem", {
        menuItemId: product.id,
        quantity: quantity,
        options: options,
        note: additionalNotes.trim(),
      });

      await fetchCartItemsCount();

      showMessage(
        "success",
        "تم بنجاح!",
        `تم إضافة ${toArabicNumbers(quantity)} ${product.name} إلى سلة التسوق`,
        { timer: 1500 }
      );

      setQuantity(1);
      setSelectedAddons({});
      setAdditionalNotes("");
    } catch (error) {
      console.error("Error adding to cart:", error);
      showMessage("error", "خطأ", "فشل في إضافة المنتج إلى السلة", {
        timer: 2000,
      });
    }
  };

  const handleEditProduct = () => {
    navigate("/products/edit", { state: { productId: product.id } });
  };

  const handleDeleteProduct = async () => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/MenuItems/Delete/${product.id}`);
          showMessage("success", "تم الحذف!", "تم حذف المنتج بنجاح", {
            timer: 2000,
          });
          setTimeout(() => {
            navigate("/");
          }, 2000);
        } catch (error) {
          console.error("Error deleting product:", error);
          showMessage("error", "خطأ", "فشل في حذف المنتج", { timer: 2000 });
        }
      }
    });
  };

  const handleToggleActive = async () => {
    if (!canToggleProductActive()) {
      showMessage(
        "error",
        "لا يمكن التعديل",
        "لا يمكن تعديل حالة المنتج لأن الفئة معطلة",
        { timer: 2000 }
      );
      return;
    }

    try {
      await axiosInstance.put(
        `/api/MenuItems/ChangeMenuItemActiveStatus/${product.id}`
      );

      setProduct({ ...product, isActive: !product.isActive });

      const currentActiveStatus = isProductActive();
      showMessage(
        "success",
        "تم تحديث الحالة!",
        `تم ${currentActiveStatus ? "تعطيل" : "تفعيل"} المنتج`,
        { timer: 1500 }
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      showMessage("error", "خطأ", "فشل في تحديث حالة المنتج", { timer: 2000 });
    }
  };

  const handleManageOffers = async (e) => {
    e?.stopPropagation();

    try {
      const response = await axiosInstance.get("/api/ItemOffers/GetAll");
      const offersData = response.data;

      const existingOffer = offersData.find(
        (offer) => offer.menuItemId === product.id
      );

      if (existingOffer) {
        navigate("/admin/item-offers", {
          state: {
            selectedProductId: product.id,
            selectedOfferId: existingOffer.id,
          },
        });
      } else {
        navigate("/admin/item-offers", {
          state: {
            selectedProductId: product.id,
          },
        });
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      showMessage("error", "خطأ", "فشل في تحميل بيانات الخصومات", {
        timer: 2000,
      });
    }
  };

  const handleOpenAddOptionModal = (addonId) => {
    setCurrentAddonId(addonId);
    setEditingOption(null);
    setOptionForm({
      name: "",
      price: 0,
    });
    setShowOptionModal(true);
  };

  const handleOpenEditOptionModal = (addonId, option) => {
    setCurrentAddonId(addonId);
    setEditingOption(option);
    setOptionForm({
      name: option.name,
      price: option.price,
    });
    setShowOptionModal(true);
  };

  const handleCloseOptionModal = () => {
    setShowOptionModal(false);
    setEditingOption(null);
    setCurrentAddonId(null);
    setOptionForm({
      name: "",
      price: 0,
    });
  };

  const handleOptionFormChange = (e) => {
    const { name, value } = e.target;
    setOptionForm((prev) => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSaveOption = async () => {
    if (!optionForm.name.trim()) {
      showMessage("error", "خطأ", "يرجى إدخال اسم الخيار", { timer: 2000 });
      return;
    }

    try {
      if (editingOption) {
        await axiosInstance.put(
          `/api/MenuItemOptions/Update/${editingOption.id}`,
          {
            name: optionForm.name,
            price: optionForm.price,
            typeId: editingOption.typeId,
          }
        );

        showMessage("success", "تم بنجاح!", "تم تحديث الخيار بنجاح", {
          timer: 2000,
        });
      } else {
        await axiosInstance.post(`/api/MenuItemOptions/Add`, {
          menuItemId: parseInt(id),
          typeId: currentAddonId,
          name: optionForm.name,
          price: optionForm.price,
        });

        showMessage("success", "تم بنجاح!", "تم إضافة الخيار بنجاح", {
          timer: 2000,
        });
      }

      await fetchProductDetails();
      handleCloseOptionModal();
    } catch (error) {
      console.error("Error saving option:", error);
      showMessage("error", "خطأ", "فشل في حفظ الخيار", { timer: 2000 });
    }
  };

  const handleDeleteOption = async (optionId) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/MenuItemOptions/Delete/${optionId}`);

          showMessage("success", "تم بنجاح!", "تم حذف الخيار بنجاح", {
            timer: 2000,
          });

          await fetchProductDetails();
        } catch (error) {
          console.error("Error deleting option:", error);
          showMessage("error", "خطأ", "فشل في حذف الخيار", { timer: 2000 });
        }
      }
    });
  };

  const handleOpenAddAddonTypeModal = () => {
    setAddonTypeForm({
      name: "",
      canSelectMultipleOptions: false,
      isSelectionRequired: false,
    });
    setNewAddonOptions([]);
    setShowAddonTypeModal(true);
  };

  const handleCloseAddonTypeModal = () => {
    setShowAddonTypeModal(false);
    setAddonTypeForm({
      name: "",
      canSelectMultipleOptions: false,
      isSelectionRequired: false,
    });
    setNewAddonOptions([]);
  };

  const handleAddonTypeFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddonTypeForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addNewOptionField = () => {
    setNewAddonOptions((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: "",
        price: 0,
      },
    ]);
  };

  const updateNewOptionField = (id, field, value) => {
    setNewAddonOptions((prev) =>
      prev.map((option) =>
        option.id === id
          ? {
              ...option,
              [field]: field === "price" ? parseFloat(value) || 0 : value,
            }
          : option
      )
    );
  };

  const removeNewOptionField = (id) => {
    setNewAddonOptions((prev) => prev.filter((option) => option.id !== id));
  };

  const handleSaveAddonType = async () => {
    if (!addonTypeForm.name.trim()) {
      showMessage("error", "خطأ", "يرجى إدخال اسم نوع الإضافة", {
        timer: 2000,
      });
      return;
    }

    try {
      const response = await axiosInstance.post(
        `/api/MenuItemOptionTypes/Add`,
        {
          menuItemId: parseInt(id),
          name: addonTypeForm.name,
          canSelectMultipleOptions: addonTypeForm.canSelectMultipleOptions,
          isSelectionRequired: addonTypeForm.isSelectionRequired,
        }
      );

      const newAddonTypeId = response.data.id;

      if (newAddonOptions.length > 0) {
        const optionPromises = newAddonOptions.map((option) => {
          if (option.name.trim()) {
            return axiosInstance.post(`/api/MenuItemOptions/Add`, {
              menuItemId: parseInt(id),
              typeId: newAddonTypeId,
              name: option.name,
              price: option.price,
            });
          }
          return Promise.resolve();
        });

        await Promise.all(optionPromises);
      }

      showMessage(
        "success",
        "تم بنجاح!",
        "تم إضافة نوع الإضافة مع خياراته بنجاح",
        { timer: 2000 }
      );

      await fetchProductDetails();
      handleCloseAddonTypeModal();
    } catch (error) {
      console.error("Error saving addon type:", error);
      showMessage("error", "خطأ", "فشل في حفظ نوع الإضافة", { timer: 2000 });
    }
  };

  const handleOpenNotesModal = () => {
    setShowNotesModal(true);
  };

  const handleCloseNotesModal = () => {
    setShowNotesModal(false);
  };

  const handleSaveNotes = () => {
    handleCloseNotesModal();
    showMessage("success", "تم بنجاح!", "تم حفظ التعليمات الإضافية", {
      timer: 1500,
    });
  };

  const handleClearNotes = () => {
    setAdditionalNotes("");
    showMessage("info", "تم المسح", "تم مسح التعليمات الإضافية", {
      timer: 1500,
    });
  };

  const isArabic = (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  const navigateToCart = () => {
    navigate("/cart");
  };

  // التحقق من صلاحيات المستخدم
  const isAdmin = userRoles.includes("Admin");
  const isRestaurant = userRoles.includes("Restaurant");
  const isBranch = userRoles.includes("Branch");

  // Branch users can only see the toggle active button
  const canShowAdminButtons = isAdmin || isRestaurant;
  const canShowToggleButton = isAdmin || isRestaurant || isBranch;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            المنتج غير موجود
          </h2>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-300">
      {/* Option Modal */}
      {showOptionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {editingOption ? "تعديل الخيار" : "إضافة خيار جديد"}
              </h3>
              <button
                onClick={handleCloseOptionModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  اسم الخيار *
                </label>
                <input
                  type="text"
                  name="name"
                  value={optionForm.name}
                  onChange={handleOptionFormChange}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent"
                  placeholder="أدخل اسم الخيار"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  السعر (ج.م)
                </label>
                <input
                  type="number"
                  name="price"
                  value={optionForm.price}
                  onChange={handleOptionFormChange}
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent"
                  placeholder="أدخل السعر"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleCloseOptionModal}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveOption}
                className="flex-1 py-3 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <FaSave />
                {editingOption ? "تحديث" : "حفظ"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Addon Type Modal */}
      {showAddonTypeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            ref={addonTypeModalRef}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-y-auto max-h-[90vh]"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                إضافة نوع إضافة جديد
              </h3>
              <button
                onClick={handleCloseAddonTypeModal}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes className="text-lg" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    اسم نوع الإضافة *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={addonTypeForm.name}
                    onChange={handleAddonTypeFormChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent"
                    placeholder="أدخل اسم نوع الإضافة"
                    autoFocus
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="canSelectMultipleOptions"
                      name="canSelectMultipleOptions"
                      checked={addonTypeForm.canSelectMultipleOptions}
                      onChange={handleAddonTypeFormChange}
                      className="w-5 h-5 text-[#E41E26] rounded focus:ring-[#E41E26]"
                    />
                    <label
                      htmlFor="canSelectMultipleOptions"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      يمكن اختيار أكثر من خيار
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isSelectionRequired"
                      name="isSelectionRequired"
                      checked={addonTypeForm.isSelectionRequired}
                      onChange={handleAddonTypeFormChange}
                      className="w-5 h-5 text-[#E41E26] rounded focus:ring-[#E41E26]"
                    />
                    <label
                      htmlFor="isSelectionRequired"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      اختيار إجباري
                    </label>
                  </div>
                </div>
              </div>

              {/* Add Options Section */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                    إضافة خيارات
                  </h4>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addNewOptionField}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                  >
                    <FaPlusCircle className="text-xs" />
                    إضافة خيار
                  </motion.button>
                </div>

                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {newAddonOptions.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-2">
                      لم يتم إضافة أي خيارات بعد
                    </p>
                  ) : (
                    newAddonOptions.map((option, index) => (
                      <div
                        key={option.id}
                        className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            خيار #{index + 1}
                          </span>
                          <button
                            onClick={() => removeNewOptionField(option.id)}
                            className="text-red-500 hover:text-red-700 transition-colors"
                            type="button"
                          >
                            <FaTrash className="text-xs" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <input
                              type="text"
                              value={option.name}
                              onChange={(e) =>
                                updateNewOptionField(
                                  option.id,
                                  "name",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-[#E41E26] focus:border-transparent"
                              placeholder="اسم الخيار"
                            />
                          </div>
                          <div>
                            <input
                              type="number"
                              value={option.price}
                              onChange={(e) =>
                                updateNewOptionField(
                                  option.id,
                                  "price",
                                  e.target.value
                                )
                              }
                              min="0"
                              step="0.01"
                              className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white focus:ring-1 focus:ring-[#E41E26] focus:border-transparent"
                              placeholder="السعر (ج.م)"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleCloseAddonTypeModal}
                className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveAddonType}
                className="flex-1 py-3 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <FaSave />
                حفظ
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
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
                    additionalNotes.length >= 450
                      ? "text-red-500"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {additionalNotes.length}/500
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
                <FaCheck className="text-sm" />
                حفظ
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-full p-3 sm:p-4 shadow-2xl z-40 cursor-pointer hover:scale-110 transition-transform duration-200 ${
          cartItemsCount === 0 ? "opacity-70" : ""
        }`}
        onClick={navigateToCart}
      >
        <div className="relative">
          <FaShoppingCart className="w-4 h-4 sm:w-6 sm:h-6" />
          {cartItemsCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-[#E41E26] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold">
              {cartItemsCount}
            </span>
          )}
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[555px] object-contain"
              />

              <div
                className={`absolute top-3 md:top-4 right-3 md:right-4 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold ${
                  isProductActive()
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {isProductActive() ? "نشط" : "غير نشط"}
              </div>

              {product.itemOffer && product.itemOffer.isEnabled && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-3 md:top-4 left-3 md:left-4 z-10"
                >
                  <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl shadow-2xl flex items-center gap-1.5 md:gap-2">
                    <FaFire className="text-white animate-pulse" size={14} />
                    <span className="text-xs md:text-sm font-bold whitespace-nowrap">
                      {formatOfferText(product.itemOffer)}
                    </span>
                  </div>
                </motion.div>
              )}

              {/* Admin/Restaurant/Branch Buttons */}
              {(canShowAdminButtons || canShowToggleButton) && (
                <div className="absolute top-12 md:top-16 left-3 md:left-4 flex flex-col gap-2 z-10">
                  {/* Toggle Active Button - Available for Admin, Restaurant, and Branch */}
                  {canShowToggleButton && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleToggleActive}
                      disabled={!canToggleProductActive()}
                      className={`p-2 md:p-3 rounded-xl shadow-lg transition-colors flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm ${
                        isProductActive()
                          ? "bg-yellow-500 text-white hover:bg-yellow-600"
                          : "bg-green-500 text-white hover:bg-green-600"
                      } ${
                        !canToggleProductActive()
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isProductActive() ? (
                        <FaTimesCircle className="text-sm md:text-base" />
                      ) : (
                        <FaCheckCircle className="text-sm md:text-base" />
                      )}
                      <span>{isProductActive() ? "تعطيل" : "تفعيل"}</span>
                    </motion.button>
                  )}

                  {/* Admin/Restaurant Only Buttons */}
                  {canShowAdminButtons && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleEditProduct}
                        className="bg-blue-500 text-white p-2 md:p-3 rounded-xl shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
                      >
                        <FaEdit className="text-sm md:text-base" />
                        <span>تعديل</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleManageOffers}
                        className="bg-purple-500 text-white p-2 md:p-3 rounded-xl shadow-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
                      >
                        <FaPercent className="text-sm md:text-base" />
                        <span>خصومات</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDeleteProduct}
                        className="bg-red-500 text-white p-2 md:p-3 rounded-xl shadow-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-1 md:gap-2 text-xs md:text-sm"
                      >
                        <FaTrash className="text-sm md:text-base" />
                        <span>حذف</span>
                      </motion.button>
                    </>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 md:p-6 mb-4 md:mb-6 h-auto lg:max-h-[555px] flex flex-col">
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto custom-scrollbar pr-2 pb-4">
                  <div className="mb-4 md:mb-6">
                    <h2
                      className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3 md:mb-4"
                      dir={isArabic(product.name) ? "rtl" : "ltr"}
                    >
                      {product.name}
                    </h2>

                    <p
                      className="text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed mb-4 md:mb-6"
                      dir={isArabic(product.description) ? "rtl" : "ltr"}
                    >
                      {product.description}
                    </p>

                    <div className="flex items-center gap-2 md:gap-4 mb-3 md:mb-4">
                      {formatPriceDisplay(product)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                    {product.calories && (
                      <div
                        className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-3 md:p-4 rounded-xl md:rounded-2xl text-center"
                        dir="rtl"
                      >
                        <div className="flex items-center justify-center gap-2 mb-1 md:mb-2">
                          <FaFire className="text-orange-500 text-base md:text-lg" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">
                            السعرات الحرارية
                          </span>
                        </div>

                        <div className="text-orange-600 dark:text-orange-400 font-bold text-lg md:text-xl">
                          {toArabicNumbers(product.calories)} كالوري
                        </div>
                      </div>
                    )}

                    {(product.preparationTimeStart ||
                      product.preparationTimeEnd) && (
                      <div
                        className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-3 md:p-4 rounded-xl md:rounded-2xl text-center"
                        dir="rtl"
                      >
                        <div className="flex items-center justify-center gap-2 mb-1 md:mb-2">
                          <FaClock className="text-blue-500 text-base md:text-lg" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">
                            وقت التحضير
                          </span>
                        </div>

                        <div className="text-blue-600 dark:text-blue-400 font-bold text-base md:text-lg">
                          {product.preparationTimeStart &&
                          product.preparationTimeEnd
                            ? `${toArabicNumbers(
                                product.preparationTimeStart
                              )} - ${toArabicNumbers(
                                product.preparationTimeEnd
                              )} دقيقة`
                            : product.preparationTimeStart
                            ? `${toArabicNumbers(
                                product.preparationTimeStart
                              )} دقيقة`
                            : `${toArabicNumbers(
                                product.preparationTimeEnd
                              )} دقيقة`}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    {canShowAdminButtons && (
                      <div className="flex justify-end">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleOpenAddAddonTypeModal}
                          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                          dir="rtl"
                        >
                          <FaLayerGroup />
                          إضافة نوع إضافة جديد
                        </motion.button>
                      </div>
                    )}

                    {addonsData.length > 0 &&
                      addonsData.map((addon) => (
                        <div
                          key={addon.id}
                          className="bg-gray-50 dark:bg-gray-700/50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-gray-600 relative group"
                          dir="rtl"
                        >
                          <div className="flex items-center justify-between mb-2 md:mb-3">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-base md:text-lg text-gray-800 dark:text-gray-200">
                                {addon.title}
                              </h3>
                              {addon.isSelectionRequired && (
                                <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 px-2 py-1 rounded-full">
                                  مطلوب
                                </span>
                              )}
                              {addon.canSelectMultipleOptions && (
                                <span className="text-xs bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full">
                                  متعدد
                                </span>
                              )}
                            </div>

                            {canShowAdminButtons && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  handleOpenAddOptionModal(addon.id)
                                }
                                className="bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
                              >
                                <FaPlusCircle className="text-xs" />
                                إضافة خيار
                              </motion.button>
                            )}
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                            {addon.options.map((option) => {
                              const isSelected = selectedAddons[
                                addon.id
                              ]?.includes(option.id);
                              return (
                                <div key={option.id} className="relative">
                                  <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() =>
                                      handleAddonSelect(
                                        addon.id,
                                        option.id,
                                        addon.type
                                      )
                                    }
                                    className={`w-full p-2 md:p-3 rounded-lg md:rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                                      isSelected
                                        ? "border-[#E41E26] bg-red-50 dark:bg-red-900/20"
                                        : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500"
                                    }`}
                                    dir="rtl"
                                  >
                                    <div className="flex items-center gap-1 md:gap-2">
                                      <span
                                        className={`font-medium text-sm md:text-base ${
                                          isSelected
                                            ? "text-[#E41E26]"
                                            : "text-gray-700 dark:text-gray-300"
                                        }`}
                                      >
                                        {option.name}
                                      </span>
                                      {isSelected && (
                                        <FaCheck className="text-[#E41E26] text-xs md:text-sm" />
                                      )}
                                    </div>

                                    {option.price > 0 && (
                                      <span className="text-xs md:text-sm text-green-600 dark:text-green-400 font-semibold">
                                        +{toArabicNumbers(option.price)} ج.م
                                      </span>
                                    )}
                                  </motion.button>

                                  {canShowAdminButtons && (
                                    <div className="absolute -top-2 -right-2 flex gap-1 z-10">
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleOpenEditOptionModal(
                                            addon.id,
                                            option
                                          );
                                        }}
                                        className="bg-blue-500 text-white p-1.5 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
                                        title="تعديل"
                                      >
                                        <FaEdit className="text-xs" />
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteOption(option.id);
                                        }}
                                        className="bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition-colors shadow-md"
                                        title="حذف"
                                      >
                                        <FaTrash className="text-xs" />
                                      </motion.button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                    {/* التعديلات هنا: عرض التعليمات مباشرة إذا كانت موجودة */}
                    <div
                      onClick={handleOpenNotesModal}
                      className={`w-full rounded-xl md:rounded-2xl p-3 md:p-4 text-center transition-all duration-300 cursor-pointer ${
                        additionalNotes
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border-2 border-solid border-green-300 dark:border-green-600 hover:border-green-400 dark:hover:border-green-500"
                          : "bg-gradient-to-r from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 border-2 border-dashed border-indigo-300 dark:border-indigo-600 hover:border-solid hover:border-indigo-400 dark:hover:border-indigo-500"
                      }`}
                      dir="rtl"
                    >
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div
                          className={`p-2 rounded-full ${
                            additionalNotes
                              ? "bg-green-100 dark:bg-green-800/50"
                              : "bg-indigo-100 dark:bg-indigo-800/50"
                          }`}
                        >
                          <FaStickyNote
                            className={`text-xl ${
                              additionalNotes
                                ? "text-green-600 dark:text-green-400"
                                : "text-indigo-600 dark:text-indigo-400"
                            }`}
                          />
                        </div>
                        <div>
                          <h4
                            className={`font-semibold text-base md:text-lg ${
                              additionalNotes
                                ? "text-green-700 dark:text-green-300"
                                : "text-indigo-700 dark:text-indigo-300"
                            }`}
                          >
                            {additionalNotes
                              ? "تعليمات إضافية"
                              : "إضافة تعليمات إضافية"}
                          </h4>
                          <p
                            className={`text-xs md:text-sm mt-1 ${
                              additionalNotes
                                ? "text-green-600/70 dark:text-green-400/70"
                                : "text-indigo-600/70 dark:text-indigo-400/70"
                            }`}
                          >
                            {additionalNotes
                              ? `انقر لتعديل التعليمات: ${additionalNotes.substring(
                                  0,
                                  60
                                )}${additionalNotes.length > 60 ? "..." : ""}`
                              : "انقر لإضافة تعليمات إضافية"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              id="cart-section"
              className={`bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 md:p-6 transition-all duration-300 ${
                isSticky
                  ? "sticky bottom-4 z-10 lg:relative lg:bottom-0"
                  : "relative"
              }`}
            >
              <div
                className="flex flex-row items-center justify-between gap-4 mb-4 md:mb-6"
                dir="rtl"
              >
                <div
                  className="w-[95px] sm:w-auto flex items-center justify-between sm:justify-start gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg md:rounded-xl p-1.5 sm:p-3 flex-shrink-0 order-2 sm:order-1"
                  dir="ltr"
                >
                  <button
                    onClick={decrementQuantity}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <FaMinus className="text-sm" />
                  </button>

                  <span className="font-semibold text-base min-w-6 text-center dark:text-gray-200">
                    {toArabicNumbers(quantity)}
                  </span>

                  <button
                    onClick={incrementQuantity}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                </div>

                <div className="text-xl md:text-2xl font-bold text-[#E41E26] whitespace-nowrap text-center sm:text-right order-1 sm:order-2">
                  الإجمالي: {toArabicNumbers(calculateTotalPrice().toFixed(2))}{" "}
                  ج.م
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={!isProductAvailableForCart()}
                className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-lg md:text-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 md:gap-4 ${
                  isProductAvailableForCart()
                    ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
                dir="rtl"
              >
                <FaShoppingCart className="text-lg md:text-xl" />

                {isProductAvailableForCart()
                  ? `أضف إلى السلة - ${toArabicNumbers(
                      calculateTotalPrice().toFixed(2)
                    )} ج.م`
                  : "غير متوفر"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
