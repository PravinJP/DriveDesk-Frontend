// components/ui/Input.tsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface InputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({ 
  value, 
  onChange, 
  type = "text", 
  placeholder = "",
  label,
  icon,
  error,
  required = false,
  disabled = false,
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-slate-700 text-sm font-semibold mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <motion.div
        className="relative"
        whileHover={{ scale: disabled ? 1 : 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full ${icon ? "pl-12" : "pl-4"} ${
            type === "password" ? "pr-12" : "pr-4"
          } py-3 border-2 ${
            error 
              ? "border-red-400 focus:border-red-500 focus:ring-red-200" 
              : isFocused 
              ? "border-blue-500 ring-2 ring-blue-200" 
              : "border-slate-200"
          } rounded-xl focus:outline-none transition-all duration-300 ${
            disabled ? "bg-slate-100 cursor-not-allowed opacity-60" : "bg-white"
          }`}
        />
        
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        )}
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs mt-2 font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

export default Input;
