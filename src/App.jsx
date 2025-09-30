import React from "react";
import AuthProvider from "./contexts/AuthProvider";
import { BrowserRouter, Navigate, Route } from "react-router";
import { Routes } from "react-router";
import Login from "./pages/login/Login";
import UserLayout from "./layouts/userLayout/UserLayout";
import HomePage from "./pages/customer/homePage/HomePage";
import AuthenLayout from "./layouts/AuthenLayout";
import CompanyDash from "./pages/company/companyDashboard/CompanyDash";
import CompanyLayout from "./layouts/companyLayout/CompanyLayout";
import CompanyProduct from "./pages/company/companyProduct/CompanyProduct";
import CompanyReport from "./pages/company/companyReport/CompanyReport";
import AgencyManagement from "./pages/company/agencyManage/AgencyManagement";
import DealerManager from "./pages/company/dealerManager/DealerManager";
import DrivingTest from "./pages/customer/drivingTest/DrivingTest";
import BikeDetail from "./pages/customer/bikeDetail/BikeDetail";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/user/home" />} />
          {/* Public */}
          <Route path="/" element={<AuthenLayout />}>
            <Route path="login" element={<Login />} />
          </Route>
          <Route path="/" element={<UserLayout />}>
            <Route path="user/home" element={<HomePage />} />
            <Route path="user/driving-test" element={<DrivingTest />} />
            <Route path="user/bike-detail" element={<BikeDetail />} />
          </Route>

          {/* Private user */}
          {/* Private company */}
          <Route path="/" element={<CompanyLayout />}>
            <Route path="company/dashboard" element={<CompanyDash />} />
            <Route path="company/product" element={<CompanyProduct />} />
            <Route path="company/report" element={<CompanyReport />} />
            <Route path="company/agencyManagement" element={<AgencyManagement />} />
            <Route path="company/dealerManager" element={<DealerManager />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
