import React from "react";
import NavBar from "../../components/navBar/NavBar";
import { Outlet } from "react-router";
import Footer from "../../components/footer/Footer";

function UserLayout() {
  return (
    <div className="relative">
      <header className="sticky top-0 z-20">
        <NavBar />
      </header>
      <section>
        <Outlet />
      </section>
      <footer>
        <Footer />
      </footer>
    </div>
  );
}

export default UserLayout;
