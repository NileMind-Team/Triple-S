import { motion } from "framer-motion";
import { FaUserShield, FaPlus } from "react-icons/fa";

export default function EmptyState({ searchTerm, handleAddNewUser }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-8 sm:py-10 md:py-12 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl border border-gray-200/50"
    >
      <FaUserShield className="mx-auto text-3xl sm:text-4xl md:text-5xl text-gray-400 mb-3 sm:mb-4" />
      <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600 mb-2 sm:mb-3">
        {searchTerm
          ? "لم يتم العثور على مستخدمين"
          : "لم يتم العثور على مستخدمين"}
      </h3>
      <p className="text-gray-500 text-sm sm:text-base mb-4 sm:mb-6 max-w-xs sm:max-w-sm mx-auto">
        {searchTerm
          ? "حاول تعديل مصطلحات البحث الخاصة بك"
          : "ابدأ بإضافة أول مستخدم لك"}
      </p>
      {!searchTerm && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddNewUser}
          className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base mx-auto"
        >
          <FaPlus className="text-xs sm:text-sm" />
          <span>أضف أول مستخدم</span>
        </motion.button>
      )}
    </motion.div>
  );
}
