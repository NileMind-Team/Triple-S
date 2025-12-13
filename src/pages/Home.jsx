import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingCart,
  FaPlus,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaList,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaSave,
  FaTimes,
  FaLayerGroup,
  FaTag,
  FaHeart,
  FaRegHeart,
  FaFire,
  FaPercent,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import HeroSwipper from "./HeroSwipper";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  // eslint-disable-next-line no-unused-vars
  const [searchTerm, setSearchTerm] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [cartItemsCount, setCartItemsCount] = useState(0);
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showCategoriesManager, setShowCategoriesManager] = useState(false);
  const [categories, setCategories] = useState([
    { id: "all", name: "جميع العناصر" },
    { id: "offers", name: "العروض" },
  ]);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: "", isActive: true });
  const categoriesContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          setLoading(false);
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
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/Categories/GetAll");
        const categoriesData = response.data;

        const transformedCategories = [
          { id: "all", name: "جميع العناصر" },
          { id: "offers", name: "العروض" },
          ...categoriesData.map((category) => ({
            id: category.id.toString(),
            name: category.name,
            isActive: category.isActive,
            originalId: category.id,
          })),
        ];

        setCategories(transformedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل التصنيفات",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);

        const params = {};
        if (selectedCategory !== "all" && selectedCategory !== "offers") {
          params.categoryId = parseInt(selectedCategory);
        }

        const response = await axiosInstance.get(
          "/api/MenuItems/GetAllWithoutPagination",
          {
            params,
          }
        );
        const productsData = response.data;

        const transformedProducts = productsData.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category?.name?.toLowerCase() || "meals",
          categoryId: product.category?.id,
          price: product.basePrice,
          image: product.imageUrl
            ? `https://restaurant-template.runasp.net/${product.imageUrl}`
            : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
          ingredients: [],
          description: product.description,
          isActive: product.isActive,
          calories: product.calories,
          preparationTimeStart: product.preparationTimeStart,
          preparationTimeEnd: product.preparationTimeEnd,
          availabilityTime: {
            alwaysAvailable: product.isAllTime,
            startTime:
              product.menuItemSchedules?.[0]?.startTime?.substring(0, 5) || "",
            endTime:
              product.menuItemSchedules?.[0]?.endTime?.substring(0, 5) || "",
          },
          availabilityDays: {
            everyday: product.isAllTime,
            specificDays:
              product.menuItemSchedules?.map((schedule) =>
                getDayName(schedule.day)
              ) || [],
          },
          menuItemSchedules: product.menuItemSchedules || [],
          itemOffer: product.itemOffer,
          finalPrice: product.itemOffer
            ? product.itemOffer.isPercentage
              ? product.basePrice * (1 - product.itemOffer.discountValue / 100)
              : product.basePrice - product.itemOffer.discountValue
            : product.basePrice,
          hasOffer: product.itemOffer && product.itemOffer.isEnabled,
        }));

        setProducts(transformedProducts);
        let filtered = transformedProducts;

        if (selectedCategory === "offers") {
          filtered = transformedProducts.filter(
            (product) => product.itemOffer && product.itemOffer.isEnabled
          );
        }

        setFilteredProducts(filtered);
      } catch (error) {
        console.error("Error fetching products:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل المنتجات",
          timer: 2000,
          showConfirmButton: false,
        });
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

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

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axiosInstance.get("/api/Favorites/GetAll");
        setFavorites(response.data);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };

    fetchFavorites();
    fetchCartItemsCount();
  }, []);

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

  useEffect(() => {
    if (!searchTerm) {
      if (selectedCategory === "offers") {
        setFilteredProducts(
          products.filter(
            (product) => product.itemOffer && product.itemOffer.isEnabled
          )
        );
      } else if (selectedCategory === "all") {
        setFilteredProducts(products);
      } else {
        setFilteredProducts(
          products.filter(
            (product) => product.categoryId === parseInt(selectedCategory)
          )
        );
      }
      return;
    }

    let baseProducts = products;

    if (selectedCategory === "offers") {
      baseProducts = products.filter(
        (product) => product.itemOffer && product.itemOffer.isEnabled
      );
    } else if (selectedCategory !== "all") {
      baseProducts = products.filter(
        (product) => product.categoryId === parseInt(selectedCategory)
      );
    }

    const filtered = baseProducts.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.ingredients.some((ingredient) =>
          ingredient.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products, selectedCategory]);

  const isProductInFavorites = (productId) => {
    return favorites.some((fav) => fav.menuItemId === productId);
  };

  const handleToggleFavorite = async (product, e) => {
    e.stopPropagation();

    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "تسجيل الدخول مطلوب",
        text: "يجب تسجيل الدخول لإضافة المنتجات إلى المفضلة",
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

    try {
      if (isProductInFavorites(product.id)) {
        const favoriteItem = favorites.find(
          (fav) => fav.menuItemId === product.id
        );
        await axiosInstance.delete(`/api/Favorites/Delete/${favoriteItem.id}`);
        setFavorites(favorites.filter((fav) => fav.menuItemId !== product.id));

        toast.success(`تم إزالة ${product.name} من المفضلة`, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      } else {
        await axiosInstance.post("/api/Favorites/Add", {
          menuItemId: product.id,
        });

        const response = await axiosInstance.get("/api/Favorites/GetAll");
        setFavorites(response.data);

        toast.success(`تم إضافة ${product.name} إلى المفضلة`, {
          position: "top-right",
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("فشل في تحديث المفضلة", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
      });
    }
  };

  const handleProductDetails = (product) => {
    navigate(`/product/${product.id}`, { state: { product } });
  };

  const handleAddToCart = async (product, e) => {
    e.stopPropagation();

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

    if (!product.isActive) {
      Swal.fire({
        icon: "error",
        title: "المنتج غير متوفر",
        text: `${product.name} غير متوفر حالياً`,
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      await axiosInstance.post("/api/CartItems/AddCartItem", {
        menuItemId: product.id,
        quantity: 1,
        options: [],
      });

      await fetchCartItemsCount();

      Swal.fire({
        icon: "success",
        title: "تم الإضافة إلى السلة!",
        text: `تم إضافة ${product.name} إلى سلة التسوق`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في إضافة المنتج إلى السلة",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleEditProduct = (product, e) => {
    e.stopPropagation();
    navigate("/products/edit", { state: { productId: product.id } });
  };

  const handleManageOffers = async (product, e) => {
    e.stopPropagation();

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
    }
  };

  const handleDeleteProduct = async (productId, e) => {
    e.stopPropagation();

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
          await axiosInstance.delete(`/api/MenuItems/Delete/${productId}`);

          setProducts(products.filter((product) => product.id !== productId));
          Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف المنتج بنجاح",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error("Error deleting product:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف المنتج",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }
    });
  };

  const handleToggleActive = async (productId, e) => {
    e.stopPropagation();

    try {
      await axiosInstance.put(
        `/api/MenuItems/ChangeMenuItemActiveStatus/${productId}`
      );

      setProducts(
        products.map((product) =>
          product.id === productId
            ? { ...product, isActive: !product.isActive }
            : product
        )
      );

      setFilteredProducts(
        filteredProducts.map((product) =>
          product.id === productId
            ? { ...product, isActive: !product.isActive }
            : product
        )
      );

      Swal.fire({
        icon: "success",
        title: "تم تحديث الحالة!",
        text: `تم ${
          products.find((p) => p.id === productId).isActive ? "تعطيل" : "تفعيل"
        } المنتج`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating product status:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحديث حالة المنتج",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleAddNewProduct = () => {
    navigate("/products/new");
  };

  const handleEditCategory = (category) => {
    if (category.id === "all" || category.id === "offers") {
      Swal.fire({
        icon: "error",
        title: "لا يمكن التعديل",
        text: "لا يمكن تعديل هذا التصنيف",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }
    setEditingCategory({ ...category });
    setNewCategory({ name: "", isActive: true });
  };

  const handleSaveCategory = async () => {
    if (!editingCategory.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "اسم التصنيف مطلوب",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    if (editingCategory.id === "all" || editingCategory.id === "offers") {
      Swal.fire({
        icon: "error",
        title: "لا يمكن التعديل",
        text: "لا يمكن تعديل هذا التصنيف",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      await axiosInstance.put(
        `/api/Categories/Update/${editingCategory.originalId}`,
        {
          name: editingCategory.name,
          isActive: editingCategory.isActive,
        }
      );

      setCategories(
        categories.map((cat) =>
          cat.id === editingCategory.id ? { ...editingCategory } : cat
        )
      );

      setEditingCategory(null);
      Swal.fire({
        icon: "success",
        title: "تم التحديث!",
        text: "تم تحديث التصنيف بنجاح",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحديث التصنيف",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "اسم التصنيف مطلوب",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    try {
      const response = await axiosInstance.post("/api/Categories/Add", null, {
        params: {
          Name: newCategory.name,
          IsActive: newCategory.isActive,
        },
      });

      const newCategoryData = response.data;

      const newCat = {
        id: newCategoryData.id.toString(),
        name: newCategoryData.name,
        isActive: newCategoryData.isActive,
        originalId: newCategoryData.id,
      };

      setCategories([...categories, newCat]);
      setNewCategory({ name: "", isActive: true });

      Swal.fire({
        icon: "success",
        title: "تم الإضافة!",
        text: "تم إضافة التصنيف الجديد بنجاح",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error adding category:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في إضافة التصنيف",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (categoryId === "all" || categoryId === "offers") {
      Swal.fire({
        icon: "error",
        title: "لا يمكن الحذف",
        text: "لا يمكن حذف هذا التصنيف",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const category = categories.find((cat) => cat.id === categoryId);

    const productsInCategory = products.filter(
      (product) => product.categoryId === category.originalId
    );

    if (productsInCategory.length > 0) {
      Swal.fire({
        title: "لا يمكن حذف التصنيف",
        text: `يوجد ${productsInCategory.length} منتج في هذا التصنيف. يرجى إعادة تعيين أو حذف هذه المنتجات أولاً.`,
        icon: "warning",
        confirmButtonColor: "#E41E26",
        confirmButtonText: "حسناً",
      });
      return;
    }

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
          await axiosInstance.delete(
            `/api/Categories/Delete/${category.originalId}`
          );

          setCategories(categories.filter((cat) => cat.id !== categoryId));

          if (selectedCategory === categoryId) {
            setSelectedCategory("all");
          }

          Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف التصنيف بنجاح",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error("Error deleting category:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف التصنيف",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }
    });
  };

  const handleToggleCategoryActive = async (categoryId, e) => {
    e.stopPropagation();

    if (categoryId === "all" || categoryId === "offers") {
      Swal.fire({
        icon: "error",
        title: "لا يمكن التعديل",
        text: "لا يمكن تعديل هذا التصنيف",
        timer: 2000,
        showConfirmButton: false,
      });
      return;
    }

    const category = categories.find((cat) => cat.id === categoryId);

    try {
      await axiosInstance.put(
        `/api/Categories/ChangeCategoryActiveStatus/${category.originalId}`
      );

      setCategories(
        categories.map((cat) =>
          cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
        )
      );

      Swal.fire({
        icon: "success",
        title: "تم تحديث الحالة!",
        text: `تم ${category.isActive ? "تعطيل" : "تفعيل"} التصنيف`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating category status:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحديث حالة التصنيف",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const handleOpenCategoriesManager = () => {
    setShowCategoriesManager(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseCategoriesManager = () => {
    setShowCategoriesManager(false);
    setEditingCategory(null);
    setNewCategory({ name: "", isActive: true });
    document.body.style.overflow = "auto";
  };

  const scrollCategories = (direction) => {
    const container = categoriesContainerRef.current;
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.pageX - categoriesContainerRef.current.offsetLeft);
    setScrollLeft(categoriesContainerRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - categoriesContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    categoriesContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX - categoriesContainerRef.current.offsetLeft);
    setScrollLeft(categoriesContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const x = e.touches[0].pageX - categoriesContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    categoriesContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const isArabic = (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  const formatOfferText = (offer) => {
    if (!offer) return "";
    if (offer.isPercentage) {
      return `خصم ${offer.discountValue}%`;
    } else {
      return `خصم ${offer.discountValue} ج.م`;
    }
  };

  const isCategoryDisabled = (categoryId) => {
    if (categoryId === "all" || categoryId === "offers") {
      return false;
    }
    const category = categories.find((cat) => cat.id === categoryId);
    return category && !category.isActive;
  };

  const isProductAvailableForCart = (product) => {
    if (!product.isActive) {
      return false;
    }

    if (selectedCategory === "all" || selectedCategory === "offers") {
      return true;
    }

    return !isCategoryDisabled(selectedCategory);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 font-sans relative overflow-x-hidden transition-colors duration-300">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />

      <HeroSwipper />

      {/* Categories Section */}
      <div className="relative max-w-6xl mx-auto -mt-8 md:-mt-12 px-2 sm:px-4 z-20 w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-3 md:p-4 relative w-full transition-colors duration-300">
          <button
            onClick={() => scrollCategories("left")}
            className="absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-[#E41E26] transition-colors duration-200 hover:scale-110 z-10 shadow-lg"
          >
            <FaChevronLeft size={14} className="sm:w-4" />
          </button>

          <div
            ref={categoriesContainerRef}
            className="flex overflow-x-auto scrollbar-hide gap-2 md:gap-4 px-6 sm:px-8 cursor-grab active:cursor-grabbing select-none"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              direction: "rtl",
            }}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-xl font-semibold transition-all duration-300 text-sm md:text-base ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                } ${
                  !category.isActive &&
                  category.id !== "all" &&
                  category.id !== "offers"
                    ? "opacity-60"
                    : ""
                }`}
                style={{ direction: "rtl" }}
              >
                <span className="whitespace-nowrap">{category.name}</span>
                {category.id !== "all" &&
                  category.id !== "offers" &&
                  !category.isActive && (
                    <span className="text-xs text-red-500">(معطل)</span>
                  )}
              </motion.button>
            ))}
          </div>

          <button
            onClick={() => scrollCategories("right")}
            className="absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-[#E41E26] transition-colors duration-200 hover:scale-110 z-10 shadow-lg"
          >
            <FaChevronRight size={14} className="sm:w-4" />
          </button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="relative z-10 w-full">
        {productsLoading ? (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6 w-full">
            <div className="text-center py-12 md:py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mx-2 transition-colors duration-300">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26] mx-auto mb-4"></div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6 w-full">
            <div className="text-center py-12 md:py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg mx-2 transition-colors duration-300">
              <FaEye className="mx-auto text-4xl md:text-6xl text-gray-400 mb-4" />
              <h3 className="text-xl md:text-2xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {selectedCategory === "offers"
                  ? "لا توجد عروض حالياً"
                  : "لم يتم العثور على منتجات"}
              </h3>
              <p className="text-gray-500 dark:text-gray-500 mb-4 px-4">
                {selectedCategory === "offers"
                  ? "لا توجد منتجات تحتوي على عروض حالياً"
                  : "حاول تعديل معايير التصفية"}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory("all");
                }}
                className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all text-sm md:text-base"
              >
                عرض جميع المنتجات
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 md:py-6 w-full relative">
            {selectedCategory === "offers" && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 px-2"
              ></motion.div>
            )}

            <motion.div
              layout
              className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 relative"
              style={{ direction: "rtl" }}
            >
              {filteredProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 cursor-pointer group w-full relative min-h-[180px] ${
                    !product.isActive ? "opacity-70" : ""
                  } ${
                    isCategoryDisabled(selectedCategory) ? "opacity-80" : ""
                  } ${productsLoading ? "opacity-50" : ""}`}
                  onClick={(e) => {
                    const isButtonClick =
                      e.target.closest("button") ||
                      e.target.closest(".no-product-details");

                    if (!isButtonClick && !productsLoading) {
                      handleProductDetails(product);
                    }
                  }}
                >
                  {product.itemOffer && product.itemOffer.isEnabled && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 z-10"
                    >
                      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-3 py-1.5 rounded-xl shadow-2xl flex items-center gap-1.5">
                        <FaFire
                          className="text-white animate-pulse"
                          size={12}
                        />
                        <span className="text-xs font-bold whitespace-nowrap">
                          {formatOfferText(product.itemOffer)}
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {isAdminOrRestaurantOrBranch && (
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleToggleActive(product.id, e)}
                        className={`p-2 rounded-lg shadow-lg transition-colors flex items-center gap-1 text-xs no-product-details ${
                          product.isActive
                            ? "bg-yellow-500 text-white hover:bg-yellow-600"
                            : "bg-green-500 text-white hover:bg-green-600"
                        }`}
                      >
                        {product.isActive ? (
                          <FaTimesCircle size={12} />
                        ) : (
                          <FaCheckCircle size={12} />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleEditProduct(product, e)}
                        className="bg-blue-500 text-white p-2 rounded-lg shadow-lg hover:bg-blue-600 transition-colors no-product-details"
                      >
                        <FaEdit size={12} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleManageOffers(product, e)}
                        className="bg-purple-500 text-white p-2 rounded-lg shadow-lg hover:bg-purple-600 transition-colors no-product-details"
                      >
                        <FaPercent size={12} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleDeleteProduct(product.id, e)}
                        className="bg-red-500 text-white p-2 rounded-lg shadow-lg hover:bg-red-600 transition-colors no-product-details"
                      >
                        <FaTrash size={12} />
                      </motion.button>
                    </div>
                  )}

                  <div className="sm:hidden">
                    <div className="p-3">
                      <div className="flex">
                        <div className="w-28 flex-shrink-0 ml-3">
                          <div className="relative h-32 w-full overflow-hidden rounded-xl">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3
                            className="font-bold text-sm text-gray-800 dark:text-gray-200 group-hover:text-[#E41E26] transition-colors line-clamp-1 mb-2"
                            dir={isArabic(product.name) ? "rtl" : "ltr"}
                          >
                            {product.name}
                          </h3>

                          <p
                            className="text-gray-600 dark:text-gray-400 text-xs mb-2 line-clamp-1 leading-relaxed"
                            dir={isArabic(product.description) ? "rtl" : "ltr"}
                          >
                            {product.description}
                          </p>

                          <div className="flex items-center gap-1 mb-3">
                            {product.itemOffer &&
                            product.itemOffer.isEnabled ? (
                              <>
                                <div className="text-gray-400 dark:text-gray-500 text-xs line-through">
                                  {product.price} ج.م
                                </div>
                                <div className="text-[#E41E26] font-bold text-sm">
                                  {product.finalPrice.toFixed(2)} ج.م
                                </div>
                              </>
                            ) : (
                              <div className="text-[#E41E26] font-bold text-sm">
                                {product.price} ج.م
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-3 pb-3">
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            if (isProductAvailableForCart(product)) {
                              handleAddToCart(product, e);
                            }
                          }}
                          disabled={
                            !isProductAvailableForCart(product) ||
                            productsLoading
                          }
                          className={`flex-1 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-xs no-product-details ${
                            isProductAvailableForCart(product) &&
                            !productsLoading
                              ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white"
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <FaShoppingCart className="w-3.5 h-3.5" />
                          <span>
                            {!isProductAvailableForCart(product) ||
                            productsLoading
                              ? "غير متوفر"
                              : "أضف إلى السلة"}
                          </span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            !productsLoading && handleProductDetails(product);
                          }}
                          disabled={productsLoading}
                          className={`flex-1 py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 text-xs no-product-details ${
                            !productsLoading
                              ? "bg-gradient-to-r from-gray-600 to-gray-800 text-white"
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <FaEye className="w-3.5 h-3.5" />
                          <span>عرض التفاصيل</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleToggleFavorite(product, e)}
                          className={`p-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center text-xs no-product-details ${
                            isProductInFavorites(product.id)
                              ? "text-red-500 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
                              : "text-gray-400 bg-gray-50 dark:bg-gray-700 hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"
                          }`}
                        >
                          {isProductInFavorites(product.id) ? (
                            <FaHeart size={16} />
                          ) : (
                            <FaRegHeart size={16} />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:block">
                    <div className="relative h-48 w-full overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    <div className="p-3 sm:p-4">
                      <h3
                        className="font-bold text-base sm:text-lg text-gray-800 dark:text-gray-200 mb-2 group-hover:text-[#E41E26] transition-colors line-clamp-1"
                        dir={isArabic(product.name) ? "rtl" : "ltr"}
                      >
                        {product.name}
                      </h3>
                      <p
                        className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-3 line-clamp-1 leading-relaxed"
                        dir={isArabic(product.description) ? "rtl" : "ltr"}
                      >
                        {product.description}
                      </p>

                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {product.itemOffer && product.itemOffer.isEnabled ? (
                            <>
                              <div className="text-gray-400 dark:text-gray-500 text-sm line-through">
                                {product.price} ج.م
                              </div>
                              <div className="text-[#E41E26] font-bold text-lg sm:text-xl">
                                {product.finalPrice.toFixed(2)} ج.م
                              </div>
                            </>
                          ) : (
                            <div className="text-[#E41E26] font-bold text-lg sm:text-xl">
                              {product.price} ج.م
                            </div>
                          )}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleToggleFavorite(product, e)}
                          className={`p-2 rounded-full transition-colors no-product-details ${
                            isProductInFavorites(product.id)
                              ? "text-red-500 bg-red-50 dark:bg-red-900/20"
                              : "text-gray-400 bg-gray-50 dark:bg-gray-700 hover:text-red-500"
                          }`}
                        >
                          {isProductInFavorites(product.id) ? (
                            <FaHeart size={18} />
                          ) : (
                            <FaRegHeart size={18} />
                          )}
                        </motion.button>
                      </div>

                      <div className="flex gap-2 mt-3 sm:mt-4">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            if (isProductAvailableForCart(product)) {
                              handleAddToCart(product, e);
                            }
                          }}
                          disabled={
                            !isProductAvailableForCart(product) ||
                            productsLoading
                          }
                          className={`flex-1 py-2 sm:py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm no-product-details ${
                            isProductAvailableForCart(product) &&
                            !productsLoading
                              ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white"
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <FaShoppingCart className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="xs:hidden">
                            {!isProductAvailableForCart(product) ||
                            productsLoading
                              ? "غير متوفر"
                              : "أضف إلى السلة"}
                          </span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            !productsLoading && handleProductDetails(product);
                          }}
                          disabled={productsLoading}
                          className={`flex-1 py-2 sm:py-2.5 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm no-product-details ${
                            !productsLoading
                              ? "bg-gradient-to-r from-gray-600 to-gray-800 text-white"
                              : "bg-gray-400 text-gray-200 cursor-not-allowed"
                          }`}
                        >
                          <FaEye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span className="xs:hidden">عرض التفاصيل</span>
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {/* Admin Floating Buttons */}
      {isAdminOrRestaurantOrBranch && (
        <div className="fixed bottom-4 left-4 flex flex-col gap-3 z-40">
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/favorites")}
            className="relative bg-gradient-to-r from-[#FF3366] to-[#FF6B9D] text-white rounded-full p-3 sm:p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 group overflow-hidden no-product-details"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B9D] to-[#FF3366] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative flex items-center justify-center">
              <FaHeart className="w-4 h-4 sm:w-6 sm:h-6 relative z-10" />

              {favorites.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 bg-white text-[#FF3366] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold shadow-md z-20"
                >
                  {favorites.length}
                </motion.span>
              )}

              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[#FF3366] to-[#FF6B9D] rounded-full opacity-30"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.1, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop",
                }}
              />
            </div>

            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                منتجاتي المفضلة
                <div className="absolute left-full top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleAddNewProduct}
            className="relative bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full p-3 sm:p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 group overflow-hidden no-product-details"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FaPlus className="w-4 h-4 sm:w-6 sm:h-6 relative z-10" />

            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                إضافة منتج جديد
                <div className="absolute left-full top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </div>
          </motion.button>

          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpenCategoriesManager}
            className="relative bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full p-3 sm:p-4 shadow-2xl hover:shadow-3xl transition-all duration-300 group overflow-hidden no-product-details"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <FaList className="w-4 h-4 sm:w-6 sm:h-6 relative z-10" />

            <div className="absolute right-full mr-3 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs font-semibold px-3 py-2 rounded-lg shadow-lg whitespace-nowrap">
                إدارة التصنيفات
                <div className="absolute left-full top-1/2 transform -translate-y-1/2">
                  <div className="w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            </div>
          </motion.button>
        </div>
      )}

      {/* Cart Button */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-full p-3 sm:p-4 shadow-2xl z-40 cursor-pointer hover:scale-110 transition-transform duration-200 no-product-details ${
          cartItemsCount === 0 ? "opacity-70" : ""
        }`}
        onClick={() => navigate("/cart")}
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

      {/* Categories Manager Modal */}
      <AnimatePresence>
        {showCategoriesManager && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={handleCloseCategoriesManager}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
              onClick={handleCloseCategoriesManager}
            >
              <div
                className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl mx-auto my-auto max-h-[90vh] overflow-y-auto transition-colors duration-300"
                onClick={(e) => e.stopPropagation()}
                dir="rtl"
              >
                <div className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white p-4 sm:p-6 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="bg-white/20 p-2 sm:p-3 rounded-2xl backdrop-blur-sm">
                        <FaLayerGroup className="text-xl sm:text-2xl" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold">
                          إدارة التصنيفات
                        </h2>
                        <p className="text-white/80 mt-1 text-sm sm:text-base">
                          إضافة، تعديل وحذف التصنيفات
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleCloseCategoriesManager}
                      className="bg-white/20 backdrop-blur-sm rounded-full p-2 sm:p-3 text-white hover:bg-white/30 transition-all duration-200 hover:scale-110 no-product-details"
                    >
                      <FaTimes size={16} className="sm:w-5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 transition-colors duration-300 shadow-lg">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="bg-[#E41E26]/10 p-2 rounded-xl">
                        <FaPlus className="text-[#E41E26] text-base sm:text-lg" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                        إضافة تصنيف جديد
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                          اسم التصنيف
                        </label>
                        <div className="relative">
                          <FaTag className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-base" />
                          <input
                            type="text"
                            value={newCategory.name}
                            onChange={(e) =>
                              setNewCategory({
                                ...newCategory,
                                name: e.target.value,
                              })
                            }
                            placeholder="أدخل اسم التصنيف الجديد..."
                            className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-[#E41E26] outline-none transition-all text-right text-base font-medium"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col justify-center">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                          حالة التصنيف
                        </label>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <label className="flex items-center cursor-pointer">
                            <div className="relative">
                              <input
                                type="checkbox"
                                checked={newCategory.isActive}
                                onChange={(e) =>
                                  setNewCategory({
                                    ...newCategory,
                                    isActive: e.target.checked,
                                  })
                                }
                                className="sr-only"
                              />
                              <div
                                className={`block w-14 sm:w-16 h-7 sm:h-8 rounded-full transition-colors ${
                                  newCategory.isActive
                                    ? "bg-green-500"
                                    : "bg-gray-400"
                                }`}
                              ></div>
                              <div
                                className={`absolute right-1 top-1 bg-white w-5 sm:w-6 h-5 sm:h-6 rounded-full transition-transform duration-300 shadow-lg ${
                                  newCategory.isActive
                                    ? "transform translate-x-[-1.5rem] sm:translate-x-[-1.75rem]"
                                    : ""
                                }`}
                              ></div>
                            </div>
                          </label>
                          <span
                            className={`font-semibold text-base sm:text-lg ${
                              newCategory.isActive
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {newCategory.isActive ? "مفعل" : "معطل"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-start mt-4 sm:mt-6">
                      <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleAddCategory}
                        className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center gap-2 sm:gap-3 text-sm sm:text-base shadow-lg no-product-details"
                      >
                        <FaPlus />
                        إضافة تصنيف جديد
                      </motion.button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                      <div className="bg-[#FDB913]/10 p-2 rounded-xl">
                        <FaList className="text-[#FDB913] text-base sm:text-lg" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-200">
                        التصنيفات الحالية ({categories.length - 2})
                      </h3>
                    </div>

                    <div className="space-y-3 sm:space-y-4">
                      {categories.map((category) => (
                        <motion.div
                          key={category.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`bg-white dark:bg-gray-700 border-2 ${
                            category.id === "all" || category.id === "offers"
                              ? "border-gray-300 dark:border-gray-600"
                              : "border-gray-200 dark:border-gray-600 hover:border-[#E41E26]/30 dark:hover:border-[#E41E26]/30"
                          } rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:shadow-lg group`}
                        >
                          {editingCategory &&
                          editingCategory.id === category.id ? (
                            <div className="space-y-4 sm:space-y-6">
                              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                <div className="lg:col-span-2">
                                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                                    اسم التصنيف
                                  </label>
                                  <input
                                    type="text"
                                    value={editingCategory.name}
                                    onChange={(e) =>
                                      setEditingCategory({
                                        ...editingCategory,
                                        name: e.target.value,
                                      })
                                    }
                                    className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-600 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-[#E41E26] outline-none transition-all text-right text-base font-medium"
                                    dir="rtl"
                                  />
                                </div>

                                <div className="flex flex-col justify-center">
                                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 sm:mb-3">
                                    حالة التصنيف
                                  </label>
                                  <div className="flex items-center gap-3 sm:gap-4">
                                    <label className="flex items-center cursor-pointer">
                                      <div className="relative">
                                        <input
                                          type="checkbox"
                                          checked={editingCategory.isActive}
                                          onChange={(e) =>
                                            setEditingCategory({
                                              ...editingCategory,
                                              isActive: e.target.checked,
                                            })
                                          }
                                          className="sr-only"
                                        />
                                        <div
                                          className={`block w-14 sm:w-16 h-7 sm:h-8 rounded-full transition-colors ${
                                            editingCategory.isActive
                                              ? "bg-green-500"
                                              : "bg-gray-400"
                                          }`}
                                        ></div>
                                        <div
                                          className={`absolute right-1 top-1 bg-white w-5 sm:w-6 h-5 sm:h-6 rounded-full transition-transform duration-300 shadow-lg ${
                                            editingCategory.isActive
                                              ? "transform translate-x-[-1.5rem] sm:translate-x-[-1.75rem]"
                                              : ""
                                          }`}
                                        ></div>
                                      </div>
                                    </label>
                                    <span
                                      className={`font-semibold text-base sm:text-lg ${
                                        editingCategory.isActive
                                          ? "text-green-600"
                                          : "text-gray-500"
                                      }`}
                                    >
                                      {editingCategory.isActive
                                        ? "مفعل"
                                        : "معطل"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-2 sm:gap-3 justify-start pt-3 sm:pt-4 border-t border-gray-200 dark:border-gray-600">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => setEditingCategory(null)}
                                  className="px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all text-sm sm:text-base no-product-details"
                                >
                                  إلغاء التعديل
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.02, y: -2 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={handleSaveCategory}
                                  className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 text-sm sm:text-base shadow-lg no-product-details"
                                >
                                  <FaSave />
                                  حفظ التغييرات
                                </motion.button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                              <div className="flex items-center gap-3 sm:gap-4">
                                <div
                                  className={`p-2 sm:p-3 rounded-xl ${
                                    category.id === "all"
                                      ? "bg-gray-100 dark:bg-gray-600"
                                      : category.id === "offers"
                                      ? "bg-orange-100 dark:bg-orange-900/30"
                                      : category.isActive
                                      ? "bg-green-100 dark:bg-green-900/30"
                                      : "bg-red-100 dark:bg-red-900/30"
                                  }`}
                                >
                                  {category.id === "offers" ? (
                                    <FaFire className="text-orange-600 text-base sm:text-lg" />
                                  ) : (
                                    <FaTag
                                      className={`text-base sm:text-lg ${
                                        category.id === "all"
                                          ? "text-gray-600 dark:text-gray-400"
                                          : category.isActive
                                          ? "text-green-600"
                                          : "text-red-600"
                                      }`}
                                    />
                                  )}
                                </div>
                                <div>
                                  <h4 className="font-bold text-gray-800 dark:text-gray-200 text-base sm:text-lg mb-1">
                                    {category.name}
                                  </h4>
                                  <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                                    {category.id === "offers" ? (
                                      <span className="text-orange-600 font-medium">
                                        {
                                          products.filter(
                                            (p) =>
                                              p.itemOffer &&
                                              p.itemOffer.isEnabled
                                          ).length
                                        }{" "}
                                        منتج
                                      </span>
                                    ) : (
                                      category.id !== "all" && (
                                        <>
                                          <span
                                            className={`px-2 py-1 rounded-full font-medium ${
                                              category.isActive
                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                            }`}
                                          >
                                            {category.isActive
                                              ? "مفعل"
                                              : "معطل"}
                                          </span>
                                          <span className="text-gray-500 dark:text-gray-400">
                                            {
                                              products.filter(
                                                (p) =>
                                                  p.categoryId ===
                                                  category.originalId
                                              ).length
                                            }{" "}
                                            منتج
                                          </span>
                                        </>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex gap-1 sm:gap-2 justify-end sm:justify-start">
                                {category.id !== "all" &&
                                  category.id !== "offers" && (
                                    <>
                                      <motion.button
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={(e) =>
                                          handleToggleCategoryActive(
                                            category.id,
                                            e
                                          )
                                        }
                                        className={`p-2 sm:p-3 rounded-xl transition-all shadow-md no-product-details ${
                                          category.isActive
                                            ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                                            : "bg-green-500 hover:bg-green-600 text-white"
                                        }`}
                                        title={
                                          category.isActive
                                            ? "تعطيل التصنيف"
                                            : "تفعيل التصنيف"
                                        }
                                      >
                                        {category.isActive ? (
                                          <FaTimesCircle
                                            size={16}
                                            className="sm:w-4 sm:h-4"
                                          />
                                        ) : (
                                          <FaCheckCircle
                                            size={16}
                                            className="sm:w-4 sm:h-4"
                                          />
                                        )}
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() =>
                                          handleEditCategory(category)
                                        }
                                        className="bg-blue-500 text-white p-2 sm:p-3 rounded-xl hover:bg-blue-600 transition-all shadow-md no-product-details"
                                        title="تعديل التصنيف"
                                      >
                                        <FaEdit
                                          size={16}
                                          className="sm:w-4 sm:h-4"
                                        />
                                      </motion.button>
                                      <motion.button
                                        whileHover={{ scale: 1.1, y: -2 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() =>
                                          handleDeleteCategory(category.id)
                                        }
                                        className="bg-red-500 text-white p-2 sm:p-3 rounded-xl hover:bg-red-600 transition-all shadow-md no-product-details"
                                        title="حذف التصنيف"
                                      >
                                        <FaTrash
                                          size={16}
                                          className="sm:w-4 sm:h-4"
                                        />
                                      </motion.button>
                                    </>
                                  )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
