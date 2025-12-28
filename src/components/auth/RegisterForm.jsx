import React from "react";
import { motion } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaPhone,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

export default function RegisterForm({
  formData,
  showRegisterPassword,
  showConfirmPassword,
  passwordValidations,
  isLoading,
  onInputChange,
  onToggleRegisterPassword,
  onToggleConfirmPassword,
  onSubmit,
}) {
  const getValidationItem = (condition, label) => (
    <div className="flex items-center gap-2 text-sm">
      {condition ? (
        <FaCheckCircle className="text-green-500" />
      ) : (
        <FaTimesCircle className="text-gray-400" />
      )}
      <span className={condition ? "text-green-600" : "text-gray-500"}>
        {label}
      </span>
    </div>
  );

  const allFieldsFilled = Object.values(formData).every(
    (val) => val.trim() !== ""
  );
  const allPasswordValid = Object.values(passwordValidations).every(Boolean);
  const isFormValid = allFieldsFilled && allPasswordValid;

  return (
    <motion.form
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
      onSubmit={onSubmit}
      className="space-y-6 max-w-md mx-auto w-full"
    >
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-[#E41E26] to-[#FDB913] bg-clip-text text-transparent">
          إنشاء حساب جديد
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
          انضم إلى Triple S وابدأ رحلتك
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-3">
              <FaUser className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
            </div>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={(e) => onInputChange(e.target.name, e.target.value)}
              placeholder="الاسم الأول"
              className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pr-10 pl-3 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50 text-sm text-right"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-3">
              <FaUser className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
            </div>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={(e) => onInputChange(e.target.name, e.target.value)}
              placeholder="الاسم الأخير"
              className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pr-10 pl-3 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50 text-sm text-right"
            />
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaEnvelope className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
          </div>
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={(e) => onInputChange(e.target.name, e.target.value)}
            placeholder="البريد الإلكتروني"
            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50 text-right"
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaPhone className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
          </div>
          <input
            type="tel"
            name="phoneNumber"
            required
            value={formData.phoneNumber}
            onChange={(e) => onInputChange(e.target.name, e.target.value)}
            placeholder="رقم الهاتف"
            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50 text-right"
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaLock className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
          </div>
          <input
            type={showRegisterPassword ? "text" : "password"}
            name="password"
            required
            value={formData.password}
            onChange={(e) => onInputChange(e.target.name, e.target.value)}
            placeholder="كلمة المرور"
            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pr-12 pl-12 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50 text-right"
          />
          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
            <div
              onClick={onToggleRegisterPassword}
              className="text-gray-500 dark:text-gray-400 hover:text-[#E41E26] dark:hover:text-[#FDB913] cursor-pointer transition-all duration-200 hover:scale-110"
            >
              {showRegisterPassword ? (
                <FaEyeSlash size={16} />
              ) : (
                <FaEye size={16} />
              )}
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaLock className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
          </div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={(e) => onInputChange(e.target.name, e.target.value)}
            placeholder="تأكيد كلمة المرور"
            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pr-12 pl-12 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50 text-right"
          />
          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
            <div
              onClick={onToggleConfirmPassword}
              className="text-gray-500 dark:text-gray-400 hover:text-[#E41E26] dark:hover:text-[#FDB913] cursor-pointer transition-all duration-200 hover:scale-110"
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={16} />
              ) : (
                <FaEye size={16} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Password Validation - Responsive */}
      <div className="bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] dark:from-gray-800 dark:to-gray-700 p-3 rounded-xl border border-[#FDB913]/30 dark:border-gray-600 space-y-2 transition-colors duration-300">
        <p className="text-sm font-semibold text-[#E41E26] dark:text-[#FDB913] text-right">
          متطلبات كلمة المرور:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
          {getValidationItem(passwordValidations.length, "8 أحرف على الأقل")}
          {getValidationItem(passwordValidations.lowercase, "حرف صغير")}
          {getValidationItem(passwordValidations.uppercase, "حرف كبير")}
          {getValidationItem(passwordValidations.specialChar, "رمز خاص")}
          {getValidationItem(passwordValidations.match, "كلمات المرور متطابقة")}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={!isFormValid || isLoading}
        className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-300 text-lg relative overflow-hidden ${
          isFormValid
            ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 dark:hover:shadow-[#FDB913]/25"
            : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
            جاري إنشاء الحساب...
          </div>
        ) : (
          <>
            إنشاء الحساب
            <div className="absolute inset-0 bg-white/20 translate-x-full hover:translate-x-0 transition-transform duration-700"></div>
          </>
        )}
      </motion.button>
    </motion.form>
  );
}
