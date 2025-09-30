function Login() {
  return (
    <div className="h-[100dvh] bg-center bg-cover flex justify-center items-center bg-[url('assets/login_background.jpg')]">
      <div className="flex flex-col items-center w-[50%] h-[50dvh]">
        <p className="text-4xl font-bold mb-[3rem]">LOGIN</p>
        <div>
          <input
            className="bg-white border-0.5 w-[30rem] pl-[0.3rem] py-[0.3rem] mb-[1rem]"
            placeholder="Email"
            type="text"
          />
        </div>
        <div>
          <input
            className="bg-white border-0.5 w-[30rem] pl-[0.3rem] py-[0.3rem] mb-[1rem]"
            placeholder="Password"
            type="password"
          />
        </div>
        <div className="ml-[48%] font-medium mb-[1rem] cursor-pointer hover:underline">
          <p>Forgot password?</p>
        </div>
        <div>
          <button className="bg-[rgb(106,106,106)] w-[30rem] py-[0.3rem] text-white rounded-sm cursor-pointer hover:bg-[rgb(149,141,141)] transition">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
