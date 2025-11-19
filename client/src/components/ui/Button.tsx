import React from "react";

const Button = ({ color = "blue", children, onClick, type = "button" }: any) => {
  const colors: Record<string, string> = {
    blue: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/50",
    green: "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-500/50",
    gray: "bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 shadow-lg shadow-gray-500/50",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${colors[color]} text-white px-6 py-3 text-sm font-semibold rounded-xl transition-all transform hover:scale-105 hover:shadow-xl`}
    >
      {children}
    </button>
  );
};

export default Button;
