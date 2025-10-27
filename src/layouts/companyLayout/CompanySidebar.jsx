import { Link, useLocation, useNavigate } from "react-router";
import { useState } from "react";
import LogoutIcon from "@mui/icons-material/Logout";
import PrivateApi from "../../services/PrivateApi";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InventoryIcon from "@mui/icons-material/Inventory";
import GroupsIcon from "@mui/icons-material/Groups";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PeopleIcon from "@mui/icons-material/People";
import PolicyIcon from "@mui/icons-material/Policy";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CampaignIcon from "@mui/icons-material/Campaign";
import StoreIcon from '@mui/icons-material/Store';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

function CompanySidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [isCollapse, setIsCollapse] = useState(false);

  const navItems = [
    { path: "/company/dashboard", label: "Dashboard", Icon: DashboardIcon },
    { path: "/company/agency-management", label: "Agency", Icon: GroupsIcon },
    {
      label: "Store",
      Icon: StoreIcon,
      children: [
        { path: "/company/inventory", label: "Inventory", Icon: InventoryIcon },
        { path: "/company/warehouse", label: "Warehouse", Icon: WarehouseIcon },
      ],
    },
    {
      label: "Staff",
      Icon: SettingsIcon,
      children: [
        { path: "/company/role", label: "Roles", Icon: AccountCircleIcon },
        { path: "/company/all-staff", label: "All staffs", Icon: PeopleIcon },
      ],
    },
    {
      label: "Policy",
      Icon: PolicyIcon, // Icon cho mục cha
      children: [
        { path: "/company/discount", label: "Discount", Icon: LocalOfferIcon },
        {
          path: "/company/price-policy",
          label: "Price policy",
          Icon: AttachMoneyIcon,
        },
        { path: "/company/promotion", label: "Promotion", Icon: CampaignIcon },
      ],
    },
    { path: "/company/order-restock", label: "Order restock", Icon: ShoppingCartIcon },
  ];

  const handleLogout = async () => {
    try {
      const response = await PrivateApi.logout();
      logout();
      toast.success(response.data.message);
      navigate("/login");
    } catch (error) {
      toast.error("Logout fail");
      console.log(error);
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
          <p className="text-white font-medium text-2xl">DASHBOARD</p>
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

export default CompanySidebar;
