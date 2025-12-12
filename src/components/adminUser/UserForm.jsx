import { useState } from "react";
import { motion } from "framer-motion";
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";

export default function UserForm({
  isAdding,
  formData,
  setFormData,
  availableRoles,
  handleRoleToggle,
  handleSubmit,
  resetForm,
  getRoleIcon,
  isFormValid,
}) {
  const [showPassword, setShowPassword] = useState(false);

  if (!isAdding) return null;

  return (
    <motion.div
      id="user-form"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="xl:col-span-1"
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border border-gray-200/50 shadow-lg sticky top-4 sm:top-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-800 truncate">
            إضافة مستخدم جديد
          </h3>
          <button
            onClick={resetForm}
            className="text-gray-500 hover:text-[#E41E26] transition-colors duration-200 flex-shrink-0 ml-2"
          >
            <FaTimes size={16} className="sm:size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:gap-3 md:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                الاسم الأول *
              </label>
              <div className="relative group" style={{ direction: "ltr" }}>
                <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    setFormData({ ...formData, firstName: e.target.value })
                  }
                  required
                  className="w-full border border-gray-200 bg-white text-black rounded-lg sm:rounded-xl pr-9 pl-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="الاسم الأول"
                  style={{ textAlign: "right" }}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                الاسم الأخير *
              </label>
              <div className="relative group" style={{ direction: "ltr" }}>
                <FaUser className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    setFormData({ ...formData, lastName: e.target.value })
                  }
                  required
                  className="w-full border border-gray-200 bg-white text-black rounded-lg sm:rounded-xl pr-9 pl-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                  placeholder="الاسم الأخير"
                  style={{ textAlign: "right" }}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              البريد الإلكتروني *
            </label>
            <div className="relative group" style={{ direction: "ltr" }}>
              <FaEnvelope className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full border border-gray-200 bg-white text-black rounded-lg sm:rounded-xl pr-9 pl-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="البريد الإلكتروني"
                style={{ textAlign: "right" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              رقم الهاتف
            </label>
            <div className="relative group" style={{ direction: "ltr" }}>
              <FaPhone className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full border border-gray-200 bg-white text-black rounded-lg sm:rounded-xl pr-9 pl-3 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="رقم الهاتف"
                style={{ textAlign: "right" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              كلمة المرور *
            </label>
            <div className="relative group" style={{ direction: "ltr" }}>
              <FaLock className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
              <div
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#E41E26] cursor-pointer transition-colors duration-200 text-sm"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                className="w-full border border-gray-200 bg-white text-black rounded-lg sm:rounded-xl pr-9 pl-9 py-2.5 sm:py-3 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="كلمة المرور"
                style={{ textAlign: "right" }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
              الصلاحيات *
            </label>
            <div className="space-y-2 p-3 bg-gray-50 rounded-lg sm:rounded-xl border border-gray-200">
              {availableRoles.map((role) => (
                <div key={role.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`role-${role.name}`}
                    checked={formData.roles.includes(role.name)}
                    onChange={() => handleRoleToggle(role.name)}
                    className="w-4 h-4 sm:w-5 sm:h-5 text-[#E41E26] bg-white border-gray-300 rounded focus:ring-[#E41E26] focus:ring-2"
                  />
                  <label
                    htmlFor={`role-${role.name}`}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    <span className="text-sm">{getRoleIcon(role.name)}</span>
                    <span>{role.name}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 sm:gap-3 pt-1 sm:pt-2">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetForm}
              className="flex-1 py-2.5 sm:py-3 border-2 border-[#E41E26] text-[#E41E26] rounded-lg sm:rounded-xl font-semibold hover:bg-[#E41E26] hover:text-white transition-all duration-300 text-sm sm:text-base"
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
                  ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <FaCheck className="text-xs sm:text-sm" />
              إضافة مستخدم
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
