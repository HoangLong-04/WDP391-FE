import { useState } from "react";
import { useNavigate } from "react-router";
import PublicApi from "../../services/PublicApi";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import CircularProgress from "@mui/material/CircularProgress";
import { Eye, EyeOff } from "lucide-react";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await PublicApi.login(form);
      const role = response.data.data.role;

      if (role[0] === "Admin") {
        navigate("/company/dashboard");
      } else if (role[0] === "Dealer Staff") {
        navigate("/agency/catalogue");
      } else if (role[0] === "Evm Staff") {
        navigate("/company/evm-staff/warehouse");
      } else {
        navigate("/agency/dashboard");
      }
      login(response.data.data);
      toast.success("Login successfully");
    } catch (error) {
      console.log(error);

      toast.error(error.message || "Login fail");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-[100dvh] bg-center bg-cover flex justify-center items-center bg-[url('assets/login_background.jpg')]">
      <form
        onSubmit={handleLogin}
        className="flex flex-col items-center w-[50%] h-[50dvh]"
      >
        <p className="text-4xl font-bold mb-[3rem]">LOGIN</p>
        <div className="relative mb-[1rem]">
          <input
            className="bg-white border border-gray-300 w-[30rem] pl-4 pr-4 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required={true}
          />
        </div>
        <div className="relative mb-[1rem]">
          <input
            className="bg-white border border-gray-300 w-[30rem] pl-4 pr-12 py-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder:text-gray-400"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={true}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff size={20} className="cursor-pointer" />
            ) : (
              <Eye size={20} className="cursor-pointer" />
            )}
          </button>
        </div>
        <div className="ml-[48%] font-medium mb-[1rem] cursor-pointer hover:underline">
          <p>Forgot password?</p>
        </div>
        <div>
          <button
            disabled={loading}
            className="bg-[rgb(106,106,106)] w-[30rem] py-[0.3rem] text-white flex justify-center items-center rounded-sm cursor-pointer hover:bg-[rgb(149,141,141)] transition"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
