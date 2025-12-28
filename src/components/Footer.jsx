import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaArrowRight,
} from "react-icons/fa";
import logo from "../assets/logo.png";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "الرئيسية", path: "/" },
    { name: "عربة التسوق", path: "/cart" },
    { name: "من نحن", path: "/about" },
    { name: "اتصل بنا", path: "/contact" },
  ];

  const categories = [
    { name: "الأطباق الرئيسية", path: "/category/meals" },
    { name: "المشروبات", path: "/category/drinks" },
    { name: "الحلويات", path: "/category/desserts" },
    { name: "العروض الخاصة", path: "/offers" },
  ];

  const supportLinks = [
    { name: "مركز المساعدة", path: "/help" },
    { name: "سياسة الخصوصية", path: "/privacy" },
    { name: "شروط الخدمة", path: "/terms" },
    { name: "الأسئلة الشائعة", path: "/faq" },
  ];

  const socialLinks = [
    {
      name: "فيسبوك",
      icon: <FaFacebookF />,
      url: "https://facebook.com",
      color: "hover:bg-blue-600",
    },
    {
      name: "تويتر",
      icon: <FaTwitter />,
      url: "https://twitter.com",
      color: "hover:bg-blue-400",
    },
    {
      name: "انستجرام",
      icon: <FaInstagram />,
      url: "https://instagram.com",
      color: "hover:bg-pink-600",
    },
    {
      name: "لينكد إن",
      icon: <FaLinkedinIn />,
      url: "https://linkedin.com",
      color: "hover:bg-blue-800",
    },
  ];

  return (
    <footer
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-[#1a1a1a] text-white relative overflow-hidden"
      dir="rtl"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-r from-[#E41E26]/5 to-[#FDB913]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <Link to="/" className="inline-block mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={logo}
                  alt="Triple S"
                  className="w-12 h-12 object-contain"
                />
                <span className="text-2xl font-bold bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent">
                  Triple S
                </span>
              </div>
            </Link>

            <p className="text-gray-300 mb-6 leading-relaxed">
              نقدم أشهى الدجاج المقلي والوجبات. جرب مزيجًا مثاليًا من القرمشة
              اللذيذة والنكهات الأصيلة.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <FaPhone className="text-[#FDB913] text-sm" />
                <span className="text-sm">+20 115 942 4411</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <FaEnvelope className="text-[#FDB913] text-sm" />
                <span className="text-sm">info@ChickenOne.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors">
                <FaMapMarkerAlt className="text-[#FDB913] text-sm" />
                <span className="text-sm">الجيزة، مصر</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              روابط سريعة
              <div className="absolute bottom-0 right-0 w-1/2 h-0.5 bg-gradient-to-r from-[#FDB913] to-[#E41E26]"></div>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 group"
                  >
                    <FaArrowRight className="text-[#FDB913] text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 rotate-180" />
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              الفئات
              <div className="absolute bottom-0 right-0 w-1/2 h-0.5 bg-gradient-to-r from-[#FDB913] to-[#E41E26]"></div>
            </h3>
            <ul className="space-y-3">
              {categories.map((category) => (
                <li key={category.name}>
                  <Link
                    to={category.path}
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 group"
                  >
                    <FaArrowRight className="text-[#FDB913] text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 rotate-180" />
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      {category.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-bold mb-6 relative inline-block">
              الدعم
              <div className="absolute bottom-0 right-0 w-1/2 h-0.5 bg-gradient-to-r from-[#FDB913] to-[#E41E26]"></div>
            </h3>
            <ul className="space-y-3 mb-8">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 group"
                  >
                    <FaArrowRight className="text-[#FDB913] text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 rotate-180" />
                    <span className="group-hover:translate-x-2 transition-transform duration-300">
                      {link.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div>
              <h4 className="text-lg font-bold mb-4">تابعنا</h4>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-10 h-10 bg-gray-700 rounded-xl flex items-center justify-center text-white transition-all duration-300 ${social.color} hover:shadow-lg`}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-gray-700"
        >
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-lg font-bold mb-4 flex items-center justify-center gap-2">
              <FaClock className="text-[#FDB913]" />
              ساعات العمل
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-gray-300">
              <div>
                <p className="font-semibold text-white">الأحد - الخميس</p>
                <p>9:00 ص - 11:00 م</p>
              </div>
              <div>
                <p className="font-semibold text-white">الجمعة - السبت</p>
                <p>10:00 ص - 12:00 ص</p>
              </div>
              <div>
                <p className="font-semibold text-white">التوصيل</p>
                <p>متاح 24/7</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="mt-8 pt-8 border-t border-gray-700"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm text-center" dir="rtl">
              © {currentYear} Chicken-One. جميع الحقوق محفوظة. | صنع بواسطة{" "}
              <span className="text-[#E41E26]">مهند أشرف</span> في مصر
            </p>

            <div className="flex gap-6 text-sm text-gray-400">
              <Link
                to="/sitemap"
                className="hover:text-white transition-colors"
              >
                خريطة الموقع
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                شروط الخدمة
              </Link>
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                سياسة الخصوصية
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E41E26] via-[#FDB913] to-[#E41E26]"></div>
    </footer>
  );
};

export default Footer;
