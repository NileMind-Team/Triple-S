import { motion } from "framer-motion";
import { FaSearch, FaTimes } from "react-icons/fa";

export default function SearchBar({ searchTerm, setSearchTerm }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="mb-6 sm:mb-8"
    >
      <div className="max-w-md mx-auto">
        <div className="relative group" style={{ direction: "ltr" }}>
          <FaSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#E41E26] text-sm transition-all duration-300 group-focus-within:scale-110" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-gray-200 bg-white text-black rounded-xl sm:rounded-2xl pr-10 pl-4 py-3 sm:py-4 outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 text-sm sm:text-base shadow-lg"
            placeholder="...البحث بالاسم، البريد الإلكتروني، أو رقم الهاتف"
            style={{ textAlign: "right" }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#E41E26] transition-colors duration-200"
            >
              <FaTimes size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}