import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import PrivateApi from "../../services/PrivateApi";
import {
  ChevronDown,
  Menu,
  ChevronLeft,
  LogOut,
  LayoutDashboard,
  Package,
  Users,
  Wrench,
  Tag,
  FileText,
  List,
  PenTool,
  Store,
  Warehouse,
  ShoppingCart,
  Bike,
  Palette,
  Square,
  Sparkles,
  Circle,
  Settings,
  UserCircle,
  Shield,
  DollarSign,
  Megaphone,
} from "lucide-react";

function SharedSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isCollapse, setIsCollapse] = useState(false);

  // Get user role
  const userRole = user?.role?.[0] || "";

  // Define navigation items based on role
  const getNavItems = () => {
    if (userRole === "Dealer Manager") {
      return [
        { path: "/agency/all-staff", label: "Dealer staff", Icon: Users },
        { path: "/agency/stock-management", label: "Stock", Icon: Package },
        {
          path: "/agency/installment-plan",
          label: "Installment plan",
          Icon: Wrench,
        },
        {
          path: "/agency/stock-promotion",
          label: "Stock promotion",
          Icon: Tag,
        },
        {
          path: "/agency/order-restock",
          label: "Order restock",
          Icon: List,
        },
        {
          path: "/agency/customer-contract",
          label: "Customer contract",
          Icon: FileText,
        },
      ];
    }

    if (userRole === "Dealer Staff") {
      return [
        {
          path: "/agency/customer-management",
          label: "Customer management",
          Icon: Users,
        },
        {
          path: "/agency/booking-management",
          label: "Booking management",
          Icon: PenTool,
        },
        {
          path: "/agency/catalogue",
          label: "Catalogue",
          Icon: Package,
        },
        {
          path: "/agency/quotation-management",
          label: "Quotation management",
          Icon: FileText,
        },
        {
          path: "/agency/customer-contract",
          label: "Customer contract",
          Icon: FileText,
        },
      ];
    }

    if (userRole === "Admin") {
      return [
        {
          label: "Product",
          Icon: Square,
          children: [
            {
              path: "/company/motorbike",
              label: "Motorbike",
              Icon: Bike,
            },
            { path: "/company/color", label: "Color", Icon: Palette },
            // {
            //   path: "/company/appearance",
            //   label: "Appearance",
            //   Icon: Sparkles,
            // },
            // {
            //   path: "/company/configuration",
            //   label: "Configuration",
            //   Icon: Circle,
            // },
          ],
        },
        {
          path: "/company/agency-management",
          label: "Agency",
          Icon: Users,
        },
        {
          label: "Store",
          Icon: Store,
          children: [
            {
              path: "/company/inventory",
              label: "Inventory",
              Icon: Package,
            },
            {
              path: "/company/warehouse",
              label: "Warehouse",
              Icon: Warehouse,
            },
          ],
        },
        {
              path: "/company/all-staff",
              label: "Staffs",
              Icon: Users,
        },
        {
          label: "Policy",
          Icon: Shield,
          children: [
            {
              path: "/company/discount",
              label: "Discount",
              Icon: Tag,
            },
            {
              path: "/company/price-policy",
              label: "Price policy",
              Icon: DollarSign,
            },
            {
              path: "/company/promotion",
              label: "Promotion",
              Icon: Megaphone,
            },
          ],
        },
        {
          path: "/company/order-restock",
          label: "Order restock",
          Icon: ShoppingCart,
        },
      ];
    }

    if (userRole === "Evm Staff" || userRole === "EVM Staff") {
      return [
        {
          path: "/company/evm-staff/warehouse",
          label: "Warehouse",
          Icon: Warehouse,
        },
        {
          path: "/company/evm-staff/discount",
          label: "Discount",
          Icon: Tag,
        },
        {
          path: "/company/evm-staff/promotion",
          label: "Promotion",
          Icon: Megaphone,
        },
        {
          path: "/company/evm-staff/inventory",
          label: "Inventory",
          Icon: Package,
        },
        {
          path: "/company/evm-staff/order-restock",
          label: "Order restock",
          Icon: ShoppingCart,
        },
        {
          path: "/company/evm-staff/price-policy",
          label: "Price policy",
          Icon: DollarSign,
        },
      ];
    }

    return [];
  };

  const navItems = getNavItems();

  const handleLogout = async () => {
    try {
      const response = await PrivateApi.logout();
      logout();
      toast.success(response.data.message || "Logout successfully");
      navigate("/user/home");
    } catch (error) {
      // Nếu JWT hết hạn, vẫn logout local mà không báo lỗi
      if (error.response?.status === 401) {
        logout();
        toast.success("Logout successfully");
        navigate("/user/home");
      } else {
        // Các lỗi khác vẫn logout local
        logout();
        navigate("/user/home");
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
          <ChevronDown className="w-5 h-5" />
        </span>
      )}
    </>
  );

  const getNavItemClass = (path, isChild = false) => {
    const isActive = path ? location.pathname === path : false;

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

  // Get sidebar title based on role
  const getSidebarTitle = () => {
    if (userRole === "Dealer Manager" || userRole === "Dealer Staff") {
      return "AGENCY";
    }
    if (userRole === "Admin" || userRole === "Evm Staff" || userRole === "EVM Staff") {
      return "COMPANY";
    }
    return "";
  };

  return (
    <div
      className={`bg-black flex flex-col items-start h-[100dvh] py-6 shadow-lg relative transition-all duration-300 ${
        isCollapse ? "w-[80px] px-2" : "w-[250px] px-4"
      }`}
    >
      <div
        className={`mb-8 flex items-center ${
          isCollapse ? "justify-center w-full" : "justify-between w-full"
        }`}
      >
        {!isCollapse && (
          <p className="text-white font-medium text-2xl">
            {getSidebarTitle()}
          </p>
        )}
        <button
          onClick={() => setIsCollapse(!isCollapse)}
          className={`text-white hover:bg-white/10 p-2 rounded-lg transition ${
            isCollapse ? "ml-0" : "ml-auto"
          }`}
        >
          {isCollapse ? (
            <Menu className="w-6 h-6" />
          ) : (
            <ChevronLeft className="w-6 h-6" />
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
        <LogOut className="w-5 h-5 text-black" />
        {!isCollapse && (
          <span className="text-sm font-medium text-black">Logout</span>
        )}
      </button>
    </div>
  );
}

export default SharedSidebar;

