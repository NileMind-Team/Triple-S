import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaBuilding,
  FaLock,
  FaLockOpen,
  FaPlus,
  FaUser,
  FaUserShield,
  FaUserTag,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { useUsers } from "../hooks/useUsers";
import Header from "../components/adminUser/Header";
import SearchBar from "../components/adminUser/SearchBar";
import UserCard from "../components/adminUser/UserCard";
import EmptyState from "../components/adminUser/EmptyState";
import UserForm from "../components/adminUser/UserForm";

export default function AdminUsers() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    roles: ["Restaurant"],
  });
  // eslint-disable-next-line no-unused-vars
  const [formErrors, setFormErrors] = useState({});

  const {
    users,
    filteredUsers,
    isLoading,
    isAdmin,
    availableRoles,
    assigningRole,
    setAssigningRole,
    checkAdminAndFetchUsers,
    filterUsers,
    handleAssignRole,
    handleDelete,
    handleToggleStatus,
    handleSubmitUser,
    getSortedUsers,
    getAvailableRolesToAssign,
    isCurrentUser,
  } = useUsers();

  useEffect(() => {
    const initialize = async () => {
      const hasAccess = await checkAdminAndFetchUsers();
      if (!hasAccess) {
        navigate("/");
      }
    };
    initialize();
  }, [checkAdminAndFetchUsers, navigate]);

  useEffect(() => {
    filterUsers(searchTerm);
  }, [searchTerm, users, filterUsers]);

  const handleRoleToggle = (role) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "نموذج غير مكتمل",
        text: "يرجى ملء جميع الحقول المطلوبة.",
        confirmButtonColor: "#E41E26",
        background: "#ffffff",
        color: "#000000",
        showConfirmButton: false,
        timer: 2500,
      });
      return;
    }

    const result = await handleSubmitUser(formData, resetForm);
    if (result.errors) {
      setFormErrors(result.errors);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      password: "",
      roles: ["Restaurant"],
    });
    setFormErrors({});
    setIsAdding(false);
  };

  const handleAddNewUser = () => {
    setIsAdding(true);
    setFormErrors({});

    if (window.innerWidth < 1280) {
      setTimeout(() => {
        document.getElementById("user-form")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "Admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "Restaurant":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Branch":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "Admin":
        return <FaUserShield className="text-xs sm:text-sm" />;
      case "Restaurant":
        return <FaBuilding className="text-xs sm:text-sm" />;
      case "Branch":
        return <FaUserTag className="text-xs sm:text-sm" />;
      default:
        return <FaUser className="text-xs sm:text-sm" />;
    }
  };

  const getStatusBadge = (user) => {
    if (user.isActive === false) {
      return (
        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-semibold border border-red-200 flex items-center gap-1">
          <FaLock className="text-xs" />
          معطل
        </span>
      );
    }
    return (
      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold border border-green-200 flex items-center gap-1">
        <FaLockOpen className="text-xs" />
        مفعل
      </span>
    );
  };

  const isFormValid = () => {
    const basicFieldsValid =
      formData.firstName.trim() !== "" &&
      formData.lastName.trim() !== "" &&
      formData.email.trim() !== "" &&
      formData.roles.length > 0;

    if (!isAdding) {
      return basicFieldsValid && formData.password.trim() !== "";
    }

    return basicFieldsValid;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const sortedUsers = getSortedUsers(filteredUsers);

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] px-3 sm:px-4 md:px-6 py-3 sm:py-6 relative font-sans overflow-hidden transition-colors duration-300`}
      style={{ direction: "rtl" }}
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 sm:-left-20 -top-10 sm:-top-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#E41E26]/10 to-[#FDB913]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
        <div className="absolute -right-10 sm:-right-20 -bottom-10 sm:-bottom-20 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-gradient-to-r from-[#FDB913]/10 to-[#E41E26]/10 rounded-full blur-2xl sm:blur-3xl animate-pulse"></div>
      </div>

      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate(-1)}
        className="fixed top-3 sm:top-4 left-3 sm:left-4 z-50 bg-white/80 backdrop-blur-md hover:bg-[#E41E26] hover:text-white rounded-full p-2 sm:p-3 text-[#E41E26] border border-[#E41E26]/30 shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl group"
      >
        <FaArrowLeft
          size={14}
          className="sm:size-4 group-hover:scale-110 transition-transform"
        />
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl shadow-xl sm:shadow-2xl rounded-2xl sm:rounded-3xl border border-white/50 relative overflow-hidden"
      >
        <Header />

        <div className="relative px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center -mt-6 sm:-mt-7 md:-mt-8 mb-6 sm:mb-8 md:mb-10"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddNewUser}
              className="flex items-center gap-2 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-4 sm:px-5 md:px-6 py-3 sm:py-3 md:py-4 rounded-xl sm:rounded-2xl font-semibold shadow-2xl sm:shadow-3xl hover:shadow-4xl hover:shadow-[#E41E26]/50 transition-all duration-300 text-sm sm:text-base md:text-lg border-2 border-white whitespace-nowrap transform translate-y-2"
            >
              <FaPlus className="text-sm sm:text-base md:text-lg" />
              <span>إضافة مستخدم جديد</span>
            </motion.button>
          </motion.div>

          <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
            <div
              className={`space-y-3 sm:space-y-4 md:space-y-5 ${
                isAdding ? "xl:col-span-2" : "xl:col-span-3"
              }`}
            >
              {sortedUsers.length > 0 ? (
                sortedUsers.map((user, index) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    index={index}
                    isCurrentUser={isCurrentUser}
                    getRoleBadgeColor={getRoleBadgeColor}
                    getRoleIcon={getRoleIcon}
                    getStatusBadge={getStatusBadge}
                    getAvailableRolesToAssign={getAvailableRolesToAssign}
                    assigningRole={assigningRole}
                    setAssigningRole={setAssigningRole}
                    handleAssignRole={handleAssignRole}
                    handleToggleStatus={handleToggleStatus}
                    handleDelete={handleDelete}
                  />
                ))
              ) : (
                <EmptyState
                  searchTerm={searchTerm}
                  handleAddNewUser={handleAddNewUser}
                />
              )}
            </div>

            <AnimatePresence>
              <UserForm
                isAdding={isAdding}
                formData={formData}
                setFormData={setFormData}
                availableRoles={availableRoles}
                handleRoleToggle={handleRoleToggle}
                handleSubmit={handleSubmit}
                resetForm={resetForm}
                getRoleIcon={getRoleIcon}
                isFormValid={isFormValid}
              />
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
