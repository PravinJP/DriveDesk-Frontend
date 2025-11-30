// components/ui/Card.tsx
import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  title?: string;
  value?: number | string;
  icon?: React.ReactNode;
  gradient?: string;
  bgGradient?: string;
  subtitle?: string;
  onClick?: () => void;
  children?: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  value, 
  icon,
  gradient = "from-blue-500 to-blue-600",
  bgGradient = "from-blue-50 to-indigo-50",
  subtitle,
  onClick,
  children,
  className = ""
}) => {
  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className={`${className} bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-blue-300 transition-all shadow-lg ${
        onClick ? "cursor-pointer" : ""
      } relative overflow-hidden`}
    >
      {bgGradient && (
        <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${bgGradient} rounded-full -mr-16 -mt-16 opacity-50`}></div>
      )}
      
      <div className="relative z-10">
        {icon && title && value && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                {icon}
              </div>
            </div>
            
            <h3 className="text-4xl font-bold text-slate-800 mb-2">{value}</h3>
            <p className="text-sm text-slate-600 font-medium">{title}</p>
            
            {subtitle && (
              <div className="mt-4 pt-4 border-t-2 border-slate-100">
                <p className="text-xs text-slate-400">{subtitle}</p>
              </div>
            )}
          </>
        )}

        {children}
      </div>
    </motion.div>
  );
};

export default Card;
