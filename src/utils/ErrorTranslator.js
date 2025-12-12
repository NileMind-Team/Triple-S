class ErrorTranslator {
  static translate(errorData) {
    if (!errorData) return "حدث خطأ غير معروف";

    if (Array.isArray(errorData.errors)) {
      const error = errorData.errors[0];
      switch (error.code) {
        case "User.InvalidCredentials":
          return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
        case "User.NotFound":
          return "المستخدم غير موجود";
        default:
          return error.description || "حدث خطأ في المصادقة";
      }
    }

    if (errorData.errors && typeof errorData.errors === "object") {
      const errorMessages = [];

      if (errorData.errors.FirstName) {
        errorData.errors.FirstName.forEach((msg) => {
          if (msg.includes("must be between 3 and 100 characters")) {
            const match = msg.match(/You entered (\d+) characters/);
            const enteredChars = match ? match[1] : "";
            errorMessages.push(
              `الاسم الأول يجب أن يكون بين 3 و 100 حرف. أدخلت ${enteredChars} حرفاً.`
            );
          } else if (msg.includes("required")) {
            errorMessages.push("الاسم الأول مطلوب");
          } else {
            errorMessages.push(msg);
          }
        });
      }

      if (errorData.errors.LastName) {
        errorData.errors.LastName.forEach((msg) => {
          if (msg.includes("must be between 3 and 100 characters")) {
            const match = msg.match(/You entered (\d+) characters/);
            const enteredChars = match ? match[1] : "";
            errorMessages.push(
              `الاسم الأخير يجب أن يكون بين 3 و 100 حرف. أدخلت ${enteredChars} حرفاً.`
            );
          } else if (msg.includes("required")) {
            errorMessages.push("الاسم الأخير مطلوب");
          } else {
            errorMessages.push(msg);
          }
        });
      }

      if (errorData.errors.PhoneNumber) {
        errorData.errors.PhoneNumber.forEach((msg) => {
          if (msg.includes("must start with 010, 011, 012, or 015")) {
            errorMessages.push(
              "رقم الهاتف يجب أن يبدأ بـ 010، 011، 012، أو 015"
            );
          } else if (msg.includes("must be 11 digits long")) {
            errorMessages.push("رقم الهاتف يجب أن يكون 11 رقماً");
          } else if (msg.toLowerCase().includes("already registered")) {
            errorMessages.push("رقم الهاتف هذا مسجل بالفعل");
          } else if (msg.includes("required")) {
            errorMessages.push("رقم الهاتف مطلوب");
          } else {
            errorMessages.push(msg);
          }
        });
      }

      if (errorData.errors.Email) {
        errorData.errors.Email.forEach((msg) => {
          if (
            msg.toLowerCase().includes("already exists") ||
            msg.toLowerCase().includes("already registered")
          ) {
            errorMessages.push("البريد الإلكتروني مستخدم بالفعل");
          } else if (msg.includes("required")) {
            errorMessages.push("البريد الإلكتروني مطلوب");
          } else if (msg.includes("valid email address")) {
            errorMessages.push("يرجى إدخال بريد إلكتروني صحيح");
          } else {
            errorMessages.push(msg);
          }
        });
      }

      if (errorData.errors.Password) {
        errorData.errors.Password.forEach((msg) => {
          if (msg.includes("at least 6 characters")) {
            errorMessages.push("كلمة المرور يجب أن تحتوي على الأقل 6 أحرف");
          } else if (msg.includes("required")) {
            errorMessages.push("كلمة المرور مطلوبة");
          } else if (msg.includes("uppercase letter")) {
            errorMessages.push("كلمة المرور يجب أن تحتوي على حرف كبير");
          } else if (msg.includes("lowercase letter")) {
            errorMessages.push("كلمة المرور يجب أن تحتوي على حرف صغير");
          } else if (msg.includes("digit")) {
            errorMessages.push("كلمة المرور يجب أن تحتوي على رقم");
          } else if (msg.includes("non-alphanumeric character")) {
            errorMessages.push("كلمة المرور يجب أن تحتوي على رمز خاص");
          } else {
            errorMessages.push(msg);
          }
        });
      }

      if (errorData.errors.ConfirmPassword) {
        errorData.errors.ConfirmPassword.forEach((msg) => {
          if (msg.includes("match")) {
            errorMessages.push("كلمات المرور غير متطابقة");
          } else {
            errorMessages.push(msg);
          }
        });
      }

      Object.keys(errorData.errors).forEach((key) => {
        if (
          ![
            "FirstName",
            "LastName",
            "PhoneNumber",
            "Email",
            "Password",
            "ConfirmPassword",
          ].includes(key)
        ) {
          errorData.errors[key].forEach((msg) => {
            errorMessages.push(msg);
          });
        }
      });

      if (errorMessages.length > 1) {
        const htmlMessages = errorMessages.map(
          (msg) =>
            `<div style="direction: rtl; text-align: right; margin-bottom: 8px; padding-right: 15px; position: relative;">
             ${msg}
             <span style="position: absolute; right: 0; top: 0;">•</span>
           </div>`
        );
        return htmlMessages.join("");
      } else if (errorMessages.length === 1) {
        return errorMessages[0];
      } else {
        return errorData.title || "بيانات غير صالحة";
      }
    }

    if (typeof errorData.message === "string") {
      const msg = errorData.message.toLowerCase();
      if (msg.includes("invalid") || msg.includes("credentials")) {
        return "البريد الإلكتروني أو كلمة المرور غير صحيحة";
      }
      if (msg.includes("user not found")) {
        return "المستخدم غير موجود";
      }
      if (msg.includes("email not confirmed")) {
        return "البريد الإلكتروني غير مؤكد";
      }
      if (msg.includes("network") || msg.includes("internet")) {
        return "يرجى التحقق من اتصالك بالإنترنت";
      }
      if (msg.includes("timeout") || msg.includes("time out")) {
        return "انتهت المهلة، يرجى المحاولة مرة أخرى";
      }
      return errorData.message;
    }

    return errorData.title || "حدث خطأ غير متوقع";
  }
}

export const translateErrorMessage = (errorData) => {
  if (!errorData || !errorData.errors) return "حدث خطأ غير معروف";

  const translatedErrors = {};

  Object.keys(errorData.errors).forEach((field) => {
    const errors = errorData.errors[field];
    translatedErrors[field] = errors.map((error) => {
      if (field === "FirstName") {
        if (error.includes("between 3 and 100 characters")) {
          const entered = error.match(/entered (\d+) characters/)?.[1] || "";
          return `الاسم الأول يجب أن يكون بين 3 و 100 حرف. أدخلت ${entered} حرف${
            entered === "1" ? "" : "اً"
          }.`;
        }
        if (error.includes("required")) {
          return "الاسم الأول مطلوب";
        }
      }

      if (field === "LastName") {
        if (error.includes("between 3 and 100 characters")) {
          const entered = error.match(/entered (\d+) characters/)?.[1] || "";
          return `الاسم الأخير يجب أن يكون بين 3 و 100 حرف. أدخلت ${entered} حرف${
            entered === "1" ? "" : "اً"
          }.`;
        }
        if (error.includes("required")) {
          return "الاسم الأخير مطلوب";
        }
      }

      if (field === "Password") {
        if (error.includes("at least 8 digits")) {
          return "كلمة المرور يجب أن تحتوي على الأقل 8 أحرف وأرقام وأن تحتوي على أحرف كبيرة وصغيرة وأحرف غير أبجدية رقمية";
        }
        if (error.includes("Lowercase")) {
          return "كلمة المرور يجب أن تحتوي على حرف صغير على الأقل";
        }
        if (error.includes("Uppercase")) {
          return "كلمة المرور يجب أن تحتوي على حرف كبير على الأقل";
        }
        if (error.includes("NonAlphanumeric")) {
          return "كلمة المرور يجب أن تحتوي على حرف غير أبجدي رقمي على الأقل (مثل @#$%&*)";
        }
        if (error.includes("required")) {
          return "كلمة المرور مطلوبة";
        }
      }

      if (field === "PhoneNumber") {
        if (error.includes("must start with 010, 011, 012, or 015")) {
          return "رقم الهاتف يجب أن يبدأ بـ 010, 011, 012, أو 015";
        }
        if (error.includes("must be 11 digits long")) {
          return "رقم الهاتف يجب أن يتكون من 11 رقماً";
        }
        if (error.includes("Invalid phone number")) {
          return "رقم الهاتف غير صحيح";
        }
        if (error.includes("This phone number is already registered")) {
          return "رقم الهاتف هذا مسجل بالفعل";
        }
        if (error.includes("already exists")) {
          return "رقم الهاتف هذا مستخدم بالفعل";
        }
      }

      if (field === "Email") {
        if (error.includes("already taken")) {
          return "البريد الإلكتروني مستخدم بالفعل";
        }
        if (error.includes("already exists")) {
          return "البريد الإلكتروني هذا مستخدم بالفعل";
        }
        if (error.includes("Invalid email")) {
          return "البريد الإلكتروني غير صحيح";
        }
        if (error.includes("required")) {
          return "البريد الإلكتروني مطلوب";
        }
      }

      return error;
    });
  });

  return translatedErrors;
};

export default ErrorTranslator;
