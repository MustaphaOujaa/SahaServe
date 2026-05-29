import React from "react";

export const LoadingSpinner = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-7 w-7 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  return (
    <span
      className={`inline-block rounded-full border-gold/25 border-t-gold animate-spin ${sizes[size]} ${className}`}
      aria-hidden="true"
    />
  );
};

export const ButtonSpinner = ({ className = "" }) => (
  <LoadingSpinner size="sm" className={`shrink-0 ${className}`} />
);

export const PageLoader = ({ label = "Loading..." }) => (
  <main className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-cream pt-[72px]">
    <div className="flex flex-col items-center gap-4 rounded-[16px] border border-beige bg-white px-8 py-7 text-center shadow-custom">
      <LoadingSpinner size="lg" />
      <span className="text-[0.9rem] font-semibold text-text-mid">{label}</span>
    </div>
  </main>
);

export const LoadingOverlay = ({ label = "Loading..." }) => (
  <div className="absolute inset-0 flex items-center justify-center rounded-[14px] bg-white/75 backdrop-blur-[2px]">
    <div className="flex flex-col items-center gap-3 rounded-[14px] border border-beige bg-white px-6 py-5 shadow-custom">
      <LoadingSpinner />
      <span className="text-[0.85rem] font-semibold text-text-mid">{label}</span>
    </div>
  </div>
);
