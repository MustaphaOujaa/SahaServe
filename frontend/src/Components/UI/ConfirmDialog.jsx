import React from "react";
import { ButtonSpinner } from "./Loading";

const ConfirmDialog = ({
  open,
  title = "Confirm action",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) {
    return null;
  }

  const confirmClass =
    tone === "danger"
      ? "bg-[#9b3f2f] text-white hover:bg-[#7e3024]"
      : "bg-gold text-white hover:bg-brown";

  return (
    <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-[rgba(26,15,0,0.55)] px-4 backdrop-blur-[5px]">
      <div className="w-full max-w-[420px] rounded-[18px] border border-[rgba(200,146,42,0.18)] bg-white p-6 shadow-custom-lg">
        <div className="mb-5 flex items-start gap-4">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${tone === "danger" ? "bg-[#f7ece9] text-[#9b3f2f]" : "bg-gold-pale text-gold"}`}>
            <i className={`fas ${tone === "danger" ? "fa-trash-alt" : "fa-question"} text-[1rem]`}></i>
          </div>
          <div>
            <h3 className="font-['Cormorant_Garamond'] text-[1.45rem] font-bold leading-tight text-brown-dark">{title}</h3>
            {message && <p className="mt-2 text-[0.88rem] leading-6 text-text-mid">{message}</p>}
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isLoading}
            onClick={onCancel}
            className="rounded-full border border-beige bg-white px-5 py-2.5 text-[0.86rem] font-semibold text-text-mid transition-all hover:border-gold hover:text-gold disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[0.86rem] font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-70 ${confirmClass}`}
          >
            {isLoading && <ButtonSpinner />}
            {isLoading ? "Please wait..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
