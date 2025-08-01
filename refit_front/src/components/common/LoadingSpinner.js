// src/components/common/LoadingSpinner.js
import React from "react";

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default LoadingSpinner;
