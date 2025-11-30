// components/ui/Button.tsx
import React from "react";
import { motion } from "framer-motion";

interface ButtonProps {
  color?: "blue" | "green" | "red" | "purple" | "outline" | "gray";
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  color = "blue", 
  children, 
  onClick, 
  type = "button",
  className = "",
  icon,
  disabled = false,
  fullWidth = false
}) => {
  const colors: Record<string, string> = {
    blue: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/50 hover:shadow-xl",
    green: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg shadow-green-500/50 hover:shadow-xl",
    red: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg shadow-red-500/50 hover:shadow-xl",
    purple: "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-lg shadow-purple-500/50 hover:shadow-xl",
    gray: "bg-slate-200 hover:bg-slate-300 text-slate-700 border-2 border-slate-300",
    outline: "bg-white border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400",
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.02, y: disabled ? 0 : -1 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${colors[color]} ${className} ${fullWidth ? 'w-full' : ''} px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
      } relative overflow-hidden group`}
    >
      <span className="relative z-10 flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {children}
      </span>
      {!disabled && color !== "outline" && color !== "gray" && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
      )}
    </motion.button>
  );
};

export default Button;
