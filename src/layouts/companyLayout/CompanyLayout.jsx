import React from "react";
import CompanySidebar from "./CompanySidebar";
import { Outlet } from "react-router";
import { useAuth } from "../../hooks/useAuth";

function CompanyLayout() {
  const { user } = useAuth();
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 left-0 h-screen">
        <CompanySidebar />
      </aside>

      <main className="flex-1 bg-gray-50 p-6 overflow-y-auto">
        <div className="text-4xl font-medium mb-6">{user?.role[0]}</div>
        <Outlet />
      </main>
    </div>
  );
}

export default CompanyLayout;
