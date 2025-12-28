import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaMoneyBillWave,
  FaTimes,
  FaReceipt,
  FaUser,
  FaArrowLeft,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";

const Cashier = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);
  const categoriesContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axiosInstance.get("/api/Account/Profile");
        const userData = response.data;
        const userRoles = userData.roles || [];

        const hasAccess =
          userRoles.includes("Admin") ||
          userRoles.includes("Restaurant") ||
          userRoles.includes("Branch");

        if (!hasAccess) {
          Swal.fire({
            icon: "error",
            title: "غير مصرح بالوصول",
            text: "ليس لديك صلاحية للوصول إلى صفحة الكاشير",
            confirmButtonColor: "#E41E26",
          }).then(() => {
            navigate("/");
          });
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error("Error checking access:", error);
        navigate("/login");
      }
    };

    checkAccess();
  }, [navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/api/Categories/GetAll");
        const categoriesData = response.data;

        const transformedCategories = [
          { id: "all", name: "جميع المنتجات" },
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

    if (!loading) {
      fetchCategories();
    }
  }, [loading]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);

        const params = {};
        if (selectedCategory !== "all") {
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
          description: product.description,
          isActive: product.isActive,
        }));

        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
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

    if (!loading) {
      fetchProducts();
    }
  }, [selectedCategory, loading]);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const addToCart = (product) => {
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }

    Swal.fire({
      icon: "success",
      title: "تم الإضافة!",
      text: `تم إضافة ${product.name} إلى الفاتورة`,
      timer: 1000,
      showConfirmButton: false,
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }

    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.14;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
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

  const printReceipt = () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "فاتورة فارغة",
        text: "يرجى إضافة منتجات إلى الفاتورة أولاً",
        confirmButtonColor: "#E41E26",
      });
      return;
    }

    const receiptContent = `
      <div style="font-family: Arial, sans-serif; max-width: 300px; margin: 0 auto; padding: 20px; border: 2px solid #E41E26; border-radius: 10px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #E41E26; margin: 0;">Triple S</h2>
          <p style="color: #666; margin: 5px 0;">كاشير المطعم</p>
          <p style="color: #666; margin: 0;">${new Date().toLocaleString(
            "ar-EG"
          )}</p>
        </div>
        
        <div style="border-bottom: 1px dashed #ccc; padding-bottom: 10px; margin-bottom: 10px;">
          ${
            customerInfo.name
              ? `<p><strong>العميل:</strong> ${customerInfo.name}</p>`
              : ""
          }
          ${
            customerInfo.phone
              ? `<p><strong>الهاتف:</strong> ${customerInfo.phone}</p>`
              : ""
          }
        </div>
        
        <div style="margin-bottom: 15px;">
          ${cart
            .map(
              (item) => `
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span>${item.name} (${item.quantity})</span>
              <span>${(item.price * item.quantity).toFixed(2)} ج.م</span>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div style="border-top: 2px solid #E41E26; padding-top: 10px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>المجموع:</span>
            <span>${calculateSubtotal().toFixed(2)} ج.م</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
            <span>الضريبة (14%):</span>
            <span>${calculateTax().toFixed(2)} ج.م</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.1em;">
            <span>الإجمالي:</span>
            <span>${calculateTotal().toFixed(2)} ج.م</span>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 0.9em;">
          <p>شكراً لزيارتكم</p>
          <p>نتمنى لكم وجبة شهية</p>
        </div>
      </div>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>فاتورة Triple S</title>
          <style>
            body { margin: 0; padding: 20px; }
            @media print {
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${receiptContent}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const completeSale = async () => {
    if (cart.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "فاتورة فارغة",
        text: "يرجى إضافة منتجات إلى الفاتورة أولاً",
        confirmButtonColor: "#E41E26",
      });
      return;
    }

    try {
      const orderData = {
        items: cart,
        customerInfo,
        paymentMethod: "cash",
        subtotal: calculateSubtotal(),
        tax: calculateTax(),
        total: calculateTotal(),
        timestamp: new Date().toISOString(),
      };

      const existingOrders = JSON.parse(
        localStorage.getItem("cashierOrders") || "[]"
      );
      existingOrders.push(orderData);
      localStorage.setItem("cashierOrders", JSON.stringify(existingOrders));

      Swal.fire({
        title: "تمت العملية بنجاح!",
        html: `
          <div style="text-align: center;">
            <div style="font-size: 3em; color: #22c55e;">✓</div>
            <h3 style="color: #22c55e; margin: 10px 0;">تم إتمام البيع</h3>
            <p style="margin: 5px 0;"><strong>الإجمالي:</strong> ${calculateTotal().toFixed(
              2
            )} ج.م</p>
            <p style="margin: 5px 0;"><strong>طريقة الدفع:</strong> نقدي</p>
          </div>
        `,
        confirmButtonColor: "#22c55e",
        confirmButtonText: "طباعة الفاتورة",
        showCancelButton: true,
        cancelButtonText: "إغلاق",
      }).then((result) => {
        if (result.isConfirmed) {
          printReceipt();
        }
        setCart([]);
        setCustomerInfo({ name: "", phone: "", address: "" });
      });
    } catch (error) {
      console.error("Error completing sale:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في إتمام العملية",
        confirmButtonColor: "#E41E26",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-300"
      dir="rtl"
    >
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-6"
          style={{ direction: "ltr" }}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-full p-3 text-[#E41E26] dark:text-gray-300 hover:bg-[#E41E26] dark:hover:bg-[#FDB913] hover:text-white transition-all duration-300 shadow-lg"
            style={{ direction: "ltr" }}
          >
            <FaArrowLeft size={20} />
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="xl:col-span-2">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 transition-colors duration-300">
              {/* Search */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  {" "}
                  <div className="flex-1 relative">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="ابحث عن المنتجات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent outline-none text-right"
                    />
                  </div>
                </div>

                <div className="relative mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 transition-colors duration-300">
                  {" "}
                  <button
                    onClick={() => scrollCategories("left")}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-[#E41E26] transition-colors duration-200 hover:scale-110 z-10 shadow-lg"
                  >
                    <FaChevronLeft size={16} />
                  </button>
                  <div
                    ref={categoriesContainerRef}
                    className="flex overflow-x-auto scrollbar-hide gap-3 px-10 py-3 cursor-grab active:cursor-grabbing select-none"
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
                        className={`flex-shrink-0 px-5 py-3 rounded-xl font-semibold transition-all duration-300 text-sm min-h-[3rem] flex items-center justify-center ${
                          selectedCategory === category.id
                            ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white shadow-lg"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                        style={{ direction: "rtl" }}
                      >
                        {category.name}
                      </motion.button>
                    ))}
                  </div>
                  <button
                    onClick={() => scrollCategories("right")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full p-2 text-gray-600 dark:text-gray-300 hover:text-[#E41E26] transition-colors duration-200 hover:scale-110 z-10 shadow-lg"
                  >
                    <FaChevronRight size={16} />
                  </button>
                </div>
              </div>

              {productsLoading ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-300">
                  {" "}
                  <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-[#E41E26] mx-auto mb-4"></div>{" "}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-lg transition-colors duration-300">
                  {" "}
                  <FaSearch className="mx-auto text-5xl text-gray-400 mb-4" />{" "}
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    لم يتم العثور على منتجات
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 mb-4">
                    حاول تعديل معايير البحث أو التصفية
                  </p>
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    عرض جميع المنتجات
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto">
                  <AnimatePresence>
                    {filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                        className="bg-gradient-to-br from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-2xl p-4 border border-[#FDB913]/30 dark:border-gray-600 cursor-pointer hover:shadow-lg transition-all duration-300"
                        onClick={() => addToCart(product)}
                      >
                        <div className="relative h-48 mb-4">
                          {" "}
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        </div>
                        <h3 className="font-bold text-gray-800 dark:text-white text-sm mb-2 line-clamp-1 text-right">
                          {product.name}
                        </h3>
                        <p className="text-[#E41E26] dark:text-[#FDB913] font-bold text-lg mb-2 text-right">
                          {product.price} ج.م
                        </p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300"
                        >
                          إضافة للفاتورة
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6" style={{ direction: "ltr" }}>
            {/* Customer Info */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 transition-colors duration-300">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 justify-end">
                <FaUser className="text-[#E41E26] dark:text-[#FDB913]" />
                <span>معلومات العميل</span>
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-right">
                    اسم العميل
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent outline-none text-right"
                    placeholder="أدخل اسم العميل"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-right">
                    رقم الهاتف
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        phone: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent outline-none text-right"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-right">
                    العنوان
                  </label>
                  <textarea
                    value={customerInfo.address}
                    onChange={(e) =>
                      setCustomerInfo({
                        ...customerInfo,
                        address: e.target.value,
                      })
                    }
                    rows="2"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#E41E26] focus:border-transparent outline-none text-right resize-none"
                    placeholder="أدخل العنوان (اختياري)"
                  />
                </div>
              </div>
            </div>

            {/* Cart */}
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 transition-colors duration-300">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 justify-end">
                <FaShoppingCart className="text-[#E41E26] dark:text-[#FDB913]" />
                <span>الفاتورة ({cart.length})</span>
              </h2>

              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-700 dark:to-gray-600 rounded-xl border border-[#FDB913]/30 dark:border-gray-600"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-800 dark:text-white text-sm text-right">
                            {item.name}
                          </h4>
                          <p className="text-[#E41E26] dark:text-[#FDB913] font-bold text-right">
                            {item.price} ج.م
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 dark:hover:bg-gray-600/50 transition-colors text-[#E41E26] dark:text-[#FDB913]"
                        >
                          <FaMinus size={12} />
                        </button>
                        <span className="font-bold text-gray-800 dark:text-white min-w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 dark:hover:bg-gray-600/50 transition-colors text-[#E41E26] dark:text-[#FDB913]"
                        >
                          <FaPlus size={12} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500 hover:text-white transition-colors text-red-500 mr-2"
                        >
                          <FaTimes size={12} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Payment Method - Cash Only */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-right">
                  طريقة الدفع
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 py-3 rounded-xl border-2 border-[#E41E26] bg-[#E41E26] text-white font-semibold transition-all duration-300 flex items-center justify-center gap-2">
                    <FaMoneyBillWave />
                    <span>نقدي</span>
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-gray-200 dark:border-gray-600 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    المجموع:
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {calculateSubtotal().toFixed(2)} ج.م
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    الضريبة (14%):
                  </span>
                  <span className="font-semibold text-gray-800 dark:text-white">
                    {calculateTax().toFixed(2)} ج.م
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-600 pt-2">
                  <span className="text-gray-800 dark:text-white">
                    الإجمالي:
                  </span>
                  <span className="text-[#E41E26] dark:text-[#FDB913]">
                    {calculateTotal().toFixed(2)} ج.م
                  </span>
                </div>
              </div>

              {/* Complete Sale Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={completeSale}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 mt-4 flex items-center justify-center gap-2"
              >
                <FaReceipt />
                <span>إتمام البيع</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cashier;
