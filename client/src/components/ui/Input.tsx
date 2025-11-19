import React from "react";

const Input = ({ value, onChange, type = "text", placeholder = "" }: any) => {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 hover:bg-white"
    />
  );
};

export default Input;
