import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "blue" | "green" | "gray";
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ color = "blue", children, ...props }) => {
  const colors: Record<string, string> = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    gray: "bg-gray-600 hover:bg-gray-700",
  };

  return (
    <button
      {...props}
      className={`${colors[color]} text-white shadow-md px-6 py-2 text-lg rounded-xl transition-all`}
    >
      {children}
    </button>
  );
};

export default Button;
