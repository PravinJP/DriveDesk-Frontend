import React from "react";

const Modal = ({ title, children, onClose }: any) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 backdrop-blur-md bg-black/20 transition-opacity duration-300"
        onClick={onClose}
      ></div>

      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-all"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default Modal;
