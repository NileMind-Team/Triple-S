import React from "react";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaEnvelope,
  FaClock,
  FaCity,
  FaPhone,
  FaWhatsapp,
  FaEdit,
} from "react-icons/fa";
import { motion } from "framer-motion";

const BranchCard = ({
  branch,
  onEdit,
  onToggleActive,
  getPhoneTypeArabic,
  adjustTimeFromBackend,
}) => {
  const convertTo12HourFormat = (time24) => {
    if (!time24) return "";

    const adjustedTime = adjustTimeFromBackend
      ? adjustTimeFromBackend(time24)
      : time24;

    const [hours, minutes] = adjustedTime.split(":").map(Number);

    if (isNaN(hours) || isNaN(minutes)) return adjustedTime;

    const period = hours >= 12 ? "م" : "ص";
    const hours12 = hours % 12 || 12;

    return `${hours12.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")} ${period}`;
  };

  const displayOpeningTime = convertTo12HourFormat(branch.openingTime);
  const displayClosingTime = convertTo12HourFormat(branch.closingTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white flex items-center justify-center font-semibold text-base sm:text-lg md:text-xl border-2 border-[#FDB913]">
              <FaBuilding className="text-sm sm:text-base md:text-lg" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-2 sm:mb-3">
              <h3 className="font-bold text-gray-800 dark:text-white text-base sm:text-lg md:text-xl truncate">
                {branch.name}
              </h3>
              <div className="flex items-center gap-2">
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    branch.isActive
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  }`}
                >
                  {branch.isActive ? "نشط" : "غير نشط"}
                </div>
                <div
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    branch.status === "Open"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                  }`}
                >
                  {branch.status === "Open" ? "مفتوح" : "مغلق"}
                </div>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
              <div className="flex items-center gap-2">
                <FaMapMarkerAlt className="text-[#E41E26] flex-shrink-0 text-xs sm:text-sm" />
                <span className="truncate">{branch.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaEnvelope className="text-[#E41E26] flex-shrink-0 text-xs sm:text-sm" />
                <span className="truncate">{branch.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaClock className="text-[#E41E26] flex-shrink-0 text-xs sm:text-sm" />
                <span>
                  {displayOpeningTime} - {displayClosingTime}
                </span>
              </div>
              {branch.city && (
                <div className="flex items-center gap-2">
                  <FaCity className="text-[#E41E26] flex-shrink-0 text-xs sm:text-sm" />
                  <span>{branch.city.name}</span>
                </div>
              )}
              {branch.phoneNumbers && branch.phoneNumbers.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <FaPhone className="text-[#E41E26] flex-shrink-0 text-xs sm:text-sm" />
                  {branch.phoneNumbers.map((phone, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-lg text-xs"
                    >
                      <span>{phone.phone}</span>
                      <span className="text-gray-500">
                        ({getPhoneTypeArabic(phone.type)})
                      </span>
                      {phone.isWhatsapp && (
                        <FaWhatsapp className="text-green-500 text-xs" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 justify-end sm:justify-start">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(branch)}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center"
          >
            <FaEdit className="text-xs sm:text-sm" />
            <span className="whitespace-nowrap">تعديل</span>
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onToggleActive(branch.id, branch.isActive)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center ${
              branch.isActive
                ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/50"
                : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50"
            }`}
          >
            {branch.isActive ? "تعطيل" : "تفعيل"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default BranchCard;
