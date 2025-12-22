import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, handleGoogleCallback } from "../redux/slices/loginSlice";
import { registerUser } from "../redux/slices/registerSlice";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Swal from "sweetalert2";
import ErrorTranslator from "../utils/ErrorTranslator";
import AuthLayout from "../components/auth/AuthLayout";
import WelcomeAnimation from "../components/auth/WelcomeAnimation";
import WaitingConfirmation from "../components/auth/WaitingConfirmation";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import LoginForm from "../components/auth/LoginForm";
import RegisterForm from "../components/auth/RegisterForm";

export default function AuthPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { isLoading: loginLoading, isGoogleLoading } = useSelector(
    (state) => state.login
  );

  const { isLoading: registerLoading } = useSelector((state) => state.register);

  const [activeTab, setActiveTab] = useState(
    location.pathname === "/register" ? "register" : "login"
  );
  const [forgetMode, setForgetMode] = useState(false);
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [timer, setTimer] = useState(60);
  const [showWelcome, setShowWelcome] = useState(false);
  const [loggedUserName, setLoggedUserName] = useState("");

  // Login states
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  // Register states
  const [registerData, setRegisterData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forget password state
  const [forgetEmail, setForgetEmail] = useState("");

  const extractTokenFromUrl = useCallback(() => {
    const hash = window.location.hash;
    if (hash.startsWith("#token=")) {
      return hash.replace("#token=", "");
    }
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("token");
  }, []);

  useEffect(() => {
    const token = extractTokenFromUrl();

    if (token) {
      window.history.replaceState(null, "", "/auth");

      const processGoogleLogin = async () => {
        try {
          const result = await dispatch(handleGoogleCallback(token)).unwrap();

          if (result?.token) {
            setLoggedUserName(result.firstName || result.email || "مستخدم");
            setShowWelcome(true);

            setTimeout(() => {
              setShowWelcome(false);
              navigate("/");
            }, 3000);
          }
        } catch (error) {
          console.error("Google login error:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ في تسجيل الدخول",
            text: "حدث خطأ أثناء تسجيل الدخول بـ Google. يرجى المحاولة مرة أخرى.",
            confirmButtonText: "حاول مرة أخرى",
          });
        }
      };

      processGoogleLogin();
    }
  }, [dispatch, navigate, extractTokenFromUrl]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handleLoginChange = useCallback((name, value) => {
    setLoginData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleRegisterChange = useCallback((name, value) => {
    setRegisterData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "جاري تسجيل الدخول...",
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    const formData = new FormData();
    formData.append("Email", loginData.email);
    formData.append("Password", loginData.password);

    try {
      const res = await dispatch(loginUser(formData)).unwrap();

      if (res?.token) {
        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res));

        setLoggedUserName(res.firstName || res.email || "مستخدم");
        setShowWelcome(true);

        Swal.close();

        setTimeout(() => {
          setShowWelcome(false);
          navigate("/");
        }, 3000);
      }
    } catch (error) {
      Swal.close();

      const errorMessage = ErrorTranslator.translate(error);

      Swal.fire({
        icon: "error",
        title: "خطأ في تسجيل الدخول",
        html: errorMessage,
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  // Google Login handler
  const handleGoogleLogin = async () => {
    try {
      const returnUrl = encodeURIComponent(`${window.location.origin}/auth`);
      const googleAuthUrl = `https://restaurant-template.runasp.net/api/account/login/google?returnUrl=${returnUrl}`;

      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error("Google login redirect error:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ في الاتصال",
        text: "حدث خطأ أثناء التوجيه إلى Google. يرجى المحاولة مرة أخرى.",
        confirmButtonText: "حاول مرة أخرى",
      });
    }
  };

  // Register handler
  const handleRegister = async (e) => {
    e.preventDefault();

    const passwordValidations = {
      length: registerData.password.length >= 8,
      lowercase: /[a-z]/.test(registerData.password),
      uppercase: /[A-Z]/.test(registerData.password),
      specialChar: /[^A-Za-z0-9]/.test(registerData.password),
      match:
        registerData.password !== "" &&
        registerData.password === registerData.confirmPassword,
    };

    const allValid = Object.values(passwordValidations).every(Boolean);
    if (!allValid) return;

    const formData = new FormData();
    formData.append("FirstName", registerData.firstName);
    formData.append("LastName", registerData.lastName);
    formData.append("Email", registerData.email);
    formData.append("PhoneNumber", registerData.phoneNumber);
    formData.append("Password", registerData.password);
    formData.append("ConfirmPassword", registerData.confirmPassword);

    try {
      const resultAction = await dispatch(registerUser(formData));

      if (registerUser.fulfilled.match(resultAction)) {
        setWaitingForConfirmation(true);
        setUserEmail(registerData.email);
        setResendDisabled(true);
        setTimer(60);
        Swal.fire({
          icon: "success",
          title: "تم إنشاء الحساب",
          text: "تم إنشاء حسابك بنجاح! يرجى تأكيد بريدك الإلكتروني للمتابعة.",
          showConfirmButton: false,
          timer: 2500,
        });
      } else {
        const errorResponse =
          resultAction.payload || resultAction.error?.response?.data || null;

        const errorMessage = ErrorTranslator.translate(errorResponse);

        Swal.fire({
          icon: "error",
          title: "خطأ في التسجيل",
          html: errorMessage,
          showConfirmButton: false,
          timer: 2500,
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "خطأ في التسجيل",
        text: "حدث خطأ غير متوقع.",
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  // Forget password handler
  const handleForgetPassword = async (e) => {
    e.preventDefault();
    Swal.fire({
      title: "جاري إرسال رمز إعادة التعيين...",
      didOpen: () => {
        Swal.showLoading();
      },
      allowOutsideClick: false,
      allowEscapeKey: false,
    });

    try {
      await axiosInstance.post(
        "/api/Auth/ForgetPassword",
        { email: forgetEmail },
        { headers: { "Content-Type": "application/json" } }
      );

      Swal.close();
      setWaitingForConfirmation(true);
      setUserEmail(forgetEmail);
      setResendDisabled(true);
      setTimer(60);

      Swal.fire({
        icon: "info",
        title: "تم إرسال رمز إعادة التعيين",
        text: "لقد أرسلنا رمز إعادة التعيين إلى بريدك الإلكتروني. يرجى التحقق من صندوق الوارد لإعادة تعيين كلمة المرور.",
        showConfirmButton: false,
        timer: 2500,
      });
    } catch (err) {
      Swal.close();

      const errorData = err.response?.data;
      const translatedMessage = ErrorTranslator.translate(errorData);

      Swal.fire({
        icon: "error",
        title: "خطأ",
        html: translatedMessage,
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  const handleResendEmail = async () => {
    try {
      await axiosInstance.post("/api/Auth/ResendConfirmationEmail", {
        email: forgetMode ? forgetEmail : registerData.email,
      });
      Swal.fire({
        icon: "success",
        title: "تم إعادة إرسال البريد الإلكتروني",
        text: "تم إرسال بريد تأكيد جديد إلى صندوق الوارد الخاص بك.",
        showConfirmButton: false,
        timer: 2500,
      });
      setResendDisabled(true);
      setTimer(60);
    } catch (err) {
      const errorData = err.response?.data;
      const translatedMessage = ErrorTranslator.translate(errorData);

      Swal.fire({
        icon: "error",
        title: "فشل في إعادة الإرسال",
        text: translatedMessage,
        showConfirmButton: false,
        timer: 2500,
      });
    }
  };

  useEffect(() => {
    let countdown;
    if (waitingForConfirmation && resendDisabled) {
      countdown = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [waitingForConfirmation, resendDisabled]);

  useEffect(() => {
    let interval;
    if (waitingForConfirmation && userEmail && activeTab === "register") {
      interval = setInterval(async () => {
        try {
          const res = await axiosInstance.get(
            `/api/Auth/CheckConfirmationEmail?email=${encodeURIComponent(
              userEmail
            )}`
          );
          if (res.status === 200) {
            Swal.close();
            Swal.fire({
              icon: "success",
              title: "تم تأكيد البريد الإلكتروني",
              text: "تم تأكيد بريدك الإلكتروني. يمكنك الآن تسجيل الدخول.",
              showConfirmButton: false,
              timer: 2500,
            });
            setWaitingForConfirmation(false);
            clearInterval(interval);
            setActiveTab("login");
          }
        } catch (err) {
          console.error("Error checking email confirmation", err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [waitingForConfirmation, userEmail, activeTab]);

  const passwordValidations = {
    length: registerData.password.length >= 8,
    lowercase: /[a-z]/.test(registerData.password),
    uppercase: /[A-Z]/.test(registerData.password),
    specialChar: /[^A-Za-z0-9]/.test(registerData.password),
    match:
      registerData.password !== "" &&
      registerData.password === registerData.confirmPassword,
  };

  return (
    <AuthLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onBack={() => navigate(-1)}
      showWelcome={showWelcome}
    >
      {showWelcome ? (
        <WelcomeAnimation userName={loggedUserName} />
      ) : waitingForConfirmation ? (
        <WaitingConfirmation
          forgetMode={forgetMode}
          email={forgetMode ? forgetEmail : registerData.email}
          timer={timer}
          resendDisabled={resendDisabled}
          onResendEmail={handleResendEmail}
          onBackToLogin={() => {
            setWaitingForConfirmation(false);
            setForgetMode(false);
          }}
        />
      ) : forgetMode ? (
        <ForgotPasswordForm
          email={forgetEmail}
          onEmailChange={setForgetEmail}
          onSubmit={handleForgetPassword}
          onBack={() => setForgetMode(false)}
        />
      ) : activeTab === "login" ? (
        <LoginForm
          email={loginData.email}
          password={loginData.password}
          showPassword={showPassword}
          isLoading={loginLoading}
          isGoogleLoading={isGoogleLoading}
          onEmailChange={(value) => handleLoginChange("email", value)}
          onPasswordChange={(value) => handleLoginChange("password", value)}
          onToggleShowPassword={() => setShowPassword(!showPassword)}
          onForgotPassword={() => setForgetMode(true)}
          onGoogleLogin={handleGoogleLogin}
          onSubmit={handleLogin}
        />
      ) : (
        <RegisterForm
          formData={registerData}
          showRegisterPassword={showRegisterPassword}
          showConfirmPassword={showConfirmPassword}
          passwordValidations={passwordValidations}
          isLoading={registerLoading}
          onInputChange={handleRegisterChange}
          onToggleRegisterPassword={() =>
            setShowRegisterPassword(!showRegisterPassword)
          }
          onToggleConfirmPassword={() =>
            setShowConfirmPassword(!showConfirmPassword)
          }
          onSubmit={handleRegister}
        />
      )}
    </AuthLayout>
  );
}
