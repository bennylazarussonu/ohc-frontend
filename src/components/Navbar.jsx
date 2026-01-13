import { FaUsers, FaPills, FaNotesMedical, FaFile, FaUserDoctor, FaUser, FaRightFromBracket, FaUserNurse, FaUserShield, FaIdCard, FaIdBadge, FaIdCardClip, FaDashcube, FaHouseMedical } from "react-icons/fa6";
import { useAuth } from "../context/AuthContext";

function Navbar({ border, active, onChange }) {
  const { user, logout } = useAuth();

  const menus = [
    { key: "profile", label: "Profile", icon: <FaUser /> },
    { key: "dashboard", label: "Dashboard", icon: <FaDashcube/>},
    { key: "workers", label: "Workers", icon: <FaUsers /> },
    { key: "medicines", label: "Medicines", icon: <FaPills /> },
    { key: "pre-emp", label: "Pre-Employment", icon: <FaUserShield /> },
    { key: "id-renew", label: "ID Renewal", icon: <FaIdCard/>},
    { key: "opd", label: "OPD & Prescription", icon: <FaNotesMedical /> },
    { key: "dispensary", label: "Dispensary", icon: <FaHouseMedical />},
    { key: "reports", label: "Reports", icon: <FaFile /> },
    { key: "doctors", label: "Doctors", icon: <FaUserDoctor /> },
    { key: "staff", label: "Staff", icon: <FaUserNurse /> }
  ];

  const renderMenus = () => {
    if (user.role === "ADMIN") return menus;
    if (user.role === "DOCTOR") return menus.slice(0, 9);
    if (user.role === "EMPLOYEE") return menus.slice(0, 6);
    return [];
  };

  return (
    <div className="w-full bg-gray-800 border-b border-gray-700">
      <div className="flex items-center justify-between px-2 py-2 text-[14px]">

        {/* LEFT: Navigation */}
        <div className="flex items-center gap-3">
          {renderMenus().map(menu => (
            <button
              key={menu.key}
              onClick={() => onChange(menu.key)}
              className={`flex items-center gap-2 px-3 py-1 text-xs rounded
                ${active === menu.key
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }
                ${border === menu.key ? "h-10 w-10 rounded-[100%] border-gray-500" : ""}
              `}
            >
              {menu.icon}
              {menu.key === "profile"? "" : menu.label}
            </button>
          ))}
        </div>

        {/* RIGHT: User + Logout */}
        <div className="flex items-center gap-3">
          <span className="text-gray-300 text-sm">
            {user.userId} ({user.role})
          </span>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-1.5 rounded
              bg-red-600 hover:bg-red-700 text-white"
          >
            <FaRightFromBracket />
            Logout
          </button>
        </div>

      </div>
    </div>
  );
}

export default Navbar;
