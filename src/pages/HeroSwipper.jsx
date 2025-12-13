import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaChevronLeft,
  FaChevronRight,
  FaShoppingCart,
  FaFire,
  FaTag,
  FaClock,
  FaStar,
  FaPercent,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

const HeroSwipper = () => {
  // eslint-disable-next-line no-unused-vars
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      id: 1,
      title: "برجر الدجاج المقرمش",
      description:
        "برجر دجاج مقرمش مع صوص خاص وأوراق خس طازجة وجبنة شيدر ذائبة",
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=700&h=450&fit=crop&crop=center",
      originalPrice: 85,
      discountPrice: 65,
      discountPercentage: 24,
      preparationTime: "15-20 دقيقة",
      rating: 4.8,
      ratingCount: 128,
      category: "برجر",
      ctaText: "اطلب الآن",
      bgColor: "from-[#E41E26]/85 to-[#FDB913]/85",
    },
    {
      id: 2,
      title: "بيتزا اللحم المكسيكية",
      description:
        "بيتزا بنكهة مكسيكية حارة مع لحم بقري مفروم وفلفل حار وجبنة موزاريلا",
      image:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=700&h=450&fit=crop&crop=center",
      originalPrice: 120,
      discountPrice: 89,
      discountPercentage: 26,
      preparationTime: "20-25 دقيقة",
      rating: 4.9,
      ratingCount: 95,
      category: "بيتزا",
      ctaText: "اطلب الآن",
      bgColor: "from-[#0f766e]/85 to-[#14b8a6]/85",
    },
    {
      id: 3,
      title: "مشاوي مشكلة للعائلة",
      description: "طبق مشاوي متنوع: كفتة، لحم ضأن، فراخ مشوية مع أرز بخاري",
      image:
        "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=700&h=450&fit=crop&crop=center",
      originalPrice: 250,
      discountPrice: 189,
      discountPercentage: 24,
      preparationTime: "30-40 دقيقة",
      rating: 4.7,
      ratingCount: 210,
      category: "مشاوي",
      ctaText: "اطلب الآن",
      bgColor: "from-[#7c3aed]/85 to-[#c026d3]/85",
    },
    {
      id: 4,
      title: "سوشي متنوع",
      description:
        "تشكيلة متنوعة من السوشي الطازج: سلمون، تونة، جمبري، أفوكادو",
      image:
        "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=700&h=450&fit=crop&crop=center",
      originalPrice: 180,
      discountPrice: 139,
      discountPercentage: 23,
      preparationTime: "25-30 دقيقة",
      rating: 4.9,
      ratingCount: 167,
      category: "سوشي",
      ctaText: "اطلب الآن",
      bgColor: "from-[#1a1a2e]/85 to-[#16213e]/85",
    },
    {
      id: 5,
      title: "كنتاكي بوكس عائلي",
      description:
        "بوكس عائلي متكامل: 8 قطع دجاج، أصابع ذرة، سلطة، خبز، مشروبات",
      image:
        "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=700&h=450&fit=crop&crop=center",
      originalPrice: 320,
      discountPrice: 249,
      discountPercentage: 22,
      preparationTime: "20-25 دقيقة",
      rating: 4.8,
      ratingCount: 312,
      category: "وجبات عائلية",
      ctaText: "اطلب الآن",
      bgColor: "from-[#dc2626]/85 to-[#ea580c]/85",
    },
  ];

  const handleOrderNow = (slideId) => {
    navigate(`/menu?highlight=${slideId}`);
  };

  const formatPrice = (price) => {
    return price.toFixed(2);
  };

  return (
    <div className="relative w-full h-[55vh] min-h-[450px] max-h-[600px] overflow-hidden rounded-b-2xl shadow-xl">
      {/* Swiper */}
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation={{
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        }}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        loop={true}
        onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
        className="w-full h-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full">
              {/* Background Image with Overlay */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url('${slide.image}')` }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${slide.bgColor} opacity-85`}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent"></div>
              </div>

              {/* Content - Removed mt-[-20px] from here */}
              <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 items-center">
                    {/* Left Side - Text Content - Added mt-[-20px] here */}
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-right lg:text-right order-2 lg:order-1 px-2 mt-[-20px]"
                      dir="rtl"
                    >
                      {/* Category Badge */}
                      <div className="inline-flex items-center gap-1 bg-white/15 backdrop-blur-sm rounded-md px-2.5 py-1 mb-3">
                        <FaTag className="text-white/80" size={11} />
                        <span className="text-white font-medium text-xs">
                          {slide.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                        {slide.title}
                      </h1>

                      {/* Description */}
                      <p className="text-xs sm:text-sm md:text-base text-white/85 mb-4 leading-relaxed max-w-lg">
                        {slide.description}
                      </p>

                      {/* Rating and Preparation Time */}
                      <div className="flex items-center gap-3 mb-4 flex-wrap">
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-md px-2.5 py-1">
                          <FaStar className="text-yellow-400" size={12} />
                          <span className="text-white font-bold text-sm">
                            {slide.rating}
                          </span>
                          <span className="text-white/70 text-xs">
                            ({slide.ratingCount})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-md px-2.5 py-1">
                          <FaClock className="text-blue-300" size={12} />
                          <span className="text-white font-medium text-xs">
                            {slide.preparationTime}
                          </span>
                        </div>
                      </div>

                      {/* Price Section */}
                      <div className="mb-5">
                        <div className="flex items-center gap-3 flex-wrap">
                          {/* Discount Price */}
                          <div className="flex flex-col">
                            <span className="text-white/70 text-xs mb-0.5">
                              السعر النهائي
                            </span>
                            <span className="text-xl sm:text-2xl text-white font-bold">
                              {formatPrice(slide.discountPrice)} ج.م
                            </span>
                          </div>

                          {/* Original Price */}
                          <div className="flex flex-col">
                            <span className="text-white/70 text-xs mb-0.5">
                              بدلاً من
                            </span>
                            <span className="text-lg text-white/60 line-through font-semibold">
                              {formatPrice(slide.originalPrice)} ج.م
                            </span>
                          </div>

                          {/* Discount Badge */}
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="relative"
                          >
                            <div className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
                              <FaPercent size={12} />
                              <span className="text-base font-bold">
                                {slide.discountPercentage}%
                              </span>
                            </div>
                          </motion.div>
                        </div>

                        {/* You Save */}
                        <div className="mt-2">
                          <div className="inline-flex items-center gap-1 bg-gradient-to-r from-green-600 to-emerald-500 text-white px-2.5 py-1 rounded-md">
                            <span className="text-xs font-semibold">وفر</span>
                            <span className="text-sm font-bold">
                              {formatPrice(
                                slide.originalPrice - slide.discountPrice
                              )}{" "}
                              ج.م
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        onClick={() => handleOrderNow(slide.id)}
                        className="group relative bg-gradient-to-r from-white to-gray-100 text-gray-900 px-5 py-2.5 rounded-lg font-bold text-sm sm:text-base hover:shadow-lg hover:scale-105 transition-all duration-250 transform flex items-center gap-2 mx-auto lg:mx-0 overflow-hidden"
                        dir="rtl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-[#E41E26] to-[#FDB913] opacity-0 group-hover:opacity-20 transition-opacity duration-250"></div>
                        <span className="relative z-10">{slide.ctaText}</span>
                        <FaShoppingCart
                          className="relative z-10 group-hover:translate-x-0.5 transition-transform duration-250"
                          size={14}
                        />
                      </motion.button>
                    </motion.div>

                    {/* Right Side - Image Preview with object-contain - Added mt-[-20px] here */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="order-1 lg:order-2 relative px-2 mt-[-20px]"
                    >
                      <div className="relative flex justify-center items-center">
                        {/* Main Image Container with object-contain and adjusted height */}
                        <div className="relative rounded-xl overflow-hidden shadow-lg border-3 border-white/15 backdrop-blur-sm w-full max-w-md">
                          {/* Image with object-contain */}
                          <div className="w-full h-48 sm:h-56 md:h-64 lg:h-72 flex items-center justify-center bg-black/20">
                            <img
                              src={slide.image}
                              alt={slide.title}
                              className="w-full h-full object-contain"
                            />
                          </div>

                          {/* Image Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>

                          {/* Hot Badge Only */}
                          <motion.div
                            initial={{ y: 8, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="absolute top-2 left-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-2 py-1 rounded-md shadow-md"
                          >
                            <div className="flex items-center gap-1">
                              <FaFire size={10} />
                              <span className="font-bold text-xs">
                                🔥 الأكثر طلباً
                              </span>
                            </div>
                          </motion.div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Navigation Buttons - White circle with orange arrows */}
      <button className="swiper-button-prev absolute left-1.5 top-1/2 transform -translate-y-1/2 z-20 bg-white text-[#FDB913] rounded-full p-2.5 sm:p-3 hover:scale-110 transition-all duration-250 shadow-lg hover:shadow-xl">
        <FaChevronLeft size={16} className="sm:w-4" />
      </button>
      <button className="swiper-button-next absolute right-1.5 top-1/2 transform -translate-y-1/2 z-20 bg-white text-[#FDB913] rounded-full p-2.5 sm:p-3 hover:scale-110 transition-all duration-250 shadow-lg hover:shadow-xl">
        <FaChevronRight size={16} className="sm:w-4" />
      </button>

      {/* Bottom Gradient Fade - Reduced height */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
    </div>
  );
};

export default HeroSwipper;
