import { Link, useLocation, useNavigate } from "react-router";
import Logo from "../../assets/613798b9cfc9ef0f73b0894f4ac1217b39a59cde.png";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { path: "/user/home", label: "Home" },
    { path: "/user/products", label: "Products" },
    { path: "/user/driving-test", label: "Driving Test" },
    { path: "/user/customer-contract", label: "Customer contract" },
  ];

  const isActive = (path) => {
    if (path === "/user/home") {
      return location.pathname === "/user/home" || location.pathname === "/";
    }
    return location.pathname === path;
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-50 bg-white shadow-md border-b border-gray-100">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo - Left side */}
          <div className="flex-shrink-0">
            <img
              className="cursor-pointer transition-transform duration-200 hover:scale-105"
              onClick={() => navigate("/user/home")}
              width={130}
              height={50}
              src={Logo}
              alt="Logo"
            />
          </div>

          {/* Navigation Links - Centered */}
          <div className="hidden md:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 gap-8 lg:gap-12">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-2 text-base lg:text-lg font-medium transition-all duration-200 ${
                    active
                      ? "text-blue-600 font-semibold"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Login Button - Right side */}
          {location.pathname !== "/login" && (
            <div className="flex-shrink-0">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 lg:px-6 lg:py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm lg:text-base font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden border-t border-gray-200 bg-white">
        <div className="px-4 py-3 space-y-2">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  active
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {location.pathname !== "/login" && (
            <button
              onClick={() => navigate("/login")}
              className="w-full mt-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-base font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
