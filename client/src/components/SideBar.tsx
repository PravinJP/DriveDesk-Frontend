import React from "react";
import { FaCog, FaHome, FaUsers } from "react-icons/fa";

const SideBar = () => {
  return (
    <aside
      className="w-64  bg-[#3e4753] text-white flex flex-col 
     p-6 gap-4"
    >
      <div className="bg-white flex items-center">
        <img src="/logo-final.svg" alt="" />
      </div>
      <nav className="flex flex-col space-y-2">
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-black hover:text-white transition duration-200">
          <FaHome />
          <span>Dashboard</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-black hover:text-white transition duration-200">
          <FaUsers />
          <span>Users</span>
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-2 rounded-md hover:bg-black hover:text-white transition duration-200">
          <FaCog />
          <span>Settings</span>
        </button>
      </nav>
    </aside>
  );
};

export default SideBar;
