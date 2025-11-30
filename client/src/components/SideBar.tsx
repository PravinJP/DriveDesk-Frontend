import React, { useState } from "react";
import { 
  FaHome, FaUsers, FaChartBar, FaCog, 
  FaSignOutAlt, FaBars, FaFileAlt, FaDatabase 
} from "react-icons/fa";

// Define a MenuItem type
type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType;
  onClick?: () => void;
};

type SideBarProps = {
  items: MenuItem[];
  onSelect: (page: string) => void;
  title?: string;
  userName?: string;
  userEmail?: string;
};

const SideBar = ({ 
  items, 
  onSelect, 
  title = "Portal", 
  userName = "User", 
  userEmail = "user@portal.com" 
}: SideBarProps) => {
  const [activeItem, setActiveItem] = useState<string>(items[0]?.id || "");
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSelect = (page: string) => {
    setActiveItem(page);
    onSelect(page);
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-20" : "w-64"
      } bg-white border-r border-slate-200 flex flex-col transition-all duration-300 relative`}
    >
      {/* Logo & Toggle */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{title}</h2>
              <p className="text-xs text-slate-500">{title} {title.includes("Admin") ? "Portal" : "Dashboard"}</p>
            </div>
          </div>
        )}
        
        {isCollapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg mx-auto">
            <span className="text-white font-bold text-lg">A</span>
          </div>
        )}
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`${
            isCollapsed ? "absolute -right-3 top-6" : ""
          } p-2 hover:bg-slate-100 rounded-lg transition-colors`}
        >
          <FaBars className="text-slate-600" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                handleSelect(item.id);
                if (item.onClick) item.onClick();
              }}
              className={`group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-50"
              } ${isCollapsed ? "justify-center" : ""}`}
              title={isCollapsed ? item.label : ""}
            >
              <Icon className="text-lg flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              
              {isActive && !isCollapsed && (
                <div className="absolute right-4 w-1.5 h-6 bg-white rounded-full"></div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-200 space-y-3">
        <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all ${isCollapsed ? "justify-center" : ""}`}>
          <FaSignOutAlt className="text-lg flex-shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>

        {!isCollapsed && (
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SideBar;
