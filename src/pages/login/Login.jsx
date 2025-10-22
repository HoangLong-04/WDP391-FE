import { useState } from "react";
import { useNavigate } from "react-router";
import PublicApi from "../../services/PublicApi";
import { toast } from "react-toastify";
import { useAuth } from "../../hooks/useAuth";
import CircularProgress from "@mui/material/CircularProgress";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await PublicApi.login(form);
      const role = response.data.data.role;
      console.log(response.data.data.role);

      if (role[0] === "Admin" || role[0] === "Evm Staff") {
        navigate("/company/dashboard");
      } else {
        navigate("/agency/dashboard");
      }
      login(response.data.data);
      toast.success("Login successfully");
    } catch (error) {
      console.log(error);

      toast.error("Login fail");
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
        <div>
          <input
            className="bg-white border-0.5 w-[30rem] pl-[0.3rem] py-[0.3rem] mb-[1rem]"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required={true}
          />
        </div>
        <div>
          <input
            className="bg-white border-0.5 w-[30rem] pl-[0.3rem] py-[0.3rem] mb-[1rem]"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required={true}
          />
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
