import React from "react";
import { motion } from "framer-motion";
import { FaUserShield } from "react-icons/fa";

export default function Header() {
  return (
    <div className="relative h-36 sm:h-40 md:h-44 lg:h-52 bg-gradient-to-r from-[#E41E26] to-[#FDB913] overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 bg-white/10 rounded-full"></div>
      <div className="absolute -bottom-4 sm:-bottom-6 -left-4 sm:-left-6 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 lg:w-32 lg:h-32 bg-white/10 rounded-full"></div>

      <div className="relative z-10 h-full flex flex-col justify-end items-center text-center px-4 sm:px-6 pb-6 sm:pb-8 md:pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3"
        >
          <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-sm rounded-xl sm:rounded-2xl">
            <FaUserShield className="text-white text-xl sm:text-2xl md:text-3xl" />
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white">
            لوحة المسؤول
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/90 text-sm sm:text-base md:text-lg lg:text-xl max-w-2xl mb-2 sm:mb-3"
        >
          إدارة المستخدمين والصلاحيات
        </motion.p>
      </div>
    </div>
  );
}
