import React from "react";

interface LabelProps {
  text: string;
}

const Label: React.FC<LabelProps> = ({ text }) => {
  return (
    <label className="block text-gray-600 text-sm font-medium mt-3 mb-1">
      {text}
    </label>
  );
};

export default Label;
