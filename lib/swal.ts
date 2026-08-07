import Swal from "sweetalert2";

const getRootColor = (variable: string) =>
  getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();

interface ConfirmAlertOptions {
  title: string;
  text?: string;
  confirmText?: string;
  cancelText?: string;
  icon?: "warning" | "question" | "info" | "error";
}

export const confirmAlert = async ({
  title,
  text,
  confirmText = "Ya, Lanjutkan",
  cancelText = "Batal",
  icon = "warning",
}: ConfirmAlertOptions): Promise<boolean> => {
  const result = await Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,

    confirmButtonColor: getRootColor("--color-accent-red-500"),
    cancelButtonColor: getRootColor("--color-neutral-500"),
  });

  return result.isConfirmed;
};

export const showAlert = (
  title: string,
  text?: string,
  icon: "success" | "error" | "info" | "warning" = "success"
) => {
  return Swal.fire({
    title,
    text,
    icon,
    confirmButtonText: "OK",

    confirmButtonColor: getRootColor("--color-primary-400"),
  });
};

export const showSuccess = (title: string, text?: string) =>
  showAlert(title, text, "success");

export const showError = (title: string, text?: string) =>
  showAlert(title, text, "error");