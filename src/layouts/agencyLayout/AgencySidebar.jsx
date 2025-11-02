import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import PrivateApi from "../../services/PrivateApi";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import GroupsIcon from "@mui/icons-material/Groups";
import InventoryIcon from "@mui/icons-material/Inventory";
import BuildIcon from "@mui/icons-material/Build";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import WysiwygIcon from "@mui/icons-material/Wysiwyg";
import PeopleIcon from "@mui/icons-material/People";
import ListAltIcon from "@mui/icons-material/ListAlt";
import BorderColorIcon from "@mui/icons-material/BorderColor";

function AgencySidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isCollapse, setIsCollapse] = useState(false);

  const navItems = [
    // { path: "/agency/dashboard", label: "Dashboard", Icon: DashboardIcon },
    { path: "/agency/all-staff", label: "Dealer staff", Icon: GroupsIcon },
    { path: "/agency/stock-management", label: "Stock", Icon: InventoryIcon },
    {
      path: "/agency/installment-plan",
      label: "Instalment plan",
      Icon: BuildIcon,
    },
    {
      path: "/agency/stock-promotion",
      label: "Stock promotion",
      Icon: ProductionQuantityLimitsIcon,
    },
    {
      path: "/agency/order-restock",
      label: "Order restock",
      Icon: ListAltIcon,
    },
    {
      path: "/agency/customer-contract",
      label: "Customer contract",
      Icon: WysiwygIcon,
    },
    {
      path: "/agency/customer-management",
      label: "Customer management",
      Icon: PeopleIcon,
    },
    ...(user.role && user.role[0] === "Dealer Staff"
      ? [
          {
            path: "/agency/booking-management",
            label: "Booking management",
            Icon: BorderColorIcon,
          },
        ]
      : []),
  ];

  const handleLogout = async () => {
    try {
      const response = await PrivateApi.logout();
      logout();
      toast.success(response.data.message || "Logout successfully");
      navigate("/login");
    } catch (error) {
      // Nếu JWT hết hạn, vẫn logout local mà không báo lỗi
      if (error.response?.status === 401) {
        logout();
        toast.success("Logout successfully");
        navigate("/login");
      } else {
        // Các lỗi khác vẫn logout local
        logout();
        navigate("/login");
      }
    }
  };
  const toggleDropdown = (label) => {
    setOpenDropdown(openDropdown === label ? null : label);
  };

  const NavContent = ({ item, isChild = false }) => (
    <>
      {item.Icon && (
        <item.Icon
          className={`w-5 h-5 ${!isCollapse && item.label ? "mr-3" : ""}`}
        />
      )}

      {!isCollapse && <span className="flex-1 text-left">{item.label}</span>}

      {!isCollapse && !isChild && item.children && (
        <span
          className={`ml-auto transition-transform duration-300 ${
            openDropdown === item.label ? "rotate-180" : ""
          }`}
        >
          <ExpandMoreIcon className="w-5 h-5" />
        </span>
      )}
    </>
  );

  const getNavItemClass = (path, isChild = false) => {
    const isActive = path ? location.pathname === path : false;

    // Classes chung
    let classes =
      "w-full py-2 rounded-lg font-medium transition flex items-center cursor-pointer";

    if (isActive) {
      classes += " bg-white text-black";
    } else {
      classes += " text-white hover:bg-white/50 hover:text-white";
    }

    if (isCollapse) {
      classes += " justify-center px-0";
    } else {
      classes += " px-4 justify-start";
    }

    return classes;
  };
  return (
    <div
      className={`bg-black flex flex-col items-start h-[100dvh] py-6 shadow-lg relative transition-all duration-300 ${
        isCollapse ? "w-[80px] px-2" : "w-[250px] px-4" // Đã fix: dùng px-2 khi collapse để căn chỉnh tốt hơn
      }`}
    >
      <div
        className={`mb-8 flex items-center ${
          isCollapse ? "justify-center w-full" : "justify-between w-full"
        }`}
      >
        {!isCollapse && (
          <p className="text-white font-medium text-2xl">AGENCY</p>
        )}
        <button
          onClick={() => setIsCollapse(!isCollapse)}
          className={`text-white hover:bg-white/10 p-2 rounded-lg transition ${
            isCollapse ? "ml-0" : "ml-auto"
          }`}
        >
          {isCollapse ? (
            <MenuIcon className="w-6 h-6" />
          ) : (
            <ChevronLeftIcon className="w-6 h-6" />
          )}
        </button>
      </div>

      <nav
        className={`flex flex-col gap-3 w-full overflow-y-auto ${
          isCollapse ? "px-0" : "px-0"
        }`}
      >
        {navItems.map((item) =>
          item.children ? (
            <div key={item.label} className="w-full">
              <button
                onClick={() => toggleDropdown(item.label)}
                className={getNavItemClass(null)}
              >
                <NavContent item={item} />
              </button>

              {openDropdown === item.label && (
                <div
                  className={`flex flex-col gap-2 mt-2 ${
                    isCollapse ? "items-center" : "ml-4"
                  }`}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={getNavItemClass(child.path, true)}
                    >
                      <NavContent item={child} isChild={true} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={getNavItemClass(item.path)}
            >
              <NavContent item={item} />
            </Link>
          )
        )}
      </nav>

      <button
        onClick={handleLogout}
        className={`bg-white absolute bottom-6 flex justify-center items-center cursor-pointer rounded-full p-2 transition-all duration-300 ${
          isCollapse
            ? "w-10 h-10 left-1/2 -translate-x-1/2"
            : "left-4 right-4 gap-2 px-4 py-2"
        }`}
      >
        <LogoutIcon className="w-5 h-5 text-black" />
        {!isCollapse && (
          <span className="text-sm font-medium text-black">Logout</span>
        )}
      </button>
    </div>
  );
}

export default AgencySidebar;
