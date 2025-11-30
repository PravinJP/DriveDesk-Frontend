// components/ui/Label.tsx
import React from "react";

interface LabelProps {
  text: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

const Label: React.FC<LabelProps> = ({ text, required = false, htmlFor, className = "" }) => {
  return (
    <label 
      htmlFor={htmlFor}
      className={`block text-slate-700 text-sm font-semibold mb-2 ${className}`}
    >
      {text} {required && <span className="text-red-500">*</span>}
    </label>
  );
};

export default Label;
