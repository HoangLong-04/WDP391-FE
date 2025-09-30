import { Link, useLocation } from "react-router";
import TuneIcon from "@mui/icons-material/Tune";
import { useState } from "react";

function CompanySidebar() {
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState()

  const navItems = [
    { path: "/company/dashboard", label: "Dashboard" },
    { path: "/company/product", label: "Products" },
    { path: "/company/inventory", label: "Inventory" },
    { path: "/company/report", label: "Report" },
    { path: "/company/agencyManagement", label: "Agency" },
    {
      label: "Staff",
      children: [
        { path: "/company/dealerManager", label: "Dealer manager" },
        { path: "/company/EVMStaff", label: "EVM Staff" },
      ],
    },
  ];
  return (
    <div className="bg-black flex flex-col items-center h-[100dvh] py-6 px-4 shadow-lg">
      <div className="mb-8 flex justify-center items-center gap-1">
        <p>
          <TuneIcon fontSize="medium" sx={{ color: "white" }} />
        </p>
        <p className="text-white font-medium text-2xl">DASHBOARD</p>
      </div>

      <nav className="flex flex-col gap-3 w-full">
        {navItems.map((item) =>
          item.children ? (
            <div key={item.label} className="w-full">
              {/* Parent label */}
              <button
                onClick={() => setOpenDropdown(!openDropdown)}
                className={`w-full px-4 py-2 rounded-lg text-center font-medium transition ${
                  openDropdown ? "bg-white text-black" : "text-white hover:bg-white/50 hover:text-white"
                }`}
              >
                {item.label}
              </button>

              {/* Dropdown */}
              {openDropdown && (
                <div className="flex flex-col gap-2 mt-2 ml-4 items-center">
                  {item.children.map((child) => (
                    <Link
                      key={child.path}
                      to={child.path}
                      className={`px-4 py-2 rounded-lg text-center font-medium transition 
                        hover:bg-white/50 hover:text-white
                        ${
                          location.pathname === child.path
                            ? "bg-white text-black"
                            : "text-white"
                        }
                      `}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`px-4 py-2 rounded-lg text-center font-medium transition 
                hover:bg-white/50 hover:text-white
                ${
                  location.pathname === item.path
                    ? "bg-white text-black"
                    : "text-white"
                }
              `}
            >
              {item.label}
            </Link>
          )
        )}
      </nav>
    </div>
  );
}

export default CompanySidebar;
