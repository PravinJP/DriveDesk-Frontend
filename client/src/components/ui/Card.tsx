import React from "react";

interface CardProps {
  title: string;
  value: number | string;
  color?: string;
}

const Card: React.FC<CardProps> = ({ title, value, color }) => {
  return (
    <div className="shadow-md hover:shadow-lg border-0 bg-white/90 backdrop-blur-lg rounded-xl p-6 text-center transition-all">
      <h2 className="text-sm text-gray-500">{title}</h2>
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
    </div>
  );
};

export default Card;
