import Swal, {
  type SweetAlertIcon,
} from "sweetalert2";

const mindBloomBackground =
  "linear-gradient(135deg, #f1efff 0%, #edf7ff 48%, #eaf9f4 100%)";

const mindBloomPopupClass =
  "rounded-[28px] border border-white/90 shadow-[0_25px_70px_rgba(120,126,190,0.22)] backdrop-blur-xl";

const mindBloomSwal = Swal.mixin({
  confirmButtonColor: "#9184dc",
  cancelButtonColor: "#94a3b8",
  buttonsStyling: true,
  reverseButtons: true,
  width: "420px",
  padding: "2rem",
  background: mindBloomBackground,
  color: "#273149",

  customClass: {
    popup: mindBloomPopupClass,

    title:
      "font-display !text-2xl !font-bold !leading-tight !text-[#273149]",

    htmlContainer:
      "!mt-2 !text-sm !leading-6 !text-[#65718a]",

    confirmButton:
      "rounded-xl px-6 py-3 font-semibold shadow-md focus:outline-none",

    denyButton:
      "rounded-xl px-6 py-3 font-semibold shadow-md focus:outline-none",

    cancelButton:
      "rounded-xl px-6 py-3 font-semibold focus:outline-none",
  },
});

export const showSuccess = (
  title: string,
  text = ""
) => {
  return mindBloomSwal.fire({
    icon: "success",
    iconColor: "#7fc8b6",
    title,
    text: text || undefined,
    timer: 1800,
    timerProgressBar: false,
    showConfirmButton: false,

    customClass: {
      popup: mindBloomPopupClass,

      icon:
        "scale-90 !border-[#7fc8b6]",

      title:
        "font-display !mt-3 !text-2xl !font-bold !leading-tight !text-[#273149]",

      htmlContainer:
        "!mt-2 !text-sm !text-[#65718a]",
    },
  });
};

export const showError = (
  title: string,
  text = ""
) => {
  return mindBloomSwal.fire({
    icon: "error",
    iconColor: "#c989a1",
    title,
    text,
    confirmButtonText: "Try Again",
    confirmButtonColor: "#b97891",
  });
};

export const showWarning = (
  title: string,
  text = ""
) => {
  return mindBloomSwal.fire({
    icon: "warning",
    iconColor: "#d4ad70",
    title,
    text,
    confirmButtonText: "Okay",
    confirmButtonColor: "#b99055",
  });
};

export const showInfo = (
  title: string,
  text = ""
) => {
  return mindBloomSwal.fire({
    icon: "info",
    iconColor: "#82a7eb",
    title,
    text,
    confirmButtonText: "Got It",
  });
};

export const showConfirm = async (
  title: string,
  text = "",
  confirmText = "Yes",
  cancelText = "Cancel"
) => {
  const result = await mindBloomSwal.fire({
    icon: "question",
    iconColor: "#9184dc",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });

  return result.isConfirmed;
};

export const showToast = (
  title: string,
  icon: SweetAlertIcon = "success"
) => {
  return Swal.fire({
    toast: true,
    position: "top-end",
    icon,
    title,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: false,
    background: mindBloomBackground,
    color: "#273149",

    customClass: {
      popup:
        "rounded-2xl border border-white/90 shadow-[0_16px_40px_rgba(120,126,190,0.18)]",

      title:
        "text-sm font-semibold text-[#273149]",
    },
  });
};

/*
|--------------------------------------------------------------------------
| Activities Login / Register Alert
|--------------------------------------------------------------------------
*/

export const showActivityLoginAlert =
  async () => {
    const result = await mindBloomSwal.fire({
      icon: "info",
      iconColor: "#9184dc",

      title:
        "Start Your Wellness Journey 🌸",

      html: `
        <div style="
          margin-top: 8px;
          color: #65718a;
          line-height: 1.7;
        ">
          <p>
           Please log in or register first to access wellness activities and safely save your progress.
          </p>

          <div style="
            margin-top: 16px;
            padding: 14px;
            border: 1px solid rgba(221, 216, 247, 0.9);
            border-radius: 16px;
            background: rgba(255, 255, 255, 0.65);
          ">
            <p style="
              margin: 0;
              font-size: 13px;
              color: #7b869a;
            ">
              Your mood records, journals and completed
              activities will remain connected to your
              personal MindBloom account.
            </p>
          </div>
        </div>
      `,

      showCancelButton: true,
      showDenyButton: true,

      confirmButtonText: "Login",
      denyButtonText: "Register",
      cancelButtonText: "Maybe Later",

      confirmButtonColor: "#9184dc",
      denyButtonColor: "#72bca8",
      cancelButtonColor: "#94a3b8",

      reverseButtons: false,

      customClass: {
        popup: mindBloomPopupClass,

        title:
          "font-display !text-2xl !font-bold !leading-tight !text-[#273149]",

        htmlContainer:
          "!mt-2 !text-sm !text-[#65718a]",

        confirmButton:
          "rounded-xl px-6 py-3 font-semibold shadow-md focus:outline-none",

        denyButton:
          "rounded-xl px-6 py-3 font-semibold shadow-md focus:outline-none",

        cancelButton:
          "rounded-xl px-6 py-3 font-semibold focus:outline-none",
      },
    });

    if (result.isConfirmed) {
      window.location.href = "/login";
      return;
    }

    if (result.isDenied) {
      window.location.href = "/signup";
    }
  };