import { motion } from "framer-motion";
import {
  FaTrash,
  FaEnvelope,
  FaPhone,
  FaUserShield,
  FaUserSlash,
  FaUserCheck,
  FaUserTag,
} from "react-icons/fa";

export default function UserCard({
  user,
  index,
  isCurrentUser,
  getRoleBadgeColor,
  getRoleIcon,
  getStatusBadge,
  getAvailableRolesToAssign,
  assigningRole,
  setAssigningRole,
  handleAssignRole,
  handleToggleStatus,
  handleDelete,
}) {

  return (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 lg:p-6 border-2 transition-all duration-300 ${
        isCurrentUser(user)
          ? "border-[#E41E26] shadow-lg hover:shadow-xl"
          : user.isActive === false
          ? "border-red-200 shadow-md hover:shadow-lg"
          : "border-gray-200/50 hover:shadow-lg"
      } ${user.isActive === false ? "bg-red-50/50" : ""}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          <div className="flex-shrink-0 relative">
            {user.imageUrl ? (
              <img
                src={`https://restaurant-template.runasp.net/${user.imageUrl}`}
                alt="صورة المستخدم"
                className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full object-cover border-2 ${
                  user.isActive === false
                    ? "border-red-300 grayscale"
                    : "border-[#FDB913]"
                }`}
              />
            ) : (
              <div
                className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-semibold text-base sm:text-lg md:text-xl border-2 ${
                  user.isActive === false
                    ? "bg-gray-300 text-gray-500 border-red-300 grayscale"
                    : "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white border-[#FDB913]"
                }`}
              >
                {user.firstName?.charAt(0).toUpperCase() || "م"}
              </div>
            )}
            {isCurrentUser(user) && (
              <div className="absolute -top-1 -right-1 bg-[#E41E26] text-white rounded-full p-1 border-2 border-white">
                <FaUserShield className="text-xs" />
              </div>
            )}
            {user.isActive === false && (
              <div className="absolute -bottom-1 -right-1 bg-red-500 text-white rounded-full p-1 border-2 border-white">
                <FaUserSlash className="text-xs" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 mb-2 sm:mb-3">
              <div className="flex items-center gap-2">
                <h3
                  className={`font-bold text-base sm:text-lg md:text-xl truncate ${
                    user.isActive === false ? "text-gray-500" : "text-gray-800"
                  }`}
                >
                  {user.firstName} {user.lastName}
                </h3>
                {isCurrentUser(user) && (
                  <span className="bg-[#E41E26] text-white px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                    المستخدم الحالي
                  </span>
                )}
                {getStatusBadge(user)}
              </div>
              <div className="flex gap-1 flex-wrap">
                {user.roles?.map((role) => (
                  <span
                    key={role}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                      role
                    )} ${user.isActive === false ? "opacity-60" : ""}`}
                  >
                    {getRoleIcon(role)}
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div
              className={`space-y-1 sm:space-y-2 text-sm sm:text-base ${
                user.isActive === false ? "text-gray-500" : "text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <FaEnvelope
                  className={`flex-shrink-0 text-xs sm:text-sm ${
                    user.isActive === false ? "text-gray-400" : "text-[#E41E26]"
                  }`}
                />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <FaPhone
                  className={`flex-shrink-0 text-xs sm:text-sm ${
                    user.isActive === false ? "text-gray-400" : "text-[#E41E26]"
                  }`}
                />
                <span>{user.phoneNumber || "غير متوفر"}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col lg:flex-row gap-1 sm:gap-2 justify-end sm:justify-start">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() =>
              setAssigningRole(assigningRole === user.id ? null : user.id)
            }
            disabled={
              user.isActive === false ||
              getAvailableRolesToAssign(user).length === 0
            }
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center ${
              user.isActive === false ||
              getAvailableRolesToAssign(user).length === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100"
            }`}
          >
            <FaUserTag className="text-xs sm:text-sm" />
            <span className="whitespace-nowrap">تعيين صلاحية</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleToggleStatus(user)}
            disabled={isCurrentUser(user)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center ${
              isCurrentUser(user)
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : user.isActive === false
                ? "bg-green-50 text-green-700 hover:bg-green-100"
                : "bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
            }`}
          >
            {user.isActive === false ? (
              <>
                <FaUserCheck className="text-xs sm:text-sm" />
                <span className="whitespace-nowrap">تفعيل</span>
              </>
            ) : (
              <>
                <FaUserSlash className="text-xs sm:text-sm" />
                <span className="whitespace-nowrap">تعطيل</span>
              </>
            )}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDelete(user.email)}
            disabled={isCurrentUser(user)}
            className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors duration-200 text-xs sm:text-sm font-medium flex-1 sm:flex-none justify-center ${
              isCurrentUser(user)
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-red-50 text-red-700 hover:bg-red-100"
            }`}
          >
            <FaTrash className="text-xs sm:text-sm" />
            <span className="whitespace-nowrap">حذف</span>
          </motion.button>
        </div>
      </div>

      {assigningRole === user.id &&
        getAvailableRolesToAssign(user).length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200"
          >
            <h4 className="text-sm font-semibold text-gray-700 mb-2">
              تعيين صلاحية إضافية
            </h4>
            <div className="flex flex-wrap gap-2">
              {getAvailableRolesToAssign(user).map((role) => (
                <motion.button
                  key={role.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAssignRole(user.id, role.name)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors duration-200 ${getRoleBadgeColor(
                    role.name
                  )} hover:opacity-80`}
                >
                  {getRoleIcon(role.name)}
                  {role.name}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
    </motion.div>
  );
}
