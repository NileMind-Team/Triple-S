import { useState, useCallback } from "react";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import { translateErrorMessage } from "../utils/ErrorTranslator";

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [assigningRole, setAssigningRole] = useState(null);

  const checkAdminAndFetchUsers = useCallback(async () => {
    try {
      const profileRes = await axiosInstance.get("/api/Account/Profile");
      const userRoles = profileRes.data.roles;

      if (!userRoles || !userRoles.includes("Admin")) {
        Swal.fire({
          icon: "error",
          title: "تم رفض الوصول",
          text: "ليس لديك الإذن للوصول إلى هذه الصفحة.",
          confirmButtonColor: "#E41E26",
          background: "#ffffff",
          color: "#000000",
        });
        return false;
      }

      setIsAdmin(true);
      setCurrentUser(profileRes.data);
      await fetchRoles();
      await fetchUsers();
      return true;
    } catch (err) {
      console.error("فشل في التحقق من صلاحية المسؤول", err);
      Swal.fire({
        icon: "error",
        title: "تم رفض الوصول",
        text: "فشل في التحقق من أذوناتك.",
        confirmButtonColor: "#E41E26",
        background: "#ffffff",
        color: "#000000",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRoles = async () => {
    try {
      const res = await axiosInstance.get("/api/Roles/GetAll");
      if (res.status === 200) {
        setAvailableRoles(res.data);
      }
    } catch (err) {
      console.error("فشل في جلب الأدوار", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get("/api/Users/GetAll");
      if (res.status === 200) {
        setUsers(res.data);
        setFilteredUsers(res.data);
      }
    } catch (err) {
      console.error("فشل في جلب المستخدمين", err);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في جلب بيانات المستخدمين.",
        background: "#ffffff",
        color: "#000000",
        confirmButtonColor: "#E41E26",
      });
    }
  };

  const handleAssignRole = async (userId, roleName) => {
    try {
      await axiosInstance.post(
        `/api/Users/AssignRole?userId=${userId}&role=${roleName}`
      );

      const updatedUsers = users.map((user) =>
        user.id === userId
          ? { ...user, roles: [...(user.roles || []), roleName] }
          : user
      );

      setUsers(updatedUsers);

      Swal.fire({
        icon: "success",
        title: "تم تعيين الصلاحية",
        text: `تم تعيين الصلاحية ${roleName} بنجاح.`,
        showConfirmButton: false,
        timer: 2500,
        background: "#ffffff",
        color: "#000000",
      });

      setAssigningRole(null);
    } catch (err) {
      const errorMsg = err.response?.data?.message || "فشل في تعيين الصلاحية.";
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: errorMsg,
        background: "#ffffff",
        color: "#000000",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  const handleDelete = async (userEmail) => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: `أنت على وشك حذف المستخدم: ${userEmail}`,
      html: `<div style="text-align: right; direction: rtl;">أنت على وشك حذف المستخدم: <strong>${userEmail}</strong></div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
      background: "#ffffff",
      color: "#000000",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/Users/Delete/${userEmail}`);
          setUsers(users.filter((user) => user.email !== userEmail));
          Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف المستخدم بنجاح.",
            icon: "success",
            timer: 2500,
            showConfirmButton: false,
            background: "#ffffff",
            color: "#000000",
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف المستخدم.",
            background: "#ffffff",
            color: "#000000",
            showConfirmButton: false,
            timer: 2500,
          });
        }
      }
    });
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    const action = newStatus ? "تفعيل" : "تعطيل";

    Swal.fire({
      title: `هل أنت متأكد؟`,
      text: `أنت على وشك ${action} المستخدم: ${user.email}`,
      html: `<div style="text-align: right; direction: rtl;">أنت على وشك ${action} المستخدم: <strong>${user.email}</strong></div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: `نعم، ${action}!`,
      cancelButtonText: "إلغاء",
      background: "#ffffff",
      color: "#000000",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const updatedUsers = users.map((u) =>
            u.id === user.id ? { ...u, isActive: newStatus } : u
          );
          setUsers(updatedUsers);

          Swal.fire({
            title: `${action === "تفعيل" ? "تم التفعيل" : "تم التعطيل"}!`,
            text: `تم ${action} المستخدم بنجاح.`,
            icon: "success",
            timer: 2500,
            showConfirmButton: false,
            background: "#ffffff",
            color: "#000000",
          });
        } catch (err) {
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: `فشل في ${action} المستخدم.`,
            background: "#ffffff",
            color: "#000000",
            showConfirmButton: false,
            timer: 2500,
          });
        }
      }
    });
  };

  const handleSubmitUser = async (formData, onSuccess) => {
    try {
      const res = await axiosInstance.post("/api/Users/Add", formData);
      if (res.status === 200 || res.status === 201) {
        await fetchUsers();
        Swal.fire({
          icon: "success",
          title: "تمت إضافة المستخدم",
          text: "تمت إضافة المستخدم الجديد بنجاح.",
          showConfirmButton: false,
          timer: 2500,
          background: "#ffffff",
          color: "#000000",
        });
        onSuccess?.();
        return { success: true };
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        const translatedErrors = translateErrorMessage(err.response.data);

        let errorMessages = [];
        Object.keys(translatedErrors).forEach((field) => {
          translatedErrors[field].forEach((error) => {
            errorMessages.push(error);
          });
        });

        Swal.fire({
          icon: "error",
          title: "خطأ في البيانات",
          html: errorMessages
            .map(
              (msg) =>
                `<div style="text-align: right; direction: rtl; margin-bottom: 8px; padding-right: 15px; position: relative;">
             ${msg}
             <span style="position: absolute; right: 0; top: 0;"></span>
           </div>`
            )
            .join(""),
          background: "#ffffff",
          color: "#000000",
          showConfirmButton: false,
          timer: 2500,
        });
        return { success: false, errors: translatedErrors };
      } else {
        const errorMsg = err.response?.data?.message || "فشل في حفظ المستخدم.";
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: errorMsg,
          background: "#ffffff",
          color: "#000000",
          showConfirmButton: false,
          timer: 2500,
        });
        return { success: false };
      }
    }
  };

  const filterUsers = (searchTerm) => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter((user) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        user.firstName?.toLowerCase().includes(searchLower) ||
        user.lastName?.toLowerCase().includes(searchLower) ||
        user.email?.toLowerCase().includes(searchLower) ||
        user.phoneNumber?.includes(searchTerm)
      );
    });

    setFilteredUsers(filtered);
  };

  const getSortedUsers = (usersList) => {
    if (!currentUser) return usersList;

    const sortedUsers = [...usersList];
    sortedUsers.sort((a, b) => {
      if (a.email === currentUser.email) return -1;
      if (b.email === currentUser.email) return 1;
      return 0;
    });

    return sortedUsers;
  };

  const getAvailableRolesToAssign = (user) => {
    const userRoles = user.roles || [];
    return availableRoles.filter((role) => !userRoles.includes(role.name));
  };

  const isCurrentUser = (user) => {
    return currentUser && user.email === currentUser.email;
  };

  return {
    users,
    filteredUsers,
    isLoading,
    isAdmin,
    currentUser,
    availableRoles,
    assigningRole,
    setAssigningRole,
    checkAdminAndFetchUsers,
    fetchUsers,
    filterUsers,
    handleAssignRole,
    handleDelete,
    handleToggleStatus,
    handleSubmitUser,
    getSortedUsers,
    getAvailableRolesToAssign,
    isCurrentUser,
  };
};
