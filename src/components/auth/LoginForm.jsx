import { motion } from "framer-motion";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaGoogle,
} from "react-icons/fa";

export default function LoginForm({
  email,
  password,
  showPassword,
  isLoading,
  isGoogleLoading,
  onEmailChange,
  onPasswordChange,
  onToggleShowPassword,
  onForgotPassword,
  onGoogleLogin,
  onSubmit,
}) {
  const isDisabled = !email || !password || isLoading;

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
          مرحباً بعودتك
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
          سجل الدخول إلى حسابك في NileFood
        </p>
      </div>

      <div className="space-y-4">
        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaEnvelope className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
          </div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="البريد الإلكتروني"
            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pr-12 pl-4 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50 text-right"
          />
        </div>

        <div className="relative group">
          <div className="absolute inset-y-0 right-0 flex items-center justify-center pr-4">
            <FaLock className="text-[#E41E26] dark:text-[#FDB913] text-lg transition-all duration-300 group-focus-within:scale-110" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder="كلمة المرور"
            className="w-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-black dark:text-white rounded-xl pr-12 pl-12 py-3.5 outline-none focus:ring-2 focus:ring-[#E41E26] dark:focus:ring-[#FDB913] focus:border-transparent transition-all duration-200 group-hover:border-[#E41E26]/50 dark:group-hover:border-[#FDB913]/50 text-right"
          />
          <div className="absolute inset-y-0 left-0 flex items-center justify-center pl-4">
            <div
              onClick={onToggleShowPassword}
              className="text-gray-500 dark:text-gray-400 hover:text-[#E41E26] dark:hover:text-[#FDB913] cursor-pointer transition-all duration-200 hover:scale-110"
            >
              {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-[#E41E26] dark:text-[#FDB913] hover:text-[#FDB913] dark:hover:text-[#E41E26] underline text-sm font-medium transition-all duration-200"
        >
          نسيت كلمة المرور؟
        </button>
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="submit"
        disabled={isDisabled}
        className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-300 text-lg relative overflow-hidden ${
          !isDisabled
            ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white hover:shadow-xl hover:shadow-[#E41E26]/25 dark:hover:shadow-[#FDB913]/25"
            : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
        }`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white ml-2"></div>
            جاري تسجيل الدخول...
          </div>
        ) : (
          <>
            تسجيل الدخول
            <div className="absolute inset-0 bg-white/20 translate-x-full hover:translate-x-0 transition-transform duration-700"></div>
          </>
        )}
      </motion.button>

      {/* Google Login Button */}
      <div className="mt-8">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-3 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              أو سجل الدخول باستخدام
            </span>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onGoogleLogin}
          disabled={isGoogleLoading}
          className={`w-full mt-4 flex items-center justify-center gap-3 font-semibold py-3.5 rounded-xl transition-all duration-300 border ${
            isGoogleLoading
              ? "bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
          }`}
        >
          {isGoogleLoading ? (
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#DB4437]"></div>
              <span className="text-gray-700 dark:text-gray-300">
                جاري التوجيه إلى Google...
              </span>
            </div>
          ) : (
            <>
              <FaGoogle className="text-[#DB4437]" size={20} />
              <span className="text-gray-700 dark:text-gray-300">
                تسجيل الدخول عبر Google
              </span>
            </>
          )}
        </motion.button>
      </div>
    </motion.form>
  );
}
