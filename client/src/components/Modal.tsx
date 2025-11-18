const Modal = ({ title, children, onClose }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop Layer: blurs + dims background */}
      <div
        className="absolute inset-0 backdrop-blur-md bg-black/20 transition-opacity duration-300"
        onClick={onClose} // optional: click outside to close
      ></div>

      {/* Modal Box */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6 z-10">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-black"
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
