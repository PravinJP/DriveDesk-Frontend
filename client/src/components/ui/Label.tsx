import React from "react";

const Label = ({ text }: { text: string }) => {
  return (
    <label className="block text-gray-700 text-sm font-semibold mb-2">
      {text}
    </label>
  );
};

export default Label;
