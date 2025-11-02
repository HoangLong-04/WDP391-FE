import { Link, useLocation, useNavigate } from "react-router";
import Logo from "../../assets/613798b9cfc9ef0f73b0894f4ac1217b39a59cde.png";

function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="flex justify-between items-center px-[1.5rem] py-[1rem] shadow-lg sticky top-0 right-0 left-0 bg-white">
      <div>
        <img className="cursor-pointer" onClick={() => navigate('/user/home')} width={130} src={Logo} alt="Logo" />
      </div>
      <div className="flex gap-15">
        <p className="hover:underline cursor-pointer text-2xl">
          Introduction
        </p>
        <Link to={'/user/products'} className="hover:underline cursor-pointer text-2xl">
          Products
        </Link>
        {/* <p className="hover:underline cursor-pointer text-2xl">
          Promotion services
        </p>
        <p className="hover:underline cursor-pointer text-2xl">
          News
        </p> */}
        <Link to={'/user/driving-test'} className="hover:underline cursor-pointer text-2xl">
          Driving test
        </Link>
      </div>
      {location.pathname !== "/login" && (
        <div>
        <button
          onClick={() => navigate("/login")}
          className="bg-[rgb(69,69,69)] px-[0.5rem] py-[0.2rem] rounded-sm text-white cursor-pointer text-[20px] hover:bg-[rgb(143,157,177)] transition flex items-center justify-center"
        >
          Login
        </button>
      </div>
      )}
      
    </div>
  );
}

export default NavBar;
