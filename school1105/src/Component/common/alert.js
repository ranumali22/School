import Swal from "sweetalert2";

const titleCase = (text) => {
  if (!text || typeof text !== "string") return text;
  return text
    .split(" ")
    .map((word) =>
      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : word
    )
    .join(" ");
};

export const showSuccess = (message) => {
  Swal.fire({
    icon: "success",
    title: "Success",
    text: titleCase(message || "Operation successful"),
    confirmButtonText: "OK",
  });
};

export const showError = (message) => {
  Swal.fire({
    icon: "error",
    title: "Error",
    text: titleCase(message || "Something went wrong"),
    confirmButtonText: "OK",
  });
};

export const showConfirm = async (message) => {
  return await Swal.fire({
    icon: "warning",
    title: "Confirm",
    text: titleCase(message || "Are you sure?"),
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    reverseButtons: true,
  });
};

export const handleApiResponse = (res) => {
  if (!res || typeof res !== "object") {
    showError("Invalid Server Response ❌");
    return false;
  }

  const message = titleCase(res.message || "Success ✅");

  if (res.success) {
    showSuccess(message);
    return true;
  } else {
    showError(message || "Something went wrong ❌");
    return false;
  }
};
