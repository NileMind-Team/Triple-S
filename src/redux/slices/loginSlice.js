import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Swal from "sweetalert2";
import axiosInstance from "../../api/axiosInstance";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/api/Auth/Login", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const loginWithGoogle = createAsyncThunk(
  "auth/loginWithGoogle",
  async (_, { rejectWithValue }) => {
    try {
      const returnUrl = encodeURIComponent(
        `${window.location.origin}/auth/callback`
      );
      const tenant = "Triples";

      window.location.href = `https://restaurant-template.runasp.net/api/account/login/google?returnUrl=${returnUrl}&Tenant=${tenant}`;

      return null;
    } catch (err) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const handleGoogleCallback = createAsyncThunk(
  "auth/handleGoogleCallback",
  async (token, { rejectWithValue, dispatch }) => {
    try {
      localStorage.setItem("token", token);

      const tokenPayload = JSON.parse(atob(token.split(".")[1]));

      try {
        const res = await axiosInstance.get("/api/Account/Profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = {
          token: token,
          id: res.data.id || tokenPayload.sub,
          firstName:
            res.data.firstName || tokenPayload.name?.split("@")[0] || "مستخدم",
          lastName: res.data.lastName || "",
          email: res.data.email || tokenPayload.email,
          phoneNumber: res.data.phoneNumber || "",
          imageUrl: res.data.imageUrl || "",
          roles: res.data.roles || tokenPayload.roles || ["User"],
        };

        localStorage.setItem("user", JSON.stringify(userData));

        return userData;
      } catch (profileError) {
        console.warn(
          "Could not fetch profile, using token data:",
          profileError
        );

        const userData = {
          token: token,
          id: tokenPayload.sub,
          firstName: tokenPayload.name?.split("@")[0] || "مستخدم",
          lastName: "",
          email: tokenPayload.email,
          phoneNumber: "",
          imageUrl: "",
          roles: tokenPayload.roles || ["User"],
        };

        localStorage.setItem("user", JSON.stringify(userData));

        return userData;
      }
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const errorMessage =
        err.response?.data?.message || err.message || "حدث خطأ غير متوقع";
      return rejectWithValue(errorMessage);
    }
  }
);

const loginSlice = createSlice({
  name: "auth",
  initialState: {
    isLoading: false,
    isGoogleLoading: false,
    isLogged: !!localStorage.getItem("token"),
    token: localStorage.getItem("token") || null,
    user: JSON.parse(localStorage.getItem("user")) || null,
    error: null,
  },

  reducers: {
    logout: (state) => {
      state.isLogged = false;
      state.token = null;
      state.user = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      Swal.fire({
        icon: "info",
        title: "تم تسجيل الخروج بنجاح",
        showConfirmButton: false,
        timer: 1500,
      });
    },
    clearError: (state) => {
      state.error = null;
    },
    setGoogleLoading: (state, action) => {
      state.isGoogleLoading = action.payload;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;

        if (data?.token) {
          state.isLogged = true;
          state.token = data.token;
          state.user = {
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
          };

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(state.user));

          Swal.fire({
            icon: "success",
            title: "تم تسجيل الدخول بنجاح",
            showConfirmButton: false,
            timer: 1500,
          });
        } else {
          Swal.fire({
            icon: "error",
            title: "بيانات الدخول غير صحيحة",
            text: "يرجى التحقق من البريد الإلكتروني وكلمة المرور",
          });
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;

        Swal.fire({
          icon: "error",
          title: "حدث خطأ",
          text:
            action.payload?.message ||
            "يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى",
        });
      })

      .addCase(loginWithGoogle.pending, (state) => {
        state.isGoogleLoading = true;
        state.error = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state) => {
        state.isGoogleLoading = false;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.isGoogleLoading = false;
        state.error = action.payload;

        Swal.fire({
          icon: "error",
          title: "خطأ في تسجيل الدخول بـ Google",
          text: action.payload?.message || "حدث خطأ أثناء الاتصال بـ Google",
        });
      })

      .addCase(handleGoogleCallback.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(handleGoogleCallback.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload;

        if (data?.token) {
          state.isLogged = true;
          state.token = data.token;
          state.user = {
            id: data.id,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phoneNumber: data.phoneNumber,
            imageUrl: data.imageUrl,
            roles: data.roles,
          };

          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(state.user));
        }
      })
      .addCase(handleGoogleCallback.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;

        Swal.fire({
          icon: "error",
          title: "خطأ في تسجيل الدخول بـ Google",
          text: action.payload?.message || "حدث خطأ أثناء تسجيل الدخول",
        });
      });
  },
});

export const { logout, clearError, setGoogleLoading } = loginSlice.actions;
export default loginSlice.reducer;
